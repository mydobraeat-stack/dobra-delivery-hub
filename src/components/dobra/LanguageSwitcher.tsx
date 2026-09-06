import { Languages } from "lucide-react";
import { LOCALES, LOCALE_NAMES, useI18n, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Language picker shown in account settings for every role. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Languages className="size-4 text-foreground/70" aria-hidden />
        <span className="text-sm font-semibold text-foreground">{t("common.language")}</span>
      </div>
      <p className="text-sm text-foreground/60">{t("common.languageHelp")}</p>
      <div className="grid grid-cols-2 gap-2">
        {LOCALES.map((code: Locale) => (
          <button
            key={code}
            type="button"
            lang={code}
            onClick={() => setLocale(code)}
            aria-pressed={locale === code}
            className={cn(
              "rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-colors",
              locale === code
                ? "border-brand bg-sun/25 text-foreground"
                : "border-ink/10 text-foreground/70 hover:border-ink/25",
            )}
          >
            {LOCALE_NAMES[code]}
          </button>
        ))}
      </div>
    </div>
  );
}
