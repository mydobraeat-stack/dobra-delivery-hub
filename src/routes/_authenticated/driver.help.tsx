import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, LifeBuoy, Mail, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/driver/help")({
  head: () => ({
    meta: [
      { title: "Help & safety — Dobra for drivers" },
      { name: "description", content: "Get support, safety guidance and answers while you drive." },
      { property: "og:title", content: "Help & safety — Dobra for drivers" },
      {
        property: "og:description",
        content: "Get support, safety guidance and answers while you drive.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DriverHelp,
});

const FAQ = ["1", "2", "3"] as const;

function DriverHelp() {
  const t = useT();
  return (
    <main className="mx-auto max-w-4xl space-y-6 px-5 py-6">
      <h1 className="text-2xl font-bold text-foreground">{t("driver.help.title")}</h1>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button asChild size="lg" className="justify-start">
          <a href="mailto:support@dobra.app">
            <Mail className="size-4" aria-hidden /> {t("driver.help.contactSupport")}
          </a>
        </Button>
        <Button asChild size="lg" variant="outline" className="justify-start">
          <a href="tel:112">
            <ShieldCheck className="size-4" aria-hidden /> {t("driver.help.safetyCentre")}
          </a>
        </Button>
        <Button asChild size="lg" variant="outline" className="justify-start">
          <Link to="/driver/documents">
            <FileText className="size-4" aria-hidden /> {t("driver.help.myDocuments")}
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="justify-start">
          <Link to="/profile">
            <LifeBuoy className="size-4" aria-hidden /> {t("driver.help.accountSettings")}
          </Link>
        </Button>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">{t("driver.help.commonQuestions")}</h2>
        {FAQ.map((n) => (
          <Card key={n} className="border-ink/10">
            <CardContent className="space-y-1 py-4">
              <p className="font-semibold text-foreground">{t(`driver.help.faq.q${n}`)}</p>
              <p className="text-sm text-foreground/70">{t(`driver.help.faq.a${n}`)}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
