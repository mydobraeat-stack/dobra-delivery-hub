import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Search, Star } from "lucide-react";
import { AppHeader } from "@/components/dobra/AppHeader";
import { StatusBadge } from "@/components/dobra/StatusBadge";
import { accountQueryOptions } from "@/lib/profile";
import {
  allMenuItemsQuery,
  money,
  myOrdersQuery,
  orderRef,
  restaurantsQuery,
} from "@/lib/dobra";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/customer")({
  head: () => ({
    meta: [
      { title: "Your Dobra — Restaurants near you" },
      { name: "description", content: "Browse restaurants near you and order with Dobra." },
      { property: "og:title", content: "Your Dobra" },
      { property: "og:description", content: "Browse restaurants near you and order with Dobra." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CustomerHome,
});

function CustomerHome() {
  const { data: account } = useQuery(accountQueryOptions);
  const { data: restaurants = [] } = useQuery(restaurantsQuery);
  const { data: dishes = [] } = useQuery(allMenuItemsQuery);
  const { data: orders = [] } = useQuery(myOrdersQuery);
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();

  const results = useMemo(() => {
    if (!query) return restaurants;
    const dishMatchIds = new Set(
      dishes.filter((d) => d.name.toLowerCase().includes(query)).map((d) => d.restaurant_id),
    );
    return restaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        (r.cuisine ?? "").toLowerCase().includes(query) ||
        (r.city ?? "").toLowerCase().includes(query) ||
        dishMatchIds.has(r.id),
    );
  }, [query, restaurants, dishes]);

  const byRestaurant = useMemo(
    () => Object.fromEntries(restaurants.map((r) => [r.id, r])),
    [restaurants],
  );

  return (
    <div className="min-h-screen bg-background">
      <AppHeader subtitle="Customer" />
      <main className="mx-auto max-w-4xl space-y-8 px-5 py-6">
        <h1 className="text-2xl font-bold text-foreground">
          Hungry{account?.fullName ? `, ${account.fullName.split(" ")[0]}` : ""}?
        </h1>

        <div className="flex items-center gap-3 rounded-2xl bg-card px-4 py-2 shadow-soft">
          <Search className="size-5 shrink-0 text-foreground/40" aria-hidden />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search restaurants or dishes"
            className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            aria-label="Search restaurants or dishes"
          />
        </div>

        {orders.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">Your orders</h2>
            <div className="space-y-2">
              {orders.slice(0, 4).map((o) => (
                <Card key={o.id} className="border-ink/10">
                  <CardContent className="flex items-center justify-between gap-3 py-4">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">
                        {byRestaurant[o.restaurant_id]?.name ?? "Restaurant"}
                      </p>
                      <p className="text-xs text-foreground/60">
                        {orderRef(o.id)} · {money(o.total, o.currency)}
                      </p>
                    </div>
                    <StatusBadge status={o.status} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ) : null}

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">
            {query ? "Search results" : "Restaurants near you"}
          </h2>
          {results.length === 0 ? (
            <p className="text-sm text-foreground/60">Nothing matches “{search}”.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {results.map((r) => (
                <Link
                  key={r.id}
                  to="/restaurant/$restaurantId"
                  params={{ restaurantId: r.id }}
                  className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Card className="h-full overflow-hidden border-ink/10 transition-shadow hover:shadow-soft">
                    {r.logo_url ? (
                      <img
                        src={r.logo_url}
                        alt={`${r.name} restaurant`}
                        loading="lazy"
                        width={1024}
                        height={640}
                        className="h-32 w-full object-cover"
                      />
                    ) : (
                      <div className="h-32 bg-muted" />
                    )}
                    <CardContent className="space-y-1 py-4">
                      <p className="font-bold text-foreground">{r.name}</p>
                      <p className="text-sm text-foreground/60">
                        {r.cuisine} · {r.city}
                      </p>
                      <div className="flex items-center gap-4 pt-1 text-xs text-foreground/70">
                        <span className="inline-flex items-center gap-1">
                          <Star className="size-3.5 fill-accent text-accent" aria-hidden />
                          {r.rating}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3.5" aria-hidden /> {r.eta_minutes} min
                        </span>
                        <span>Delivery {money(r.delivery_fee)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
