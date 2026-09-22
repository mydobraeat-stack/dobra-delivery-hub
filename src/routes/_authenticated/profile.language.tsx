import { createFileRoute } from "@tanstack/react-router";
import { LanguageSwitcher } from "@/components/dobra/LanguageSwitcher";
import { ProfileBackLink } from "@/components/dobra/ProfileMenu";
import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/profile/language")({
  head: () => ({
    meta: [
      { title: "Language — Dobra" },
      { name: "description", content: "Choose the language you want to use in Dobra." },
      { property: "og:title", content: "Language — Dobra" },
      { property: "og:description", content: "Choose the language you want to use in Dobra." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfileLanguage,
});

function ProfileLanguage() {
  const t = useT();
  return (
    <main className="mx-auto max-w-2xl space-y-4 px-5 py-6">
      <ProfileBackLink label={t("common.actions.back")} />
      <h1 className="text-2xl font-bold text-foreground">{t("common.language")}</h1>
      <Card className="border-ink/10">
        <CardContent className="pt-6">
          <LanguageSwitcher />
        </CardContent>
      </Card>
    </main>
  );
}
