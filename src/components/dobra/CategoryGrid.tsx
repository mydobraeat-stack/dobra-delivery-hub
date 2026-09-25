import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import foodImg from "@/assets/categories/food.jpg";
import groceriesImg from "@/assets/categories/groceries.jpg";
import shopsImg from "@/assets/categories/shops.jpg";
import pharmacyImg from "@/assets/categories/pharmacy.jpg";
import packageImg from "@/assets/categories/package.jpg";
import food2Img from "@/assets/categories/food-2.jpg";
import food3Img from "@/assets/categories/food-3.jpg";
import groceries2Img from "@/assets/categories/groceries-2.jpg";
import groceries3Img from "@/assets/categories/groceries-3.jpg";
import shops2Img from "@/assets/categories/shops-2.jpg";
import shops3Img from "@/assets/categories/shops-3.jpg";
import pharmacy2Img from "@/assets/categories/pharmacy-2.jpg";
import pharmacy3Img from "@/assets/categories/pharmacy-3.jpg";
import package2Img from "@/assets/categories/package-2.jpg";
import package3Img from "@/assets/categories/package-3.jpg";
import { useI18n } from "@/lib/i18n";
import { tapFeedback } from "@/lib/sound";

const tileClass =
  "group flex min-w-0 flex-col items-center gap-2 rounded-2xl transition-transform duration-200 active:scale-95";

/** Cycles images: a quick spin at first, then slowing to a calm rotation. */
function useCycle(count: number, offset: number) {
  const [i, setI] = useState(0);
  const [fast, setFast] = useState(true);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let delay = 90;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      setI((v) => (v + 1) % count);
      delay = Math.min(delay * 1.3, 3200);
      setFast(delay < 900);
      timer = setTimeout(tick, delay);
    };
    timer = setTimeout(tick, 400 + offset * 150);
    return () => clearTimeout(timer);
  }, [count, offset]);
  return { i, fast };
}

function Tile({ imgs, label, offset }: { imgs: string[]; label: string; offset: number }) {
  const { i, fast } = useCycle(imgs.length, offset);
  return (
    <>
      <span className="rounded-full bg-gradient-to-br from-secondary to-primary p-[3px] shadow-soft transition-transform duration-200 group-hover:scale-110 group-hover:shadow-lg group-active:scale-95">
        <span className="relative block size-[4.5rem] overflow-hidden rounded-full bg-card p-1">
          {imgs.map((src, n) => (
            <img
              key={src}
              src={src}
              alt=""
              loading="lazy"
              width={816}
              height={816}
              className={`absolute inset-1 size-16 rounded-full object-contain object-center transition-all ${
                fast ? "duration-100" : "duration-700"
              } ${n === i ? "scale-100 rotate-0 opacity-100" : fast ? "scale-75 -rotate-45 opacity-0" : "scale-90 opacity-0"}`}
            />
          ))}
        </span>
      </span>
      <span className="text-center text-xs font-semibold leading-tight text-foreground">{label}</span>
    </>
  );
}

/** Five circular category shortcuts: two on the first row, three on the second. */
export function CategoryGrid() {
  const { t } = useI18n();

  const soon = (category: string, imgs: string[], offset: number): ReactNode => (
    <Link
      to="/customer/soon/$category"
      params={{ category }}
      className={tileClass}
      onClick={() => tapFeedback("tap")}
    >
      <Tile imgs={imgs} offset={offset} label={t(`package.categories.${category}`)} />
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
            tapFeedback("pop");
            document
              .getElementById("restaurants")
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          <Tile imgs={[foodImg, food2Img, food3Img]} offset={0} label={t("package.categories.food")} />
        </button>
        {soon("groceries", [groceriesImg, groceries2Img, groceries3Img], 1)}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {soon("shops", [shopsImg, shops2Img, shops3Img], 2)}
        {soon("pharmacy", [pharmacyImg, pharmacy2Img, pharmacy3Img], 3)}
        <Link to="/customer/package" className={tileClass} onClick={() => tapFeedback("pop")}>
          <Tile imgs={[packageImg, package2Img, package3Img]} offset={4} label={t("package.categories.package")} />
        </Link>
      </div>
    </section>
  );
}
