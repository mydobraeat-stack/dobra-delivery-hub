import { describe, expect, it } from "vitest";
import { splitBalances } from "./admin-balances";
import type { AdminOrder } from "./admin";

function order(partial: Partial<AdminOrder>): AdminOrder {
  return {
    id: "o1",
    status: "delivered",
    total: 100,
    currency: "PLN",
    payment_method: "card",
    payment_status: "paid",
    refund_amount: 0,
    ...partial,
  } as AdminOrder;
}

describe("splitBalances", () => {
  it("splits online and cash on delivered orders", () => {
    const split = splitBalances([
      order({ id: "a", total: 50, payment_method: "card", payment_status: "paid" }),
      order({ id: "b", total: 30, payment_method: "cash", payment_status: null }),
    ]);
    expect(split).toEqual([{ currency: "PLN", online: 50, cash: 30 }]);
  });

  it("excludes unpaid online orders from the online amount", () => {
    const split = splitBalances([
      order({ id: "a", total: 50, payment_status: "pending" }),
      order({ id: "b", total: 50, payment_status: "failed" }),
    ]);
    expect(split).toEqual([{ currency: "PLN", online: 0, cash: 0 }]);
  });

  it("counts refunded and partially refunded online orders, net of refunds", () => {
    const split = splitBalances([
      order({ id: "a", total: 50, payment_status: "partially_refunded", refund_amount: 10 }),
      order({ id: "b", total: 20, payment_status: "refunded", refund_amount: 20 }),
    ]);
    expect(split).toEqual([{ currency: "PLN", online: 40, cash: 0 }]);
  });

  it("nets cash refunds out of the cash amount", () => {
    const split = splitBalances([
      order({ id: "a", payment_method: "cash", payment_status: null, total: 40, refund_amount: 5 }),
    ]);
    expect(split).toEqual([{ currency: "PLN", online: 0, cash: 35 }]);
  });

  it("ignores non-delivered orders", () => {
    const split = splitBalances([
      order({ id: "a", status: "cancelled", total: 99, payment_method: "cash" }),
      order({ id: "b", status: "picked_up", total: 99 }),
    ]);
    expect(split).toEqual([]);
  });

  it("keeps currencies separate", () => {
    const split = splitBalances([
      order({ id: "a", total: 50 }),
      order({ id: "b", total: 7000, currency: "XAF", payment_method: "cash", payment_status: null }),
    ]);
    expect(split).toEqual([
      { currency: "PLN", online: 50, cash: 0 },
      { currency: "XAF", online: 0, cash: 7000 },
    ]);
  });
});
