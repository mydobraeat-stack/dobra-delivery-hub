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
import { setRestaurantOpen, type Restaurant } from "@/lib/dobra";
import { useI18n, useT } from "@/lib/i18n";

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
  const t = useT();
  const { formatMoney } = useI18n();
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
      toast.success(isOpen ? t("vendor.store.openToast") : t("vendor.store.closedToast"));
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
        <h1 className="text-2xl font-bold text-foreground">{t("vendor.store.title")}</h1>
        <Button size="sm" variant="outline" onClick={() => setForm({ open: true, editing: null })}>
          <Plus className="size-4" aria-hidden /> {t("vendor.store.addRestaurant")}
        </Button>
      </div>

      <RestaurantSwitcher />

      {isLoading ? (
        <p className="text-sm text-foreground/60">{t("vendor.store.loading")}</p>
      ) : restaurants.length === 0 ? (
        <Card className="border-ink/10">
          <CardContent className="space-y-3 py-6 text-center">
            <h2 className="text-lg font-bold text-foreground">{t("vendor.store.createTitle")}</h2>
            <p className="text-sm text-foreground/60">{t("vendor.store.createHint")}</p>
            <Button onClick={() => setForm({ open: true, editing: null })}>
              <Plus className="size-4" aria-hidden /> {t("vendor.store.createButton")}
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
                    {restaurant.status === "approved"
                      ? t("common.approval.live")
                      : t("common.approval.pending")}
                  </Badge>
                </div>
                <p className="text-sm text-foreground/60">
                  {restaurant.cuisine} · {restaurant.city}, {restaurant.country}
                </p>
                <p className="pt-1 text-xs text-foreground/70">
                  {restaurant.eta_minutes} {t("vendor.store.minAbbrev")} ·{" "}
                  {t("vendor.store.delivery")} {formatMoney(restaurant.delivery_fee)} ·{" "}
                  {t("vendor.store.minimum")} {formatMoney(restaurant.min_order ?? 0)}
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
                    {restaurant.is_open ? t("vendor.store.open") : t("vendor.store.closed")}
                  </Label>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setForm({ open: true, editing: restaurant })}
                >
                  {t("vendor.store.editDetails")}
                </Button>
              </div>
            </CardContent>
          </Card>

          <section className="grid gap-3 sm:grid-cols-3">
            <StatCard label={t("vendor.store.deliveredAllTime")} value={String(delivered.length)} />
            <StatCard label={t("vendor.store.deliveredRevenue")} value={formatMoney(revenue)} />
            <StatCard label={t("vendor.store.averageOrder")} value={formatMoney(avgOrder)} />
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
