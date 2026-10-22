import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  allPricingQuery,
  citiesQuery,
  deleteCity,
  saveCity,
  savePricing,
  type CityRow,
} from "@/lib/admin-ops";
import type { CountryPricing } from "@/lib/dobra";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/pricing")({
  component: PricingPage,
});

const FIELDS: { key: keyof CountryPricing; label: string; hint?: string }[] = [
  { key: "commission_pct", label: "Platform commission (%)", hint: "Default for restaurants without their own rate" },
  { key: "driver_payout_pct", label: "Driver payout (% of order total)", hint: "Shown to drivers on offers, deliveries and earnings" },
  { key: "service_fee", label: "Customer service fee" },
  { key: "delivery_fee", label: "Default delivery fee", hint: "Used when a restaurant has no fee set" },
  { key: "min_order", label: "Minimum order value" },
  { key: "package_base_fee", label: "Package base fee" },
  { key: "package_per_km", label: "Package per-km rate" },
  { key: "package_min_fee", label: "Package minimum fee" },
];

function PricingPage() {
  const { data } = useQuery(allPricingQuery);
  const cities = useQuery(citiesQuery);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Fees & pricing</h1>
        <p className="text-sm text-foreground/60">
          All fees are per country and in that country's currency. Changes apply to new orders immediately.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {(data ?? []).map((row) => (
          <CountryCard key={row.country} row={row} />
        ))}
      </div>
      <RestaurantFeesSection />
      <CitiesSection cities={cities.data ?? []} countries={(data ?? []).map((r) => r.country)} />
    </div>
  );
}

function CountryCard({ row }: { row: CountryPricing }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(row);
  const [busy, setBusy] = useState(false);
  useEffect(() => setForm(row), [row]);

  const save = async () => {
    setBusy(true);
    try {
      const clean = { ...form } as CountryPricing;
      for (const f of FIELDS) (clean as Record<string, unknown>)[f.key] = Number(form[f.key]) || 0;
      await savePricing(clean);
      toast.success(`${row.country} pricing saved`);
      qc.invalidateQueries({ queryKey: ["admin", "pricing"] });
      qc.invalidateQueries({ queryKey: ["pricing"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">{row.country}</h2>
          <p className="text-xs text-foreground/60">Currency</p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            aria-label="Currency"
            className="w-20 uppercase"
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
          />
          <label className="flex items-center gap-2 text-sm font-medium">
            <Switch checked={form.enabled} onCheckedChange={(v) => setForm({ ...form, enabled: v })} />
            {form.enabled ? "Live" : "In setup"}
          </label>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.key} className="space-y-1">
            <Label htmlFor={`${row.country}-${f.key}`}>{f.label}</Label>
            <Input
              id={`${row.country}-${f.key}`}
              type="number"
              step="0.01"
              min="0"
              value={String(form[f.key] ?? "")}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            />
            {f.hint ? <p className="text-[11px] text-foreground/50">{f.hint}</p> : null}
          </div>
        ))}
      </div>
      <Button onClick={save} disabled={busy}>
        {busy ? "Saving…" : "Save pricing"}
      </Button>
    </Card>
  );
}

