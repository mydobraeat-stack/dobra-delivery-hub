import { describe, expect, it } from "vitest";
import { canApplyAsDriver, canSwitchModes, resolveAccountMode, hasActiveDelivery, isDriverApproved } from "./account-mode";
import { requiredDocsFor } from "./driver-docs";

describe("customer driver rules", () => {
  it("only customers without driver or staff/vendor roles can apply", () => {
    expect(canApplyAsDriver(["customer"])).toBe(true);
    for (const role of ["driver", "vendor", "admin", "support_agent"] as const) expect(canApplyAsDriver(["customer", role])).toBe(false);
  });
  it("only customer/driver accounts can switch modes", () => {
    expect(canSwitchModes(["customer", "driver"])).toBe(true);
    expect(canSwitchModes(["driver"])).toBe(false);
    expect(canSwitchModes(["customer", "driver", "admin"])).toBe(false);
  });
  it("restores driver mode only when the driver role exists", () => {
    expect(resolveAccountMode(["customer", "driver"], "driver")).toBe("driver");
    expect(resolveAccountMode(["customer", "driver"], "customer")).toBe("customer");
    expect(resolveAccountMode(["customer"], "driver")).toBe("customer");
  });
  it("blocks switching during every unfinished delivery", () => {
    for (const status of ["pending", "accepted", "preparing", "ready", "picked_up"]) expect(hasActiveDelivery([{ status }])).toBe(true);
    expect(hasActiveDelivery([{ status: "delivered" }, { status: "cancelled" }])).toBe(false);
  });
  it("customer approval alone never approves a driver", () => {
    for (const status of [undefined, "draft", "in_review", "rejected"]) expect(isDriverApproved("approved", status)).toBe(false);
    expect(isDriverApproved("approved", "approved")).toBe(true);
    expect(isDriverApproved("pending", "approved")).toBe(false);
  });
  it("keeps lighter vehicle requirements distinct from motorbike/car", () => {
    expect(requiredDocsFor("On foot").map(d => d.id)).toEqual(["profile_photo", "id_card", "insulated_bag"]);
    for (const vehicle of ["Bicycle", "E-bike", "Scooter"]) expect(requiredDocsFor(vehicle).map(d => d.id)).toEqual(["profile_photo", "id_card", "insulated_bag", "vehicle_photo"]);
    for (const vehicle of ["Car", "Motorbike"]) expect(requiredDocsFor(vehicle).map(d => d.id)).toEqual(["profile_photo", "id_card", "insulated_bag", "vehicle_photo", "drivers_licence", "insurance", "vehicle_registration"]);
  });
});