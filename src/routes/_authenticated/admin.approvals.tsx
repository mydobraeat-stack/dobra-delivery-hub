import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  adminDriversQuery,
  adminProfilesQuery,
  adminRestaurantsQuery,
  setDriverDocsStatus,
  setProfileApproval,
  setRestaurantStatus,
} from "@/lib/admin";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/admin/approvals")({
  component: PendingApprovals,
});

function PendingApprovals() {
  const t = useT();
  const queryClient = useQueryClient();
  const profiles = useQuery(adminProfilesQuery);
  const drivers = useQuery(adminDriversQuery);
  const restaurants = useQuery(adminRestaurantsQuery);

  const decide = useMutation({
    mutationFn: async ({
      id,
      status,
      role,
      existingCustomer,
    }: {
      id: string;
      status: "approved" | "rejected";
      role: string;
      existingCustomer?: boolean | undefined;
    }) => {
      if (!existingCustomer) await setProfileApproval(id, status);
      // Drivers are also gated on their document review state — keep both in step.
      if (role === "driver") await setDriverDocsStatus(id, status);
      // Vendors: customers only see restaurants whose own status is approved,
      // so approving the account must approve its pending stores too.
      if (role === "vendor" && status === "approved") {
        const stores = (restaurants.data ?? []).filter(
          (r) => r.owner_id === id && r.status === "pending",
        );
        for (const store of stores) await setRestaurantStatus(store.id, "approved");
      }
    },
    onSuccess: (_d, v) => {
      toast.success(
        v.status === "approved" ? t("admin.approvals.accountApproved") : t("admin.approvals.accountRejected"),
      );
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const waiting = (profiles.data ?? []).filter(
    (p) => (p.approval_status === "pending" && (p.role === "vendor" || p.role === "driver")) || (drivers.data ?? []).some(d => d.id === p.id && d.existing_customer && ["draft", "in_review"].includes(d.docs_status)),
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{t("admin.approvals.title")}</h1>
        <p className="text-sm text-foreground/60">{t("admin.approvals.subtitle")}</p>
      </div>

      {profiles.isPending ? <p className="text-foreground/60">{t("admin.loading")}</p> : null}
      {!profiles.isPending && waiting.length === 0 ? (
        <Card className="p-8 text-center text-foreground/60">{t("admin.approvals.empty")}</Card>
      ) : null}

      {waiting.map((p) => {
        const driver = (drivers.data ?? []).find((d) => d.id === p.id);
        const stores = (restaurants.data ?? []).filter((r) => r.owner_id === p.id);
        return (
          <Card key={p.id} className="space-y-3 p-5">
            <div className="admin-record-header flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold">{p.full_name || p.email || t("admin.approvals.unnamed")}</p>
                {driver?.existing_customer ? <span className="text-xs font-semibold text-brand">{t("driver.application.existing")} · {t(`driver.application.${driver.docs_status}`)}</span> : null}
                <p className="text-sm text-foreground/60">
                  {p.email} · {p.role} · {p.country || t("admin.approvals.noCountry")}
                </p>
              </div>
              <span className="rounded-full bg-sun/30 px-3 py-1 text-xs font-semibold">
                {t("admin.approvals.pendingReview")}
              </span>
            </div>

            {p.role === "driver" ? (
              <div className="rounded-xl bg-muted/60 p-4 text-sm">
                <p className="font-medium">{t("admin.approvals.vehicle")}</p>
                <p className="text-foreground/70">
                  {driver?.vehicle_type || t("admin.approvals.notProvided")}
                  {driver?.vehicle_model ? ` · ${driver.vehicle_model}` : ""}
                  {driver?.plate ? ` · ${driver.plate}` : ""}
                </p>
                <p className="mt-3 font-medium">{t("admin.approvals.documents")}</p>
                {driver && driver.documents.length > 0 ? (
                  <ul className="mt-1 space-y-1">
                    {driver.documents.map((d) => (
                      <li key={d.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                        <span className="text-foreground/70">{d.doc_type.replace(/_/g, " ")}</span>
                        <span className="rounded-full bg-sun/25 px-2 py-0.5 text-xs font-semibold">
                          {d.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-foreground/60">{t("admin.approvals.noDocuments")}</p>
                )}
              </div>
            ) : null}

            {p.role === "vendor" ? (
              <div className="rounded-xl bg-muted/60 p-4 text-sm">
                <p className="font-medium">{t("admin.approvals.restaurants")}</p>
                {stores.length ? (
                  <ul className="mt-1 space-y-1 text-foreground/70">
                    {stores.map((r) => (
                      <li key={r.id}>
                        {r.name} — {r.city || "?"}, {r.country || "?"} ({r.status})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-foreground/60">{t("admin.approvals.noRestaurant")}</p>
                )}
              </div>
            ) : null}

            <div className="admin-actions flex flex-wrap gap-2">
              <Button
                onClick={() => decide.mutate({ id: p.id, status: "approved", role: p.role, existingCustomer: driver?.existing_customer })}
                disabled={decide.isPending || (driver?.existing_customer && driver.docs_status !== "in_review")}
              >
                {t("admin.approvals.approve")}
              </Button>
              <Button
                variant="outline"
                onClick={() => decide.mutate({ id: p.id, status: "rejected", role: p.role, existingCustomer: driver?.existing_customer })}
                disabled={decide.isPending}
              >
                {t("admin.approvals.reject")}
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
