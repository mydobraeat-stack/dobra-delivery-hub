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
import { resolveImageUrl } from "@/lib/storage";
import { DOCS_STATUS_LABEL } from "@/lib/driver-docs";

export const Route = createFileRoute("/_authenticated/admin/drivers")({
  component: AdminDrivers,
});

function AdminDrivers() {
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
      toast.success(v.approve ? "Driver approved" : "Driver rejected");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const decideDoc = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) =>
      setDocumentStatus(id, status),
    onSuccess: () => {
      toast.success("Document reviewed");
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
        <h1 className="text-2xl font-bold">Drivers</h1>
        <p className="text-sm text-foreground/60">
          Review uploaded documents and vehicle details, then approve or reject.
        </p>
      </div>

      {isPending ? <p className="text-foreground/60">Loading…</p> : null}
      {!isPending && (data ?? []).length === 0 ? (
        <Card className="p-8 text-center text-foreground/60">No drivers yet.</Card>
      ) : null}

      {(data ?? []).map((d) => (
        <Card key={d.id} className="space-y-3 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold">
                {d.profile?.full_name || d.profile?.email || "Unnamed driver"}
              </p>
              <p className="text-sm text-foreground/60">
                {d.profile?.email} · {d.country || d.profile?.country || "no country"}
              </p>
              <p className="text-sm text-foreground/60">
                {d.vehicle_type || "No vehicle"}
                {d.vehicle_model ? ` · ${d.vehicle_model}` : ""}
                {d.plate ? ` · ${d.plate}` : ""}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 text-xs">
              <span className="rounded-full bg-sun/30 px-3 py-1 font-semibold">
                Docs: {DOCS_STATUS_LABEL[d.docs_status] ?? d.docs_status}
              </span>
              <span className="text-foreground/60">
                Account: {d.profile?.approval_status ?? "unknown"}
              </span>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={() => setOpen(open === d.id ? null : d.id)}>
            {open === d.id ? "Hide documents" : `Documents (${d.documents.length})`}
          </Button>

          {open === d.id ? (
            <ul className="space-y-2">
              {d.documents.length === 0 ? (
                <li className="text-sm text-foreground/60">No documents uploaded.</li>
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
                      {doc.expires_on ? ` · expires ${doc.expires_on}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => openDoc(doc.file_path)}>
                      View
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => decideDoc.mutate({ id: doc.id, status: "approved" })}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => decideDoc.mutate({ id: doc.id, status: "rejected" })}
                    >
                      Reject
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="flex gap-2">
            <Button
              onClick={() => decideDriver.mutate({ id: d.id, approve: true })}
              disabled={decideDriver.isPending}
            >
              Approve driver
            </Button>
            <Button
              variant="outline"
              onClick={() => decideDriver.mutate({ id: d.id, approve: false })}
              disabled={decideDriver.isPending}
            >
              Reject driver
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
