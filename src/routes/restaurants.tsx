import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/marketing/InfoPage";

export const Route = createFileRoute("/restaurants")({
  head: () => ({
    meta: [
      { title: "Restaurants near me — Dobra" },
      { name: "description", content: "Find restaurants delivering to your address with Dobra." },
      { property: "og:title", content: "Restaurants near me — Dobra" },
      { property: "og:description", content: "Find restaurants delivering to your address with Dobra." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <InfoPage titleKey="marketing.pages.restaurants.title" bodyKey="marketing.pages.restaurants.body" />
  ),
});
