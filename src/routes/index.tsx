import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DobraLogo } from "@/components/dobra/Logo";
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

const roles = [
  { key: "customer", title: "I'm a Customer", copy: "Order food from places nearby" },
  { key: "vendor", title: "I'm a Vendor", copy: "Take orders for my restaurant" },
  { key: "driver", title: "I'm a Driver", copy: "Deliver orders and earn" },
] as const;

function Welcome() {
  const [role, setRole] = useState<(typeof roles)[number]["key"]>("customer");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-14">
      <div className="w-full max-w-md text-center">
        <DobraLogo className="text-7xl" />
        <p className="mt-3 text-base font-medium text-foreground/70">
          Good food, delivered fast.
        </p>

        <h1 className="sr-only">Dobra food delivery</h1>

        <div className="mt-9 space-y-3 text-left">
          {roles.map((option) => {
            const selected = role === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => setRole(option.key)}
                aria-pressed={selected}
                className={cn(
                  "w-full rounded-2xl border-2 bg-card px-5 py-4 text-left transition-all",
                  selected
                    ? "border-brand shadow-soft"
                    : "border-transparent hover:border-ink/15",
                )}
              >
                <span className="block text-base font-bold text-foreground">{option.title}</span>
                <span className="mt-0.5 block text-sm text-foreground/60">{option.copy}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 space-y-3">
          <Button asChild size="lg" className="w-full">
            <Link to="/auth" search={{ mode: "signup", role }}>
              Sign up
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full">
            <Link to="/auth" search={{ mode: "login", role }}>
              Log in
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
