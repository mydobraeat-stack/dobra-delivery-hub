import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { resolveAccountMode } from "@/lib/account-mode";

export type AppRole = "customer" | "vendor" | "driver" | "admin" | "support_agent";

export type AccountInfo = {
  role: AppRole;
  roles: AppRole[];
  fullName: string | null;
  approvalStatus: string;
};

export const accountQueryOptions = queryOptions({
  queryKey: ["account"],
  queryFn: async (): Promise<AccountInfo> => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error("Not signed in");

    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, approval_status, preferred_mode")
        .eq("id", userId)
        .maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);

    const assignedRoles: AppRole[] = roles?.map(r => r.role) ?? ["customer"];
    return {
      role: resolveAccountMode(assignedRoles, profile?.preferred_mode ?? null),
      roles: assignedRoles,
      fullName: profile?.full_name ?? null,
      approvalStatus: profile?.approval_status ?? "pending",
    };
  },
});
