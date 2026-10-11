import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/lib/i18n";
import { dialCodeFor, validatePhone } from "@/lib/phone";
import { useState } from "react";

type Props = {
  id: string;
  value: string;
  onChange: (v: string) => void;
  country?: string | null | undefined;
  label?: string;
  required?: boolean;
  hint?: string | undefined;
  /** Show the error even before the field is touched (e.g. after a submit attempt). */
  showError?: boolean;
};

/** International phone input; starts with the country's dial code and validates inline. */
export function PhoneInput({ id, value, onChange, country, label, required = true, hint, showError }: Props) {
  const t = useT();
  const [touched, setTouched] = useState(false);
  const error = validatePhone(value, required);
  const visible = (touched || showError) && error;
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label ?? t("calls.phone.label")}</Label>
      <Input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={value}
        placeholder={dialCodeFor(country) === "+237" ? "+237 6 71 23 45 67" : "+48 600 123 456"}
        onFocus={() => {
          if (!value) onChange(`${dialCodeFor(country)} `);
        }}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        aria-invalid={visible ? true : undefined}
        aria-describedby={`${id}-msg`}
      />
      <p id={`${id}-msg`} className={visible ? "text-xs text-destructive" : "text-xs text-foreground/60"}>
        {visible ? t(`calls.phone.error.${error}`) : (hint ?? t("calls.phone.hint"))}
      </p>
    </div>
  );
}
