import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import {
  adminDriversQuery,
  adminOrdersQuery,
  adminProfilesQuery,
  adminRestaurantsQuery,
} from "@/lib/admin";
import { useI18n, useT } from "@/lib/i18n";
import { DashboardCharts } from "@/components/admin/DashboardCharts";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function Stat({ label, value, to, search }: { label: string; value: string | number; to?: string; search?: Record<string, string> }) {
  const body = (
    <Card className={to ? "h-full p-5 transition-shadow hover:shadow-soft" : "p-5"}>
      <p className="text-sm text-foreground/60">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </Card>
  );
  return to ? <Link to={to} search={search as never} className="block rounded-xl focus-visible:ring-2 focus-visible:ring-ring">{body}</Link> : body;
}

function AdminDashboard() {
  const t = useT();
  const { formatMoney } = useI18n();
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
        <h1 className="text-2xl font-bold">{t("admin.dashboard.title")}</h1>
        <p className="text-sm text-foreground/60">{t("admin.dashboard.subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={t("admin.dashboard.accountsWaiting")} value={pendingPeople} to="/admin/approvals" />
        <Stat label={t("admin.dashboard.documentsToReview")} value={pendingDocs} to="/admin/drivers" />
        <Stat label={t("admin.dashboard.restaurantsPending")} value={pendingRestaurants} to="/admin/restaurants" />
        <Stat label={t("admin.dashboard.liveOrders")} value={live} to="/admin/orders" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label={t("admin.dashboard.people")} value={profiles.data?.length ?? 0} to="/admin/users" />
        <Stat label={t("admin.dashboard.restaurants")} value={restaurants.data?.length ?? 0} to="/admin/restaurants" />
        <Stat
          label={t("admin.dashboard.completedRevenue")}
          value={formatMoney(revenue, orders.data?.[0]?.currency ?? "PLN")}
          to="/admin/orders"
          search={{ status: "delivered" }}
        />
      </div>

      <DashboardCharts
        orders={orders.data ?? []}
        formatMoney={formatMoney}
        attention={[
          { name: "Accounts waiting", value: pendingPeople },
          { name: "Driver documents", value: pendingDocs },
          { name: "Restaurants pending", value: pendingRestaurants },
          { name: "Live orders", value: live },
        ]}
      />
    </div>
  );
}
