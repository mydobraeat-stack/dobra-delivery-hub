import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Referral = { id: string; bonus: number; currency: string; created_at: string; qualified_at: string | null; paid_at: string | null; referrer?: string; referred?: string; country?: string; payment_reference?: string };
export type ReferralSetting = { country: string; currency: string; bonus: number | null; enabled: boolean };
export type MyReferrals = { code: string | null; country: string; settings: ReferralSetting | null; referrals: Referral[]; applied: boolean; canApply: boolean };
export type AdminReferrals = { settings: ReferralSetting[]; referrals: Referral[] };
export const myReferralsQuery = queryOptions({ queryKey: ["driver", "referrals"], queryFn: async () => {
  const { data, error } = await supabase.rpc("my_driver_referrals");
  if (error) throw error;
  return data as unknown as MyReferrals;
}, refetchOnWindowFocus: true });
export const adminReferralsQuery = queryOptions({ queryKey: ["admin", "referrals"], queryFn: async () => {
  const { data, error } = await supabase.rpc("admin_driver_referrals");
  if (error) throw error;
  return data as unknown as AdminReferrals;
}, refetchOnWindowFocus: true });
export function referralStatus(r: Pick<Referral, "qualified_at" | "paid_at">) {
  return r.paid_at ? "paid" : r.qualified_at ? "qualified" : "pending";
}
export function validReferralBonus(amount: number | null, enabled: boolean) {
  return amount === null ? !enabled : Number.isFinite(amount) && amount > 0 && Math.abs(amount * 100 - Math.round(amount * 100)) < 0.000001;
}
export async function applyReferral(code: string) {
  const { error } = await supabase.rpc("apply_driver_referral", { _code: code.trim().toUpperCase() });
  if (error) throw error;
}
export async function saveReferralSetting(s: ReferralSetting) {
  const { error } = await supabase.rpc("admin_set_driver_referral", { _country: s.country, ...(s.bonus === null ? {} : { _bonus: s.bonus }), _enabled: s.enabled });
  if (error) throw error;
}
export async function payReferral(id: string, reference: string) {
  const { error } = await supabase.rpc("admin_pay_driver_referral", { _id: id, _reference: reference.trim() });
  if (error) throw error;
}