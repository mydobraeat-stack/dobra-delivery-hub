import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/marketing/InfoPage";

export const Route = createFileRoute("/cities")({
  head: () => ({
    meta: [
      { title: "Dobra cities — where we deliver" },
      { name: "description", content: "See every city where Dobra delivers today." },
      { property: "og:title", content: "Dobra cities — where we deliver" },
      { property: "og:description", content: "See every city where Dobra delivers today." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <InfoPage titleKey="marketing.pages.cities.title" bodyKey="marketing.pages.cities.body" />
  ),
});
