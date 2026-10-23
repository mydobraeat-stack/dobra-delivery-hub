import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CountryPricing } from "@/lib/dobra";

/** Calls an admin database action and surfaces its message as a normal Error. */
async function rpc<T = unknown>(fn: string, args: Record<string, unknown>): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
}

/* --------------------------------- orders -------------------------------- */

export const cancelOrder = (order: string, reason: string) =>
  rpc("admin_cancel_order", { _order: order, _reason: reason });
export const refundOrder = (order: string, amount: number, reason: string) =>
  rpc<string>("admin_refund_order", { _order: order, _amount: amount, _reason: reason });
export const reassignDriver = (order: string, driver: string | null) =>
  rpc("admin_reassign_driver", { _order: order, _driver: driver });
export const forceStatus = (order: string, status: string, reason: string) =>
  rpc("admin_force_status", { _order: order, _status: status, _reason: reason });
export const addNote = (order: string, body: string) =>
  rpc("admin_add_note", { _order: order, _body: body });
export const flagOrder = (order: string, note: string) =>
  rpc("admin_flag_order", { _order: order, _note: note });
export const resolveDispute = (id: string, note: string) =>
  rpc("admin_resolve_dispute", { _id: id, _note: note });

export type OrderMoney = {
  refund_amount: number;
  refund_status: string | null;
  cancel_reason: string | null;
  discount: number;
  promo_code: string | null;
  service_fee: number;
};

export function orderExtrasQuery(orderId: string) {
  return queryOptions({
    queryKey: ["admin", "order-extras", orderId],
    queryFn: async () => {
      const [{ data: o, error }, { data: notes, error: nErr }] = await Promise.all([
        supabase
          .from("orders")
          .select("refund_amount,refund_status,cancel_reason,discount,promo_code,service_fee")
          .eq("id", orderId)
          .single(),
        supabase
          .from("order_admin_notes")
          .select("id,body,created_at,author_id")
          .eq("order_id", orderId)
          .order("created_at", { ascending: false }),
      ]);
      if (error) throw error;
      if (nErr) throw nErr;
      // Call taps (who called whom, when) appear in the order's notes for dispute handling.
      const { data: calls } = await supabase
        .from("call_logs")
        .select("id,caller_id,caller_role,callee_role,created_at")
        .eq("order_id", orderId);
      const callNotes = (calls ?? []).map((c) => ({
        id: c.id,
        author_id: c.caller_id,
        created_at: c.created_at,
        body: `📞 Call: ${c.caller_role} → ${c.callee_role}`,
      }));
      const all = [...(notes ?? []), ...callNotes].sort((a, b) => b.created_at.localeCompare(a.created_at));
      return { money: o as unknown as OrderMoney, notes: all };
    },
  });
}

export type DriverOption = { id: string; name: string; status: string };

export const approvedDriversQuery = queryOptions({
  queryKey: ["admin", "approved-drivers"],
  queryFn: async (): Promise<DriverOption[]> => {
    const [{ data: roles }, { data: profiles }, { data: drivers }] = await Promise.all([
      supabase.from("user_roles").select("user_id").eq("role", "driver"),
      supabase
        .from("profiles")
        .select("id,full_name,email,approval_status,account_status"),
      supabase.from("drivers").select("id,status"),
    ]);
    const ids = new Set((roles ?? []).map((r) => r.user_id));
    const statusBy = new Map((drivers ?? []).map((d) => [d.id, d.status]));
    return (profiles ?? [])
      .filter(
        (p) =>
          ids.has(p.id) &&
          p.approval_status === "approved" &&
          (p as { account_status?: string }).account_status !== "suspended" &&
          (p as { account_status?: string }).account_status !== "banned",
      )
      .map((p) => ({
        id: p.id,
        name: p.full_name || p.email || p.id.slice(0, 8),
        status: statusBy.get(p.id) ?? "offline",
      }));
  },
});

/* -------------------------------- disputes ------------------------------- */

export type Dispute = {
  id: string;
  order_id: string;
  kind: string;
  description: string | null;
  status: string;
  resolution_note: string | null;
  created_at: string;
  resolved_at: string | null;
  synthetic?: boolean;
};

export const disputesQuery = queryOptions({
  queryKey: ["admin", "disputes"],
  queryFn: async (): Promise<Dispute[]> => {
    const [{ data, error }, { data: settings }, { data: live }] = await Promise.all([
      supabase.from("order_disputes").select("*").order("created_at", { ascending: false }),
      supabase.from("platform_settings").select("late_threshold_minutes").maybeSingle(),
      supabase
        .from("orders")
        .select("id,created_at,eta_minutes,status")
        .not("status", "in", "(delivered,cancelled)")
        .limit(500),
    ]);
    if (error) throw error;
    const threshold = Number(settings?.late_threshold_minutes ?? 30);
    const now = Date.now();
    const late: Dispute[] = (live ?? [])
      .filter(
        (o) =>
          new Date(o.created_at).getTime() + (Number(o.eta_minutes) + threshold) * 60_000 < now,
      )
      .map((o) => ({
        id: `late-${o.id}`,
        order_id: o.id,
        kind: "late",
        description: `Still "${o.status}" more than ${threshold} min past its estimated time.`,
        status: "open",
        resolution_note: null,
        created_at: o.created_at,
        resolved_at: null,
        synthetic: true,
      }));
    return [...late, ...((data ?? []) as Dispute[])];
  },
});

