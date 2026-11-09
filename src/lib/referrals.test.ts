import { describe, it, expect } from "vitest";
import { referralStatus, validReferralBonus } from "./referrals";
import { canAccessAdminPath } from "./admin-rules";

describe("driver referral safeguards", () => {
  it("does not activate a cash bonus without a chosen amount", () => {
    expect(validReferralBonus(null,true)).toBe(false);
    expect(validReferralBonus(null,false)).toBe(true);
  });
  it("does not mark a referral payable before its qualifying first delivery", () => {
    expect(referralStatus({ qualified_at:null,paid_at:null })).toBe("pending");
  });
  it("marks the reward due after its qualifying delivery", () => {
    expect(referralStatus({ qualified_at:"2026-11-08T12:28:00Z",paid_at:null })).toBe("qualified");
  });
  it("keeps recorded bonuses paid rather than payable again", () => {
    expect(referralStatus({ qualified_at:"2026-11-08T12:28:00Z",paid_at:"2026-11-08T13:28:00Z" })).toBe("paid");
  });
  it("reserves referral money controls for Super Admin", () => {
    expect(canAccessAdminPath("admin","/admin/referrals")).toBe(true);
    for (const role of ["support_agent","driver","customer","vendor"]) expect(canAccessAdminPath(role,"/admin/referrals")).toBe(false);
  });
});