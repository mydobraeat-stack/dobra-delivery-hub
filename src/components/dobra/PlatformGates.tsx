import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Wrench, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { platformSettingsQuery } from "@/lib/admin-ops";
import { Button } from "@/components/ui/button";

const myStatusQuery = {
  queryKey: ["account-status"],
  queryFn: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return null;
    const { data } = await supabase
      .from("profiles")
      .select("account_status,suspension_reason")
      .eq("id", u.user.id)
      .maybeSingle();
    return data as { account_status: string; suspension_reason: string | null } | null;
  },
  staleTime: 60_000,
};

/** Blocks suspended / banned accounts everywhere inside the signed-in app. */
export function AccountGate({ children }: { children: ReactNode }) {
  const { data } = useQuery(myStatusQuery);
  const qc = useQueryClient();
  if (data && data.account_status !== "active") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-sm space-y-4 text-center">
          <ShieldAlert className="mx-auto size-12 text-primary" aria-hidden />
          <h1 className="text-2xl font-bold">
            {data.account_status === "banned" ? "Account banned" : "Account suspended"}
          </h1>
          <p className="text-foreground/70">
            {data.suspension_reason || "Your account has been restricted."} Contact support@mydobra.pl if you think this is a mistake.
          </p>
          <Button
            variant="outline"
            onClick={async () => {
              await supabase.auth.signOut();
              qc.clear();
              window.location.href = "/auth";
            }}
          >
            Sign out
          </Button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

/** Customer-only "we'll be right back" screen controlled from admin Platform. */
export function MaintenanceGate({ children }: { children: ReactNode }) {
  const { data } = useQuery({ ...platformSettingsQuery, refetchInterval: 60_000 });
  if (data?.maintenance_mode) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-6">
        <div className="max-w-sm space-y-3 text-center">
          <Wrench className="mx-auto size-12 text-primary" aria-hidden />
          <h1 className="text-2xl font-bold">We'll be right back</h1>
          <p className="text-foreground/70">{data.maintenance_message}</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
