/** Online drivers confirm before changing availability. */
export function driverAvailabilityAction(online: boolean): "confirm-offline" | "go-online" {
  return online ? "confirm-offline" : "go-online";
}

export function offlineConfirmationResult(action: "go-offline" | "stay-online" | "backdrop" | "back"): false | null {
  return action === "go-offline" ? false : null;
}

/** The confirmed availability request is always the opposite state. */
export function nextDriverAvailability(online: boolean): boolean {
  return !online;
}

/** A driver is waiting only after their current jobs have been read successfully. */
export function isDriverWaiting(state: {
  online: boolean;
  ordersReady: boolean;
  activeCount: number;
  offerVisible: boolean;
}) {
  return state.online && state.ordersReady && state.activeCount === 0 && !state.offerVisible;
}

export function deliveryHistoryTime(order: {
  created_at: string;
  delivered_at?: string | null;
  cancelled_at?: string | null;
}) {
  return order.delivered_at ?? order.cancelled_at ?? order.created_at;
}

export function newestDeliveriesFirst<T extends Parameters<typeof deliveryHistoryTime>[0]>(orders: T[]): T[] {
  return [...orders].sort((a, b) => new Date(deliveryHistoryTime(b)).getTime() - new Date(deliveryHistoryTime(a)).getTime());
}