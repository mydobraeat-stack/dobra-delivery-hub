import { useLayoutEffect, useRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

/** Mounted only while open: unmounting releases the portal and modal scroll lock. */
export function DriverOfflineSheet({ onStayOnline, onGoOffline }: {
  onStayOnline: () => void;
  onGoOffline: () => void;
}) {
  const t = useT();
  const dismiss = useRef(onStayOnline);
  const historyCleanup = useRef<(() => void) | undefined>(undefined);
  const cleanupTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  dismiss.current = onStayOnline;
  useLayoutEffect(() => {
    clearTimeout(cleanupTimer.current);
    // Strict Mode replays effects; retain the same entry until a real unmount.
    if (historyCleanup.current) return () => {
      cleanupTimer.current = setTimeout(() => { historyCleanup.current?.(); historyCleanup.current = undefined; }, 0);
    };
    const marker = "dobraOfflineSheet";
    let popped = false;
    let closing = false;
    // A native same-document entry makes Back dismiss even on a direct app launch.
    // Bypass the router's push wrapper: this entry is modal state, not navigation.
    History.prototype.pushState.call(window.history, { ...window.history.state, [marker]: true }, "", window.location.href);
    const onBack = (event: PopStateEvent) => {
      event.stopImmediatePropagation();
      popped = true;
      window.removeEventListener("popstate", onBack, true);
      if (!closing) dismiss.current();
    };
    window.addEventListener("popstate", onBack, true);
    historyCleanup.current = () => {
      closing = true;
      if (!popped && window.history.state?.[marker]) window.history.back();
      else window.removeEventListener("popstate", onBack, true);
    };
    return () => {
      cleanupTimer.current = setTimeout(() => { historyCleanup.current?.(); historyCleanup.current = undefined; }, 0);
    };
  }, []);

  return <DialogPrimitive.Root open onOpenChange={(open) => { if (!open) onStayOnline(); }}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay data-driver-offline-backdrop className="fixed inset-0 z-50 bg-ink-solid/45" />
      <DialogPrimitive.Content className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 rounded-t-2xl border border-border bg-card px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6 shadow-soft">
        <DialogPrimitive.Title className="text-lg font-bold text-card-foreground">{t("driver.home.offlineConfirm")}</DialogPrimitive.Title>
        <DialogPrimitive.Description className="mt-2 text-sm text-muted-foreground">{t("driver.home.offlineConfirmBody")}</DialogPrimitive.Description>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-auto min-h-11 whitespace-normal px-3 py-2 text-sm" onClick={onStayOnline}>{t("driver.home.stayOnline")}</Button>
          <Button className="h-auto min-h-11 whitespace-normal px-3 py-2 text-sm" onClick={onGoOffline}>{t("driver.home.goOffline")}</Button>
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>;
}