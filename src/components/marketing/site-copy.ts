import type { Locale } from "@/lib/i18n";

// Company details live in ONE place: src/lib/company.ts
export { COMPANY } from "@/lib/company";

export type PageSection = { h: string; p?: string[]; b?: string[] };
export type PublicPage = {
  title: string;
  intro: string;
  sections: PageSection[];
  cta?: { label: string; to: "/get-started" | "/contact" | "/complaints"; signup?: boolean };
};
export type PageKey = "about" | "partner" | "deliver" | "help" | "delivery" | "refunds" | "complaints";

type Copy = {
  soonTitle: string;
  soonBody: string;
  soonWeb: string;
  close: string;
  contact: string;
  company: string;
  complaints: string;
  refunds: string;
  delivery: string;
  policies: string;
  capital: string;
  howTitle: string;
  how: [string, string][];
  joinTitle: string;
  join: { title: string; body: string; cta: string }[];
  trustTitle: string;
  trust: [string, string][];
  faqTitle: string;
  faq: [string, string][];
  featuredTitle: string;
  featuredSub: string;
  featuredCta: string;
  deliveryFee: string;
  minutes: string;
  contactTitle: string;
  contactIntro: string;
  email: string;
  phone: string;
  address: string;
  hours: string;
  chatHint: string;
  formName: string;
  formEmail: string;
  formMessage: string;
  formSend: string;
  formSent: string;
  checkoutLegal: [string, string, string, string];
  live: {
    title: string;
    note: string;
    serviceFee: string;
    deliveryFee: string;
    minOrder: string;
    packageBase: string;
    packagePerKm: string;
    packageMin: string;
    commission: string;
    cities: string;
    none: string;
  };
  pages: Record<PageKey, PublicPage>;
};

const en: Copy = {
  capital: "Share capital",
  soonTitle: "Coming soon to the stores",
  soonBody:
    "The Dobra app is coming soon to the App Store and Google Play. For now, order directly at mydobra.pl — it works in any browser on your phone or computer.",
  soonWeb: "Order at mydobra.pl",
  close: "Close",
  contact: "Contact",
  company: "Company",
  complaints: "Complaints",
  refunds: "Refunds & cancellations",
  delivery: "Delivery policy",
  policies: "Policies",
  howTitle: "How Dobra works",
  how: [
    ["Choose a restaurant", "Browse local restaurants and their menus. Prices are in PLN, and the delivery fee and service fee are shown before you order."],
    ["Place your order", "Add dishes to your basket, enter your address and pay cash on delivery, or online where that option is shown at checkout."],
    ["Track your delivery", "The restaurant prepares your food and a Dobra courier brings it to you. You can follow the status of your order in the app."],
  ],
  joinTitle: "Grow with Dobra",
  join: [
    { title: "Order food", body: "Your favourite local dishes, delivered to your door.", cta: "Order now" },
    { title: "Add your restaurant", body: "Reach new customers and manage orders in one simple dashboard.", cta: "How it works" },
    { title: "Deliver with Dobra", body: "Choose when you work and see what you earn before you accept a delivery.", cta: "How it works" },
  ],
  trustTitle: "Safe and transparent",
  trust: [
    ["Secure payments", "Online payments are processed by a licensed payment provider. Dobra never sees or stores your full card number."],
    ["Clear prices", "Food prices, the delivery fee and the service fee are shown in PLN before you confirm your order."],
    ["Help when something goes wrong", "You can cancel an order before the restaurant accepts it, report a problem from the order screen and file a complaint."],
  ],
  faqTitle: "Frequently asked questions",
  faq: [
    ["How do I pay?", "You can pay cash to the courier on delivery. Online payment methods are offered at checkout where available."],
    ["Where does Dobra deliver?", "In the cities listed on this page. The list is updated whenever we start delivering somewhere new."],
    ["How much is delivery?", "Each restaurant has its own delivery fee, shown on the restaurant and again at checkout before you order. Dobra Prime members pay no delivery fee on food orders."],
    ["Can I cancel my order?", "Yes, you can cancel it yourself in the app until the restaurant accepts it. After that, contact us and we will help. Orders paid online are refunded to the original payment method."],
    ["How do I make a complaint?", "Use “Report a problem” on your order, or contact us using the details on the Contact page. You can also send a complaint by post."],
  ],
  featuredTitle: "Restaurants on Dobra",
  featuredSub: "Restaurants currently taking orders on Dobra.",
  featuredCta: "Order",
  deliveryFee: "Delivery",
  minutes: "min",
  contactTitle: "Contact us",
  contactIntro: "Questions about an order, a partnership or a payment? Here is how to reach us.",
  email: "Email",
  phone: "Phone",
  address: "Registered address",
  hours: "Support hours",
  chatHint: "Signed-in customers can also write to us from the support chat in the Dobra app (Profile → Help).",
  formName: "Your name",
  formEmail: "Your email",
  formMessage: "Message",
  formSend: "Send message",
  formSent: "Your email app will open with your message ready to send.",
  checkoutLegal: ["By placing the order you accept the ", "Terms of Service", " and confirm you have read the ", "Privacy Policy"],
  live: {
    title: "Current fees",
    note: "These amounts come straight from our live pricing settings and are the same ones used at checkout.",
    serviceFee: "Service fee per order",
    deliveryFee: "Default delivery fee (when a restaurant has not set its own)",
    minOrder: "Platform minimum order",
    packageBase: "Package delivery: base fee",
    packagePerKm: "Package delivery: per km",
    packageMin: "Package delivery: minimum fee",
    commission: "Dobra commission on order value",
    cities: "Cities we deliver to",
    none: "none",
  },
  pages: {
    about: {
      title: "About Dobra",
      intro: "Dobra is a food delivery platform that connects customers with local restaurants and independent couriers. Dobra is run by NICKOVWAY Sp. z o.o., based in Lutynia near Wrocław.",
      sections: [
        { h: "What we do", p: ["Customers order dishes from local restaurants on mydobra.pl. The restaurant prepares the order and a Dobra courier delivers it. We also offer package delivery between two addresses."] },
        { h: "Who we work with", b: ["Customers who want good local food without leaving home.", "Restaurants that want to reach more customers without building their own delivery service.", "Couriers who want flexible work and choose which deliveries they accept."] },
        { h: "Where we operate", p: ["We deliver in selected cities in Poland, and we are preparing to launch in Cameroon. The current list of cities is on our homepage and on the Cities page."] },
        { h: "How we work", p: ["Prices are always shown before you order. Restaurants and couriers are checked by our team before they can take orders. If something goes wrong, our support team is there to help."] },
      ],
      cta: { label: "Order now", to: "/get-started", signup: true },
    },
    partner: {
      title: "Add your restaurant to Dobra",
      intro: "Reach new customers in your city and receive orders in a simple online dashboard. Dobra couriers take care of the delivery.",
      sections: [
        { h: "How to join", b: ["1. Create a Dobra account and choose “I'm a Vendor”.", "2. Add your restaurant: name, cuisine, address, logo, delivery fee and minimum order.", "3. Add your menu with prices in PLN and photos.", "4. Our team reviews your restaurant. Once approved, it appears to customers and you can start receiving orders."] },
        { h: "Handling orders", b: ["New orders appear in your dashboard with a sound alert.", "You accept the order, prepare it and mark it ready for pickup.", "A courier collects it and delivers it to the customer.", "You can open or close the restaurant and edit the menu at any time."] },
        { h: "Costs", p: ["Dobra charges a commission on the value of each order. The current rate is shown below. There is no sign-up fee."] },
      ],
      cta: { label: "Sign up as a restaurant", to: "/get-started", signup: true },
    },
    deliver: {
      title: "Become a Dobra courier",
      intro: "Deliver orders from local restaurants in your city. Go online when it suits you and see what you will earn before you accept a delivery.",
      sections: [
        { h: "How to join", b: ["1. Create a Dobra account and choose “I'm a Driver”.", "2. Choose how you deliver: on foot, bicycle, e-bike, scooter, motorbike or car.", "3. Upload your documents: a selfie, an identity document, a photo of your delivery bag and, depending on the vehicle, a vehicle photo, driving licence, insurance and registration.", "4. Our team checks your documents. Once you are approved, you can go online and accept deliveries."] },
        { h: "How deliveries work", b: ["When you are online, new delivery offers appear with the amount you will earn.", "You accept an offer, pick up the order from the restaurant and deliver it to the customer.", "Your completed deliveries and earnings are shown in the app."] },
        { h: "What you need", b: ["A smartphone with internet access and location turned on.", "A valid identity document.", "An insulated delivery bag.", "For motorbike and car: a driving licence, insurance and vehicle registration."] },
      ],
      cta: { label: "Sign up as a courier", to: "/get-started", signup: true },
    },
    help: {
      title: "Help centre",
      intro: "Answers to the most common questions, and how to reach us when you need more help.",
      sections: [
        { h: "Orders", b: ["You can follow the status of your order on the order screen in the app.", "You can cancel an order yourself until the restaurant accepts it.", "If something is wrong with a delivered order, use “Report a problem” on the order screen."] },
        { h: "Payments", b: ["You can pay cash to the courier on delivery.", "Online payment methods are offered at checkout where available. Your order goes to the restaurant once the payment is confirmed.", "Refunds for online payments go back to the original payment method."] },
        { h: "Your account", b: ["You can change your name, phone, address and password under Profile → Account.", "You can change which privacy settings you agree to under Profile → Privacy settings.", "You can delete your account and personal data under Profile → Delete my account and data."] },
        { h: "Still need help?", p: ["See our Delivery, Refunds & cancellations and Complaints pages, or contact us using the details on the Contact page."] },
      ],
      cta: { label: "Contact us", to: "/contact" },
    },
    delivery: {
      title: "Delivery policy",
      intro: "How delivery works on Dobra: where we deliver, how fees are calculated and how long it takes.",
      sections: [
        { h: "Where we deliver", p: ["We deliver in the cities listed below. When you enter your address at checkout, you can only order from restaurants that are open and accepting orders."] },
        { h: "Delivery fees", b: ["Each restaurant sets its own delivery fee. It is shown on the restaurant and again at checkout.", "In some cities a fixed city delivery fee applies instead. If so, that is the fee shown at checkout.", "A service fee may be added to each order. The current amount is shown below and at checkout.", "Dobra Prime members pay no delivery fee on food orders.", "The total you see at checkout, in PLN, is the amount you pay."] },
        { h: "Minimum order", p: ["A restaurant may set a minimum order value. If your basket is below it, checkout tells you and you cannot place the order until you add more."] },
        { h: "Delivery times", p: ["Each restaurant shows an estimated delivery time. It is an estimate, not a guarantee: preparation time, traffic, weather and courier availability can affect it. You can follow your order's status in the app."] },
        { h: "Package delivery", p: ["You can also send a package between two addresses. The price is a base fee plus a per-kilometre amount, with a minimum fee, and is shown before you confirm."] },
        { h: "At the door", p: ["Please give a correct address and any access details, and keep your phone on so the courier can reach you."] },
      ],
    },
    refunds: {
      title: "Refunds & cancellations",
      intro: "When you can cancel an order, and how refunds are handled.",
      sections: [
        { h: "Cancelling an order yourself", p: ["You can cancel an order in the app while its status is “Pending”, that is, before the restaurant accepts it. Open the order and tap “Cancel order”."] },
        { h: "After the restaurant has accepted it", p: ["Once the restaurant has accepted the order and started preparing it, you can no longer cancel it in the app. Contact us and we will look at your case."] },
        { h: "When we cancel an order", p: ["Our team may cancel an order, for example if the restaurant cannot prepare it or no courier is available. If you paid online, you get a full refund."] },
        { h: "How refunds are paid", b: ["Online payments: the refund is sent automatically to the payment method you used. How long it takes to appear depends on your bank or payment provider.", "Cash payments: if you paid the courier and are owed money back, our support team arranges the refund with you.", "A refund can be full or partial, for example when only one item was missing."] },
        { h: "Problems with a delivered order", p: ["If items are missing, wrong or damaged, use “Report a problem” on the order screen as soon as possible, or file a complaint. See the Complaints page."] },
        { h: "Right of withdrawal", p: ["Prepared food is perishable, so the statutory 14-day right of withdrawal from distance contracts generally does not apply to it. This does not limit any rights you have under mandatory consumer law."] },
      ],
      cta: { label: "File a complaint", to: "/complaints" },
    },
    complaints: {
      title: "Complaints",
      intro: "If something went wrong with an order or with Dobra, you can file a complaint. We take every complaint seriously.",
      sections: [
        { h: "How to file a complaint", b: ["In the app: open the order and tap “Report a problem”.", "By email or phone: use the contact details on the Contact page.", "By post: write to the registered address shown below."] },
        { h: "What to include", b: ["Your name and the email address of your Dobra account.", "The order number, shown on the order screen.", "What happened. Photos help if items were missing or damaged.", "How you would like us to resolve it, for example a refund."] },
        { h: "Response time", p: ["We reply to complaints within 14 days of receiving them, as Polish consumer law requires, and usually much sooner. If we accept your complaint, we tell you how we will resolve it, for example with a full or partial refund."] },
        { h: "If you disagree with our decision", p: ["Consumers can use out-of-court complaint and redress procedures, for example through the consumer ombudsman (rzecznik konsumentów) or the provincial inspectorate of the Trade Inspection (Inspekcja Handlowa)."] },
      ],
      cta: { label: "Contact us", to: "/contact" },
    },
  },
};

