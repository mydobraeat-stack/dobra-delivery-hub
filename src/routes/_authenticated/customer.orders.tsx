import { useMemo } from "react";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/dobra/QueryStates";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { StatusBadge } from "@/components/dobra/StatusBadge";
import { ProfileBackLink } from "@/components/dobra/ProfileMenu";
import { isFinished, myOrdersQuery, orderRef, restaurantsQuery } from "@/lib/dobra";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/customer/orders")({
  head: () => ({
    meta: [
      { title: "Your orders — Dobra" },
      { name: "description", content: "Follow live deliveries and revisit past Dobra orders." },
      { property: "og:title", content: "Your orders — Dobra" },
      {
        property: "og:description",
        content: "Follow live deliveries and revisit past Dobra orders.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CustomerOrders,
});

function CustomerOrders() {
  const { t, formatMoney, formatDate } = useI18n();
  const { data: orders = [], isLoading, isError, refetch } = useQuery(myOrdersQuery);
  const { data: restaurants = [] } = useQuery(restaurantsQuery);
  const byRestaurant = useMemo(
    () => Object.fromEntries(restaurants.map((r) => [r.id, r])),
    [restaurants],
  );

  const live = orders.filter((o) => !isFinished(o.status));
  const past = orders.filter((o) => isFinished(o.status));

  const row = (o: (typeof orders)[number]) => (
    <Link key={o.id} to="/orders/$orderId" params={{ orderId: o.id }}>
      <Card className="border-ink/10 transition-shadow hover:shadow-soft">
        <CardContent className="flex items-center justify-between gap-3 py-4">
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">
              {o.restaurant_id
                ? (byRestaurant[o.restaurant_id]?.name ?? t("customer.home.restaurantFallback"))
                : t("package.orderLabel")}
            </p>
            <p className="text-xs text-foreground/60">
              {orderRef(o.id)} · {formatDate(o.created_at)} ·{" "}
              {formatMoney(o.total, o.currency)}
            </p>
          </div>
          <StatusBadge status={o.status} />
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-5 py-6">
      <ProfileBackLink label={t("common.actions.back")} />
      <h1 className="text-2xl font-bold text-foreground">{t("customer.orders.title")}</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">{t("customer.orders.liveNow")}</h2>
        {isLoading ? (
          <ListSkeleton />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : live.length === 0 ? (
          <EmptyState
            message={t("customer.orders.noLiveOrders")}
            action={
              <Button asChild size="sm">
                <Link to="/customer">{t("customer.orders.orderSomething")}</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">{live.map(row)}</div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">{t("customer.orders.pastOrders")}</h2>
        {isLoading ? (
          <ListSkeleton rows={2} />
        ) : isError ? null : past.length === 0 ? (
          <EmptyState message={t("customer.orders.noPastOrders")} />
        ) : (
          <div className="space-y-3">{past.map(row)}</div>
        )}
      </section>
    </main>
  );
}
