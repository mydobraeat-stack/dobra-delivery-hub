import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActionDialog } from "@/components/admin/ActionDialog";
import { disputesQuery, resolveDispute, flagOrder } from "@/lib/admin-ops";
import { orderRef } from "@/lib/dobra";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/admin/disputes")({
  component: Disputes,
});

const KIND_LABEL: Record<string, string> = {
  late: "Running late",
  complaint: "Customer complaint",
  cancelled_after_assign: "Cancelled after driver assigned",
  flagged: "Flagged by admin",
};

function Disputes() {
  const { formatDate } = useI18n();
  const qc = useQueryClient();
  const { data, isPending } = useQuery(disputesQuery);
  const [tab, setTab] = useState<"open" | "resolved">("open");
  const rows = (data ?? []).filter((d) => d.status === tab);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Disputes & problem orders</h1>
        <p className="text-sm text-foreground/60">
          Late orders appear automatically. Complaints, driver-side cancellations and admin flags stay here until resolved.
        </p>
      </div>
      <div className="flex gap-1">
        {(["open", "resolved"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === k ? "bg-sun text-sun-foreground" : "bg-muted text-foreground/70"}`}
          >
            {k === "open" ? `Open (${(data ?? []).filter((d) => d.status === "open").length})` : "Resolved"}
          </button>
        ))}
      </div>
      {isPending ? <p className="text-foreground/60">Loading…</p> : null}
      {!isPending && rows.length === 0 ? (
        <Card className="p-8 text-center text-foreground/60">Nothing here. All clear.</Card>
      ) : null}
      <div className="space-y-3">
        {rows.map((d) => (
          <Card key={d.id} className="flex flex-wrap items-start justify-between gap-3 p-4">
            <div className="min-w-0 space-y-1">
              <p className="font-semibold">
                {KIND_LABEL[d.kind] ?? d.kind} · {orderRef(d.order_id)}
              </p>
              {d.description ? <p className="break-words text-sm text-foreground/70">{d.description}</p> : null}
              <p className="text-xs text-foreground/50">{formatDate(d.created_at)}</p>
              {d.resolution_note ? (
                <p className="text-xs text-foreground/60">Resolution: {d.resolution_note}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to="/admin/orders">Open orders</Link>
              </Button>
              {d.status === "open" && d.synthetic ? (
                <ActionDialog
                  trigger={<Button size="sm">Track as dispute</Button>}
                  title="Track this late order"
                  reasonLabel="Note"
                  reasonRequired
                  confirmLabel="Save"
                  successMessage="Added"
                  onConfirm={async (r) => {
                    await flagOrder(d.order_id, `Late: ${r}`);
                    qc.invalidateQueries({ queryKey: ["admin"] });
                  }}
                />
              ) : null}
              {d.status === "open" && !d.synthetic ? (
                <ActionDialog
                  trigger={<Button size="sm">Mark resolved</Button>}
                  title="Resolve dispute"
                  reasonLabel="Resolution note"
                  reasonRequired
                  confirmLabel="Resolve"
                  successMessage="Dispute resolved"
                  onConfirm={async (r) => {
                    await resolveDispute(d.id, r);
                    qc.invalidateQueries({ queryKey: ["admin"] });
                  }}
                />
              ) : null}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
