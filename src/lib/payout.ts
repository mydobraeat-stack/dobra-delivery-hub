/**
 * Payout rule:
 * - Restaurant earns the full order total (items + delivery fee + service fee − promo), minus refunds.
 * - Driver earns a fixed amount per delivery, set per country by admin and locked onto each order when placed.
 * - Dobra pays the driver out of its own share.
 */
export type PayoutOrder = {
  total: number | string;
  refund_amount?: number | string | null;
  driver_payout?: number | string | null;
  kind?: string | null;
};

export function driverPayout(o: PayoutOrder): number {
  return Math.round(Number(o.driver_payout ?? 0) * 100) / 100;
}

export function restaurantEarnings(o: PayoutOrder): number {
  if (o.kind === "package") return 0;
  return Math.round((Number(o.total) - Number(o.refund_amount ?? 0)) * 100) / 100;
}

/** Hook kept for existing call sites: payout comes from the order itself. */
export function usePayout() {
  return driverPayout;
}
