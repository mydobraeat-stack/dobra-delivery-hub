import { useSyncExternalStore } from "react";

export type CartLine = {
  itemId: string;
  name: string;
  price: number;
  currency: string;
  image: string | null;
  quantity: number;
};

export type Cart = {
  restaurantId: string | null;
  restaurantName: string | null;
  lines: CartLine[];
};

const KEY = "dobra.cart.v1";
const EMPTY: Cart = { restaurantId: null, restaurantName: null, lines: [] };

let cart: Cart = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load(): Cart {
  if (loaded || typeof window === "undefined") return cart;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) cart = JSON.parse(raw) as Cart;
  } catch {
    cart = EMPTY;
  }
  return cart;
}

function commit(next: Cart) {
  cart = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useCart(): Cart {
  return useSyncExternalStore(
    subscribe,
    () => load(),
    () => EMPTY,
  );
}

export function addToCart(
  restaurant: { id: string; name: string },
  line: Omit<CartLine, "quantity">,
  quantity = 1,
) {
  const current = load();
  const base: Cart =
    current.restaurantId && current.restaurantId !== restaurant.id
      ? { restaurantId: restaurant.id, restaurantName: restaurant.name, lines: [] }
      : { ...current, restaurantId: restaurant.id, restaurantName: restaurant.name };

  const existing = base.lines.find((l) => l.itemId === line.itemId);
  const lines = existing
    ? base.lines.map((l) =>
        l.itemId === line.itemId ? { ...l, quantity: l.quantity + quantity } : l,
      )
    : [...base.lines, { ...line, quantity }];
  commit({ ...base, lines });
}

export function setQuantity(itemId: string, quantity: number) {
  const current = load();
  const lines = current.lines
    .map((l) => (l.itemId === itemId ? { ...l, quantity } : l))
    .filter((l) => l.quantity > 0);
  commit(lines.length === 0 ? EMPTY : { ...current, lines });
}

export function clearCart() {
  commit(EMPTY);
}

export function cartCount(cart: Cart) {
  return cart.lines.reduce((n, l) => n + l.quantity, 0);
}

export function cartSubtotal(cart: Cart) {
  return cart.lines.reduce((n, l) => n + l.price * l.quantity, 0);
}
