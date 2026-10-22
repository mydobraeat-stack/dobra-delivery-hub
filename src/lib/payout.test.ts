import { describe, expect, it } from "vitest";
import { driverPayout, restaurantEarnings } from "./payout";

describe("payout rule", () => {
  it("restaurant receives the full order total of 120.99", () => {
    expect(restaurantEarnings({ total: 120.99 })).toBe(120.99);
  });
  it("refunds reduce restaurant earnings", () => {
    expect(restaurantEarnings({ total: 120.99, refund_amount: 20 })).toBe(100.99);
  });
  it("package orders give no restaurant earnings", () => {
    expect(restaurantEarnings({ total: 15, kind: "package" })).toBe(0);
  });
  it("driver gets the fixed amount stored on the order, not a share of the total", () => {
    expect(driverPayout({ total: 120.99, driver_payout: 10 })).toBe(10);
    expect(driverPayout({ total: 500, driver_payout: 10 })).toBe(10);
  });
});
