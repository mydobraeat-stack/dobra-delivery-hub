import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { adminReferralsQuery, saveReferralSetting, payReferral, validReferralBonus, referralStatus, type ReferralSetting, type Referral } from "@/lib/referrals";

export const Route = createFileRoute("/_authenticated/admin/referrals")({
  loader: ({ context }) => context.queryClient.ensureQueryData(adminReferralsQuery),
  head: () => ({ meta: [
    { title: "Driver referrals — Dobra Admin" }, { name: "description", content: "Manage driver referral bonuses and payment records." },
    { property: "og:title", content: "Driver referrals — Dobra Admin" }, { property: "og:description", content: "Private driver referral bonus management." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex,nofollow" },
  ] }), component: AdminDriverReferrals,
});

function Setting({ setting }: { setting: ReferralSetting }) {
  const { t } = useI18n();
  const client = useQueryClient();
  const [amount,setAmount] = useState(setting.bonus == null ? "" : String(setting.bonus));
  const [enabled,setEnabled] = useState(setting.enabled);
  const bonus = amount.trim() ? Number(amount) : null;
  const save = useMutation({ mutationFn: () => saveReferralSetting({ ...setting, bonus, enabled }), onSuccess: () => { toast.success(t("referrals.saved")); void client.invalidateQueries({ queryKey: adminReferralsQuery.queryKey }); }, onError: () => toast.error(t("referrals.error")) });
  return <form className="space-y-4 rounded-lg border border-border bg-card p-4" onSubmit={e => { e.preventDefault(); save.mutate(); }}>
    <h3 className="font-bold">{setting.country} · {setting.currency}</h3>
    <div className="space-y-2"><Label htmlFor={`bonus-${setting.country}`}>{t("referrals.amount")}</Label><Input id={`bonus-${setting.country}`} type="number" min="0.01" step={setting.currency === "XAF" ? "1" : "0.01"} placeholder={t("referrals.unset")} value={amount} onChange={e => setAmount(e.target.value)} disabled={save.isPending} /></div>
    <div className="flex items-center gap-3"><Switch id={`enabled-${setting.country}`} checked={enabled} onCheckedChange={setEnabled} disabled={save.isPending} /><Label htmlFor={`enabled-${setting.country}`}>{t("referrals.enabled")}</Label></div>
    <Button disabled={save.isPending || !validReferralBonus(bonus,enabled)}>{t("referrals.save")}</Button>
  </form>;
}

function AdminDriverReferrals() {
  const { t,formatMoney,formatDate } = useI18n();
  const { data } = useSuspenseQuery(adminReferralsQuery);
  const client = useQueryClient();
  const [selected,setSelected] = useState<Referral | null>(null);
  const [reference,setReference] = useState("");
  const pay = useMutation({ mutationFn: async () => { if (!selected) return; await payReferral(selected.id,reference); }, onSuccess: () => { setSelected(null); toast.success(t("referrals.saved")); void client.invalidateQueries({ queryKey: adminReferralsQuery.queryKey }); }, onError: () => toast.error(t("referrals.error")) });
  return <div className="space-y-6">
    <header className="space-y-2"><h1 className="text-2xl font-bold">{t("referrals.adminTitle")}</h1><p className="max-w-2xl text-sm text-muted-foreground">{t("referrals.rule")}</p></header>
    <section className="space-y-3"><h2 className="text-lg font-bold">{t("referrals.settings")}</h2><div className="grid gap-4 md:grid-cols-2">{data.settings.map(s => <Setting key={`${s.country}-${s.bonus}-${s.enabled}`} setting={s} />)}</div></section>
    <section className="space-y-3"><h2 className="text-lg font-bold">{t("referrals.history")}</h2>
      {!data.referrals.length && <p className="text-muted-foreground">{t("referrals.empty")}</p>}
      {data.referrals.map(r => <article key={r.id} className="space-y-3 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap justify-between gap-3"><div className="min-w-0"><p className="break-words"><span className="text-muted-foreground">{t("referrals.referrer")}: </span>{r.referrer}</p><p className="break-words text-sm"><span className="text-muted-foreground">{t("referrals.referred")}: </span>{r.referred}</p></div><p className="font-bold">{formatMoney(r.bonus,r.currency)}</p></div>
        <p className="text-sm">{t(`referrals.${referralStatus(r)}`)} · {formatDate(r.created_at)}</p>
        {r.payment_reference && <p className="break-words text-xs text-muted-foreground">{r.payment_reference}</p>}
        {referralStatus(r)==="qualified" && <Button onClick={() => { setReference(""); setSelected(r); }}>{t("referrals.record")}</Button>}
      </article>)}
    </section>
    <Dialog open={Boolean(selected)} onOpenChange={open => { if (!open && !pay.isPending) setSelected(null); }}><DialogContent><DialogHeader><DialogTitle>{t("referrals.record")}</DialogTitle><DialogDescription>{t("referrals.handover")}</DialogDescription></DialogHeader>
      <form className="space-y-4" onSubmit={e => { e.preventDefault(); pay.mutate(); }}>
        <p className="font-semibold">{selected?.referrer} · {formatMoney(selected?.bonus ?? 0,selected?.currency)}</p>
        <Label htmlFor="referral-reference">{t("referrals.reference")}</Label><Input id="referral-reference" required minLength={3} maxLength={200} value={reference} onChange={e => setReference(e.target.value)} disabled={pay.isPending} />
        <div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" onClick={() => setSelected(null)} disabled={pay.isPending}>{t("referrals.cancel")}</Button><Button disabled={pay.isPending || reference.trim().length<3}>{t("referrals.confirm")}</Button></div>
      </form>
    </DialogContent></Dialog>
  </div>;
}