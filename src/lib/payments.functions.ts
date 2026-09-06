import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------------------------------------------------------------------------
// Stripe Checkout (TEST / SANDBOX SCAFFOLD)
//
// TODO(real keys): add STRIPE_SECRET_KEY (sk_test_... then sk_live_...) in
// Project Settings -> Secrets. Nothing else needs to change here.
//
// TODO(mobile money): Cameroon market — Flutterwave / Notch Pay integration is
// intentionally NOT implemented yet. Add a separate server function here once
// those accounts exist.
// ---------------------------------------------------------------------------

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

    if (!secret) {
      // Sandbox placeholder: no key configured yet.
      return { url: null, alreadyPaid: false as const, missingKey: true as const };
    }

    const body = new URLSearchParams({
      mode: "payment",
      success_url: `${data.origin}${data.successPath}`,
      cancel_url: `${data.origin}${data.cancelPath}`,
      client_reference_id: order.id,
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": String(order.currency).toLowerCase(),
      "line_items[0][price_data][unit_amount]": String(Math.round(Number(order.total) * 100)),
      "line_items[0][price_data][product_data][name]": `Dobra order ${order.id.slice(0, 8)}`,
    });

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
      throw new Error(session.error?.message ?? "Could not start the card payment.");
    }

    await context.supabase
      .from("orders")
      .update({ payment_reference: session.url ? data.orderId : null })
      .eq("id", order.id);

    return { url: session.url, alreadyPaid: false as const, missingKey: false as const };
  });
