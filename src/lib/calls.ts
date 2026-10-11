import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { normalizePhone } from "@/lib/phone";

export type CallTarget = "driver" | "customer" | "recipient";
export type CallAvailability = {
  active: boolean;
  driver?: boolean;
  customer?: boolean;
  recipient?: boolean;
};

/** Which parties have a number — booleans only; numbers are never fetched here. */
export const callAvailabilityQuery = (orderId: string, enabled = true) =>
  queryOptions({
    queryKey: ["call-availability", orderId],
    enabled,
    queryFn: async (): Promise<CallAvailability> => {
      const { data, error } = await supabase.rpc("call_availability", { _order: orderId });
      if (error) throw error;
      return (data ?? { active: false }) as CallAvailability;
    },
  });

/** Fetches the number at tap time (server checks access and logs the call), then opens the dialer. */
export async function startCall(orderId: string, target: CallTarget): Promise<"ok" | "missing"> {
  const { data, error } = await supabase.rpc("get_call_number", { _order: orderId, _target: target });
  if (error) throw error;
  if (!data) return "missing";
  window.location.href = `tel:${normalizePhone(String(data))}`;
  return "ok";
}

export function isActiveForCalls(order: { status: string; driver_id: string | null }) {
  return Boolean(order.driver_id) && order.status !== "delivered" && order.status !== "cancelled";
}
