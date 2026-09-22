import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/dobra/AppHeader";
import { TabBar } from "@/components/dobra/TabBar";
import { PhoneFrame } from "@/components/dobra/PhoneFrame";
import { useT } from "@/lib/i18n";
import { accountQueryOptions } from "@/lib/profile";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfileLayout,
});

function ProfileLayout() {
  const t = useT();
  const { data: account } = useQuery(accountQueryOptions);
  const role = account?.role ?? "customer";

  const body = (
    <>
      <AppHeader subtitle={t("common.actions.profile")} />
      <Outlet />
      {role === "customer" || role === "vendor" || role === "driver" ? (
        <TabBar role={role} />
      ) : null}
    </>
  );

  if (role === "customer" || role === "driver") {
    return <PhoneFrame className="min-h-screen pb-24">{body}</PhoneFrame>;
  }

  return <div className="min-h-screen bg-background pb-24">{body}</div>;
}
