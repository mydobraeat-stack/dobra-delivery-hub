import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppHeader } from "@/components/dobra/AppHeader";
import { TabBar } from "@/components/dobra/TabBar";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/vendor")({
  component: VendorLayout,
});

function VendorLayout() {
  const t = useT();
  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader subtitle={t("vendor.layout.subtitle")} />
      <Outlet />
      <TabBar role="vendor" />
    </div>
  );
}
