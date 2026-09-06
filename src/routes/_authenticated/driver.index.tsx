import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Navigation } from "lucide-react";
import { toast } from "sonner";
import { accountQueryOptions } from "@/lib/profile";
import { PendingApproval } from "@/components/dobra/PendingApproval";
import { StatusBadge } from "@/components/dobra/StatusBadge";
import { MapView, type MapPoint } from "@/components/dobra/MapView";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { addressPointQuery } from "@/lib/maps";
import {
  claimOrder,
  driverOrdersQuery,
  isFinished,
  money,
  myDriverQuery,
  orderRef,
  payout,
  restaurantsQuery,
  saveDriverLocation,
  setDriverStatus,
  updateOrderStatus,
} from "@/lib/dobra";

export const Route = createFileRoute("/_authenticated/driver/")({
  head: () => ({
    meta: [
      { title: "Delivery jobs — Dobra for drivers" },
      { name: "description", content: "Accept nearby deliveries and navigate to the drop-off." },
      { property: "og:title", content: "Delivery jobs — Dobra for drivers" },
      {
        property: "og:description",
        content: "Accept nearby deliveries and navigate to the drop-off.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DriverJobs,
});

function DriverJobs() {
  const { data: account } = useQuery(accountQueryOptions);
  const approved = account?.approvalStatus === "approved";
  const { data, isLoading } = useQuery({ ...driverOrdersQuery, enabled: approved });
  const { data: restaurants = [] } = useQuery({ ...restaurantsQuery, enabled: approved });
  const { data: driver } = useQuery({ ...myDriverQuery, enabled: approved });
  const queryClient = useQueryClient();
  const [online, setOnline] = useState(false);

  useEffect(() => {
    if (driver) setOnline(driver.status === "online");
  }, [driver]);

  const restaurantName = (id: string) => restaurants.find((r) => r.id === id)?.name ?? "Restaurant";
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["orders"] });

  const goOnline = useMutation({
    mutationFn: (next: boolean) => setDriverStatus(next ? "online" : "offline"),
    onSuccess: (_d, next) => {
      setOnline(next);
      queryClient.invalidateQueries({ queryKey: ["driver", "me"] });
      toast.success(next ? "You are online — jobs will appear here." : "You are offline.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const shareLocation = useMutation({
    mutationFn: () =>
      new Promise<void>((resolve, reject) => {
        if (!("geolocation" in navigator)) {
          reject(new Error("Location is not available on this device."));
          return;
        }
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              await saveDriverLocation(pos.coords.latitude, pos.coords.longitude);
              resolve();
            } catch (e) {
              reject(e as Error);
            }
          },
          () => reject(new Error("We could not read your location.")),
        );
      }),
    onSuccess: () => toast.success("Location shared with your customer."),
    onError: (e: Error) => toast.error(e.message),
  });

  const claim = useMutation({
    mutationFn: (id: string) => claimOrder(id),
    onSuccess: () => {
      toast.success("Delivery accepted.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const advance = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateOrderStatus(id, status),
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  if (!approved) {
    return (
      <main className="mx-auto max-w-4xl space-y-6 px-5 py-6">
        <h1 className="text-2xl font-bold text-foreground">Driver home</h1>
        <PendingApproval what="driver" />
      </main>
    );
  }

  const mine = data?.mine ?? [];
  const available = online ? (data?.available ?? []) : [];
  const active = mine.filter((o) => !isFinished(o.status));

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-5 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">Delivery jobs</h1>
        <div className="flex items-center gap-2">
          <Switch
            id="online"
            checked={online}
            disabled={goOnline.isPending}
            onCheckedChange={(v) => goOnline.mutate(v)}
          />
          <Label htmlFor="online">{online ? "Online" : "Offline"}</Label>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={shareLocation.isPending}
        onClick={() => shareLocation.mutate()}
      >
        <MapPin className="size-4" aria-hidden /> Share my live location
      </Button>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">My deliveries</h2>
        {active.length === 0 ? (
          <p className="text-sm text-foreground/60">Nothing assigned yet.</p>
        ) : (
          active.map((o) => (
            <Card key={o.id} className="border-ink/10">
              <CardContent className="space-y-3 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">
                      {restaurantName(o.restaurant_id)}
                    </p>
                    <p className="text-xs text-foreground/60">
                      {orderRef(o.id)} · {money(payout(Number(o.total)), o.currency)} payout
                    </p>
                    {o.address ? (
                      <p className="text-xs text-foreground/60">Drop-off: {o.address}</p>
                    ) : null}
                    {o.note ? <p className="text-xs text-foreground/60">Note: {o.note}</p> : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={o.status} />
                    {o.address ? (
                      <Button size="sm" variant="outline" asChild>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(o.address)}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Navigation className="size-4" aria-hidden /> Navigate
                        </a>
                      </Button>
                    ) : null}
                    {o.status === "ready" ? (
                      <Button
                        size="sm"
                        disabled={advance.isPending}
                        onClick={() => advance.mutate({ id: o.id, status: "picked_up" })}
                      >
                        Picked up
                      </Button>
                    ) : null}
                    {o.status === "picked_up" ? (
                      <Button
                        size="sm"
                        disabled={advance.isPending}
                        onClick={() => advance.mutate({ id: o.id, status: "delivered" })}
                      >
                        Delivered
                      </Button>
                    ) : null}
                  </div>
                </div>
                {o.address ? <DropOffMap address={o.address} /> : null}
              </CardContent>
            </Card>
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">Available deliveries</h2>
        {!online ? (
          <p className="text-sm text-foreground/60">Go online to see delivery jobs.</p>
        ) : isLoading ? (
          <p className="text-sm text-foreground/60">Loading…</p>
        ) : available.length === 0 ? (
          <p className="text-sm text-foreground/60">No deliveries waiting right now.</p>
        ) : (
          available.map((o) => (
            <Card key={o.id} className="border-ink/10">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-semibold text-foreground">{restaurantName(o.restaurant_id)}</p>
                  <p className="text-xs text-foreground/60">
                    {orderRef(o.id)} · {money(o.total, o.currency)} · you earn{" "}
                    {money(payout(Number(o.total)), o.currency)}
                  </p>
                  {o.address ? (
                    <p className="text-xs text-foreground/60">Drop-off: {o.address}</p>
                  ) : null}
                </div>
                <Button size="sm" disabled={claim.isPending} onClick={() => claim.mutate(o.id)}>
                  Accept
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </main>
  );
}

function DropOffMap({ address }: { address: string }) {
  const { data: point, isLoading, isError } = useQuery(addressPointQuery(address));
  const points = useMemo<MapPoint[]>(
    () => (point ? [{ ...point, label: address }] : []),
    [point, address],
  );

  if (isLoading) return <p className="text-xs text-foreground/60">Loading map…</p>;
  if (isError || points.length === 0) return null;
  return <MapView points={points} className="h-56 w-full" />;
}
