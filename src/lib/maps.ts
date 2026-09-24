import { queryOptions } from "@tanstack/react-query";
import { geocodeAddress, routeBetween, suggestAddresses } from "./maps.functions";

/** Dobra's own browser key (website-restricted in Google Cloud, safe to ship). Used on mydobra.pl. */
const OWN_BROWSER_KEY = "AIzaSyD3E9wt1qM2NJSXdu4rwvGgC7rY1lZvkbQ";
const MANAGED_BROWSER_KEY = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"] as
  | string
  | undefined;

function pickBrowserKey(): string | undefined {
  if (typeof window === "undefined") return MANAGED_BROWSER_KEY ?? OWN_BROWSER_KEY;
  const host = window.location.hostname;
  const onLovable = host.endsWith(".lovable.app") || host.endsWith(".lovableproject.com");
  return onLovable ? (MANAGED_BROWSER_KEY ?? OWN_BROWSER_KEY) : OWN_BROWSER_KEY;
}

/** True when a browser map key is available; otherwise screens show a friendly note. */
export const mapsBrowserKey = pickBrowserKey();

export function addressPointQuery(address: string | null | undefined) {
  return queryOptions({
    queryKey: ["geocode", address ?? ""],
    enabled: Boolean(address && address.trim().length > 3),
    staleTime: 24 * 60 * 60 * 1000,
    queryFn: () => geocodeAddress({ data: { address: address!.trim() } }),
  });
}

export function addressSuggestionsQuery(input: string) {
  return queryOptions({
    queryKey: ["address-suggestions", input],
    enabled: input.trim().length >= 3,
    staleTime: 5 * 60 * 1000,
    queryFn: () => suggestAddresses({ data: { input: input.trim() } }),
  });
}

type Stop = { lat: number; lng: number };

export function routeQuery(stops: (Stop | null | undefined)[]) {
  const clean = stops.filter(Boolean) as Stop[];
  return queryOptions({
    queryKey: ["route", clean.map((s) => `${s.lat.toFixed(4)},${s.lng.toFixed(4)}`).join("|")],
    enabled: clean.length >= 2,
    staleTime: 60 * 1000,
    queryFn: () => routeBetween({ data: { stops: clean.slice(0, 4) } }),
  });
}
