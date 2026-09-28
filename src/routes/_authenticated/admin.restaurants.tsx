import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  adminRestaurantsQuery,
  setRestaurantStatus,
  type RestaurantStatus,
} from "@/lib/admin";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { StoredImage } from "@/components/dobra/StoredImage";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/admin/restaurants")({
  component: AdminRestaurants,
});

const TONE: Record<string, string> = {
  approved: "bg-accent/15 text-accent",
  pending: "bg-sun/30 text-foreground",
  suspended: "bg-destructive/10 text-destructive",
  removed: "bg-foreground/10 text-foreground/60",
};

function AdminRestaurants() {
  const t = useT();
  const queryClient = useQueryClient();
  const { data, isPending } = useQuery(adminRestaurantsQuery);

  const change = useMutation({
    mutationFn: ({ id, status }: { id: string; status: RestaurantStatus }) =>
      setRestaurantStatus(id, status),
    onSuccess: (_d, v) => {
      toast.success(
        v.status === "removed"
          ? t("admin.restaurants.removed")
          : t("admin.restaurants.updated"),
      );
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{t("admin.restaurants.title")}</h1>
        <p className="text-sm text-foreground/60">{t("admin.restaurants.subtitle")}</p>
      </div>

      {isPending ? <p className="text-foreground/60">{t("admin.loading")}</p> : null}

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
              {t("admin.restaurants.owner")}: {r.owner?.full_name || r.owner?.email || t("admin.restaurants.unknownOwner")}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${TONE[r.status] ?? "bg-muted"}`}
          >
            {r.status}
          </span>
          <RestaurantExtras id={r.id} />
          <div className="flex flex-wrap gap-2">
            {r.status !== "approved" ? (
              <Button
                size="sm"
                onClick={() => change.mutate({ id: r.id, status: "approved" })}
                disabled={change.isPending}
              >
                {r.status === "removed"
                  ? t("admin.restaurants.restore")
                  : t("admin.restaurants.approve")}
              </Button>
            ) : null}
            {r.status !== "suspended" && r.status !== "removed" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => change.mutate({ id: r.id, status: "suspended" })}
                disabled={change.isPending}
              >
                {t("admin.restaurants.suspend")}
              </Button>
            ) : null}
            {r.status !== "removed" ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive" disabled={change.isPending}>
                    {t("admin.restaurants.delete")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("admin.restaurants.deleteTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("admin.restaurants.deleteBody")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("admin.restaurants.cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => change.mutate({ id: r.id, status: "removed" })}
                    >
                      {t("admin.restaurants.confirmDelete")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}
          </div>
        </Card>
      ))}
    </div>
  );
}

function RestaurantExtras({ id }: { id: string }) {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "restaurant-extras", id],
    queryFn: async () => {
      const { data } = await supabase.from("restaurants").select("featured,commission_rate").eq("id", id).single();
      return data;
    },
  });
  const save = async (patch: { featured?: boolean; commission_rate?: number | null }) => {
    const { error } = await supabase.from("restaurants").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Restaurant updated");
    qc.invalidateQueries({ queryKey: ["admin", "restaurant-extras", id] });
    qc.invalidateQueries({ queryKey: ["restaurants"] });
  };
  if (!data) return null;
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <label className="flex items-center gap-1.5">
        <input type="checkbox" checked={data.featured} onChange={(e) => save({ featured: e.target.checked })} />
        Featured
      </label>
      <label className="flex items-center gap-1.5">
        Commission %
        <input
          aria-label="Commission percent"
          type="number"
          step="0.1"
          placeholder="default"
          defaultValue={data.commission_rate ?? ""}
          onBlur={(e) => {
            const v = e.target.value === "" ? null : Number(e.target.value);
            if (v !== data.commission_rate) save({ commission_rate: v });
          }}
          className="h-8 w-20 rounded-md border border-input bg-background px-2"
        />
      </label>
    </div>
  );
}
