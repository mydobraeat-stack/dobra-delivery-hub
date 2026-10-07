/**
 * ONE place for Dobra's legal/contact details. Every public page (footer,
 * contact, legal documents, policy pages) reads from here.
 * Leave a field "" until the real value is known — empty fields are never rendered.
 */
export const COMPANY = {
  legalName: "NICKOVWAY Sp. z o.o.",
  brand: "Dobra",
  street: "Ul. Jana III Sobieskiego 38",
  postalCity: "55-330 Lutynia",
  country: "Polska",
  nip: "", // 10 digits
  krs: "",
  regon: "",
  email: "", // public support email
  phone: "", // support phone, e.g. "+48 ..."
  /** Support hours per language; leave "" to hide. */
  hours: { en: "", pl: "", uk: "", fr: "" } as Record<"en" | "pl" | "uk" | "fr", string>,
};

export const companyAddress = () => `${COMPANY.street}, ${COMPANY.postalCity}`;
export const phoneHref = () => `tel:${COMPANY.phone.replace(/[^+\d]/g, "")}`;

/** Registration numbers that have values, e.g. ["NIP 123…", "KRS …"]. */
export function registryParts() {
  return [
    COMPANY.nip && `NIP ${COMPANY.nip}`,
    COMPANY.krs && `KRS ${COMPANY.krs}`,
    COMPANY.regon && `REGON ${COMPANY.regon}`,
  ].filter(Boolean) as string[];
}

const TOKENS: Record<string, () => string> = {
  KRS: () => (COMPANY.krs ? `KRS ${COMPANY.krs}` : ""),
  NIP: () => (COMPANY.nip ? `NIP ${COMPANY.nip}` : ""),
  REGON: () => (COMPANY.regon ? `REGON ${COMPANY.regon}` : ""),
  // No email yet: point to the real contact page instead of leaving a gap.
  EMAIL: () => COMPANY.email || "mydobra.pl/contact",
  PHONE: () => COMPANY.phone,
};

/**
 * Fills {KRS} {NIP} {REGON} {EMAIL} {PHONE} tokens in legal text. Missing values are
 * removed together with their separator; a sentence left as a dangling "label:" is dropped.
 */
export function fillCompany(text: string): string {
  if (!text.includes("{")) return text;
  const sentences = text.split(/(?<=[.!?])\s+(?=\S)/);
  const out: string[] = [];
  for (const s of sentences) {
    let r = s;
    for (const [k, get] of Object.entries(TOKENS)) {
      const v = get();
      if (v) r = r.split(`{${k}}`).join(v);
      else r = r.replace(new RegExp(`\\s*[,|·]?\\s*(e-mail\\s*:\\s*|tél\\.\\s*:\\s*|tel\\.\\s*)?\\{${k}\\}`, "g"), "");
    }
    r = r
      .replace(/^\s*[|,·]\s*/, "")
      .replace(/:\s*[|,·]\s*/g, ": ")
      .replace(/\s*[|,·]\s*([.)—])/g, "$1")
      .replace(/\s{2,}/g, " ")
      .trim();
    // Dangling label like "Kontakt w sprawach prywatności:." or "Obsługa Klienta: — ..."
    if (/:\s*[.]?$/.test(r) || /:\s*—/.test(r) || /^[^:]{0,80}:\s*\.$/.test(r)) continue;
    if (r) out.push(r.charAt(0).toUpperCase() + r.slice(1));
  }
  return out.join(" ");
}
