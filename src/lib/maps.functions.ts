import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";
const GOOGLE_LEGACY = "https://maps.googleapis.com";
const GOOGLE_PLACES = "https://places.googleapis.com";
const GOOGLE_ROUTES = "https://routes.googleapis.com";
const GOOGLE_KEY_HEADER = "X-Goog-Api-Key";

/**
 * Map credentials. Two working modes, so the app runs both here and elsewhere:
 *  - Hosted by Lovable: LOVABLE_API_KEY + GOOGLE_MAPS_API_KEY present, so calls
 *    go through Lovable's connector gateway.
 *  - Self-hosted: GOOGLE_MAPS_API_KEY alone (your own Google Cloud key with
 *    Geocoding, Places and Routes enabled) and calls go straight to Google.
 */
function mapsKey() {
  const key = process.env["GOOGLE_MAPS_API_KEY"];
  if (!key) throw new Error("MAPS_NOT_CONFIGURED");
  return key;
}

function viaGateway() {
  return Boolean(process.env["LOVABLE_API_KEY"]);
}

function gatewayHeaders(extra: Record<string, string> = {}) {
  return {
    Authorization: `Bearer ${process.env["LOVABLE_API_KEY"]}`,
    "X-Connection-Api-Key": mapsKey(),
    ...extra,
  };
}

function googleHeaders(extra: Record<string, string> = {}) {
  return { [GOOGLE_KEY_HEADER]: mapsKey(), ...extra };
}

/** Legacy Geocoding API: gateway path, or direct with the key as a query param. */
function geocodeFetch(query: string) {
  if (viaGateway()) {
    return fetch(`${GATEWAY_URL}/maps/api/geocode/json?${query}`, { headers: gatewayHeaders() });
  }
  return fetch(`${GOOGLE_LEGACY}/maps/api/geocode/json?${query}&key=${encodeURIComponent(mapsKey())}`);
}

/** Places / Routes APIs: gateway path, or direct with an API-key header. */
function googleApiFetch(
  gatewayPath: string,
  directUrl: string,
  init: RequestInit,
  extraHeaders: Record<string, string>,
) {
  if (viaGateway()) {
    return fetch(`${GATEWAY_URL}${gatewayPath}`, { ...init, headers: gatewayHeaders(extraHeaders) });
  }
  return fetch(directUrl, { ...init, headers: googleHeaders(extraHeaders) });
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
    const response = await geocodeFetch(`address=${encodeURIComponent(data.address)}`);
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
    const response = await googleApiFetch(
      "/places/v1/places:autocomplete",
      `${GOOGLE_PLACES}/v1/places:autocomplete`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: data.input,
          ...(data.country ? { includedRegionCodes: [data.country.toUpperCase()] } : {}),
        }),
      },
      { "Content-Type": "application/json" },
    );
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
    const response = await googleApiFetch(
      `/places/v1/places/${encodeURIComponent(data.placeId)}`,
      `${GOOGLE_PLACES}/v1/places/${encodeURIComponent(data.placeId)}`,
      { headers: { "X-Goog-FieldMask": "formattedAddress,location" } },
      { "X-Goog-FieldMask": "formattedAddress,location" },
    );
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
    const response = await googleApiFetch(
      "/routes/directions/v2:computeRoutes",
      `${GOOGLE_ROUTES}/directions/v2:computeRoutes`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-FieldMask": "routes.polyline.encodedPolyline,routes.distanceMeters,routes.duration",
        },
        body: JSON.stringify({
          origin: point(stops[0]!),
          destination: point(stops[stops.length - 1]!),
          ...(stops.length > 2 ? { intermediates: stops.slice(1, -1).map(point) } : {}),
          travelMode: "DRIVE",
        }),
      },
      {
        "Content-Type": "application/json",
        "X-Goog-FieldMask": "routes.polyline.encodedPolyline,routes.distanceMeters,routes.duration",
      },
    );
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

/**
 * Turns the visitor's device coordinates into a written street address.
 * Public on purpose: the homepage hero uses it before anyone signs in.
 * One call per visit, coordinates only, address text only in the response.
 */
export const reverseGeocodePublic = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) })
      .parse(data),
  )
  .handler(async ({ data }): Promise<string | null> => {
    const latlng = `${data.lat.toFixed(6)},${data.lng.toFixed(6)}`;
    const response = await geocodeFetch(`latlng=${encodeURIComponent(latlng)}`);
    const body = (await readOrThrow(response, "Reverse geocoding")) as {
      results?: Array<{ formatted_address?: string }>;
    };
    return body.results?.[0]?.formatted_address ?? null;
  });
