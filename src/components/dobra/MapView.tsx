import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n";
import { mapsBrowserKey } from "@/lib/maps";
import { cn } from "@/lib/utils";

export type MapPointKind = "driver" | "pickup" | "dropoff";
export type MapPoint = { lat: number; lng: number; label?: string; kind?: MapPointKind };

let loader: Promise<void> | null = null;

/** Google calls this global when the key is rejected for this domain. */
let authFailed = false;
const authListeners = new Set<() => void>();
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>)["gm_authFailure"] = () => {
    authFailed = true;
    authListeners.forEach((l) => l());
  };
}

/** Brand colours for the markers. */
const MARKER_COLOR: Record<MapPointKind, string> = {
  driver: "#DC3A2A",
  pickup: "#FFCE0A",
  dropoff: "#2B2723",
};

function loadMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const w = window as unknown as { google?: { maps?: unknown } };
  if (w.google?.maps) return Promise.resolve();
  if (loader) return loader;

  // Browser map key. Real key goes in Project Settings → Secrets (Google Maps connection).
  const key = mapsBrowserKey;
  const channel = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"] ?? "";
  if (!key) return Promise.reject(new Error("MAPS_NOT_CONFIGURED"));

  loader = new Promise<void>((resolve, reject) => {
    const cbName = "__dobraInitMap";
    (window as unknown as Record<string, unknown>)[cbName] = () => resolve();
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&libraries=geometry&callback=${cbName}&channel=${channel}`;
    script.async = true;
    script.onerror = () => reject(new Error("MAPS_LOAD_FAILED"));
    document.head.appendChild(script);
  });
  return loader;
}

type Props = {
  points: MapPoint[];
  /** Encoded Google polyline for a driving route. */
  path?: string | null;
  className?: string;
  zoom?: number;
};

/** Renders a real Google map with branded markers and an optional route. Client-side only. */
export function MapView({ points, path, className, zoom = 14, fallback }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const lineRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(authFailed ? "MAPS_KEY_REJECTED" : null);

  useEffect(() => {
    const listener = () => setError("MAPS_KEY_REJECTED");
    authListeners.add(listener);
    return () => {
      authListeners.delete(listener);
    };
  }, []);
  const t = useT();

  useEffect(() => {
    let cancelled = false;
    if (points.length === 0) return;

    loadMaps()
      .then(() => {
        if (cancelled || !ref.current) return;
        const g = (window as any).google;
        if (!mapRef.current) {
          mapRef.current = new g.maps.Map(ref.current, {
            center: points[0],
            zoom,
            disableDefaultUI: true,
            zoomControl: true,
            gestureHandling: "greedy",
          });
        }
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = points.map(
          (p) =>
            new g.maps.Marker({
              position: { lat: p.lat, lng: p.lng },
              map: mapRef.current,
              title: p.label ?? "",
              icon: {
                path: g.maps.SymbolPath.CIRCLE,
                scale: 9,
                fillColor: MARKER_COLOR[p.kind ?? "dropoff"],
                fillOpacity: 1,
                strokeColor: "#FFFDF6",
                strokeWeight: 3,
              },
            }),
        );

        lineRef.current?.setMap(null);
        lineRef.current = null;
        const decoded = path ? g.maps.geometry?.encoding?.decodePath(path) : null;
        if (decoded?.length) {
          lineRef.current = new g.maps.Polyline({
            path: decoded,
            map: mapRef.current,
            strokeColor: "#DC3A2A",
            strokeOpacity: 0.9,
            strokeWeight: 5,
          });
        }

        const bounds = new g.maps.LatLngBounds();
        points.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
        decoded?.forEach((p: unknown) => bounds.extend(p as never));
        if (points.length > 1 || decoded?.length) {
          mapRef.current.fitBounds(bounds, 60);
        } else {
          mapRef.current.setCenter(points[0]);
        }
      })
      .catch((e: Error) => !cancelled && setError(e.message));

    return () => {
      cancelled = true;
    };
  }, [points, path, zoom]);

  if ((error || !mapsBrowserKey) && fallback) return <>{fallback}</>;
  if (error || !mapsBrowserKey) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-xl bg-muted px-4 text-center text-xs text-foreground/60",
          className,
        )}
      >
        {t("common.mapUnavailable")}
      </div>
    );
  }

  return <div ref={ref} className={cn("rounded-xl bg-muted", className)} role="img" aria-label={t("common.mapAria")} />;
}
