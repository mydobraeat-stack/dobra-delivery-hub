import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/marketing/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Regulamin — Dobra" },
      { name: "description", content: "Regulamin Platformy Dobra — zasady zamawiania, płatności i dostawy." },
      { property: "og:title", content: "Regulamin — Dobra" },
      { property: "og:description", content: "Regulamin Platformy Dobra — zasady zamawiania, płatności i dostawy." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://mydobra.pl/terms" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://mydobra.pl/terms" }],
  }),
  component: () => <LegalPage kind="terms" />,
});
