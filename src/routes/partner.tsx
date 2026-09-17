import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/marketing/InfoPage";

export const Route = createFileRoute("/partner")({
  head: () => ({
    meta: [
      { title: "Add your restaurant to Dobra" },
      { name: "description", content: "Bring your kitchen to Dobra and take orders from nearby customers." },
      { property: "og:title", content: "Add your restaurant to Dobra" },
      { property: "og:description", content: "Bring your kitchen to Dobra and take orders from nearby customers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <InfoPage titleKey="marketing.pages.partner.title" bodyKey="marketing.pages.partner.body" />
  ),
});
