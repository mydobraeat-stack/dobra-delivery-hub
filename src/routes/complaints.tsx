import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage, CompanyCard } from "@/components/marketing/PolicyPage";

export const Route = createFileRoute("/complaints")({
  head: () => ({
    meta: [
      { title: "Complaints — Dobra" },
      { name: "description", content: "How to file a complaint with Dobra, what to include and when we reply." },
      { property: "og:title", content: "Complaints — Dobra" },
      { property: "og:description", content: "How to file a complaint with Dobra, what to include and when we reply." },
      { property: "og:url", content: "https://mydobra.pl/complaints" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://mydobra.pl/complaints" }],
  }),
  component: () => <PolicyPage page="complaints"><CompanyCard /></PolicyPage>,
});
