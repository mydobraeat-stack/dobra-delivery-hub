import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/marketing/InfoPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy policy — Dobra" },
      { name: "description", content: "How Dobra handles your personal data." },
      { property: "og:title", content: "Privacy policy — Dobra" },
      { property: "og:description", content: "How Dobra handles your personal data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <InfoPage titleKey="marketing.pages.privacy.title" bodyKey="marketing.pages.privacy.body" />
  ),
});
