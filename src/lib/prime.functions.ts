import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const PRICE_CENTS = 1999;
const CURRENCY = "pln";

const startInput = z.object({
  origin: z.string().url(),
  returnPath: z.string().startsWith("/"),
});

/** Starts a monthly Dobra Prime subscription checkout. */
export const startPrimeCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => startInput.parse(data))
  .handler(async ({ data, context }) => {
    const secret = (process.env["STRIPE_RESTRICTED_API_KEY"] ?? process.env["STRIPE_SECRET_KEY"]);
    if (!secret) return { url: null, missingKey: true as const };

    const body = new URLSearchParams({
      mode: "subscription",
      success_url: `${data.origin}${data.returnPath}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${data.origin}${data.returnPath}`,
      client_reference_id: context.userId,
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": CURRENCY,
      "line_items[0][price_data][unit_amount]": String(PRICE_CENTS),
      "line_items[0][price_data][recurring][interval]": "month",
      "line_items[0][price_data][product_data][name]": "Dobra Prime",
    });
    if (context.claims?.email) body.set("customer_email", String(context.claims.email));

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body,
    });
    const session = (await response.json()) as { url?: string; error?: { message?: string } };
    if (!response.ok || !session.url) {
      throw new Error(session.error?.message ?? "Could not start the Prime checkout.");
    }
    return { url: session.url, missingKey: false as const };
  });

/** Reads the finished checkout session and stores the membership. */
export const syncPrimeFromSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ sessionId: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    const secret = (process.env["STRIPE_RESTRICTED_API_KEY"] ?? process.env["STRIPE_SECRET_KEY"]);
    if (!secret) throw new Error("Payments are not configured yet.");

    const sessionRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(data.sessionId)}`,
      { headers: { Authorization: `Bearer ${secret}` } },
    );
    const session = (await sessionRes.json()) as {
      client_reference_id?: string;
      customer?: string;
      subscription?: string;
      error?: { message?: string };
    };
    if (!sessionRes.ok) throw new Error(session.error?.message ?? "Could not read the payment.");
    if (session.client_reference_id !== context.userId) throw new Error("Unauthorized");
    if (!session.subscription) throw new Error("No subscription on this payment.");

    const subRes = await fetch(
      `https://api.stripe.com/v1/subscriptions/${encodeURIComponent(session.subscription)}`,
      { headers: { Authorization: `Bearer ${secret}` } },
    );
    const sub = (await subRes.json()) as {
      status?: string;
      current_period_end?: number;
      cancel_at_period_end?: boolean;
    };
    const active = sub.status === "active" || sub.status === "trialing";

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("prime_memberships").upsert(
      {
        user_id: context.userId,
        status: active ? "active" : sub.status === "past_due" ? "past_due" : "inactive",
        plan: "monthly",
        current_period_end: sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null,
        cancel_at_period_end: Boolean(sub.cancel_at_period_end),
        stripe_customer_id: session.customer ?? null,
        stripe_subscription_id: session.subscription,
      },
      { onConflict: "user_id" },
    );
    if (error) throw new Error(error.message);
    return { active };
  });

/** Cancels the membership at the end of the paid period. */
export const cancelPrime = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("prime_memberships")
      .select("stripe_subscription_id")
      .eq("user_id", context.userId)
      .maybeSingle();

    const secret = (process.env["STRIPE_RESTRICTED_API_KEY"] ?? process.env["STRIPE_SECRET_KEY"]);
    const subId = (row as { stripe_subscription_id?: string | null } | null)
      ?.stripe_subscription_id;
    if (secret && subId) {
      await fetch(`https://api.stripe.com/v1/subscriptions/${encodeURIComponent(subId)}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secret}`,
          "content-type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ cancel_at_period_end: "true" }),
      });
    }

    const { error } = await supabaseAdmin
      .from("prime_memberships")
      .update({ cancel_at_period_end: true })
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
