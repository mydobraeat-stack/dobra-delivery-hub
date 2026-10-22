import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Used only when a country has no payout rate configured. */
export const FALLBACK_PAYOUT_PCT = 15;

export function computePayout(total: number, pct: number = FALLBACK_PAYOUT_PCT) {
  return Math.round(Number(total) * (Number(pct) / 100) * 100) / 100;
}

const payoutRatesQuery = {
  queryKey: ["pricing", "payout-rates"],
  queryFn: async () => {
    const { data } = await supabase.from("country_pricing").select("country,driver_payout_pct");
    return (data ?? []) as { country: string; driver_payout_pct: number }[];
  },
  staleTime: 60_000,
};

/** Driver payout per order, using the admin-set rate for the order's country. */
export function usePayout() {
  const { data = [] } = useQuery(payoutRatesQuery);
  return (o: { total: number | string; country?: string | null }) => {
    const c = (o.country ?? "Poland").toLowerCase();
    const row = data.find((r) => r.country.toLowerCase() === c) ?? data.find((r) => r.country === "Poland");
    return computePayout(Number(o.total), row?.driver_payout_pct ?? FALLBACK_PAYOUT_PCT);
  };
}
