import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  trigger: ReactNode;
  title: string;
  description?: string;
  reasonLabel?: string;
  reasonRequired?: boolean;
  amount?: { max: number; currency: string; label: string };
  /** Extra form fields rendered above the reason. */
  children?: ReactNode;
  confirmLabel: string;
  destructive?: boolean;
  /** Money actions show a second "are you sure" step with a summary. */
  confirmSummary?: (amount: number) => string;
  canSubmit?: boolean;
  onConfirm: (reason: string, amount: number) => Promise<unknown>;
  successMessage: string;
};

export function ActionDialog(p: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState(p.amount ? String(p.amount.max) : "0");
  const [step, setStep] = useState<1 | 2>(1);
  const [busy, setBusy] = useState(false);

  const num = Number(amount);
  const amountOk = !p.amount || (num > 0 && num <= p.amount.max + 1e-9);
  const reasonOk = !p.reasonRequired || reason.trim().length > 0;
  const ok = amountOk && reasonOk && p.canSubmit !== false;

  const reset = () => {
    setReason("");
    setAmount(p.amount ? String(p.amount.max) : "0");
    setStep(1);
  };

  const run = async () => {
    if (p.confirmSummary && step === 1) return setStep(2);
    setBusy(true);
    try {
      await p.onConfirm(reason.trim(), num);
      toast.success(p.successMessage);
      setOpen(false);
      reset();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>{p.trigger}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] max-w-md overflow-y-auto break-words bg-card p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>{p.title}</DialogTitle>
          {p.description ? <DialogDescription>{p.description}</DialogDescription> : null}
        </DialogHeader>
        {step === 1 ? (
          <div className="space-y-4">
            {p.children}
            {p.amount ? (
              <div className="space-y-1.5">
                <Label htmlFor="action-amount">
                  {p.amount.label} ({p.amount.currency}, max {p.amount.max.toFixed(2)})
                </Label>
                <Input
                  id="action-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={p.amount.max}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            ) : null}
            {p.reasonLabel ? (
              <div className="space-y-1.5">
                <Label htmlFor="action-reason">
                  {p.reasonLabel}
                  {p.reasonRequired ? " *" : ""}
                </Label>
                <Textarea
                  id="action-reason"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            ) : null}
          </div>
        ) : (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm font-medium">
            {p.confirmSummary?.(num)}
          </p>
        )}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => (step === 2 ? setStep(1) : setOpen(false))}>
            {step === 2 ? "Back" : "Cancel"}
          </Button>
          <Button
            variant={p.destructive ? "destructive" : "default"}
            disabled={!ok || busy}
            onClick={run}
          >
            {busy ? "Working…" : step === 1 && p.confirmSummary ? "Continue" : p.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