const pl: Copy = {
  capital: "Kapitał zakładowy",
  soonTitle: "Wkrótce w sklepach z aplikacjami",
  soonBody:
    "Aplikacja Dobra już wkrótce trafi do App Store i Google Play. Na razie zamawiaj bezpośrednio na mydobra.pl — strona działa w każdej przeglądarce, na telefonie i komputerze.",
  soonWeb: "Zamów na mydobra.pl",
  close: "Zamknij",
  contact: "Kontakt",
  company: "Firma",
  complaints: "Reklamacje",
  refunds: "Zwroty i anulowanie",
  delivery: "Zasady dostawy",
  policies: "Zasady",
  howTitle: "Jak działa Dobra",
  how: [
    ["Wybierz restaurację", "Przeglądaj lokalne restauracje i ich menu. Ceny są w złotych, a opłata za dostawę i opłata serwisowa są widoczne przed złożeniem zamówienia."],
    ["Złóż zamówienie", "Dodaj dania do koszyka, podaj adres i zapłać gotówką przy odbiorze lub online, jeśli ta opcja jest dostępna przy zamówieniu."],
    ["Śledź dostawę", "Restauracja przygotowuje jedzenie, a kurier Dobra przywozi je pod Twoje drzwi. Status zamówienia sprawdzisz w aplikacji."],
  ],
  joinTitle: "Rozwijaj się z Dobra",
  join: [
    { title: "Zamów jedzenie", body: "Ulubione lokalne dania z dostawą pod drzwi.", cta: "Zamów teraz" },
    { title: "Dodaj swoją restaurację", body: "Docieraj do nowych klientów i obsługuj zamówienia w prostym panelu.", cta: "Jak to działa" },
    { title: "Dostarczaj z Dobra", body: "Sam decydujesz, kiedy pracujesz, a przed przyjęciem dostawy widzisz, ile zarobisz.", cta: "Jak to działa" },
  ],
  trustTitle: "Bezpiecznie i przejrzyście",
  trust: [
    ["Bezpieczne płatności", "Płatności online obsługuje licencjonowany dostawca usług płatniczych. Dobra nie widzi ani nie przechowuje pełnego numeru Twojej karty."],
    ["Jasne ceny", "Ceny dań, opłatę za dostawę i opłatę serwisową widzisz w złotych przed potwierdzeniem zamówienia."],
    ["Pomoc, gdy coś pójdzie nie tak", "Możesz anulować zamówienie, zanim restauracja je przyjmie, zgłosić problem z ekranu zamówienia i złożyć reklamację."],
  ],
  faqTitle: "Najczęściej zadawane pytania",
  faq: [
    ["Jak mogę zapłacić?", "Możesz zapłacić kurierowi gotówką przy odbiorze. Metody płatności online pojawiają się przy składaniu zamówienia, jeśli są dostępne."],
    ["Gdzie dowozi Dobra?", "W miastach wymienionych na tej stronie. Listę aktualizujemy, gdy tylko zaczynamy dowozić w nowym miejscu."],
    ["Ile kosztuje dostawa?", "Każda restauracja ustala własną opłatę za dostawę. Widzisz ją przy restauracji i ponownie przed złożeniem zamówienia. Członkowie Dobra Prime nie płacą za dostawę jedzenia."],
    ["Czy mogę anulować zamówienie?", "Tak, samodzielnie w aplikacji, dopóki restauracja go nie przyjmie. Później skontaktuj się z nami, a pomożemy. Za zamówienia opłacone online zwracamy pieniądze na pierwotną metodę płatności."],
    ["Jak złożyć reklamację?", "Użyj opcji „Zgłoś problem” przy zamówieniu albo skontaktuj się z nami, korzystając z danych na stronie Kontakt. Reklamację możesz też wysłać pocztą."],
  ],
  featuredTitle: "Restauracje w Dobra",
  featuredSub: "Restauracje, które obecnie przyjmują zamówienia w Dobra.",
  featuredCta: "Zamów",
  deliveryFee: "Dostawa",
  minutes: "min",
  contactTitle: "Kontakt",
  contactIntro: "Masz pytanie o zamówienie, współpracę lub płatność? Oto jak się z nami skontaktować.",
  email: "E-mail",
  phone: "Telefon",
  address: "Adres siedziby",
  hours: "Godziny obsługi",
  chatHint: "Zalogowani klienci mogą też napisać do nas na czacie pomocy w aplikacji Dobra (Profil → Pomoc).",
  formName: "Imię i nazwisko",
  formEmail: "Twój e-mail",
  formMessage: "Wiadomość",
  formSend: "Wyślij wiadomość",
  formSent: "Otworzy się Twój program pocztowy z gotową wiadomością do wysłania.",
  checkoutLegal: ["Składając zamówienie, akceptujesz ", "Regulamin", " i potwierdzasz zapoznanie się z ", "Polityką prywatności"],
  live: {
    title: "Aktualne opłaty",
    note: "Te kwoty pochodzą bezpośrednio z naszych aktualnych ustawień cen i są tymi samymi, które naliczamy przy zamówieniu.",
    serviceFee: "Opłata serwisowa za zamówienie",
    deliveryFee: "Domyślna opłata za dostawę (gdy restauracja nie ustaliła własnej)",
    minOrder: "Minimalna wartość zamówienia na platformie",
    packageBase: "Dostawa paczki: opłata podstawowa",
    packagePerKm: "Dostawa paczki: za każdy km",
    packageMin: "Dostawa paczki: opłata minimalna",
    commission: "Prowizja Dobra od wartości zamówienia",
    cities: "Miasta, w których dowozimy",
    none: "brak",
  },
  pages: {
    about: {
      title: "O Dobra",
      intro: "Dobra to platforma dostawy jedzenia, która łączy klientów z lokalnymi restauracjami i niezależnymi kurierami. Dobra prowadzi spółka NICKOVWAY Sp. z o.o. z siedzibą w Lutyni pod Wrocławiem.",
      sections: [
        { h: "Czym się zajmujemy", p: ["Klienci zamawiają dania z lokalnych restauracji na mydobra.pl. Restauracja przygotowuje zamówienie, a kurier Dobra je dostarcza. Oferujemy też dostawę paczek między dwoma adresami."] },
        { h: "Z kim współpracujemy", b: ["Z klientami, którzy chcą zjeść coś dobrego bez wychodzenia z domu.", "Z restauracjami, które chcą dotrzeć do większej liczby klientów bez budowania własnej dostawy.", "Z kurierami, którzy cenią elastyczną pracę i sami wybierają, które dostawy przyjmują."] },
        { h: "Gdzie działamy", p: ["Dowozimy w wybranych miastach w Polsce i przygotowujemy start w Kamerunie. Aktualna lista miast jest na stronie głównej i na stronie Miasta."] },
        { h: "Jak pracujemy", p: ["Ceny zawsze widać przed złożeniem zamówienia. Restauracje i kurierzy są weryfikowani przez nasz zespół, zanim zaczną przyjmować zamówienia. Gdy coś pójdzie nie tak, nasz zespół wsparcia pomoże."] },
      ],
      cta: { label: "Zamów teraz", to: "/get-started", signup: true },
    },
    partner: {
      title: "Dodaj swoją restaurację do Dobra",
      intro: "Docieraj do nowych klientów w swoim mieście i przyjmuj zamówienia w prostym panelu online. Dostawą zajmują się kurierzy Dobra.",
      sections: [
        { h: "Jak dołączyć", b: ["1. Załóż konto Dobra i wybierz „Jestem restauratorem”.", "2. Dodaj restaurację: nazwę, rodzaj kuchni, adres, logo, opłatę za dostawę i minimalną wartość zamówienia.", "3. Dodaj menu z cenami w złotych i zdjęciami.", "4. Nasz zespół weryfikuje restaurację. Po zatwierdzeniu staje się widoczna dla klientów i możesz przyjmować zamówienia."] },
        { h: "Obsługa zamówień", b: ["Nowe zamówienia pojawiają się w panelu wraz z sygnałem dźwiękowym.", "Przyjmujesz zamówienie, przygotowujesz je i oznaczasz jako gotowe do odbioru.", "Kurier odbiera zamówienie i dostarcza je klientowi.", "W każdej chwili możesz otworzyć lub zamknąć restaurację i edytować menu."] },
        { h: "Koszty", p: ["Dobra pobiera prowizję od wartości każdego zamówienia. Aktualna stawka jest podana poniżej. Nie pobieramy opłaty za rejestrację."] },
      ],
      cta: { label: "Zarejestruj restaurację", to: "/get-started", signup: true },
    },
    deliver: {
      title: "Zostań kurierem Dobra",
      intro: "Dostarczaj zamówienia z lokalnych restauracji w swoim mieście. Włączaj się, kiedy Ci pasuje, i przed przyjęciem dostawy sprawdzaj, ile zarobisz.",
      sections: [
        { h: "Jak dołączyć", b: ["1. Załóż konto Dobra i wybierz „Jestem kurierem”.", "2. Wybierz sposób dostarczania: pieszo, rowerem, rowerem elektrycznym, hulajnogą, motocyklem lub samochodem.", "3. Prześlij dokumenty: selfie, dokument tożsamości, zdjęcie torby termicznej oraz, zależnie od pojazdu, zdjęcie pojazdu, prawo jazdy, ubezpieczenie i dowód rejestracyjny.", "4. Nasz zespół sprawdza dokumenty. Po zatwierdzeniu możesz przejść w tryb online i przyjmować dostawy."] },
        { h: "Jak wyglądają dostawy", b: ["Gdy jesteś online, pojawiają się oferty dostaw wraz z kwotą, którą zarobisz.", "Przyjmujesz ofertę, odbierasz zamówienie z restauracji i dostarczasz je klientowi.", "Zrealizowane dostawy i zarobki widzisz w aplikacji."] },
        { h: "Czego potrzebujesz", b: ["Smartfona z dostępem do internetu i włączoną lokalizacją.", "Ważnego dokumentu tożsamości.", "Torby termicznej.", "Przy motocyklu i samochodzie: prawa jazdy, ubezpieczenia i dowodu rejestracyjnego."] },
      ],
      cta: { label: "Zarejestruj się jako kurier", to: "/get-started", signup: true },
    },
    help: {
      title: "Centrum pomocy",
      intro: "Odpowiedzi na najczęstsze pytania i informacje, jak się z nami skontaktować, gdy potrzebujesz więcej pomocy.",
      sections: [
        { h: "Zamówienia", b: ["Status zamówienia sprawdzisz na ekranie zamówienia w aplikacji.", "Zamówienie możesz anulować samodzielnie, dopóki restauracja go nie przyjmie.", "Jeśli z dostarczonym zamówieniem jest coś nie tak, użyj opcji „Zgłoś problem” na ekranie zamówienia."] },
        { h: "Płatności", b: ["Możesz zapłacić kurierowi gotówką przy odbiorze.", "Metody płatności online pojawiają się przy składaniu zamówienia, jeśli są dostępne. Zamówienie trafia do restauracji po potwierdzeniu płatności.", "Zwroty za płatności online trafiają na pierwotną metodę płatności."] },
        { h: "Twoje konto", b: ["Imię, telefon, adres i hasło zmienisz w Profil → Konto.", "Zgody dotyczące prywatności zmienisz w Profil → Ustawienia prywatności.", "Konto i dane osobowe usuniesz w Profil → Usuń konto i dane."] },
        { h: "Nadal potrzebujesz pomocy?", p: ["Zajrzyj na strony Zasady dostawy, Zwroty i anulowanie oraz Reklamacje albo skontaktuj się z nami, korzystając z danych na stronie Kontakt."] },
      ],
      cta: { label: "Skontaktuj się z nami", to: "/contact" },
    },
    delivery: {
      title: "Zasady dostawy",
      intro: "Jak działa dostawa w Dobra: gdzie dowozimy, jak liczymy opłaty i ile to trwa.",
      sections: [
        { h: "Gdzie dowozimy", p: ["Dowozimy w miastach wymienionych poniżej. Zamówić można tylko z restauracji, które są otwarte i przyjmują zamówienia."] },
        { h: "Opłaty za dostawę", b: ["Każda restauracja ustala własną opłatę za dostawę. Widać ją przy restauracji i ponownie przed złożeniem zamówienia.", "W niektórych miastach obowiązuje stała miejska opłata za dostawę. Wtedy to ona jest pokazana przy zamówieniu.", "Do zamówienia może zostać doliczona opłata serwisowa. Jej aktualna wysokość jest podana poniżej i przy zamówieniu.", "Członkowie Dobra Prime nie płacą za dostawę jedzenia.", "Kwota widoczna przy zamówieniu, w złotych, to kwota, którą płacisz."] },
        { h: "Minimalna wartość zamówienia", p: ["Restauracja może ustalić minimalną wartość zamówienia. Jeśli koszyk jej nie osiąga, zobaczysz informację i nie złożysz zamówienia, dopóki czegoś nie dodasz."] },
        { h: "Czas dostawy", p: ["Każda restauracja podaje przewidywany czas dostawy. To szacunek, a nie gwarancja: wpływają na niego czas przygotowania, ruch, pogoda i dostępność kurierów. Status zamówienia możesz śledzić w aplikacji."] },
        { h: "Dostawa paczek", p: ["Możesz też wysłać paczkę między dwoma adresami. Cena to opłata podstawowa plus kwota za każdy kilometr, z opłatą minimalną, i jest widoczna przed potwierdzeniem."] },
        { h: "Przy odbiorze", p: ["Podaj prawidłowy adres i informacje o dojściu oraz miej włączony telefon, aby kurier mógł się z Tobą skontaktować."] },
      ],
    },
    refunds: {
      title: "Zwroty i anulowanie",
      intro: "Kiedy możesz anulować zamówienie i jak realizujemy zwroty.",
      sections: [
        { h: "Samodzielne anulowanie", p: ["Zamówienie możesz anulować w aplikacji, dopóki ma status „Oczekujące”, czyli zanim restauracja je przyjmie. Otwórz zamówienie i wybierz „Anuluj zamówienie”."] },
        { h: "Po przyjęciu przez restaurację", p: ["Gdy restauracja przyjmie zamówienie i zacznie je przygotowywać, nie można już anulować go w aplikacji. Skontaktuj się z nami, a rozpatrzymy Twoją sprawę."] },
        { h: "Gdy to my anulujemy zamówienie", p: ["Nasz zespół może anulować zamówienie, na przykład gdy restauracja nie może go przygotować lub brakuje dostępnego kuriera. Jeśli zapłaciłeś online, otrzymasz pełny zwrot."] },
        { h: "Jak zwracamy pieniądze", b: ["Płatności online: zwrot trafia automatycznie na metodę płatności, której użyłeś. Czas zaksięgowania zależy od Twojego banku lub dostawcy płatności.", "Płatności gotówką: jeśli zapłaciłeś kurierowi i należy Ci się zwrot, nasz zespół wsparcia ustali z Tobą sposób jego przekazania.", "Zwrot może być pełny lub częściowy, na przykład gdy zabrakło tylko jednej pozycji."] },
        { h: "Problemy z dostarczonym zamówieniem", p: ["Jeśli brakuje pozycji lub są niewłaściwe albo uszkodzone, jak najszybciej użyj opcji „Zgłoś problem” na ekranie zamówienia albo złóż reklamację. Szczegóły znajdziesz na stronie Reklamacje."] },
        { h: "Prawo odstąpienia od umowy", p: ["Przygotowane jedzenie jest produktem szybko psującym się, dlatego ustawowe 14-dniowe prawo odstąpienia od umowy zawartej na odległość co do zasady go nie obejmuje. Nie ogranicza to praw, które przysługują Ci na podstawie bezwzględnie obowiązujących przepisów."] },
      ],
      cta: { label: "Złóż reklamację", to: "/complaints" },
    },
    complaints: {
      title: "Reklamacje",
      intro: "Jeśli coś poszło nie tak z zamówieniem lub z działaniem Dobra, możesz złożyć reklamację. Każdą traktujemy poważnie.",
      sections: [
        { h: "Jak złożyć reklamację", b: ["W aplikacji: otwórz zamówienie i wybierz „Zgłoś problem”.", "E-mailem lub telefonicznie: skorzystaj z danych na stronie Kontakt.", "Pocztą: napisz na adres siedziby podany poniżej."] },
        { h: "Co warto podać", b: ["Imię i nazwisko oraz adres e-mail konta Dobra.", "Numer zamówienia widoczny na ekranie zamówienia.", "Opis sytuacji. Zdjęcia pomagają, gdy brakuje pozycji lub są uszkodzone.", "Oczekiwany sposób rozwiązania, na przykład zwrot pieniędzy."] },
        { h: "Termin odpowiedzi", p: ["Na reklamacje odpowiadamy w ciągu 14 dni od ich otrzymania, zgodnie z polskim prawem konsumenckim, a zwykle znacznie szybciej. Jeśli uznamy reklamację, poinformujemy Cię, jak ją rozwiążemy, na przykład przez pełny lub częściowy zwrot."] },
        { h: "Jeśli nie zgadzasz się z decyzją", p: ["Konsument może skorzystać z pozasądowych sposobów rozpatrywania reklamacji i dochodzenia roszczeń, na przykład z pomocy miejskiego lub powiatowego rzecznika konsumentów albo wojewódzkiego inspektoratu Inspekcji Handlowej."] },
      ],
      cta: { label: "Skontaktuj się z nami", to: "/contact" },
    },
  },
};

