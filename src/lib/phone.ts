/** Country calling codes for the markets Dobra operates in. */
export function dialCodeFor(country?: string | null): string {
  const c = (country ?? "").trim().toLowerCase();
  if (c.startsWith("cam") || c === "cm") return "+237";
  return "+48";
}

/** Strips spaces, dashes, dots and brackets; turns a leading 00 into +. */
export function normalizePhone(input: string): string {
  let v = input.replace(/[\s\-().]/g, "");
  if (v.startsWith("00")) v = `+${v.slice(2)}`;
  return v;
}

export type PhoneError = "required" | "format" | "length";

/**
 * Validates an international number. Poland (+48) and Cameroon (+237) must have
 * exactly 9 national digits; other codes accept 8–15 digits in total (E.164).
 */
export function validatePhone(input: string, required = true): PhoneError | null {
  const v = normalizePhone(input);
  if (!v || /^\+\d{0,4}$/.test(v) && !/^\+\d{5,}$/.test(v)) return required ? "required" : null;
  if (!/^\+[1-9]\d+$/.test(v)) return "format";
  if (v.startsWith("+48")) return v.length === 12 ? null : "length";
  if (v.startsWith("+237")) return v.length === 13 ? null : "length";
  return /^\+[1-9]\d{7,14}$/.test(v) ? null : "length";
}

/** True when the field holds only a dial code (treated as empty). */
export function isOnlyDialCode(input: string): boolean {
  return /^\+\d{0,4}$/.test(normalizePhone(input));
}
