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
import { computeOrderFees, placeOrder, previewPromo, pricingQuery, restaurantQuery, type PaymentMethod } from "@/lib/dobra";
import { useQuery as usePricingQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { SITE_COPY } from "@/components/marketing/site-copy";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AddressPicker, type PickedAddress } from "@/components/dobra/AddressPicker";
import { SuccessOverlay } from "@/components/dobra/SuccessOverlay";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/dobra/PhoneInput";
import { myProfileQuery, saveMyPhone } from "@/lib/my-profile";
import { normalizePhone, validatePhone } from "@/lib/phone";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { CHECKOUT_COPY, formatManualAddress, manualAddressComplete, type ManualAddress } from "@/lib/checkout-address";

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

type PayChoice = "blik" | "apple_pay" | "google_pay" | "card" | "cash";
const PAY_OPTIONS: { id: PayChoice; title: string; copy: string }[] = [
  { id: "blik", title: "BLIK", copy: "Pay instantly with a 6-digit code from your bank app." },
  { id: "apple_pay", title: "Apple Pay", copy: "Pay with Face ID or Touch ID on Apple devices." },
  { id: "google_pay", title: "Google Pay", copy: "Pay with a card saved in your Google account." },
  { id: "card", title: "Card", copy: "" },
  { id: "cash", title: "Cash", copy: "" },
];

