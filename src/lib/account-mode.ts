export type AccountRole = "customer" | "driver" | "vendor" | "admin" | "support_agent";

export function canApplyAsDriver(roles: readonly AccountRole[]) {
  return roles.includes("customer") && !roles.some((role) => role !== "customer");
}

export function canSwitchModes(roles: readonly AccountRole[]) {
  return roles.includes("customer") && roles.includes("driver") && !roles.some((role) => !["customer", "driver"].includes(role));
}

export function resolveAccountMode(roles: readonly AccountRole[], preferred: string | null): AccountRole {
  for (const role of ["admin", "support_agent", "vendor"] as const) if (roles.includes(role)) return role;
  if (canSwitchModes(roles)) return preferred === "driver" ? "driver" : "customer";
  return roles.includes("driver") ? "driver" : "customer";
}

export function hasActiveDelivery(orders: readonly { status: string }[]) {
  return orders.some((order) => !["delivered", "cancelled"].includes(order.status));
}

export function isDriverApproved(profileStatus: string | undefined, docsStatus: string | undefined) {
  return profileStatus === "approved" && docsStatus === "approved";
}