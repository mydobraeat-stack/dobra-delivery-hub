import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Navigation } from "lucide-react";
import { toast } from "sonner";
import { accountQueryOptions } from "@/lib/profile";
import { AppHeader } from "@/components/dobra/AppHeader";
import { PendingApproval } from "@/components/dobra/PendingApproval";
import { StatusBadge } from "@/components/dobra/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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

export const Route = createFileRoute("/_authenticated/driver")({
  head: () => ({
    meta: [
      { title: "Driver Home — Dobra" },
      { name: "description", content: "See available deliveries and track your earnings." },
      { property: "og:title", content: "Driver Home — Dobra" },
      {
        property: "og:description",
        content: "See available deliveries and track your earnings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DriverHome,
});

function DriverHome() {
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
      <div className="min-h-screen bg-background">
        <AppHeader subtitle="Driver" />
        <main className="mx-auto max-w-4xl space-y-6 px-5 py-6">
          <h1 className="text-2xl font-bold text-foreground">Driver home</h1>
          <PendingApproval what="driver" />
        </main>
      </div>
    );
  }

  const mine = data?.mine ?? [];
  const available = online ? (data?.available ?? []) : [];
  const active = mine.filter((o) => !isFinished(o.status));
  const completed = mine.filter((o) => o.status === "delivered");
  const earnings = completed.reduce((sum, o) => sum + payout(Number(o.total)), 0);
  const today = new Date().toDateString();
  const todayEarnings = completed
    .filter((o) => new Date(o.created_at).toDateString() === today)
    .reduce((sum, o) => sum + payout(Number(o.total)), 0);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader subtitle="Driver" />
      <main className="mx-auto max-w-4xl space-y-6 px-5 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-foreground">Driver home</h1>
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

        <div className="grid gap-3 sm:grid-cols-4">
          <Stat label="Earnings today" value={money(todayEarnings)} />
          <Stat label="Total earnings" value={money(earnings)} />
          <Stat label="Deliveries done" value={String(completed.length)} />
          <Stat label="Active jobs" value={String(active.length)} />
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

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">My deliveries</h2>
          {active.length === 0 ? (
            <p className="text-sm text-foreground/60">Nothing assigned yet.</p>
          ) : (
            active.map((o) => (
              <Card key={o.id} className="border-ink/10">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{restaurantName(o.restaurant_id)}</p>
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
                </CardContent>
              </Card>
            ))
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">Earnings history</h2>
          {completed.length === 0 ? (
            <p className="text-sm text-foreground/60">No completed deliveries yet.</p>
          ) : (
            completed.map((o) => (
              <Card key={o.id} className="border-ink/10">
                <CardContent className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {restaurantName(o.restaurant_id)}
                    </p>
                    <p className="text-xs text-foreground/60">
                      {orderRef(o.id)} · {new Date(o.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {money(payout(Number(o.total)), o.currency)}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-ink/10">
      <CardContent className="py-4">
        <p className="text-xs text-foreground/60">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
