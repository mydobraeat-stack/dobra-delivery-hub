import { describe, it, expect, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
import { validateCashPayout } from "./cash-payouts";

describe("cash payout rules", () => {
  it("allows a partial cash payment", () => expect(validateCashPayout(5, 10, 20, "Receipt 1")).toBeNull());
  it("blocks payment above earned unpaid amount", () => expect(validateCashPayout(11, 10, 20, "Receipt 1")).toMatch(/earnings/));
  it("blocks payment above cash on hand", () => expect(validateCashPayout(10, 20, 5, "Receipt 1")).toMatch(/settled cash/));
  it("blocks zero", () => expect(validateCashPayout(0, 10, 20, "Receipt 1")).not.toBeNull());
  it("blocks negative payments", () => expect(validateCashPayout(-5, 10, 20, "Receipt 1")).not.toBeNull());
  it("blocks fractional cents", () => expect(validateCashPayout(1.001, 10, 20, "Receipt 1")).not.toBeNull());
  it("requires a receipt", () => expect(validateCashPayout(5, 10, 20, " ")).not.toBeNull());
  it("blocks invalid numbers", () => expect(validateCashPayout(NaN, 10, 20, "Receipt 1")).not.toBeNull());
});