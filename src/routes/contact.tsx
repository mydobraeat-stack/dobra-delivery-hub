import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Clock, Mail, MapPin, Phone } from "lucide-react";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { COMPANY, SITE_COPY } from "@/components/marketing/site-copy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Dobra — Customer service and company details" },
      { name: "description", content: "Contact Dobra customer service by email or phone. Company details of NICKOVWAY SP. Z O.O." },
      { property: "og:title", content: "Contact Dobra" },
      { property: "og:description", content: "Customer service, complaints and company details for Dobra food delivery." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
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

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <a href={`mailto:${COMPANY.email}`} className="flex items-center gap-3 rounded-xl border border-ink/10 p-4 hover:border-primary">
              <Mail className="size-5 text-accent" aria-hidden /> <span className="font-semibold">{COMPANY.email}</span>
            </a>
            <a href={COMPANY.phoneHref} className="flex items-center gap-3 rounded-xl border border-ink/10 p-4 hover:border-primary">
              <Phone className="size-5 text-accent" aria-hidden /> <span className="font-semibold">{COMPANY.phone}</span>
            </a>
            <div className="flex items-center gap-3 rounded-xl border border-ink/10 p-4">
              <Clock className="size-5 text-accent" aria-hidden /> <span>{c.hours}</span>
            </div>
            <div className="flex gap-3 rounded-xl border border-ink/10 p-4">
              <Building2 className="size-5 shrink-0 text-accent" aria-hidden />
              <div className="text-sm">
                <p className="font-bold">{COMPANY.legalName}</p>
                <p className="flex items-center gap-1"><MapPin className="size-3" aria-hidden />{COMPANY.street}, {COMPANY.city}</p>
                <p className="text-foreground/70">KRS {COMPANY.krs} · NIP {COMPANY.nip} · REGON {COMPANY.regon}</p>
                <p className="mt-1 text-foreground/70">{COMPANY.partnerEmail} · {COMPANY.legalEmail}</p>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-3 rounded-2xl bg-card p-6 shadow-sm">
            <Input required placeholder={c.formName} value={name} onChange={(e) => setName(e.target.value)} />
            <Input required type="email" placeholder={c.formEmail} value={email} onChange={(e) => setEmail(e.target.value)} />
            <Textarea required rows={5} placeholder={c.formMessage} value={message} onChange={(e) => setMessage(e.target.value)} />
            <Button type="submit" className="w-full">{c.formSend}</Button>
            {sent && <p className="text-sm text-foreground/70">{c.formSent}</p>}
          </form>
        </div>

        <section id="complaints" className="mt-14 rounded-2xl border border-ink/10 p-6">
          <h2 className="text-2xl font-extrabold">{c.complaintsTitle}</h2>
          {c.complaintsBody.map((p) => (
            <p key={p} className="mt-3 text-sm text-foreground/75">{p}</p>
          ))}
          <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold text-accent underline">
            ec.europa.eu/consumers/odr
          </a>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
