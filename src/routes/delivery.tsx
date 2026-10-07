import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage, LiveFees } from "@/components/marketing/PolicyPage";

export const Route = createFileRoute("/delivery")({
  head: () => ({
    meta: [
      { title: "Delivery policy — Dobra" },
      { name: "description", content: "Where Dobra delivers, how delivery fees are calculated and delivery times." },
      { property: "og:title", content: "Delivery policy — Dobra" },
      { property: "og:description", content: "Where Dobra delivers, how delivery fees are calculated and delivery times." },
      { property: "og:url", content: "https://mydobra.pl/delivery" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://mydobra.pl/delivery" }],
  }),
  component: () => <PolicyPage page="delivery"><LiveFees show={["service", "delivery", "min", "package", "cities"]} /></PolicyPage>,
});
