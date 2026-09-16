import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppHeader } from "@/components/dobra/AppHeader";
import { CartBar } from "@/components/dobra/CartBar";
import { PhoneFrame } from "@/components/dobra/PhoneFrame";
import { TabBar } from "@/components/dobra/TabBar";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/customer")({
  component: CustomerLayout,
});

function CustomerLayout() {
  const t = useT();
  return (
    <PhoneFrame className="min-h-screen pb-40">
      <AppHeader subtitle={t("common.roles.customer")} />
      <Outlet />
      <CartBar raised />
      <TabBar role="customer" />
    </PhoneFrame>
  );
}
