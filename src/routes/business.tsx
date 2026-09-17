import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/marketing/InfoPage";

export const Route = createFileRoute("/business")({
  head: () => ({
    meta: [
      { title: "Dobra for business" },
      { name: "description", content: "Feed your team with one shared Dobra business account." },
      { property: "og:title", content: "Dobra for business" },
      { property: "og:description", content: "Feed your team with one shared Dobra business account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <InfoPage titleKey="marketing.pages.business.title" bodyKey="marketing.pages.business.body" />
  ),
});
