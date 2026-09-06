import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribes once to live order + driver-location changes and refreshes the
 * matching queries. Replaces the old timer-based polling.
 */
export function useRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("dobra-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        queryClient.invalidateQueries({ queryKey: ["vendor-orders"] });
        queryClient.invalidateQueries({ queryKey: ["driver-orders"] });
        queryClient.invalidateQueries({ queryKey: ["order"] });
        queryClient.invalidateQueries({ queryKey: ["admin"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, () => {
        queryClient.invalidateQueries({ queryKey: ["order"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "driver_locations" }, () => {
        queryClient.invalidateQueries({ queryKey: ["driver-location"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
