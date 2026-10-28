import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Star } from "lucide-react";
import { StoredImage } from "@/components/dobra/StoredImage";
import { useI18n } from "@/lib/i18n";
import { SITE_COPY } from "./site-copy";
import { publicRestaurantsQuery } from "./public-data";

/** Live approved restaurants. Renders nothing if there are none (no sample content). */
export function FeaturedRestaurants({ limit, heading = true }: { limit?: number; heading?: boolean }) {
  const { locale, formatMoney } = useI18n();
  const c = SITE_COPY[locale];
  const { data = [], isLoading } = useQuery(publicRestaurantsQuery);
  const list = limit ? data.slice(0, limit) : data;
  if (!isLoading && list.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {heading ? (
        <>
          <h2 className="text-3xl font-extrabold text-foreground">{c.featuredTitle}</h2>
          <p className="mt-2 text-foreground/70">{c.featuredSub}</p>
        </>
      ) : null}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />)
          : list.map((r) => (
              <Link
                key={r.id}
                to="/get-started"
                search={{ mode: "signup" }}
                className="group overflow-hidden rounded-2xl border border-ink/10 bg-panel-gradient shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <StoredImage value={r.logo_url} alt={r.name} width={600} height={340} className="h-40 w-full object-contain" />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="min-w-0 truncate text-lg font-bold text-foreground">{r.name}</h3>
                    {Number(r.rating) > 0 ? (
                      <span className="flex shrink-0 items-center gap-1 text-sm font-semibold">
                        <Star className="size-4 fill-secondary text-secondary" aria-hidden /> {Number(r.rating).toFixed(1)}
                      </span>
                    ) : null}
                  </div>
                  <p className="truncate text-sm text-foreground/65">{[r.cuisine, r.city].filter(Boolean).join(" · ")}</p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-foreground/70">
                      <Clock className="size-4" aria-hidden /> {r.eta_minutes} {c.minutes} · {c.deliveryFee} {formatMoney(Number(r.delivery_fee), "PLN")}
                    </span>
                    <span className="font-bold text-accent group-hover:underline">{c.featuredCta} →</span>
                  </div>
                </div>
              </Link>
            ))}
      </div>
    </section>
  );
}
