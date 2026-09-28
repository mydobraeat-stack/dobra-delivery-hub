import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { auditQuery } from "@/lib/admin-ops";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  component: Audit,
});

function Audit() {
  const { formatDate } = useI18n();
  const { data, isPending } = useQuery(auditQuery);
  const [term, setTerm] = useState("");
  const rows = (data ?? []).filter((r) => {
    const q = term.toLowerCase();
    return !q || `${r.action} ${r.actor} ${r.target_type} ${JSON.stringify(r.details)}`.toLowerCase().includes(q);
  });
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Audit log</h1>
        <p className="text-sm text-foreground/60">Every admin action, newest first (last 500).</p>
      </div>
      <Input className="max-w-xs" placeholder="Filter by action, admin, details" value={term} onChange={(e) => setTerm(e.target.value)} />
      {isPending ? <p className="text-foreground/60">Loading…</p> : null}
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted/50 text-left text-foreground/60">
            <tr>
              <th className="p-3">When</th>
              <th>Admin</th>
              <th>Action</th>
              <th>Target</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const d = r.details as Record<string, unknown>;
              const summary = ["reason", "amount", "status", "name", "note", "title", "role", "recipients"]
                .filter((k) => d?.[k] != null)
                .map((k) => `${k}: ${String(d[k])}`)
                .join(" · ");
              return (
                <tr key={r.id} className="border-t border-ink/10 align-top">
                  <td className="whitespace-nowrap p-3">{formatDate(r.created_at)}</td>
                  <td>{r.actor}</td>
                  <td className="font-medium">{r.action.replace(/_/g, " ")}</td>
                  <td className="text-xs">
                    {r.target_type} {r.target_id ? String(r.target_id).slice(0, 8) : ""}
                  </td>
                  <td className="max-w-md break-words py-3 pr-3 text-xs text-foreground/70">{summary || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!isPending && rows.length === 0 ? <p className="p-6 text-center text-foreground/60">No entries yet.</p> : null}
      </Card>
    </div>
  );
}
