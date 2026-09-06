import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Crosshair,
  FileText,
  LifeBuoy,
  Layers,
  Menu,
  Navigation,
  Settings,
  ShieldCheck,
  Star,
  Trophy,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { accountQueryOptions } from "@/lib/profile";
import {
  ApplicationRejected,
  ApplicationUnderReview,
  driverApproval,
} from "@/components/dobra/DriverGate";
import { StatusBadge } from "@/components/dobra/StatusBadge";
import { MapView, type MapPoint } from "@/components/dobra/MapView";
import { DobraLogo } from "@/components/dobra/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  claimOrder,
  driverCurrency,
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
      { title: "Driver home — Dobra for drivers" },
      { name: "description", content: "Go online, see nearby deliveries and track your earnings." },
      { property: "og:title", content: "Driver home — Dobra for drivers" },
      {
        property: "og:description",
        content: "Go online, see nearby deliveries and track your earnings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DriverHome,
});

const SYMBOL: Record<string, string> = { PLN: "zł", XAF: "FCFA", EUR: "€" };

function DriverHome() {
  const { data: account } = useQuery(accountQueryOptions);
  const { data: driver } = useQuery(myDriverQuery);
  const approval = driverApproval(account?.approvalStatus, driver);
  const approved = approval === "approved";

  const { data } = useQuery({ ...driverOrdersQuery, enabled: approved });
  const { data: restaurants = [] } = useQuery({ ...restaurantsQuery, enabled: approved });
  const queryClient = useQueryClient();

  const [online, setOnline] = useState(false);
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (driver) setOnline(driver.status === "online");
  }, [driver]);

  // Read the device location once for the map marker.
  useEffect(() => {
    if (!approved || !("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => undefined,
    );
  }, [approved]);

  // While online, publish the live location every 45 seconds.
  useEffect(() => {
    if (!approved || !online || !("geolocation" in navigator)) return;
    const push = () =>
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          void saveDriverLocation(pos.coords.latitude, pos.coords.longitude).catch(() => undefined);
        },
        () => undefined,
      );
    push();
    const timer = window.setInterval(push, 45_000);
    return () => window.clearInterval(timer);
  }, [approved, online]);

  const toggle = useMutation({
    mutationFn: (next: boolean) => setDriverStatus(next ? "online" : "offline"),
    onSuccess: (_d, next) => {
      setOnline(next);
      queryClient.invalidateQueries({ queryKey: ["driver", "me"] });
      toast.success(next ? "You are online — jobs will appear here." : "You are offline.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["orders"] });

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

  const points = useMemo<MapPoint[]>(() => (me ? [{ ...me, label: "You" }] : []), [me]);

  if (approval === "rejected") return <ApplicationRejected />;
  if (approval === "pending") return <ApplicationUnderReview driver={driver} />;

  const mine = data?.mine ?? [];
  const available = online ? (data?.available ?? []) : [];
  const active = mine.filter((o) => !isFinished(o.status));
  const done = mine.filter((o) => o.status === "delivered");

  const currency = driverCurrency(driver?.country ?? account?.role ? driver?.country : null);
  const symbol = SYMBOL[currency] ?? currency;
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayEarnings = done
    .filter((o) => new Date(o.created_at) >= startOfDay)
    .reduce((sum, o) => sum + payout(Number(o.total)), 0);

  const acceptance = mine.length === 0 ? 100 : Math.round((done.length / mine.length) * 100);
  const restaurantName = (id: string) => restaurants.find((r) => r.id === id)?.name ?? "Restaurant";

  return (
    <div className="pb-4">
      {/* Map with floating controls */}
      <section className="relative h-[58vh] min-h-80 w-full overflow-hidden">
        {points.length > 0 ? (
          <MapView points={points} className="h-full w-full rounded-none" zoom={15} />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted text-sm text-foreground/60">
            Turn on location to see yourself on the map.
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                aria-label="Open menu"
                className="pointer-events-auto rounded-full bg-card shadow-md"
              >
                <Menu className="size-5" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle>
                  <DobraLogo className="text-3xl" />
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                <SideLink to="/profile" icon={User} label="Profile" />
                <SideLink to="/driver/documents" icon={FileText} label="Documents" />
                <SideLink to="/profile" icon={Settings} label="Settings" />
                <SideLink to="/driver/help" icon={LifeBuoy} label="Support" />
              </nav>
            </SheetContent>
          </Sheet>

          <div className="pointer-events-auto rounded-full bg-ink px-5 py-2 text-center shadow-md">
            <p className="text-base font-bold text-background">
              {symbol} {todayEarnings.toFixed(2)}
            </p>
            <p className="text-[10px] uppercase tracking-wide text-background/70">Today</p>
          </div>

          <Button
            size="icon"
            variant="secondary"
            aria-label="Safety centre"
            asChild
            className="pointer-events-auto rounded-full bg-card shadow-md"
          >
            <Link to="/driver/help">
              <ShieldCheck className="size-5" aria-hidden />
            </Link>
          </Button>
        </div>

        {/* Online toggle + flanking controls */}
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 p-4">
          <Button
            size="icon"
            variant="secondary"
            aria-label="Map layers"
            className="size-11 shrink-0 rounded-full bg-card shadow-md"
            onClick={() => toast("Map layers are coming soon.")}
          >
            <Layers className="size-5" aria-hidden />
          </Button>

          <Button
            size="lg"
            disabled={!approved || toggle.isPending}
            onClick={() => toggle.mutate(!online)}
            className={`h-12 flex-1 rounded-full text-base font-bold shadow-lg ${
              online
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-[hsl(145_63%_35%)] text-white hover:bg-[hsl(145_63%_30%)]"
            }`}
          >
            {online ? "Go Offline" : "Go Online"}
          </Button>

          <Button
            size="icon"
            variant="secondary"
            aria-label="Centre on my location"
            className="size-11 shrink-0 rounded-full bg-card shadow-md"
            onClick={() =>
              navigator.geolocation?.getCurrentPosition(
                (pos) => setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => toast.error("We could not read your location."),
              )
            }
          >
            <Crosshair className="size-5" aria-hidden />
          </Button>
        </div>
      </section>

      {/* Bottom sheet content */}
      <div className="mx-auto -mt-4 max-w-4xl space-y-5 rounded-t-3xl bg-background px-5 pb-6 pt-5">
        <div className="rounded-2xl bg-primary px-4 py-4">
          <p className="text-sm font-bold text-ink">Offers</p>
          <p className="text-sm text-ink/80">
            Complete 10 deliveries this weekend for a bonus. More promotions coming soon.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Trophy} label="Driver score" value="96%" />
          <StatCard icon={Star} label="Star rating" value="4.9" />
          <StatCard icon={Navigation} label="Acceptance rate" value={`${acceptance}%`} />
          <StatCard icon={Trophy} label="Total deliveries" value={String(done.length)} />
        </div>

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
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
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
          <h2 className="text-lg font-bold text-foreground">Available deliveries</h2>
          {!online ? (
            <p className="text-sm text-foreground/60">Go online to see delivery jobs.</p>
          ) : available.length === 0 ? (
            <p className="text-sm text-foreground/60">No deliveries waiting right now.</p>
          ) : (
            available.map((o) => (
              <Card key={o.id} className="border-ink/10">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div>
                    <p className="font-semibold text-foreground">{restaurantName(o.restaurant_id)}</p>
                    <p className="text-xs text-foreground/60">
                      {orderRef(o.id)} · you earn {money(payout(Number(o.total)), o.currency)}
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
      </div>
    </div>
  );
}

function SideLink({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: typeof User;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
    >
      <Icon className="size-4" aria-hidden />
      {label}
    </Link>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Star;
  label: string;
  value: string;
}) {
  return (
    <Card className="border-ink/10 bg-ink text-background">
      <CardContent className="space-y-1 py-4">
        <Icon className="size-4 text-primary" aria-hidden />
        <p className="text-xl font-bold">{value}</p>
        <p className="text-xs text-background/70">{label}</p>
      </CardContent>
    </Card>
  );
}
