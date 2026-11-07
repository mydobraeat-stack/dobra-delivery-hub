import { describe, expect, it } from "vitest";
import { driverAvailabilityAction, offlineConfirmationResult, isDriverWaiting, newestDeliveriesFirst, nextDriverAvailability } from "./driver-home";

const waiting = { online: true, ordersReady: true, activeCount: 0, offerVisible: false };

it("requests offline after confirmation", () => {
  expect(nextDriverAvailability(true)).toBe(false);
});

it("opens confirmation rather than changing an online driver", () => {
  expect(driverAvailabilityAction(true)).toBe("confirm-offline");
});

it("goes online without an offline confirmation", () => {
  expect(driverAvailabilityAction(false)).toBe("go-online");
});

it("Go Offline requests offline immediately", () => {
  expect(offlineConfirmationResult("go-offline")).toBe(false);
});

it.each(["stay-online", "backdrop", "back"] as const)("%s leaves availability unchanged", (action) => {
  expect(offlineConfirmationResult(action)).toBeNull();
});

it("requests online when the offline button is pressed", () => {
  expect(nextDriverAvailability(false)).toBe(true);
});

describe("driver waiting", () => {
  it("waits online without a job or offer", () => expect(isDriverWaiting(waiting)).toBe(true));
  it("stops offline", () => expect(isDriverWaiting({ ...waiting, online: false })).toBe(false));
  it("stops during an active delivery", () => expect(isDriverWaiting({ ...waiting, activeCount: 1 })).toBe(false));
  it("stops for an offer and resumes when it closes", () => {
    expect(isDriverWaiting({ ...waiting, offerVisible: true })).toBe(false);
    expect(isDriverWaiting({ ...waiting, offerVisible: false })).toBe(true);
  });
  it("does not assume an empty loading or failed query means no jobs", () => expect(isDriverWaiting({ ...waiting, ordersReady: false })).toBe(false));
});

it("sorts past deliveries by completion/cancellation date newest first without changing the input", () => {
  const orders = [
    { id: "older", created_at: "2026-11-01T10:00:00Z", delivered_at: "2026-11-02T10:00:00Z" },
    { id: "newest", created_at: "2026-10-31T10:00:00Z", delivered_at: "2026-11-07T10:00:00Z" },
    { id: "cancelled", created_at: "2026-11-03T10:00:00Z", cancelled_at: "2026-11-06T10:00:00Z" },
  ];
  expect(newestDeliveriesFirst(orders).map((o) => o.id)).toEqual(["newest", "cancelled", "older"]);
  expect(orders[0]?.id).toBe("older");
});