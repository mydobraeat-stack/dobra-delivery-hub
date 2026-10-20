import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

// Stripe webhook: marks orders paid as soon as Stripe confirms the payment,
// even if the customer never returns to the app (e.g. slow BLIK confirmation).
// Events to enable in Stripe: checkout.session.completed,
// checkout.session.async_payment_succeeded, checkout.session.async_payment_failed.

const TOLERANCE_SECONDS = 300;

function verify(payload: string, header: string, secret: string): boolean {
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const i = p.indexOf("=");
      return [p.slice(0, i), p.slice(i + 1)];
    }),
  ) as Record<string, string>;
  const t = Number(parts["t"]);
  if (!t || Math.abs(Date.now() / 1000 - t) > TOLERANCE_SECONDS) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  const signatures = header
    .split(",")
    .filter((p) => p.startsWith("v1="))
    .map((p) => p.slice(3));
  const exp = Buffer.from(expected);
  return signatures.some((s) => {
    const sig = Buffer.from(s);
    return sig.length === exp.length && timingSafeEqual(sig, exp);
  });
}

type SessionObject = {
  id: string;
  payment_status?: string;
  payment_intent?: string | null;
  client_reference_id?: string | null;
  metadata?: Record<string, string> | null;
};

export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["STRIPE_WEBHOOK_SECRET"];
        if (!secret) return new Response("Webhook not configured", { status: 503 });

        const payload = await request.text();
        const signature = request.headers.get("stripe-signature") ?? "";
        if (!verify(payload, signature, secret)) {
          return new Response("Invalid signature", { status: 400 });
        }

        let event: { type?: string; data?: { object?: SessionObject } };
        try {
          event = JSON.parse(payload);
        } catch {
          return new Response("Bad payload", { status: 400 });
        }

        const session = event.data?.object;
        const orderId = session?.metadata?.["order_id"] ?? session?.client_reference_id ?? null;
        const isUuid = !!orderId && /^[0-9a-f-]{36}$/i.test(orderId);
        if (!session || !isUuid) return new Response("ignored");

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const paidEvent =
          (event.type === "checkout.session.completed" && session.payment_status === "paid") ||
          event.type === "checkout.session.async_payment_succeeded";

        if (paidEvent) {
          const { error } = await supabaseAdmin
            .from("orders")
            .update({
              payment_status: "paid",
              payment_reference: String(session.payment_intent ?? session.id),
            })
            .eq("id", orderId)
            .eq("payment_method", "card")
            .neq("payment_status", "paid");
          if (error) {
            console.error("stripe-webhook update failed", error.message);
            return new Response("Update failed", { status: 500 });
          }
        } else if (event.type === "checkout.session.async_payment_failed") {
          // Fetch the bank's decline message (e.g. BLIK code expired) to show the customer.
          let reason = "Online payment failed";
          const key = process.env["STRIPE_RESTRICTED_API_KEY"] ?? process.env["STRIPE_SECRET_KEY"];
          if (key && session.payment_intent) {
            try {
              const r = await fetch(`https://api.stripe.com/v1/payment_intents/${session.payment_intent}`, {
                headers: { Authorization: `Bearer ${key}` },
              });
              const pi = (await r.json()) as { last_payment_error?: { message?: string } };
              if (pi.last_payment_error?.message) reason = `Payment failed: ${pi.last_payment_error.message}`;
            } catch {
              /* keep generic reason */
            }
          }
          await supabaseAdmin
            .from("orders")
            .update({ payment_status: "failed", status: "cancelled", cancel_reason: reason.slice(0, 300) })
            .eq("id", orderId)
            .eq("payment_method", "card")
            .neq("payment_status", "paid");
        }

        return new Response("ok");
      },
    },
  },
});
