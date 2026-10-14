import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribes to live order + driver-location changes and refreshes the
 * matching queries. When the app comes back to the foreground (e.g. after the
 * driver used Google Maps) data is refetched and a dropped channel is rebuilt.
 */
export function useRealtimeSync() {
  const queryClient = useQueryClient();
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    const channel = supabase
      .channel(`dobra-live-${generation}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
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

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
      queryClient.invalidateQueries({ queryKey: ["driver-location"] });
      if (channel.state !== "joined" && channel.state !== "joining") setGeneration((g) => g + 1);
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", onVisible);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onVisible);
      supabase.removeChannel(channel);
    };
  }, [queryClient, generation]);
}
