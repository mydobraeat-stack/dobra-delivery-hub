import { useEffect, useRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

/** Mounted only while open: removing the portal also releases the modal scroll lock. */
export function DriverOfflineSheet({ onStayOnline, onGoOffline }: {
  onStayOnline: () => void;
  onGoOffline: () => void;
}) {
  const t = useT();
  const dismiss = useRef(onStayOnline);
  dismiss.current = onStayOnline;

  useEffect(() => {
    const marker = "dobraOfflineSheet";
    window.history.pushState({ ...window.history.state, [marker]: true }, "", window.location.href);
    const onBack = () => dismiss.current();
    window.addEventListener("popstate", onBack);
    return () => {
      window.removeEventListener("popstate", onBack);
      if (window.history.state?.[marker]) window.history.back();
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