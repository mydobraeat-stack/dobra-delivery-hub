import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Heart, Search, Star } from "lucide-react";
import { StoredImage } from "@/components/dobra/StoredImage";
import { useI18n } from "@/lib/i18n";
import { CategoryGrid } from "@/components/dobra/CategoryGrid";
import { StatusBadge } from "@/components/dobra/StatusBadge";
import { accountQueryOptions } from "@/lib/profile";
import {
  allMenuItemsQuery,
  isFinished,
  myOrdersQuery,
  orderRef,
  restaurantsQuery,
  type Restaurant,
} from "@/lib/dobra";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { tapFeedback } from "@/lib/sound";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/customer/")({
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

const SORTS = [
  { id: "rating", labelKey: "customer.home.sortTopRated" },
  { id: "eta", labelKey: "customer.home.sortFastest" },
  { id: "fee", labelKey: "customer.home.sortCheapest" },
] as const;

const FAV_KEY = "dobra.favourites.v1";

function useFavourites() {
  const [favourites, setFavourites] = useState<string[]>([]);
  useEffect(() => {
    try {
      setFavourites(JSON.parse(window.localStorage.getItem(FAV_KEY) ?? "[]"));
    } catch {
      setFavourites([]);
    }
  }, []);
  const toggle = (id: string) =>
    setFavourites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      window.localStorage.setItem(FAV_KEY, JSON.stringify(next));
      return next;
    });
  return { favourites, toggle };
}

