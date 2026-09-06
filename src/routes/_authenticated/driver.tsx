import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { accountQueryOptions } from "@/lib/profile";
import { AppHeader } from "@/components/dobra/AppHeader";
import { PendingApproval } from "@/components/dobra/PendingApproval";
import { StatusBadge } from "@/components/dobra/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  claimOrder,
  driverOrdersQuery,
  money,
  orderRef,
  payout,
  restaurantsQuery,
  updateOrderStatus,
} from "@/lib/dobra";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DriverHome,
});

function DriverHome() {
  const { data: account } = useQuery(accountQueryOptions);
  const approved = account?.approvalStatus === "approved";
  const { data, isLoading } = useQuery({ ...driverOrdersQuery, enabled: approved });
  const { data: restaurants = [] } = useQuery({ ...restaurantsQuery, enabled: approved });
  const queryClient = useQueryClient();

  const restaurantName = (id: string) => restaurants.find((r) => r.id === id)?.name ?? "Restaurant";
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["orders"] });

  const claim = useMutation({
    mutationFn: (id: string) => claimOrder(id),
    onSuccess: () => {
      toast.success("Delivery accepted.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const advance = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateOrderStatus(id, status),
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  if (!approved) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader subtitle="Driver" />
        <main className="mx-auto max-w-4xl space-y-6 px-5 py-6">
          <h1 className="text-2xl font-bold text-foreground">Driver home</h1>
          <PendingApproval what="driver" />
        </main>
      </div>
    );
  }

  const mine = data?.mine ?? [];
  const available = data?.available ?? [];
  const active = mine.filter((o) => o.status !== "delivered" && o.status !== "cancelled");
  const completed = mine.filter((o) => o.status === "delivered");
  const earnings = completed.reduce((sum, o) => sum + payout(Number(o.total)), 0);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader subtitle="Driver" />
      <main className="mx-auto max-w-4xl space-y-6 px-5 py-6">
        <h1 className="text-2xl font-bold text-foreground">Driver home</h1>

        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="border-ink/10">
            <CardContent className="py-4">
              <p className="text-xs text-foreground/60">Earnings</p>
              <p className="text-xl font-bold text-foreground">{money(earnings)}</p>
            </CardContent>
          </Card>
          <Card className="border-ink/10">
            <CardContent className="py-4">
              <p className="text-xs text-foreground/60">Deliveries done</p>
              <p className="text-xl font-bold text-foreground">{completed.length}</p>
            </CardContent>
          </Card>
          <Card className="border-ink/10">
            <CardContent className="py-4">
              <p className="text-xs text-foreground/60">Active now</p>
              <p className="text-xl font-bold text-foreground">{active.length}</p>
            </CardContent>
          </Card>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">Available deliveries</h2>
          {isLoading ? (
            <p className="text-sm text-foreground/60">Loading…</p>
          ) : available.length === 0 ? (
            <p className="text-sm text-foreground/60">No deliveries waiting right now.</p>
          ) : (
            available.map((o) => (
              <Card key={o.id} className="border-ink/10">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div>
                    <p className="font-semibold text-foreground">{restaurantName(o.restaurant_id)}</p>
                    <p className="text-xs text-foreground/60">
                      {orderRef(o.id)} · {money(o.total, o.currency)} · you earn{" "}
                      {money(payout(Number(o.total)), o.currency)}
                    </p>
                  </div>
                  <Button size="sm" disabled={claim.isPending} onClick={() => claim.mutate(o.id)}>
                    Accept
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">My deliveries</h2>
          {mine.length === 0 ? (
            <p className="text-sm text-foreground/60">Nothing assigned yet.</p>
          ) : (
            mine.map((o) => (
              <Card key={o.id} className="border-ink/10">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div>
                    <p className="font-semibold text-foreground">{restaurantName(o.restaurant_id)}</p>
                    <p className="text-xs text-foreground/60">
                      {orderRef(o.id)} · {money(payout(Number(o.total)), o.currency)} payout
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={o.status} />
                    {o.status === "ready" ? (
                      <Button
                        size="sm"
                        disabled={advance.isPending}
                        onClick={() => advance.mutate({ id: o.id, status: "picked_up" })}
                      >
                        Picked up
                      </Button>
                    ) : null}
                    {o.status === "picked_up" ? (
                      <Button
                        size="sm"
                        disabled={advance.isPending}
                        onClick={() => advance.mutate({ id: o.id, status: "delivered" })}
                      >
                        Delivered
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
