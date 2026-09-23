import { useEffect, useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BadgeCheck, Bike, Crown, Headphones, Percent } from "lucide-react";
import { toast } from "sonner";
import { ProfileBackLink } from "@/components/dobra/ProfileMenu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/lib/i18n";
import { PRIME_CURRENCY, PRIME_PRICE, isPrimeActive, primeQuery } from "@/lib/prime";
import { cancelPrime, startPrimeCheckout, syncPrimeFromSession } from "@/lib/prime.functions";

export const Route = createFileRoute("/_authenticated/profile/prime")({
  head: () => ({
    meta: [
      { title: "Dobra Prime — Dobra" },
      { name: "description", content: "Free delivery and member perks with Dobra Prime." },
      { property: "og:title", content: "Dobra Prime" },
      {
        property: "og:description",
        content: "Free delivery and member perks with Dobra Prime.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrimePage,
});

function PrimePage() {
  const t = useT();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: membership } = useQuery(primeQuery);
  const start = useServerFn(startPrimeCheckout);
  const sync = useServerFn(syncPrimeFromSession);
  const cancel = useServerFn(cancelPrime);
  const [busy, setBusy] = useState(false);

  const active = isPrimeActive(membership);

  // Finish the subscription when Stripe sends the member back.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) return;
    window.history.replaceState({}, "", window.location.pathname);
    void (async () => {
      try {
        await sync({ data: { sessionId } });
        await queryClient.invalidateQueries({ queryKey: primeQuery.queryKey });
        toast.success(t("common.prime.welcome"));
      } catch {
        toast.error(t("common.prime.error"));
      }
    })();
  }, [sync, queryClient, t, router]);

  async function handleJoin() {
    setBusy(true);
    try {
      const res = await start({
        data: { origin: window.location.origin, returnPath: "/profile/prime" },
      });
      if (res.missingKey || !res.url) {
        toast.error(t("common.prime.paymentsMissing"));
        return;
      }
      window.location.href = res.url;
    } catch {
      toast.error(t("common.prime.error"));
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel() {
    setBusy(true);
    try {
      await cancel({ data: undefined });
      await queryClient.invalidateQueries({ queryKey: primeQuery.queryKey });
      toast.success(t("common.prime.cancelled"));
    } catch {
      toast.error(t("common.prime.error"));
    } finally {
      setBusy(false);
    }
  }

  const benefits = [
    { icon: Bike, key: "delivery" },
    { icon: Percent, key: "discount" },
    { icon: Headphones, key: "support" },
    { icon: BadgeCheck, key: "priority" },
  ] as const;

  const renews = membership?.current_period_end
    ? new Date(membership.current_period_end).toLocaleDateString()
    : null;

  return (
    <main className="mx-auto max-w-2xl space-y-4 px-5 py-6">
      <ProfileBackLink label={t("common.actions.back")} />

      <Card className="overflow-hidden border-ink/10 bg-sun">
        <CardContent className="space-y-2 py-7 text-center">
          <Crown className="mx-auto size-9 text-brand" aria-hidden />
          <h1 className="text-2xl font-bold text-ink">{t("common.prime.title")}</h1>
          <p className="text-sm text-ink/70">{t("common.prime.subtitle")}</p>
          <p className="pt-1 text-lg font-bold text-brand">
            {t("common.prime.price", {
              price: `${PRIME_CURRENCY} ${PRIME_PRICE.toFixed(2)}`,
            })}
          </p>
        </CardContent>
      </Card>

      <ul className="overflow-hidden rounded-2xl border border-ink/10 bg-card">
        {benefits.map(({ icon: Icon, key }) => (
          <li key={key} className="flex items-center gap-4 border-b border-ink/10 px-4 py-3 last:border-b-0">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sun/40 ring-1 ring-brand/25">
              <Icon className="size-5 text-brand" aria-hidden />
            </span>
            <span className="min-w-0 flex-1 text-sm text-foreground">
              {t(`common.prime.benefits.${key}`)}
            </span>
          </li>
        ))}
      </ul>

      {active ? (
        <div className="space-y-3">
          <p className="rounded-2xl border border-ink/10 bg-card px-4 py-3 text-sm text-foreground">
            {membership?.cancel_at_period_end
              ? t("common.prime.endsOn", { date: renews ?? "" })
              : renews
                ? t("common.prime.renewsOn", { date: renews })
                : t("common.prime.activeNow")}
          </p>
          {membership?.cancel_at_period_end ? null : (
            <Button
              variant="outline"
              disabled={busy}
              onClick={handleCancel}
              className="h-12 w-full rounded-2xl border-2 border-brand/30 bg-card text-base font-semibold text-brand hover:bg-brand/10 hover:text-brand"
            >
              {t("common.prime.cancel")}
            </Button>
          )}
        </div>
      ) : (
        <Button
          disabled={busy}
          onClick={handleJoin}
          className="h-12 w-full rounded-2xl bg-brand text-base font-semibold text-primary-foreground shadow-soft hover:bg-brand/90 active:scale-[0.99]"
        >
          {busy ? t("common.actions.saving") : t("common.prime.join")}
        </Button>
      )}
      <p className="pb-2 text-center text-xs text-foreground/50">{t("common.prime.terms")}</p>
    </main>
  );
}
