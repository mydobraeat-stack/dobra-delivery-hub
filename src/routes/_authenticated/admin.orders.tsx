import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminOrdersQuery } from "@/lib/admin";
import { StatusBadge } from "@/components/dobra/StatusBadge";
import { money, orderRef, ORDER_FLOW } from "@/lib/dobra";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: AdminOrders,
});

const FILTERS = ["all", ...ORDER_FLOW, "cancelled"] as const;

function AdminOrders() {
  const { data, isPending } = useQuery(adminOrdersQuery);
  const [filter, setFilter] = useState<string>("all");
  const [term, setTerm] = useState("");

  const rows = (data ?? []).filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (!term.trim()) return true;
    const t = term.toLowerCase();
    return (
      o.customerName.toLowerCase().includes(t) ||
      o.restaurantName.toLowerCase().includes(t) ||
      o.driverName.toLowerCase().includes(t) ||
      (o.country ?? "").toLowerCase().includes(t) ||
      orderRef(o.id).toLowerCase().includes(t)
    );
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-foreground/60">Every order across the platform.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search customer, restaurant, driver or country"
          className="max-w-xs"
        />
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                filter === f ? "bg-primary text-foreground" : "bg-muted text-foreground/70"
              }`}
            >
              {f === "all" ? "All" : f.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {isPending ? <p className="text-foreground/60">Loading…</p> : null}
      {!isPending && rows.length === 0 ? (
        <Card className="p-8 text-center text-foreground/60">No orders match.</Card>
      ) : null}

      <div className="space-y-3">
        {rows.map((o) => (
          <Card key={o.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-48">
              <p className="font-semibold">
                {orderRef(o.id)} · {o.restaurantName}
              </p>
              <p className="text-sm text-foreground/60">
                Customer: {o.customerName} · Driver: {o.driverName}
              </p>
              <p className="text-xs text-foreground/50">
                {new Date(o.created_at).toLocaleString()} · {o.country || "—"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">{money(Number(o.total), o.currency)}</span>
              <StatusBadge status={o.status} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
