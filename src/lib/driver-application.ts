import { supabase } from "@/integrations/supabase/client";

export async function startDriverApplication() {
  const { error } = await supabase.rpc("start_driver_application");
  if (error) throw error;
}

export async function switchAccountMode(mode: "customer" | "driver") {
  const { error } = await supabase.rpc("switch_account_mode", { _mode: mode });
  if (error) throw error;
}