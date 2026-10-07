import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage, CompanyCard } from "@/components/marketing/PolicyPage";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Dobra help centre" },
      { name: "description", content: "Answers about orders, payments and your Dobra account, and how to contact us." },
      { property: "og:title", content: "Dobra help centre" },
      { property: "og:description", content: "Answers about orders, payments and your Dobra account, and how to contact us." },
      { property: "og:url", content: "https://mydobra.pl/help" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://mydobra.pl/help" }],
  }),
  component: () => <PolicyPage page="help"><CompanyCard /></PolicyPage>,
});
