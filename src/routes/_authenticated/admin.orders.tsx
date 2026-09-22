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
          <OrderRow key={o.id} order={o} />
        ))}
      </div>
    </div>
  );
}

function OrderRow({ order: o }: { order: AdminOrder }) {
  const t = useT();
  const { formatMoney, formatDate } = useI18n();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const items = useQuery({ ...adminOrderItemsQuery(o.id), enabled: open });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin"] });

  const cancel = useMutation({
    mutationFn: () => adminCancelOrder(o.id),
    onSuccess: () => {
      toast.success(t("admin.orders.cancelled"));
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const unassign = useMutation({
    mutationFn: () => adminUnassignDriver(o.id),
    onSuccess: () => {
      toast.success(t("admin.orders.driverUnassigned"));
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const closed = o.status === "delivered" || o.status === "cancelled";

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-48">
          <p className="font-semibold">
            {orderRef(o.id)} · {o.restaurantName}
          </p>
          <p className="text-sm text-foreground/60">
            {t("admin.orders.customer")}: {o.customerName} · {t("admin.orders.driver")}:{" "}
            {o.driverName}
          </p>
          <p className="text-xs text-foreground/50">
            {formatDate(o.created_at)} · {o.country || "—"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-semibold">{formatMoney(Number(o.total), o.currency)}</span>
          <StatusBadge status={o.status} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => setOpen((v) => !v)}>
          {open ? t("admin.orders.hideDetails") : t("admin.orders.viewDetails")}
        </Button>
        {o.driver_id && !closed ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => unassign.mutate()}
            disabled={unassign.isPending}
          >
            {t("admin.orders.unassignDriver")}
          </Button>
        ) : null}
        {!closed ? (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => cancel.mutate()}
            disabled={cancel.isPending}
          >
            {t("admin.orders.cancelOrder")}
          </Button>
        ) : null}
      </div>

      {open ? (
        <div className="mt-3 space-y-1 rounded-xl bg-muted/50 p-3 text-sm">
          {items.isPending ? <p className="text-foreground/60">{t("admin.loading")}</p> : null}
          {(items.data ?? []).map((i) => (
            <div key={i.id} className="flex justify-between gap-3">
              <span className="min-w-0 break-words">
                {i.quantity} × {i.name}
              </span>
              <span className="shrink-0">{formatMoney(i.price * i.quantity, o.currency)}</span>
            </div>
          ))}
          {!items.isPending && (items.data ?? []).length === 0 ? (
            <p className="text-foreground/60">{t("admin.orders.noItems")}</p>
          ) : null}
          <div className="mt-2 border-t border-ink/10 pt-2 text-xs text-foreground/60">
            {t("admin.orders.payment")}: {o.payment_method || "—"} · {o.payment_status || "—"}
          </div>
        </div>
      ) : null}
    </Card>
  );
}
