/**
 * ONE place for Dobra's legal/contact details. Every public page (footer,
 * contact, legal documents, policy pages) reads from here.
 * Leave a field "" until the real value is known — empty fields are never rendered.
 */
export const COMPANY = {
  fullLegalName: "NICKOVWAY SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ",
  legalName: "NICKOVWAY Sp. z o.o.",
  brand: "Dobra",
  street: "ul. Jana III Sobieskiego 38",
  postalCity: "55-330 Lutynia",
  country: "Polska",
  nip: "8982251132", // 10 digits, no dashes
  krs: "0000791473",
  regon: "383675818",
  shareCapital: "5 000 PLN",
  email: "support@mydobra.pl", // customer support
  legalEmail: "legal@mydobra.pl", // legal / privacy
  phone: "+48 505 645 999",
  /** Support hours per language; leave "" to hide. */
  hours: {
    en: "Monday–Sunday, 10:00–22:00 (Central European Time)",
    pl: "Poniedziałek–niedziela, 10:00–22:00 (czasu środkowoeuropejskiego)",
    uk: "Понеділок–неділя, 10:00–22:00 (за центральноєвропейським часом)",
    fr: "Du lundi au dimanche, 10h00–22h00 (heure d’Europe centrale)",
  } as Record<"en" | "pl" | "uk" | "fr", string>,
};

export const companyAddress = () => `${COMPANY.street}, ${COMPANY.postalCity}, ${COMPANY.country}`;
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
  LEGAL_EMAIL: () => COMPANY.legalEmail || COMPANY.email || "mydobra.pl/contact",
  LEGAL_NAME: () => COMPANY.fullLegalName,
  SHORT_NAME: () => COMPANY.legalName,
  ADDRESS: () => `${COMPANY.street}, ${COMPANY.postalCity}`,
  CAPITAL: () => COMPANY.shareCapital,
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
