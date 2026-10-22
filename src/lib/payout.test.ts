import { describe, expect, it } from "vitest";
import { computePayout } from "./payout";

describe("driver payout", () => {
  it("defaults to 15% of the order total (120.99 -> 18.15)", () => {
    expect(computePayout(120.99)).toBe(18.15);
  });
  it("uses the admin-set rate", () => {
    expect(computePayout(100, 20)).toBe(20);
  });
});
