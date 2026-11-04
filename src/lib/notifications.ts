import { useEffect } from "react";
import { queryOptions, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { initSoundUnlock, playSound, type SoundName } from "@/lib/sound";

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  related_order_id: string | null;
  link: string | null;
  sound: boolean;
  read: boolean;
  created_at: string;
};

const COLS = "id,type,title,message,related_order_id,link,sound,read,created_at";

export const notificationsQuery = queryOptions({
  queryKey: ["notifications"],
  queryFn: async (): Promise<AppNotification[]> => {
    const { data, error } = await supabase
      .from("notifications")
      .select(COLS)
      .order("created_at", { ascending: false })
      .limit(40);
    if (error) throw error;
    return (data ?? []) as AppNotification[];
  },
});

export async function markNotificationRead(id: string) {
  const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
  if (error) throw error;
}

export async function markAllNotificationsRead() {
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  if (!userId) return;
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
  if (error) throw error;
}

function soundFor(type: string): SoundName {
  if (type === "order_new" || type === "signup_pending" || type === "delivery_available") return "alert";
  if (type === "order_delivered" || type === "account_approved") return "success";
  return "soft";
}

/**
 * Subscribes to the signed-in user's notifications and pops a toast + chime
 * as they arrive. Mounted once, in the authenticated layout.
 */
export function useNotificationStream() {
  const queryClient = useQueryClient();

  useEffect(() => initSoundUnlock(), []);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    void supabase.auth.getUser().then(({ data }) => {
      const userId = data.user?.id;
      if (!userId || cancelled) return;

      channel = supabase
        .channel(`notifications-${userId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
          (payload) => {
            const row = payload.new as AppNotification;
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            // Row-level realtime on `orders` is filtered by RLS and never reaches
            // vendors/drivers (their policies join other tables). Every order event
            // already writes a notification for the parties involved, so refresh the
            // order views from here — that is what keeps their lists live.
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["order"] });
            queryClient.invalidateQueries({ queryKey: ["order-items"] });
            queryClient.invalidateQueries({ queryKey: ["admin"] });
            if (row.type.startsWith("driver_application_")) {
              queryClient.invalidateQueries({ queryKey: ["driver"] });
              queryClient.invalidateQueries({ queryKey: ["account"] });
            }
            if (row.sound) playSound(soundFor(row.type));
            toast(row.title, { description: row.message });
          },
        )
        .subscribe();
    });

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
