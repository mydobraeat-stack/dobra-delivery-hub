import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/marketing/PolicyPage";

export const Route = createFileRoute("/deliver")({
  head: () => ({
    meta: [
      { title: "Become a Dobra courier" },
      { name: "description", content: "How to sign up as a Dobra courier, the documents you need and how deliveries work." },
      { property: "og:title", content: "Become a Dobra courier" },
      { property: "og:description", content: "How to sign up as a Dobra courier, the documents you need and how deliveries work." },
      { property: "og:url", content: "https://mydobra.pl/deliver" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://mydobra.pl/deliver" }],
  }),
  component: () => <PolicyPage page="deliver" />,
});
