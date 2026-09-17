import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/marketing/InfoPage";

export const Route = createFileRoute("/deliver")({
  head: () => ({
    meta: [
      { title: "Sign up to deliver with Dobra" },
      { name: "description", content: "Deliver with Dobra on your own schedule and get paid per order." },
      { property: "og:title", content: "Sign up to deliver with Dobra" },
      { property: "og:description", content: "Deliver with Dobra on your own schedule and get paid per order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <InfoPage titleKey="marketing.pages.deliver.title" bodyKey="marketing.pages.deliver.body" />
  ),
});
