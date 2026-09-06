import { createFileRoute, Outlet, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { accountQueryOptions } from "@/lib/profile";
import { AppHeader } from "@/components/dobra/AppHeader";
import { cn } from "@/lib/utils";

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

const LINKS = [
  { to: "/admin", label: "Dashboard", exact: true },
  { to: "/admin/approvals", label: "Approvals" },
  { to: "/admin/restaurants", label: "Restaurants" },
  { to: "/admin/drivers", label: "Drivers" },
  { to: "/admin/orders", label: "Orders" },
];

function AdminLayout() {
  const navigate = useNavigate();
  const { data, isPending } = useQuery(accountQueryOptions);

  useEffect(() => {
    if (data && data.role !== "admin") navigate({ to: "/home", replace: true });
  }, [data, navigate]);

  if (isPending || !data) {
    return <div className="p-10 text-center text-foreground/60">Loading…</div>;
  }
  if (data.role !== "admin") {
    return <div className="p-10 text-center text-foreground/60">Redirecting…</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <AppHeader subtitle="Admin" />
      <nav aria-label="Admin sections" className="border-b border-ink/10 bg-card/60">
        <ul className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 py-2">
          {LINKS.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                activeOptions={{ exact: Boolean(l.exact) }}
                className={cn(
                  "block whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-foreground/70 hover:bg-primary/20",
                )}
                activeProps={{ className: "bg-primary text-foreground font-semibold" }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
