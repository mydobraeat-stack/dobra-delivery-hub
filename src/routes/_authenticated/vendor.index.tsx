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
import { money } from "@/lib/dobra";

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
  const { data: account } = useQuery(accountQueryOptions);
  const { restaurants, restaurantId, isLoading } = useVendorRestaurant();
  const { data: orders = [], isSuccess: ordersLoaded } = useVendorOrders(restaurantId);
  const [createOpen, setCreateOpen] = useState(false);

  const newOrderCount = orders.filter((o) => o.status === "pending").length;
  const seenRef = useRef<number | null>(null);
  useEffect(() => {
    if (!ordersLoaded) return;
    if (seenRef.current !== null && newOrderCount > seenRef.current) {
      toast.success("New order just came in!");
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
      <h1 className="text-2xl font-bold text-foreground">Orders</h1>

      {account?.approvalStatus !== "approved" ? (
        <Card className="border-ink/10 bg-sun/20">
          <CardContent className="py-4 text-sm text-foreground">
            Your account is still being reviewed. You can set up your restaurant and menu now —
            customers will see it as soon as you are approved.
          </CardContent>
        </Card>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-foreground/60">Loading your restaurant…</p>
      ) : restaurants.length === 0 ? (
        <Card className="border-ink/10">
          <CardContent className="space-y-3 py-6 text-center">
            <h2 className="text-lg font-bold text-foreground">Create your restaurant</h2>
            <p className="text-sm text-foreground/60">
              Add your name, city and logo to start taking orders.
            </p>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" aria-hidden /> Create restaurant
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <RestaurantSwitcher />

          <section className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Orders today" value={String(todayOrders.length)} />
            <StatCard label="Revenue today" value={money(todayRevenue)} />
            <StatCard label="Active now" value={String(activeOrders.length)} />
          </section>

          <OrdersSection
            title={`Active orders${newOrderCount ? ` · ${newOrderCount} new` : ""}`}
            orders={activeOrders}
            emptyText="No orders in progress."
            actionable
          />

          <OrdersSection
            title="Completed orders"
            orders={completedOrders}
            emptyText="Nothing completed yet."
          />

          <p className="text-sm text-foreground/60">
            Manage dishes on the{" "}
            <Link to="/vendor/menu" className="font-semibold underline">
              Menu
            </Link>{" "}
            tab and your details on the{" "}
            <Link to="/vendor/store" className="font-semibold underline">
              Store
            </Link>{" "}
            tab.
          </p>
        </>
      )}

      <RestaurantDialog open={createOpen} editing={null} onOpenChange={setCreateOpen} />
    </main>
  );
}
