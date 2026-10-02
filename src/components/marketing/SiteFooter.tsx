import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { DobraLogo } from "@/components/dobra/Logo";
import { LanguageSwitcher } from "@/components/dobra/LanguageSwitcher";
import { useI18n, useT } from "@/lib/i18n";
import { StoreSoonDialog } from "./StoreSoonDialog";
import { COMPANY, SITE_COPY } from "./site-copy";

function AppleIcon() {
  return (
    <svg viewBox="0 0 384 512" className="size-6 shrink-0 fill-current" aria-hidden>
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

function GooglePlayIcon() {
  return (
    <svg viewBox="0 0 512 512" className="size-6 shrink-0" aria-hidden>
      <path fill="#34A853" d="M325 285 74 504c6 3 14 2 22-3l283-161z" />
      <path fill="#FBBC04" d="m379 340 78-45c19-11 19-29 0-40l-78-45-59 55z" />
      <path fill="#EA4335" d="M325 227 96 11C88 6 80 5 74 8l251 219z" />
      <path fill="#4285F4" d="M74 8c-8 5-13 14-13 27v442c0 13 5 22 13 27l195-193z" />
    </svg>
  );
}

const STORE_BADGES = [
  { key: "appStore", small: "Download on the", big: "App Store", Icon: AppleIcon },
  { key: "googlePlay", small: "Get it on", big: "Google Play", Icon: GooglePlayIcon },
] as const;

export function SiteFooter() {
  const t = useT();
  const { locale } = useI18n();
  const c = SITE_COPY[locale];
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink/10 bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="min-w-0">
            <DobraLogo className="text-4xl" />
            <p className="mt-3 text-sm text-foreground/70">{t("marketing.footer.tagline")}</p>
          </div>

          <nav className="min-w-0">
            <ul className="space-y-3 text-sm font-semibold text-foreground/80">
              <li>
                <Link to="/help" className="hover:text-primary">
                  {t("marketing.footer.getHelp")}
                </Link>
              </li>
              <li>
                <Link to="/partner" className="hover:text-primary">
                  {t("marketing.footer.addRestaurant")}
                </Link>
              </li>
              <li>
                <Link to="/deliver" className="hover:text-primary">
                  {t("marketing.footer.signUpToDeliver")}
                </Link>
              </li>
              <li>
                <Link to="/business" className="hover:text-primary">
                  {t("marketing.footer.businessAccount")}
                </Link>
              </li>
            </ul>
          </nav>

          <nav className="min-w-0">
            <ul className="space-y-3 text-sm font-semibold text-foreground/80">
              <li>
                <Link to="/restaurants" className="hover:text-primary">
                  {t("marketing.footer.restaurantsNearMe")}
                </Link>
              </li>
              <li>
                <Link to="/cities" className="hover:text-primary">
                  {t("marketing.footer.viewAllCities")}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary">
                  {t("marketing.footer.about")}
                </Link>
              </li>
            </ul>
          </nav>

          <div className="min-w-0 space-y-4">
            {STORE_BADGES.map((badge) => (
              <StoreSoonDialog key={badge.key}>
                <button
                  type="button"
                  aria-label={t(`marketing.footer.${badge.key}`)}
                  className="flex w-full max-w-[200px] items-center gap-3 rounded-xl bg-ink px-4 py-2.5 text-left text-card transition-opacity hover:opacity-90"
                >
                  <badge.Icon />
                  <span className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-wide opacity-80">
                      {badge.small}
                    </span>
                    <span className="block truncate text-sm font-bold">{badge.big}</span>
                  </span>
                </button>
              </StoreSoonDialog>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-8 border-t border-ink/10 pt-8 md:grid-cols-3">
          <div className="text-sm">
            <h3 className="font-bold text-foreground">{c.contact}</h3>
            <a href={`mailto:${COMPANY.email}`} className="mt-3 flex items-center gap-2 text-foreground/80 hover:text-primary">
              <Mail className="size-4" aria-hidden /> {COMPANY.email}
            </a>
            <a href={COMPANY.phoneHref} className="mt-2 flex items-center gap-2 text-foreground/80 hover:text-primary">
              <Phone className="size-4" aria-hidden /> {COMPANY.phone}
            </a>
            <p className="mt-2 text-foreground/60">{c.hours}</p>
            <Link to="/contact" className="mt-2 inline-block font-semibold text-accent hover:underline">
              {c.contact} →
            </Link>
          </div>
          <div className="text-sm text-foreground/70">
            <h3 className="font-bold text-foreground">{c.company}</h3>
            <p className="mt-3 font-semibold text-foreground/80">{COMPANY.legalName}</p>
            <p className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />{COMPANY.street}, {COMPANY.city}</p>
            <p className="mt-1">KRS {COMPANY.krs} · NIP {COMPANY.nip}</p>
            <p>REGON {COMPANY.regon}</p>
          </div>
          <div className="text-sm">
            <h3 className="font-bold text-foreground">{c.payments}</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {["BLIK", "Przelewy24", "Visa", "Mastercard", "Apple Pay", "Google Pay", "Cash"].map((p) => (
                <span key={p} className="rounded-md border border-ink/15 bg-background px-2.5 py-1 text-xs font-bold text-foreground/80">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 max-w-sm border-t border-ink/10 pt-8">
          <LanguageSwitcher />
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-ink/10 pt-6 text-sm text-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>{t("marketing.footer.copyright", { year })}</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/privacy" className="hover:text-primary">
              {t("marketing.footer.privacy")}
            </Link>
            <Link to="/terms" className="hover:text-primary">
              {t("marketing.footer.terms")}
            </Link>
            <Link to="/contact" hash="complaints" className="hover:text-primary">
              {c.complaints}
            </Link>
            <Link to="/contact" className="hover:text-primary">
              {c.contact}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
