import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { AppHeader } from "@/components/dobra/AppHeader";
import { TabBar } from "@/components/dobra/TabBar";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/driver")({
  component: DriverLayout,
});

function DriverLayout() {
  const t = useT();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/driver" || pathname === "/driver/";

  return (
    <div className="min-h-screen bg-background pb-24">
      {isHome ? null : <AppHeader subtitle={t("common.roles.driver")} />}
      <Outlet />
      <TabBar role="driver" />
    </div>
  );
}
