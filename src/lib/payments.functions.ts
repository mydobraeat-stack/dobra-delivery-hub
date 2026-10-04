import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Stripe card payments. Requires the STRIPE_SECRET_KEY secret (sk_test_ or sk_live_).
// TODO(mobile money): Cameroon (Flutterwave / Notch Pay) not implemented yet.

async function stripe(path: string, secret: string, body?: URLSearchParams) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${secret}`,
      ...(body ? { "content-type": "application/x-www-form-urlencoded" } : {}),
    },
    body: body ?? null,
  });
  const json = (await res.json()) as { id?: string; url?: string; payment_status?: string; payment_intent?: string; error?: { message?: string } };
  if (!res.ok) throw new Error(json.error?.message ?? "Stripe request failed.");
  return json;
}

// Currencies Stripe treats as zero-decimal (amount is not multiplied by 100).
const ZERO_DECIMAL = new Set(["xaf", "xof", "jpy", "krw"]);
const toMinor = (amount: number, currency: string) =>
  ZERO_DECIMAL.has(currency.toLowerCase()) ? Math.round(amount) : Math.round(amount * 100);

const input = z.object({
  orderId: z.string().uuid(),
  successPath: z.string().startsWith("/"),
  cancelPath: z.string().startsWith("/"),
  origin: z.string().url(),
});

export const createCardCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => input.parse(data))
  .handler(async ({ data, context }) => {
    const secret = process.env["STRIPE_SECRET_KEY"];

    const { data: order, error } = await context.supabase
      .from("orders")
      .select("id,total,currency,customer_id,payment_status")
      .eq("id", data.orderId)
      .eq("customer_id", context.userId)
      .single();
    if (error || !order) throw new Error("Order not found.");
    if (order.payment_status === "paid") return { url: null, alreadyPaid: true as const };
    if (!secret) return { url: null, alreadyPaid: false as const, missingKey: true as const };

    const session = await stripe(
      "checkout/sessions",
      secret,
      new URLSearchParams({
        mode: "payment",
        success_url: `${data.origin}${data.successPath}`,
        cancel_url: `${data.origin}${data.cancelPath}`,
        client_reference_id: order.id,
        "metadata[order_id]": order.id,
        "payment_intent_data[metadata][order_id]": order.id,
        "line_items[0][quantity]": "1",
        "line_items[0][price_data][currency]": String(order.currency).toLowerCase(),
        "line_items[0][price_data][unit_amount]": String(toMinor(Number(order.total), String(order.currency))),
        "line_items[0][price_data][product_data][name]": `Dobra order ${order.id.slice(0, 8)}`,
      }),
    );

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("orders").update({ payment_reference: String(session.id) }).eq("id", order.id);

    return { url: String(session.url), alreadyPaid: false as const, missingKey: false as const };
  });

/** Called when the customer returns from Stripe: checks with Stripe and marks the order paid. */
export const confirmCardPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ orderId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const secret = process.env["STRIPE_SECRET_KEY"];
    const { data: order } = await context.supabase
      .from("orders")
      .select("id,payment_method,payment_status,payment_reference")
      .eq("id", data.orderId)
      .eq("customer_id", context.userId)
      .maybeSingle();
    if (!order || order.payment_method !== "card") return { paid: false };
    if (order.payment_status === "paid") return { paid: true, justPaid: false };
    const ref = order.payment_reference ?? "";
    if (!secret || !ref.startsWith("cs_")) return { paid: false };

    const session = await stripe(`checkout/sessions/${ref}`, secret);
    if (session.payment_status !== "paid") return { paid: false };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("orders")
      .update({ payment_status: "paid", payment_reference: String(session.payment_intent ?? ref) })
      .eq("id", order.id);
    return { paid: true, justPaid: true };
  });

/** Staff refund: records the refund, then sends card refunds back through Stripe. */
export const refundOrderWithStripe = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ orderId: z.string().uuid(), amount: z.number().positive(), reason: z.string().min(1).max(500) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    // admin_refund_order checks staff role, validates the amount and writes the audit log.
    const { data: status, error } = await context.supabase.rpc("admin_refund_order", {
      _order: data.orderId,
      _amount: data.amount,
      _reason: data.reason,
    });
    if (error) throw new Error(error.message);
    if (status !== "pending_card") return { status: String(status) };

    const secret = process.env["STRIPE_SECRET_KEY"];
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id,total,currency,refund_amount,payment_reference")
      .eq("id", data.orderId)
      .single();
    if (!secret || !order) throw new Error("Refund recorded, but Stripe is not connected — send it from Stripe.");

    let intent = order.payment_reference ?? "";
    if (intent.startsWith("cs_")) {
      const session = await stripe(`checkout/sessions/${intent}`, secret);
      intent = String(session.payment_intent ?? "");
    }
    if (!intent.startsWith("pi_")) throw new Error("Refund recorded, but no Stripe payment was found for this order.");

    const refund = await stripe(
      "refunds",
      secret,
      new URLSearchParams({
        payment_intent: intent,
        amount: String(toMinor(data.amount, String(order.currency))),
        "metadata[order_id]": order.id,
        "metadata[reason]": data.reason.slice(0, 450),
      }),
    );

    const full = Number(order.refund_amount) >= Number(order.total);
    await supabaseAdmin
      .from("orders")
      .update({ refund_status: "refunded", payment_status: full ? "refunded" : "partially_refunded" })
      .eq("id", order.id);
    return { status: "refunded", refundId: String(refund.id) };
  });
