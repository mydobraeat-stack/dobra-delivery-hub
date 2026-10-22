/** Order date/time formatting in the order's own country timezone, 24-hour clock. */
export type TimeLocale = "en" | "pl" | "uk" | "fr";

const INTL: Record<TimeLocale, string> = { en: "en-GB", pl: "pl-PL", uk: "uk-UA", fr: "fr-FR" };

export function orderTimeZone(country: string | null | undefined): string {
  const c = (country ?? "").trim().toLowerCase();
  if (["cameroon", "cm", "cameroun"].includes(c)) return "Africa/Douala";
  return "Europe/Warsaw";
}

export function formatOrderTime(
  value: string | null | undefined,
  country: string | null | undefined,
  locale: TimeLocale = "en",
): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(INTL[locale] ?? "en-GB", {
    timeZone: orderTimeZone(country),
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(d);
}

export type TimeStep = "placed" | "offered" | "accepted" | "ready" | "picked_up" | "delivered" | "cancelled";

export const TIME_LABELS: Record<TimeLocale, Record<TimeStep, string>> = {
  en: { placed: "Placed at", offered: "Offered at", accepted: "Accepted", ready: "Ready", picked_up: "Picked up", delivered: "Delivered at", cancelled: "Cancelled" },
  pl: { placed: "Złożono", offered: "Zaoferowano", accepted: "Przyjęto", ready: "Gotowe", picked_up: "Odebrano", delivered: "Dostarczono", cancelled: "Anulowano" },
  uk: { placed: "Оформлено", offered: "Запропоновано", accepted: "Прийнято", ready: "Готово", picked_up: "Забрано", delivered: "Доставлено", cancelled: "Скасовано" },
  fr: { placed: "Passée le", offered: "Proposée le", accepted: "Acceptée", ready: "Prête", picked_up: "Récupérée", delivered: "Livrée le", cancelled: "Annulée" },
};

export type OrderTimes = {
  created_at: string;
  accepted_at?: string | null;
  ready_at?: string | null;
  picked_up_at?: string | null;
  delivered_at?: string | null;
  cancelled_at?: string | null;
};

/** Known timeline steps, in order, skipping steps without a stored time. */
export function orderTimeline(o: OrderTimes): { step: TimeStep; at: string }[] {
  const steps: [TimeStep, string | null | undefined][] = [
    ["placed", o.created_at],
    ["accepted", o.accepted_at],
    ["ready", o.ready_at],
    ["picked_up", o.picked_up_at],
    ["delivered", o.delivered_at],
    ["cancelled", o.cancelled_at],
  ];
  return steps.filter((s): s is [TimeStep, string] => !!s[1]).map(([step, at]) => ({ step, at }));
}
