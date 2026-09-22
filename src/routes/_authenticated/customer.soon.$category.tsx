import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/customer/soon/$category")({
  head: () => ({
    meta: [
      { title: "Coming soon — Dobra" },
      { name: "description", content: "This Dobra category is launching soon." },
      { property: "og:title", content: "Coming soon — Dobra" },
      { property: "og:description", content: "This Dobra category is launching soon." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ComingSoon,
});

function ComingSoon() {
  const { t } = useI18n();
  const { category } = Route.useParams();
  const label = t(`package.categories.${category}`);

  return (
    <main className="space-y-5 px-5 py-6">
      <Link
        to="/customer"
        className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> {t("common.actions.back")}
      </Link>
      <Card className="border-ink/10">
        <CardContent className="space-y-3 py-8 text-center">
          <Clock className="mx-auto size-10 text-primary" aria-hidden />
          <h1 className="text-xl font-bold text-foreground">{t("package.soon.title")}</h1>
          <p className="text-sm text-foreground/70">{t("package.soon.body", { category: label })}</p>
          <Button asChild>
            <Link to="/customer">{t("package.soon.back")}</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
