import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type Consent = {
  essential: true;
  functional: boolean;
  marketing: boolean;
  decided_at: string;
  version: 1;
};

export const CONSENT_KEY = "dobra.consent";

export function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
}

const SERVICES: Record<"essential" | "functional" | "marketing", string[]> = {
  essential: ["Dobra sign-in & security", "Payments (Stripe)", "Language & cart storage"],
  functional: ["Google Maps", "Google Places address search", "Web Push notifications"],
  marketing: ["Google Ads", "Meta Pixel"],
};

type Cat = keyof typeof SERVICES;

export function ConsentDialog({
  open,
  onAccept,
  onDeny,
}: {
  open: boolean;
  onAccept: (c: Consent) => void;
  onDeny: () => void;
}) {
  const t = useT();
  const [tab, setTab] = useState<"categories" | "services">("categories");
  const [marketing, setMarketing] = useState(true);
  const [functional, setFunctional] = useState(true);
  const [expanded, setExpanded] = useState<Cat | null>(null);

  function finish(m: boolean, f: boolean) {
    const c: Consent = {
      essential: true,
      functional: f,
      marketing: m,
      decided_at: new Date().toISOString(),
      version: 1,
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(c));
    onAccept(c);
  }

  const cats: { key: Cat; value: boolean; set?: (v: boolean) => void }[] = [
    { key: "marketing", value: marketing, set: setMarketing },
    { key: "functional", value: functional, set: setFunctional },
    { key: "essential", value: true },
  ];

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-h-[90vh] max-w-md overflow-y-auto rounded-3xl p-0 [&>button]:hidden"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="p-6 pb-3">
          <DialogTitle className="text-xl font-bold">{t("auth.consent.title")}</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-foreground/70">
            {t("auth.consent.desc")}
          </DialogDescription>
          <div className="mt-3 flex gap-4 text-sm font-semibold">
            <Link to="/privacy" target="_blank" className="text-brand underline-offset-4 hover:underline">
              {t("auth.consent.privacy")}
            </Link>
            <Link to="/terms" target="_blank" className="text-brand underline-offset-4 hover:underline">
              {t("auth.consent.legal")}
            </Link>
          </div>
        </div>

        <div className="flex border-b border-border px-6">
          {(["categories", "services"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={cn(
                "-mb-px flex-1 border-b-2 py-2 text-sm font-semibold",
                tab === k ? "border-brand text-brand" : "border-transparent text-foreground/60",
              )}
            >
              {t(`auth.consent.${k}`)}
            </button>
          ))}
        </div>

        <div className="space-y-2 p-4">
          {cats.map(({ key, value, set }) => (
            <div key={key} className="rounded-2xl border border-border bg-card p-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setExpanded(expanded === key ? null : key)}
                  className="flex flex-1 items-center gap-2 text-left font-semibold"
                  aria-expanded={expanded === key}
                >
                  <ChevronDown
                    size={18}
                    className={cn("shrink-0 transition-transform", expanded === key && "rotate-180")}
                  />
                  {t(`auth.consent.${key}`)}
                </button>
                <Switch
                  checked={value}
                  disabled={!set}
                  onCheckedChange={(v) => set?.(v)}
                  aria-label={t(`auth.consent.${key}`)}
                  className={cn(!set && "opacity-50")}
                />
              </div>
              {tab === "categories" ? (
                <p className="mt-2 text-sm text-foreground/70">{t(`auth.consent.${key}Desc`)}</p>
              ) : (
                <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-foreground/70">
                  {SERVICES[key].map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              )}
              {expanded === key ? (
                <p className="mt-2 rounded-xl bg-muted p-2 text-xs text-foreground/70">
                  {t(`auth.consent.${key}More`)}
                  {!set ? ` · ${t("auth.consent.alwaysOn")}` : ""}
                </p>
              ) : null}
            </div>
          ))}
        </div>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onDeny}
              className="flex-1 py-2 text-sm font-semibold text-foreground/70 underline-offset-4 hover:underline"
            >
              {t("auth.consent.deny")}
            </button>
            <Button size="lg" className="flex-1" onClick={() => finish(true, true)}>
              {t("auth.consent.acceptAll")}
            </Button>
          </div>
          <button
            type="button"
            onClick={() => finish(marketing, functional)}
            className="mt-3 w-full text-center text-sm font-semibold text-brand underline-offset-4 hover:underline"
          >
            {t("auth.consent.save")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
