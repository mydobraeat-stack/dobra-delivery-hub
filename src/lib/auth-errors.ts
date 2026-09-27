type T = (key: string, vars?: Record<string, string | number>) => string;

/** Map raw auth error text to a friendly, translated message. */
export function friendlyAuthError(raw: string | undefined | null, t: T): string {
  const m = (raw ?? "").toLowerCase();
  if (m.includes("pwned") || m.includes("weak") || m.includes("easy to guess") || m.includes("known to be"))
    return t("auth.errors.weak");
  if (m.includes("at least 6") || m.includes("password should be")) return t("auth.errors.short");
  if (m.includes("invalid login") || m.includes("invalid credentials")) return t("auth.errors.invalid");
  if (m.includes("already registered") || m.includes("already exists")) return t("auth.errors.exists");
  if (m.includes("not confirmed")) return t("auth.errors.unconfirmed");
  if (m.includes("rate limit") || m.includes("too many") || m.includes("security purposes"))
    return t("auth.errors.rate");
  if (m.includes("invalid email") || m.includes("unable to validate email")) return t("auth.errors.email");
  if (m.includes("fetch") || m.includes("network")) return t("auth.errors.network");
  return t("auth.errors.generic");
}
