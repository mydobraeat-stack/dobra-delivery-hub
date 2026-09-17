import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { DobraLogo } from "@/components/dobra/Logo";
import { LanguageSwitcher } from "@/components/dobra/LanguageSwitcher";
import { useT } from "@/lib/i18n";

const STORE_BADGES = [
  { key: "appStore", small: "Download on the", big: "App Store" },
  { key: "googlePlay", small: "Get it on", big: "Google Play" },
] as const;

export function SiteFooter() {
  const t = useT();
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
              <a
                key={badge.key}
                href="#"
                aria-label={t(`marketing.footer.${badge.key}`)}
                className="flex w-full max-w-[200px] items-center gap-3 rounded-xl bg-ink px-4 py-2.5 text-card transition-opacity hover:opacity-90"
              >
                <span className="text-xl leading-none" aria-hidden>
                  {badge.key === "appStore" ? "" : "▶"}
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] uppercase tracking-wide opacity-80">
                    {badge.small}
                  </span>
                  <span className="block truncate text-sm font-bold">{badge.big}</span>
                </span>
              </a>
            ))}

            <div className="flex items-center gap-3 pt-1" aria-label={t("marketing.footer.social")}>
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid size-9 place-items-center rounded-full border border-ink/15 text-foreground/70 hover:border-primary hover:text-primary"
                >
                  <Icon className="size-4" aria-hidden />
                </a>
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
          </div>
        </div>
      </div>
    </footer>
  );
}
