import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import type { LegalDocument } from "./legal-content";

/** Readable, branded shell for long-form legal documents. */
export function LegalPage({ doc }: { doc: LegalDocument }) {
  const t = useT();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <header className="border-b border-ink/10 pb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {doc.title}
          </h1>
          <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-foreground/60">
            {doc.meta.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </p>
          {doc.intro.map((p) => (
            <p key={p} className="mt-4 text-base leading-relaxed text-foreground/75">
              {p}
            </p>
          ))}
        </header>

        <div className="mt-10 space-y-10">
          {doc.sections.map((section) => (
            <section key={section.heading} className="scroll-mt-24">
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">{section.heading}</h2>
              {section.paragraphs?.map((p) => (
                <p key={p} className="mt-3 text-base leading-relaxed text-foreground/80">
                  {p}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-4 space-y-2">
                  {section.bullets.map((b) => (
                    <li key={b} className="flex gap-3 text-base leading-relaxed text-foreground/80">
                      <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3 border-t border-ink/10 pt-8">
          <Button asChild variant="outline">
            <Link to="/">{t("marketing.pages.backHome")}</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
