import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { accountQueryOptions } from "@/lib/profile";
import { AppHeader } from "@/components/dobra/AppHeader";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/customer")({
  head: () => ({
    meta: [
      { title: "Your Dobra — Restaurants near you" },
      { name: "description", content: "Browse restaurants near you and order with Dobra." },
      { property: "og:title", content: "Your Dobra" },
      { property: "og:description", content: "Browse restaurants near you and order with Dobra." },
    ],
  }),
  component: CustomerHome,
});

function CustomerHome() {
  const { data } = useQuery(accountQueryOptions);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader subtitle="Customer" />
      <main className="mx-auto max-w-4xl space-y-6 px-5 py-6">
        <h1 className="text-2xl font-bold text-foreground">
          Hungry{data?.fullName ? `, ${data.fullName.split(" ")[0]}` : ""}?
        </h1>

        <div className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-soft">
          <Search className="size-5 text-foreground/40" aria-hidden />
          <span className="text-sm text-foreground/50">Search restaurants or dishes</span>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">Restaurants near you</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden border-ink/10">
                <div className="h-28 bg-muted" />
                <CardContent className="space-y-2 py-4">
                  <div className="h-3 w-2/3 rounded bg-muted" />
                  <div className="h-3 w-1/3 rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
