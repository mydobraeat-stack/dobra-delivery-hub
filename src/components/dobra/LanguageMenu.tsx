import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LOCALES, LOCALE_NAMES, useI18n, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Compact language dropdown for the site header and app header. */
export function LanguageMenu({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("gap-1.5 px-2", className)}
          aria-label={t("common.language")}
        >
          <Globe className="size-4" aria-hidden />
          <span className="text-sm font-semibold">{LOCALE_NAMES[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        {LOCALES.map((code: Locale) => (
          <DropdownMenuItem
            key={code}
            lang={code}
            onSelect={() => setLocale(code)}
            className={cn("cursor-pointer", locale === code && "font-bold text-brand")}
          >
            {LOCALE_NAMES[code]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
