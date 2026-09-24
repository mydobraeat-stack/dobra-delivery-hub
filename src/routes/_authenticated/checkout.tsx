import { useEffect, useState } from "react";
import { useDeliveryAddress } from "@/lib/delivery-address";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/dobra/AppHeader";
import { PhoneFrame } from "@/components/dobra/PhoneFrame";
import { StoredImage } from "@/components/dobra/StoredImage";
import { cartSubtotal, clearCart, setQuantity, useCart } from "@/lib/cart";
import { createCardCheckoutSession } from "@/lib/payments.functions";
import { placeOrder, restaurantQuery, type PaymentMethod } from "@/lib/dobra";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AddressPicker, type PickedAddress } from "@/components/dobra/AddressPicker";
import { SuccessOverlay } from "@/components/dobra/SuccessOverlay";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Dobra" },
      { name: "description", content: "Review your basket and confirm your Dobra delivery." },
      { property: "og:title", content: "Checkout — Dobra" },
      {
        property: "og:description",
        content: "Review your basket and confirm your Dobra delivery.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { t, formatMoney } = useI18n();
  const cart = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data } = useQuery({
    ...restaurantQuery(cart.restaurantId ?? ""),
    enabled: Boolean(cart.restaurantId),
  });
  const restaurant = data?.restaurant ?? null;

  const [address, setAddress] = useState<PickedAddress>({ address: "", lat: null, lng: null });
  const { current: defaultAddress } = useDeliveryAddress();
  const [prefilled, setPrefilled] = useState(false);
  useEffect(() => {
    if (!prefilled && defaultAddress) {
      setAddress(defaultAddress);
      setPrefilled(true);
    }
  }, [defaultAddress, prefilled]);
  const [note, setNote] = useState("");
  const [placed, setPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const startCardPayment = useServerFn(createCardCheckoutSession);

  const subtotal = cartSubtotal(cart);
  const fee = Number(restaurant?.delivery_fee ?? 0);
  const total = subtotal + fee;
  const belowMinimum = restaurant ? subtotal < Number(restaurant.min_order ?? 0) : false;

  const submit = useMutation({
    mutationFn: async () => {
      const orderId = await placeOrder({
        restaurant: restaurant!,
        lines: cart.lines,
        address: address.address.trim(),
        note,
        paymentMethod,
        destLat: address.lat,
        destLng: address.lng,
      });
      if (paymentMethod === "card") {
        const session = await startCardPayment({
          data: {
            orderId,
            successPath: `/orders/${orderId}`,
            cancelPath: "/checkout",
            origin: window.location.origin,
          },
        });
        if (session.url) {
          clearCart();
          window.location.href = session.url;
          return null;
        }
        toast.message(t("customer.checkout.cardTestModeToast"));
      }
      return orderId;
    },
    onSuccess: (orderId) => {
      if (!orderId) return;
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(
        paymentMethod === "cash"
          ? t("customer.checkout.orderPlacedCash")
          : t("customer.checkout.orderPlacedCard"),
      );
      setPlaced(true);
      window.setTimeout(
        () => navigate({ to: "/orders/$orderId", params: { orderId } }),
        1800,
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <PhoneFrame className="min-h-screen">
      {placed ? (
        <SuccessOverlay
          title={t("customer.celebration.placedTitle")}
          subtitle={t("customer.celebration.placedBody")}
        />
      ) : null}
      <AppHeader subtitle={t("common.roles.customer")} />
      <main className="mx-auto max-w-2xl space-y-6 px-5 py-6">
        <Link
          to="/customer"
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden /> {t("customer.checkout.keepBrowsing")}
        </Link>
        <h1 className="text-2xl font-bold text-foreground">{t("customer.checkout.basketTitle")}</h1>

        {cart.lines.length === 0 ? (
          <p className="text-sm text-foreground/60">{t("customer.checkout.basketEmpty")}</p>
        ) : (
          <>
            <Card className="border-ink/10">
              <CardContent className="space-y-4 py-4">
                <p className="font-semibold text-foreground">{cart.restaurantName}</p>
                {cart.lines.map((line) => (
                  <div key={line.itemId} className="flex items-center gap-3">
                    <StoredImage
                      value={line.image}
                      alt={line.name}
                      width={160}
                      height={160}
                      className="size-14 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{line.name}</p>
                      <p className="text-xs text-foreground/60">
                        {formatMoney(line.price * line.quantity, line.currency)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label={t("customer.cart.removeOneAria", { name: line.name })}
                        onClick={() => setQuantity(line.itemId, line.quantity - 1)}
                      >
                        {line.quantity === 1 ? (
                          <Trash2 className="size-4" />
                        ) : (
                          <Minus className="size-4" />
                        )}
                      </Button>
                      <span className="w-4 text-center text-sm font-semibold">{line.quantity}</span>
                      <Button
                        size="icon"
                        aria-label={t("customer.cart.addOneAria", { name: line.name })}
                        onClick={() => setQuantity(line.itemId, line.quantity + 1)}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-ink/10">
              <CardContent className="space-y-4 py-4">
                <AddressPicker value={address} onChange={setAddress} />
                <div className="space-y-2">
                  <Label htmlFor="note">{t("customer.checkout.noteLabel")}</Label>
                  <Textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={t("customer.checkout.notePlaceholder")}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-ink/10">
              <CardContent className="space-y-3 py-4">
                <p className="font-semibold text-foreground">{t("customer.checkout.paymentTitle")}</p>
                {(
                  [
                    { id: "cash", titleKey: "customer.checkout.cashTitle", copyKey: "customer.checkout.cashCopy" },
                    { id: "card", titleKey: "customer.checkout.cardTitle", copyKey: "customer.checkout.cardCopy" },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setPaymentMethod(option.id)}
                    className={`w-full rounded-2xl border-2 px-4 py-3 text-left transition-colors ${
                      paymentMethod === option.id
                        ? "border-primary bg-sun/25"
                        : "border-ink/10 hover:border-ink/25"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-foreground">
                      {t(option.titleKey)}
                    </span>
                    <span className="block text-xs text-foreground/60">{t(option.copyKey)}</span>
                  </button>
                ))}
                {/* TODO: Mobile Money (Flutterwave / Notch Pay) for Cameroon — not built yet. */}
                <p className="text-xs text-foreground/50">
                  {t("customer.checkout.mobileMoneySoon")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-ink/10">
              <CardContent className="space-y-2 py-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/70">{t("customer.checkout.subtotal")}</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">{t("customer.checkout.delivery")}</span>
                  <span>{formatMoney(fee)}</span>
                </div>
                <div className="flex justify-between border-t border-ink/10 pt-2 text-base font-bold">
                  <span>{t("customer.checkout.total")}</span>
                  <span>{formatMoney(total)}</span>
                </div>
              </CardContent>
            </Card>

            {belowMinimum ? (
              <p className="text-sm text-destructive">
                {t("customer.checkout.minOrderWarning", { price: formatMoney(Number(restaurant?.min_order ?? 0)) })}
              </p>
            ) : null}

            <Button
              className="w-full"
              size="lg"
              disabled={
                submit.isPending || !restaurant || belowMinimum || address.address.trim().length < 5
              }
              onClick={() => submit.mutate()}
            >
              {submit.isPending ? t("customer.checkout.placingOrder") : t("customer.checkout.placeOrder", { price: formatMoney(total) })}
            </Button>
          </>
        )}
      </main>
    </PhoneFrame>
  );
}
