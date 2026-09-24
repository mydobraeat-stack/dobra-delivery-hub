import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { MapView, type MapPoint } from "@/components/dobra/MapView";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/lib/i18n";
import { addressSuggestionsQuery } from "@/lib/maps";
import { resolvePlace } from "@/lib/maps.functions";

export type PickedAddress = { address: string; lat: number | null; lng: number | null };

type Props = {
  value: PickedAddress;
  onChange: (next: PickedAddress) => void;
  id?: string;
  label?: string;
  placeholder?: string;
};

/** Address field with live suggestions and a confirmation map pin. */
export function AddressPicker({ value, onChange, id = "address", label, placeholder }: Props) {
  const t = useT();
  const [query, setQuery] = useState(value.address);
  const [debounced, setDebounced] = useState(value.address);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) setQuery(value.address);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.address]);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), 350);
    return () => clearTimeout(id);
  }, [query]);

  const { data: suggestions = [], isError } = useQuery(addressSuggestionsQuery(open ? debounced : ""));

  const pick = async (placeId: string, label: string) => {
    setOpen(false);
    setQuery(label);
    onChange({ address: label, lat: null, lng: null });
    try {
      const place = await resolvePlace({ data: { placeId } });
      if (place) {
        setQuery(place.address || label);
        onChange({ address: place.address || label, lat: place.lat, lng: place.lng });
      }
    } catch {
      /* keep the typed address if the lookup fails */
    }
  };

  const points: MapPoint[] =
    value.lat != null && value.lng != null
      ? [{ lat: value.lat, lng: value.lng, label: value.address, kind: "dropoff" }]
      : [];

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label ?? t("customer.checkout.addressLabel")}</Label>
      <div className="relative">
        <Input
          id={id}
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            onChange({ address: e.target.value, lat: null, lng: null });
          }}
          placeholder={placeholder ?? t("customer.checkout.addressPlaceholder")}
        />
        {open && suggestions.length > 0 ? (
          <ul className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-ink/10 bg-card shadow-soft">
            {suggestions.map((s) => (
              <li key={s.placeId}>
                <button
                  type="button"
                  className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                  onClick={() => void pick(s.placeId, s.label)}
                >
                  <MapPin className="mt-0.5 size-4 shrink-0 text-foreground/50" aria-hidden />
                  <span>{s.label}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {isError ? (
        <p className="text-xs text-foreground/50">{t("customer.checkout.addressSuggestionsOff")}</p>
      ) : null}
      {points.length > 0 ? (
        <>
          <MapView points={points} className="h-40 w-full" zoom={16} />
          <p className="text-xs text-foreground/60">{t("customer.checkout.addressConfirmed")}</p>
        </>
      ) : null}
    </div>
  );
}
