import { useMemo, useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, Minus, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { StoredImage } from "@/components/dobra/StoredImage";
import { ImageLightbox } from "@/components/dobra/ImageLightbox";
import { AppHeader } from "@/components/dobra/AppHeader";
import { CartBar } from "@/components/dobra/CartBar";
import { PhoneFrame } from "@/components/dobra/PhoneFrame";
import {
  restaurantQuery,
  restaurantReviewsQuery,
  type MenuItem,
} from "@/lib/dobra";
import { useI18n } from "@/lib/i18n";
import { addToCart, setQuantity, useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/restaurant/$restaurantId")({
  head: () => ({
    meta: [
      { title: "Restaurant menu — Dobra" },
      { name: "description", content: "Browse the menu and order your favourite dishes on Dobra." },
      { property: "og:title", content: "Restaurant menu — Dobra" },
      {
        property: "og:description",
        content: "Browse the menu and order your favourite dishes on Dobra.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RestaurantPage,
});

function RestaurantPage() {
  const { t, formatMoney } = useI18n();
  const { restaurantId } = useParams({ from: "/_authenticated/restaurant/$restaurantId" });
  const { data, isLoading } = useQuery(restaurantQuery(restaurantId));
  const { data: reviews = [] } = useQuery(restaurantReviewsQuery(restaurantId));
  const cart = useCart();
  const [preview, setPreview] = useState<{ value: string; alt: string } | null>(null);

  const restaurant = data?.restaurant;
  const items = data?.items ?? [];

  const grouped = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of items) {
      const key = item.category || "Mains";
      map.set(key, [...(map.get(key) ?? []), item]);
    }
    return [...map.entries()];
  }, [items]);

  const qtyOf = (id: string) =>
    cart.restaurantId === restaurantId ? (cart.lines.find((l) => l.itemId === id)?.quantity ?? 0) : 0;

  return (
    <PhoneFrame className="min-h-screen pb-28">
      <AppHeader subtitle={t("common.roles.customer")} />
      <main className="mx-auto max-w-4xl space-y-6 px-5 py-6">
        <Link
          to="/customer"
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden /> {t("common.actions.back")}
        </Link>

        {isLoading ? (
          <p className="text-sm text-foreground/60">{t("customer.restaurant.loadingMenu")}</p>
        ) : !restaurant ? (
          <p className="text-sm text-foreground/60">{t("customer.restaurant.unavailable")}</p>
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl bg-card shadow-soft">
              <button
                type="button"
                className="block w-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                aria-label={t("customer.restaurant.viewPhoto")}
                onClick={() =>
                  restaurant.logo_url &&
                  setPreview({ value: restaurant.logo_url, alt: restaurant.name })
                }
              >
                <StoredImage
                  value={restaurant.logo_url}
                  alt={`${restaurant.name} restaurant`}
                  width={1024}
                  height={640}
                  eager
                  className="h-44 w-full object-cover"
                />
              </button>
              <div className="space-y-2 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground">{restaurant.name}</h1>
                  <Badge variant={restaurant.is_open ? "default" : "secondary"}>
                    {restaurant.is_open ? t("customer.restaurant.open") : t("customer.restaurant.closed")}
                  </Badge>
                </div>
                <p className="text-sm text-foreground/60">
                  {restaurant.cuisine} · {restaurant.city}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-foreground/70">
                  <span className="inline-flex items-center gap-1">
                    <Star className="size-3.5 fill-accent text-accent" aria-hidden />
                    {restaurant.rating} {t("customer.restaurant.reviewsCount", { n: reviews.length })}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" aria-hidden /> {restaurant.eta_minutes} min
                  </span>
                  <span>{t("customer.restaurant.deliveryFee", { price: formatMoney(restaurant.delivery_fee) })}</span>
                  {restaurant.min_order > 0 ? <span>{t("customer.restaurant.minOrder", { price: formatMoney(restaurant.min_order) })}</span> : null}
                </div>
                {restaurant.tags?.length ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {restaurant.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            {grouped.map(([category, categoryItems]) => (
              <section key={category} className="space-y-3">
                <h2 className="text-lg font-bold text-foreground">{t(`common.categories.${category}`)}</h2>
                <div className="grid gap-3 @lg:grid-cols-2">
                  {categoryItems.map((item) => {
                    const qty = qtyOf(item.id);
                    return (
                      <Card key={item.id} className="overflow-hidden border-ink/10">
                        <div className="flex gap-3">
                          <button
                            type="button"
                            className="shrink-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            aria-label={t("customer.restaurant.viewPhoto")}
                            data-testid="dish-photo"
                            onClick={() =>
                              item.image_url &&
                              setPreview({ value: item.image_url, alt: item.name })
                            }
                          >
                            <StoredImage
                              value={item.image_url}
                              alt={item.name}
                              width={320}
                              height={320}
                              className="size-24 shrink-0 object-cover"
                            />
                          </button>
                          <CardContent className="flex min-w-0 flex-1 flex-col gap-2 px-3 py-3">
                            <div className="min-w-0">
                              <p className="line-clamp-2 font-semibold text-foreground">{item.name}</p>
                              {item.description ? (
                                <p className="line-clamp-2 text-xs text-foreground/60">
                                  {item.description}
                                </p>
                              ) : null}
                            </div>
                            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                              <p className="text-sm font-medium text-foreground/80">
                                {formatMoney(item.price, item.currency)}
                              </p>
                              {!item.available ? (
                                <span className="text-xs text-foreground/50">{t("customer.restaurant.soldOut")}</span>
                              ) : qty > 0 ? (
                                <div className="flex shrink-0 items-center gap-2">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    aria-label={t("customer.cart.removeOneAria", { name: item.name })}
                                    onClick={() => setQuantity(item.id, qty - 1)}
                                  >
                                    <Minus className="size-4" />
                                  </Button>
                                  <span className="w-4 text-center text-sm font-semibold">{qty}</span>
                                  <Button
                                    size="icon"
                                    aria-label={t("customer.cart.addOneAria", { name: item.name })}
                                    onClick={() => setQuantity(item.id, qty + 1)}
                                  >
                                    <Plus className="size-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  className="shrink-0"
                                  onClick={() => {
                                    addToCart(
                                      { id: restaurant.id, name: restaurant.name },
                                      {
                                        itemId: item.id,
                                        name: item.name,
                                        price: Number(item.price),
                                        currency: item.currency,
                                        image: item.image_url,
                                      },
                                    );
                                    toast.success(t("customer.restaurant.addedToast", { name: item.name }));
                                  }}
                                >
                                  {t("common.actions.add")}
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </section>
            ))}

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">{t("customer.restaurant.reviewsTitle")}</h2>
              {reviews.length === 0 ? (
                <p className="text-sm text-foreground/60">{t("customer.restaurant.noReviews")}</p>
              ) : (
                reviews.map((review) => (
                  <Card key={review.id} className="border-ink/10">
                    <CardContent className="space-y-1 py-4">
                      <div className="flex items-center gap-1 text-sm font-semibold">
                        {Array.from({ length: review.restaurant_rating }).map((_, i) => (
                          <Star key={i} className="size-4 fill-accent text-accent" aria-hidden />
                        ))}
                        <span className="sr-only">{t("customer.restaurant.outOf5", { n: review.restaurant_rating })}</span>
                      </div>
                      {review.comment ? (
                        <p className="text-sm text-foreground/70">{review.comment}</p>
                      ) : null}
                    </CardContent>
                  </Card>
                ))
              )}
            </section>
          </>
        )}
      </main>
      <CartBar />
      <ImageLightbox
        value={preview?.value ?? null}
        alt={preview?.alt ?? ""}
        onClose={() => setPreview(null)}
      />
    </PhoneFrame>
  );
}
