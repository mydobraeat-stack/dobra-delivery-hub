import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { DobraLogo } from "@/components/dobra/Logo";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  mode: z.enum(["signup", "login"]).catch("signup"),
  address: z.string().optional(),
});

export const Route = createFileRoute("/get-started")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Get started with Dobra — Customer, restaurant or driver" },
      {
        name: "description",
        content:
          "Choose how you want to use Dobra: order food, take orders for your restaurant, or deliver and earn.",
      },
      { property: "og:title", content: "Get started with Dobra" },
      {
        property: "og:description",
        content: "Order food, run your kitchen, or deliver with Dobra.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Welcome,
});

const roles = ["customer", "vendor", "driver"] as const;

function Welcome() {
  const { mode } = Route.useSearch();
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
                  selected ? "border-brand shadow-soft" : "border-transparent hover:border-ink/15",
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
          <Button
            asChild
            size="lg"
            className="w-full"
            variant={mode === "login" ? "outline" : "default"}
          >
            <Link to="/auth" search={{ mode: "signup", role }}>
              {t("landing.signUp")}
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant={mode === "login" ? "default" : "outline"}
            className="w-full"
          >
            <Link to="/auth" search={{ mode: "login", role }}>
              {t("landing.logIn")}
            </Link>
          </Button>
          <Link
            to="/"
            className="inline-block pt-1 text-sm font-semibold text-foreground/60 hover:text-primary"
          >
            {t("marketing.pages.backHome")}
          </Link>
        </div>
      </div>
    </main>
  );
}
