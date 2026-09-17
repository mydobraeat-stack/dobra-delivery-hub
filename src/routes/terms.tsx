import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/marketing/InfoPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of service — Dobra" },
      { name: "description", content: "The terms that apply when you use Dobra." },
      { property: "og:title", content: "Terms of service — Dobra" },
      { property: "og:description", content: "The terms that apply when you use Dobra." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <InfoPage titleKey="marketing.pages.terms.title" bodyKey="marketing.pages.terms.body" />
  ),
});
