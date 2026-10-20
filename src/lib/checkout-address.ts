export type ManualAddress = { street: string; building: string; apartment: string; city: string };

export function manualAddressComplete(value: ManualAddress) {
  return Boolean(value.street.trim() && value.building.trim() && value.city.trim());
}

export function formatManualAddress(value: ManualAddress) {
  return `${value.street.trim()} ${value.building.trim()}${value.apartment.trim() ? `/${value.apartment.trim()}` : ""}, ${value.city.trim()}`;
}

export const CHECKOUT_COPY = {
  en: { manual: "Enter address manually", search: "Search for an address", street: "Street", building: "Building number", apartment: "Apartment number (optional)", city: "City", other: "Other payment methods" },
  pl: { manual: "Wpisz adres ręcznie", search: "Wyszukaj adres", street: "Ulica", building: "Numer budynku", apartment: "Numer mieszkania (opcjonalnie)", city: "Miasto", other: "Inne metody płatności" },
  uk: { manual: "Ввести адресу вручну", search: "Знайти адресу", street: "Вулиця", building: "Номер будинку", apartment: "Номер квартири (необов’язково)", city: "Місто", other: "Інші способи оплати" },
  fr: { manual: "Saisir l’adresse manuellement", search: "Rechercher une adresse", street: "Rue", building: "Numéro du bâtiment", apartment: "Numéro d’appartement (facultatif)", city: "Ville", other: "Autres moyens de paiement" },
};