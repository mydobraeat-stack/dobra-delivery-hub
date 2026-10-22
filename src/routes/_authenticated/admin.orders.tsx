import { OrderTimeLabel, OrderTimeline } from "@/components/dobra/OrderTimes";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { refundOrderWithStripe } from "@/lib/payments.functions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminOrdersQuery, adminOrderItemsQuery, type AdminOrder } from "@/lib/admin";
import {
  addNote,
  approvedDriversQuery,
  cancelOrder,
  downloadCsv,
  flagOrder,
  forceStatus,
  orderExtrasQuery,
  reassignDriver,
} from "@/lib/admin-ops";
import { ActionDialog } from "@/components/admin/ActionDialog";
import { StatusBadge } from "@/components/dobra/StatusBadge";
import { orderRef, ORDER_FLOW } from "@/lib/dobra";
import { useI18n, useT } from "@/lib/i18n";
import { accountQueryOptions } from "@/lib/profile";
import { canReassignOrder, isClosedOrder, nextAdminStatuses } from "@/lib/admin-rules";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: AdminOrders,
  head: () => ({ meta: [
    { title: "Dobra Admin — Order controls" },
    { name: "description", content: "Manage Dobra food and package orders with audited staff controls." },
    { property: "og:title", content: "Dobra Admin — Order controls" },
    { property: "og:description", content: "Manage Dobra food and package orders with audited staff controls." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
});

const FILTERS = ["all", ...ORDER_FLOW, "cancelled"] as const;

function AdminOrders() {
  const t = useT();
  const { data, isPending } = useQuery(adminOrdersQuery);
  const [filter, setFilter] = useState<string>("all");
  const [kind, setKind] = useState<string>("all");
  const [term, setTerm] = useState("");

  const rows = (data ?? []).filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (kind !== "all" && (o.kind ?? "food") !== kind) return false;
    if (!term.trim()) return true;
    const q = term.toLowerCase();
    return (
      o.customerName.toLowerCase().includes(q) ||
      o.restaurantName.toLowerCase().includes(q) ||
      o.driverName.toLowerCase().includes(q) ||
      (o.country ?? "").toLowerCase().includes(q) ||
      orderRef(o.id).toLowerCase().includes(q)
    );
  });

  const exportCsv = () =>
    downloadCsv(
      `dobra-orders-${new Date().toISOString().slice(0, 10)}.csv`,
      rows.map((o) => ({
        ref: orderRef(o.id),
        id: o.id,
        created_at: o.created_at,
        kind: o.kind ?? "food",
        status: o.status,
        restaurant: o.restaurantName,
        customer: o.customerName,
        driver: o.driverName,
        country: o.country,
        total: o.total,
        currency: o.currency,
        payment_method: o.payment_method,
        payment_status: o.payment_status,
        refund_amount: o.refund_amount ?? 0,
        refund_status: o.refund_status ?? "",
        cancel_reason: o.cancel_reason ?? "",
      })),
    );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("admin.orders.title")}</h1>
          <p className="text-sm text-foreground/60">{t("admin.orders.subtitle")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={!rows.length}>
          <Download className="size-4" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={t("admin.orders.searchPlaceholder")}
          className="max-w-xs"
        />
        <select
          aria-label="Order type"
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          <option value="all">All types</option>
          <option value="food">Food</option>
          <option value="package">Packages</option>
        </select>
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
  const extras = useQuery({ ...orderExtrasQuery(o.id), enabled: open });
  const drivers = useQuery(approvedDriversQuery);
  const [driverPick, setDriverPick] = useState<string>("");
  const [statusPick, setStatusPick] = useState<string>(o.status);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const account = useQuery(accountQueryOptions);
  const statuses = nextAdminStatuses(o, account.data?.role);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin"] });
  const closed = isClosedOrder(o);
  const refundable = Number(o.total) - Number(o.refund_amount ?? 0);
  const isCardPaid = o.payment_method === "card" && o.payment_status === "paid";
  const stripeRefund = useServerFn(refundOrderWithStripe);

  const saveNote = async () => {
    setSavingNote(true);
    try {
      await addNote(o.id, note);
      setNote("");
      toast.success("Note added");
      refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <Card className="p-4" data-testid={`order-${o.id}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-48">
          <p className="font-semibold">
            {orderRef(o.id)} · {o.restaurantName}
            {o.kind === "package" ? (
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">Package</span>
            ) : null}
          </p>
          <p className="text-sm text-foreground/60">
            {t("admin.orders.customer")}: {o.customerName} · {t("admin.orders.driver")}:{" "}
            {o.driverName}
          </p>
          <p className="text-xs text-foreground/50">
            <OrderTimeLabel step="placed" at={o.created_at} country={o.country} /> · {o.country || "—"}
          </p>
          {o.cancel_reason ? (
            <p className="text-xs text-destructive">Cancel reason: {o.cancel_reason}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold">{formatMoney(Number(o.total), o.currency)}</span>
          {o.refund_status ? (
            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
              {o.refund_status === "pending_card" ? "Card refund pending" : o.refund_status} ·{" "}
              {formatMoney(Number(o.refund_amount ?? 0), o.currency)}
            </span>
          ) : null}
          <StatusBadge status={o.status} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => setOpen((v) => !v)}>
          {open ? t("admin.orders.hideDetails") : t("admin.orders.viewDetails")}
        </Button>

        {!closed ? (
          <ActionDialog
            trigger={<Button size="sm" variant="destructive">Cancel order</Button>}
            title={`Cancel ${orderRef(o.id)}?`}
            description="The customer, restaurant and driver are notified."
            reasonLabel="Reason"
            reasonRequired
            destructive
            confirmLabel="Cancel order"
            successMessage={t("admin.orders.cancelled")}
            onConfirm={async (reason) => {
              await cancelOrder(o.id, reason);
              refresh();
            }}
          />
        ) : null}

        {refundable > 0.004 ? (
          <ActionDialog
            trigger={<Button size="sm" variant="outline">Refund</Button>}
            title={`Refund ${orderRef(o.id)}`}
            description={
              isCardPaid
                ? "Card payment: the money is sent back to the customer's card through Stripe automatically."
                : "Cash / unpaid order: the order is marked refunded (delivered) or voided (not delivered). No money moves automatically."
            }
            amount={{ max: refundable, currency: o.currency, label: "Refund amount" }}
            reasonLabel="Reason"
            reasonRequired
            destructive
            confirmLabel="Confirm refund"
            confirmSummary={(n) =>
              `You are about to refund ${formatMoney(n, o.currency)} on order ${orderRef(o.id)}. This is recorded in the audit log and cannot be undone.`
            }
            successMessage="Refund recorded"
            onConfirm={async (reason, amount) => {
              try {
                await stripeRefund({ data: { orderId: o.id, amount, reason } });
              } finally {
                refresh();
              }
            }}
          />
        ) : null}

        {canReassignOrder(o) ? (
          <ActionDialog
            trigger={<Button size="sm" variant="outline">Reassign driver</Button>}
            title="Reassign driver"
            description="Pick an approved driver, or remove the current one so the order goes back to the open pool."
            confirmLabel="Save"
            canSubmit={driverPick !== ""}
            successMessage="Driver updated"
            onConfirm={async () => {
              await reassignDriver(o.id, driverPick === "none" ? null : driverPick);
              setDriverPick("");
              refresh();
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor={`drv-${o.id}`}>Driver</Label>
              <select
                id={`drv-${o.id}`}
                value={driverPick}
                onChange={(e) => setDriverPick(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
              >
                <option value="">Select…</option>
                <option value="none">— No driver (unassign) —</option>
                {(drivers.data ?? [])
                  .filter((d) => d.id !== o.driver_id)
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.status})
                    </option>
                  ))}
              </select>
            </div>
          </ActionDialog>
        ) : null}

        {statuses.length > 0 ? <ActionDialog
          trigger={<Button size="sm" variant="outline">{t("admin.safeguards.changeStatus")}</Button>}
          title={t("admin.safeguards.changeStatus")}
          reasonLabel={t("admin.safeguards.reason")}
          reasonRequired
          confirmLabel={t("admin.safeguards.changeStatus")}
          canSubmit={statuses.includes(statusPick)}
          confirmSummary={() => t("admin.safeguards.confirmStatus", { ref: orderRef(o.id), status: statusPick.replace(/_/g, " ") })}
          successMessage={t("admin.safeguards.statusChanged")}
          onConfirm={async (reason) => {
            await forceStatus(o.id, statusPick, reason);
            refresh();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor={`st-${o.id}`}>{t("admin.safeguards.newStatus")}</Label>
            <select
              id={`st-${o.id}`}
              value={statusPick}
              onChange={(e) => setStatusPick(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value={o.status}>{o.status.replace(/_/g, " ")}</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        </ActionDialog> : null}

        <ActionDialog
          trigger={<Button size="sm" variant="ghost">Flag issue</Button>}
          title="Flag for follow-up"
          description="Adds this order to the Disputes queue."
          reasonLabel="What's wrong?"
          reasonRequired
          confirmLabel="Flag order"
          successMessage="Added to disputes"
          onConfirm={async (reason) => {
            await flagOrder(o.id, reason);
            refresh();
          }}
        />
      </div>

      {open ? (
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <div className="space-y-1 rounded-xl bg-muted/50 p-3 text-sm">
            <div className="mb-2 border-b border-ink/10 pb-2"><OrderTimeline order={o} country={o.country} /></div>
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
              <p className="text-foreground/60">
                {o.kind === "package"
                  ? `Pickup: ${o.pickup_address ?? "—"} → Drop-off: ${o.address ?? "—"}`
                  : t("admin.orders.noItems")}
              </p>
            ) : null}
            <div className="mt-2 space-y-0.5 border-t border-ink/10 pt-2 text-xs text-foreground/60">
              <p>
                {t("admin.orders.payment")}: {o.payment_method || "—"} · {o.payment_status || "—"}
              </p>
              {extras.data?.money ? (
                <p>
                  Service fee {formatMoney(Number(extras.data.money.service_fee), o.currency)} ·
                  Discount {formatMoney(Number(extras.data.money.discount), o.currency)}
                  {extras.data.money.promo_code ? ` (${extras.data.money.promo_code})` : ""}
                </p>
              ) : null}
            </div>
          </div>
          <div className="space-y-2 rounded-xl border border-ink/10 p-3 text-sm">
            <p className="font-semibold">Internal notes (admins only)</p>
            {(extras.data?.notes ?? []).map((n) => (
              <div key={n.id} className="rounded-lg bg-muted/50 p-2">
                <p className="whitespace-pre-wrap break-words">{n.body}</p>
                <p className="text-xs text-foreground/50">{formatDate(n.created_at)}</p>
              </div>
            ))}
            <Textarea
              aria-label="New internal note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note…"
            />
            <Button size="sm" onClick={saveNote} disabled={!note.trim() || savingNote}>
              {savingNote ? "Saving…" : "Add note"}
            </Button>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
