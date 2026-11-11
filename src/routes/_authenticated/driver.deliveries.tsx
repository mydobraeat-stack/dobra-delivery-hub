import { usePayout } from "@/lib/payout";
import { OrderTimeLabel } from "@/components/dobra/OrderTimes";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/dobra/QueryStates";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { accountQueryOptions } from "@/lib/profile";
import { PendingApproval } from "@/components/dobra/PendingApproval";
import { driverApproval } from "@/components/dobra/DriverGate";
import { newestDeliveriesFirst } from "@/lib/driver-home";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dobra/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { claimOrder, driverOrdersQuery, isFinished, myDriverQuery, orderRef, restaurantsQuery } from "@/lib/dobra";

export const Route = createFileRoute("/_authenticated/driver/deliveries")({
  head: () => ({
    meta: [
      { title: "My deliveries — Dobra for drivers" },
      { name: "description", content: "See your active and completed Dobra deliveries." },
      { property: "og:title", content: "My deliveries — Dobra for drivers" },
      { property: "og:description", content: "See your active and completed Dobra deliveries." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DriverDeliveries,
});

function DriverDeliveries() {
  const { t, formatMoney } = useI18n();
  const pay = usePayout();
  const { data: account } = useQuery(accountQueryOptions);
  const { data: driver } = useQuery(myDriverQuery);
  const approved = driverApproval(account?.approvalStatus, driver) === "approved";
  const { data, isLoading, isError, refetch } = useQuery({ ...driverOrdersQuery, enabled: approved });
  const { data: restaurants = [] } = useQuery({ ...restaurantsQuery, enabled: approved });
  const qc = useQueryClient();
  const claim = useMutation({
    mutationFn: claimOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: driverOrdersQuery.queryKey }),
    onError: () => toast.error(t("driver.deliveries.acceptFailed")),
  });

  if (!approved) {
    return (
      <main className="mx-auto max-w-4xl space-y-6 px-5 py-6">
        <h1 className="text-2xl font-bold text-foreground">{t("driver.deliveries.title")}</h1>
        <PendingApproval what="driver" />
      </main>
    );
  }

  const mine = data?.mine ?? [];
  const open = data?.available ?? [];
  const active = mine.filter((o) => !isFinished(o.status));
  const past = newestDeliveriesFirst(mine.filter((o) => isFinished(o.status)));
  const name = (id: string | null) =>
    !id
      ? t("package.orderLabel")
      : (restaurants.find((r) => r.id === id)?.name ?? t("driver.home.restaurantFallback"));

  const row = (o: (typeof mine)[number]) => (
    <Card key={o.id} className="border-ink/10">
      <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
        <div className="min-w-0">
          <p className="break-words font-semibold text-foreground">{o.kind === "package" ? (o.pickup_address ?? t("package.orderLabel")) : name(o.restaurant_id)}</p>
          <p className="text-xs text-foreground/60">
            {orderRef(o.id)} ·{" "}
            {o.delivered_at ? <OrderTimeLabel step="delivered" at={o.delivered_at} country={o.country} /> : o.cancelled_at ? <OrderTimeLabel step="cancelled" at={o.cancelled_at} country={o.country} /> : <OrderTimeLabel step="placed" at={o.created_at} country={o.country} />}
          </p>
          <p className="mt-1 text-sm font-semibold text-brand">{t("driver.delivery.yourPayout")}: {formatMoney(pay(o), o.currency)}</p>
          {o.address ? <p className="text-xs text-foreground/60">{o.address}</p> : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <StatusBadge status={o.status} />
          {!isFinished(o.status) ? <Button size="sm" variant="outline" asChild><Link to="/driver/delivery/$orderId" params={{ orderId: o.id }}>{t("driver.home.open")}</Link></Button> : null}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-5 py-6">
      <h1 className="text-2xl font-bold text-foreground">{t("driver.deliveries.title")}</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">{t("driver.deliveries.openJobs")}</h2>
        {isLoading ? (
          <ListSkeleton rows={2} />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : open.length === 0 ? (
          <EmptyState message={t("driver.deliveries.noOpenJobs")} />
        ) : (
          open.map((o) => (
            <Card key={o.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="break-words font-semibold text-foreground">{o.kind === "package" ? (o.pickup_address ?? t("package.orderLabel")) : name(o.restaurant_id)}</p>
                  {o.address ? <p className="break-words text-sm text-muted-foreground">{o.address}</p> : null}
                  <p className="mt-1 text-sm font-semibold text-brand">{t("driver.delivery.yourPayout")}: {formatMoney(pay(o), o.currency)}</p>
                </div>
                <Button size="sm" disabled={claim.isPending} onClick={() => claim.mutate(o.id)}>{t("driver.deliveries.accept")}</Button>
              </CardContent>
            </Card>
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">{t("driver.deliveries.active")}</h2>
        {isLoading ? (
          <ListSkeleton rows={2} />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : active.length === 0 ? (
          <EmptyState message={t("driver.deliveries.noneInProgress")} />
        ) : (
          active.map(row)
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">{t("driver.deliveries.past")}</h2>
        {isLoading ? (
          <ListSkeleton rows={2} />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : past.length === 0 ? (
          <EmptyState message={t("driver.deliveries.noneCompleted")} />
        ) : (
          past.map(row)
        )}
      </section>
    </main>
  );
}
