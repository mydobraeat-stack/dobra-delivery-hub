import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage, LiveFees } from "@/components/marketing/PolicyPage";

export const Route = createFileRoute("/partner")({
  head: () => ({
    meta: [
      { title: "Add your restaurant to Dobra" },
      { name: "description", content: "How restaurants join Dobra, handle orders and what it costs." },
      { property: "og:title", content: "Add your restaurant to Dobra" },
      { property: "og:description", content: "How restaurants join Dobra, handle orders and what it costs." },
      { property: "og:url", content: "https://mydobra.pl/partner" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://mydobra.pl/partner" }],
  }),
  component: () => <PolicyPage page="partner"><LiveFees show={["commission"]} /></PolicyPage>,
});
