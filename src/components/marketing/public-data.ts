import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Live data shown on the public website (readable without signing in). */

export type PublicRestaurant = {
  id: string;
  name: string;
  cuisine: string | null;
  city: string | null;
  logo_url: string | null;
  eta_minutes: number;
  delivery_fee: number;
  rating: number;
  featured: boolean;
  is_open: boolean;
};

export const publicRestaurantsQuery = queryOptions({
  queryKey: ["public", "restaurants"],
  queryFn: async (): Promise<PublicRestaurant[]> => {
    const { data, error } = await (supabase.rpc as unknown as (fn: string) => Promise<{ data: unknown; error: Error | null }>)(
      "public_restaurants",
    );
    if (error) throw error;
    return (data ?? []) as PublicRestaurant[];
  },
  staleTime: 60_000,
});

export const publicPricingQuery = queryOptions({
  queryKey: ["public", "pricing"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("country_pricing")
      .select("country,currency,enabled,commission_pct,service_fee,delivery_fee,min_order,package_base_fee,package_per_km,package_min_fee")
      .eq("enabled", true)
      .order("country");
    if (error) throw error;
    return data ?? [];
  },
  staleTime: 60_000,
});

export const publicCitiesQuery = queryOptions({
  queryKey: ["public", "cities"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("cities")
      .select("name,country,enabled,sort")
      .eq("enabled", true)
      .order("sort");
    if (error) throw error;
    return data ?? [];
  },
  staleTime: 60_000,
});
