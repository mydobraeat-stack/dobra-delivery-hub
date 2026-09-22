import { createFileRoute } from "@tanstack/react-router";
import { Tag } from "lucide-react";
import { ProfileBackLink } from "@/components/dobra/ProfileMenu";
import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/profile/promos")({
  head: () => ({
    meta: [
      { title: "Promo codes — Dobra" },
      { name: "description", content: "Your Dobra promo codes and discounts." },
      { property: "og:title", content: "Promo codes — Dobra" },
      { property: "og:description", content: "Your Dobra promo codes and discounts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePromos,
});

function ProfilePromos() {
  const t = useT();
  return (
    <main className="mx-auto max-w-2xl space-y-4 px-5 py-6">
      <ProfileBackLink label={t("common.actions.back")} />
      <h1 className="text-2xl font-bold text-foreground">{t("common.profileMenu.promos")}</h1>
      <Card className="border-ink/10">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <Tag className="size-8 text-foreground/40" aria-hidden />
          <p className="text-sm text-foreground/60">{t("common.profileMenu.promosEmpty")}</p>
        </CardContent>
      </Card>
    </main>
  );
}