function CheckoutPage() {
  const { t, formatMoney, locale } = useI18n();
  const legal = SITE_COPY[locale].checkoutLegal;
  const copy = CHECKOUT_COPY[locale];
  const [manual, setManual] = useState(false);
  const [manualAddress, setManualAddress] = useState<ManualAddress>({ street: "", building: "", apartment: "", city: "" });
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
  const deliveryAddress = manual ? formatManualAddress(manualAddress) : address.address.trim();
  const addressComplete = manual ? manualAddressComplete(manualAddress) : address.address.trim().length >= 5;
  const { data: myProfile } = useQuery(myProfileQuery);
  const [phone, setPhone] = useState("");
  const [phoneTried, setPhoneTried] = useState(false);
  useEffect(() => {
    if (myProfile?.phone && !phone) setPhone(myProfile.phone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myProfile?.phone]);
  const phoneOk = validatePhone(phone) === null;
  const [placed, setPlaced] = useState(false);
  const isPoland = (restaurant?.country ?? "PL").toUpperCase().startsWith("P");
  const [pickedChoice, setChoice] = useState<PayChoice | null>(null);
  // Poland defaults to BLIK; Cameroon (no Mobile Money yet) defaults to cash.
  const choice: PayChoice = pickedChoice && (pickedChoice !== "blik" || isPoland) ? pickedChoice : isPoland ? "blik" : "cash";
  const paymentMethod: PaymentMethod = choice === "cash" ? "cash" : "card";
  const startCardPayment = useServerFn(createCardCheckoutSession);

  const subtotal = cartSubtotal(cart);
  // Same fee logic as placeOrder (city override, Prime) so the shown total = the charged total.
  const { data: fees } = useQuery({
    queryKey: ["order-fees", restaurant?.id],
    queryFn: () => computeOrderFees(restaurant!),
    enabled: Boolean(restaurant),
  });
  const fee = Number(fees?.deliveryFee ?? restaurant?.delivery_fee ?? 0);
  const { data: pricing } = usePricingQuery({ ...pricingQuery(restaurant?.country), enabled: Boolean(restaurant) });
  const serviceFee = Number(pricing?.service_fee ?? 0);
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<{ code: string; discount: number } | null>(null);
  const [promoBusy, setPromoBusy] = useState(false);
  const discount = promo?.discount ?? 0;
  const total = Math.max(0, subtotal + fee + serviceFee - discount);
  const minOrder = Math.max(Number(restaurant?.min_order ?? 0), Number(pricing?.min_order ?? 0));
  const belowMinimum = restaurant ? subtotal < minOrder : false;
  const applyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoBusy(true);
    try {
      const d = await previewPromo(promoInput.trim(), subtotal, restaurant?.country);
      setPromo({ code: promoInput.trim().toUpperCase(), discount: d });
      toast.success(`Promo applied: -${formatMoney(d)}`);
    } catch (e) {
      setPromo(null);
      toast.error((e as Error).message);
    } finally {
      setPromoBusy(false);
    }
  };

  const submit = useMutation({
    mutationFn: async () => {
      if (!restaurant || !addressComplete) throw new Error(t("customer.checkout.addressLabel"));
      if (normalizePhone(phone) !== (myProfile?.phone ?? "")) {
        await saveMyPhone(phone);
        void queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      }
      const orderId = await placeOrder({
        restaurant,
        lines: cart.lines,
        address: deliveryAddress,
        note,
        paymentMethod,
        destLat: manual ? null : address.lat,
        destLng: manual ? null : address.lng,
        promoCode: promo?.code ?? null,
      });
      if (paymentMethod === "card") {
        const session = await startCardPayment({
          data: {
            orderId,
            successPath: `/orders/${orderId}`,
            cancelPath: "/checkout",
            origin: window.location.origin,
            method: choice === "cash" ? "card" : choice,
          },
        });
        if (session.url) {
          // Keep the basket until payment is confirmed on the order page, so a
          // cancelled Stripe payment returns to a full checkout.
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
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-4">
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
            <section className="space-y-3 rounded-2xl bg-card p-4 text-card-foreground shadow-sm">
                <p className="font-semibold text-foreground">{cart.restaurantName}</p>
                {cart.lines.map((line) => (
                  <div key={line.itemId} className="flex items-center gap-3">
                    <StoredImage
                      value={line.image}
                      alt={line.name}
                      width={160}
                      height={160}
                      className="size-10 rounded-md object-cover"
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
            </section>

            <section className="space-y-3 rounded-2xl bg-card p-4 text-card-foreground shadow-sm">
                {manual ? (
                  <div className="grid grid-cols-2 gap-3">
                    {(["street", "building", "apartment", "city"] as const).map((field) => (
                      <div key={field} className={field === "street" || field === "city" ? "col-span-2 space-y-1" : "space-y-1"}>
                        <Label className={field === "building" || field === "apartment" ? "flex min-h-10 items-end" : ""} htmlFor={`manual-${field}`}>{copy[field]}</Label>
                        <Input id={`manual-${field}`} required={field !== "apartment"} value={manualAddress[field]} onChange={(e) => setManualAddress((previous) => ({ ...previous, [field]: e.target.value }))} />
                      </div>
                    ))}
                  </div>
                ) : <AddressPicker value={address} onChange={setAddress} compact />}
                <Button variant="link" size="sm" className="h-auto px-0" onClick={() => setManual(!manual)}>{manual ? copy.search : copy.manual}</Button>
                <PhoneInput
                  id="checkout-phone"
                  value={phone}
                  onChange={setPhone}
                  country={restaurant?.country}
                  showError={phoneTried}
                />
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium text-foreground/70">{t("customer.checkout.noteLabel")}</summary>
                  <Textarea
                    id="note"
                    aria-label={t("customer.checkout.noteLabel")}
                    className="mt-2 min-h-16"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={t("customer.checkout.notePlaceholder")}
                  />
                </details>
            </section>

            <section className="space-y-2 rounded-2xl bg-card p-4 text-card-foreground shadow-sm">
                <p className="font-semibold text-foreground">{t("customer.checkout.paymentTitle")}</p>
                {isPoland ? <RadioGroup value={choice === "blik" ? "blik" : ""} onValueChange={() => setChoice("blik")} aria-label="BLIK">
                  <Label htmlFor="pay-blik" className={`flex min-h-10 cursor-pointer items-center gap-3 rounded-md px-3 py-2 ${choice === "blik" ? "bg-sun/25" : ""}`}>
                    <RadioGroupItem id="pay-blik" value="blik" /> BLIK
                  </Label>
                </RadioGroup> : null}
                <Select value={choice === "blik" ? "" : choice} onValueChange={(value) => {
                  const option = PAY_OPTIONS.find((o) => o.id === value);
                  if (option) setChoice(option.id);
                }}>
                  <SelectTrigger aria-label={copy.other}><SelectValue placeholder={copy.other} /></SelectTrigger>
                  <SelectContent>
                    {PAY_OPTIONS.filter((o) => o.id !== "blik").map((option) => <SelectItem key={option.id} value={option.id}>{option.id === "cash" ? t("customer.checkout.cashTitle") : option.id === "card" ? t("customer.checkout.cardTitle") : option.title}</SelectItem>)}
                  </SelectContent>
                </Select>
                {/* TODO: Mobile Money (Flutterwave / Notch Pay) for Cameroon — not built yet. */}
                <p className="text-xs text-foreground/50">
                  {t("customer.checkout.mobileMoneySoon")}
                </p>

            </section>

            <section className="space-y-2 rounded-2xl bg-card p-4 text-sm text-card-foreground shadow-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/70">{t("customer.checkout.subtotal")}</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">{t("customer.checkout.delivery")}</span>
                  <span>{formatMoney(fee)}</span>
                </div>
                {serviceFee > 0 ? (
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Service fee</span>
                    <span>{formatMoney(serviceFee)}</span>
                  </div>
                ) : null}
                {discount > 0 ? (
                  <div className="flex justify-between text-primary">
                    <span>Promo {promo?.code}</span>
                    <span>-{formatMoney(discount)}</span>
                  </div>
                ) : null}
                <details>
                <summary className="cursor-pointer text-sm font-medium text-foreground/70">Promo code</summary>
                <div className="flex gap-2 pt-2">
                  <input
                    aria-label="Promo code"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Promo code"
                    className="h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm uppercase"
                  />
                  <Button
                    type="button"
                    onClick={applyPromo}
                    disabled={promoBusy || !promoInput.trim()}
                    size="sm"
                  >
                    Apply
                  </Button>
                </div>
                </details>
                <div className="flex justify-between border-t border-ink/10 pt-2 text-base font-bold">
                  <span>{t("customer.checkout.total")}</span>
                  <span>{formatMoney(total)}</span>
                </div>
            </section>

            {belowMinimum ? (
              <p className="text-sm text-destructive">
                {t("customer.checkout.minOrderWarning", { price: formatMoney(Number(restaurant?.min_order ?? 0)) })}
              </p>
            ) : null}

            <p className="px-2 text-center text-xs text-foreground/70">
              {legal[0]}
              <Link to="/terms" target="_blank" className="font-semibold text-accent underline">{legal[1]}</Link>
              {legal[2]}
              <Link to="/privacy" target="_blank" className="font-semibold text-accent underline">{legal[3]}</Link>.
            </p>

            <Button
              className="w-full"
              size="lg"
              disabled={
                submit.isPending || !restaurant || belowMinimum || !addressComplete
              }
              onClick={() => {
                if (!phoneOk) {
                  setPhoneTried(true);
                  document.getElementById("checkout-phone")?.focus();
                  return;
                }
                submit.mutate();
              }}
            >
              {submit.isPending ? t("customer.checkout.placingOrder") : t("customer.checkout.placeOrder", { price: formatMoney(total) })}
            </Button>
          </>
        )}
      </main>
    </PhoneFrame>
  );
}
