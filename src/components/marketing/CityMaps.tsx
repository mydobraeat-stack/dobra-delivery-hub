import { MapView, type MapPoint } from "@/components/dobra/MapView";
import { CAMEROON_CITIES, POLAND_CITIES, type City } from "./cities";
import { useT } from "@/lib/i18n";

function toPoints(cities: City[]): MapPoint[] {
  return cities.map((c) => ({ lat: c.lat, lng: c.lng, label: c.name, kind: "pickup" as const }));
}

function CountryCard({ title, cities }: { title: string; cities: City[] }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-ink/10 bg-card shadow-soft">
      <MapView points={toPoints(cities)} className="h-64 w-full sm:h-72" zoom={6} />
      <div className="p-5">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {cities.map((c) => (
            <li
              key={c.name}
              className="rounded-full bg-sun/40 px-3 py-1 text-sm font-semibold text-ink"
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
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">
          {t("marketing.cities.title")}
        </h2>
        <p className="mt-3 max-w-2xl text-base text-foreground/70">
          {t("marketing.cities.subtitle")}
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <CountryCard title={t("marketing.cities.poland")} cities={POLAND_CITIES} />
          <CountryCard title={t("marketing.cities.cameroon")} cities={CAMEROON_CITIES} />
        </div>

        <p className="mt-6 text-sm text-foreground/60">{t("marketing.cities.note")}</p>
      </div>
    </section>
  );
}
