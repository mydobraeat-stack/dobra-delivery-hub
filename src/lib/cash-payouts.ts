import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BalanceSplit } from "@/lib/admin-balances";

export type CashBalance = BalanceSplit & { cashPaidOut: number; cashAvailable: number };
export type DriverCashDue = { driver_id: string; name: string; currency: string; earned: number; retained: number; paid: number; owed: number };
export type CashSummary = { drivers: DriverCashDue[]; balances: CashBalance[] };

export const cashPayoutSummaryQuery = queryOptions({
  queryKey: ["admin", "cash-payout-summary"],
  queryFn: async (): Promise<CashSummary> => {
    const { data, error } = await supabase.rpc("admin_cash_payout_summary");
    if (error) throw new Error(error.message);
    return data as unknown as CashSummary;
  },
  refetchInterval: 15000,
  refetchOnWindowFocus: true,
});

export const cashPayoutHistoryQuery = queryOptions({
  queryKey: ["admin", "cash-payout-history"],
  queryFn: async () => {
    const { data, error } = await supabase.from("driver_cash_payouts")
      .select("id,driver_id,currency,amount,reference,paid_at")
      .order("paid_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },
});

export function validateCashPayout(amount: number, owed: number, available: number, reference: string): string | null {
  if (!Number.isFinite(amount) || amount <= 0 || Math.abs(amount * 100 - Math.round(amount * 100)) > 0.000001) return "Enter a positive amount with at most two decimals.";
  if (amount > owed) return "Amount exceeds unpaid driver earnings.";
  if (amount > available) return "Not enough settled cash available; collect driver settlements first.";
  if (reference.trim().length < 3 || reference.trim().length > 200) return "Enter a handover receipt/reference (3–200 characters).";
  return null;
}

export async function recordCashPayout(input: { driver: string; currency: string; amount: number; reference: string; request: string }) {
  const { data, error } = await supabase.rpc("admin_record_driver_cash_payout", {
    _driver: input.driver, _currency: input.currency, _amount: input.amount,
    _reference: input.reference.trim(), _request: input.request,
  });
  if (error) throw new Error(error.message);
  return data;
}