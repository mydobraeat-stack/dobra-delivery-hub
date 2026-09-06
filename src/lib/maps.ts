import { queryOptions } from "@tanstack/react-query";
import { geocodeAddress } from "./maps.functions";

export function addressPointQuery(address: string | null | undefined) {
  return queryOptions({
    queryKey: ["geocode", address ?? ""],
    enabled: Boolean(address && address.trim().length > 3),
    staleTime: 24 * 60 * 60 * 1000,
    queryFn: () => geocodeAddress({ data: { address: address!.trim() } }),
  });
}
