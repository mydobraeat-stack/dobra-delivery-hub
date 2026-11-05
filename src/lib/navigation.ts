import { useEffect, useState } from "react";
import { isNativeShell } from "@/lib/native-shell";

/** Google Maps travel mode for a driver's vehicle. */
export type TravelMode = "driving" | "bicycling" | "walking";

export function travelModeFor(vehicle: string | null | undefined): TravelMode {
  const v = (vehicle ?? "").trim().toLowerCase();
  if (v === "bicycle" || v === "e-bike") return "bicycling";
  if (v === "on foot") return "walking";
  return "driving";
}

export type Destination = { lat: number; lng: number } | string | null | undefined;

/** Google Maps directions URL. No origin, so Maps starts from the device's own location. */
export function directionsUrl(dest: Destination, mode: TravelMode): string | null {
  if (!dest) return null;
  let value: string;
  if (typeof dest === "string") {
    value = dest.trim();
    if (!value) return null;
  } else {
    value = `${dest.lat},${dest.lng}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(value)}&travelmode=${mode}`;
}

/** Full restaurant address: street, postal code + city, country. */
export function restaurantAddress(
  r: { address_line?: string | null; postal_code?: string | null; city?: string | null; country?: string | null; name?: string | null } | null | undefined,
): string | null {
  if (!r) return null;
  const cityLine = [r.postal_code, r.city].filter(Boolean).join(" ");
  const parts = [r.address_line, cityLine, r.country].filter((p) => p && String(p).trim());
  if (parts.length === 0) return r.name ?? null;
  // Without a street, include the name so Maps can find the place.
  if (!r.address_line && r.name) parts.unshift(r.name);
  return parts.join(", ");
}

type Leg = {
  kind: "food" | "package";
  address: string | null;
  dest_lat: number | null;
  dest_lng: number | null;
  pickup_address: string | null;
  pickup_lat: number | null;
  pickup_lng: number | null;
};

/** Destination of the first leg: restaurant (food) or sender (package). */
export function pickupDestination(order: Leg, restaurant: Parameters<typeof restaurantAddress>[0]): Destination {
  if (order.kind === "package") {
    if (order.pickup_lat != null && order.pickup_lng != null) return { lat: order.pickup_lat, lng: order.pickup_lng };
    return order.pickup_address;
  }
  return restaurantAddress(restaurant);
}

/** Destination of the second leg: the customer's saved checkout point, else the address text. */
export function dropoffDestination(order: Leg): Destination {
  if (order.dest_lat != null && order.dest_lng != null) return { lat: order.dest_lat, lng: order.dest_lng };
  return order.address;
}

/**
 * Must be called synchronously inside a tap handler (before any await),
 * otherwise browsers treat it as an unwanted popup. Returns false when blocked.
 */
export function openNavigation(url: string | null): boolean {
  if (!url || typeof window === "undefined") return false;
  // Inside the native app wrapper, new tabs don't exist: hand the link to the phone,
  // which opens it in the Google Maps app.
  if (isNativeShell()) {
    window.location.href = url;
    return true;
  }
  try {
    // No "noopener" feature: with it, browsers return null even on success.
    const w = window.open(url, "_blank");
    if (!w) return false;
    try {
      w.opener = null;
    } catch {
      /* cross-origin already */
    }
    return true;
  } catch {
    return false;
  }
}

/* ---------------------- "Open navigation automatically" --------------------- */

const AUTO_KEY = "dobra.autoNavigation";
const BLOCKED_KEY = "dobra.navBlocked";
const listeners = new Set<() => void>();

export function autoNavigationEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(AUTO_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setAutoNavigation(on: boolean) {
  try {
    window.localStorage.setItem(AUTO_KEY, on ? "on" : "off");
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function useAutoNavigation(): [boolean, (on: boolean) => void] {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const sync = () => setOn(autoNavigationEnabled());
    sync();
    listeners.add(sync);
    return () => {
      listeners.delete(sync);
    };
  }, []);
  return [on, setAutoNavigation];
}

/** Remembers that the browser blocked the auto-open, so the delivery screen can offer a big button. */
export function markNavigationBlocked(orderId: string, leg: "pickup" | "dropoff") {
  try {
    window.sessionStorage.setItem(BLOCKED_KEY, `${orderId}:${leg}`);
  } catch {
    /* ignore */
  }
}

export function takeNavigationBlocked(orderId: string): "pickup" | "dropoff" | null {
  try {
    const v = window.sessionStorage.getItem(BLOCKED_KEY);
    if (!v || !v.startsWith(`${orderId}:`)) return null;
    window.sessionStorage.removeItem(BLOCKED_KEY);
    return v.endsWith(":dropoff") ? "dropoff" : "pickup";
  } catch {
    return null;
  }
}