const uk: Copy = {
  capital: "Статутний капітал",
  soonTitle: "Незабаром у магазинах застосунків",
  soonBody:
    "Застосунок Dobra незабаром з’явиться в App Store і Google Play. А поки що замовляйте прямо на mydobra.pl — сайт працює в будь-якому браузері на телефоні чи комп’ютері.",
  soonWeb: "Замовити на mydobra.pl",
  close: "Закрити",
  contact: "Контакти",
  company: "Компанія",
  complaints: "Скарги",
  refunds: "Повернення та скасування",
  delivery: "Умови доставки",
  policies: "Правила",
  howTitle: "Як працює Dobra",
  how: [
    ["Оберіть ресторан", "Переглядайте місцеві ресторани та їхнє меню. Ціни вказані в злотих, а вартість доставки й сервісний збір видно до оформлення замовлення."],
    ["Оформіть замовлення", "Додайте страви в кошик, вкажіть адресу й оплатіть готівкою при отриманні або онлайн, якщо цей спосіб доступний під час оформлення."],
    ["Стежте за доставкою", "Ресторан готує їжу, а кур’єр Dobra привозить її до ваших дверей. Статус замовлення видно в застосунку."],
  ],
  joinTitle: "Розвивайтеся з Dobra",
  join: [
    { title: "Замовити їжу", body: "Улюблені місцеві страви з доставкою до дверей.", cta: "Замовити" },
    { title: "Додати ресторан", body: "Знаходьте нових клієнтів і керуйте замовленнями в простій панелі.", cta: "Як це працює" },
    { title: "Доставляти з Dobra", body: "Обирайте, коли працювати, і бачте заробіток ще до прийняття доставки.", cta: "Як це працює" },
  ],
  trustTitle: "Безпечно й прозоро",
  trust: [
    ["Безпечні платежі", "Онлайн-платежі обробляє ліцензований платіжний провайдер. Dobra не бачить і не зберігає повний номер вашої картки."],
    ["Зрозумілі ціни", "Ціни страв, вартість доставки та сервісний збір видно в злотих до підтвердження замовлення."],
    ["Допомога, якщо щось пішло не так", "Ви можете скасувати замовлення, доки ресторан його не прийняв, повідомити про проблему з екрана замовлення та подати скаргу."],
  ],
  faqTitle: "Поширені запитання",
  faq: [
    ["Як оплатити?", "Можна оплатити кур’єру готівкою при отриманні. Онлайн-способи оплати пропонуються під час оформлення, якщо вони доступні."],
    ["Куди доставляє Dobra?", "У міста, перелічені на цій сторінці. Ми оновлюємо список, щойно починаємо доставляти в нове місто."],
    ["Скільки коштує доставка?", "Кожен ресторан встановлює власну вартість доставки. Її видно на сторінці ресторану й ще раз перед оформленням. Учасники Dobra Prime не платять за доставку їжі."],
    ["Чи можна скасувати замовлення?", "Так, самостійно в застосунку, доки ресторан його не прийняв. Після цього зв’яжіться з нами, і ми допоможемо. За замовлення, оплачені онлайн, кошти повертаються на початковий спосіб оплати."],
    ["Як подати скаргу?", "Скористайтеся кнопкою «Повідомити про проблему» в замовленні або зв’яжіться з нами за даними на сторінці «Контакти». Скаргу також можна надіслати поштою."],
  ],
  featuredTitle: "Ресторани в Dobra",
  featuredSub: "Ресторани, які зараз приймають замовлення в Dobra.",
  featuredCta: "Замовити",
  deliveryFee: "Доставка",
  minutes: "хв",
  contactTitle: "Контакти",
  contactIntro: "Маєте запитання щодо замовлення, співпраці чи оплати? Ось як з нами зв’язатися.",
  email: "Ел. пошта",
  phone: "Телефон",
  address: "Юридична адреса",
  hours: "Години підтримки",
  chatHint: "Клієнти, які увійшли в акаунт, також можуть написати нам у чат підтримки в застосунку Dobra (Профіль → Допомога).",
  formName: "Ваше ім’я",
  formEmail: "Ваш e-mail",
  formMessage: "Повідомлення",
  formSend: "Надіслати",
  formSent: "Відкриється ваш поштовий застосунок із готовим повідомленням.",
  checkoutLegal: ["Оформлюючи замовлення, ви приймаєте ", "Умови користування", " і підтверджуєте, що ознайомилися з ", "Політикою конфіденційності"],
  live: {
    title: "Поточні збори",
    note: "Ці суми беруться безпосередньо з наших чинних налаштувань цін і збігаються з тими, що застосовуються під час оформлення.",
    serviceFee: "Сервісний збір за замовлення",
    deliveryFee: "Типова вартість доставки (якщо ресторан не встановив власну)",
    minOrder: "Мінімальне замовлення на платформі",
    packageBase: "Доставка посилки: базовий тариф",
    packagePerKm: "Доставка посилки: за км",
    packageMin: "Доставка посилки: мінімальна вартість",
    commission: "Комісія Dobra від вартості замовлення",
    cities: "Міста, де ми доставляємо",
    none: "немає",
  },
  pages: {
    about: {
      title: "Про Dobra",
      intro: "Dobra — платформа доставки їжі, що поєднує клієнтів із місцевими ресторанами та незалежними кур’єрами. Dobra керує компанія NICKOVWAY Sp. z o.o. з Лютині поблизу Вроцлава.",
      sections: [
        { h: "Що ми робимо", p: ["Клієнти замовляють страви з місцевих ресторанів на mydobra.pl. Ресторан готує замовлення, а кур’єр Dobra його доставляє. Також ми пропонуємо доставку посилок між двома адресами."] },
        { h: "З ким ми працюємо", b: ["З клієнтами, які хочуть смачно поїсти, не виходячи з дому.", "З ресторанами, які хочуть залучити більше клієнтів без власної служби доставки.", "З кур’єрами, які цінують гнучкий графік і самі обирають доставки."] },
        { h: "Де ми працюємо", p: ["Ми доставляємо в окремих містах Польщі й готуємо запуск у Камеруні. Актуальний список міст — на головній сторінці та на сторінці «Міста»."] },
        { h: "Як ми працюємо", p: ["Ціни завжди видно до оформлення замовлення. Ресторани й кур’єри проходять перевірку нашої команди, перш ніж почати приймати замовлення. Якщо щось піде не так, наша служба підтримки допоможе."] },
      ],
      cta: { label: "Замовити", to: "/get-started", signup: true },
    },
    partner: {
      title: "Додайте свій ресторан до Dobra",
      intro: "Знаходьте нових клієнтів у своєму місті та приймайте замовлення в простій онлайн-панелі. Доставкою займаються кур’єри Dobra.",
      sections: [
        { h: "Як приєднатися", b: ["1. Створіть акаунт Dobra й оберіть «Я ресторатор».", "2. Додайте ресторан: назву, кухню, адресу, логотип, вартість доставки та мінімальне замовлення.", "3. Додайте меню з цінами в злотих і фото.", "4. Наша команда перевіряє ресторан. Після схвалення його бачать клієнти, і ви можете приймати замовлення."] },
        { h: "Обробка замовлень", b: ["Нові замовлення з’являються в панелі зі звуковим сигналом.", "Ви приймаєте замовлення, готуєте його й позначаєте як готове до видачі.", "Кур’єр забирає замовлення й доставляє клієнту.", "Ви можете будь-коли відкрити чи закрити ресторан і змінити меню."] },
        { h: "Вартість", p: ["Dobra бере комісію з вартості кожного замовлення. Поточну ставку вказано нижче. Плати за реєстрацію немає."] },
      ],
      cta: { label: "Зареєструвати ресторан", to: "/get-started", signup: true },
    },
    deliver: {
      title: "Станьте кур’єром Dobra",
      intro: "Доставляйте замовлення з місцевих ресторанів у своєму місті. Виходьте онлайн, коли зручно, і бачте заробіток до прийняття доставки.",
      sections: [
        { h: "Як приєднатися", b: ["1. Створіть акаунт Dobra й оберіть «Я кур’єр».", "2. Оберіть спосіб доставки: пішки, велосипед, електровелосипед, самокат, мотоцикл або авто.", "3. Завантажте документи: селфі, документ, що посвідчує особу, фото термосумки та, залежно від транспорту, фото транспорту, посвідчення водія, страховку й техпаспорт.", "4. Наша команда перевіряє документи. Після схвалення ви можете вийти онлайн і приймати доставки."] },
        { h: "Як відбуваються доставки", b: ["Коли ви онлайн, з’являються пропозиції доставок із сумою, яку ви заробите.", "Ви приймаєте пропозицію, забираєте замовлення в ресторані й доставляєте клієнту.", "Виконані доставки й заробіток видно в застосунку."] },
        { h: "Що потрібно", b: ["Смартфон з інтернетом і увімкненою геолокацією.", "Дійсний документ, що посвідчує особу.", "Термосумка.", "Для мотоцикла й авто: посвідчення водія, страховка й техпаспорт."] },
      ],
      cta: { label: "Зареєструватися кур’єром", to: "/get-started", signup: true },
    },
    help: {
      title: "Центр допомоги",
      intro: "Відповіді на найпоширеніші запитання та як зв’язатися з нами, якщо потрібна додаткова допомога.",
      sections: [
        { h: "Замовлення", b: ["Статус замовлення видно на екрані замовлення в застосунку.", "Замовлення можна скасувати самостійно, доки ресторан його не прийняв.", "Якщо з доставленим замовленням щось не так, скористайтеся кнопкою «Повідомити про проблему»."] },
        { h: "Оплата", b: ["Можна оплатити кур’єру готівкою при отриманні.", "Онлайн-способи оплати пропонуються під час оформлення, якщо доступні. Замовлення надходить до ресторану після підтвердження оплати.", "Повернення за онлайн-платежі надходять на початковий спосіб оплати."] },
        { h: "Ваш акаунт", b: ["Ім’я, телефон, адресу й пароль можна змінити в Профіль → Акаунт.", "Налаштування конфіденційності — у Профіль → Налаштування конфіденційності.", "Видалити акаунт і персональні дані можна в Профіль → Видалити акаунт і дані."] },
        { h: "Потрібна ще допомога?", p: ["Перегляньте сторінки «Умови доставки», «Повернення та скасування» і «Скарги» або зв’яжіться з нами за даними на сторінці «Контакти»."] },
      ],
      cta: { label: "Зв’язатися з нами", to: "/contact" },
    },
    delivery: {
      title: "Умови доставки",
      intro: "Як працює доставка в Dobra: куди ми доставляємо, як розраховуються збори і скільки це триває.",
      sections: [
        { h: "Куди ми доставляємо", p: ["Ми доставляємо в міста, перелічені нижче. Замовити можна лише в ресторанах, які відкриті й приймають замовлення."] },
        { h: "Вартість доставки", b: ["Кожен ресторан встановлює власну вартість доставки. Її видно на сторінці ресторану й під час оформлення.", "У деяких містах діє фіксована міська вартість доставки. Тоді саме вона показується під час оформлення.", "До замовлення може додаватися сервісний збір. Його поточна сума вказана нижче й під час оформлення.", "Учасники Dobra Prime не платять за доставку їжі.", "Сума, яку ви бачите під час оформлення, у злотих, — це сума до сплати."] },
        { h: "Мінімальне замовлення", p: ["Ресторан може встановити мінімальну суму замовлення. Якщо кошик менший, ви побачите повідомлення й не зможете оформити замовлення, доки не додасте більше."] },
        { h: "Час доставки", p: ["Кожен ресторан показує орієнтовний час доставки. Це оцінка, а не гарантія: на неї впливають час приготування, затори, погода й наявність кур’єрів. Статус замовлення можна відстежувати в застосунку."] },
        { h: "Доставка посилок", p: ["Ви також можете надіслати посилку між двома адресами. Ціна складається з базового тарифу та суми за кілометр, з мінімальною вартістю, і видна до підтвердження."] },
        { h: "Під час отримання", p: ["Вкажіть правильну адресу й деталі доступу та тримайте телефон увімкненим, щоб кур’єр міг з вами зв’язатися."] },
      ],
    },
    refunds: {
      title: "Повернення та скасування",
      intro: "Коли можна скасувати замовлення і як здійснюються повернення.",
      sections: [
        { h: "Самостійне скасування", p: ["Замовлення можна скасувати в застосунку, поки воно має статус «Очікує», тобто до того, як ресторан його прийме. Відкрийте замовлення й натисніть «Скасувати замовлення»."] },
        { h: "Після прийняття рестораном", p: ["Коли ресторан прийняв замовлення й почав готувати, скасувати його в застосунку вже не можна. Зв’яжіться з нами, і ми розглянемо вашу ситуацію."] },
        { h: "Коли замовлення скасовуємо ми", p: ["Наша команда може скасувати замовлення, наприклад якщо ресторан не може його приготувати або немає вільного кур’єра. Якщо ви оплатили онлайн, ви отримаєте повне повернення."] },
        { h: "Як повертаються кошти", b: ["Онлайн-платежі: кошти автоматично повертаються на використаний спосіб оплати. Термін зарахування залежить від вашого банку чи платіжного провайдера.", "Оплата готівкою: якщо ви заплатили кур’єру й маєте отримати повернення, служба підтримки домовиться з вами про спосіб.", "Повернення може бути повним або частковим, наприклад якщо бракувало лише однієї позиції."] },
        { h: "Проблеми з доставленим замовленням", p: ["Якщо позицій бракує, вони неправильні чи пошкоджені, якнайшвидше скористайтеся кнопкою «Повідомити про проблему» або подайте скаргу. Див. сторінку «Скарги»."] },
        { h: "Право на відмову від договору", p: ["Приготована їжа є товаром, що швидко псується, тому законне 14-денне право на відмову від дистанційного договору зазвичай на неї не поширюється. Це не обмежує прав, які ви маєте згідно з імперативними нормами права."] },
      ],
      cta: { label: "Подати скаргу", to: "/complaints" },
    },
    complaints: {
      title: "Скарги",
      intro: "Якщо щось пішло не так із замовленням або з роботою Dobra, ви можете подати скаргу. Ми серйозно ставимося до кожної.",
      sections: [
        { h: "Як подати скаргу", b: ["У застосунку: відкрийте замовлення й натисніть «Повідомити про проблему».", "Електронною поштою чи телефоном: скористайтеся даними на сторінці «Контакти».", "Поштою: напишіть на юридичну адресу, вказану нижче."] },
        { h: "Що вказати", b: ["Ваше ім’я та e-mail акаунта Dobra.", "Номер замовлення з екрана замовлення.", "Опис ситуації. Фото допоможуть, якщо позицій бракує чи вони пошкоджені.", "Бажаний спосіб вирішення, наприклад повернення коштів."] },
        { h: "Термін відповіді", p: ["Ми відповідаємо на скарги протягом 14 днів з моменту отримання, як вимагає польське законодавство про захист прав споживачів, а зазвичай значно швидше. Якщо скаргу визнано, ми повідомимо, як її вирішимо, наприклад повним чи частковим поверненням."] },
        { h: "Якщо ви не згодні з рішенням", p: ["Споживач може скористатися позасудовими способами розгляду скарг, наприклад допомогою міського чи повітового омбудсмена із захисту прав споживачів (rzecznik konsumentów) або воєводської Торгової інспекції (Inspekcja Handlowa)."] },
      ],
      cta: { label: "Зв’язатися з нами", to: "/contact" },
    },
  },
};

