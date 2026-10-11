import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PhoneInput } from "@/components/dobra/PhoneInput";
import { useT } from "@/lib/i18n";
import { myProfileQuery, saveMyPhone } from "@/lib/my-profile";
import { myDriverQuery } from "@/lib/dobra";
import { validatePhone } from "@/lib/phone";

/** Driver's own phone number — required before going online. */
export function DriverPhoneCard({ compact, onSaved }: { compact?: boolean; onSaved?: () => void }) {
  const t = useT();
  const queryClient = useQueryClient();
  const { data: profile } = useQuery(myProfileQuery);
  const { data: driver } = useQuery(myDriverQuery);
  const [phone, setPhone] = useState("");
  const [tried, setTried] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (profile?.phone) setPhone(profile.phone);
  }, [profile?.phone]);

  const save = async () => {
    if (validatePhone(phone)) return setTried(true);
    setSaving(true);
    try {
      await saveMyPhone(phone);
      await queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      toast.success(t("calls.phone.saved"));
      onSaved?.();
    } catch {
      toast.error(t("calls.phone.error.format"));
    } finally {
      setSaving(false);
    }
  };

  const body = (
    <div className="space-y-3">
      {compact ? null : (
        <>
          <h2 className="text-lg font-bold text-foreground">{t("calls.driverPhone.title")}</h2>
          <p className="text-sm text-foreground/70">{t("calls.driverPhone.body")}</p>
        </>
      )}
      <PhoneInput
        id={compact ? "driver-phone-gate" : "driver-phone"}
        value={phone}
        onChange={setPhone}
        country={driver?.country ?? profile?.country}
        hint={t("calls.phone.driverHint")}
        showError={tried}
      />
      <Button onClick={save} disabled={saving} className={compact ? "w-full" : undefined}>
        {t("calls.driverPhone.save")}
      </Button>
    </div>
  );
  if (compact) return body;
  return (
    <Card className="border-ink/10">
      <CardContent className="py-4">{body}</CardContent>
    </Card>
  );
}
