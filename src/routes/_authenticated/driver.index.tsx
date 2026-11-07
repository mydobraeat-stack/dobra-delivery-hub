import { usePayout } from "@/lib/payout";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { useI18n } from "@/lib/i18n";
import { accountQueryOptions } from "@/lib/profile";
import { myProfileQuery } from "@/lib/my-profile";
import { DriverPhoneCard } from "@/components/dobra/DriverPhoneCard";
import { driverApproval } from "@/components/dobra/DriverGate";
import { driverDocsQuery, requiredDocsFor } from "@/lib/driver-docs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DriverSearchingStrip } from "@/components/dobra/DriverSearchingStrip";
import { DriverOfflineSheet } from "@/components/dobra/DriverOfflineSheet";
import { driverAvailabilityAction, offlineConfirmationResult, isDriverWaiting } from "@/lib/driver-home";
import { tapFeedback } from "@/lib/sound";
import { MapView, type MapPoint } from "@/components/dobra/MapView";
import { NewDeliveryAlert } from "@/components/dobra/NewDeliveryAlert";
import { DobraLogo } from "@/components/dobra/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  driverCurrency,
  driverOrdersQuery,
  isFinished,
  myDriverQuery,
  restaurantsQuery,
  saveDriverLocation,
  setDriverStatus,
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

