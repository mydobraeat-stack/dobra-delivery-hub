import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { CompanyCard } from "@/components/marketing/PolicyPage";
import { SITE_COPY } from "@/components/marketing/site-copy";
import { COMPANY } from "@/lib/company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Dobra — customer service and company details" },
      { name: "description", content: "How to contact Dobra customer service, and company details of NICKOVWAY Sp. z o.o." },
      { property: "og:title", content: "Contact Dobra" },
      { property: "og:description", content: "Customer service, complaints and company details for Dobra food delivery." },
      { property: "og:url", content: "https://mydobra.pl/contact" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://mydobra.pl/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { locale } = useI18n();
  const c = SITE_COPY[locale];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = encodeURIComponent(`${message}\n\n${name} <${email}>`);
    window.location.href = `mailto:${COMPANY.email}?subject=${encodeURIComponent("Dobra — " + name)}&body=${body}`;
    setSent(true);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-14 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">{c.contactTitle}</h1>
        <p className="mt-3 text-foreground/70">{c.contactIntro}</p>

        <div className={`mt-6 grid gap-8 ${COMPANY.email ? "md:grid-cols-2" : ""}`}>
          <div>
            <CompanyCard />
          </div>
          {/* The form only appears once a support email exists to send it to. */}
          {COMPANY.email ? (
            <form onSubmit={submit} className="mt-10 space-y-3 rounded-2xl bg-card p-6 shadow-sm">
              <Input required aria-label={c.formName} placeholder={c.formName} value={name} onChange={(e) => setName(e.target.value)} />
              <Input required type="email" aria-label={c.formEmail} placeholder={c.formEmail} value={email} onChange={(e) => setEmail(e.target.value)} />
              <Textarea required rows={5} aria-label={c.formMessage} placeholder={c.formMessage} value={message} onChange={(e) => setMessage(e.target.value)} />
              <Button type="submit" className="w-full">{c.formSend}</Button>
              {sent && <p className="text-sm text-foreground/70">{c.formSent}</p>}
            </form>
          ) : null}
        </div>

        <nav className="mt-12 flex flex-wrap gap-3 text-sm font-semibold">
          <Link to="/complaints" className="rounded-full border border-ink/15 px-4 py-2 hover:border-primary">{c.complaints}</Link>
          <Link to="/refunds" className="rounded-full border border-ink/15 px-4 py-2 hover:border-primary">{c.refunds}</Link>
          <Link to="/delivery" className="rounded-full border border-ink/15 px-4 py-2 hover:border-primary">{c.delivery}</Link>
          <Link to="/help" className="rounded-full border border-ink/15 px-4 py-2 hover:border-primary">{c.pages.help.title}</Link>
        </nav>
      </main>
      <SiteFooter />
    </div>
  );
}
