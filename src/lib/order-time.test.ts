import { describe, expect, it } from "vitest";
import { formatOrderTime, orderTimeZone, orderTimeline } from "./order-time";

describe("order times", () => {
  it("uses Warsaw time for Poland (UTC+2 in October)", () => {
    expect(formatOrderTime("2026-10-12T12:35:00Z", "Poland", "en")).toBe("12 Oct 2026, 14:35");
  });
  it("uses Douala time for Cameroon (UTC+1)", () => {
    expect(orderTimeZone("Cameroon")).toBe("Africa/Douala");
    expect(formatOrderTime("2026-10-12T12:35:00Z", "Cameroon", "en")).toBe("12 Oct 2026, 13:35");
  });
  it("uses a 24-hour clock in the evening", () => {
    expect(formatOrderTime("2026-10-12T20:05:00Z", "Poland", "en")).toContain("22:05");
  });
  it("timeline skips steps without a stored time", () => {
    const steps = orderTimeline({ created_at: "a", accepted_at: "b", ready_at: null, delivered_at: "c" });
    expect(steps.map((s) => s.step)).toEqual(["placed", "accepted", "delivered"]);
  });
});
