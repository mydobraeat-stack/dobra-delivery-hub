import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { PickedAddress } from "@/components/dobra/AddressPicker";
import { myOrdersQuery } from "@/lib/dobra";

const KEY = "dobra.deliveryAddress.v1";
const EVENT = "dobra:delivery-address";

function read(): PickedAddress | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PickedAddress) : null;
  } catch {
    return null;
  }
}

export function saveDeliveryAddress(a: PickedAddress) {
  window.localStorage.setItem(KEY, JSON.stringify(a));
  window.dispatchEvent(new Event(EVENT));
}

/** Current default delivery address: chosen one, else most recent order address. */
export function useDeliveryAddress() {
  const [stored, setStored] = useState<PickedAddress | null>(null);
  const [ready, setReady] = useState(false);
  const { data: orders = [], isFetched } = useQuery(myOrdersQuery);

  useEffect(() => {
    const sync = () => setStored(read());
    sync();
    setReady(true);
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const saved = useMemo(() => {
    const seen = new Set<string>();
    const list: PickedAddress[] = [];
    for (const o of orders) {
      const a = o.address?.trim();
      if (!a || seen.has(a.toLowerCase())) continue;
      seen.add(a.toLowerCase());
      list.push({ address: a, lat: o.dest_lat ?? null, lng: o.dest_lng ?? null });
      if (list.length >= 5) break;
    }
    return list;
  }, [orders]);

  const current = stored ?? saved[0] ?? null;
  return { current, saved, loading: !ready || !isFetched, save: saveDeliveryAddress };
}
