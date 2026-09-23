import { createFileRoute } from "@tanstack/react-router";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { ProfileBackLink } from "@/components/dobra/ProfileMenu";
import { useT } from "@/lib/i18n";
import { useTheme, type ThemeChoice } from "@/lib/theme";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/profile/appearance")({
  head: () => ({
    meta: [
      { title: "Appearance — Dobra" },
      { name: "description", content: "Choose light or dark mode for Dobra." },
      { property: "og:title", content: "Appearance — Dobra" },
      { property: "og:description", content: "Choose light or dark mode for Dobra." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AppearancePage,
});

const OPTIONS: { value: ThemeChoice; icon: typeof Sun; key: string }[] = [
  { value: "light", icon: Sun, key: "light" },
  { value: "dark", icon: Moon, key: "dark" },
  { value: "system", icon: Monitor, key: "system" },
];

function AppearancePage() {
  const t = useT();
  const { theme, setTheme } = useTheme();

  return (
    <main className="mx-auto max-w-2xl space-y-4 px-5 py-6">
      <ProfileBackLink label={t("common.actions.back")} />
      <h1 className="text-2xl font-bold text-foreground">{t("common.appearance.title")}</h1>
      <p className="text-sm text-foreground/60">{t("common.appearance.help")}</p>

      <ul className="overflow-hidden rounded-2xl border border-ink/10 bg-card">
        {OPTIONS.map(({ value, icon: Icon, key }) => {
          const selected = theme === value;
          return (
            <li key={value} className="border-b border-ink/10 last:border-b-0">
              <button
                type="button"
                onClick={() => setTheme(value)}
                className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-muted/60 active:scale-[0.99]"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sun/40 ring-1 ring-brand/25">
                  <Icon className="size-5 text-brand" aria-hidden />
                </span>
                <span className="min-w-0 flex-1 text-base font-medium text-foreground">
                  {t(`common.appearance.${key}`)}
                </span>
                <Check
                  className={cn("size-5 shrink-0 text-brand", selected ? "opacity-100" : "opacity-0")}
                  aria-hidden
                />
              </button>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
