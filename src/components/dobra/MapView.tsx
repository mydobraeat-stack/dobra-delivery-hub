import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type MapPoint = { lat: number; lng: number; label?: string };

let loader: Promise<void> | null = null;

function loadMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const w = window as unknown as { google?: { maps?: unknown } };
  if (w.google?.maps) return Promise.resolve();
  if (loader) return loader;

  const key = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"];
  const channel = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"] ?? "";
  if (!key) return Promise.reject(new Error("Maps are not configured."));

  loader = new Promise<void>((resolve, reject) => {
    const cbName = "__dobraInitMap";
    (window as unknown as Record<string, unknown>)[cbName] = () => resolve();
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=${cbName}&channel=${channel}`;
    script.async = true;
    script.onerror = () => reject(new Error("Map could not be loaded."));
    document.head.appendChild(script);
  });
  return loader;
}

type Props = {
  points: MapPoint[];
  className?: string;
  zoom?: number;
};

/** Renders a real Google map with a marker per point. Client-side only. */
export function MapView({ points, className, zoom = 14 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [error, setError] = useState<string | null>(null);

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
            }),
        );
        if (points.length > 1) {
          const bounds = new g.maps.LatLngBounds();
          points.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
          mapRef.current.fitBounds(bounds, 60);
        } else {
          mapRef.current.setCenter(points[0]);
        }
      })
      .catch((e: Error) => !cancelled && setError(e.message));

    return () => {
      cancelled = true;
    };
  }, [points, zoom]);

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-xl bg-muted text-xs text-foreground/60",
          className,
        )}
      >
        {error}
      </div>
    );
  }

  return <div ref={ref} className={cn("rounded-xl bg-muted", className)} role="img" aria-label="Map" />;
}
