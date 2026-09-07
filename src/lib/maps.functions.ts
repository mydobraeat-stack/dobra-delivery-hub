import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";

/**
 * Map credentials live in project secrets, never in frontend code.
 * - Server side (this file): GOOGLE_MAPS_API_KEY  → Project Settings → Secrets
 * - Browser side (MapView):  VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY
 * Both are supplied automatically by the connected Google Maps account.
 */
function mapsCredentials() {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["GOOGLE_MAPS_API_KEY"];
  if (!lovableKey || !connectionKey) throw new Error("MAPS_NOT_CONFIGURED");
  return { lovableKey, connectionKey };
}

function gatewayHeaders(extra: Record<string, string> = {}) {
  const { lovableKey, connectionKey } = mapsCredentials();
  return {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": connectionKey,
    ...extra,
  };
}

async function readOrThrow(response: Response, what: string) {
  if (!response.ok) {
    const body = await response.text();
    console.error(`${what} failed [${response.status}]: ${body}`);
    throw new Error(`${what} failed [${response.status}]`);
  }
  return response.json();
}

/** Turns a written address into map coordinates. Signed-in callers only. */
export const geocodeAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ address: z.string().min(3).max(250) }).parse(data))
  .handler(async ({ data }): Promise<{ lat: number; lng: number } | null> => {
    const response = await fetch(
      `${GATEWAY_URL}/maps/api/geocode/json?address=${encodeURIComponent(data.address)}`,
      { headers: gatewayHeaders() },
    );
    const body = (await readOrThrow(response, "Geocoding")) as {
      results?: Array<{ geometry?: { location?: { lat: number; lng: number } } }>;
    };
    const location = body.results?.[0]?.geometry?.location;
    return location ? { lat: location.lat, lng: location.lng } : null;
  });

export type AddressSuggestion = { placeId: string; label: string };

/** Address suggestions while the customer types. Signed-in callers only. */
export const suggestAddresses = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ input: z.string().min(3).max(200), country: z.string().max(4).optional() }).parse(data),
  )
  .handler(async ({ data }): Promise<AddressSuggestion[]> => {
    const response = await fetch(`${GATEWAY_URL}/places/v1/places:autocomplete`, {
      method: "POST",
      headers: gatewayHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        input: data.input,
        ...(data.country ? { includedRegionCodes: [data.country.toUpperCase()] } : {}),
      }),
    });
    const body = (await readOrThrow(response, "Address lookup")) as {
      suggestions?: Array<{ placePrediction?: { placeId?: string; text?: { text?: string } } }>;
    };
    return (body.suggestions ?? [])
      .map((s) => ({ placeId: s.placePrediction?.placeId ?? "", label: s.placePrediction?.text?.text ?? "" }))
      .filter((s) => s.placeId && s.label)
      .slice(0, 5);
  });

/** Exact address + coordinates for a chosen suggestion. */
export const resolvePlace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ placeId: z.string().min(3).max(300) }).parse(data))
  .handler(async ({ data }): Promise<{ address: string; lat: number; lng: number } | null> => {
    const response = await fetch(`${GATEWAY_URL}/places/v1/places/${encodeURIComponent(data.placeId)}`, {
      headers: gatewayHeaders({ "X-Goog-FieldMask": "formattedAddress,location" }),
    });
    const body = (await readOrThrow(response, "Place lookup")) as {
      formattedAddress?: string;
      location?: { latitude?: number; longitude?: number };
    };
    const lat = body.location?.latitude;
    const lng = body.location?.longitude;
    if (typeof lat !== "number" || typeof lng !== "number") return null;
    return { address: body.formattedAddress ?? "", lat, lng };
  });

export type RouteResult = {
  polyline: string;
  distanceMeters: number;
  durationMinutes: number;
} | null;

/** Driving route through the given stops (start → optional stop → finish). */
export const routeBetween = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        stops: z
          .array(z.object({ lat: z.number(), lng: z.number() }))
          .min(2)
          .max(4),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<RouteResult> => {
    const point = (p: { lat: number; lng: number }) => ({
      location: { latLng: { latitude: p.lat, longitude: p.lng } },
    });
    const stops = data.stops;
    const response = await fetch(`${GATEWAY_URL}/routes/directions/v2:computeRoutes`, {
      method: "POST",
      headers: gatewayHeaders({
        "Content-Type": "application/json",
        "X-Goog-FieldMask": "routes.polyline.encodedPolyline,routes.distanceMeters,routes.duration",
      }),
      body: JSON.stringify({
        origin: point(stops[0]!),
        destination: point(stops[stops.length - 1]!),
        ...(stops.length > 2
          ? { intermediates: stops.slice(1, -1).map(point) }
          : {}),
        travelMode: "DRIVE",
      }),
    });
    const body = (await readOrThrow(response, "Directions")) as {
      routes?: Array<{
        polyline?: { encodedPolyline?: string };
        distanceMeters?: number;
        duration?: string;
      }>;
    };
    const route = body.routes?.[0];
    const encoded = route?.polyline?.encodedPolyline;
    if (!encoded) return null;
    const seconds = Number((route?.duration ?? "0s").replace("s", "")) || 0;
    return {
      polyline: encoded,
      distanceMeters: route?.distanceMeters ?? 0,
      durationMinutes: Math.max(1, Math.round(seconds / 60)),
    };
  });