function CitiesSection({ cities, countries }: { cities: CityRow[]; countries: string[] }) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [country, setCountry] = useState(countries[0] ?? "Poland");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const refresh = () => qc.invalidateQueries({ queryKey: ["cities"] });

  const update = async (c: CityRow, patch: Partial<CityRow>) => {
    try {
      await saveCity({ ...c, ...patch });
      refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const add = async () => {
    try {
      await saveCity({ name: name.trim(), country, lat: Number(lat) || 0, lng: Number(lng) || 0, sort: 99 });
      setName("");
      setLat("");
      setLng("");
      toast.success("City added");
      refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <Card className="space-y-4 p-5">
      <div>
        <h2 className="text-lg font-bold">Cities we serve</h2>
        <p className="text-sm text-foreground/60">
          Enabled cities show on the public website. A delivery fee override replaces the restaurant's fee in that city.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="text-left text-foreground/60">
            <tr>
              <th className="py-2">City</th>
              <th>Country</th>
              <th>Live</th>
              <th>Delivery fee override</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {cities.map((c) => (
              <tr key={c.id} className="border-t border-ink/10">
                <td className="py-2 font-medium">{c.name}</td>
                <td>{c.country}</td>
                <td>
                  <Switch
                    aria-label={`${c.name} live`}
                    checked={c.enabled}
                    onCheckedChange={(v) => update(c, { enabled: v })}
                  />
                </td>
                <td>
                  <Input
                    aria-label={`${c.name} fee override`}
                    className="h-8 w-28"
                    type="number"
                    step="0.01"
                    placeholder="—"
                    defaultValue={c.delivery_fee_override ?? ""}
                    onBlur={(e) => {
                      const v = e.target.value === "" ? null : Number(e.target.value);
                      if (v !== c.delivery_fee_override) update(c, { delivery_fee_override: v });
                    }}
                  />
                </td>
                <td className="text-right">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Delete ${c.name}`}
                    onClick={async () => {
                      if (!window.confirm(`Remove ${c.name}?`)) return;
                      await deleteCity(c.id);
                      refresh();
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <Label htmlFor="new-city">New city</Label>
          <Input id="new-city" value={name} onChange={(e) => setName(e.target.value)} className="w-40" />
        </div>
        <select
          aria-label="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          {countries.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <Input aria-label="Latitude" placeholder="Lat" value={lat} onChange={(e) => setLat(e.target.value)} className="w-24" />
        <Input aria-label="Longitude" placeholder="Lng" value={lng} onChange={(e) => setLng(e.target.value)} className="w-24" />
        <Button onClick={add} disabled={!name.trim()}>
          Add city
        </Button>
      </div>
    </Card>
  );
}

type RestaurantFee = { id: string; name: string; city: string | null; country: string | null; delivery_fee: number; commission_rate: number | null };

function RestaurantFeesSection() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin", "restaurant-fees"],
    queryFn: async (): Promise<RestaurantFee[]> => {
      const { data, error } = await supabase
        .from("restaurants")
        .select("id,name,city,country,delivery_fee,commission_rate")
        .order("name");
      if (error) throw error;
      return (data ?? []) as RestaurantFee[];
    },
  });
  const save = async (r: RestaurantFee, patch: Partial<RestaurantFee>) => {
    const { error } = await supabase.from("restaurants").update(patch).eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success(`${r.name} updated`);
    qc.invalidateQueries({ queryKey: ["admin", "restaurant-fees"] });
    qc.invalidateQueries({ queryKey: ["restaurant"] });
  };
  return (
    <Card className="space-y-3 p-5">
      <div>
        <h2 className="text-lg font-bold">Restaurant fees</h2>
        <p className="text-xs text-foreground/60">
          Each restaurant's delivery fee (a city override above still wins) and its own commission. Leave commission empty to use the country default.
        </p>
      </div>
      <div className="divide-y divide-ink/10">
        {data.map((r) => (
          <div key={r.id} className="flex flex-wrap items-end gap-3 py-3">
            <div className="min-w-40 flex-1">
              <p className="font-semibold">{r.name}</p>
              <p className="text-xs text-foreground/60">{[r.city, r.country].filter(Boolean).join(", ") || "—"}</p>
            </div>
            <div className="space-y-1">
              <Label htmlFor={`df-${r.id}`} className="text-xs">Delivery fee</Label>
              <Input
                id={`df-${r.id}`}
                className="w-28"
                type="number"
                step="0.01"
                min="0"
                defaultValue={r.delivery_fee}
                onBlur={(e) => {
                  const v = Number(e.target.value);
                  if (e.target.value !== "" && v >= 0 && v !== Number(r.delivery_fee)) save(r, { delivery_fee: v });
                }}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`cm-${r.id}`} className="text-xs">Commission %</Label>
              <Input
                id={`cm-${r.id}`}
                className="w-28"
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="Default"
                defaultValue={r.commission_rate ?? ""}
                onBlur={(e) => {
                  const v = e.target.value === "" ? null : Number(e.target.value);
                  if (v !== (r.commission_rate ?? null) && (v === null || (v >= 0 && v <= 100))) save(r, { commission_rate: v });
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
