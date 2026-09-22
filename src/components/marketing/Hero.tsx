import { useCallback, useEffect, useState } from "react";
import { Loader2, LocateFixed, MapPin } from "lucide-react";
import { reverseGeocodePublic } from "@/lib/maps.functions";
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
  const [locating, setLocating] = useState(false);
  const [locationFailed, setLocationFailed] = useState(false);
  const [touched, setTouched] = useState(false);

  const detectLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationFailed(true);
      return;
    }
    setLocating(true);
    setLocationFailed(false);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        void reverseGeocodePublic({
          data: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        })
          .then((found) => {
            if (found) {
              setAddress((current) => (current.trim() ? current : found));
            } else {
              setLocationFailed(true);
            }
          })
          .catch(() => setLocationFailed(true))
          .finally(() => setLocating(false));
      },
      () => {
        setLocating(false);
        setLocationFailed(true);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }, []);

  // Fill the address in for visitors who already allowed location access.
  useEffect(() => {
    let cancelled = false;
    const permissions = typeof navigator !== "undefined" ? navigator.permissions : undefined;
    if (!permissions?.query) {
      detectLocation();
      return;
    }
    permissions
      .query({ name: "geolocation" as PermissionName })
      .then((status) => {
        if (!cancelled && status.state !== "denied") detectLocation();
        else if (!cancelled) setLocationFailed(true);
      })
      .catch(() => {
        if (!cancelled) detectLocation();
      });
    return () => {
      cancelled = true;
    };
  }, [detectLocation]);

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
            <div className="relative min-w-0 flex-1">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-ink/40" />
              <Input
                id="hero-address"
                value={address}
                onChange={(e) => {
                  setTouched(true);
                  setAddress(e.target.value);
                }}
                placeholder={
                  locating && !address ? t("marketing.hero.locating") : t("marketing.hero.addressPlaceholder")
                }
                className="h-12 w-full bg-card pl-10 pr-11 text-base"
                autoComplete="street-address"
              />
              <button
                type="button"
                onClick={detectLocation}
                aria-label={t("marketing.hero.useLocation")}
                title={t("marketing.hero.useLocation")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-ink/60 transition-colors hover:bg-ink/5 hover:text-primary"
              >
                {locating ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <LocateFixed className="size-5" />
                )}
              </button>
            </div>
            <Button type="submit" size="lg" className="h-12 shrink-0 px-8">
              {t("marketing.hero.cta")}
            </Button>
          </form>

          {locationFailed && !touched && !address ? (
            <p className="mt-2 text-sm text-ink/60">{t("marketing.hero.locationDenied")}</p>
          ) : null}


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
