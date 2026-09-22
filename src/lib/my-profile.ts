import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** The signed-in member's own profile row. */
export const myProfileQuery = queryOptions({
  queryKey: ["my-profile"],
  queryFn: async () => {
    const { data: auth } = await supabase.auth.getUser();
    const id = auth.user?.id;
    if (!id) throw new Error("Not signed in");
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, country, phone, avatar_url, approval_status, created_at")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return { ...data, id, email: data?.email ?? auth.user?.email ?? null };
  },
});
