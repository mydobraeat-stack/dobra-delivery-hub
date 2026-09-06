import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { accountQueryOptions } from "@/lib/profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  OrdersSection,
  RestaurantDialog,
  RestaurantSwitcher,
  StatCard,
  useVendorOrders,
  useVendorRestaurant,
} from "@/components/dobra/vendor-parts";
import { useI18n, useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/vendor/")({
  head: () => ({
    meta: [
      { title: "Orders — Dobra for restaurants" },
      { name: "description", content: "Accept, prepare and track your restaurant's orders." },
      { property: "og:title", content: "Orders — Dobra for restaurants" },
      {
        property: "og:description",
        content: "Accept, prepare and track your restaurant's orders.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VendorOrdersPage,
});

function VendorOrdersPage() {
  const t = useT();
  const { formatMoney } = useI18n();
  const { data: account } = useQuery(accountQueryOptions);
  const { restaurants, restaurantId, isLoading } = useVendorRestaurant();
  const { data: orders = [], isSuccess: ordersLoaded } = useVendorOrders(restaurantId);
  const [createOpen, setCreateOpen] = useState(false);

  const newOrderCount = orders.filter((o) => o.status === "pending").length;
  const seenRef = useRef<number | null>(null);
  useEffect(() => {
    if (!ordersLoaded) return;
    if (seenRef.current !== null && newOrderCount > seenRef.current) {
      toast.success(t("vendor.orders.newOrderToast"));
    }
    seenRef.current = newOrderCount;
  }, [newOrderCount, ordersLoaded]);

  const today = new Date().toDateString();
  const delivered = orders.filter((o) => o.status === "delivered");
  const todayOrders = orders.filter((o) => new Date(o.created_at).toDateString() === today);
  const todayRevenue = todayOrders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + Number(o.total), 0);
  const activeOrders = orders.filter((o) => !["delivered", "cancelled"].includes(o.status));
  const completedOrders = orders.filter((o) => ["delivered", "cancelled"].includes(o.status));

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-5 py-6">
      <h1 className="text-2xl font-bold text-foreground">{t("vendor.orders.title")}</h1>

      {account?.approvalStatus !== "approved" ? (
        <Card className="border-ink/10 bg-sun/20">
          <CardContent className="py-4 text-sm text-foreground">
            {t("vendor.orders.pendingApproval")}
          </CardContent>
        </Card>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-foreground/60">{t("vendor.orders.loadingRestaurant")}</p>
      ) : restaurants.length === 0 ? (
        <Card className="border-ink/10">
          <CardContent className="space-y-3 py-6 text-center">
            <h2 className="text-lg font-bold text-foreground">{t("vendor.orders.createTitle")}</h2>
            <p className="text-sm text-foreground/60">{t("vendor.orders.createHint")}</p>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" aria-hidden /> {t("vendor.orders.createButton")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <RestaurantSwitcher />

          <section className="grid gap-3 sm:grid-cols-3">
            <StatCard label={t("vendor.orders.ordersToday")} value={String(todayOrders.length)} />
            <StatCard label={t("vendor.orders.revenueToday")} value={formatMoney(todayRevenue)} />
            <StatCard label={t("vendor.orders.activeNow")} value={String(activeOrders.length)} />
          </section>

          <OrdersSection
            title={
              newOrderCount
                ? t("vendor.orders.activeOrdersNew", { n: newOrderCount })
                : t("vendor.orders.activeOrders")
            }
            orders={activeOrders}
            emptyText={t("vendor.orders.noActiveOrders")}
            actionable
          />

          <OrdersSection
            title={t("vendor.orders.completedOrders")}
            orders={completedOrders}
            emptyText={t("vendor.orders.noCompletedOrders")}
          />

          <p className="text-sm text-foreground/60">
            {t("vendor.orders.manageHintPre")}
            <Link to="/vendor/menu" className="font-semibold underline">
              {t("common.tabs.menu")}
            </Link>
            {t("vendor.orders.manageHintMid")}
            <Link to="/vendor/store" className="font-semibold underline">
              {t("common.tabs.store")}
            </Link>
            {t("vendor.orders.manageHintPost")}
          </p>
        </>
      )}

      <RestaurantDialog open={createOpen} editing={null} onOpenChange={setCreateOpen} />
    </main>
  );
}
