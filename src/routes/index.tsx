import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { Hero } from "@/components/marketing/Hero";
import { CityMaps } from "@/components/marketing/CityMaps";
import { LandingSections } from "@/components/marketing/LandingSections";
import { FeaturedRestaurants } from "@/components/marketing/FeaturedRestaurants";
import { SiteFooter } from "@/components/marketing/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dobra — Food delivery in Poland and Cameroon" },
      {
        name: "description",
        content:
          "Order delivery from local restaurants near you with Dobra. Add your restaurant or sign up to deliver.",
      },
      { property: "og:title", content: "Dobra — Order delivery near you" },
      {
        property: "og:description",
        content:
          "Order delivery from local restaurants near you with Dobra. Add your restaurant or sign up to deliver.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MarketingHome,
});

function MarketingHome() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <LandingSections />
        <FeaturedRestaurants limit={6} />
        <CityMaps />
      </main>
      <SiteFooter />
    </div>
  );
}
