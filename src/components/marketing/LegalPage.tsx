import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import type { LegalDocument } from "./legal-content";

const slug = (i: number) => `section-${i + 1}`;

/** Gently fades/slides children in when scrolled into view. */
function Reveal({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setShown(true);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section
      ref={ref}
      id={id}
      className={cn(
        "transition-all duration-700 ease-out motion-reduce:transition-none",
        shown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        className,
      )}
    >
      {children}
    </section>
  );
}

/** Professional, readable shell for long-form legal documents. */
export function LegalPage({ doc }: { doc: LegalDocument }) {
  const t = useT();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const els = doc.sections.map((_, i) => document.getElementById(slug(i))).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(Number(vis[0].target.id.replace("section-", "")) - 1);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [doc]);

  const toc = (
    <ol className="space-y-1 text-sm">
      {doc.sections.map((s, i) => (
        <li key={s.heading}>
          <a
            href={`#${slug(i)}`}
            className={cn(
              "block border-l-2 py-1.5 pl-3 leading-snug transition-colors",
              active === i
                ? "border-primary font-semibold text-primary"
                : "border-transparent text-foreground/65 hover:border-secondary hover:text-foreground",
            )}
          >
            {s.heading}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <div className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) window.history.back();
              else window.location.href = "/";
            }}
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground/70 hover:text-foreground"
          >
            <ChevronLeft className="size-4" aria-hidden />
            {t("common.actions.back")}
          </button>
          <div className="flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <span className="hidden size-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md sm:grid">
              <FileText className="size-6" aria-hidden />
            </span>
            <div className="min-w-0">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">{doc.title}</h1>
              <p className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-foreground/70">
                {doc.meta.map((m) => (
                  <span key={m} className="rounded-full border border-border bg-card px-3 py-1">
                    {m}
                  </span>
                ))}
              </p>
            </div>
          </div>
          <div className="mt-6 max-w-3xl space-y-3">
            {doc.intro.map((p) => (
              <p key={p} className="text-base leading-relaxed text-foreground/80">
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8 lg:py-14">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-foreground/50">Spis treści</p>
            {toc}
          </nav>
        </aside>

        <main className="min-w-0">
          <details className="mb-8 rounded-2xl border border-border bg-card p-4 lg:hidden">
            <summary className="cursor-pointer text-sm font-bold text-foreground">Spis treści</summary>
            <div className="mt-3">{toc}</div>
          </details>

          <div className="space-y-12">
            {doc.sections.map((section, i) => (
              <Reveal key={section.heading} id={slug(i)} className="scroll-mt-28">
                <h2 className="flex items-center gap-3 text-xl font-bold text-foreground sm:text-2xl">
                  <span aria-hidden className="h-6 w-1.5 shrink-0 rounded-full bg-primary" />
                  {section.heading}
                </h2>
                <div className="mt-2 h-px bg-gradient-to-r from-secondary via-border to-transparent" />
                {section.paragraphs?.map((p) => (
                  <p key={p} className="mt-4 max-w-prose text-[15px] leading-7 text-foreground/80 sm:text-base">
                    {p}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="mt-4 max-w-prose space-y-2.5">
                    {section.bullets.map((b) => (
                      <li key={b} className="flex gap-3 text-[15px] leading-7 text-foreground/80 sm:text-base">
                        <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Reveal>
            ))}
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-secondary/30 p-6">
            <p className="text-sm text-foreground/75">
              support@mydobra.pl · ul. Jana III Sobieskiego 38, 55-330 Lutynia
            </p>
            <Button asChild variant="outline">
              <Link to="/">{t("marketing.pages.backHome")}</Link>
            </Button>
          </div>
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
