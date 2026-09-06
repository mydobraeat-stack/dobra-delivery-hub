import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adminRestaurantsQuery, setRestaurantStatus } from "@/lib/admin";
import { StoredImage } from "@/components/dobra/StoredImage";

export const Route = createFileRoute("/_authenticated/admin/restaurants")({
  component: AdminRestaurants,
});

const TONE: Record<string, string> = {
  approved: "bg-accent/15 text-accent",
  pending: "bg-primary/30 text-foreground",
  suspended: "bg-destructive/10 text-destructive",
};

function AdminRestaurants() {
  const queryClient = useQueryClient();
  const { data, isPending } = useQuery(adminRestaurantsQuery);

  const change = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "pending" | "suspended" }) =>
      setRestaurantStatus(id, status),
    onSuccess: () => {
      toast.success("Restaurant updated");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Restaurants</h1>
        <p className="text-sm text-foreground/60">Approve new stores or suspend existing ones.</p>
      </div>

      {isPending ? <p className="text-foreground/60">Loading…</p> : null}

      {(data ?? []).map((r) => (
        <Card key={r.id} className="flex flex-wrap items-center gap-4 p-4">
          <StoredImage
            value={r.logo_url}
            alt={r.name}
            className="size-14 rounded-xl object-cover"
          />
          <div className="min-w-40 flex-1">
            <p className="font-semibold">{r.name}</p>
            <p className="text-sm text-foreground/60">
              {r.cuisine || "—"} · {r.city || "?"}, {r.country || "?"}
            </p>
            <p className="text-xs text-foreground/50">
              Owner: {r.owner?.full_name || r.owner?.email || "unknown"}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${TONE[r.status] ?? "bg-muted"}`}
          >
            {r.status}
          </span>
          <div className="flex gap-2">
            {r.status !== "approved" ? (
              <Button
                size="sm"
                onClick={() => change.mutate({ id: r.id, status: "approved" })}
                disabled={change.isPending}
              >
                Approve
              </Button>
            ) : null}
            {r.status !== "suspended" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => change.mutate({ id: r.id, status: "suspended" })}
                disabled={change.isPending}
              >
                Suspend
              </Button>
            ) : null}
          </div>
        </Card>
      ))}
    </div>
  );
}
