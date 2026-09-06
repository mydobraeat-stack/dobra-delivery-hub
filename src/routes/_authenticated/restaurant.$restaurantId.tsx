import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Clock, Star } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/dobra/AppHeader";
import { money, placeOrder, restaurantQuery, type MenuItem } from "@/lib/dobra";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
  const { restaurantId } = useParams({ from: "/_authenticated/restaurant/$restaurantId" });
  const { data, isLoading } = useQuery(restaurantQuery(restaurantId));
  const queryClient = useQueryClient();

  const order = useMutation({
    mutationFn: (item: MenuItem) => placeOrder(item, data!.restaurant!),
    onSuccess: () => {
      toast.success("Order placed — the restaurant has been notified.");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const restaurant = data?.restaurant;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader subtitle="Customer" />
      <main className="mx-auto max-w-4xl space-y-6 px-5 py-6">
        <Link
          to="/customer"
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden /> Back
        </Link>

        {isLoading ? (
          <p className="text-sm text-foreground/60">Loading menu…</p>
        ) : !restaurant ? (
          <p className="text-sm text-foreground/60">This restaurant is no longer available.</p>
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl bg-card shadow-soft">
              {restaurant.logo_url ? (
                <img
                  src={restaurant.logo_url}
                  alt={`${restaurant.name} restaurant`}
                  width={1024}
                  height={640}
                  className="h-44 w-full object-cover"
                />
              ) : null}
              <div className="space-y-1 p-5">
                <h1 className="text-2xl font-bold text-foreground">{restaurant.name}</h1>
                <p className="text-sm text-foreground/60">
                  {restaurant.cuisine} · {restaurant.city}, {restaurant.country}
                </p>
                <div className="flex items-center gap-4 pt-1 text-xs text-foreground/70">
                  <span className="inline-flex items-center gap-1">
                    <Star className="size-3.5 fill-accent text-accent" aria-hidden />
                    {restaurant.rating}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" aria-hidden /> {restaurant.eta_minutes} min
                  </span>
                  <span>Delivery {money(restaurant.delivery_fee)}</span>
                </div>
              </div>
            </div>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Menu</h2>
              <div className="space-y-3">
                {data!.items.map((item) => (
                  <Card key={item.id} className="border-ink/10">
                    <CardContent className="flex items-center gap-4 p-4">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          loading="lazy"
                          width={640}
                          height={512}
                          className="size-20 shrink-0 rounded-xl object-cover"
                        />
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground">{item.name}</p>
                        <p className="text-sm text-foreground/70">
                          {money(item.price, item.currency)}
                        </p>
                        {!item.available ? (
                          <p className="text-xs text-destructive">Currently unavailable</p>
                        ) : null}
                      </div>
                      <Button
                        size="sm"
                        disabled={!item.available || order.isPending}
                        onClick={() => order.mutate(item)}
                      >
                        Order
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
