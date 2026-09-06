import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { accountQueryOptions } from "@/lib/profile";
import { AppHeader } from "@/components/dobra/AppHeader";
import { PendingApproval } from "@/components/dobra/PendingApproval";
import { StatusBadge } from "@/components/dobra/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  ORDER_FLOW,
  money,
  orderRef,
  restaurantQuery,
  toggleItemAvailability,
  updateOrderStatus,
  vendorOrdersQuery,
  vendorRestaurantsQuery,
} from "@/lib/dobra";

export const Route = createFileRoute("/_authenticated/vendor")({
  head: () => ({
    meta: [
      { title: "Vendor Dashboard — Dobra" },
      { name: "description", content: "Manage your restaurant's orders and menu on Dobra." },
      { property: "og:title", content: "Vendor Dashboard — Dobra" },
      {
        property: "og:description",
        content: "Manage your restaurant's orders and menu on Dobra.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VendorDashboard,
});

const NEXT_LABEL: Record<string, string> = {
  pending: "Accept order",
  accepted: "Start preparing",
  preparing: "Mark ready",
};

function VendorDashboard() {
  const { data: account } = useQuery(accountQueryOptions);
  const approved = account?.approvalStatus === "approved";
  const { data: restaurants = [] } = useQuery({ ...vendorRestaurantsQuery, enabled: approved });
  const [selected, setSelected] = useState<string | null>(null);
  const restaurantId = selected ?? restaurants[0]?.id;

  const { data: orders = [] } = useQuery(vendorOrdersQuery(restaurantId));
  const { data: detail } = useQuery({
    ...restaurantQuery(restaurantId ?? ""),
    enabled: Boolean(restaurantId),
  });
  const queryClient = useQueryClient();

  const advance = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateOrderStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: ({ id, available }: { id: string; available: boolean }) =>
      toggleItemAvailability(id, available),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["restaurant"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const activeOrders = orders.filter((o) => !["delivered", "cancelled"].includes(o.status));
  const revenue = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + Number(o.total), 0);

  if (!approved) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader subtitle="Vendor" />
        <main className="mx-auto max-w-4xl space-y-6 px-5 py-6">
          <h1 className="text-2xl font-bold text-foreground">Vendor dashboard</h1>
          <PendingApproval what="restaurant" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader subtitle="Vendor" />
      <main className="mx-auto max-w-4xl space-y-6 px-5 py-6">
        <h1 className="text-2xl font-bold text-foreground">Vendor dashboard</h1>

        {restaurants.length > 1 ? (
          <div className="flex flex-wrap gap-2">
            {restaurants.map((r) => (
              <Button
                key={r.id}
                size="sm"
                variant={r.id === restaurantId ? "default" : "outline"}
                onClick={() => setSelected(r.id)}
              >
                {r.name}
              </Button>
            ))}
          </div>
        ) : null}

        {detail?.restaurant ? (
          <Card className="overflow-hidden border-ink/10">
            <div className="flex items-center gap-4">
              {detail.restaurant.logo_url ? (
                <img
                  src={detail.restaurant.logo_url}
                  alt={detail.restaurant.name}
                  width={640}
                  height={512}
                  className="size-24 shrink-0 object-cover"
                />
              ) : null}
              <div className="py-3 pr-4">
                <p className="font-bold text-foreground">{detail.restaurant.name}</p>
                <p className="text-sm text-foreground/60">
                  {detail.restaurant.cuisine} · {detail.restaurant.city}
                </p>
                <p className="pt-1 text-xs text-foreground/70">
                  {activeOrders.length} active · {money(revenue)} delivered revenue
                </p>
              </div>
            </div>
          </Card>
        ) : null}

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">Your orders</h2>
          {orders.length === 0 ? (
            <p className="text-sm text-foreground/60">No orders yet.</p>
          ) : (
            orders.map((o) => {
              const next = ORDER_FLOW[ORDER_FLOW.indexOf(o.status as never) + 1];
              const label = NEXT_LABEL[o.status];
              return (
                <Card key={o.id} className="border-ink/10">
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                    <div>
                      <p className="font-semibold text-foreground">{orderRef(o.id)}</p>
                      <p className="text-xs text-foreground/60">
                        {money(o.total, o.currency)} ·{" "}
                        {new Date(o.created_at).toLocaleString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={o.status} />
                      {label && next ? (
                        <Button
                          size="sm"
                          disabled={advance.isPending}
                          onClick={() => advance.mutate({ id: o.id, status: next })}
                        >
                          {label}
                        </Button>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">Menu</h2>
          {(detail?.items ?? []).map((item) => (
            <Card key={item.id} className="border-ink/10">
              <CardContent className="flex items-center gap-4 p-4">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    loading="lazy"
                    width={640}
                    height={512}
                    className="size-16 shrink-0 rounded-xl object-cover"
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <p className="text-sm text-foreground/70">{money(item.price, item.currency)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-foreground/60">
                    {item.available ? "Available" : "Hidden"}
                  </span>
                  <Switch
                    checked={item.available}
                    aria-label={`Toggle availability for ${item.name}`}
                    onCheckedChange={(checked) =>
                      toggle.mutate({ id: item.id, available: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
