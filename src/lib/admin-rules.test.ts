import { describe, expect, it } from "vitest";
import { canAccessAdminPath, canReassignOrder, nextAdminStatuses, isClosedOrder } from "./admin-rules";

const order = { status: "pending", kind: "food", payment_method: "cash", payment_status: "unpaid", driver_id: null };

describe("admin order safeguards", () => {
  it("locks delivered and cancelled orders", () => {
    for (const status of ["delivered", "cancelled"]) {
      expect(isClosedOrder({ status })).toBe(true);
      expect(nextAdminStatuses({ ...order, status }, "admin")).toEqual([]);
      expect(canReassignOrder({ ...order, status })).toBe(false);
    }
  });
  it("only allows the next food stage, never a backwards jump", () => {
    expect(nextAdminStatuses(order, "admin")).toEqual(["accepted"]);
    expect(nextAdminStatuses({ ...order, status: "preparing" }, "admin")).toEqual(["ready"]);
  });
  it("blocks unpaid online orders from dispatch or progression", () => {
    for (const payment_method of ["card", "blik", "apple_pay", "google_pay"]) {
      expect(nextAdminStatuses({ ...order, payment_method }, "admin")).toEqual([]);
      expect(canReassignOrder({ ...order, payment_method })).toBe(false);
      expect(nextAdminStatuses({ ...order, payment_method, payment_status: "paid" }, "admin")).toEqual(["accepted"]);
    }
  });
  it("requires an assigned driver for pickup and delivery", () => {
    expect(nextAdminStatuses({ ...order, status: "ready" }, "admin")).toEqual([]);
    expect(nextAdminStatuses({ ...order, status: "ready", driver_id: "driver" }, "admin")).toEqual(["picked_up"]);
    expect(nextAdminStatuses({ ...order, status: "picked_up" }, "admin")).toEqual([]);
  });
  it("uses pickup and delivery stages only for packages", () => {
    expect(nextAdminStatuses({ ...order, kind: "package", status: "ready", driver_id: "driver" }, "admin")).toEqual(["picked_up"]);
    expect(nextAdminStatuses({ ...order, kind: "package", status: "pending" }, "admin")).toEqual([]);
  });
  it("prevents reassignment after pickup", () => {
    expect(canReassignOrder({ ...order, status: "picked_up", driver_id: "driver" })).toBe(false);
  });
});

describe("staff permissions", () => {
  it("limits Support Agents to orders, disputes, support and customer reviews", () => {
    for (const path of ["orders", "disputes", "support", "feedback"]) expect(canAccessAdminPath("support_agent", `/admin/${path}`)).toBe(true);
    for (const path of ["", "/users", "/pricing", "/platform", "/promos", "/approvals", "/drivers", "/restaurants", "/reviews", "/audit", "/analytics"]) expect(canAccessAdminPath("support_agent", `/admin${path}`)).toBe(false);
  });
  it("reserves manual status changes for Super Admins", () => {
    expect(nextAdminStatuses(order, "support_agent")).toEqual([]);
    expect(nextAdminStatuses(order, "admin")).toEqual(["accepted"]);
  });
  it("denies non-staff and permits Super Admin sections", () => {
    expect(canAccessAdminPath("customer", "/admin/orders")).toBe(false);
    expect(canAccessAdminPath(undefined, "/admin/orders")).toBe(false);
    expect(canAccessAdminPath("admin", "/admin/users")).toBe(true);
  });
});