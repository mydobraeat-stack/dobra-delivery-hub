import { useState } from "react";
import { ChevronDown, Home, MapPin } from "lucide-react";
import { AddressPicker, type PickedAddress } from "@/components/dobra/AddressPicker";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDeliveryAddress } from "@/lib/delivery-address";
import { useT } from "@/lib/i18n";
import { tapFeedback } from "@/lib/sound";
import { cn } from "@/lib/utils";

export function DeliveryAddressBar() {
  const t = useT();
  const { current, saved, loading, save } = useDeliveryAddress();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<PickedAddress>({ address: "", lat: null, lng: null });

  const choose = (a: PickedAddress) => {
    save(a);
    tapFeedback("pop");
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          tapFeedback("tap");
          setDraft({ address: "", lat: null, lng: null });
          setOpen(true);
        }}
        className="flex w-full max-w-full items-center gap-2 rounded-full border border-ink/10 bg-card px-4 py-2.5 text-left shadow-soft transition-transform active:scale-[0.98]"
        aria-label={t("customer.address.change")}
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary">
          <Home className="size-4 text-accent" aria-hidden />
        </span>
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-sm font-semibold",
            current ? "text-foreground" : "text-foreground/60",
          )}
        >
          {loading ? "…" : (current?.address ?? t("customer.address.set"))}
        </span>
        <ChevronDown className="size-4 shrink-0 text-foreground/60" aria-hidden />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("customer.address.title")}</DialogTitle>
          </DialogHeader>
          {saved.length > 0 || current ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-foreground/60">
                {t("customer.address.saved")}
              </p>
              <ul className="space-y-1">
                {[...(current ? [current] : []), ...saved.filter((s) => s.address !== current?.address)].map(
                  (a) => (
                    <li key={a.address}>
                      <button
                        type="button"
                        onClick={() => choose(a)}
                        className={cn(
                          "flex w-full items-start gap-2 rounded-xl border px-3 py-2 text-left text-sm hover:bg-muted",
                          a.address === current?.address ? "border-accent" : "border-ink/10",
                        )}
                      >
                        <MapPin className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                        <span className="min-w-0 break-words">{a.address}</span>
                      </button>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ) : null}
          <div className="space-y-3">
            <AddressPicker
              id="home-address"
              label={t("customer.address.new")}
              value={draft}
              onChange={setDraft}
            />
            <Button
              className="w-full"
              disabled={draft.address.trim().length < 5}
              onClick={() => choose({ ...draft, address: draft.address.trim() })}
            >
              {t("customer.address.use")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
