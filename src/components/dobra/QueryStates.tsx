import { useEffect, useState, type ReactNode } from "react";
import { RefreshCw, WifiOff, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

/** Shimmering placeholder rows shown while a list loads. */
export function ListSkeleton({ rows = 3, tall = false }: { rows?: number; tall?: boolean }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse rounded-2xl border border-ink/10 bg-muted ${tall ? "h-48" : "h-16"}`}
        />
      ))}
    </div>
  );
}

/** Friendly failure card with a retry button. */
export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  const t = useT();
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-6 text-center"
    >
      <WifiOff className="size-7 text-destructive" aria-hidden />
      <p className="text-sm text-foreground/80">{t("common.state.errorBody")}</p>
      {onRetry ? (
        <Button size="sm" variant="outline" onClick={onRetry} className="min-h-11">
          <RefreshCw className="size-4" aria-hidden /> {t("common.state.retry")}
        </Button>
      ) : null}
    </div>
  );
}

/** On-brand empty list message. */
export function EmptyState({
  message,
  icon,
  action,
}: {
  message: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink/15 px-5 py-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-sun/30 text-brand">
        {icon ?? <Inbox className="size-6" aria-hidden />}
      </span>
      <p className="text-sm text-foreground/70">{message}</p>
      {action}
    </div>
  );
}

/** Thin banner shown whenever the device loses its connection. */
export function OfflineBanner() {
  const t = useT();
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  if (!offline) return null;
  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-2 bg-destructive px-4 py-2 text-center text-xs font-medium text-destructive-foreground"
    >
      <WifiOff className="size-4" aria-hidden /> {t("common.state.offline")}
    </div>
  );
}
