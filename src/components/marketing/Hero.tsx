import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useT } from "@/lib/i18n";
import heroImage from "@/assets/marketing-hero.jpg";
import heroBurger from "@/assets/hero-burger.jpg";
import heroBowl from "@/assets/hero-bowl.jpg";
import heroPizza from "@/assets/hero-pizza.jpg";
import heroPierogi from "@/assets/hero-pierogi.jpg";
import heroGrill from "@/assets/hero-grill.jpg";

const HERO_IMAGES = [heroImage, heroBurger, heroBowl, heroPizza, heroPierogi, heroGrill];
const ROTATE_MS = 5000;
// Slot-machine intro: fast cycle, then decelerating steps into the slow rotation.
const SPIN_STEPS = [170, 170, 170, 180, 200, 240, 320, 460, 700, 1100, 1900, 3000];
const FADE_STEPS = [90, 90, 90, 100, 120, 150, 200, 280, 420, 620, 900, 1000];

export function Hero() {
  const t = useT();
  const navigate = useNavigate();
  const [address, setAddress] = useState("");

  // Start on a random dish each visit (after hydration), then cycle gently.
  const [start, setStart] = useState(0);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setStart(Math.floor(Math.random() * HERO_IMAGES.length));
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let step = reduced ? SPIN_STEPS.length : 0;
    let timer = 0;

    const tick = () => {
      const delay = SPIN_STEPS[step] ?? ROTATE_MS;
      timer = window.setTimeout(() => {
        setIndex((i) => i + 1);
        step += 1;
        tick();
      }, delay);
    };
    tick();

    return () => window.clearTimeout(timer);
  }, []);

  const active = (start + index) % HERO_IMAGES.length;
  const fadeMs = FADE_STEPS[Math.min(index, FADE_STEPS.length - 1)] ?? 1000;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    void navigate({
      to: "/get-started",
      search: { mode: "signup", ...(address.trim() ? { address: address.trim() } : {}) },
    });
  }

  return (
    <section className="bg-sun">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:py-20">
        <div className="min-w-0">
          <h1 className="text-4xl font-extrabold leading-tight text-ink sm:text-5xl lg:text-6xl">
            {t("marketing.hero.title")}
          </h1>
          <p className="mt-4 max-w-xl text-base text-ink/75 sm:text-lg">
            {t("marketing.hero.subtitle")}
          </p>

          <form onSubmit={submit} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <label htmlFor="hero-address" className="sr-only">
              {t("marketing.hero.addressLabel")}
            </label>
            <Input
              id="hero-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t("marketing.hero.addressPlaceholder")}
              className="h-12 flex-1 bg-card text-base"
              autoComplete="street-address"
            />
            <Button type="submit" size="lg" className="h-12 shrink-0 px-8">
              {t("marketing.hero.cta")}
            </Button>
          </form>

          <Link
            to="/get-started"
            search={{ mode: "login" }}
            className="mt-4 inline-block text-sm font-semibold text-ink underline underline-offset-4"
          >
            {t("marketing.hero.orSignIn")}
          </Link>
        </div>

        <div className="min-w-0">
          <div className="relative aspect-[5/4] w-full overflow-hidden rounded-3xl shadow-soft">
            {HERO_IMAGES.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={i === active ? t("marketing.hero.imageAlt") : ""}
                aria-hidden={i !== active}
                width={1280}
                height={1024}
                loading="eager"
                decoding="async"
                style={{ transitionDuration: `${fadeMs}ms`, willChange: "opacity" }}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity ease-in-out ${
                  i === active ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
