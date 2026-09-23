import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Monthly Dobra Prime price, charged per month. */
export const PRIME_PRICE = 19.99;
export const PRIME_CURRENCY = "PLN";

export type PrimeMembership = {
  status: "inactive" | "active" | "past_due" | "cancelled";
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

export function isPrimeActive(m: PrimeMembership | null | undefined) {
  if (!m) return false;
  if (m.status !== "active") return false;
  if (!m.current_period_end) return true;
  return new Date(m.current_period_end).getTime() > Date.now();
}

/** The signed-in member's Dobra Prime membership, or null when they have none. */
export const primeQuery = queryOptions({
  queryKey: ["prime-membership"],
  queryFn: async (): Promise<PrimeMembership | null> => {
    const { data: auth } = await supabase.auth.getUser();
    const id = auth.user?.id;
    if (!id) return null;
    const { data, error } = await supabase
      .from("prime_memberships")
      .select("status,current_period_end,cancel_at_period_end")
      .eq("user_id", id)
      .maybeSingle();
    if (error) throw error;
    return (data as PrimeMembership | null) ?? null;
  },
});
