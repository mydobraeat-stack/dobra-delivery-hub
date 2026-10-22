import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import type { AdminOrder } from "@/lib/admin";
import { driverPayout, restaurantEarnings } from "@/lib/payout";

const GOOD = "var(--good)";
const WARN = "var(--warn)";
const BAD = "var(--bad)";
const INFO = "var(--info)";

function ChartCard({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <Card className="space-y-3 p-5">
      <div>
        <h2 className="font-bold">{title}</h2>
        {hint ? <p className="text-xs text-foreground/60">{hint}</p> : null}
      </div>
      {children}
    </Card>
  );
}

function Legend({ items }: { items: { name: string; value: number | string; color: string }[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
      {items.map((i) => (
        <li key={i.name} className="flex items-center gap-2">
          <span className="size-2.5 shrink-0 rounded-full" style={{ background: i.color }} />
          <span className="text-foreground/70">{i.name}</span>
          <span className="ml-auto font-semibold tabular-nums">{i.value}</span>
        </li>
      ))}
    </ul>
  );
}

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
  color: "var(--foreground)",
};

export function DashboardCharts({
  orders,
  attention,
  formatMoney,
}: {
  orders: AdminOrder[];
  attention: { name: string; value: number }[];
  formatMoney: (n: number, c?: string) => string;
}) {
  const pln = orders.filter((o) => o.currency === "PLN");

  // Revenue over the last 14 days (delivered, minus refunds). Colour by significance vs the average.
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (13 - i));
    return d;
  });
  const revenue = days.map((d) => {
    const key = d.toDateString();
    const value = pln
      .filter((o) => o.status === "delivered" && new Date(o.created_at).toDateString() === key)
      .reduce((s, o) => s + Number(o.total) - Number(o.refund_amount ?? 0), 0);
    return { day: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), value: Math.round(value * 100) / 100 };
  });
  const active = revenue.filter((r) => r.value > 0);
  const avg = active.length ? active.reduce((s, r) => s + r.value, 0) / active.length : 0;
  const revColor = (v: number) => (v === 0 ? BAD : v >= avg ? GOOD : WARN);

  // Order outcome split.
  const count = (f: (o: AdminOrder) => boolean) => orders.filter(f).length;
  const outcomes = [
    { name: "Delivered", value: count((o) => o.status === "delivered"), color: GOOD },
    { name: "In progress", value: count((o) => !["delivered", "cancelled"].includes(o.status) && o.payment_status !== "failed"), color: INFO },
    { name: "Payment failed", value: count((o) => o.payment_status === "failed"), color: WARN },
    { name: "Cancelled", value: count((o) => o.status === "cancelled" && o.payment_status !== "failed"), color: BAD },
  ];

  // Payment methods.
  const methods = [
    { name: "Card / BLIK", value: count((o) => o.payment_method !== "cash"), color: INFO },
    { name: "Cash", value: count((o) => o.payment_method === "cash"), color: WARN },
  ];

  // Payout split for delivered PLN orders.
  const done = pln.filter((o) => o.status === "delivered");
  const sum = (f: (o: AdminOrder) => number, list = done) => Math.round(list.reduce((s, o) => s + f(o), 0) * 100) / 100;
  const restTotal = sum(restaurantEarnings);
  const driverTotal = sum(driverPayout);
  const collected = sum((o) => Number(o.total) - Number(o.refund_amount ?? 0));
  const dobraNet = Math.round((collected - restTotal - driverTotal) * 100) / 100;
  const top = (key: (o: AdminOrder) => string, val: (o: AdminOrder) => number) => {
    const m = new Map<string, number>();
    for (const o of done) { const k = key(o); if (k) m.set(k, (m.get(k) ?? 0) + val(o)); }
    return [...m.entries()].map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 })).sort((a, b) => b.value - a.value).slice(0, 8);
  };
  const byRestaurant = top((o) => (o.kind === "package" ? "" : o.restaurantName), restaurantEarnings);
  const byDriver = top((o) => (o.driver_id ? o.driverName : ""), driverPayout);

  const attnColor = (v: number) => (v === 0 ? GOOD : v >= 5 ? BAD : WARN);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
        {[
          { label: "Restaurant earnings", to: "/admin/restaurants", value: restTotal, color: GOOD, hint: "Full order totals, minus refunds" },
          { label: "Driver payouts", to: "/admin/drivers", value: driverTotal, color: INFO, hint: "Fixed amount per delivery" },
          { label: "Dobra net", to: "/admin/analytics", value: dobraNet, color: dobraNet < 0 ? BAD : GOOD, hint: "Collected − restaurants − drivers" },
        ].map((k) => (
          <Link key={k.label} to={k.to} className="block rounded-xl">
          <Card className="h-full border-l-4 p-5 transition-shadow hover:shadow-soft" style={{ borderLeftColor: k.color }}>
            <p className="text-sm text-foreground/60">{k.label} (delivered, PLN)</p>
            <p className="mt-1 text-2xl font-bold" style={{ color: k.color }}>{formatMoney(k.value, "PLN")}</p>
            <p className="text-[11px] text-foreground/50">{k.hint}</p>
          </Card>
          </Link>
        ))}
      </div>

      <ChartCard title="Restaurant earnings (PLN)" hint="Top restaurants by what they receive from delivered orders.">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byRestaurant} layout="vertical" margin={{ left: 24, right: 16 }}>
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatMoney(v, "PLN")} />
              <Bar dataKey="value" fill={GOOD} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Driver payouts (PLN)" hint="What Dobra owes each driver for delivered orders.">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byDriver} layout="vertical" margin={{ left: 24, right: 16 }}>
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatMoney(v, "PLN")} />
              <Bar dataKey="value" fill={INFO} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard
        title="Revenue, last 14 days (PLN)"
        hint="Delivered orders minus refunds. Green: above average · Amber: below · Red: no sales."
      >
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenue} margin={{ left: -16, right: 4, top: 4 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={1} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatMoney(v, "PLN")} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {revenue.map((r) => (
                  <Cell key={r.day} fill={revColor(r.value)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Needs your attention" hint="Green: clear · Amber: some waiting · Red: 5 or more waiting.">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attention} layout="vertical" margin={{ left: 24, right: 16 }}>
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} minPointSize={3}>
                {attention.map((a) => (
                  <Cell key={a.name} fill={attnColor(a.value)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Order outcomes" hint="All orders. Red and amber slices are lost or at-risk orders.">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={outcomes} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={2}>
                {outcomes.map((o) => (
                  <Cell key={o.name} fill={o.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <Legend items={outcomes} />
      </ChartCard>

      <ChartCard title="Payment methods" hint="Cash orders are collected by drivers and need settling.">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={methods} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={2}>
                {methods.map((o) => (
                  <Cell key={o.name} fill={o.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <Legend items={methods} />
      </ChartCard>
    </div>
  );
}
