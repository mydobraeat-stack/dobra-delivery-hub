import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { CityMaps } from "@/components/marketing/CityMaps";

export const Route = createFileRoute("/cities")({
  head: () => ({
    meta: [
      { title: "Dobra cities — where we deliver" },
      { name: "description", content: "See every city where Dobra delivers today." },
      { property: "og:title", content: "Dobra cities — where we deliver" },
      { property: "og:description", content: "See every city where Dobra delivers today." },
      { property: "og:url", content: "https://mydobra.pl/cities" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://mydobra.pl/cities" }],
  }),
  component: () => (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <CityMaps />
      </main>
      <SiteFooter />
    </div>
  ),
});
