import { describe, expect, it } from "vitest";
import { directionsUrl, dropoffDestination, pickupDestination, travelModeFor } from "./navigation";

const base = { kind: "food" as const, address: "ul. Długa 5, Wrocław", dest_lat: null, dest_lng: null, pickup_address: null, pickup_lat: null, pickup_lng: null };

describe("travel mode", () => {
  it("bicycle and e-bike ride", () => {
    expect(travelModeFor("Bicycle")).toBe("bicycling");
    expect(travelModeFor("E-bike")).toBe("bicycling");
  });
  it("on foot walks", () => expect(travelModeFor("On foot")).toBe("walking"));
  it("everything else drives", () => {
    expect(travelModeFor("Car")).toBe("driving");
    expect(travelModeFor("Scooter")).toBe("driving");
    expect(travelModeFor(null)).toBe("driving");
  });
});

describe("directions URL", () => {
  it("uses coordinates and no origin", () => {
    const url = directionsUrl({ lat: 51.1, lng: 17.03 }, "driving")!;
    expect(url).toBe("https://www.google.com/maps/dir/?api=1&destination=51.1%2C17.03&travelmode=driving");
    expect(url).not.toContain("origin=");
  });
  it("restaurant leg uses full address", () => {
    const d = pickupDestination(base, { name: "Forno", address_line: "Rynek 1", postal_code: "50-101", city: "Wrocław", country: "Poland" });
    expect(d).toBe("Rynek 1, 50-101 Wrocław, Poland");
  });
  it("customer leg prefers saved checkout coordinates", () => {
    expect(dropoffDestination({ ...base, dest_lat: 51.2, dest_lng: 17.1 })).toEqual({ lat: 51.2, lng: 17.1 });
    expect(dropoffDestination(base)).toBe("ul. Długa 5, Wrocław");
  });
  it("package pickup uses sender coordinates", () => {
    expect(pickupDestination({ ...base, kind: "package", pickup_lat: 50, pickup_lng: 19 }, null)).toEqual({ lat: 50, lng: 19 });
  });
});
