import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppHeader } from "@/components/dobra/AppHeader";
import { TabBar } from "@/components/dobra/TabBar";

export const Route = createFileRoute("/_authenticated/driver")({
  component: DriverLayout,
});

function DriverLayout() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader subtitle="Driver" />
      <Outlet />
      <TabBar role="driver" />
    </div>
  );
}
