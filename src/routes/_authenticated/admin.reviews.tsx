import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { StoredImage } from "@/components/dobra/StoredImage";
import {
  adminDriversQuery,
  setDocumentStatus,
  setDriverDocsStatus,
  setProfileApproval,
} from "@/lib/admin";
import { DOCS_STATUS_LABEL_KEY, requiredDocsFor } from "@/lib/driver-docs";
import { resolveImageUrl } from "@/lib/storage";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/admin/reviews")({
  component: AdminDriverReviews,
});

type DocStatus = "pending" | "approved" | "rejected";

function AdminDriverReviews() {
  const t = useT();
  const queryClient = useQueryClient();
  const { data, isPending } = useQuery(adminDriversQuery);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin"] });

  const decideDoc = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: DocStatus; note: string }) =>
      setDocumentStatus(id, status, note.trim() || undefined),
    onSuccess: () => {
      toast.success(t("admin.reviews.saved"));
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const decideDriver = useMutation({
    mutationFn: async ({ id, approve }: { id: string; approve: boolean }) => {
      await setDriverDocsStatus(id, approve ? "approved" : "rejected");
      await setProfileApproval(id, approve ? "approved" : "rejected");
    },
    onSuccess: (_d, v) => {
      toast.success(
        v.approve ? t("admin.reviews.driverApproved") : t("admin.reviews.driverRejected"),
      );
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function openDoc(path: string) {
    try {
      window.open(await resolveImageUrl(path), "_blank", "noopener");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const drivers = data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{t("admin.reviews.title")}</h1>
        <p className="text-sm text-foreground/60">{t("admin.reviews.subtitle")}</p>
      </div>

      {isPending ? <p className="text-foreground/60">{t("admin.loading")}</p> : null}
      {!isPending && drivers.length === 0 ? (
        <Card className="p-8 text-center text-foreground/60">{t("admin.reviews.empty")}</Card>
      ) : null}

      {drivers.map((d) => {
        const types = requiredDocsFor(d.vehicle_type);
        const approvedCount = d.documents.filter(
          (doc) => doc.status === "approved" && types.some((ty) => ty.id === doc.doc_type),
        ).length;
        return (
          <Card key={d.id} className="space-y-4 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-lg font-semibold break-words">
                  {d.profile?.full_name || d.profile?.email || t("admin.reviews.unnamedDriver")}
                </p>
                <p className="text-sm break-words text-foreground/60">{d.profile?.email}</p>
                <p className="text-sm text-foreground/60">
                  {d.vehicle_type || t("admin.reviews.noVehicle")}
                  {d.vehicle_model ? ` · ${d.vehicle_model}` : ""}
                  {d.plate ? ` · ${d.plate}` : ""}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 text-xs">
                <Badge variant="secondary">
                  {DOCS_STATUS_LABEL_KEY[d.docs_status]
                    ? t(DOCS_STATUS_LABEL_KEY[d.docs_status]!)
                    : d.docs_status}
                </Badge>
                <span className="text-foreground/60">
                  {t("admin.reviews.progress", {
                    done: String(approvedCount),
                    total: String(DOC_TYPES.length),
                  })}
                </span>
              </div>
            </div>

            <ul className="space-y-3">
              {DOC_TYPES.map((type) => {
                const doc = d.documents.find((x) => x.doc_type === type.id);
                const noteValue = doc
                  ? (notes[doc.id] ?? doc.review_note ?? "")
                  : "";
                return (
                  <li key={type.id} className="rounded-xl bg-muted/60 p-3">
                    <div className="flex flex-wrap items-start gap-3">
                      {doc ? (
                        <StoredImage
                          value={doc.file_path}
                          alt={t(type.labelKey)}
                          className="size-16 shrink-0 rounded-lg object-cover"
                          width={128}
                          height={128}
                        />
                      ) : (
                        <div className="size-16 shrink-0 rounded-lg bg-background" aria-hidden />
                      )}
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium break-words">{t(type.labelKey)}</p>
                          {doc ? (
                            <Badge
                              variant={
                                doc.status === "approved"
                                  ? "default"
                                  : doc.status === "rejected"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {t(`admin.reviews.status.${doc.status}`)}
                            </Badge>
                          ) : (
                            <Badge variant="outline">{t("admin.reviews.notUploaded")}</Badge>
                          )}
                        </div>

                        {doc ? (
                          <>
                            <Input
                              value={noteValue}
                              placeholder={t("admin.reviews.notePlaceholder")}
                              aria-label={t("admin.reviews.note")}
                              onChange={(e) =>
                                setNotes((n) => ({ ...n, [doc.id]: e.target.value }))
                              }
                            />
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openDoc(doc.file_path)}
                              >
                                {t("admin.reviews.view")}
                              </Button>
                              <Button
                                size="sm"
                                disabled={decideDoc.isPending}
                                onClick={() =>
                                  decideDoc.mutate({
                                    id: doc.id,
                                    status: "approved",
                                    note: noteValue,
                                  })
                                }
                              >
                                {t("admin.reviews.approve")}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={decideDoc.isPending}
                                onClick={() =>
                                  decideDoc.mutate({
                                    id: doc.id,
                                    status: "rejected",
                                    note: noteValue,
                                  })
                                }
                              >
                                {t("admin.reviews.reject")}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={decideDoc.isPending}
                                onClick={() =>
                                  decideDoc.mutate({
                                    id: doc.id,
                                    status: "pending",
                                    note: noteValue,
                                  })
                                }
                              >
                                {t("admin.reviews.setPending")}
                              </Button>
                            </div>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="flex flex-wrap gap-2">
              <Button
                disabled={decideDriver.isPending}
                onClick={() => decideDriver.mutate({ id: d.id, approve: true })}
              >
                {t("admin.reviews.approveDriver")}
              </Button>
              <Button
                variant="outline"
                disabled={decideDriver.isPending}
                onClick={() => decideDriver.mutate({ id: d.id, approve: false })}
              >
                {t("admin.reviews.rejectDriver")}
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
