import { useEffect } from "react";
import { saveDriverLocation } from "@/lib/dobra";

/**
 * Publishes the driver's GPS position (at most every 10 s) while `enabled`.
 * Browsers pause GPS for background tabs, so the watch is restarted and a
 * fresh fix is sent as soon as the driver switches back to Dobra.
 */
export function usePublishDriverLocation(
  enabled: boolean,
  onPosition?: (p: { lat: number; lng: number }) => void,
) {
  useEffect(() => {
    if (!enabled || typeof navigator === "undefined" || !("geolocation" in navigator)) return;
    let last = 0;
    let watchId: number | null = null;
    const handle = (pos: GeolocationPosition, force = false) => {
      const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      onPosition?.(p);
      const now = Date.now();
      if (!force && now - last < 10_000) return;
      last = now;
      void saveDriverLocation(p.lat, p.lng).catch(() => undefined);
    };
    const start = () => {
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
      watchId = navigator.geolocation.watchPosition((p) => handle(p), () => undefined, {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 20000,
      });
    };
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      navigator.geolocation.getCurrentPosition((p) => handle(p, true), () => undefined, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000,
      });
      start();
    };
    start();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", onVisible);
    return () => {
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onVisible);
    };
  }, [enabled]);
}
