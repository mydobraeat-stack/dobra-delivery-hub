import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  adminDriversQuery,
  adminProfilesQuery,
  adminRestaurantsQuery,
  setProfileApproval,
} from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin/approvals")({
  component: PendingApprovals,
});

function PendingApprovals() {
  const queryClient = useQueryClient();
  const profiles = useQuery(adminProfilesQuery);
  const drivers = useQuery(adminDriversQuery);
  const restaurants = useQuery(adminRestaurantsQuery);

  const decide = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) =>
      setProfileApproval(id, status),
    onSuccess: (_d, v) => {
      toast.success(v.status === "approved" ? "Account approved" : "Account rejected");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const waiting = (profiles.data ?? []).filter(
    (p) => p.approval_status === "pending" && (p.role === "vendor" || p.role === "driver"),
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Pending approvals</h1>
        <p className="text-sm text-foreground/60">
          Vendors and drivers waiting for a decision on their account.
        </p>
      </div>

      {profiles.isPending ? <p className="text-foreground/60">Loading…</p> : null}
      {!profiles.isPending && waiting.length === 0 ? (
        <Card className="p-8 text-center text-foreground/60">Nothing waiting. All caught up.</Card>
      ) : null}

      {waiting.map((p) => {
        const driver = (drivers.data ?? []).find((d) => d.id === p.id);
        const stores = (restaurants.data ?? []).filter((r) => r.owner_id === p.id);
        return (
          <Card key={p.id} className="space-y-3 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold">{p.full_name || p.email || "Unnamed"}</p>
                <p className="text-sm text-foreground/60">
                  {p.email} · {p.role} · {p.country || "no country"}
                </p>
              </div>
              <span className="rounded-full bg-sun/30 px-3 py-1 text-xs font-semibold">
                Pending review
              </span>
            </div>

            {p.role === "driver" ? (
              <div className="rounded-xl bg-muted/60 p-4 text-sm">
                <p className="font-medium">Vehicle</p>
                <p className="text-foreground/70">
                  {driver?.vehicle_type || "Not provided"}
                  {driver?.vehicle_model ? ` · ${driver.vehicle_model}` : ""}
                  {driver?.plate ? ` · ${driver.plate}` : ""}
                </p>
                <p className="mt-3 font-medium">Documents</p>
                {driver && driver.documents.length > 0 ? (
                  <ul className="mt-1 space-y-1">
                    {driver.documents.map((d) => (
                      <li key={d.id} className="flex items-center justify-between gap-3">
                        <span className="text-foreground/70">{d.doc_type.replace(/_/g, " ")}</span>
                        <span className="rounded-full bg-sun/25 px-2 py-0.5 text-xs font-semibold">
                          {d.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-foreground/60">No documents uploaded yet.</p>
                )}
              </div>
            ) : null}

            {p.role === "vendor" ? (
              <div className="rounded-xl bg-muted/60 p-4 text-sm">
                <p className="font-medium">Restaurants</p>
                {stores.length ? (
                  <ul className="mt-1 space-y-1 text-foreground/70">
                    {stores.map((r) => (
                      <li key={r.id}>
                        {r.name} — {r.city || "?"}, {r.country || "?"} ({r.status})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-foreground/60">No restaurant created yet.</p>
                )}
              </div>
            ) : null}

            <div className="flex gap-2">
              <Button
                onClick={() => decide.mutate({ id: p.id, status: "approved" })}
                disabled={decide.isPending}
              >
                Approve
              </Button>
              <Button
                variant="outline"
                onClick={() => decide.mutate({ id: p.id, status: "rejected" })}
                disabled={decide.isPending}
              >
                Reject
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
