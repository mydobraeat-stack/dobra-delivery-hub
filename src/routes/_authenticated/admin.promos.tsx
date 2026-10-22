import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { deletePromo, promosQuery, savePromo, type Promo } from "@/lib/admin-ops";

export const Route = createFileRoute("/_authenticated/admin/promos")({
  component: PromosPage,
});

const EMPTY: Promo = {
  code: "",
  discount_type: "percent",
  amount: 10,
  usage_limit: null,
  per_user_limit: 1,
  expires_at: null,
  min_order: 0,
  country: null,
  active: true,
};

function PromosPage() {
  const qc = useQueryClient();
  const { data, isPending } = useQuery(promosQuery);
  const [form, setForm] = useState<Promo>(EMPTY);
  const [busy, setBusy] = useState(false);
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "promos"] });

  const submit = async () => {
    setBusy(true);
    try {
      await savePromo({
        ...form,
        amount: Number(form.amount),
        min_order: Number(form.min_order) || 0,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
        per_user_limit: form.per_user_limit ? Number(form.per_user_limit) : null,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
        country: form.country || null,
      });
      toast.success(form.id ? "Promo updated" : "Promo created");
      setForm(EMPTY);
      refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Promo codes</h1>
        <p className="text-sm text-foreground/60">
          Customers enter codes at checkout. Discounts are checked by the system when the order is placed.
        </p>
      </div>

      <Card className="space-y-4 p-5">
        <h2 className="font-bold">{form.id ? `Edit ${form.code}` : "New promo code"}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Code" id="p-code">
            <Input id="p-code" className="uppercase" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          </Field>
          <Field label="Discount type" id="p-type">
            <select
              id="p-type"
              value={form.discount_type}
              onChange={(e) => setForm({ ...form, discount_type: e.target.value as Promo["discount_type"] })}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="percent">Percent (%)</option>
              <option value="fixed">Fixed amount</option>
            </select>
          </Field>
          <Field label={form.discount_type === "percent" ? "Percent off" : "Amount off"} id="p-amt">
            <Input id="p-amt" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value as unknown as number })} />
          </Field>
          <Field label="Minimum order" id="p-min">
            <Input id="p-min" type="number" step="0.01" value={form.min_order} onChange={(e) => setForm({ ...form, min_order: e.target.value as unknown as number })} />
          </Field>
          <Field label="Total usage limit (blank = unlimited)" id="p-lim">
            <Input id="p-lim" type="number" value={form.usage_limit ?? ""} onChange={(e) => setForm({ ...form, usage_limit: (e.target.value || null) as unknown as number })} />
          </Field>
          <Field label="Per-user limit" id="p-ulim">
            <Input id="p-ulim" type="number" value={form.per_user_limit ?? ""} onChange={(e) => setForm({ ...form, per_user_limit: (e.target.value || null) as unknown as number })} />
          </Field>
          <Field label="Expires" id="p-exp">
            <Input id="p-exp" type="date" value={form.expires_at ? form.expires_at.slice(0, 10) : ""} onChange={(e) => setForm({ ...form, expires_at: e.target.value || null })} />
          </Field>
          <Field label="Country" id="p-country">
            <select
              id="p-country"
              value={form.country ?? ""}
              onChange={(e) => setForm({ ...form, country: e.target.value || null })}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="">All countries</option>
              <option>Poland</option>
              <option>Cameroon</option>
            </select>
          </Field>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /> Active
          </label>
          <Button onClick={submit} disabled={busy || !form.code.trim() || !(Number(form.amount) > 0)}>
            {busy ? "Saving…" : form.id ? "Save changes" : "Create promo"}
          </Button>
          {form.id ? (
            <Button variant="ghost" onClick={() => setForm(EMPTY)}>
              Cancel edit
            </Button>
          ) : null}
        </div>
      </Card>

      {isPending ? <p className="text-foreground/60">Loading…</p> : null}
      <div className="space-y-2">
        {(data ?? []).map((p) => (
          <Card key={p.id} className="admin-record-header flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="font-mono font-bold">
                {p.code}{" "}
                <span className={`ml-2 rounded-full px-2 py-0.5 font-sans text-xs ${p.active ? "bg-sun text-sun-foreground" : "bg-muted text-foreground/60"}`}>
                  {p.active ? "Active" : "Disabled"}
                </span>
              </p>
              <p className="text-sm text-foreground/70">
                {p.discount_type === "percent" ? `${p.amount}% off` : `${p.amount} off`} · min {p.min_order} ·{" "}
                {p.country ?? "all countries"} · used {p.uses ?? 0}
                {p.usage_limit ? `/${p.usage_limit}` : ""} · {p.per_user_limit ?? "∞"} per user
                {p.expires_at ? ` · expires ${p.expires_at.slice(0, 10)}` : ""}
              </p>
            </div>
            <div className="admin-actions flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setForm({ ...p })}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  await savePromo({ ...p, active: !p.active });
                  refresh();
                }}
              >
                {p.active ? "Disable" : "Enable"}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={async () => {
                  if (!window.confirm(`Delete ${p.code}?`)) return;
                  await deletePromo(p.id!);
                  toast.success("Promo deleted");
                  refresh();
                }}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
