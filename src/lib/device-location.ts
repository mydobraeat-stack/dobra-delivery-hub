import { reverseGeocodePublic } from "@/lib/maps.functions";

export const PRECISE: PositionOptions = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 };

export function getPrecisePosition(): Promise<{ lat: number; lng: number; accuracy: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      reject(new Error("unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }),
      reject,
      PRECISE,
    );
  });
}

/** Exact device position plus its written street address. */
export async function locateDevice(): Promise<{ address: string; lat: number; lng: number }> {
  const pos = await getPrecisePosition();
  let address: string | null = null;
  try {
    address = await reverseGeocodePublic({ data: { lat: pos.lat, lng: pos.lng } });
  } catch {
    /* fall back to coordinates */
  }
  return { address: address ?? `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`, lat: pos.lat, lng: pos.lng };
}
