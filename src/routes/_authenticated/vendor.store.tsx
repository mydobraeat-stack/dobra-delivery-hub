import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { StoredImage } from "@/components/dobra/StoredImage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  RestaurantDialog,
  RestaurantSwitcher,
  StatCard,
  useVendorOrders,
  useVendorRestaurant,
} from "@/components/dobra/vendor-parts";
import { money, setRestaurantOpen, type Restaurant } from "@/lib/dobra";

export const Route = createFileRoute("/_authenticated/vendor/store")({
  head: () => ({
    meta: [
      { title: "Store settings — Dobra for restaurants" },
      { name: "description", content: "Update your restaurant details, hours and sales figures." },
      { property: "og:title", content: "Store settings — Dobra for restaurants" },
      {
        property: "og:description",
        content: "Update your restaurant details, hours and sales figures.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VendorStorePage,
});

function VendorStorePage() {
  const { restaurants, restaurant, restaurantId, isLoading } = useVendorRestaurant();
  const { data: orders = [] } = useVendorOrders(restaurantId);
  const queryClient = useQueryClient();
  const [form, setForm] = useState<{ open: boolean; editing: Restaurant | null }>({
    open: false,
    editing: null,
  });

  const toggleOpen = useMutation({
    mutationFn: (isOpen: boolean) => setRestaurantOpen(restaurant!.id, isOpen),
    onSuccess: (_d, isOpen) => {
      toast.success(isOpen ? "You are open for orders." : "You are closed — new orders paused.");
      queryClient.invalidateQueries({ queryKey: ["restaurant"] });
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delivered = orders.filter((o) => o.status === "delivered");
  const revenue = delivered.reduce((sum, o) => sum + Number(o.total), 0);
  const avgOrder = delivered.length ? revenue / delivered.length : 0;

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-5 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">Your store</h1>
        <Button size="sm" variant="outline" onClick={() => setForm({ open: true, editing: null })}>
          <Plus className="size-4" aria-hidden /> Add restaurant
        </Button>
      </div>

      <RestaurantSwitcher />

      {isLoading ? (
        <p className="text-sm text-foreground/60">Loading…</p>
      ) : restaurants.length === 0 ? (
        <Card className="border-ink/10">
          <CardContent className="space-y-3 py-6 text-center">
            <h2 className="text-lg font-bold text-foreground">Create your restaurant</h2>
            <p className="text-sm text-foreground/60">
              Add your name, city and logo to start taking orders.
            </p>
            <Button onClick={() => setForm({ open: true, editing: null })}>
              <Plus className="size-4" aria-hidden /> Create restaurant
            </Button>
          </CardContent>
        </Card>
      ) : restaurant ? (
        <>
          <Card className="overflow-hidden border-ink/10">
            <CardContent className="flex flex-wrap items-center gap-4 p-4">
              <StoredImage
                value={restaurant.logo_url}
                alt={restaurant.name}
                className="size-24 shrink-0 rounded-xl object-cover"
                width={640}
                height={512}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-foreground">{restaurant.name}</p>
                  <Badge variant={restaurant.status === "approved" ? "default" : "secondary"}>
                    {restaurant.status === "approved" ? "Live" : "Pending approval"}
                  </Badge>
                </div>
                <p className="text-sm text-foreground/60">
                  {restaurant.cuisine} · {restaurant.city}, {restaurant.country}
                </p>
                <p className="pt-1 text-xs text-foreground/70">
                  {restaurant.eta_minutes} min · delivery {money(restaurant.delivery_fee)} · minimum{" "}
                  {money(restaurant.min_order ?? 0)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="open-toggle"
                    checked={restaurant.is_open}
                    disabled={toggleOpen.isPending}
                    onCheckedChange={(v) => toggleOpen.mutate(v)}
                  />
                  <Label htmlFor="open-toggle" className="text-xs">
                    {restaurant.is_open ? "Open" : "Closed"}
                  </Label>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setForm({ open: true, editing: restaurant })}
                >
                  Edit details
                </Button>
              </div>
            </CardContent>
          </Card>

          <section className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Delivered all time" value={String(delivered.length)} />
            <StatCard label="Delivered revenue" value={money(revenue)} />
            <StatCard label="Average order" value={money(avgOrder)} />
          </section>
        </>
      ) : null}

      <RestaurantDialog
        open={form.open}
        editing={form.editing}
        onOpenChange={(open) => setForm((s) => ({ ...s, open }))}
      />
    </main>
  );
}
