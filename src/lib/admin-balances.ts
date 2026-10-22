import type { AdminOrder } from "@/lib/admin";

const PAID_LIKE = ["paid", "refunded", "partially_refunded"];

export type BalanceSplit = { currency: string; online: number; cash: number };

// Delivered orders only, refunds subtracted. Online = card/BLIK that Stripe actually
// confirmed; cash = money the driver collected and still owes to the platform.
export function splitBalances(orders: AdminOrder[]): BalanceSplit[] {
  const currencies = [
    ...new Set(orders.filter((o) => o.status === "delivered").map((o) => o.currency)),
  ];
  return currencies.map((currency) => {
    const done = orders.filter((o) => o.status === "delivered" && o.currency === currency);
    const sum = (f: (o: AdminOrder) => number) =>
      Math.round(done.reduce((s, o) => s + f(o), 0) * 100) / 100;
    const online = sum((o) =>
      o.payment_method === "cash"
        ? 0
        : PAID_LIKE.includes(String(o.payment_status))
          ? Number(o.total) - Number(o.refund_amount ?? 0)
          : 0,
    );
    const cash = sum((o) =>
      o.payment_method === "cash" ? Number(o.total) - Number(o.refund_amount ?? 0) : 0,
    );
    return { currency, online, cash };
  });
}
