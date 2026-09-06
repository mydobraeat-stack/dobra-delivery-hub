import { useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, MapPin, Star } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/dobra/AppHeader";
import { StoredImage } from "@/components/dobra/StoredImage";
import { StatusBadge } from "@/components/dobra/StatusBadge";
import {
  CUSTOMER_STEPS,
  cancelOrder,
  driverLocationQuery,
  money,
  orderItemsQuery,
  orderQuery,
  orderRef,
  orderReviewQuery,
  restaurantQuery,
  submitReview,
} from "@/lib/dobra";
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

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  const cancel = useMutation({
    mutationFn: () => cancelOrder(orderId),
    onSuccess: () => {
      toast.success("Order cancelled.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const review$ = useMutation({
    mutationFn: () =>
      submitReview({
        orderId,
        restaurantId: order!.restaurant_id,
        driverId: order!.driver_id,
        restaurantRating,
        driverRating: order!.driver_id ? driverRating : null,
        comment,
      }),
    onSuccess: () => {
      toast.success("Thanks for the review!");
      queryClient.invalidateQueries({ queryKey: ["review", orderId] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const currentIndex = order ? CUSTOMER_STEPS.findIndex((s) => s.status === order.status) : -1;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader subtitle="Customer" />
      <main className="mx-auto max-w-2xl space-y-6 px-5 py-6">
        <Link
          to="/customer"
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden /> Back
        </Link>

        {isLoading ? (
          <p className="text-sm text-foreground/60">Loading order…</p>
        ) : !order ? (
          <p className="text-sm text-foreground/60">We couldn’t find this order.</p>
        ) : (
          <>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground">
                {restaurantData?.restaurant?.name ?? "Your order"}
              </h1>
              <p className="text-sm text-foreground/60">
                {orderRef(order.id)} · {money(order.total, order.currency)} · arrives in about{" "}
                {order.eta_minutes} min
              </p>
              <StatusBadge status={order.status} />
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
                          {step.label}
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
            />

            <Card className="border-ink/10">
              <CardContent className="space-y-3 py-4">
                <p className="text-sm font-semibold text-foreground">Order details</p>
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
                      {item.quantity} × {item.menu_items?.name ?? "Item"}
                    </p>
                    <p className="text-sm text-foreground/70">
                      {money(Number(item.price) * item.quantity, order.currency)}
                    </p>
                  </div>
                ))}
                <div className="space-y-1 border-t border-ink/10 pt-3 text-sm">
                  <div className="flex justify-between text-foreground/70">
                    <span>Subtotal</span>
                    <span>{money(order.subtotal, order.currency)}</span>
                  </div>
                  <div className="flex justify-between text-foreground/70">
                    <span>Delivery</span>
                    <span>{money(order.delivery_fee, order.currency)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{money(order.total, order.currency)}</span>
                  </div>
                </div>
                {order.address ? (
                  <p className="text-xs text-foreground/60">Delivering to {order.address}</p>
                ) : null}
                {order.note ? (
                  <p className="text-xs text-foreground/60">Note: {order.note}</p>
                ) : null}
              </CardContent>
            </Card>

            {order.status === "pending" ? (
              <Button
                variant="outline"
                disabled={cancel.isPending}
                onClick={() => cancel.mutate()}
              >
                Cancel order
              </Button>
            ) : null}

            {order.status === "delivered" ? (
              <Card className="border-ink/10">
                <CardContent className="space-y-4 py-4">
                  <p className="text-sm font-semibold text-foreground">Rate your order</p>
                  {review ? (
                    <p className="text-sm text-foreground/70">
                      You rated this order {review.restaurant_rating}/5. Thanks!
                    </p>
                  ) : (
                    <>
                      <Stars
                        label="Restaurant"
                        value={restaurantRating}
                        onChange={setRestaurantRating}
                      />
                      {order.driver_id ? (
                        <Stars label="Driver" value={driverRating} onChange={setDriverRating} />
                      ) : null}
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tell others how it went (optional)"
                      />
                      <Button disabled={review$.isPending} onClick={() => review$.mutate()}>
                        Submit review
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : null}
          </>
        )}
      </main>
    </div>
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
          aria-label={`${label} ${n} star${n > 1 ? "s" : ""}`}
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
