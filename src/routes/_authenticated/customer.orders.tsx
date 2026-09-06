import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { StatusBadge } from "@/components/dobra/StatusBadge";
import { isFinished, money, myOrdersQuery, orderRef, restaurantsQuery } from "@/lib/dobra";
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
  const { data: orders = [], isLoading } = useQuery(myOrdersQuery);
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
              {byRestaurant[o.restaurant_id]?.name ?? "Restaurant"}
            </p>
            <p className="text-xs text-foreground/60">
              {orderRef(o.id)} · {new Date(o.created_at).toLocaleString()} ·{" "}
              {money(o.total, o.currency)}
            </p>
          </div>
          <StatusBadge status={o.status} />
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-5 py-6">
      <h1 className="text-2xl font-bold text-foreground">Your orders</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">Live now</h2>
        {isLoading ? (
          <p className="text-sm text-foreground/60">Loading…</p>
        ) : live.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-foreground/60">No deliveries on the way.</p>
            <Button asChild size="sm">
              <Link to="/customer">Order something</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">{live.map(row)}</div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">Past orders</h2>
        {past.length === 0 ? (
          <p className="text-sm text-foreground/60">Your finished orders will appear here.</p>
        ) : (
          <div className="space-y-3">{past.map(row)}</div>
        )}
      </section>
    </main>
  );
}
