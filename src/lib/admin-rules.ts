/** UI rules mirror the authoritative admin RPC checks in the database. */
export type StaffRole = "admin" | "support_agent" | string;
export const SUPPORT_PATHS = ["/admin/orders", "/admin/disputes", "/admin/support", "/admin/feedback"] as const;

export function canAccessAdminPath(role: StaffRole | undefined, pathname: string) {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (role === "admin") return path === "/admin" || path.startsWith("/admin/");
  return role === "support_agent" && SUPPORT_PATHS.some((allowed) => path === allowed);
}

export type GuardedOrder = {
  status: string;
  kind?: string;
  payment_method: string | null;
  payment_status: string | null;
  driver_id: string | null;
};

export function isClosedOrder(order: Pick<GuardedOrder, "status">) {
  return order.status === "delivered" || order.status === "cancelled";
}

export function isDispatchPaid(order: GuardedOrder) {
  return order.payment_method === "cash" || order.payment_status === "paid";
}

export function nextAdminStatuses(order: GuardedOrder, role: StaffRole | undefined): string[] {
  if (role !== "admin" || isClosedOrder(order) || !isDispatchPaid(order)) return [];
  const flow = order.kind === "package"
    ? ["ready", "picked_up", "delivered"]
    : ["pending", "accepted", "preparing", "ready", "picked_up", "delivered"];
  const index = flow.indexOf(order.status);
  const next = index >= 0 ? flow[index + 1] : undefined;
  if (!next || ((next === "picked_up" || next === "delivered") && !order.driver_id)) return [];
  return [next];
}

export function canReassignOrder(order: GuardedOrder) {
  return !isClosedOrder(order) && order.status !== "picked_up" && isDispatchPaid(order);
}