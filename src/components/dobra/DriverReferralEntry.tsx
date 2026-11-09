import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { applyReferral, myReferralsQuery } from "@/lib/referrals";

export function DriverReferralEntry() {
  const t = useT();
  const client = useQueryClient();
  const { data, error } = useQuery(myReferralsQuery);
  const [code, setCode] = useState("");
  const save = useMutation({ mutationFn: () => applyReferral(code), onSuccess: () => {
    toast.success(t("referrals.applied"));
    void client.invalidateQueries({ queryKey: myReferralsQuery.queryKey });
  }, onError: (e: Error) => toast.error(t(e.message.startsWith("referral_") ? `referrals.${e.message}` : "referrals.error")) });
  if (error) return <p role="alert" className="text-sm text-destructive">{t("referrals.error")}</p>;
  if (!data) return null;
  if (data.applied) return <p className="text-sm text-foreground">{t("referrals.applied")}</p>;
  if (!data.canApply) return null;
  return <section className="space-y-3 border-t border-border pt-4">
    <Label htmlFor="driver-referral-code">{t("referrals.optional")}</Label>
    {!data.settings?.enabled ? <p className="text-sm text-muted-foreground">{t("referrals.inactive")}</p> :
      <form className="flex flex-wrap gap-2" onSubmit={e => { e.preventDefault(); save.mutate(); }}>
        <Input id="driver-referral-code" className="min-w-0 flex-1 uppercase" value={code} onChange={e => setCode(e.target.value)} maxLength={12} required autoComplete="off" disabled={save.isPending} />
        <Button disabled={save.isPending || !code.trim()}>{t("referrals.apply")}</Button>
      </form>}
  </section>;
}