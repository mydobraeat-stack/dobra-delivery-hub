import { createFileRoute } from "@tanstack/react-router";
import { ProfileBackLink } from "@/components/dobra/ProfileMenu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChatButton } from "@/components/dobra/ChatButton";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/profile/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Dobra" },
      { name: "description", content: "Answers to common questions about Dobra orders, payments and deliveries." },
      { property: "og:title", content: "FAQ — Dobra" },
      {
        property: "og:description",
        content: "Answers to common questions about Dobra orders, payments and deliveries.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfileFaq,
});

const KEYS = ["track", "payment", "driver", "cancel", "refund", "account"] as const;

function ProfileFaq() {
  const t = useT();
  return (
    <main className="mx-auto max-w-2xl space-y-4 px-5 py-6">
      <ProfileBackLink label={t("common.actions.back")} />
      <h1 className="text-2xl font-bold text-foreground">{t("common.faq.title")}</h1>
      <p className="text-sm text-foreground/70">{t("common.faq.subtitle")}</p>

      <Accordion
        type="single"
        collapsible
        className="overflow-hidden rounded-2xl border border-ink/10 bg-card px-4"
      >
        {KEYS.map((key) => (
          <AccordionItem key={key} value={key} className="border-ink/10">
            <AccordionTrigger className="text-left text-base font-semibold text-foreground">
              {t(`common.faq.items.${key}.q`)}
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-foreground/75">
              {t(`common.faq.items.${key}.a`)}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <ChatButton
        kind="support"
        variant="default"
        size="default"
        className="h-12 w-full rounded-2xl bg-brand text-base font-semibold text-primary-foreground shadow-soft"
        label={t("chat.contactSupport")}
      />
    </main>
  );
}
