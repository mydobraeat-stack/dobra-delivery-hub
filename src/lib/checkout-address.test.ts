import { describe, expect, it } from "vitest";
import { manualAddressComplete, formatManualAddress } from "./checkout-address";

describe("manual checkout address", () => {
  const address = { street: "Marszałkowska", building: "10", apartment: "", city: "Warszawa" };
  it("requires a building number", () => {
    expect(manualAddressComplete({ ...address, building: "" })).toBe(false);
    expect(manualAddressComplete(address)).toBe(true);
  });
  it("keeps apartment number optional", () => {
    expect(formatManualAddress(address)).toBe("Marszałkowska 10, Warszawa");
    expect(formatManualAddress({ ...address, apartment: "5" })).toBe("Marszałkowska 10/5, Warszawa");
  });
});