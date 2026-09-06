import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import {
  adminDriversQuery,
  adminOrdersQuery,
  adminProfilesQuery,
  adminRestaurantsQuery,
} from "@/lib/admin";
import { money } from "@/lib/dobra";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function Stat({ label, value, to }: { label: string; value: string | number; to?: string }) {
  const body = (
    <Card className="p-5">
      <p className="text-sm text-foreground/60">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </Card>
  );
  return to ? <Link to={to}>{body}</Link> : body;
}

function AdminDashboard() {
  const profiles = useQuery(adminProfilesQuery);
  const drivers = useQuery(adminDriversQuery);
  const restaurants = useQuery(adminRestaurantsQuery);
  const orders = useQuery(adminOrdersQuery);

  const pendingPeople = (profiles.data ?? []).filter(
    (p) => p.approval_status === "pending" && (p.role === "vendor" || p.role === "driver"),
  ).length;
  const pendingRestaurants = (restaurants.data ?? []).filter((r) => r.status === "pending").length;
  const pendingDocs = (drivers.data ?? []).filter((d) => d.docs_status === "in_review").length;
  const live = (orders.data ?? []).filter(
    (o) => o.status !== "delivered" && o.status !== "cancelled",
  ).length;
  const revenue = (orders.data ?? [])
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform overview</h1>
        <p className="text-sm text-foreground/60">Everything happening across Dobra right now.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Accounts waiting" value={pendingPeople} to="/admin/approvals" />
        <Stat label="Documents to review" value={pendingDocs} to="/admin/drivers" />
        <Stat label="Restaurants pending" value={pendingRestaurants} to="/admin/restaurants" />
        <Stat label="Live orders" value={live} to="/admin/orders" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="People" value={profiles.data?.length ?? 0} />
        <Stat label="Restaurants" value={restaurants.data?.length ?? 0} />
        <Stat label="Completed revenue" value={money(revenue, orders.data?.[0]?.currency ?? "PLN")} />
      </div>
    </div>
  );
}