export async function reportProblem(orderId: string, description: string) {
  const { data: u } = await supabase.auth.getUser();
  const { error } = await supabase.from("order_disputes").insert({
    order_id: orderId,
    kind: "complaint",
    status: "open",
    description,
    created_by: u.user?.id ?? null,
  });
  if (error) throw error;
}

/* ------------------------------ pricing/cities ---------------------------- */

export const allPricingQuery = queryOptions({
  queryKey: ["admin", "pricing"],
  queryFn: async (): Promise<CountryPricing[]> => {
    const { data, error } = await supabase.from("country_pricing").select("*").order("country");
    if (error) throw error;
    return (data ?? []) as CountryPricing[];
  },
});

export async function savePricing(row: CountryPricing) {
  const { error } = await supabase.from("country_pricing").upsert(row);
  if (error) throw error;
}

export type CityRow = {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  enabled: boolean;
  delivery_fee_override: number | null;
  sort: number;
};

export const citiesQuery = queryOptions({
  queryKey: ["cities"],
  queryFn: async (): Promise<CityRow[]> => {
    const { data, error } = await supabase
      .from("cities")
      .select("*")
      .order("country")
      .order("sort");
    if (error) throw error;
    return (data ?? []) as CityRow[];
  },
});

export async function saveCity(row: Partial<CityRow> & { name: string; country: string }) {
  const { error } = await supabase.from("cities").upsert(row);
  if (error) throw error;
}
export async function deleteCity(id: string) {
  const { error } = await supabase.from("cities").delete().eq("id", id);
  if (error) throw error;
}

export type PlatformSettings = {
  maintenance_mode: boolean;
  maintenance_message: string;
  late_threshold_minutes: number;
};

export const platformSettingsQuery = queryOptions({
  queryKey: ["platform-settings"],
  queryFn: async (): Promise<PlatformSettings> => {
    const { data, error } = await supabase
      .from("platform_settings")
      .select("maintenance_mode,maintenance_message,late_threshold_minutes")
      .maybeSingle();
    if (error) throw error;
    return (
      data ?? { maintenance_mode: false, maintenance_message: "", late_threshold_minutes: 30 }
    );
  },
  staleTime: 30_000,
});

export async function savePlatformSettings(s: Partial<PlatformSettings>) {
  const { error } = await supabase.from("platform_settings").update(s).eq("id", 1);
  if (error) throw error;
}

/* ---------------------------------- users --------------------------------- */

export const setAccountStatus = (user: string, status: string, reason: string) =>
  rpc("admin_set_account_status", { _user: user, _status: status, _reason: reason });
export const setRole = (user: string, role: string) =>
  rpc("admin_set_role", { _user: user, _role: role });
export const setPrime = (user: string, active: boolean, months = 1) =>
  rpc("admin_set_prime", { _user: user, _active: active, _months: months });
export const broadcast = (title: string, message: string, role: string | null, country: string | null) =>
  rpc<number>("admin_broadcast", { _title: title, _message: message, _role: role, _country: country });
export const removeReview = (id: string, reason: string) =>
  rpc("admin_remove_review", { _id: id, _reason: reason });

export type UserRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  country: string | null;
  phone: string | null;
  approval_status: string;
  account_status: string;
  suspension_reason: string | null;
  created_at: string;
  deleted_at: string | null;
  role: string;
  prime: boolean;
};

export const usersQuery = queryOptions({
  queryKey: ["admin", "users"],
  queryFn: async (): Promise<UserRow[]> => {
    const [{ data: profiles, error }, { data: roles }, { data: prime }] = await Promise.all([
      supabase
        .from("profiles")
        .select(
          "id,email,full_name,country,phone,approval_status,account_status,suspension_reason,created_at,deleted_at",
        )
        .order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id,role"),
      supabase.from("prime_memberships").select("user_id,status,current_period_end"),
    ]);
    if (error) throw error;
    const roleBy = new Map((roles ?? []).map((r) => [r.user_id, r.role as string]));
    const primeBy = new Set(
      (prime ?? [])
        .filter(
          (p) =>
            p.status === "active" &&
            (!p.current_period_end || new Date(p.current_period_end).getTime() > Date.now()),
        )
        .map((p) => p.user_id),
    );
    return (profiles ?? []).map((p) => ({
      ...(p as Omit<UserRow, "role" | "prime">),
      role: roleBy.get(p.id) ?? "customer",
      prime: primeBy.has(p.id),
    }));
  },
});

