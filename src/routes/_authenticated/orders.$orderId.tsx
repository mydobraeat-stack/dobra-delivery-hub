import { useEffect, useMemo, useRef, useState } from "react";
import { ConfirmAction } from "@/components/dobra/ConfirmButton";
import { ListSkeleton } from "@/components/dobra/QueryStates";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { confirmCardPayment } from "@/lib/payments.functions";
import { ArrowLeft, Check, MapPin, Star } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/dobra/AppHeader";
import { PhoneFrame } from "@/components/dobra/PhoneFrame";
import { StoredImage } from "@/components/dobra/StoredImage";
import { ChatButton } from "@/components/dobra/ChatButton";
import { ActionDialog } from "@/components/admin/ActionDialog";
import { reportProblem } from "@/lib/admin-ops";
import { Button as ReportBtn } from "@/components/ui/button";
import { StatusBadge } from "@/components/dobra/StatusBadge";
import { MapView, type MapPoint } from "@/components/dobra/MapView";
import { SuccessOverlay } from "@/components/dobra/SuccessOverlay";
import { addressPointQuery } from "@/lib/maps";
import {
  CUSTOMER_STEPS,
  cancelOrder,
  driverLocationQuery,
  orderItemsQuery,
  orderQuery,
  orderRef,
  orderReviewQuery,
  restaurantQuery,
  submitReview,
} from "@/lib/dobra";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/orders/$orderId")({
  head: () => ({
    meta: [
      { title: "Track your order — Dobra" },
      { name: "description", content: "Follow your Dobra delivery from kitchen to doorstep." },
      { property: "og:title", content: "Track your order — Dobra" },
      {
        property: "og:description",
        content: "Follow your Dobra delivery from kitchen to doorstep.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrderTracking,
});

function OrderTracking() {
  const { t, formatMoney, formatDate } = useI18n();
  const { orderId } = useParams({ from: "/_authenticated/orders/$orderId" });
  const queryClient = useQueryClient();
  const { data: order, isLoading } = useQuery(orderQuery(orderId));
  const { data: items = [] } = useQuery(orderItemsQuery(orderId));
  const { data: restaurantData } = useQuery({
    ...restaurantQuery(order?.restaurant_id ?? ""),
    enabled: Boolean(order?.restaurant_id),
  });
  const { data: location } = useQuery(driverLocationQuery(order?.driver_id));
  const { data: review } = useQuery(orderReviewQuery(orderId));

  const [restaurantRating, setRestaurantRating] = useState(5);
  const [driverRating, setDriverRating] = useState(5);
  const [comment, setComment] = useState("");
  const [celebrate, setCelebrate] = useState(false);
  const seenDelivered = useRef(false);

  // Celebrate the moment the order flips to delivered (realtime or on arrival).
  useEffect(() => {
    if (order?.status !== "delivered" || seenDelivered.current) return;
    seenDelivered.current = true;
    setCelebrate(true);
    const timer = window.setTimeout(() => setCelebrate(false), 2400);
    return () => window.clearTimeout(timer);
  }, [order?.status]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  // Returning from Stripe: confirm the card payment and mark the order paid.
  const confirmPayment = useServerFn(confirmCardPayment);
  const paymentChecked = useRef(false);
  useEffect(() => {
    if (!order || paymentChecked.current) return;
    paymentChecked.current = true;
    confirmPayment({ data: { orderId } })
      .then((r) => {
        if (r.paid) {
          toast.success("Card payment received");
          invalidate();
        }
      })
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, orderId]);

  const cancel = useMutation({
    mutationFn: () => cancelOrder(orderId),
    onSuccess: () => {
      toast.success(t("customer.tracking.cancelledToast"));
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const review$ = useMutation({
    mutationFn: () =>
      submitReview({
        orderId,
        restaurantId: order!.restaurant_id!,
        driverId: order!.driver_id,
        restaurantRating,
        driverRating: order!.driver_id ? driverRating : null,
        comment,
      }),
    onSuccess: () => {
      toast.success(t("customer.tracking.reviewThanksToast"));
      queryClient.invalidateQueries({ queryKey: ["review", orderId] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const currentIndex = order ? CUSTOMER_STEPS.findIndex((s) => s.status === order.status) : -1;

  return (
    <PhoneFrame className="min-h-screen">
      {celebrate ? (
        <SuccessOverlay
          tone="sun"
          title={t("customer.celebration.deliveredTitle")}
          subtitle={t("customer.celebration.deliveredBody")}
        />
      ) : null}
      <AppHeader subtitle={t("common.roles.customer")} />
      <main className="mx-auto max-w-2xl space-y-6 px-5 py-6">
        <Link
          to="/customer"
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden /> {t("common.actions.back")}
        </Link>

        {isLoading ? (
          <ListSkeleton rows={3} />
        ) : !order ? (
          <p className="text-sm text-foreground/60">{t("customer.tracking.notFound")}</p>
        ) : (
          <>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground">
                {restaurantData?.restaurant?.name ?? t("customer.tracking.defaultTitle")}
              </h1>
              <p className="text-sm text-foreground/60">
                {orderRef(order.id)} · {formatMoney(order.total, order.currency)} ·{" "}
                {t("customer.tracking.arrivesIn", { n: order.eta_minutes })}
              </p>
              <StatusBadge status={order.status} />
              <div className="flex flex-wrap gap-2 pt-2">
                <ChatButton
                  kind="order_vendor"
                  orderId={order.id}
                  label={t("chat.messageRestaurant")}
                />
                {order.driver_id ? (
                  <ChatButton
                    kind="order_driver"
                    orderId={order.id}
                    label={t("chat.messageDriver")}
                  />
                ) : null}
                <ChatButton kind="support" label={t("chat.contactSupport")} variant="ghost" />
                <ReportProblem orderId={orderId} />
              </div>
            </div>

            {order.status === "cancelled" ? null : (
              <Card className="border-ink/10">
                <CardContent className="space-y-3 py-5">
                  {CUSTOMER_STEPS.map((step, index) => {
                    const done = index <= currentIndex;
                    return (
                      <div key={step.status} className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex size-7 items-center justify-center rounded-full border",
                            done
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-ink/20 text-foreground/40",
                          )}
                        >
                          {done ? <Check className="size-4" aria-hidden /> : index + 1}
                        </span>
                        <span
                          className={cn(
                            "text-sm",
                            done ? "font-semibold text-foreground" : "text-foreground/50",
                          )}
                        >
                          {t(`common.steps.${step.status}`)}
                        </span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            <DeliveryMap
              driver={location ? { lat: location.lat, lng: location.lng } : null}
              updatedAt={location?.updated_at ?? null}
              address={order.address}
              saved={
                order.dest_lat != null && order.dest_lng != null
                  ? { lat: order.dest_lat, lng: order.dest_lng }
                  : null
              }
            />

            <Card className="border-ink/10">
              <CardContent className="space-y-3 py-4">
                <p className="text-sm font-semibold text-foreground">{t("customer.tracking.orderDetails")}</p>
                {items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <StoredImage
                      value={item.menu_items?.image_url ?? null}
                      alt={item.menu_items?.name ?? "Dish"}
                      width={160}
                      height={160}
                      className="size-12 rounded-lg object-cover"
                    />
                    <p className="flex-1 text-sm text-foreground">
                      {item.quantity} × {item.menu_items?.name ?? t("customer.home.restaurantFallback")}
                    </p>
                    <p className="text-sm text-foreground/70">
                      {formatMoney(Number(item.price) * item.quantity, order.currency)}
                    </p>
                  </div>
                ))}
                <div className="space-y-1 border-t border-ink/10 pt-3 text-sm">
                  <div className="flex justify-between text-foreground/70">
                    <span>{t("customer.checkout.subtotal")}</span>
                    <span>{formatMoney(order.subtotal, order.currency)}</span>
                  </div>
                  <div className="flex justify-between text-foreground/70">
                    <span>{t("customer.checkout.delivery")}</span>
                    <span>{formatMoney(order.delivery_fee, order.currency)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>{t("customer.checkout.total")}</span>
                    <span>{formatMoney(order.total, order.currency)}</span>
                  </div>
                </div>
                {order.address ? (
                  <p className="text-xs text-foreground/60">{t("customer.tracking.deliveringTo", { address: order.address })}</p>
                ) : null}
                {order.note ? (
                  <p className="text-xs text-foreground/60">{t("customer.tracking.noteLabel", { note: order.note })}</p>
                ) : null}
              </CardContent>
            </Card>

            {order.status === "pending" ? (
              <ConfirmAction
                title={t("common.state.confirmCancelTitle")}
                body={t("common.state.confirmCancelBody")}
                confirmLabel={t("customer.tracking.cancelOrder")}
                cancelLabel={t("common.state.keep")}
                onConfirm={() => cancel.mutate()}
                trigger={
                  <Button variant="outline" disabled={cancel.isPending}>
                    {t("customer.tracking.cancelOrder")}
                  </Button>
                }
              />
            ) : null}

            {order.status === "delivered" && order.restaurant_id ? (
              <Card className="border-ink/10">
                <CardContent className="space-y-4 py-4">
                  <p className="text-sm font-semibold text-foreground">{t("customer.tracking.rateOrder")}</p>
                  {review ? (
                    <p className="text-sm text-foreground/70">
                      {t("customer.tracking.ratedThanks", { n: review.restaurant_rating })}
                    </p>
                  ) : (
                    <>
                      <Stars
                        label={t("customer.tracking.restaurantLabel")}
                        value={restaurantRating}
                        onChange={setRestaurantRating}
                      />
                      {order.driver_id ? (
                        <Stars
                          label={t("customer.tracking.driverLabel")}
                          value={driverRating}
                          onChange={setDriverRating}
                        />
                      ) : null}
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={t("customer.tracking.commentPlaceholder")}
                      />
                      <Button disabled={review$.isPending} onClick={() => review$.mutate()}>
                        {t("customer.tracking.submitReview")}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : null}
          </>
        )}
      </main>
    </PhoneFrame>
  );
}

function Stars({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 text-sm text-foreground/70">{label}</span>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={label + " " + n + (n > 1 ? "s" : "")}
          onClick={() => onChange(n)}
        >
          <Star
            className={cn(
              "size-6",
              n <= value ? "fill-accent text-accent" : "text-foreground/30",
            )}
          />
        </button>
      ))}
    </div>
  );
}

function DeliveryMap({
  driver,
  updatedAt,
  address,
  saved,
}: {
  driver: { lat: number; lng: number } | null;
  updatedAt: string | null;
  address: string | null;
  saved: { lat: number; lng: number } | null;
}) {
  const { t, formatDate } = useI18n();
  const { data: geocoded } = useQuery({
    ...addressPointQuery(address),
    enabled: !saved && Boolean(address && address.trim().length > 3),
  });
  const dropOff = saved ?? geocoded ?? null;

  const points = useMemo(() => {
    const list: MapPoint[] = [];
    if (driver) list.push({ ...driver, label: t("customer.tracking.yourDriver"), kind: "driver" });
    if (dropOff)
      list.push({ ...dropOff, label: address ?? t("customer.tracking.deliveryAddress"), kind: "dropoff" });
    return list;
  }, [driver, dropOff, address]);

  if (points.length === 0) return null;

  return (
    <Card className="border-ink/10">
      <CardContent className="space-y-2 py-4">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
          <MapPin className="size-4" aria-hidden /> {driver ? t("customer.tracking.driverLocation") : t("customer.tracking.deliveryAddress")}
        </p>
        <MapView points={points} className="h-56 w-full" />
        {driver && updatedAt ? (
          <p className="text-xs text-foreground/60">
            {t("customer.tracking.updated", { time: formatDate(updatedAt, { timeStyle: "short" }) })}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ReportProblem({ orderId }: { orderId: string }) {
  return (
    <ActionDialog
      trigger={
        <ReportBtn variant="ghost" size="sm">
          Report a problem
        </ReportBtn>
      }
      title="Report a problem"
      description="Tell us what went wrong. Our team will review it and get back to you."
      reasonLabel="What happened?"
      reasonRequired
      confirmLabel="Send report"
      successMessage="Thanks, our team will look into it."
      onConfirm={(r) => reportProblem(orderId, r)}
    />
  );
}
