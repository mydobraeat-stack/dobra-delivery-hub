import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/marketing/PolicyPage";

export const Route = createFileRoute("/refunds")({
  head: () => ({
    meta: [
      { title: "Refunds and cancellations — Dobra" },
      { name: "description", content: "When you can cancel a Dobra order and how refunds are paid." },
      { property: "og:title", content: "Refunds and cancellations — Dobra" },
      { property: "og:description", content: "When you can cancel a Dobra order and how refunds are paid." },
      { property: "og:url", content: "https://mydobra.pl/refunds" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://mydobra.pl/refunds" }],
  }),
  component: () => <PolicyPage page="refunds" />,
});
