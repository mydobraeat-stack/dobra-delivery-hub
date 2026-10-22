import { usePayout } from "@/lib/payout";
import { OrderTimeLabel } from "@/components/dobra/OrderTimes";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Store, Timer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { startRingtone } from "@/lib/sound";
import { claimOrder, myDriverQuery, orderRef, type OrderRow, type Restaurant } from "@/lib/dobra";
import {
  autoNavigationEnabled,
  directionsUrl,
  markNavigationBlocked,
  openNavigation,
  pickupDestination,
  travelModeFor,
} from "@/lib/navigation";

const OFFER_SECONDS = 30;
const DECLINED_KEY = "dobra.declinedOffers";

function loadDeclined(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.sessionStorage.getItem(DECLINED_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

/**
 * Full-screen "new delivery" offer for online drivers. The order stays
 * unassigned in the database, so declining or letting the timer run out simply
 * skips it for this driver — it remains claimable by any other online driver.
 */
export function NewDeliveryAlert({
  online,
  available,
  restaurantName,
  restaurants = [],
}: {
  online: boolean;
  available: OrderRow[];
  restaurantName: (id: string | null) => string;
  restaurants?: Restaurant[];
}) {
  const { data: driver } = useQuery(myDriverQuery);
  const { t, formatMoney } = useI18n();
  const pay = usePayout();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [declined, setDeclined] = useState<string[]>(loadDeclined);
  const [timer, setTimer] = useState<{ id: string; left: number } | null>(null);
  const soundedFor = useRef<string | null>(null);

  const offer = useMemo(
    () => (online ? (available.find((o) => !declined.includes(o.id)) ?? null) : null),
    [online, available, declined],
  );

  const skip = (id: string) => {
    setDeclined((prev) => {
      const next = prev.includes(id) ? prev : [...prev, id];
      try {
        window.sessionStorage.setItem(DECLINED_KEY, JSON.stringify(next.slice(-50)));
      } catch {
        /* storage unavailable — in-memory skip still works */
      }
      return next;
    });
  };

  // Restart the countdown and ring for each new offer; the ringtone stops as
  // soon as the offer is answered or the popup closes.
  useEffect(() => {
    if (!offer) return;
    setTimer({ id: offer.id, left: OFFER_SECONDS });
    let stop = () => {};
    if (soundedFor.current !== offer.id) {
      soundedFor.current = offer.id;
      stop = startRingtone(OFFER_SECONDS);
    }
    return () => stop();
  }, [offer?.id]);

  useEffect(() => {
    if (!offer) return;
    const id = offer.id;
    const handle = window.setInterval(
      () => setTimer((prev) => (prev && prev.id === id ? { id, left: prev.left - 1 } : prev)),
      1000,
    );
    return () => window.clearInterval(handle);
  }, [offer?.id]);

  useEffect(() => {
    if (!offer || !timer || timer.id !== offer.id || timer.left > 0) return;
    skip(offer.id);
    toast(t("driver.offer.expiredToast"));
  }, [timer, offer?.id]);

  const accept = useMutation({
    mutationFn: (id: string) => claimOrder(id),
    onSuccess: (_d, id) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(t("driver.home.acceptedToast"));
      void navigate({ to: "/driver/delivery/$orderId", params: { orderId: id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!offer) return null;

  const total = Number(offer.total);
  const seconds = timer && timer.id === offer.id ? timer.left : OFFER_SECONDS;
  const progress = Math.max(0, Math.min(100, (seconds / OFFER_SECONDS) * 100));

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink-solid/70 p-4 backdrop-blur-sm animate-in fade-in duration-200 sm:items-center">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-card shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
        <div className="bg-primary px-6 py-4 text-primary-foreground">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-90">
            {t("driver.offer.badge")}
          </p>
          <p className="text-2xl font-bold">
            {formatMoney(pay(offer), offer.currency)}{" "}
            <span className="text-sm font-medium opacity-90">{t("driver.home.payoutSuffix")}</span>
          </p>
        </div>

        <div className="h-1.5 w-full bg-ink/10">
          <div
            className="h-full bg-sun transition-[width] duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="flex items-start gap-3">
            <Store className="mt-0.5 size-5 text-primary" aria-hidden />
            <div className="min-w-0">
              <p className="font-semibold text-foreground">
                {offer.kind === "package"
                  ? (offer.pickup_address ?? t("package.orderLabel"))
                  : restaurantName(offer.restaurant_id)}
              </p>
              <p className="text-xs text-foreground/60">
                {offer.kind === "package" ? t("package.pickupLabel") : t("driver.offer.pickup")}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-5 text-primary" aria-hidden />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                {offer.address ?? t("driver.offer.noAddress")}
              </p>
              <p className="text-xs text-foreground/60">
                {t("driver.offer.dropoff")} · {orderRef(offer.id)}
              </p>
            </div>
          </div>
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/70">
            <Timer className="size-4" aria-hidden />
            {t("driver.offer.expiresIn", { n: Math.max(0, seconds) })}
          </p>
          <p className="text-xs text-foreground/60">
            <OrderTimeLabel step="offered" at={offer.ready_at ?? offer.created_at} country={offer.country} />
          </p>

          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              className="flex-1"
              size="lg"
              onClick={() => {
                skip(offer.id);
                toast(t("driver.offer.declinedToast"));
              }}
            >
              {t("driver.offer.decline")}
            </Button>
            <Button
              className="flex-1"
              size="lg"
              disabled={accept.isPending}
              data-testid="offer-accept"
              onClick={() => {
                // Open Maps synchronously inside the tap, before the network call.
                if (autoNavigationEnabled()) {
                  const url = directionsUrl(
                    pickupDestination(offer, restaurants.find((r) => r.id === offer.restaurant_id)),
                    travelModeFor(driver?.vehicle_type),
                  );
                  if (url && !openNavigation(url)) markNavigationBlocked(offer.id, "pickup");
                }
                accept.mutate(offer.id);
              }}
            >
              {t("driver.offer.accept")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
