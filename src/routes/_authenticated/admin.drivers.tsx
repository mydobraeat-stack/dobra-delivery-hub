import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  adminDriversQuery,
  setDocumentStatus,
  setDriverDocsStatus,
  setProfileApproval,
} from "@/lib/admin";
import { driverStatsQuery } from "@/lib/admin-ops";
import { resolveImageUrl } from "@/lib/storage";
import { DOCS_STATUS_LABEL_KEY } from "@/lib/driver-docs";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/admin/drivers")({
  component: AdminDrivers,
});

function AdminDrivers() {
  const t = useT();
  const queryClient = useQueryClient();
  const { data, isPending } = useQuery(adminDriversQuery);
  const [open, setOpen] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin"] });

  const decideDriver = useMutation({
    mutationFn: async ({ id, approve }: { id: string; approve: boolean }) => {
      await setDriverDocsStatus(id, approve ? "approved" : "rejected");
      await setProfileApproval(id, approve ? "approved" : "rejected");
    },
    onSuccess: (_d, v) => {
      toast.success(v.approve ? t("admin.drivers.driverApproved") : t("admin.drivers.driverRejected"));
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const decideDoc = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) =>
      setDocumentStatus(id, status),
    onSuccess: () => {
      toast.success(t("admin.drivers.documentReviewed"));
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function openDoc(path: string) {
    try {
      const url = await resolveImageUrl(path);
      window.open(url, "_blank", "noopener");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{t("admin.drivers.title")}</h1>
        <p className="text-sm text-foreground/60">{t("admin.drivers.subtitle")}</p>
      </div>

      {isPending ? <p className="text-foreground/60">{t("admin.loading")}</p> : null}
      {!isPending && (data ?? []).length === 0 ? (
        <Card className="p-8 text-center text-foreground/60">{t("admin.drivers.empty")}</Card>
      ) : null}

      {(data ?? []).map((d) => (
        <Card key={d.id} className="space-y-3 p-5">
          <div className="admin-record-header flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold">
                {d.profile?.full_name || d.profile?.email || t("admin.drivers.unnamedDriver")}
              </p>
              <p className="text-sm text-foreground/60">
                {d.profile?.email} · {d.country || d.profile?.country || t("admin.drivers.noCountry")}
              </p>
              <p className="text-sm text-foreground/60">
                {d.vehicle_type || t("admin.drivers.noVehicle")}
                {d.vehicle_model ? ` · ${d.vehicle_model}` : ""}
                {d.plate ? ` · ${d.plate}` : ""}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 text-xs">
              <span className="rounded-full bg-sun/30 px-3 py-1 font-semibold">
                {t("admin.drivers.docs")}: {DOCS_STATUS_LABEL_KEY[d.docs_status] ? t(DOCS_STATUS_LABEL_KEY[d.docs_status]!) : d.docs_status}
              </span>
              <span className="text-foreground/60">
                {t("admin.drivers.account")}: {d.profile?.approval_status ?? t("admin.drivers.unknown")}
              </span>
            </div>
          </div>

          <DriverStatsRow driverId={d.id} docs={d.documents} />


          <Button variant="ghost" size="sm" onClick={() => setOpen(open === d.id ? null : d.id)}>
            {open === d.id ? t("admin.drivers.hideDocuments") : t("admin.drivers.documentsCount", { n: d.documents.length })}
          </Button>

          {open === d.id ? (
            <ul className="space-y-2">
              {d.documents.length === 0 ? (
                <li className="text-sm text-foreground/60">{t("admin.drivers.noDocumentsUploaded")}</li>
              ) : null}
              {d.documents.map((doc) => (
                <li
                  key={doc.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/60 p-3 text-sm"
                >
                  <div>
                    <p className="font-medium capitalize">{doc.doc_type.replace(/_/g, " ")}</p>
                    <p className="text-xs text-foreground/60">
                      {doc.status}
                      {doc.expires_on ? ` · ${t("admin.drivers.expires", { date: doc.expires_on })}` : ""}
                      {doc.expires_on && new Date(doc.expires_on).getTime() - Date.now() < 30 * 86400000 ? (
                        <span className="ml-2 rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-semibold text-destructive">
                          {new Date(doc.expires_on).getTime() < Date.now() ? "Expired" : "Expires within 30 days"}
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <div className="admin-actions flex flex-wrap gap-2">
                    <Button size="sm" variant="ghost" onClick={() => openDoc(doc.file_path)}>
                      {t("admin.drivers.view")}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => decideDoc.mutate({ id: doc.id, status: "approved" })}
                    >
                      {t("admin.drivers.approve")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => decideDoc.mutate({ id: doc.id, status: "rejected" })}
                    >
                      {t("admin.drivers.reject")}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="admin-actions flex flex-wrap gap-2">
            <Button
              onClick={() => decideDriver.mutate({ id: d.id, approve: true })}
              disabled={decideDriver.isPending}
            >
              {t("admin.drivers.approveDriver")}
            </Button>
            <Button
              variant="outline"
              onClick={() => decideDriver.mutate({ id: d.id, approve: false })}
              disabled={decideDriver.isPending}
            >
              {t("admin.drivers.rejectDriver")}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function DriverStatsRow({ driverId, docs }: { driverId: string; docs: { expires_on: string | null }[] }) {
  const { data } = useQuery(driverStatsQuery(driverId));
  const soon = docs.filter(
    (d) => d.expires_on && new Date(d.expires_on).getTime() - Date.now() < 30 * 86400000,
  ).length;
  const completion = data && data.assigned ? Math.round((data.delivered / data.assigned) * 100) : null;
  const items = [
    { label: "Deliveries", value: data ? String(data.delivered) : "…" },
    { label: "Completion rate", value: completion == null ? "—" : `${completion}%` },
    { label: "Cancelled", value: data ? String(data.cancelled) : "…" },
    {
      label: "Rating",
      value: data?.rating != null ? `${data.rating.toFixed(1)} ★ (${data.ratings})` : "No ratings",
    },
  ];
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {items.map((i) => (
          <div key={i.label} className="rounded-lg bg-muted p-2">
            <p className="text-[11px] text-foreground/60">{i.label}</p>
            <p className="font-semibold">{i.value}</p>
          </div>
        ))}
      </div>
      {soon > 0 ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive">
          {soon} document{soon > 1 ? "s" : ""} expired or expiring within 30 days
        </p>
      ) : null}
    </div>
  );
}
