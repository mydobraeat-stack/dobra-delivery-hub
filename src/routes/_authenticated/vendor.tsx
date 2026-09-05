import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { accountQueryOptions } from "@/lib/profile";
import { AppHeader } from "@/components/dobra/AppHeader";
import { PendingApproval, Placeholder } from "@/components/dobra/PendingApproval";

export const Route = createFileRoute("/_authenticated/vendor")({
  head: () => ({
    meta: [
      { title: "Vendor Dashboard — Dobra" },
      { name: "description", content: "Manage your restaurant's orders and menu on Dobra." },
      { property: "og:title", content: "Vendor Dashboard — Dobra" },
      {
        property: "og:description",
        content: "Manage your restaurant's orders and menu on Dobra.",
      },
    ],
  }),
  component: VendorDashboard,
});

function VendorDashboard() {
  const { data } = useQuery(accountQueryOptions);
  const approved = data?.approvalStatus === "approved";

  return (
    <div className="min-h-screen bg-background">
      <AppHeader subtitle="Vendor" />
      <main className="mx-auto max-w-4xl space-y-6 px-5 py-6">
        <h1 className="text-2xl font-bold text-foreground">Vendor dashboard</h1>
        {approved ? (
          <div className="space-y-4">
            <Placeholder title="Your Orders" hint="Incoming orders will appear here." />
            <Placeholder title="Menu" hint="Your dishes and prices will live here." />
          </div>
        ) : (
          <PendingApproval what="restaurant" />
        )}
      </main>
    </div>
  );
}
