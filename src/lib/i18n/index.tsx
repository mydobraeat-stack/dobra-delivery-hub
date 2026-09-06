import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import en from "./locales/en";
import pl from "./locales/pl";
import uk from "./locales/uk";
import fr from "./locales/fr";

export const LOCALES = ["en", "pl", "uk", "fr"] as const;
export type Locale = (typeof LOCALES)[number];

/** Language names shown in their own language. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  pl: "Polski",
  uk: "Українська",
  fr: "Français",
};

const INTL_LOCALE: Record<Locale, string> = {
  en: "en-GB",
  pl: "pl-PL",
  uk: "uk-UA",
  fr: "fr-FR",
};

const DICTIONARIES: Record<Locale, Record<string, unknown>> = { en, pl, uk, fr };

const STORAGE_KEY = "dobra.locale";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Picks a supported language from a browser/device language tag. */
export function detectLocale(tags: readonly string[]): Locale {
  for (const tag of tags) {
    const base = tag.toLowerCase().split("-")[0];
    if (isLocale(base)) return base;
  }
  return "en";
}

function lookup(dict: Record<string, unknown>, key: string): string | undefined {
  let node: unknown = dict;
  for (const part of key.split(".")) {
    if (typeof node !== "object" || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "string" ? node : undefined;
}

export type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

type I18nValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslateFn;
  formatMoney: (amount: number, currency?: string) => string;
  formatDate: (value: string | number | Date, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  // Detection runs after hydration so server and client render the same markup.
  useEffect(() => {
    let cancelled = false;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) {
      setLocaleState(stored);
    } else {
      const detected = detectLocale(navigator.languages ?? [navigator.language ?? "en"]);
      setLocaleState(detected);
      window.localStorage.setItem(STORAGE_KEY, detected);
    }

    // A saved profile preference wins over the device guess.
    void (async () => {
      const { data } = await supabase.auth.getUser();
      const id = data.user?.id;
      if (!id || cancelled) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("language")
        .eq("id", id)
        .maybeSingle();
      const saved = (profile as { language?: string | null } | null)?.language;
      if (!cancelled && isLocale(saved)) {
        setLocaleState(saved);
        window.localStorage.setItem(STORAGE_KEY, saved);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable */
    }
    void (async () => {
      const { data } = await supabase.auth.getUser();
      const id = data.user?.id;
      if (!id) return;
      await supabase.from("profiles").update({ language: next }).eq("id", id);
    })();
  }, []);

  const value = useMemo<I18nValue>(() => {
    const intl = INTL_LOCALE[locale];
    const t: TranslateFn = (key, vars) => {
      const raw = lookup(DICTIONARIES[locale], key) ?? lookup(en, key) ?? key;
      if (!vars) return raw;
      return raw.replace(/\{(\w+)\}/g, (m, name: string) =>
        vars[name] === undefined ? m : String(vars[name]),
      );
    };
    return {
      locale,
      setLocale,
      t,
      formatMoney: (amount, currency = "PLN") => {
        try {
          return new Intl.NumberFormat(intl, {
            style: "currency",
            currency,
            maximumFractionDigits: 2,
          }).format(Number(amount) || 0);
        } catch {
          return `${Number(amount).toFixed(2)} ${currency}`;
        }
      },
      formatDate: (v, options) =>
        new Intl.DateTimeFormat(intl, options ?? { dateStyle: "medium", timeStyle: "short" }).format(
          new Date(v),
        ),
      formatNumber: (v, options) => new Intl.NumberFormat(intl, options).format(v),
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}

/** Shorthand for components that only need the translate function. */
export function useT(): TranslateFn {
  return useI18n().t;
}
