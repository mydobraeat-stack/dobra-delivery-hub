import { createFileRoute, Outlet, useNavigate, Link, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Menu, LayoutDashboard, ShoppingBag, MessageCircle, ShieldCheck, Users, Store, Bike, FileCheck, SlidersHorizontal, Ticket, Settings, ChartNoAxesCombined, ScrollText, Star, TriangleAlert, Banknote, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const { data, isPending } = useQuery(accountQueryOptions);

  const isSuper = data?.role === "admin";
  const isStaff = isSuper || data?.role === "support_agent";
  const allowed = canAccessAdminPath(data?.role, pathname);
  const ALL = [
    { to: "/admin", label: t("admin.nav.dashboard"), icon: LayoutDashboard, exact: true, superOnly: true },
    { to: "/admin/orders", label: t("admin.nav.orders"), icon: ShoppingBag },
    { to: "/admin/disputes", label: "Disputes", icon: TriangleAlert },
    { to: "/admin/support", label: t("chat.inboxTitle"), icon: MessageCircle },
    { to: "/admin/feedback", label: "Customer reviews", icon: Star },
    { to: "/admin/approvals", label: t("admin.nav.approvals"), icon: ShieldCheck, superOnly: true },
    { to: "/admin/users", label: "Users", icon: Users, superOnly: true },
    { to: "/admin/restaurants", label: t("admin.nav.restaurants"), icon: Store, superOnly: true },
    { to: "/admin/drivers", label: t("admin.nav.drivers"), icon: Bike, superOnly: true },
    { to: "/admin/payouts", label: "Cash payouts", icon: Banknote, superOnly: true },
    { to: "/admin/referrals", label: t("referrals.adminTitle"), icon: Gift, superOnly: true },
    { to: "/admin/reviews", label: t("admin.nav.reviews"), icon: FileCheck, superOnly: true },
    { to: "/admin/pricing", label: "Fees & pricing", icon: SlidersHorizontal, superOnly: true },
    { to: "/admin/promos", label: "Promo codes", icon: Ticket, superOnly: true },
    { to: "/admin/platform", label: "Platform", icon: Settings, superOnly: true },
    { to: "/admin/analytics", label: "Analytics", icon: ChartNoAxesCombined, superOnly: true },
    { to: "/admin/audit", label: "Audit log", icon: ScrollText, superOnly: true },
  ];
  const LINKS = ALL.filter((l) => isSuper || !l.superOnly);
  const activeLabel = LINKS.find((l) => l.to === pathname)?.label ?? "Store assets";

  useEffect(() => setMenuOpen(false), [pathname]);

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

  const navigation = (
    <nav aria-label={t("admin.nav.label")} className="flex min-h-0 flex-1 flex-col">
        <ul className="space-y-1">
          {LINKS.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                activeOptions={{ exact: Boolean(l.exact) }}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-muted",
                )}
                activeProps={{ className: "bg-sun-gradient text-sun-foreground font-semibold", "aria-current": "page" }}
                onClick={() => setMenuOpen(false)}
              >
                <l.icon className="size-4 shrink-0" aria-hidden />
                <span className="min-w-0 break-words">{l.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      {isSuper && (
        <div className="mt-6 border-t border-border px-3 pt-4">
          <Link
            to="/admin/store-assets"
            className="text-xs text-foreground/45 underline-offset-2 hover:text-foreground/80 hover:underline"
            onClick={() => setMenuOpen(false)}
          >
            Store assets
          </Link>
        </div>
      )}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background pb-10">
      <AppHeader subtitle={isSuper ? "Super Admin" : "Support Agent"} />
      <div className="sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-header-gradient px-4 py-3 lg:hidden">
        <p className="min-w-0 truncate font-semibold">{activeLabel}</p>
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="size-11 shrink-0" aria-label={t("admin.nav.label")}>
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex w-[min(20rem,88vw)] flex-col overflow-y-auto bg-card p-4" aria-describedby={undefined}>
            <SheetHeader className="mb-4 text-left">
              <SheetTitle>{t("admin.nav.label")}</SheetTitle>
            </SheetHeader>
            {navigation}
          </SheetContent>
        </Sheet>
      </div>
      <div className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)] lg:grid-cols-[224px_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden max-h-dvh self-start overflow-y-auto border-r border-border bg-panel-gradient p-4 lg:flex lg:flex-col">
          <p className="mb-4 px-3 text-xs font-semibold uppercase text-muted-foreground">{isSuper ? "Super Admin" : "Support Agent"}</p>
          {navigation}
        </aside>
        <main className="admin-content min-w-0 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
