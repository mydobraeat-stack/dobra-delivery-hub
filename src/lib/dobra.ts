import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CartLine } from "@/lib/cart";

export type Restaurant = {
  id: string;
  name: string;
  cuisine: string | null;
  city: string | null;
  country: string | null;
  logo_url: string | null;
  rating: number;
  eta_minutes: number;
  delivery_fee: number;
  status: string;
  is_open: boolean;
  min_order: number;
  tags: string[] | null;
};

const RESTAURANT_COLS =
  "id,name,cuisine,city,country,logo_url,rating,eta_minutes,delivery_fee,status,is_open,min_order,tags";

export type MenuItem = {
  id: string;
  restaurant_id: string;
  name: string;
  price: number;
  currency: string;
  image_url: string | null;
  available: boolean;
  description: string | null;
  category: string;
};

const MENU_COLS =
  "id,restaurant_id,name,price,currency,image_url,available,description,category";

export type OrderRow = {
  id: string;
  status: string;
  total: number;
  subtotal: number;
  delivery_fee: number;
  currency: string;
  created_at: string;
  restaurant_id: string;
  driver_id: string | null;
  customer_id: string;
  address: string | null;
  note: string | null;
  eta_minutes: number;
  dest_lat: number | null;
  dest_lng: number | null;
};

const ORDER_COLS =
  "id,status,total,subtotal,delivery_fee,currency,created_at,restaurant_id,driver_id,customer_id,address,note,eta_minutes,dest_lat,dest_lng";

export type Review = {
  id: string;
  order_id: string;
  restaurant_id: string;
  driver_id: string | null;
  restaurant_rating: number;
  driver_rating: number | null;
  comment: string | null;
  created_at: string;
};

export const ORDER_FLOW = [
  "pending",
  "accepted",
  "preparing",
  "ready",
  "picked_up",
  "delivered",
] as const;

