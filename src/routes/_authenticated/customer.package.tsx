import { useEffect, useState } from "react";
import { PhoneInput } from "@/components/dobra/PhoneInput";
import { myProfileQuery, saveMyPhone } from "@/lib/my-profile";
import { normalizePhone, validatePhone } from "@/lib/phone";
import { supabase } from "@/integrations/supabase/client";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Package } from "lucide-react";
import { toast } from "sonner";
import { AddressPicker, type PickedAddress } from "@/components/dobra/AddressPicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import {
  pricingQuery,
  packageQuote,
  placePackageDelivery,
  type PaymentMethod,
} from "@/lib/dobra";

export const Route = createFileRoute("/_authenticated/customer/package")({
  head: () => ({
    meta: [
      { title: "Send a package — Dobra" },
      {
        name: "description",
        content: "Request a courier to pick up and deliver a package across your city.",
      },
      { property: "og:title", content: "Send a package — Dobra" },
      {
        property: "og:description",
        content: "Request a courier to pick up and deliver a package across your city.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PackageRequest,
});

const empty: PickedAddress = { address: "", lat: null, lng: null };

function PackageRequest() {
  const { t, formatMoney } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [pickup, setPickup] = useState<PickedAddress>(empty);
  const [drop, setDrop] = useState<PickedAddress>(empty);
  const [description, setDescription] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("cash");
  const { data: myProfile } = useQuery(myProfileQuery);
  const [phone, setPhone] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [phoneTried, setPhoneTried] = useState(false);
  useEffect(() => {
    if (myProfile?.phone && !phone) setPhone(myProfile.phone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myProfile?.phone]);
  const phonesOk = validatePhone(phone) === null && validatePhone(recipientPhone, false) === null;

  const country = /cameroon|cameroun/i.test(pickup.address) ? "Cameroon" : "Poland";
  const { data: pricing } = useQuery(pricingQuery(country));
  const quote = packageQuote(
    pickup.lat != null && pickup.lng != null ? { lat: pickup.lat, lng: pickup.lng } : null,
    drop.lat != null && drop.lng != null ? { lat: drop.lat, lng: drop.lng } : null,
    pricing,
  );

  const ready = Boolean(pickup.address.trim() && drop.address.trim() && description.trim());

  const submit = useMutation({
    mutationFn: async () => {
      if (normalizePhone(phone) !== (myProfile?.phone ?? "")) await saveMyPhone(phone);
      const orderId = await placePackageDelivery({
        pickupAddress: pickup.address,
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        dropAddress: drop.address,
        dropLat: drop.lat,
        dropLng: drop.lng,
        description,
        paymentMethod: payment,
        country,
      });
      const rp = normalizePhone(recipientPhone);
      if (validatePhone(recipientPhone) === null) {
        await supabase.from("order_contacts").insert({ order_id: orderId, recipient_phone: rp });
      }
      return orderId;
    },
    onSuccess: (orderId) => {
      toast.success(t("package.request.created"));
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      void navigate({ to: "/orders/$orderId", params: { orderId } });
    },
    onError: (e: Error) => toast.error(e.message || t("package.request.error")),
  });

  return (
    <main className="space-y-5 px-5 pb-28 pt-4">
      <Link
        to="/customer"
        className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> {t("common.actions.back")}
      </Link>

      <div className="flex items-start gap-3">
        <Package className="mt-1 size-6 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-foreground">{t("package.request.title")}</h1>
          <p className="text-sm text-foreground/60">{t("package.request.subtitle")}</p>
        </div>
      </div>

      <Card className="border-ink/10">
        <CardContent className="space-y-5 py-5">
          <AddressPicker
            id="pickup-address"
            label={t("package.request.pickup")}
            value={pickup}
            onChange={setPickup}
          />
          <AddressPicker
            id="drop-address"
            label={t("package.request.dropoff")}
            value={drop}
            onChange={setDrop}
          />
          <div className="space-y-2">
            <Label htmlFor="package-note">{t("package.request.description")}</Label>
            <Textarea
              id="package-note"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("package.request.descriptionPlaceholder")}
              rows={3}
            />
          </div>
          <PhoneInput id="package-phone" value={phone} onChange={setPhone} country={country} showError={phoneTried} />
          <PhoneInput
            id="recipient-phone"
            value={recipientPhone}
            onChange={setRecipientPhone}
            country={country}
            required={false}
            label={t("calls.phone.recipientLabel")}
            hint={t("calls.phone.recipientHint")}
            showError={phoneTried}
          />
        </CardContent>
      </Card>

      <Card className="border-ink/10">
        <CardContent className="space-y-3 py-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-sm text-foreground/70">{t("package.request.fee")}</span>
            <span className="text-lg font-bold text-foreground">
              {formatMoney(quote.fee, pricing?.currency ?? "PLN")}
            </span>
          </div>
          <p className="text-xs text-foreground/60">
            {t("package.request.distance", { km: quote.km.toFixed(1) })} ·{" "}
            {t("package.request.eta", { n: quote.etaMinutes })}
          </p>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">{t("package.request.payment")}</p>
            <div className="flex flex-wrap gap-2">
              {(["cash", "card"] as PaymentMethod[]).map((method) => (
                <Button
                  key={method}
                  type="button"
                  size="sm"
                  variant={payment === method ? "default" : "outline"}
                  onClick={() => setPayment(method)}
                >
                  {t(`package.request.${method}`)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        className="w-full"
        size="lg"
        disabled={!ready || submit.isPending}
        onClick={() => {
          if (!ready) {
            toast.error(t("package.request.missing"));
          } else if (!phonesOk) {
            setPhoneTried(true);
          } else {
            submit.mutate();
          }
        }}
      >
        {t("package.request.submit")}
      </Button>
    </main>
  );
}
