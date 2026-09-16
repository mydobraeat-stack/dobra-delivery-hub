import { createFileRoute, Outlet, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { accountQueryOptions } from "@/lib/profile";
import { AppHeader } from "@/components/dobra/AppHeader";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

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
  const { data, isPending } = useQuery(accountQueryOptions);

  const LINKS = [
    { to: "/admin", label: t("admin.nav.dashboard"), exact: true },
    { to: "/admin/approvals", label: t("admin.nav.approvals") },
    { to: "/admin/restaurants", label: t("admin.nav.restaurants") },
    { to: "/admin/drivers", label: t("admin.nav.drivers") },
    { to: "/admin/reviews", label: t("admin.nav.reviews") },
    { to: "/admin/orders", label: t("admin.nav.orders") },
  ];

  useEffect(() => {
    if (data && data.role !== "admin") navigate({ to: "/home", replace: true });
  }, [data, navigate]);

  if (isPending || !data) {
    return <div className="p-10 text-center text-foreground/60">{t("admin.loading")}</div>;
  }
  if (data.role !== "admin") {
    return <div className="p-10 text-center text-foreground/60">{t("admin.redirecting")}</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <AppHeader subtitle={t("admin.subtitle")} />
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
                activeProps={{ className: "bg-sun text-foreground font-semibold" }}
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
    </div>
  );
}
