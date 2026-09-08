import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSync } from "@/lib/realtime";
import { useNotificationStream } from "@/lib/notifications";
import { usePushRegistration } from "@/lib/push";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  useRealtimeSync();
  useNotificationStream();
  usePushRegistration();
  return <Outlet />;
}
