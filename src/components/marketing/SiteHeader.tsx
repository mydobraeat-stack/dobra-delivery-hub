import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LanguageMenu } from "@/components/dobra/LanguageMenu";
import { DobraLogo } from "@/components/dobra/Logo";
import { useT } from "@/lib/i18n";

export function SiteHeader() {
  const t = useT();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-background/95 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="min-w-0" aria-label="Dobra">
          <DobraLogo className="text-3xl sm:text-4xl" />
        </Link>

        <div className="hidden shrink-0 items-center gap-3 md:flex">
          <LanguageMenu />
          <Link
            to="/deliver"
            className="text-sm font-semibold text-foreground/80 underline-offset-4 hover:underline"
          >
            {t("marketing.nav.deliver")}
          </Link>
          <Link
            to="/contact"
            className="text-sm font-semibold text-foreground/80 underline-offset-4 hover:underline"
          >
            {t("marketing.nav.contact")}
          </Link>
          <Button asChild variant="outline">
            <Link to="/get-started" search={{ mode: "login" }}>
              {t("marketing.nav.logIn")}
            </Link>
          </Button>
          <Button asChild>
            <Link to="/get-started" search={{ mode: "signup" }}>
              {t("marketing.nav.signUp")}
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <LanguageMenu />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={t("marketing.nav.menu")}>
              <Menu className="size-5" aria-hidden />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px]">
            <SheetTitle className="sr-only">{t("marketing.nav.menu")}</SheetTitle>
            <nav className="mt-8 flex flex-col gap-3">
              <Button asChild onClick={() => setOpen(false)}>
                <Link to="/get-started" search={{ mode: "signup" }}>
                  {t("marketing.nav.signUp")}
                </Link>
              </Button>
              <Button asChild variant="outline" onClick={() => setOpen(false)}>
                <Link to="/get-started" search={{ mode: "login" }}>
                  {t("marketing.nav.logIn")}
                </Link>
              </Button>
              <Link
                to="/deliver"
                onClick={() => setOpen(false)}
                className="mt-2 text-sm font-semibold text-foreground/80"
              >
                {t("marketing.nav.deliver")}
              </Link>
              <Link
                to="/partner"
                onClick={() => setOpen(false)}
                className="text-sm font-semibold text-foreground/80"
              >
                {t("marketing.footer.addRestaurant")}
              </Link>
              <Link
                to="/cities"
                onClick={() => setOpen(false)}
                className="text-sm font-semibold text-foreground/80"
              >
                {t("marketing.footer.viewAllCities")}
              </Link>
              <Link
                to="/about"
                onClick={() => setOpen(false)}
                className="text-sm font-semibold text-foreground/80"
              >
                {t("marketing.footer.about")}
              </Link>
              <Link
                to="/contact"
                onClick={() => setOpen(false)}
                className="text-sm font-semibold text-foreground/80"
              >
                {t("marketing.nav.contact")}
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        </div>
      </div>
    </header>
  );
}
