import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  adminOrdersQuery,
  adminOrderItemsQuery,
  adminCancelOrder,
  adminUnassignDriver,
  type AdminOrder,
} from "@/lib/admin";
import { StatusBadge } from "@/components/dobra/StatusBadge";
import { orderRef, ORDER_FLOW } from "@/lib/dobra";
import { useI18n, useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: AdminOrders,
});

const FILTERS = ["all", ...ORDER_FLOW, "cancelled"] as const;

function AdminOrders() {
  const t = useT();
  const { formatMoney, formatDate } = useI18n();
  const { data, isPending } = useQuery(adminOrdersQuery);
  const [filter, setFilter] = useState<string>("all");
  const [term, setTerm] = useState("");

  const rows = (data ?? []).filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (!term.trim()) return true;
    const term_ = term.toLowerCase();
    return (
      o.customerName.toLowerCase().includes(term_) ||
      o.restaurantName.toLowerCase().includes(term_) ||
      o.driverName.toLowerCase().includes(term_) ||
      (o.country ?? "").toLowerCase().includes(term_) ||
      orderRef(o.id).toLowerCase().includes(term_)
    );
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{t("admin.orders.title")}</h1>
        <p className="text-sm text-foreground/60">{t("admin.orders.subtitle")}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={t("admin.orders.searchPlaceholder")}
          className="max-w-xs"
        />
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                filter === f ? "bg-sun text-foreground" : "bg-muted text-foreground/70"
              }`}
            >
              {f === "all" ? t("admin.orders.all") : f.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {isPending ? <p className="text-foreground/60">{t("admin.loading")}</p> : null}
      {!isPending && rows.length === 0 ? (
        <Card className="p-8 text-center text-foreground/60">{t("admin.orders.empty")}</Card>
      ) : null}

      <div className="space-y-3">
        {rows.map((o) => (
          <Card key={o.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-48">
              <p className="font-semibold">
                {orderRef(o.id)} · {o.restaurantName}
              </p>
              <p className="text-sm text-foreground/60">
                {t("admin.orders.customer")}: {o.customerName} · {t("admin.orders.driver")}: {o.driverName}
              </p>
              <p className="text-xs text-foreground/50">
                {formatDate(o.created_at)} · {o.country || "—"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">{formatMoney(Number(o.total), o.currency)}</span>
              <StatusBadge status={o.status} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
