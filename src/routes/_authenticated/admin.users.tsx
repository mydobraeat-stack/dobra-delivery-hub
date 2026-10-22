import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActionDialog } from "@/components/admin/ActionDialog";
import {
  downloadCsv,
  driverStatsQuery,
  setAccountStatus,
  setPrime,
  setRole,
  userOrdersQuery,
  usersQuery,
  type UserRow,
} from "@/lib/admin-ops";
import { orderRef } from "@/lib/dobra";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: UsersPage,
});

function UsersPage() {
  const { data, isPending } = useQuery(usersQuery);
  const [term, setTerm] = useState("");
  const [role, setRoleF] = useState("all");
  const [country, setCountry] = useState("all");
  const [status, setStatus] = useState("all");

  const countries = [...new Set((data ?? []).map((u) => u.country).filter(Boolean))] as string[];
  const rows = (data ?? []).filter((u) => {
    if (role !== "all" && (role === "prime" ? !u.prime : u.role !== role)) return false;
    if (country !== "all" && u.country !== country) return false;
    if (status !== "all" && u.account_status !== status) return false;
    const q = term.trim().toLowerCase();
    if (!q) return true;
    return [u.full_name, u.email, u.phone].some((v) => (v ?? "").toLowerCase().includes(q));
  });

  const sel = "h-9 rounded-md border border-input bg-background px-2 text-sm";
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-foreground/60">Customers, vendors, drivers and admin staff.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={!rows.length}
          onClick={() =>
            downloadCsv(
              `dobra-users-${new Date().toISOString().slice(0, 10)}.csv`,
              rows.map((u) => ({
                id: u.id,
                name: u.full_name,
                email: u.email,
                phone: u.phone,
                role: u.role,
                country: u.country,
                approval: u.approval_status,
                account_status: u.account_status,
                prime: u.prime ? "yes" : "no",
                joined: u.created_at,
              })),
            )
          }
        >
          <Download className="size-4" /> Export CSV
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Input className="col-span-2 min-w-0 sm:col-span-1" placeholder="Search name, email, phone" value={term} onChange={(e) => setTerm(e.target.value)} />
        <select aria-label="Role" className={sel} value={role} onChange={(e) => setRoleF(e.target.value)}>
          <option value="all">All roles</option>
          <option value="customer">Customers</option>
          <option value="vendor">Vendors</option>
          <option value="driver">Drivers</option>
          <option value="admin">Super admins</option>
          <option value="support_agent">Support agents</option>
          <option value="prime">Prime members</option>
        </select>
        <select aria-label="Country" className={sel} value={country} onChange={(e) => setCountry(e.target.value)}>
          <option value="all">All countries</option>
          {countries.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select aria-label="Status" className={sel} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">Any status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>
      </div>
      {isPending ? <p className="text-foreground/60">Loading…</p> : null}
      <p className="text-xs text-foreground/50">{rows.length} users</p>
      <div className="space-y-2">
        {rows.map((u) => (
          <UserCard key={u.id} u={u} />
        ))}
      </div>
    </div>
  );
}

