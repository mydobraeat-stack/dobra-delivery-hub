import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mail, MapPin, Phone, Clock, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { COMPANY, companyAddress, phoneHref, registryParts } from "@/lib/company";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { SITE_COPY, type PageKey } from "./site-copy";
import { publicCitiesQuery, publicPricingQuery } from "./public-data";

/** Shared shell for the public policy / info pages (content in site-copy.ts). */
export function PolicyPage({ page, children }: { page: PageKey; children?: ReactNode }) {
  const { locale } = useI18n();
  const doc = SITE_COPY[locale].pages[page];
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">{doc.title}</h1>
        <p className="mt-4 text-lg text-foreground/75">{doc.intro}</p>
        <div className="mt-10 space-y-10">
          {doc.sections.map((s) => (
            <section key={s.h}>
              <h2 className="flex items-center gap-3 text-xl font-bold text-foreground">
                <span aria-hidden className="h-6 w-1.5 shrink-0 rounded-full bg-primary" />
                {s.h}
              </h2>
              {s.p?.map((p) => (
                <p key={p} className="mt-3 leading-7 text-foreground/80">{p}</p>
              ))}
              {s.b ? (
                <ul className="mt-3 space-y-2">
                  {s.b.map((b) => (
                    <li key={b} className="flex gap-3 leading-7 text-foreground/80">
                      <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
        {children}
        {doc.cta ? (
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg">
              {doc.cta.to === "/get-started" ? (
                <Link to="/get-started" search={{ mode: "signup" }}>{doc.cta.label}</Link>
              ) : (
                <Link to={doc.cta.to}>{doc.cta.label}</Link>
              )}
            </Button>
          </div>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}

/** Contact methods + company data; every field renders only when it has a value. */
export function CompanyCard() {
  const { locale } = useI18n();
  const c = SITE_COPY[locale];
  const hours = COMPANY.hours[locale];
  const reg = registryParts();
  return (
    <div className="mt-10 space-y-3 rounded-2xl border border-ink/10 bg-card p-5 text-sm">
      {COMPANY.email ? (
        <a href={`mailto:${COMPANY.email}`} className="flex items-center gap-3 hover:text-primary">
          <Mail className="size-4 text-accent" aria-hidden /> <span className="font-semibold">{COMPANY.email}</span>
        </a>
      ) : null}
      {COMPANY.phone ? (
        <a href={phoneHref()} className="flex items-center gap-3 hover:text-primary">
          <Phone className="size-4 text-accent" aria-hidden /> <span className="font-semibold">{COMPANY.phone}</span>
        </a>
      ) : null}
      {hours ? (
        <p className="flex items-center gap-3"><Clock className="size-4 text-accent" aria-hidden /> {hours}</p>
      ) : null}
      <div className="flex gap-3">
        <Building2 className="size-4 shrink-0 text-accent" aria-hidden />
        <div>
          <p className="font-bold">{COMPANY.legalName}</p>
          <p className="flex items-center gap-1 text-foreground/80"><MapPin className="size-3" aria-hidden /> {companyAddress()}</p>
          {reg.length ? <p className="text-foreground/70">{reg.join(" · ")}</p> : null}
        </div>
      </div>
      {!COMPANY.email && !COMPANY.phone ? <p className="text-foreground/70">{c.chatHint}</p> : null}
    </div>
  );
}

/** Live fees from the admin pricing settings (same values as checkout). */
export function LiveFees({ show }: { show: ("service" | "delivery" | "min" | "package" | "commission" | "cities")[] }) {
  const { locale, formatMoney } = useI18n();
  const L = SITE_COPY[locale].live;
  const { data: pricing = [] } = useQuery(publicPricingQuery);
  const { data: cities = [] } = useQuery(publicCitiesQuery);
  const rows = (p: (typeof pricing)[number]) => {
    const m = (v: number) => (Number(v) > 0 ? formatMoney(Number(v), p.currency) : L.none);
    return [
      show.includes("service") && [L.serviceFee, m(p.service_fee)],
      show.includes("delivery") && [L.deliveryFee, m(p.delivery_fee)],
      show.includes("min") && [L.minOrder, m(p.min_order)],
      show.includes("package") && [L.packageBase, m(p.package_base_fee)],
      show.includes("package") && [L.packagePerKm, m(p.package_per_km)],
      show.includes("package") && [L.packageMin, m(p.package_min_fee)],
      show.includes("commission") && [L.commission, `${Number(p.commission_pct)}%`],
    ].filter(Boolean) as [string, string][];
  };
  // Show Poland (PLN) first — it is the live market.
  const ordered = [...pricing].sort((a, b) => (a.country === "Poland" ? -1 : b.country === "Poland" ? 1 : 0));
  return (
    <section className="mt-10 rounded-2xl border border-primary/30 bg-primary/5 p-5">
      <h2 className="text-lg font-bold text-foreground">{L.title}</h2>
      <p className="mt-1 text-sm text-foreground/70">{L.note}</p>
      {ordered.map((p) => {
        const r = rows(p);
        const cs = cities.filter((c) => c.country === p.country).map((c) => c.name);
        if (!r.length && !(show.includes("cities") && cs.length)) return null;
        return (
          <div key={p.country} className="mt-4">
            <p className="text-sm font-bold text-foreground">{p.country} ({p.currency})</p>
            <dl className="mt-2 divide-y divide-ink/10 text-sm">
              {r.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-1.5">
                  <dt className="text-foreground/75">{k}</dt>
                  <dd className="shrink-0 font-semibold">{v}</dd>
                </div>
              ))}
              {show.includes("cities") && cs.length ? (
                <div className="flex justify-between gap-4 py-1.5">
                  <dt className="text-foreground/75">{L.cities}</dt>
                  <dd className="text-right font-semibold">{cs.join(", ")}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        );
      })}
    </section>
  );
}