export const STATUS_LABEL: Record<string, string> = {
  pending: "New order",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready for pickup",
  picked_up: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const CUSTOMER_STEPS = [
  { status: "pending", label: "Order sent" },
  { status: "accepted", label: "Restaurant accepted" },
  { status: "preparing", label: "Being prepared" },
  { status: "ready", label: "Ready for pickup" },
  { status: "picked_up", label: "On the way" },
  { status: "delivered", label: "Delivered" },
] as const;

export const MENU_CATEGORIES = ["Starters", "Mains", "Sides", "Desserts", "Drinks"] as const;

export function money(amount: number, currency = "PLN") {
  return `${Number(amount).toFixed(2)} ${currency}`;
}

export function orderRef(id: string) {
  return `#${id.slice(-5).toUpperCase()}`;
}

export function isFinished(status: string) {
  return status === "delivered" || status === "cancelled";
}

async function currentUserId() {
  const { data } = await supabase.auth.getUser();
  const id = data.user?.id;
  if (!id) throw new Error("Not signed in");
  return id;
}

/* ---------------------------------- reads --------------------------------- */

export const restaurantsQuery = queryOptions({
  queryKey: ["restaurants"],
  queryFn: async (): Promise<Restaurant[]> => {
    const { data, error } = await supabase
      .from("restaurants")
      .select(RESTAURANT_COLS)
      .eq("status", "approved")
      .order("rating", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Restaurant[];
  },
});

export const allMenuItemsQuery = queryOptions({
  queryKey: ["menu-items", "all"],
  queryFn: async (): Promise<MenuItem[]> => {
    const { data, error } = await supabase.from("menu_items").select(MENU_COLS).eq("available", true);
    if (error) throw error;
    return (data ?? []) as MenuItem[];
  },
});

export function restaurantQuery(id: string) {
  return queryOptions({
    queryKey: ["restaurant", id],
    queryFn: async (): Promise<{ restaurant: Restaurant | null; items: MenuItem[] }> => {
      const [{ data: r, error: rErr }, { data: items, error: iErr }] = await Promise.all([
        supabase.from("restaurants").select(RESTAURANT_COLS).eq("id", id).maybeSingle(),
        supabase.from("menu_items").select(MENU_COLS).eq("restaurant_id", id).order("price"),
      ]);
      if (rErr) throw rErr;
      if (iErr) throw iErr;
      return { restaurant: (r as Restaurant) ?? null, items: (items ?? []) as MenuItem[] };
    },
  });
}

export const myOrdersQuery = queryOptions({
  queryKey: ["orders", "mine"],
  queryFn: async (): Promise<OrderRow[]> => {
    const userId = await currentUserId();
    const { data, error } = await supabase
      .from("orders")
      .select(ORDER_COLS)
      .eq("customer_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as OrderRow[];
  },
});

export function orderQuery(orderId: string) {
  return queryOptions({
    queryKey: ["order", orderId],
    queryFn: async (): Promise<OrderRow | null> => {
      const { data, error } = await supabase
        .from("orders")
        .select(ORDER_COLS)
        .eq("id", orderId)
        .maybeSingle();
      if (error) throw error;
      return (data as OrderRow) ?? null;
    },
  });
}

export const vendorRestaurantsQuery = queryOptions({
  queryKey: ["restaurants", "mine"],
  queryFn: async (): Promise<Restaurant[]> => {
    const userId = await currentUserId();
    const { data, error } = await supabase
      .from("restaurants")
      .select(RESTAURANT_COLS)
      .eq("owner_id", userId)
      .order("created_at");
    if (error) throw error;
    return (data ?? []) as Restaurant[];
  },
});

export function vendorOrdersQuery(restaurantId: string | undefined) {
  return queryOptions({
    queryKey: ["orders", "vendor", restaurantId ?? "none"],
    enabled: Boolean(restaurantId),
    queryFn: async (): Promise<OrderRow[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select(ORDER_COLS)
        .eq("restaurant_id", restaurantId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as OrderRow[];
    },
  });
}

export const driverOrdersQuery = queryOptions({
  queryKey: ["orders", "driver"],
  queryFn: async (): Promise<{ available: OrderRow[]; mine: OrderRow[] }> => {
    const userId = await currentUserId();
    const { data, error } = await supabase
      .from("orders")
      .select(ORDER_COLS)
      .or(`driver_id.eq.${userId},and(driver_id.is.null,status.eq.ready)`)
      .order("created_at", { ascending: false });
    if (error) throw error;
    const rows = (data ?? []) as OrderRow[];
    return {
      available: rows.filter((o) => !o.driver_id),
      mine: rows.filter((o) => o.driver_id === userId),
    };
  },
});

export function orderItemsQuery(orderId: string) {
  return queryOptions({
    queryKey: ["order-items", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("id,quantity,price,menu_item_id,menu_items(name,image_url)")
        .eq("order_id", orderId);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function restaurantReviewsQuery(restaurantId: string) {
  return queryOptions({
    queryKey: ["reviews", restaurantId],
    queryFn: async (): Promise<Review[]> => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id,order_id,restaurant_id,driver_id,restaurant_rating,driver_rating,comment,created_at")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as Review[];
    },
  });
}

export function orderReviewQuery(orderId: string) {
  return queryOptions({
    queryKey: ["review", orderId],
    queryFn: async (): Promise<Review | null> => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id,order_id,restaurant_id,driver_id,restaurant_rating,driver_rating,comment,created_at")
        .eq("order_id", orderId)
        .maybeSingle();
      if (error) throw error;
      return (data as Review) ?? null;
    },
  });
}

export function driverLocationQuery(driverId: string | null | undefined) {
  return queryOptions({
    queryKey: ["driver-location", driverId ?? "none"],
    enabled: Boolean(driverId),
    queryFn: async (): Promise<{ lat: number; lng: number; updated_at: string } | null> => {
      const { data, error } = await supabase
        .from("driver_locations")
        .select("lat,lng,updated_at")
        .eq("driver_id", driverId!)
        .maybeSingle();
      if (error) throw error;
      return data ?? null;
    },
  });
}

export type DriverRecord = {
  id: string;
  status: string;
  vehicle_type: string | null;
  vehicle_model: string | null;
  plate: string | null;
  docs_status: string;
  country: string | null;
  submitted_at: string | null;
};

export const myDriverQuery = queryOptions({
  queryKey: ["driver", "me"],
  queryFn: async (): Promise<DriverRecord | null> => {
    const userId = await currentUserId();
    const { data, error } = await supabase
      .from("drivers")
      .select("id,status,vehicle_type,vehicle_model,plate,docs_status,country,submitted_at")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw error;
    return (data as DriverRecord) ?? null;
  },
});

/** Local currency for a driver based on their country. */
export function driverCurrency(country: string | null | undefined) {
  const c = (country ?? "").trim().toLowerCase();
  if (["cm", "cameroon", "cg", "ga", "td", "cf", "gq"].includes(c)) return "XAF";
  return "PLN";
}


/* -------------------------------- mutations ------------------------------- */

export const DRIVER_PAYOUT_RATE = 0.15;

export function payout(total: number) {
  return Math.round(total * DRIVER_PAYOUT_RATE * 100) / 100;
}

export async function updateOrderStatus(orderId: string, status: string) {
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) throw error;
}

export async function cancelOrder(orderId: string) {
  return updateOrderStatus(orderId, "cancelled");
}

export async function claimOrder(orderId: string) {
  const userId = await currentUserId();
  const { error } = await supabase
    .from("orders")
    .update({ driver_id: userId })
    .eq("id", orderId)
    .is("driver_id", null);
  if (error) throw error;
}

export async function toggleItemAvailability(itemId: string, available: boolean) {
  const { error } = await supabase.from("menu_items").update({ available }).eq("id", itemId);
  if (error) throw error;
}

export async function setRestaurantOpen(restaurantId: string, isOpen: boolean) {
  const { error } = await supabase
    .from("restaurants")
    .update({ is_open: isOpen })
    .eq("id", restaurantId);
  if (error) throw error;
}

/** "available" is the value the drivers table accepts for an online driver. */
export async function setDriverStatus(status: "available" | "offline") {
  const userId = await currentUserId();
  const { error } = await supabase
    .from("drivers")
    .upsert({ id: userId, status }, { onConflict: "id" });
  if (error) throw error;
}

export async function saveDriverLocation(lat: number, lng: number) {
  const userId = await currentUserId();
  const { error } = await supabase
    .from("driver_locations")
    .upsert({ driver_id: userId, lat, lng, updated_at: new Date().toISOString() }, {
      onConflict: "driver_id",
    });
  if (error) throw error;
}

export type PaymentMethod = "cash" | "card";

export type CheckoutInput = {
  restaurant: Restaurant;
  lines: CartLine[];
  address: string;
  note: string;
  paymentMethod: PaymentMethod;
  destLat?: number | null;
  destLng?: number | null;
};

export async function placeOrder({
  restaurant,
  lines,
  address,
  note,
  paymentMethod,
  destLat,
  destLng,
}: CheckoutInput) {
  if (lines.length === 0) throw new Error("Your basket is empty.");
  const userId = await currentUserId();
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const deliveryFee = Number(restaurant.delivery_fee ?? 0);
  const currency = lines[0]!.currency;

  const { data, error } = await supabase
    .from("orders")
    .insert({
      customer_id: userId,
      restaurant_id: restaurant.id,
      status: "pending",
      country: restaurant.country,
      currency,
      subtotal,
      delivery_fee: deliveryFee,
      total: subtotal + deliveryFee,
      address,
      dest_lat: destLat ?? null,
      dest_lng: destLng ?? null,
      note: note || null,
      eta_minutes: restaurant.eta_minutes,
      payment_method: paymentMethod,
      payment_status: paymentMethod === "cash" ? "cash" : "pending",
    })
    .select("id")
    .single();
  if (error) throw error;

  const { error: itemsError } = await supabase.from("order_items").insert(
    lines.map((l) => ({
      order_id: data.id,
      menu_item_id: l.itemId,
      quantity: l.quantity,
      price: l.price,
    })),
  );
  if (itemsError) throw itemsError;
  return data.id as string;
}

export async function submitReview(input: {
  orderId: string;
  restaurantId: string;
  driverId: string | null;
  restaurantRating: number;
  driverRating: number | null;
  comment: string;
}) {
  const userId = await currentUserId();
  const { error } = await supabase.from("reviews").insert({
    order_id: input.orderId,
    customer_id: userId,
    restaurant_id: input.restaurantId,
    driver_id: input.driverId,
    restaurant_rating: input.restaurantRating,
    driver_rating: input.driverRating,
    comment: input.comment || null,
  });
  if (error) throw error;
}

export type RestaurantInput = {
  name: string;
  cuisine: string;
  city: string;
  country: string;
  eta_minutes: number;
  delivery_fee: number;
  min_order: number;
  logo_url: string | null;
};

export async function createRestaurant(input: RestaurantInput) {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from("restaurants")
    .insert({ ...input, owner_id: userId })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function updateRestaurant(id: string, input: RestaurantInput) {
  const { error } = await supabase.from("restaurants").update(input).eq("id", id);
  if (error) throw error;
}

export type MenuItemInput = {
  name: string;
  price: number;
  currency: string;
  image_url: string | null;
  description: string | null;
  category: string;
};

export async function createMenuItem(restaurantId: string, input: MenuItemInput) {
  const { error } = await supabase
    .from("menu_items")
    .insert({ ...input, restaurant_id: restaurantId, available: true });
  if (error) throw error;
}

export async function updateMenuItem(id: string, input: MenuItemInput) {
  const { error } = await supabase.from("menu_items").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteMenuItem(id: string) {
  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  if (error) throw error;
}
