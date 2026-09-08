import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { enablePush, pushSupported } from "@/lib/push";
import { useT } from "@/lib/i18n";

type State = "loading" | "unsupported" | "default" | "granted" | "denied";

export function PushSettings() {
  const t = useT();
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!pushSupported()) {
      setState("unsupported");
      return;
    }
    setState(Notification.permission as State);
  }, []);

  if (state === "loading") return null;

  const handleEnable = async () => {
    setBusy(true);
    const result = await enablePush();
    setBusy(false);
    if (result === "granted") {
      setState("granted");
      toast.success(t("common.push.enabled"));
    } else if (result === "denied") {
      setState("denied");
      toast.error(t("common.push.blocked"));
    } else {
      toast.error(t("common.push.error"));
    }
  };

  return (
    <Card className="border-ink/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BellRing className="size-4" aria-hidden />
          {t("common.push.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-foreground/70">{t("common.push.description")}</p>
        {state === "unsupported" ? (
          <p className="text-sm font-medium text-foreground/60">{t("common.push.unsupported")}</p>
        ) : state === "denied" ? (
          <p className="text-sm font-medium text-foreground/60">{t("common.push.blocked")}</p>
        ) : state === "granted" ? (
          <p className="text-sm font-medium text-foreground/80">{t("common.push.enabled")}</p>
        ) : (
          <Button onClick={handleEnable} disabled={busy} className="w-full">
            {t("common.push.enable")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
