import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
};

export type MenuItem = {
  id: string;
  restaurant_id: string;
  name: string;
  price: number;
  currency: string;
  image_url: string | null;
  available: boolean;
};

export type OrderRow = {
  id: string;
  status: string;
  total: number;
  currency: string;
  created_at: string;
  restaurant_id: string;
  driver_id: string | null;
  customer_id: string;
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

export function money(amount: number, currency = "PLN") {
  return `${Number(amount).toFixed(2)} ${currency}`;
}

export function orderRef(id: string) {
  return `#${id.slice(-5).toUpperCase()}`;
}

async function currentUserId() {
  const { data } = await supabase.auth.getUser();
  const id = data.user?.id;
  if (!id) throw new Error("Not signed in");
  return id;
}

export const restaurantsQuery = queryOptions({
  queryKey: ["restaurants"],
  queryFn: async (): Promise<Restaurant[]> => {
    const { data, error } = await supabase
      .from("restaurants")
      .select("id,name,cuisine,city,country,logo_url,rating,eta_minutes,delivery_fee,status")
      .eq("status", "approved")
      .order("rating", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Restaurant[];
  },
});

export const allMenuItemsQuery = queryOptions({
  queryKey: ["menu-items", "all"],
  queryFn: async (): Promise<MenuItem[]> => {
    const { data, error } = await supabase
      .from("menu_items")
      .select("id,restaurant_id,name,price,currency,image_url,available")
      .eq("available", true);
    if (error) throw error;
    return (data ?? []) as MenuItem[];
  },
});

export function restaurantQuery(id: string) {
  return queryOptions({
    queryKey: ["restaurant", id],
    queryFn: async (): Promise<{ restaurant: Restaurant | null; items: MenuItem[] }> => {
      const [{ data: r, error: rErr }, { data: items, error: iErr }] = await Promise.all([
        supabase
          .from("restaurants")
          .select("id,name,cuisine,city,country,logo_url,rating,eta_minutes,delivery_fee,status")
          .eq("id", id)
          .maybeSingle(),
        supabase
          .from("menu_items")
          .select("id,restaurant_id,name,price,currency,image_url,available")
          .eq("restaurant_id", id)
          .order("price"),
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
      .select("id,status,total,currency,created_at,restaurant_id,driver_id,customer_id")
      .eq("customer_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as OrderRow[];
  },
});

export const vendorRestaurantsQuery = queryOptions({
  queryKey: ["restaurants", "mine"],
  queryFn: async (): Promise<Restaurant[]> => {
    const userId = await currentUserId();
    const { data, error } = await supabase
      .from("restaurants")
      .select("id,name,cuisine,city,country,logo_url,rating,eta_minutes,delivery_fee,status")
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
        .select("id,status,total,currency,created_at,restaurant_id,driver_id,customer_id")
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
      .select("id,status,total,currency,created_at,restaurant_id,driver_id,customer_id")
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

export const DRIVER_PAYOUT_RATE = 0.15;

export function payout(total: number) {
  return Math.round(total * DRIVER_PAYOUT_RATE * 100) / 100;
}

export async function updateOrderStatus(orderId: string, status: string) {
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) throw error;
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

export async function placeOrder(item: MenuItem, restaurant: Restaurant) {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from("orders")
    .insert({
      customer_id: userId,
      restaurant_id: restaurant.id,
      status: "pending",
      country: restaurant.country,
      currency: item.currency,
      total: Number(item.price) + Number(restaurant.delivery_fee ?? 0),
    })
    .select("id")
    .single();
  if (error) throw error;
  const { error: itemError } = await supabase.from("order_items").insert({
    order_id: data.id,
    menu_item_id: item.id,
    quantity: 1,
    price: item.price,
  });
  if (itemError) throw itemError;
  return data.id as string;
}

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

export type RestaurantInput = {
  name: string;
  cuisine: string;
  city: string;
  country: string;
  eta_minutes: number;
  delivery_fee: number;
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

export async function cancelOrder(orderId: string) {
  return updateOrderStatus(orderId, "cancelled");
}
