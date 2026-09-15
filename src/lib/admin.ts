import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AdminProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  country: string | null;
  phone: string | null;
  approval_status: string;
  created_at: string;
  role: string;
};

export type AdminDriver = {
  id: string;
  status: string;
  docs_status: string;
  vehicle_type: string | null;
  vehicle_model: string | null;
  plate: string | null;
  country: string | null;
  submitted_at: string | null;
  profile: AdminProfile | null;
  documents: {
    id: string;
    doc_type: string;
    file_path: string;
    expires_on: string | null;
    status: string;
    review_note: string | null;
  }[];
};

export type AdminRestaurant = {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  cuisine: string | null;
  status: string;
  is_open: boolean;
  logo_url: string | null;
  owner_id: string;
  created_at: string;
  owner: AdminProfile | null;
};

export type AdminOrder = {
  id: string;
  status: string;
  total: number;
  currency: string;
  country: string | null;
  created_at: string;
  customer_id: string;
  restaurant_id: string;
  driver_id: string | null;
  payment_method: string | null;
  payment_status: string | null;
  customerName: string;
  restaurantName: string;
  driverName: string;
};

const PROFILE_COLS = "id,email,full_name,country,phone,approval_status,created_at";

async function loadProfiles() {
  const [{ data: profiles, error }, { data: roles, error: rErr }] = await Promise.all([
    supabase.from("profiles").select(PROFILE_COLS).order("created_at", { ascending: false }),
    supabase.from("user_roles").select("user_id,role"),
  ]);
  if (error) throw error;
  if (rErr) throw rErr;
  const roleBy = new Map((roles ?? []).map((r) => [r.user_id, r.role as string]));
  return (profiles ?? []).map((p) => ({
    ...p,
    role: roleBy.get(p.id) ?? "customer",
  })) as AdminProfile[];
}

export const adminProfilesQuery = queryOptions({
  queryKey: ["admin", "profiles"],
  queryFn: loadProfiles,
});

export const adminDriversQuery = queryOptions({
  queryKey: ["admin", "drivers"],
  queryFn: async (): Promise<AdminDriver[]> => {
    const [profiles, { data: drivers, error }, { data: docs, error: dErr }] = await Promise.all([
      loadProfiles(),
      supabase
        .from("drivers")
        .select("id,status,docs_status,vehicle_type,vehicle_model,plate,country,submitted_at"),
      supabase
        .from("driver_documents")
        .select("id,driver_id,doc_type,file_path,expires_on,status,review_note"),
    ]);
    if (error) throw error;
    if (dErr) throw dErr;

    const profileBy = new Map(profiles.map((p) => [p.id, p]));
    const rows = (drivers ?? []) as Omit<AdminDriver, "profile" | "documents">[];
    const known = new Set(rows.map((d) => d.id));

    // include driver-role accounts that have no drivers row yet
    for (const p of profiles) {
      if (p.role === "driver" && !known.has(p.id)) {
        rows.push({
          id: p.id,
          status: "offline",
          docs_status: "draft",
          vehicle_type: null,
          vehicle_model: null,
          plate: null,
          country: p.country,
          submitted_at: null,
        });
      }
    }

    return rows.map((d) => ({
      ...d,
      profile: profileBy.get(d.id) ?? null,
      documents: (docs ?? [])
        .filter((doc) => doc.driver_id === d.id)
        .map(({ driver_id: _driverId, ...rest }) => rest),
    }));
  },
});

export const adminRestaurantsQuery = queryOptions({
  queryKey: ["admin", "restaurants"],
  queryFn: async (): Promise<AdminRestaurant[]> => {
    const [profiles, { data, error }] = await Promise.all([
      loadProfiles(),
      supabase
        .from("restaurants")
        .select("id,name,city,country,cuisine,status,is_open,logo_url,owner_id,created_at")
        .order("created_at", { ascending: false }),
    ]);
    if (error) throw error;
    const profileBy = new Map(profiles.map((p) => [p.id, p]));
    return (data ?? []).map((r) => ({ ...r, owner: profileBy.get(r.owner_id) ?? null }));
  },
});

export const adminOrdersQuery = queryOptions({
  queryKey: ["admin", "orders"],
  queryFn: async (): Promise<AdminOrder[]> => {
    const [profiles, { data: orders, error }, { data: restaurants, error: rErr }] =
      await Promise.all([
        loadProfiles(),
        supabase
          .from("orders")
          .select(
            "id,status,total,currency,country,created_at,customer_id,restaurant_id,driver_id",
          )
          .order("created_at", { ascending: false })
          .limit(200),
        supabase.from("restaurants").select("id,name"),
      ]);
    if (error) throw error;
    if (rErr) throw rErr;

    const nameBy = new Map(profiles.map((p) => [p.id, p.full_name || p.email || "—"]));
    const restaurantBy = new Map((restaurants ?? []).map((r) => [r.id, r.name]));

    return (orders ?? []).map((o) => ({
      ...o,
      payment_method: (o as { payment_method?: string | null }).payment_method ?? null,
      payment_status: (o as { payment_status?: string | null }).payment_status ?? null,
      customerName: nameBy.get(o.customer_id) ?? "—",
      restaurantName: restaurantBy.get(o.restaurant_id) ?? "—",
      driverName: o.driver_id ? (nameBy.get(o.driver_id) ?? "Assigned") : "Unassigned",
    })) as AdminOrder[];
  },
});

/* ------------------------------- mutations ------------------------------- */

export async function setProfileApproval(userId: string, status: "approved" | "rejected") {
  const { error } = await supabase
    .from("profiles")
    .update({ approval_status: status })
    .eq("id", userId);
  if (error) throw error;
}

export async function setRestaurantStatus(
  restaurantId: string,
  status: "approved" | "pending" | "suspended",
) {
  const { error } = await supabase.from("restaurants").update({ status }).eq("id", restaurantId);
  if (error) throw error;
}

export async function setDriverDocsStatus(
  driverId: string,
  status: "approved" | "rejected" | "in_review",
) {
  const { error } = await supabase
    .from("drivers")
    .upsert({ id: driverId, docs_status: status }, { onConflict: "id" });
  if (error) throw error;
}

export async function setDocumentStatus(
  documentId: string,
  status: "approved" | "rejected" | "pending",
  note?: string,
) {
  const { error } = await supabase
    .from("driver_documents")
    .update({ status, review_note: note ?? null })
    .eq("id", documentId);
  if (error) throw error;
}
