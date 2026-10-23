import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Banknote, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { accountQueryOptions } from "@/lib/profile";
import { driverOrdersQuery, orderRef, restaurantsQuery } from "@/lib/dobra";
import { driverPayout } from "@/lib/payout";
import { PendingApproval } from "@/components/dobra/PendingApproval";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/dobra/QueryStates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/driver/settlements")({
  head: () => ({
    meta: [
      { title: "Cash settlements — Dobra for drivers" },
      { name: "description", content: "Hand over the cash you collected and mark deliveries as settled." },
      { property: "og:title", content: "Cash settlements — Dobra for drivers" },
      { property: "og:description", content: "Hand over the cash you collected and mark deliveries as settled." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: DriverSettlements,
});

function DriverSettlements() {
  const { t, formatMoney, formatDate } = useI18n();
  const queryClient = useQueryClient();
  const { data: account } = useQuery(accountQueryOptions);
  const approved = account?.approvalStatus === "approved";
  const { data, isLoading, isError, refetch } = useQuery({ ...driverOrdersQuery, enabled: approved });
  const { data: restaurants = [] } = useQuery({ ...restaurantsQuery, enabled: approved });

  const settle = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase.rpc("driver_settle_cash", { _order: orderId });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("driver.settlements.settledToast"));
      queryClient.invalidateQueries({ queryKey: driverOrdersQuery.queryKey });
    },
    onError: () => toast.error(t("driver.settlements.errorToast")),
  });

  if (!approved) {
    return (
      <main className="mx-auto max-w-4xl space-y-6 px-5 py-6">
        <h1 className="text-2xl font-bold text-foreground">{t("driver.settlements.title")}</h1>
        <PendingApproval what="driver" />
      </main>
    );
  }

  const restaurantName = (id: string | null) =>
    !id
      ? t("package.orderLabel")
      : (restaurants.find((r) => r.id === id)?.name ?? t("driver.home.restaurantFallback"));

  const cashOrders = (data?.mine ?? []).filter(
    (o) => o.status === "delivered" && o.payment_method === "cash",
  );
  const owed = (o: (typeof cashOrders)[number]) =>
    Math.round((Number(o.total) - Number(o.refund_amount ?? 0) - driverPayout(o)) * 100) / 100;
  const unsettled = cashOrders.filter((o) => !o.cash_settled_at);
  const settled = cashOrders.filter((o) => o.cash_settled_at);
  const byCurrency = (list: typeof cashOrders) => {
    const m = new Map<string, number>();
    for (const o of list) m.set(o.currency, (m.get(o.currency) ?? 0) + owed(o));
    return [...m.entries()];
  };

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-5 py-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("driver.settlements.title")}</h1>
        <p className="text-sm text-foreground/60">{t("driver.settlements.subtitle")}</p>
      </div>

      <section className="grid grid-cols-2 gap-3">
        <Card className="border-ink/10">
          <CardContent className="py-4">
            <p className="text-xs text-foreground/60">{t("driver.settlements.toHandOver")}</p>
            {byCurrency(unsettled).length === 0 ? (
              <p className="text-xl font-bold text-foreground">{formatMoney(0)}</p>
            ) : (
              byCurrency(unsettled).map(([cur, v]) => (
                <p key={cur} className="text-xl font-bold text-foreground">
                  {formatMoney(v, cur)}
                </p>
              ))
            )}
          </CardContent>
        </Card>
        <Card className="border-ink/10">
          <CardContent className="py-4">
            <p className="text-xs text-foreground/60">{t("driver.settlements.alreadySettled")}</p>
            {byCurrency(settled).length === 0 ? (
              <p className="text-xl font-bold text-foreground">{formatMoney(0)}</p>
            ) : (
              byCurrency(settled).map(([cur, v]) => (
                <p key={cur} className="text-xl font-bold text-foreground">
                  {formatMoney(v, cur)}
                </p>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      {isLoading ? (
        <ListSkeleton rows={2} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : cashOrders.length === 0 ? (
        <EmptyState message={t("driver.settlements.none")} />
      ) : (
        <>
          {unsettled.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">{t("driver.settlements.toHandOver")}</h2>
              {unsettled.map((o) => (
                <Card key={o.id} className="border-ink/10">
                  <CardContent className="space-y-3 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {restaurantName(o.restaurant_id)}
                        </p>
                        <p className="text-xs text-foreground/60">
                          {orderRef(o.id)} · {formatDate(o.created_at)}
                        </p>
                      </div>
                      <Banknote className="h-5 w-5 text-foreground/40" aria-hidden />
                    </div>
                    <dl className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <dt className="text-foreground/60">{t("driver.settlements.collected")}</dt>
                        <dd className="font-semibold text-foreground">
                          {formatMoney(Number(o.total) - Number(o.refund_amount ?? 0), o.currency)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-foreground/60">{t("driver.settlements.youKeep")}</dt>
                        <dd className="font-semibold text-foreground">
                          {formatMoney(driverPayout(o), o.currency)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-foreground/60">{t("driver.settlements.handOver")}</dt>
                        <dd className="font-semibold text-foreground">{formatMoney(owed(o), o.currency)}</dd>
                      </div>
                    </dl>
                    <Button
                      className="w-full"
                      disabled={settle.isPending}
                      onClick={() => settle.mutate(o.id)}
                    >
                      {t("driver.settlements.markSettled")}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </section>
          )}

          {settled.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">{t("driver.settlements.historyTitle")}</h2>
              {settled.map((o) => (
                <Card key={o.id} className="border-ink/10">
                  <CardContent className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {restaurantName(o.restaurant_id)}
                      </p>
                      <p className="text-xs text-foreground/60">
                        {orderRef(o.id)} · {t("driver.settlements.settledOn")}{" "}
                        {formatDate(o.cash_settled_at!)}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                      {formatMoney(owed(o), o.currency)}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </section>
          )}
        </>
      )}
    </main>
  );
}
