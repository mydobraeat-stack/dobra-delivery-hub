import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppHeader } from "@/components/dobra/AppHeader";
import { CartBar } from "@/components/dobra/CartBar";
import { TabBar } from "@/components/dobra/TabBar";

export const Route = createFileRoute("/_authenticated/customer")({
  component: CustomerLayout,
});

function CustomerLayout() {
  return (
    <div className="min-h-screen bg-background pb-40">
      <AppHeader subtitle="Customer" />
      <Outlet />
      <CartBar raised />
      <TabBar role="customer" />
    </div>
  );
}
