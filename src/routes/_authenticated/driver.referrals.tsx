import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Copy, Share2, Gift } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DriverReferralEntry } from "@/components/dobra/DriverReferralEntry";
import { useI18n } from "@/lib/i18n";
import { myReferralsQuery, referralStatus } from "@/lib/referrals";

export const Route = createFileRoute("/_authenticated/driver/referrals")({
  loader: ({ context }) => context.queryClient.ensureQueryData(myReferralsQuery),
  head: () => ({ meta: [
    { title: "Refer a driver — Dobra" }, { name: "description", content: "Your Dobra driver referral code and cash bonus progress." },
    { property: "og:title", content: "Refer a driver — Dobra" }, { property: "og:description", content: "Driver invitations and referral bonuses at Dobra." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex,nofollow" },
  ] }),
  component: DriverReferrals,
});

function DriverReferrals() {
  const { t, formatMoney, formatDate } = useI18n();
  const { data } = useSuspenseQuery(myReferralsQuery);
  const copy = async () => {
    try { await navigator.clipboard.writeText(data.code ?? ""); toast.success(t("referrals.copied")); }
    catch { toast.error(t("referrals.error")); }
  };
  const share = async () => {
    const text = t("referrals.shareMessage", { code: data.code ?? "", url: `${window.location.origin}/driver/documents` });
    try { if (navigator.share) await navigator.share({ title: "Dobra", text }); else { await navigator.clipboard.writeText(text); toast.success(t("referrals.copied")); } }
    catch (e) { if (!(e instanceof DOMException && e.name === "AbortError")) toast.error(t("referrals.error")); }
  };
  return <main className="mx-auto max-w-lg space-y-6 px-5 py-6">
    <header className="space-y-2"><Gift className="size-9 text-brand" /><h1 className="text-2xl font-bold">{t("referrals.title")}</h1><p className="font-medium">{t("referrals.intro")}</p></header>
    <section className="space-y-4">
      <p className="text-sm">{data.settings?.enabled && data.settings.bonus ? t("referrals.reward", { amount: formatMoney(data.settings.bonus, data.settings.currency) }) : t("referrals.inactive")}</p>
      {data.code ? <div className="space-y-3 rounded-lg border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">{t("referrals.code")}</p><p className="break-all font-mono text-2xl font-bold">{data.code}</p>
        <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={copy}><Copy className="size-4" />{t("referrals.copy")}</Button><Button onClick={share} disabled={!data.settings?.enabled}><Share2 className="size-4" />{t("referrals.share")}</Button></div>
      </div> : <p className="text-sm text-muted-foreground">{t("referrals.approval")}</p>}
      <DriverReferralEntry />
    </section>
    <section className="space-y-3"><h2 className="text-lg font-bold">{t("referrals.history")}</h2>
      {data.referrals.length === 0 ? <p className="text-sm text-muted-foreground">{t("referrals.empty")}</p> : [...data.referrals].sort((a,b) => b.created_at.localeCompare(a.created_at)).map(r => <article key={r.id} className="flex flex-wrap justify-between gap-3 rounded-lg border border-border bg-card p-4"><div><p className="font-semibold">{t(`referrals.${referralStatus(r)}`)}</p><p className="text-xs text-muted-foreground">{formatDate(r.created_at)}</p></div><p className="font-bold">{formatMoney(r.bonus,r.currency)}</p></article>)}
    </section>
  </main>;
}