import { useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Navigation, Phone, Store } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/dobra/StatusBadge";
import { MapView, type MapPoint } from "@/components/dobra/MapView";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { addressPointQuery } from "@/lib/maps";
import {
  claimOrder,
  driverOrdersQuery,
  money,
  orderItemsQuery,
  orderRef,
  payout,
  restaurantsQuery,
  updateOrderStatus,
} from "@/lib/dobra";

export const Route = createFileRoute("/_authenticated/driver/delivery/$orderId")({
  head: () => ({
    meta: [
      { title: "Delivery details — Dobra for drivers" },
      {
        name: "description",
        content: "Review the order, accept it, then mark it picked up and delivered.",
      },
      { property: "og:title", content: "Delivery details — Dobra for drivers" },
      {
        property: "og:description",
        content: "Review the order, accept it, then mark it picked up and delivered.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DeliveryDetail,
});

function DeliveryDetail() {
  const { orderId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(driverOrdersQuery);
  const { data: restaurants = [] } = useQuery(restaurantsQuery);
  const { data: items = [] } = useQuery(orderItemsQuery(orderId));

  const order = useMemo(
    () => [...(data?.mine ?? []), ...(data?.available ?? [])].find((o) => o.id === orderId) ?? null,
    [data, orderId],
  );

  const { data: point } = useQuery(addressPointQuery(order?.address));
  const points = useMemo<MapPoint[]>(
    () => (point ? [{ ...point, label: order?.address ?? "Drop-off" }] : []),
    [point, order?.address],
  );

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["orders"] });

  const accept = useMutation({
    mutationFn: () => claimOrder(orderId),
    onSuccess: () => {
      toast.success("Delivery accepted — head to the restaurant.");
      invalidate();
    },
    onError: () => toast.error("Someone else accepted this delivery."),
  });

  const advance = useMutation({
    mutationFn: (status: string) => updateOrderStatus(orderId, status),
    onSuccess: (_d, status) => {
      invalidate();
      if (status === "delivered") {
        toast.success("Delivered. Nice work!");
        void navigate({ to: "/driver" });
      } else {
        toast.success("Marked as picked up.");
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return <main className="px-5 py-6 text-sm text-foreground/60">Loading delivery…</main>;
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-2xl space-y-4 px-5 py-6">
        <h1 className="text-xl font-bold text-foreground">Delivery not available</h1>
        <p className="text-sm text-foreground/70">
          This delivery is no longer open — another driver may have taken it.
        </p>
        <Button asChild>
          <Link to="/driver">Back to jobs</Link>
        </Button>
      </main>
    );
  }

  const restaurant = restaurants.find((r) => r.id === order.restaurant_id);
  const mine = Boolean(order.driver_id);

  return (
    <main className="mx-auto max-w-2xl space-y-5 px-5 pb-32 pt-4">
      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost" aria-label="Back" asChild>
          <Link to="/driver">
            <ArrowLeft className="size-5" aria-hidden />
          </Link>
        </Button>
        <h1 className="text-xl font-bold text-foreground">{orderRef(order.id)}</h1>
        <StatusBadge status={order.status} className="ml-auto" />
      </div>

      <Card className="border-ink/10">
        <CardContent className="space-y-3 py-4">
          <div className="flex items-start gap-3">
            <Store className="mt-0.5 size-5 shrink-0 text-foreground/60" aria-hidden />
            <div>
              <p className="font-semibold text-foreground">{restaurant?.name ?? "Restaurant"}</p>
              <p className="text-xs text-foreground/60">
                Pick-up{restaurant?.city ? ` · ${restaurant.city}` : ""}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-5 shrink-0 text-foreground/60" aria-hidden />
            <div>
              <p className="font-semibold text-foreground">{order.address ?? "Address on the way"}</p>
              <p className="text-xs text-foreground/60">Drop-off</p>
              {order.note ? (
                <p className="mt-1 text-xs text-foreground/70">Note: {order.note}</p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {order.address ? (
              <Button size="sm" variant="outline" asChild>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.address)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Navigation className="size-4" aria-hidden /> Navigate
                </a>
              </Button>
            ) : null}
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast("In-app calling is coming soon.")}
            >
              <Phone className="size-4" aria-hidden /> Contact customer
            </Button>
          </div>
        </CardContent>
      </Card>

      {points.length > 0 ? <MapView points={points} className="h-56 w-full" /> : null}

      <Card className="border-ink/10">
        <CardContent className="space-y-2 py-4">
          <p className="font-semibold text-foreground">Order</p>
          {items.length === 0 ? (
            <p className="text-sm text-foreground/60">No items to show.</p>
          ) : (
            items.map((it: any) => (
              <div key={it.id} className="flex justify-between text-sm text-foreground/80">
                <span>
                  {it.quantity} × {it.menu_items?.name ?? "Item"}
                </span>
                <span>{money(Number(it.price) * it.quantity, order.currency)}</span>
              </div>
            ))
          )}
          <div className="flex justify-between border-t border-ink/10 pt-2 text-sm">
            <span className="text-foreground/70">Order total</span>
            <span className="font-semibold text-foreground">
              {money(Number(order.total), order.currency)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground/70">Your payout</span>
            <span className="font-bold text-foreground">
              {money(payout(Number(order.total)), order.currency)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Action bar */}
      <div className="fixed inset-x-0 bottom-16 z-20 border-t border-ink/10 bg-card/95 p-4 backdrop-blur">
        <div className="mx-auto max-w-2xl">
          {!mine ? (
            <Button
              size="lg"
              className="h-12 w-full rounded-full text-base font-bold"
              disabled={accept.isPending}
              onClick={() => accept.mutate()}
            >
              Accept delivery · {money(payout(Number(order.total)), order.currency)}
            </Button>
          ) : order.status === "ready" ? (
            <Button
              size="lg"
              className="h-12 w-full rounded-full text-base font-bold"
              disabled={advance.isPending}
              onClick={() => advance.mutate("picked_up")}
            >
              Mark as picked up
            </Button>
          ) : order.status === "picked_up" ? (
            <Button
              size="lg"
              className="h-12 w-full rounded-full text-base font-bold"
              disabled={advance.isPending}
              onClick={() => advance.mutate("delivered")}
            >
              Mark as delivered
            </Button>
          ) : (
            <p className="text-center text-sm text-foreground/60">
              Waiting for the restaurant to finish this order.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
