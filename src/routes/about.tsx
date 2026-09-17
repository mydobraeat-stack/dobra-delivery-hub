import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/marketing/InfoPage";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Dobra" },
      { name: "description", content: "Dobra connects people with great local food in Poland and Cameroon." },
      { property: "og:title", content: "About Dobra" },
      { property: "og:description", content: "Dobra connects people with great local food in Poland and Cameroon." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <InfoPage titleKey="marketing.pages.about.title" bodyKey="marketing.pages.about.body" />
  ),
});
