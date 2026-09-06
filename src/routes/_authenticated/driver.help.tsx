import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, LifeBuoy, Mail, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

const FAQ = [
  { q: "When do I get paid?", a: "Payouts are sent weekly for every delivery marked as delivered." },
  { q: "Why can't I go online?", a: "Your account must be approved before the toggle unlocks." },
  { q: "A customer is not answering", a: "Wait 5 minutes at the address, then contact support." },
];

function DriverHelp() {
  return (
    <main className="mx-auto max-w-4xl space-y-6 px-5 py-6">
      <h1 className="text-2xl font-bold text-foreground">Help & safety</h1>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button asChild size="lg" className="justify-start">
          <a href="mailto:support@dobra.app">
            <Mail className="size-4" aria-hidden /> Contact support
          </a>
        </Button>
        <Button asChild size="lg" variant="outline" className="justify-start">
          <a href="tel:112">
            <ShieldCheck className="size-4" aria-hidden /> Safety centre
          </a>
        </Button>
        <Button asChild size="lg" variant="outline" className="justify-start">
          <Link to="/driver/documents">
            <FileText className="size-4" aria-hidden /> My documents
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="justify-start">
          <Link to="/profile">
            <LifeBuoy className="size-4" aria-hidden /> Account settings
          </Link>
        </Button>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">Common questions</h2>
        {FAQ.map((f) => (
          <Card key={f.q} className="border-ink/10">
            <CardContent className="space-y-1 py-4">
              <p className="font-semibold text-foreground">{f.q}</p>
              <p className="text-sm text-foreground/70">{f.a}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