function DriverHome() {
  const { t, formatMoney } = useI18n();
  const pay = usePayout();
  const { data: account } = useQuery(accountQueryOptions);
  const { data: driver } = useQuery(myDriverQuery);
  const approval = driverApproval(account?.approvalStatus, driver);
  const approved = approval === "approved";

  const { data, isSuccess: ordersReady } = useQuery({ ...driverOrdersQuery, enabled: approved });
  const { data: restaurants = [] } = useQuery({ ...restaurantsQuery, enabled: approved });
  const queryClient = useQueryClient();

  const [online, setOnline] = useState(false);
  const [offlineSheet, setOfflineSheet] = useState(false);
  const availabilitySaving = useRef(false);
  const [offerVisible, setOfferVisible] = useState(false);
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null);
  const { data: docs = [] } = useQuery(driverDocsQuery);
  const [gate, setGate] = useState<null | "start" | "finish" | "rejected" | "phone">(null);
  const { data: myProfile } = useQuery(myProfileQuery);
  const hasPhone = Boolean(myProfile?.phone);

  const missingDocs = requiredDocsFor(driver?.vehicle_type).filter(
    (d) => !docs.some((x) => x.doc_type === d.id),
  );

  function handleToggle() {
    if (approved) {
      if (!online && !hasPhone) {
        setGate("phone");
        return;
      }
      if (driverAvailabilityAction(online) === "confirm-offline") setOfflineSheet(true);
      else toggle.mutate(true);
      return;
    }
    if (approval === "rejected") setGate("rejected");
    else if (docs.length === 0) setGate("start");
    else setGate("finish");
  }

  useEffect(() => {
    if (driver && !availabilitySaving.current) setOnline(driver.status === "available" || driver.status === "busy");
  }, [driver?.status]);

  // Read the device location once for the map marker.
  useEffect(() => {
    if (!approved || !("geolocation" in navigator)) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [approved]);

  // While online, publish the live location every 45 seconds.
  useEffect(() => {
    if (!approved || !online || !("geolocation" in navigator)) return;
    // Live GPS: publish at most every 10 seconds while online.
    let last = 0;
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        const now = Date.now();
        if (now - last < 10_000) return;
        last = now;
        void saveDriverLocation(pos.coords.latitude, pos.coords.longitude).catch(() => undefined);
      },
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [approved, online]);

  const toggle = useMutation({
    mutationFn: (next: boolean) => setDriverStatus(next ? "available" : "offline"),
    onMutate: async (next: boolean) => {
      availabilitySaving.current = true;
      const previousOnline = online;
      setOnline(next);
      const previousDriver = queryClient.getQueryData(myDriverQuery.queryKey);
      const cancellation = queryClient.cancelQueries({ queryKey: myDriverQuery.queryKey });
      queryClient.setQueryData(myDriverQuery.queryKey, (previous: typeof driver) =>
        previous ? { ...previous, status: next ? "available" : "offline" } : previous,
      );
      await cancellation;
      return { previousOnline, previousDriver };
    },
    onSuccess: (_d, next) => {
      queryClient.setQueryData(myDriverQuery.queryKey, (previous: typeof driver) =>
        previous ? { ...previous, status: next ? "available" : "offline" } : previous,
      );
      setOnline(next);
      tapFeedback(next ? "soft" : "off", next ? [40, 30, 40] : 60);
      toast.success(next ? t("driver.home.onlineToast") : t("driver.home.offlineToast"));
    },
    onError: (e: Error, _next, context) => {
      setOnline(context?.previousOnline ?? true);
      if (context?.previousDriver) queryClient.setQueryData(myDriverQuery.queryKey, context.previousDriver);
      toast.error(e.message.includes("active_delivery") ? t("driver.home.offlineBlocked") : t("driver.home.statusError"));
    },
    onSettled: () => {
      availabilitySaving.current = false;
      void queryClient.invalidateQueries({ queryKey: myDriverQuery.queryKey });
    },
  });

  const points = useMemo<MapPoint[]>(() => (me ? [{ ...me, label: "You", kind: "driver" as const }] : []), [me]);


  const mine = data?.mine ?? [];
  const available = online ? (data?.available ?? []) : [];
  const active = mine.filter((o) => !isFinished(o.status));
  const done = mine.filter((o) => o.status === "delivered");

  const currency = driverCurrency(driver?.country);
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayEarnings = done
    .filter((o) => new Date(o.created_at) >= startOfDay)
    .reduce((sum, o) => sum + pay(o), 0);

  const acceptance = mine.length === 0 ? 100 : Math.round((done.length / mine.length) * 100);
  const restaurantName = (id: string | null) =>
    !id
      ? t("package.orderLabel")
      : (restaurants.find((r) => r.id === id)?.name ?? t("driver.home.restaurantFallback"));

  return (
    <div className="driver-home flex min-h-0 flex-col">
      {offlineSheet ? <DriverOfflineSheet onStayOnline={() => setOfflineSheet(false)} onGoOffline={() => {
        setOfflineSheet(false);
        const next = offlineConfirmationResult("go-offline");
        if (next !== null) { setOnline(next); toggle.mutate(next); }
      }} /> : null}
      <NewDeliveryAlert online={online && active.length === 0} available={available} restaurantName={restaurantName} restaurants={restaurants} onOfferVisibilityChange={setOfferVisible} />

      <Dialog open={gate !== null} onOpenChange={(o) => !o && setGate(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {gate === "phone" ? t("calls.driverPhone.title") : t(
                gate === "rejected"
                  ? "driver.verifyGate.rejectedTitle"
                  : gate === "finish"
                    ? "driver.verifyGate.finishTitle"
                    : "driver.verifyGate.startTitle",
              )}
            </DialogTitle>
            <DialogDescription>
              {gate === "phone" ? t("calls.driverPhone.missing") : t(
                gate === "rejected"
                  ? "driver.verifyGate.rejectedBody"
                  : gate === "finish"
                    ? "driver.verifyGate.finishBody"
                    : "driver.verifyGate.startBody",
              )}
            </DialogDescription>
          </DialogHeader>
          {(gate === "finish" || gate === "start") && (missingDocs.length > 0 || !hasPhone) ? (
            <p className="text-sm text-foreground/70">
              {t("driver.documents.missingNote", {
                items: [
                  ...(hasPhone ? [] : [t("calls.driverPhone.missingItem")]),
                  ...missingDocs.map((d) => t(d.labelKey)),
                ].join(", "),
              })}
            </p>
          ) : null}
          {gate === "phone" ? (
            <DriverPhoneCard
              compact
              onSaved={() => {
                setGate(null);
                toggle.mutate(true);
              }}
            />
          ) : (
          <DialogFooter>
            <Button asChild className="w-full">
              <Link to="/driver/documents" onClick={() => setGate(null)}>
                {t("driver.verifyGate.action")}
              </Link>
            </Button>
          </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
      {/* Map with floating controls */}
      <section className="relative min-h-48 w-full flex-1 overflow-hidden" aria-label={t("driver.home.centreAria")}>
        {points.length > 0 ? (
          <MapView points={points} className="h-full w-full rounded-none" zoom={15} />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted text-sm text-foreground/60">
            {t("driver.home.locationOff")}
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                aria-label={t("driver.home.menuAria")}
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
                <SideLink to="/profile" icon={User} label={t("driver.sideNav.profile")} />
                <SideLink to="/driver/documents" icon={FileText} label={t("driver.sideNav.documents")} />
                <SideLink to="/profile" icon={Settings} label={t("driver.sideNav.settings")} />
                <SideLink to="/driver/help" icon={LifeBuoy} label={t("driver.sideNav.support")} />
              </nav>
            </SheetContent>
          </Sheet>

          <div className="pointer-events-auto rounded-full bg-ink-solid px-5 py-2 text-center shadow-md">
            <p className="text-base font-bold text-ink-solid-foreground">
              {formatMoney(todayEarnings, currency)}
            </p>
            <p className="text-[10px] uppercase tracking-wide text-ink-solid-foreground/70">{t("driver.home.today")}</p>
          </div>

          <Button
            size="icon"
            variant="secondary"
            aria-label={t("driver.home.safetyAria")}
            asChild
            className="pointer-events-auto rounded-full bg-card shadow-md"
          >
            <Link to="/driver/help">
              <ShieldCheck className="size-5" aria-hidden />
            </Link>
          </Button>
        </div>

        {/* Online toggle + flanking controls */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-3 p-4">
          <Button
            size="icon"
            variant="secondary"
            aria-label={t("driver.home.layersAria")}
            className="size-11 shrink-0 rounded-full bg-card shadow-md"
            onClick={() => toast(t("driver.home.layersToast"))}
          >
            <Layers className="size-5" aria-hidden />
          </Button>

          <Button
            size="lg"
            variant="ghost"
            disabled={toggle.isPending}
            onClick={handleToggle}
            aria-label={online ? t("driver.home.goOffline") : t("driver.home.goOnline")}
            aria-pressed={online}
            data-online={online}
            className="driver-availability h-12 w-auto min-w-36 max-w-[calc(100%-7rem)] whitespace-normal rounded-full px-5 text-sm font-bold shadow-lg disabled:opacity-100"
          >
            {online ? <><span aria-hidden="true" className="driver-online-dot size-2 rounded-full bg-current" />{t("driver.home.online")}</> : t("driver.home.goOnline")}
          </Button>

          <Button
            size="icon"
            variant="secondary"
            aria-label={t("driver.home.centreAria")}
            className="size-11 shrink-0 rounded-full bg-card shadow-md"
            onClick={() =>
              navigator.geolocation?.getCurrentPosition(
                (pos) => setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => toast.error(t("driver.home.locationError")),
              )
            }
          >
            <Crosshair className="size-5" aria-hidden />
          </Button>
        </div>
      </section>

      <div className="shrink-0 space-y-2 px-3 pb-3 pt-2">
      {isDriverWaiting({ online, ordersReady, activeCount: active.length, offerVisible }) ? (
        <DriverSearchingStrip label={t("driver.home.searching")} />
      ) : null}

      {/* Driver statistics */}
        <div className="grid grid-cols-2 gap-2">
          {!online ? <><StatCard icon={Trophy} label={t("driver.home.statScore")} value="96%" />
          <StatCard icon={Star} label={t("driver.home.statRating")} value="4.9" /></> : null}
          <StatCard icon={Navigation} label={t("driver.home.statAcceptance")} value={`${acceptance}%`} />
          <StatCard icon={Trophy} label={t("driver.home.statTotal")} value={String(done.length)} />
        </div>


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
    <Card className="rounded-lg border-ink/10 bg-card text-card-foreground">
      <CardContent className="flex items-center gap-2 px-3 py-2">
        <Icon className="size-4 shrink-0 text-brand" aria-hidden />
        <div className="min-w-0"><p className="text-base font-bold">{value}</p>
        <p className="text-[10px] leading-tight text-muted-foreground">{label}</p></div>
      </CardContent>
    </Card>
  );
}
