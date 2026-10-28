import { MapView, type MapPoint } from "@/components/dobra/MapView";
import { CAMEROON_CITIES, POLAND_CITIES, type City } from "./cities";
import { useT } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type LiveCity = City & { country: string };

/** Public list managed from Admin > Pricing & cities; falls back to built-in list. */
function useLiveCities() {
  return useQuery({
    queryKey: ["public-cities"],
    queryFn: async (): Promise<LiveCity[] | null> => {
      const { data, error } = await supabase
        .from("cities")
        .select("name,country,lat,lng")
        .eq("enabled", true)
        .order("sort");
      if (error) return null;
      return data as LiveCity[];
    },
    staleTime: 5 * 60_000,
  });
}

function toPoints(cities: City[]): MapPoint[] {
  return cities.map((c) => ({ lat: c.lat, lng: c.lng, label: c.name, kind: "pickup" as const }));
}

/** Key-free OpenStreetMap view, used when Google Maps can't load on this domain. */
function OsmFallback({ cities, title }: { cities: City[]; title: string }) {
  const lats = cities.map((c) => c.lat);
  const lngs = cities.map((c) => c.lng);
  const pad = 0.6;
  const bbox = [
    Math.min(...lngs) - pad,
    Math.min(...lats) - pad,
    Math.max(...lngs) + pad,
    Math.max(...lats) + pad,
  ].join(",");
  return (
    <iframe
      title={title}
      loading="lazy"
      className="h-64 w-full border-0 sm:h-72"
      src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`}
    />
  );
}

function CountryCard({ title, cities }: { title: string; cities: City[] }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-ink/10 bg-panel-gradient shadow-soft">
      <MapView
        points={toPoints(cities)}
        className="h-64 w-full sm:h-72"
        zoom={6}
        fallback={cities.length ? <OsmFallback cities={cities} title={title} /> : undefined}
      />
      <div className="p-5">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {cities.map((c) => (
            <li
              key={c.name}
              className="rounded-full bg-chip-gradient px-3 py-1 text-sm font-semibold text-ink ring-1 ring-primary/15"
            >
              {c.name}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export function CityMaps() {
  const t = useT();
  const { data } = useLiveCities();
  const pl = data ? data.filter((c) => c.country === "Poland") : POLAND_CITIES;
  const cm = data ? data.filter((c) => c.country === "Cameroon") : CAMEROON_CITIES;
  return (
    <section className="bg-section-gradient">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">
          {t("marketing.cities.title")}
        </h2>
        <p className="mt-3 max-w-2xl text-base text-foreground/70">
          {t("marketing.cities.subtitle")}
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {pl.length ? <CountryCard title={t("marketing.cities.poland")} cities={pl} /> : null}
          {cm.length ? <CountryCard title={t("marketing.cities.cameroon")} cities={cm} /> : null}
        </div>

        <p className="mt-6 text-sm text-foreground/60">{t("marketing.cities.note")}</p>
      </div>
    </section>
  );
}
