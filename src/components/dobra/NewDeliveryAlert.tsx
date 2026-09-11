import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Store, Timer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { playSound } from "@/lib/sound";
import { claimOrder, orderRef, payout, type OrderRow } from "@/lib/dobra";

const OFFER_SECONDS = 20;
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
}: {
  online: boolean;
  available: OrderRow[];
  restaurantName: (id: string) => string;
}) {
  const { t, formatMoney } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [declined, setDeclined] = useState<string[]>(loadDeclined);
  const [seconds, setSeconds] = useState(OFFER_SECONDS);
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

  // Restart the countdown and play the urgent chime for each new offer.
  useEffect(() => {
    if (!offer) return;
    setSeconds(OFFER_SECONDS);
    if (soundedFor.current !== offer.id) {
      soundedFor.current = offer.id;
      playSound("alert");
    }
  }, [offer?.id]);

  useEffect(() => {
    if (!offer) return;
    const timer = window.setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearInterval(timer);
  }, [offer?.id]);

  useEffect(() => {
    if (!offer || seconds > 0) return;
    skip(offer.id);
    toast(t("driver.offer.expiredToast"));
  }, [seconds, offer?.id]);

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
  const progress = Math.max(0, Math.min(100, (seconds / OFFER_SECONDS) * 100));

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/70 p-4 backdrop-blur-sm animate-in fade-in duration-200 sm:items-center">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-card shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
        <div className="bg-primary px-6 py-4 text-primary-foreground">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-90">
            {t("driver.offer.badge")}
          </p>
          <p className="text-2xl font-bold">
            {formatMoney(payout(total), offer.currency)}{" "}
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
              <p className="font-semibold text-foreground">{restaurantName(offer.restaurant_id)}</p>
              <p className="text-xs text-foreground/60">{t("driver.offer.pickup")}</p>
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
              onClick={() => accept.mutate(offer.id)}
            >
              {t("driver.offer.accept")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