function UserCard({ u }: { u: UserRow }) {
  const qc = useQueryClient();
  const { formatDate, formatMoney } = useI18n();
  const [open, setOpen] = useState(false);
  const [statusPick, setStatusPick] = useState("suspended");
  const [rolePick, setRolePick] = useState(u.role);
  const orders = useQuery({ ...userOrdersQuery(u.id), enabled: open });
  const stats = useQuery({ ...driverStatsQuery(u.id), enabled: open && u.role === "driver" });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin"] });

  const badge =
    u.account_status === "active"
      ? "bg-muted text-foreground/70"
      : "bg-destructive/15 text-destructive";

  return (
    <Card className="p-4">
      <div className="admin-record-header flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">
            {u.full_name || "Unnamed"}{" "}
            <span className="ml-1 rounded-full bg-sun/60 px-2 py-0.5 text-xs">{u.role.replace("_", " ")}</span>
            <span className={`ml-1 rounded-full px-2 py-0.5 text-xs ${badge}`}>{u.account_status}</span>
            {u.prime ? <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">Prime</span> : null}
          </p>
          <p className="break-all text-sm text-foreground/60">
            {u.email ?? "—"} · {u.country ?? "no country"} · joined {formatDate(u.created_at)}
          </p>
          {u.suspension_reason ? <p className="text-xs text-destructive">Reason: {u.suspension_reason}</p> : null}
        </div>
        <div className="admin-actions flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => setOpen((v) => !v)}>
            {open ? "Hide activity" : "Activity"}
          </Button>
          {u.account_status === "active" ? (
            <ActionDialog
              trigger={<Button size="sm" variant="destructive">Suspend / ban</Button>}
              title={`Restrict ${u.full_name || u.email}`}
              description="Suspended and banned accounts cannot place, accept or sell orders. Drivers are taken offline."
              reasonLabel="Reason"
              reasonRequired
              destructive
              confirmLabel="Apply"
              successMessage="Account restricted"
              onConfirm={async (r) => {
                await setAccountStatus(u.id, statusPick, r);
                refresh();
              }}
            >
              <select
                aria-label="Restriction"
                value={statusPick}
                onChange={(e) => setStatusPick(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
              >
                <option value="suspended">Suspend (temporary)</option>
                <option value="banned">Ban (permanent)</option>
              </select>
            </ActionDialog>
          ) : (
            <Button
              size="sm"
              onClick={async () => {
                try {
                  await setAccountStatus(u.id, "active", "");
                  toast.success("Account reactivated");
                  refresh();
                } catch (e) {
                  toast.error((e as Error).message);
                }
              }}
            >
              Reactivate
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              try {
                await setPrime(u.id, !u.prime, 1);
                toast.success(u.prime ? "Prime revoked" : "Prime granted for 1 month");
                refresh();
              } catch (e) {
                toast.error((e as Error).message);
              }
            }}
          >
            {u.prime ? "Revoke Prime" : "Grant Prime"}
          </Button>
          <ActionDialog
            trigger={<Button size="sm" variant="ghost">Change role</Button>}
            title="Change role"
            description="Super admins have full access. Support agents can only handle orders, disputes, support chat and reviews."
            confirmLabel="Save role"
            canSubmit={rolePick !== u.role}
            successMessage="Role changed"
            onConfirm={async () => {
              await setRole(u.id, rolePick);
              refresh();
            }}
          >
            <select
              aria-label="Role"
              value={rolePick}
              onChange={(e) => setRolePick(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="customer">Customer</option>
              <option value="vendor">Vendor</option>
              <option value="driver">Driver</option>
              <option value="support_agent">Support agent</option>
              <option value="admin">Super admin</option>
            </select>
          </ActionDialog>
        </div>
      </div>
      {open ? (
        <div className="mt-3 space-y-2 rounded-xl bg-muted/50 p-3 text-sm">
          {stats.data ? (
            <p className="font-medium">
              Deliveries completed {stats.data.delivered} · cancelled {stats.data.cancelled} · rating{" "}
              {stats.data.rating ? `${stats.data.rating.toFixed(1)}★ (${stats.data.ratings})` : "no ratings yet"}
            </p>
          ) : null}
          {orders.isPending ? <p className="text-foreground/60">Loading…</p> : null}
          {(orders.data ?? []).length === 0 && !orders.isPending ? (
            <p className="text-foreground/60">No orders yet.</p>
          ) : null}
          {(orders.data ?? []).map((o) => (
            <div key={o.id} className="flex flex-wrap justify-between gap-2">
              <span>
                {orderRef(o.id)} · {o.kind} · {o.customer_id === u.id ? "as customer" : "as driver"} ·{" "}
                {formatDate(o.created_at)}
              </span>
              <span>
                {formatMoney(Number(o.total), o.currency)} · {o.status}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  );
}
