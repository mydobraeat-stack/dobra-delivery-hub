import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { accountQueryOptions } from "@/lib/profile";
import { AppHeader } from "@/components/dobra/AppHeader";
import { PendingApproval, Placeholder } from "@/components/dobra/PendingApproval";

export const Route = createFileRoute("/_authenticated/driver")({
  head: () => ({
    meta: [
      { title: "Driver Home — Dobra" },
      { name: "description", content: "See available deliveries and track your earnings." },
      { property: "og:title", content: "Driver Home — Dobra" },
      {
        property: "og:description",
        content: "See available deliveries and track your earnings.",
      },
    ],
  }),
  component: DriverHome,
});

function DriverHome() {
  const { data } = useQuery(accountQueryOptions);
  const approved = data?.approvalStatus === "approved";

  return (
    <div className="min-h-screen bg-background">
      <AppHeader subtitle="Driver" />
      <main className="mx-auto max-w-4xl space-y-6 px-5 py-6">
        <h1 className="text-2xl font-bold text-foreground">Driver home</h1>
        {approved ? (
          <div className="space-y-4">
            <Placeholder title="Available Deliveries" hint="Nearby jobs will show up here." />
            <Placeholder title="My Earnings" hint="Your payouts and tips will show up here." />
          </div>
        ) : (
          <PendingApproval what="driver" />
        )}
      </main>
    </div>
  );
}
