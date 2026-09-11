import { Check } from "lucide-react";

/**
 * Brief, full-screen brand confirmation shown for 1.5–2s after a milestone
 * (order placed, order delivered) before the underlying screen takes over.
 */
export function SuccessOverlay({
  title,
  subtitle,
  tone = "primary",
}: {
  title: string;
  subtitle?: string;
  tone?: "primary" | "sun";
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-background/95 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <span
        className={`flex size-24 items-center justify-center rounded-full shadow-lg animate-in zoom-in-50 duration-500 ${
          tone === "sun" ? "bg-sun text-ink" : "bg-primary text-primary-foreground"
        }`}
      >
        <Check className="size-12" strokeWidth={3} aria-hidden />
      </span>
      <div className="space-y-1 text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
        <p className="text-2xl font-bold text-foreground">{title}</p>
        {subtitle ? <p className="text-sm text-foreground/70">{subtitle}</p> : null}
      </div>
    </div>
  );
}
