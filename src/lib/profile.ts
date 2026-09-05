import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "customer" | "vendor" | "driver";

export type AccountInfo = {
  role: AppRole;
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
        .select("full_name, approval_status")
        .eq("id", userId)
        .maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);

    return {
      role: (roles?.[0]?.role as AppRole) ?? "customer",
      fullName: profile?.full_name ?? null,
      approvalStatus: profile?.approval_status ?? "pending",
    };
  },
});
