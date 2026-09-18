import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/marketing/LegalPage";
import { TERMS_DOC } from "@/components/marketing/legal-content";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Regulamin — Dobra" },
      { name: "description", content: "Regulamin Platformy Dobra — zasady zamawiania, płatności i dostawy." },
      { property: "og:title", content: "Regulamin — Dobra" },
      { property: "og:description", content: "Regulamin Platformy Dobra — zasady zamawiania, płatności i dostawy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <LegalPage doc={TERMS_DOC} />,
});