function CustomerHome() {
  const { t, formatMoney } = useI18n();
  const { data: account } = useQuery(accountQueryOptions);
  const { data: restaurants = [] } = useQuery(restaurantsQuery);
  const { data: dishes = [] } = useQuery(allMenuItemsQuery);
  const { data: orders = [] } = useQuery(myOrdersQuery);
  const { favourites, toggle } = useFavourites();

  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState<string | null>(null);
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("rating");
  const [openOnly, setOpenOnly] = useState(false);
  const [favOnly, setFavOnly] = useState(false);

  const query = search.trim().toLowerCase();
  const cuisines = useMemo(
    () => [...new Set(restaurants.map((r) => r.cuisine).filter(Boolean) as string[])].sort(),
    [restaurants],
  );

  const results = useMemo(() => {
    const dishMatchIds = new Set(
      dishes.filter((d) => d.name.toLowerCase().includes(query)).map((d) => d.restaurant_id),
    );
    let list: Restaurant[] = restaurants.filter((r) => {
      if (query) {
        const match =
          r.name.toLowerCase().includes(query) ||
          (r.cuisine ?? "").toLowerCase().includes(query) ||
          (r.city ?? "").toLowerCase().includes(query) ||
          dishMatchIds.has(r.id);
        if (!match) return false;
      }
      if (cuisine && r.cuisine !== cuisine) return false;
      if (openOnly && !r.is_open) return false;
      if (favOnly && !favourites.includes(r.id)) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "eta") return a.eta_minutes - b.eta_minutes;
      if (sort === "fee") return Number(a.delivery_fee) - Number(b.delivery_fee);
      return Number(b.rating) - Number(a.rating);
    });
    return list;
  }, [query, restaurants, dishes, cuisine, openOnly, favOnly, favourites, sort]);

  const byRestaurant = useMemo(
    () => Object.fromEntries(restaurants.map((r) => [r.id, r])),
    [restaurants],
  );
  const liveOrders = orders.filter((o) => !isFinished(o.status));

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-5 py-6">
      <h1 className="text-2xl font-bold text-foreground">
        {account?.fullName
          ? t("customer.home.greetingNamed", { name: account.fullName.split(" ")[0] ?? "" })
          : t("customer.home.greeting")}
      </h1>

      <div className="flex items-center gap-3 rounded-2xl bg-card px-4 py-2 shadow-soft">
        <Search className="size-5 shrink-0 text-foreground/40" aria-hidden />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("customer.home.searchPlaceholder")}
          className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          aria-label={t("customer.home.searchAriaLabel")}
        />
      </div>

      <CategoryGrid />


      {liveOrders.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">{t("customer.home.liveOrders")}</h2>
            <Button asChild size="sm" variant="ghost">
              <Link to="/customer/orders">{t("customer.home.seeAll")}</Link>
            </Button>
          </div>
          {liveOrders.slice(0, 2).map((o) => (
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
                      {orderRef(o.id)} · {formatMoney(o.total, o.currency)} · {t("customer.home.aboutMin", { n: o.eta_minutes })}
                    </p>
                  </div>
                  <StatusBadge status={o.status} />
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            className="transition-transform active:scale-95"
            variant={cuisine === null ? "default" : "outline"}
            onClick={() => {
              tapFeedback("tap");
              setCuisine(null);
            }}
          >
            {t("customer.home.all")}
          </Button>
          {cuisines.map((c) => (
            <Button
              key={c}
              size="sm"
              className="transition-transform active:scale-95"
              variant={cuisine === c ? "default" : "outline"}
              onClick={() => {
                tapFeedback(cuisine === c ? "off" : "pop");
                setCuisine(cuisine === c ? null : c);
              }}
            >
              {c}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {SORTS.map((s) => (
            <Button
              key={s.id}
              size="sm"
              className="transition-transform active:scale-95"
              variant={sort === s.id ? "secondary" : "ghost"}
              onClick={() => {
                tapFeedback("tap");
                setSort(s.id);
              }}
            >
              {t(s.labelKey)}
            </Button>
          ))}
          <Button
            size="sm"
            className="transition-transform active:scale-95"
            variant={openOnly ? "secondary" : "ghost"}
            onClick={() => {
              tapFeedback(openOnly ? "off" : "pop");
              setOpenOnly(!openOnly);
            }}
          >
            {t("customer.home.openNow")}
          </Button>
          <Button
            size="sm"
            className="transition-transform active:scale-95"
            variant={favOnly ? "secondary" : "ghost"}
            onClick={() => {
              tapFeedback(favOnly ? "off" : "pop");
              setFavOnly(!favOnly);
            }}
          >
            {t("customer.home.favourites")}
          </Button>
        </div>
      </section>

      <section id="restaurants" className="scroll-mt-4 space-y-3">
        <h2 className="text-lg font-bold text-foreground">
          {query ? t("customer.home.searchResults") : t("customer.home.nearYou")}
        </h2>
        {results.length === 0 ? (
          <p className="text-sm text-foreground/60">{t("customer.home.noMatch")}</p>
        ) : (
          <div className="grid gap-4 @sm:grid-cols-2">
            {results.map((r) => (
              <div key={r.id} className="relative">
                <button
                  type="button"
                  aria-label={
                    favourites.includes(r.id)
                      ? t("customer.home.removeFavouriteAria", { name: r.name })
                      : t("customer.home.addFavouriteAria", { name: r.name })
                  }
                  onClick={() => {
                    tapFeedback(favourites.includes(r.id) ? "off" : "pop", [10, 30, 10]);
                    toggle(r.id);
                  }}
                  className="absolute right-3 top-3 z-10 rounded-full bg-card/90 p-2 shadow-soft transition-transform hover:scale-110 active:scale-90"
                >
                  <Heart
                    className={cn(
                      "size-4 transition-transform",
                      favourites.includes(r.id)
                        ? "scale-110 fill-destructive text-destructive"
                        : "text-foreground/60",
                    )}
                  />
                </button>
                <Link
                  to="/restaurant/$restaurantId"
                  params={{ restaurantId: r.id }}
                  onClick={() => tapFeedback("tap")}
                  className="block rounded-xl transition-transform duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Card className="h-full overflow-hidden border-ink/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft">
                    <StoredImage
                      value={r.logo_url}
                      alt={`${r.name} restaurant`}
                      width={1024}
                      height={640}
                      className="h-32 w-full object-cover"
                    />
                    <CardContent className="space-y-1 py-4">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-foreground">{r.name}</p>
                        {!r.is_open ? <Badge variant="secondary">{t("customer.home.closed")}</Badge> : null}
                      </div>
                      <p className="text-sm text-foreground/60">
                        {r.cuisine} · {r.city}
                      </p>
                      <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-foreground/70">
                        <span className="inline-flex items-center gap-1">
                          <Star className="size-3.5 fill-accent text-accent" aria-hidden />
                          {r.rating}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3.5" aria-hidden /> {r.eta_minutes} min
                        </span>
                        <span>{t("customer.home.deliveryFee", { price: formatMoney(r.delivery_fee) })}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
