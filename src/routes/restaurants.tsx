import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { FeaturedRestaurants } from "@/components/marketing/FeaturedRestaurants";
import { useI18n } from "@/lib/i18n";
import { SITE_COPY } from "@/components/marketing/site-copy";

export const Route = createFileRoute("/restaurants")({
  head: () => ({
    meta: [
      { title: "Restaurants on Dobra" },
      { name: "description", content: "Local restaurants currently taking delivery orders on Dobra." },
      { property: "og:title", content: "Restaurants on Dobra" },
      { property: "og:description", content: "Local restaurants currently taking delivery orders on Dobra." },
      { property: "og:url", content: "https://mydobra.pl/restaurants" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://mydobra.pl/restaurants" }],
  }),
  component: RestaurantsPage,
});

function RestaurantsPage() {
  const { locale } = useI18n();
  const c = SITE_COPY[locale];
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">{c.featuredTitle}</h1>
          <p className="mt-3 text-foreground/70">{c.featuredSub}</p>
        </div>
        <FeaturedRestaurants heading={false} />
      </main>
      <SiteFooter />
    </div>
  );
}
