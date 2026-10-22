import { useI18n } from "@/lib/i18n";
import { formatOrderTime, orderTimeline, TIME_LABELS, type OrderTimes, type TimeStep } from "@/lib/order-time";

/** One labelled time, e.g. "Placed at 12 Oct 2026, 14:35". */
export function OrderTimeLabel({ step, at, country }: { step: TimeStep; at: string | null | undefined; country: string | null | undefined }) {
  const { locale } = useI18n();
  if (!at) return null;
  return (
    <span>
      {TIME_LABELS[locale][step]} {formatOrderTime(at, country, locale)}
    </span>
  );
}

/** Small status timeline with every stored status-change time. */
export function OrderTimeline({ order, country }: { order: OrderTimes; country: string | null | undefined }) {
  const { locale } = useI18n();
  const steps = orderTimeline(order);
  return (
    <ol className="space-y-1 text-xs text-foreground/70">
      {steps.map((s) => (
        <li key={s.step} className="flex justify-between gap-3">
          <span className="font-medium">{TIME_LABELS[locale][s.step]}</span>
          <span className="tabular-nums">{formatOrderTime(s.at, country, locale)}</span>
        </li>
      ))}
    </ol>
  );
}
