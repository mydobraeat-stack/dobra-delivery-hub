import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { analyticsQuery } from "@/lib/admin-ops";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  component: Analytics,
});

const iso = (d: Date) => d.toISOString().slice(0, 10);

function Analytics() {
  const { formatMoney } = useI18n();
  const [from, setFrom] = useState(iso(new Date(Date.now() - 29 * 86400000)));
  const [to, setTo] = useState(iso(new Date()));
  const [country, setCountry] = useState("all");
  const { data, isPending } = useQuery(analyticsQuery(from, to, country));

  const orders = data?.orders ?? [];
  const delivered = orders.filter((o) => o.status === "delivered");
  const byCurrency = new Map<string, number>();
  for (const o of delivered)
    byCurrency.set(o.currency, (byCurrency.get(o.currency) ?? 0) + Number(o.total) - Number(o.refund_amount ?? 0));
  const activeDrivers = new Set(orders.map((o) => o.driver_id).filter(Boolean)).size;
  const timed = delivered.filter((o) => o.delivered_at);
  const avgMin = timed.length
    ? timed.reduce((s, o) => s + (new Date(o.delivered_at!).getTime() - new Date(o.created_at).getTime()), 0) /
      timed.length /
      60000
    : null;

  const perDay = new Map<string, number>();
  for (let d = new Date(from); d <= new Date(to); d = new Date(d.getTime() + 86400000)) perDay.set(iso(d), 0);
  for (const o of orders) {
    const k = o.created_at.slice(0, 10);
    perDay.set(k, (perDay.get(k) ?? 0) + 1);
  }
  const days = [...perDay.entries()];
  const maxDay = Math.max(1, ...days.map(([, v]) => v));

  const nameBy = new Map((data?.restaurants ?? []).map((r) => [r.id, r.name]));
  const top = new Map<string, { n: number; rev: number; cur: string }>();
  for (const o of delivered) {
    if (!o.restaurant_id) continue;
    const t = top.get(o.restaurant_id) ?? { n: 0, rev: 0, cur: o.currency };
    t.n += 1;
    t.rev += Number(o.total);
    top.set(o.restaurant_id, t);
  }
  const topList = [...top.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 8);
  const maxTop = Math.max(1, ...topList.map(([, v]) => v.n));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <Input aria-label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="min-w-0 w-full sm:w-40" />
          <Input aria-label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="min-w-0 w-full sm:w-40" />
          <select aria-label="Country" value={country} onChange={(e) => setCountry(e.target.value)} className="col-span-2 h-9 rounded-md border border-input bg-background px-2 text-sm">
            <option value="all">All countries</option>
            <option>Poland</option>
            <option>Cameroon</option>
          </select>
        </div>
      </div>
      {isPending ? <p className="text-foreground/60">Loading…</p> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total orders" value={orders.length} />
        <Stat
          label="Revenue (delivered, net of refunds)"
          value={[...byCurrency.entries()].map(([c, v]) => formatMoney(v, c)).join(" · ") || "0"}
        />
        <Stat label="Active drivers" value={activeDrivers} />
        <Stat label="Avg. delivery time" value={avgMin ? `${Math.round(avgMin)} min` : "—"} />
      </div>
      <Card className="p-5">
        <h2 className="mb-3 font-bold">Orders per day</h2>
        <div className="flex h-40 items-end gap-[2px] overflow-x-auto">
          {days.map(([d, v]) => (
            <div key={d} className="flex min-w-[6px] flex-1 flex-col items-center justify-end" title={`${d}: ${v}`}>
              <div className="w-full rounded-t bg-primary" style={{ height: `${(v / maxDay) * 100}%`, minHeight: v ? 3 : 0 }} />
            </div>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-xs text-foreground/50">
          <span>{from}</span>
          <span>{to}</span>
        </div>
      </Card>
      <Card className="p-5">
        <h2 className="mb-3 font-bold">Top restaurants (delivered orders)</h2>
        {topList.length === 0 ? <p className="text-sm text-foreground/60">No delivered orders in this range.</p> : null}
        <div className="space-y-2">
          {topList.map(([id, v]) => (
            <div key={id} className="text-sm">
              <div className="flex justify-between gap-2">
                <span className="truncate font-medium">{nameBy.get(id) ?? "—"}</span>
                <span className="shrink-0">
                  {v.n} · {formatMoney(v.rev, v.cur)}
                </span>
              </div>
              <div className="mt-1 h-2 rounded bg-muted">
                <div className="h-2 rounded bg-sun" style={{ width: `${(v.n / maxTop) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
      <p className="text-xs text-foreground/50">
        Average delivery time only counts orders delivered after this update (earlier orders have no delivery timestamp).
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-foreground/60">{label}</p>
      <p className="mt-1 break-words text-2xl font-bold">{value}</p>
    </Card>
  );
}
