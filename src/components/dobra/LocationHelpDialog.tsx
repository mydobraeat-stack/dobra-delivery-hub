import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LOCATION_HELP_EVENT, locateDevice } from "@/lib/device-location";
import { useT } from "@/lib/i18n";

type Device = "ios" | "android" | "safari" | "firefox" | "chrome";

function detectDevice(): Device {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  if (/Android/i.test(ua)) return "android";
  if (/Firefox/i.test(ua)) return "firefox";
  if (/Safari/i.test(ua) && !/Chrome|Chromium|Edg/i.test(ua)) return "safari";
  return "chrome";
}

/** Mounted once; opens when the device location is blocked and explains how to unblock it. */
export function LocationHelpDialog() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [device, setDevice] = useState<Device>("chrome");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const show = () => {
      setDevice(detectDevice());
      setOpen(true);
    };
    window.addEventListener(LOCATION_HELP_EVENT, show);
    return () => window.removeEventListener(LOCATION_HELP_EVENT, show);
  }, []);

  const steps = t(`common.location.help.${device}`).split("|");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary">
            <MapPin className="size-6 text-primary-foreground" aria-hidden />
          </div>
          <DialogTitle className="text-center">{t("common.location.help.title")}</DialogTitle>
          <DialogDescription className="text-center">{t("common.location.help.intro")}</DialogDescription>
        </DialogHeader>
        <ol className="list-decimal space-y-2 rounded-xl bg-muted p-4 pl-8 text-sm">
          {steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <div className="flex flex-col gap-2">
          <Button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await locateDevice();
                setOpen(false);
                window.dispatchEvent(new Event("dobra:location-granted"));
              } catch {
                /* still blocked; the dialog reopens via the event */
              } finally {
                setBusy(false);
              }
            }}
          >
            {t("common.location.help.retry")}
          </Button>
          <Button variant="ghost" onClick={() => window.location.reload()}>
            {t("common.location.help.reload")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
