import { OrderTimeLabel } from "@/components/dobra/OrderTimes";
import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/dobra/QueryStates";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { accountQueryOptions } from "@/lib/profile";
import { PendingApproval } from "@/components/dobra/PendingApproval";
import { StatusBadge } from "@/components/dobra/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { driverOrdersQuery, isFinished, orderRef, payout, restaurantsQuery } from "@/lib/dobra";

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
  const { t, formatMoney, formatDate } = useI18n();
  const { data: account } = useQuery(accountQueryOptions);
  const approved = account?.approvalStatus === "approved";
  const { data, isLoading, isError, refetch } = useQuery({ ...driverOrdersQuery, enabled: approved });
  const { data: restaurants = [] } = useQuery({ ...restaurantsQuery, enabled: approved });

  if (!approved) {
    return (
      <main className="mx-auto max-w-4xl space-y-6 px-5 py-6">
        <h1 className="text-2xl font-bold text-foreground">{t("driver.deliveries.title")}</h1>
        <PendingApproval what="driver" />
      </main>
    );
  }

  const mine = data?.mine ?? [];
  const active = mine.filter((o) => !isFinished(o.status));
  const past = mine.filter((o) => isFinished(o.status));
  const name = (id: string | null) =>
    !id
      ? t("package.orderLabel")
      : (restaurants.find((r) => r.id === id)?.name ?? t("driver.home.restaurantFallback"));

  const row = (o: (typeof mine)[number]) => (
    <Card key={o.id} className="border-ink/10">
      <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
        <div className="min-w-0">
          <p className="font-semibold text-foreground">{name(o.restaurant_id)}</p>
          <p className="text-xs text-foreground/60">
            {orderRef(o.id)} ·{" "}
            {o.delivered_at ? <OrderTimeLabel step="delivered" at={o.delivered_at} country={o.country} /> : <OrderTimeLabel step="placed" at={o.created_at} country={o.country} />} ·{" "}
            {formatMoney(payout(Number(o.total)), o.currency)}
          </p>
          {o.address ? <p className="text-xs text-foreground/60">{o.address}</p> : null}
        </div>
        <StatusBadge status={o.status} />
      </CardContent>
    </Card>
  );

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-5 py-6">
      <h1 className="text-2xl font-bold text-foreground">{t("driver.deliveries.title")}</h1>

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
