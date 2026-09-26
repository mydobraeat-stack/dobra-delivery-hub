import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/marketing/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Polityka prywatności — Dobra" },
      { name: "description", content: "Jak Dobra przetwarza dane osobowe użytkowników zgodnie z RODO." },
      { property: "og:title", content: "Polityka prywatności — Dobra" },
      { property: "og:description", content: "Jak Dobra przetwarza dane osobowe użytkowników zgodnie z RODO." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <LegalPage kind="privacy" />,
});
