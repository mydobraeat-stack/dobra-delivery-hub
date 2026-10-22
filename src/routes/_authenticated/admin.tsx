import { createFileRoute, Outlet, useNavigate, Link, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { accountQueryOptions } from "@/lib/profile";
import { AppHeader } from "@/components/dobra/AppHeader";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { canAccessAdminPath } from "@/lib/admin-rules";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
  head: () => ({
    meta: [
      { title: "Dobra Admin — approvals, restaurants and orders" },
      {
        name: "description",
        content:
          "Internal Dobra admin area for approving vendors and drivers, managing restaurants and monitoring orders.",
      },
      { property: "og:title", content: "Dobra Admin" },
      { property: "og:description", content: "Approve vendors and drivers, manage restaurants and orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function AdminLayout() {
  const navigate = useNavigate();
  const t = useT();
  const pathname = useLocation({ select: (location) => location.pathname });
  const { data, isPending } = useQuery(accountQueryOptions);

  const isSuper = data?.role === "admin";
  const isStaff = isSuper || data?.role === "support_agent";
  const allowed = canAccessAdminPath(data?.role, pathname);
  const ALL = [
    { to: "/admin", label: t("admin.nav.dashboard"), exact: true, superOnly: true },
    { to: "/admin/orders", label: t("admin.nav.orders") },
    { to: "/admin/disputes", label: "Disputes" },
    { to: "/admin/support", label: t("chat.inboxTitle") },
    { to: "/admin/feedback", label: "Customer reviews" },
    { to: "/admin/approvals", label: t("admin.nav.approvals"), superOnly: true },
    { to: "/admin/users", label: "Users", superOnly: true },
    { to: "/admin/restaurants", label: t("admin.nav.restaurants"), superOnly: true },
    { to: "/admin/drivers", label: t("admin.nav.drivers"), superOnly: true },
    { to: "/admin/reviews", label: t("admin.nav.reviews"), superOnly: true },
    { to: "/admin/pricing", label: "Fees & pricing", superOnly: true },
    { to: "/admin/promos", label: "Promo codes", superOnly: true },
    { to: "/admin/platform", label: "Platform", superOnly: true },
    { to: "/admin/analytics", label: "Analytics", superOnly: true },
    { to: "/admin/audit", label: "Audit log", superOnly: true },
  ];
  const LINKS = ALL.filter((l) => isSuper || !l.superOnly);

  useEffect(() => {
    if (data && !isStaff) navigate({ to: "/home", replace: true });
    if (data && data.role === "support_agent" && !allowed)
      navigate({ to: "/admin/orders", replace: true });
  }, [data, isStaff, allowed, navigate]);

  if (isPending || !data) {
    return <div className="p-10 text-center text-foreground/60">{t("admin.loading")}</div>;
  }
  if (!isStaff || !allowed) {
    return <div className="p-10 text-center text-foreground/60">{t("admin.redirecting")}</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <AppHeader subtitle={isSuper ? "Super Admin" : "Support Agent"} />
      <nav aria-label={t("admin.nav.label")} className="border-b border-ink/10 bg-card/60">
        <ul className="mx-auto flex max-w-7xl flex-wrap gap-1 px-4 py-2">
          {LINKS.map((l) => (
            <li key={l.to} className="shrink-0">
              <Link
                to={l.to}
                activeOptions={{ exact: Boolean(l.exact) }}
                className={cn(
                  "block whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-foreground/70 hover:bg-sun/20",
                )}
                activeProps={{ className: "bg-sun text-sun-foreground font-semibold" }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
      {isSuper && (
        <footer className="mx-auto max-w-7xl px-4 pb-6 text-right">
          <Link
            to="/admin/store-assets"
            className="text-xs text-foreground/45 underline-offset-2 hover:text-foreground/80 hover:underline"
          >
            Store assets
          </Link>
        </footer>
      )}
    </div>
  );
}
