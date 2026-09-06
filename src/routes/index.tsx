import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DobraLogo } from "@/components/dobra/Logo";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dobra — Food delivery for customers, restaurants & drivers" },
      {
        name: "description",
        content:
          "Order from local restaurants, run your kitchen, or deliver with Dobra. One app for customers, vendors and drivers.",
      },
      { property: "og:title", content: "Dobra — Food delivery, done well" },
      {
        property: "og:description",
        content:
          "Order from local restaurants, run your kitchen, or deliver with Dobra. One app for customers, vendors and drivers.",
      },
    ],
  }),
  component: Welcome,
});

const roles = ["customer", "vendor", "driver"] as const;

function Welcome() {
  const [role, setRole] = useState<(typeof roles)[number]>("customer");
  const t = useT();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-14">
      <div className="w-full max-w-md text-center">
        <DobraLogo className="text-7xl" />
        <p className="mt-3 text-base font-medium text-foreground/70">{t("common.tagline")}</p>

        <h1 className="sr-only">{t("landing.srTitle")}</h1>

        <div className="mt-9 space-y-3 text-left">
          {roles.map((option) => {
            const selected = role === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setRole(option)}
                aria-pressed={selected}
                className={cn(
                  "w-full rounded-2xl border-2 bg-card px-5 py-4 text-left transition-all",
                  selected
                    ? "border-brand shadow-soft"
                    : "border-transparent hover:border-ink/15",
                )}
              >
                <span className="block text-base font-bold text-foreground">
                  {t(`landing.roles.${option}.title`)}
                </span>
                <span className="mt-0.5 block text-sm text-foreground/60">
                  {t(`landing.roles.${option}.copy`)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 space-y-3">
          <Button asChild size="lg" className="w-full">
            <Link to="/auth" search={{ mode: "signup", role }}>
              {t("landing.signUp")}
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full">
            <Link to="/auth" search={{ mode: "login", role }}>
              {t("landing.logIn")}
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

