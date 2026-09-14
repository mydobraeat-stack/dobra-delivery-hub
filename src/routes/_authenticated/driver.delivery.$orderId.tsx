import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Navigation, Phone, Store } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/dobra/StatusBadge";
import { MapView, type MapPoint } from "@/components/dobra/MapView";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { addressPointQuery, routeQuery } from "@/lib/maps";
import {
  claimOrder,
  driverOrdersQuery,
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
  const { t, formatMoney } = useI18n();
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

  const restaurantForOrder = restaurants.find((r) => r.id === order?.restaurant_id) ?? null;

  // Driver's own position, for the route start.
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => undefined,
    );
  }, []);

  const savedDrop =
    order && order.dest_lat != null && order.dest_lng != null
      ? { lat: order.dest_lat, lng: order.dest_lng }
      : null;
  const { data: geocodedDrop } = useQuery({
    ...addressPointQuery(order?.address),
    enabled: !savedDrop && Boolean(order?.address),
  });
  const dropOff = savedDrop ?? geocodedDrop ?? null;

  const pickupSearch = restaurantForOrder
    ? [restaurantForOrder.name, restaurantForOrder.city, restaurantForOrder.country]
        .filter(Boolean)
        .join(", ")
    : null;
  const { data: pickup } = useQuery(addressPointQuery(pickupSearch));

  // Leg 1 runs to the restaurant; leg 2 starts once the food is picked up.
  const onCustomerLeg = order?.status === "picked_up" || order?.status === "delivered";

  const { data: route } = useQuery(routeQuery(onCustomerLeg ? [me, dropOff] : [me, pickup]));

  const points = useMemo<MapPoint[]>(() => {
    const list: MapPoint[] = [];
    if (me) list.push({ ...me, label: "You", kind: "driver" });
    if (onCustomerLeg) {
      if (dropOff) list.push({ ...dropOff, label: order?.address ?? "Drop-off", kind: "dropoff" });
    } else if (pickup) {
      list.push({ ...pickup, label: restaurantForOrder?.name ?? "Pickup", kind: "pickup" });
    }
    return list;
  }, [me, pickup, dropOff, onCustomerLeg, order?.address, restaurantForOrder?.name]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["orders"] });

  const accept = useMutation({
    mutationFn: () => claimOrder(orderId),
    onSuccess: () => {
      toast.success(t("driver.delivery.acceptedToast"));
      invalidate();
    },
    onError: () => toast.error(t("driver.delivery.acceptedError")),
  });

  const advance = useMutation({
    mutationFn: (status: string) => updateOrderStatus(orderId, status),
    onSuccess: (_d, status) => {
      invalidate();
      if (status === "delivered") {
        toast.success(t("driver.delivery.deliveredToast"));
        void navigate({ to: "/driver" });
      } else {
        toast.success(t("driver.delivery.pickedUpToast"));
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return <main className="px-5 py-6 text-sm text-foreground/60">{t("driver.delivery.loading")}</main>;
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-2xl space-y-4 px-5 py-6">
        <h1 className="text-xl font-bold text-foreground">{t("driver.delivery.notAvailableTitle")}</h1>
        <p className="text-sm text-foreground/70">{t("driver.delivery.notAvailableBody")}</p>
        <Button asChild>
          <Link to="/driver">{t("driver.delivery.backToJobs")}</Link>
        </Button>
      </main>
    );
  }

  const restaurant = restaurants.find((r) => r.id === order.restaurant_id);
  const mine = Boolean(order.driver_id);

  return (
    <main className="mx-auto max-w-2xl space-y-5 px-5 pb-32 pt-4">
      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost" aria-label={t("common.actions.back")} asChild>
          <Link to="/driver">
            <ArrowLeft className="size-5" aria-hidden />
          </Link>
        </Button>
        <h1 className="text-xl font-bold text-foreground">{orderRef(order.id)}</h1>
        <StatusBadge status={order.status} className="ml-auto" />
      </div>

      {mine ? (
        <p
          data-testid="leg-banner"
          className="rounded-full bg-secondary px-4 py-2 text-center text-sm font-bold text-secondary-foreground"
        >
          {onCustomerLeg ? t("driver.delivery.legCustomer") : t("driver.delivery.legRestaurant")}
        </p>
      ) : null}

      {/* Current stop */}
      <Card className="border-2 border-primary/40">
        <CardContent className="space-y-3 py-4">
          {onCustomerLeg ? (
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{order.address ?? t("driver.delivery.addressFallback")}</p>
                <p className="text-xs text-foreground/60">{t("driver.delivery.dropoff")}</p>
                {order.note ? (
                  <p className="mt-1 text-xs text-foreground/70">{t("driver.delivery.note", { note: order.note })}</p>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <Store className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <div className="min-w-0">
                <p className="font-semibold text-foreground">
                  {restaurant?.name ?? t("driver.delivery.restaurantFallback")}
                </p>
                <p className="text-xs text-foreground/60">
                  {t("driver.delivery.pickup", { city: restaurant?.city ? ` · ${restaurant.city}` : "" })}
                </p>
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            {(onCustomerLeg ? order.address : pickupSearch) ? (
              <Button size="sm" variant="outline" asChild>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    (onCustomerLeg ? order.address : pickupSearch) ?? "",
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Navigation className="size-4" aria-hidden />{" "}
                  {onCustomerLeg
                    ? t("driver.delivery.navigateToCustomer")
                    : t("driver.delivery.navigateToRestaurant")}
                </a>
              </Button>
            ) : null}
            {onCustomerLeg ? (
              <Button size="sm" variant="outline" onClick={() => toast(t("driver.delivery.contactToast"))}>
                <Phone className="size-4" aria-hidden /> {t("driver.delivery.contactCustomer")}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {points.length > 0 ? (
        <div className="space-y-2">
          <MapView points={points} path={route?.polyline ?? null} className="h-56 w-full" />
          {route ? (
            <p className="text-xs text-foreground/60">
              {t("driver.delivery.routeSummary", {
                km: (route.distanceMeters / 1000).toFixed(1),
                minutes: String(route.durationMinutes),
              })}
            </p>
          ) : null}
        </div>
      ) : null}

      {/* The other stop, for reference */}
      <Card className="border-ink/10 bg-muted/40">
        <CardContent className="flex items-start gap-3 py-3">
          {onCustomerLeg ? (
            <>
              <Store className="mt-0.5 size-4 shrink-0 text-foreground/50" aria-hidden />
              <div className="min-w-0 text-xs text-foreground/60">
                <p className="font-medium text-foreground/80">
                  {restaurant?.name ?? t("driver.delivery.restaurantFallback")}
                </p>
                <p>{t("driver.delivery.pickup", { city: restaurant?.city ? ` · ${restaurant.city}` : "" })}</p>
              </div>
            </>
          ) : (
            <>
              <MapPin className="mt-0.5 size-4 shrink-0 text-foreground/50" aria-hidden />
              <div className="min-w-0 text-xs text-foreground/60">
                <p className="font-medium text-foreground/80">
                  {order.address ?? t("driver.delivery.addressFallback")}
                </p>
                <p>{t("driver.delivery.dropoff")}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>


      <Card className="border-ink/10">
        <CardContent className="space-y-2 py-4">
          <p className="font-semibold text-foreground">{t("driver.delivery.order")}</p>
          {items.length === 0 ? (
            <p className="text-sm text-foreground/60">{t("driver.delivery.noItems")}</p>
          ) : (
            items.map((it: any) => (
              <div key={it.id} className="flex justify-between text-sm text-foreground/80">
                <span>
                  {it.quantity} × {it.menu_items?.name ?? "Item"}
                </span>
                <span>{formatMoney(Number(it.price) * it.quantity, order.currency)}</span>
              </div>
            ))
          )}
          <div className="flex justify-between border-t border-ink/10 pt-2 text-sm">
            <span className="text-foreground/70">{t("driver.delivery.orderTotal")}</span>
            <span className="font-semibold text-foreground">
              {formatMoney(Number(order.total), order.currency)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground/70">{t("driver.delivery.yourPayout")}</span>
            <span className="font-bold text-foreground">
              {formatMoney(payout(Number(order.total)), order.currency)}
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
              {t("driver.delivery.acceptDelivery", { amount: formatMoney(payout(Number(order.total)), order.currency) })}
            </Button>
          ) : order.status === "ready" ? (
            <Button
              size="lg"
              className="h-12 w-full rounded-full text-base font-bold"
              disabled={advance.isPending}
              onClick={() => advance.mutate("picked_up")}
            >
              {t("driver.delivery.markPickedUp")}
            </Button>
          ) : order.status === "picked_up" ? (
            <Button
              size="lg"
              className="h-12 w-full rounded-full text-base font-bold"
              disabled={advance.isPending}
              onClick={() => advance.mutate("delivered")}
            >
              {t("driver.delivery.markDelivered")}
            </Button>
          ) : (
            <p className="text-center text-sm text-foreground/60">
              {t("driver.delivery.waitingRestaurant")}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
