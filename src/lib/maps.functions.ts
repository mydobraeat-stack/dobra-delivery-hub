import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";

/** Turns a written address into map coordinates. Signed-in callers only. */
export const geocodeAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ address: z.string().min(3).max(250) }).parse(data))
  .handler(async ({ data }): Promise<{ lat: number; lng: number } | null> => {
    const lovableKey = process.env["LOVABLE_API_KEY"];
    const connectionKey = process.env["GOOGLE_MAPS_API_KEY"];
    if (!lovableKey || !connectionKey) throw new Error("Maps are not configured.");

    const response = await fetch(
      `${GATEWAY_URL}/maps/api/geocode/json?address=${encodeURIComponent(data.address)}`,
      {
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": connectionKey,
        },
      },
    );

    if (!response.ok) {
      const body = await response.text();
      console.error(`Geocoding failed [${response.status}]: ${body}`);
      throw new Error(`Map lookup failed [${response.status}]`);
    }

    const body = (await response.json()) as {
      status?: string;
      results?: Array<{ geometry?: { location?: { lat: number; lng: number } } }>;
    };
    const location = body.results?.[0]?.geometry?.location;
    return location ? { lat: location.lat, lng: location.lng } : null;
  });
