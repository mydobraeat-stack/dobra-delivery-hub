import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

/** Shared shell for the simple public content pages. */
export function InfoPage({ titleKey, bodyKey, children }: { titleKey: string; bodyKey: string; children?: ReactNode }) {
  const t = useT();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-14 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">{t(titleKey)}</h1>
        <p className="mt-4 text-base text-foreground/75">{t(bodyKey)}</p>
        <p className="mt-3 text-sm text-foreground/60">{t("marketing.pages.placeholder")}</p>
        {children}
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/get-started" search={{ mode: "signup" }}>
              {t("marketing.nav.signUp")}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">{t("marketing.pages.backHome")}</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
