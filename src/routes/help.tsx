import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/marketing/InfoPage";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Get help — Dobra" },
      { name: "description", content: "Support for your Dobra orders and account." },
      { property: "og:title", content: "Get help — Dobra" },
      { property: "og:description", content: "Support for your Dobra orders and account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <InfoPage titleKey="marketing.pages.help.title" bodyKey="marketing.pages.help.body" />
  ),
});
