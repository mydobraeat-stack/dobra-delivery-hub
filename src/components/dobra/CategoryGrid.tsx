import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import foodImg from "@/assets/categories/food.jpg";
import groceriesImg from "@/assets/categories/groceries.jpg";
import shopsImg from "@/assets/categories/shops.jpg";
import pharmacyImg from "@/assets/categories/pharmacy.jpg";
import packageImg from "@/assets/categories/package.jpg";
import { useI18n } from "@/lib/i18n";

const tileClass = "group flex min-w-0 flex-col items-center gap-2";

function Tile({ img, label }: { img: string; label: string }) {
  return (
    <>
      <span className="rounded-full bg-gradient-to-br from-secondary to-primary p-[3px] shadow-soft transition-transform group-hover:scale-105">
        <span className="block overflow-hidden rounded-full bg-card p-1">
          <img
            src={img}
            alt=""
            loading="lazy"
            width={816}
            height={816}
            className="size-16 rounded-full object-cover object-center"
          />
        </span>
      </span>
      <span className="text-center text-xs font-semibold leading-tight text-foreground">{label}</span>
    </>
  );
}

/** Five circular category shortcuts: two on the first row, three on the second. */
export function CategoryGrid() {
  const { t } = useI18n();

  const soon = (category: string, img: string): ReactNode => (
    <Link to="/customer/soon/$category" params={{ category }} className={tileClass}>
      <Tile img={img} label={t(`package.categories.${category}`)} />
    </Link>
  );

  return (
    <section className="space-y-3" aria-label={t("package.categories.title")}>
      <h2 className="text-lg font-bold text-foreground">{t("package.categories.title")}</h2>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className={tileClass}
          onClick={() => {
            document
              .getElementById("restaurants")
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          <Tile img={foodImg} label={t("package.categories.food")} />
        </button>
        {soon("groceries", groceriesImg)}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {soon("shops", shopsImg)}
        {soon("pharmacy", pharmacyImg)}
        <Link to="/customer/package" className={tileClass}>
          <Tile img={packageImg} label={t("package.categories.package")} />
        </Link>
      </div>
    </section>
  );
}