export type DriverStats = {
  delivered: number;
  cancelled: number;
  assigned: number;
  rating: number | null;
  ratings: number;
};

export function driverStatsQuery(driverId: string) {
  return queryOptions({
    queryKey: ["admin", "driver-stats", driverId],
    queryFn: async (): Promise<DriverStats> => {
      const [{ data: orders }, { data: reviews }] = await Promise.all([
        supabase.from("orders").select("status").eq("driver_id", driverId),
        supabase.from("reviews").select("driver_rating").eq("driver_id", driverId),
      ]);
      const rated = (reviews ?? []).filter((r) => r.driver_rating != null);
      return {
        delivered: (orders ?? []).filter((o) => o.status === "delivered").length,
        cancelled: (orders ?? []).filter((o) => o.status === "cancelled").length,
        assigned: (orders ?? []).length,
        ratings: rated.length,
        rating: rated.length
          ? rated.reduce((s, r) => s + Number(r.driver_rating), 0) / rated.length
          : null,
      };
    },
  });
}

export function userOrdersQuery(userId: string) {
  return queryOptions({
    queryKey: ["admin", "user-orders", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id,status,total,currency,created_at,kind,customer_id,driver_id")
        .or(`customer_id.eq.${userId},driver_id.eq.${userId}`)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });
}

/* ---------------------------------- promos -------------------------------- */

export type Promo = {
  id?: string;
  code: string;
  discount_type: "percent" | "fixed";
  amount: number;
  usage_limit: number | null;
  per_user_limit: number | null;
  expires_at: string | null;
  min_order: number;
  country: string | null;
  active: boolean;
  uses?: number;
};

export const promosQuery = queryOptions({
  queryKey: ["admin", "promos"],
  queryFn: async (): Promise<Promo[]> => {
    const { data, error } = await supabase
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Promo[];
  },
});

export async function savePromo(p: Promo) {
  const row = { ...p, code: p.code.trim().toUpperCase() };
  delete row.uses;
  const { error } = await supabase.from("promo_codes").upsert(row);
  if (error) throw new Error(error.message.includes("duplicate") ? "That code already exists." : error.message);
}
export async function deletePromo(id: string) {
  const { error } = await supabase.from("promo_codes").delete().eq("id", id);
  if (error) throw error;
}

/* ------------------------------- audit / misc ----------------------------- */

export const auditQuery = queryOptions({
  queryKey: ["admin", "audit"],
  queryFn: async () => {
    const [{ data, error }, { data: profiles }] = await Promise.all([
      supabase
        .from("admin_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500),
      supabase.from("profiles").select("id,full_name,email"),
    ]);
    if (error) throw error;
    const nameBy = new Map((profiles ?? []).map((p) => [p.id, p.full_name || p.email || "—"]));
    return (data ?? []).map((r) => ({ ...r, actor: r.actor_id ? (nameBy.get(r.actor_id) ?? "—") : "system" }));
  },
});

export const announcementsQuery = queryOptions({
  queryKey: ["admin", "announcements"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return data ?? [];
  },
});

export const customerReviewsQuery = queryOptions({
  queryKey: ["admin", "customer-reviews"],
  queryFn: async () => {
    const [{ data, error }, { data: restaurants }, { data: profiles }] = await Promise.all([
      // customer_id is excluded from the column-level grant on reviews, so staff
      // read the list through the role-checked admin_list_reviews() RPC instead.
      supabase.rpc("admin_list_reviews"),
      supabase.from("restaurants").select("id,name"),
      supabase.from("profiles").select("id,full_name,email"),
    ]);
    if (error) throw error;
    const rBy = new Map((restaurants ?? []).map((r) => [r.id, r.name]));
    const pBy = new Map((profiles ?? []).map((p) => [p.id, p.full_name || p.email || "—"]));
    return (data ?? []).map((r) => ({
      ...r,
      restaurantName: rBy.get(r.restaurant_id) ?? "—",
      customerName: pBy.get(r.customer_id) ?? "—",
    }));
  },
});

export function analyticsQuery(from: string, to: string, country: string) {
  return queryOptions({
    queryKey: ["admin", "analytics", from, to, country],
    queryFn: async () => {
      let q = supabase
        .from("orders")
        .select("id,status,total,refund_amount,currency,country,created_at,delivered_at,restaurant_id,driver_id,kind")
        .gte("created_at", `${from}T00:00:00`)
        .lte("created_at", `${to}T23:59:59`)
        .limit(5000);
      if (country !== "all") q = q.eq("country", country);
      const [{ data, error }, { data: restaurants }] = await Promise.all([
        q,
        supabase.from("restaurants").select("id,name"),
      ]);
      if (error) throw error;
      return { orders: data ?? [], restaurants: restaurants ?? [] };
    },
  });
}

/* ------------------------------------ CSV --------------------------------- */

export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]!);
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