const fr: Copy = {
  capital: "Capital social",
  soonTitle: "Bientôt dans les stores",
  soonBody:
    "L’application Dobra arrive bientôt sur l’App Store et Google Play. En attendant, commandez directement sur mydobra.pl — le site fonctionne dans tout navigateur, sur téléphone comme sur ordinateur.",
  soonWeb: "Commander sur mydobra.pl",
  close: "Fermer",
  contact: "Contact",
  company: "Société",
  complaints: "Réclamations",
  refunds: "Remboursements et annulations",
  delivery: "Conditions de livraison",
  policies: "Conditions",
  howTitle: "Comment fonctionne Dobra",
  how: [
    ["Choisissez un restaurant", "Parcourez les restaurants locaux et leurs menus. Les prix sont en PLN, et les frais de livraison et de service sont affichés avant la commande."],
    ["Passez commande", "Ajoutez des plats au panier, indiquez votre adresse et payez en espèces à la livraison, ou en ligne lorsque cette option est proposée."],
    ["Suivez la livraison", "Le restaurant prépare votre repas et un livreur Dobra vous l’apporte. Vous suivez le statut de la commande dans l’application."],
  ],
  joinTitle: "Grandissez avec Dobra",
  join: [
    { title: "Commander", body: "Vos plats locaux préférés, livrés chez vous.", cta: "Commander" },
    { title: "Ajouter votre restaurant", body: "Touchez de nouveaux clients et gérez vos commandes dans un tableau de bord simple.", cta: "Comment ça marche" },
    { title: "Livrer avec Dobra", body: "Choisissez quand vous travaillez et voyez votre gain avant d’accepter une livraison.", cta: "Comment ça marche" },
  ],
  trustTitle: "Sûr et transparent",
  trust: [
    ["Paiements sécurisés", "Les paiements en ligne sont traités par un prestataire de paiement agréé. Dobra ne voit ni ne conserve votre numéro de carte complet."],
    ["Prix clairs", "Le prix des plats, les frais de livraison et de service sont affichés en PLN avant la confirmation."],
    ["De l’aide en cas de problème", "Vous pouvez annuler une commande avant que le restaurant l’accepte, signaler un problème depuis la commande et déposer une réclamation."],
  ],
  faqTitle: "Questions fréquentes",
  faq: [
    ["Comment payer ?", "Vous pouvez payer le livreur en espèces à la livraison. Les moyens de paiement en ligne sont proposés au moment de la commande lorsqu’ils sont disponibles."],
    ["Où livre Dobra ?", "Dans les villes indiquées sur cette page. La liste est mise à jour dès que nous commençons à livrer dans une nouvelle ville."],
    ["Combien coûte la livraison ?", "Chaque restaurant fixe ses propres frais de livraison, affichés sur le restaurant et à nouveau avant la commande. Les membres Dobra Prime ne paient pas la livraison des repas."],
    ["Puis-je annuler ma commande ?", "Oui, vous-même dans l’application, tant que le restaurant ne l’a pas acceptée. Ensuite, contactez-nous et nous vous aiderons. Les commandes payées en ligne sont remboursées sur le moyen de paiement initial."],
    ["Comment faire une réclamation ?", "Utilisez « Signaler un problème » dans la commande, ou contactez-nous avec les coordonnées de la page Contact. Vous pouvez aussi envoyer une réclamation par courrier."],
  ],
  featuredTitle: "Restaurants sur Dobra",
  featuredSub: "Restaurants qui acceptent actuellement des commandes sur Dobra.",
  featuredCta: "Commander",
  deliveryFee: "Livraison",
  minutes: "min",
  contactTitle: "Nous contacter",
  contactIntro: "Une question sur une commande, un partenariat ou un paiement ? Voici comment nous joindre.",
  email: "E-mail",
  phone: "Téléphone",
  address: "Siège social",
  hours: "Horaires du support",
  chatHint: "Les clients connectés peuvent aussi nous écrire via le chat d’assistance de l’application Dobra (Profil → Aide).",
  formName: "Votre nom",
  formEmail: "Votre e-mail",
  formMessage: "Message",
  formSend: "Envoyer",
  formSent: "Votre messagerie va s’ouvrir avec le message prêt à envoyer.",
  checkoutLegal: ["En passant commande, vous acceptez les ", "Conditions d’utilisation", " et confirmez avoir lu la ", "Politique de confidentialité"],
  live: {
    title: "Frais actuels",
    note: "Ces montants proviennent directement de nos paramètres de prix en vigueur et sont ceux appliqués lors de la commande.",
    serviceFee: "Frais de service par commande",
    deliveryFee: "Frais de livraison par défaut (si le restaurant n’a pas fixé les siens)",
    minOrder: "Commande minimum sur la plateforme",
    packageBase: "Livraison de colis : frais de base",
    packagePerKm: "Livraison de colis : par km",
    packageMin: "Livraison de colis : frais minimum",
    commission: "Commission Dobra sur la valeur de la commande",
    cities: "Villes où nous livrons",
    none: "aucun",
  },
  pages: {
    about: {
      title: "À propos de Dobra",
      intro: "Dobra est une plateforme de livraison de repas qui met en relation des clients, des restaurants locaux et des livreurs indépendants. Dobra est exploitée par NICKOVWAY Sp. z o.o., basée à Lutynia près de Wrocław.",
      sections: [
        { h: "Ce que nous faisons", p: ["Les clients commandent des plats de restaurants locaux sur mydobra.pl. Le restaurant prépare la commande et un livreur Dobra la livre. Nous proposons aussi la livraison de colis entre deux adresses."] },
        { h: "Avec qui nous travaillons", b: ["Les clients qui veulent bien manger sans sortir de chez eux.", "Les restaurants qui veulent toucher plus de clients sans créer leur propre service de livraison.", "Les livreurs qui veulent un travail flexible et choisissent les livraisons qu’ils acceptent."] },
        { h: "Où nous sommes présents", p: ["Nous livrons dans certaines villes de Pologne et préparons notre lancement au Cameroun. La liste à jour des villes figure sur la page d’accueil et sur la page Villes."] },
        { h: "Notre façon de travailler", p: ["Les prix sont toujours affichés avant la commande. Les restaurants et les livreurs sont vérifiés par notre équipe avant de pouvoir accepter des commandes. En cas de problème, notre équipe d’assistance est là pour aider."] },
      ],
      cta: { label: "Commander", to: "/get-started", signup: true },
    },
    partner: {
      title: "Ajoutez votre restaurant à Dobra",
      intro: "Touchez de nouveaux clients dans votre ville et recevez les commandes dans un tableau de bord en ligne simple. Les livreurs Dobra s’occupent de la livraison.",
      sections: [
        { h: "Comment nous rejoindre", b: ["1. Créez un compte Dobra et choisissez « Je suis restaurateur ».", "2. Ajoutez votre restaurant : nom, cuisine, adresse, logo, frais de livraison et commande minimum.", "3. Ajoutez votre menu avec les prix en PLN et des photos.", "4. Notre équipe vérifie votre restaurant. Une fois approuvé, il est visible des clients et vous pouvez recevoir des commandes."] },
        { h: "Gestion des commandes", b: ["Les nouvelles commandes apparaissent dans le tableau de bord avec une alerte sonore.", "Vous acceptez la commande, la préparez et la marquez prête.", "Un livreur la récupère et la livre au client.", "Vous pouvez ouvrir ou fermer le restaurant et modifier le menu à tout moment."] },
        { h: "Coûts", p: ["Dobra prélève une commission sur la valeur de chaque commande. Le taux actuel est indiqué ci-dessous. Aucuns frais d’inscription."] },
      ],
      cta: { label: "Inscrire mon restaurant", to: "/get-started", signup: true },
    },
    deliver: {
      title: "Devenez livreur Dobra",
      intro: "Livrez les commandes des restaurants locaux de votre ville. Passez en ligne quand cela vous convient et voyez votre gain avant d’accepter une livraison.",
      sections: [
        { h: "Comment nous rejoindre", b: ["1. Créez un compte Dobra et choisissez « Je suis livreur ».", "2. Choisissez votre mode de livraison : à pied, vélo, vélo électrique, trottinette, moto ou voiture.", "3. Envoyez vos documents : un selfie, une pièce d’identité, une photo de votre sac isotherme et, selon le véhicule, une photo du véhicule, le permis, l’assurance et la carte grise.", "4. Notre équipe vérifie vos documents. Une fois approuvé, vous pouvez passer en ligne et accepter des livraisons."] },
        { h: "Déroulement des livraisons", b: ["En ligne, les offres de livraison apparaissent avec le montant que vous gagnerez.", "Vous acceptez une offre, récupérez la commande au restaurant et la livrez au client.", "Vos livraisons effectuées et vos gains sont visibles dans l’application."] },
        { h: "Ce qu’il vous faut", b: ["Un smartphone avec internet et la localisation activée.", "Une pièce d’identité valide.", "Un sac isotherme.", "Pour moto et voiture : permis, assurance et carte grise."] },
      ],
      cta: { label: "M’inscrire comme livreur", to: "/get-started", signup: true },
    },
    help: {
      title: "Centre d’aide",
      intro: "Les réponses aux questions les plus fréquentes, et comment nous joindre si vous avez besoin de plus d’aide.",
      sections: [
        { h: "Commandes", b: ["Le statut de votre commande est visible sur l’écran de la commande dans l’application.", "Vous pouvez annuler une commande vous-même tant que le restaurant ne l’a pas acceptée.", "En cas de problème avec une commande livrée, utilisez « Signaler un problème »."] },
        { h: "Paiements", b: ["Vous pouvez payer le livreur en espèces à la livraison.", "Les moyens de paiement en ligne sont proposés lors de la commande lorsqu’ils sont disponibles. La commande est transmise au restaurant après confirmation du paiement.", "Les remboursements des paiements en ligne sont versés sur le moyen de paiement initial."] },
        { h: "Votre compte", b: ["Nom, téléphone, adresse et mot de passe : Profil → Compte.", "Vos choix de confidentialité : Profil → Paramètres de confidentialité.", "Supprimer votre compte et vos données : Profil → Supprimer mon compte et mes données."] },
        { h: "Besoin d’aide supplémentaire ?", p: ["Consultez nos pages Conditions de livraison, Remboursements et annulations et Réclamations, ou contactez-nous avec les coordonnées de la page Contact."] },
      ],
      cta: { label: "Nous contacter", to: "/contact" },
    },
    delivery: {
      title: "Conditions de livraison",
      intro: "Comment fonctionne la livraison sur Dobra : où nous livrons, comment les frais sont calculés et combien de temps cela prend.",
      sections: [
        { h: "Où nous livrons", p: ["Nous livrons dans les villes indiquées ci-dessous. Vous ne pouvez commander qu’auprès des restaurants ouverts qui acceptent des commandes."] },
        { h: "Frais de livraison", b: ["Chaque restaurant fixe ses propres frais de livraison, affichés sur le restaurant et à nouveau lors de la commande.", "Dans certaines villes, des frais de livraison fixes s’appliquent à la place. Ce sont alors eux qui sont affichés lors de la commande.", "Des frais de service peuvent s’ajouter à chaque commande. Leur montant actuel est indiqué ci-dessous et lors de la commande.", "Les membres Dobra Prime ne paient pas la livraison des repas.", "Le total affiché lors de la commande, en PLN, est le montant que vous payez."] },
        { h: "Commande minimum", p: ["Un restaurant peut fixer un montant minimum de commande. Si votre panier est en dessous, un message l’indique et vous ne pourrez pas commander avant d’ajouter des articles."] },
        { h: "Délais de livraison", p: ["Chaque restaurant affiche un délai de livraison estimé. Ce n’est pas une garantie : le temps de préparation, la circulation, la météo et la disponibilité des livreurs peuvent l’influencer. Vous suivez le statut de la commande dans l’application."] },
        { h: "Livraison de colis", p: ["Vous pouvez aussi envoyer un colis entre deux adresses. Le prix comprend des frais de base plus un montant par kilomètre, avec un minimum, et il est affiché avant confirmation."] },
        { h: "À la porte", p: ["Indiquez une adresse correcte et les informations d’accès, et gardez votre téléphone allumé pour que le livreur puisse vous joindre."] },
      ],
    },
    refunds: {
      title: "Remboursements et annulations",
      intro: "Quand vous pouvez annuler une commande et comment les remboursements sont effectués.",
      sections: [
        { h: "Annuler vous-même", p: ["Vous pouvez annuler une commande dans l’application tant qu’elle a le statut « En attente », c’est-à-dire avant que le restaurant ne l’accepte. Ouvrez la commande et appuyez sur « Annuler la commande »."] },
        { h: "Après acceptation par le restaurant", p: ["Une fois que le restaurant a accepté la commande et commencé à la préparer, il n’est plus possible de l’annuler dans l’application. Contactez-nous et nous examinerons votre situation."] },
        { h: "Quand nous annulons une commande", p: ["Notre équipe peut annuler une commande, par exemple si le restaurant ne peut pas la préparer ou si aucun livreur n’est disponible. Si vous avez payé en ligne, vous êtes remboursé intégralement."] },
        { h: "Comment les remboursements sont versés", b: ["Paiements en ligne : le remboursement est envoyé automatiquement sur le moyen de paiement utilisé. Le délai d’apparition dépend de votre banque ou de votre prestataire de paiement.", "Paiements en espèces : si vous avez payé le livreur et qu’un remboursement vous est dû, notre équipe d’assistance convient avec vous de la manière de vous rembourser.", "Le remboursement peut être total ou partiel, par exemple s’il ne manquait qu’un seul article."] },
        { h: "Problème avec une commande livrée", p: ["Si des articles manquent, sont erronés ou abîmés, utilisez au plus vite « Signaler un problème » dans la commande ou déposez une réclamation. Voir la page Réclamations."] },
        { h: "Droit de rétractation", p: ["Les repas préparés sont des denrées périssables : le droit légal de rétractation de 14 jours pour les contrats à distance ne s’applique donc généralement pas. Cela ne limite pas les droits que vous confère la loi impérative."] },
      ],
      cta: { label: "Déposer une réclamation", to: "/complaints" },
    },
    complaints: {
      title: "Réclamations",
      intro: "Si quelque chose s’est mal passé avec une commande ou avec Dobra, vous pouvez déposer une réclamation. Nous prenons chacune au sérieux.",
      sections: [
        { h: "Comment déposer une réclamation", b: ["Dans l’application : ouvrez la commande et appuyez sur « Signaler un problème ».", "Par e-mail ou téléphone : utilisez les coordonnées de la page Contact.", "Par courrier : écrivez à l’adresse du siège indiquée ci-dessous."] },
        { h: "Ce qu’il faut indiquer", b: ["Votre nom et l’adresse e-mail de votre compte Dobra.", "Le numéro de commande, visible sur l’écran de la commande.", "Ce qui s’est passé. Des photos aident si des articles manquent ou sont abîmés.", "La solution souhaitée, par exemple un remboursement."] },
        { h: "Délai de réponse", p: ["Nous répondons aux réclamations dans les 14 jours suivant leur réception, comme l’exige le droit polonais de la consommation, et généralement bien plus tôt. Si nous acceptons votre réclamation, nous vous indiquons comment nous la résolvons, par exemple par un remboursement total ou partiel."] },
        { h: "Si vous n’êtes pas d’accord", p: ["Les consommateurs peuvent recourir à des procédures extrajudiciaires de traitement des réclamations, par exemple auprès du médiateur des consommateurs local (rzecznik konsumentów) ou de l’inspection régionale du commerce (Inspekcja Handlowa)."] },
      ],
      cta: { label: "Nous contacter", to: "/contact" },
    },
  },
};

export const SITE_COPY: Record<Locale, Copy> = { en, pl, uk, fr };
