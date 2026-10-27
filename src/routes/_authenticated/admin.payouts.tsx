import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Banknote, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cashPayoutSummaryQuery, cashPayoutHistoryQuery, recordCashPayout, validateCashPayout, type DriverCashDue } from "@/lib/cash-payouts";
import { useI18n } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/admin/payouts")({
  loader: ({ context }) => context.queryClient.ensureQueryData(cashPayoutSummaryQuery),
  head: () => ({ meta: [
    { title: "Cash driver payouts — Dobra Admin" },
    { name: "description", content: "Driver cash payments, unpaid earnings and available Dobra cash." },
    { property: "og:title", content: "Cash driver payouts — Dobra Admin" },
    { property: "og:description", content: "Driver cash payments, unpaid earnings and available Dobra cash." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex,nofollow" },
  ] }),
  errorComponent: ({ error }) => <div role="alert" className="p-5 text-destructive">{error instanceof Error ? error.message : "Cash payouts could not be loaded."}</div>,
  component: CashPayouts,
});

function CashPayouts() {
  const { formatMoney, formatDate } = useI18n();
  const { data } = useSuspenseQuery(cashPayoutSummaryQuery);
  const history = useQuery(cashPayoutHistoryQuery);
  const client = useQueryClient();
  const [selected, setSelected] = useState<DriverCashDue | null>(null);
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [request, setRequest] = useState("");
  const balance = data.balances.find(b => b.currency === selected?.currency);
  const current = data.drivers.find(d => d.driver_id === selected?.driver_id && d.currency === selected?.currency);
  const validation = validateCashPayout(Number(amount), Number(current?.owed ?? 0), Number(balance?.cashAvailable ?? 0), reference);
  const payment = useMutation({
    mutationFn: async () => {
      if (!selected || validation) throw new Error(validation ?? "Select a driver.");
      return recordCashPayout({ driver: selected.driver_id, currency: selected.currency, amount: Number(amount), reference, request });
    },
    onSuccess: async () => {
      setSelected(null);
      await client.invalidateQueries({ queryKey: ["admin"] });
      toast.success("Cash payment recorded. Balances updated.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const open = (driver: DriverCashDue) => {
    payment.reset(); setSelected(driver); setReference(""); setRequest(crypto.randomUUID());
    setAmount(String(Math.max(0, Math.min(driver.owed, Number(data.balances.find(b => b.currency === driver.currency)?.cashAvailable ?? 0)))));
  };

  return <div className="space-y-6">
    <header><h1 className="text-2xl font-bold">Cash payouts</h1><p className="text-sm text-muted-foreground">Driver earnings and cash payment history</p></header>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {data.balances.map(b => <Card key={b.currency} className="space-y-3 p-5">
        <div className="flex items-center justify-between"><p className="font-semibold">{b.currency} cash available</p><Banknote className="size-5 text-primary" /></div>
        <p className="text-3xl font-bold tabular-nums">{formatMoney(Number(b.cashAvailable), b.currency)}</p>
        <dl className="space-y-1 text-sm"><div className="flex justify-between gap-3"><dt>Cash received (after driver earnings)</dt><dd>{formatMoney(Number(b.cashSettled), b.currency)}</dd></div><div className="flex justify-between gap-3"><dt>Paid to drivers</dt><dd>{formatMoney(Number(b.cashPaidOut), b.currency)}</dd></div><div className="flex justify-between gap-3"><dt>Cash still with drivers</dt><dd>{formatMoney(Number(b.cashOutstanding), b.currency)}</dd></div></dl>
      </Card>)}
      {data.balances.length === 0 && <p className="text-muted-foreground">No completed deliveries yet.</p>}
    </section>
    <section className="space-y-3"><h2 className="text-lg font-bold">Driver payments</h2>
      {data.drivers.length === 0 && <p className="text-muted-foreground">No driver earnings yet.</p>}
      <div className="grid gap-3 xl:grid-cols-2">{data.drivers.map(d => <Card key={`${d.driver_id}-${d.currency}`} className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h3 className="break-words font-semibold">{d.name}</h3><p className="text-sm text-muted-foreground">{d.currency}</p></div><p className="text-xl font-bold">{formatMoney(Number(d.owed), d.currency)} <span className="text-xs font-normal text-muted-foreground">owed</span></p></div>
        <dl className="grid grid-cols-3 gap-3 text-sm">{[["Earned",d.earned],["Kept from cash",d.retained],["Cash paid",d.paid]].map(([label,value]) => <div key={String(label)}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="font-semibold">{formatMoney(Number(value), d.currency)}</dd></div>)}</dl>
        <Button onClick={() => open(d)} disabled={Number(d.owed) <= 0 || Number(data.balances.find(b => b.currency === d.currency)?.cashAvailable ?? 0) <= 0}><Banknote className="size-4" /> Record cash payment</Button>
        {Number(d.owed) > 0 && Number(data.balances.find(b => b.currency === d.currency)?.cashAvailable ?? 0) <= 0 && <p className="text-xs text-muted-foreground">Awaiting cash handover from drivers.</p>}
      </Card>)}</div>
    </section>
    <section className="space-y-3"><h2 className="text-lg font-bold">Payment history</h2>
      {history.isPending ? <p>Loading payments…</p> : history.error ? <div role="alert"><p className="text-destructive">{history.error.message}</p><Button variant="outline" onClick={() => history.refetch()}>Retry</Button></div> : history.data?.length === 0 ? <p className="text-muted-foreground">No cash payments recorded.</p> : history.data?.map(p => <Card key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div className="min-w-0"><p className="font-semibold">{data.drivers.find(d => d.driver_id === p.driver_id)?.name ?? p.driver_id.slice(0,8)}</p><p className="break-words text-sm text-muted-foreground">{p.reference} · {formatDate(p.paid_at)}</p></div><p className="flex items-center gap-2 font-bold"><CheckCircle2 className="size-4 text-primary" />{formatMoney(Number(p.amount),p.currency)}</p></Card>)}
    </section>
    <Dialog open={Boolean(selected)} onOpenChange={value => { if (!value && !payment.isPending) setSelected(null); }}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md"><DialogHeader><DialogTitle>Confirm cash handover</DialogTitle><DialogDescription>Record only cash already handed to this driver. This does not send a bank transfer.</DialogDescription></DialogHeader>
      <form className="space-y-4" onSubmit={e => { e.preventDefault(); payment.mutate(); }}>
        <p className="font-semibold">{selected?.name} · {selected?.currency}</p>
        <div className="space-y-2"><Label htmlFor="payout-amount">Amount</Label><Input id="payout-amount" type="number" min="0.01" step="0.01" value={amount} onChange={e => { setAmount(e.target.value); setRequest(crypto.randomUUID()); }} required disabled={payment.isPending} /></div>
        <div className="space-y-2"><Label htmlFor="payout-reference">Handover receipt / reference</Label><Input id="payout-reference" maxLength={200} value={reference} onChange={e => { setReference(e.target.value); setRequest(crypto.randomUUID()); }} required disabled={payment.isPending} /></div>
        {validation && <p className="text-sm text-muted-foreground">{validation}</p>}
        {payment.error && <p role="alert" className="text-sm text-destructive">{payment.error.message}</p>}
        <div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" disabled={payment.isPending} onClick={() => setSelected(null)}>Cancel</Button><Button type="submit" disabled={payment.isPending || Boolean(validation)}>{payment.isPending ? "Recording…" : "Confirm cash paid"}</Button></div>
      </form>
    </DialogContent></Dialog>
  </div>;
}