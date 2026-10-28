import { Link } from "@tanstack/react-router";
import { Bike, CreditCard, MapPinned, ReceiptText, RotateCcw, ShieldCheck, Store, UtensilsCrossed } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useI18n } from "@/lib/i18n";
import { SITE_COPY } from "./site-copy";

const HOW_ICONS = [UtensilsCrossed, CreditCard, MapPinned];
const TRUST_ICONS = [ShieldCheck, ReceiptText, RotateCcw];

export function LandingSections() {
  const { locale } = useI18n();
  const c = SITE_COPY[locale];
  const joinLinks = [
    { to: "/get-started" as const, Icon: UtensilsCrossed },
    { to: "/partner" as const, Icon: Store },
    { to: "/deliver" as const, Icon: Bike },
  ];

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gradient-brand">{c.howTitle}</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {c.how.map(([title, body], i) => {
            const Icon = HOW_ICONS[i] ?? UtensilsCrossed;
            return (
              <div
                key={title}
                className="group rounded-2xl border border-ink/10 bg-panel-gradient p-6 transition-all hover:-translate-y-1 hover:border-primary hover:shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-12 place-items-center rounded-full bg-chip-gradient text-primary ring-1 ring-primary/15 transition-transform group-hover:scale-110">
                    <Icon className="size-6" aria-hidden />
                  </span>
                  <span className="text-sm font-bold text-foreground/50">0{i + 1}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-sm text-foreground/70">{body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-section-gradient py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gradient-brand">{c.joinTitle}</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {c.join.map((item, i) => {
              const { to, Icon } = joinLinks[i] ?? joinLinks[0]!;
              return (
                <Link
                  key={item.title}
                  to={to}
                  search={to === "/get-started" ? { mode: "signup" } : {}}
                  className="group flex flex-col rounded-2xl bg-panel-gradient p-6 shadow-sm ring-1 ring-ink/10 transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <span className="grid size-11 place-items-center rounded-full bg-chip-gradient text-accent ring-1 ring-primary/15">
                    <Icon className="size-6" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-foreground">{item.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-foreground/70">{item.body}</p>
                  <span className="mt-4 text-sm font-bold text-accent group-hover:underline">{item.cta} →</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gradient-brand">{c.trustTitle}</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {c.trust.map(([title, body], i) => {
            const Icon = TRUST_ICONS[i] ?? ShieldCheck;
            return (
              <div key={title} className="flex gap-4 rounded-2xl border border-ink/10 bg-panel-gradient p-5 transition-shadow hover:shadow-lg">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-chip-gradient text-primary ring-1 ring-primary/15">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div>
                  <h3 className="font-bold text-foreground">{title}</h3>
                  <p className="mt-1 text-sm text-foreground/70">{body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gradient-brand">{c.faqTitle}</h2>
        <Accordion type="single" collapsible className="mt-6">
          {c.faq.map(([q, a], i) => (
            <AccordionItem key={q} value={`f${i}`}>
              <AccordionTrigger className="text-left font-semibold">{q}</AccordionTrigger>
              <AccordionContent className="text-foreground/70">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </>
  );
}
