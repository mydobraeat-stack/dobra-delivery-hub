import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/marketing/PolicyPage";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Dobra — food delivery from local restaurants" },
      { name: "description", content: "Who runs Dobra, what we do and where we deliver." },
      { property: "og:title", content: "About Dobra — food delivery from local restaurants" },
      { property: "og:description", content: "Who runs Dobra, what we do and where we deliver." },
      { property: "og:url", content: "https://mydobra.pl/about" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://mydobra.pl/about" }],
  }),
  component: () => <PolicyPage page="about" />,
});
