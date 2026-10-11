import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { callAvailabilityQuery, startCall, type CallTarget } from "@/lib/calls";

type Props = { orderId: string; target: CallTarget; label: string; active: boolean };

/** Shown only while the order is active; disabled with a reason when the other party has no number. */
export function CallButton({ orderId, target, label, active }: Props) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const { data } = useQuery(callAvailabilityQuery(orderId, active));
  if (!active || !data?.active) return null;
  const hasNumber = Boolean(data[target]);

  const go = async () => {
    setBusy(true);
    try {
      const r = await startCall(orderId, target);
      if (r === "missing") toast.error(t(`calls.noNumber.${target}`));
    } catch {
      toast.error(t("calls.failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <Button size="sm" variant="outline" onClick={go} disabled={!hasNumber || busy} aria-describedby={hasNumber ? undefined : `call-${target}-why`}>
        <Phone className="size-4" aria-hidden /> {label}
      </Button>
      {hasNumber ? null : (
        <p id={`call-${target}-why`} className="max-w-[16rem] text-xs text-foreground/60">
          {t(`calls.noNumber.${target}`)}
        </p>
      )}
    </div>
  );
}
