import type { Locale } from "@/lib/i18n";

export const COMPANY = {
  legalName: "NICKOVWAY SP. Z O.O.",
  brand: "Dobra",
  street: "ul. Jana III Sobieskiego 38",
  city: "55-330 Lutynia, Polska",
  krs: "0000791473",
  nip: "8982251132",
  regon: "383675818",
  email: "support@mydobra.pl",
  partnerEmail: "partner@mydobra.pl",
  legalEmail: "legal@mydobra.pl",
  phone: "+48 505 645 999",
  phoneHref: "tel:+48505645999",
};

type Copy = {
  soonTitle: string;
  soonBody: string;
  soonWeb: string;
  close: string;
  contact: string;
  company: string;
  hours: string;
  payments: string;
  complaints: string;
  howTitle: string;
  how: [string, string][];
  joinTitle: string;
  join: { title: string; body: string; cta: string }[];
  trustTitle: string;
  trust: [string, string][];
  faqTitle: string;
  faq: [string, string][];
  contactTitle: string;
  contactIntro: string;
  formName: string;
  formEmail: string;
  formMessage: string;
  formSend: string;
  formSent: string;
  complaintsTitle: string;
  complaintsBody: string[];
};

const en: Copy = {
  soonTitle: "Coming soon to the stores",
  soonBody:
    "Our iPhone and Android apps are on their way to the App Store and Google Play. Until then, you can use Dobra right now in your browser — and add it to your home screen like an app.",
  soonWeb: "Use Dobra in the browser",
  close: "Close",
  contact: "Contact",
  company: "Company",
  hours: "Customer service: every day 10:00–22:00",
  payments: "Payment methods",
  complaints: "Complaints & refunds",
  howTitle: "How Dobra works",
  how: [
    ["Choose", "Browse local restaurants and see prices in PLN, including delivery and service fees, before you pay."],
    ["Pay securely", "Pay online by card, BLIK or bank transfer, or choose cash on delivery."],
    ["Track & enjoy", "Follow your courier live on the map until your order is at your door."],
  ],
  joinTitle: "Grow with Dobra",
  join: [
    { title: "Order food", body: "Your favourite local dishes, delivered fast.", cta: "Order now" },
    { title: "Add your restaurant", body: "Reach new customers and manage orders in one simple dashboard.", cta: "Become a partner" },
    { title: "Deliver with Dobra", body: "Flexible hours and earnings for every completed delivery.", cta: "Start delivering" },
  ],
  trustTitle: "Safe and transparent",
  trust: [
    ["Secure payments", "Online payments are processed by licensed payment providers over encrypted connections. We never store your full card number."],
    ["Clear prices", "All prices include VAT. Delivery and service fees are always shown before you confirm."],
    ["Refunds", "If an order is cancelled or not delivered, you get your money back to the original payment method."],
  ],
  faqTitle: "Frequently asked questions",
  faq: [
    ["Which payment methods can I use?", "Card (Visa, Mastercard), BLIK, online bank transfer, Apple Pay, Google Pay, and cash on delivery where available."],
    ["Where does Dobra deliver?", "In selected cities in Poland and Cameroon. See the list of cities on this page."],
    ["Can I cancel my order?", "Yes, until the restaurant starts preparing it. Online payments are refunded in full to the original method, usually within 3–10 business days."],
    ["How do I make a complaint?", "Write to support@mydobra.pl or use the chat in the app. We reply within 14 days, usually much sooner."],
    ["Is there an app?", "Our mobile apps are coming soon. You can already use Dobra in any browser on your phone or computer."],
  ],
  contactTitle: "Contact us",
  contactIntro: "Questions about an order, a partnership or payments? We're happy to help.",
  formName: "Your name",
  formEmail: "Email",
  formMessage: "Message",
  formSend: "Send message",
  formSent: "Your email app will open with your message ready to send.",
  complaintsTitle: "Complaints and refunds",
  complaintsBody: [
    "You can file a complaint by email at support@mydobra.pl, by phone, or through the chat in the app. Please include your order number and a short description.",
    "We review every complaint within 14 days. If it is accepted, we refund the amount to your original payment method, usually within 3–10 business days.",
    "Consumers also have the right to use out-of-court complaint procedures, including the EU online dispute resolution platform.",
  ],
};

const pl: Copy = {
  soonTitle: "Wkrótce w sklepach",
  soonBody:
    "Nasze aplikacje na iPhone'a i Androida są w drodze do App Store i Google Play. Do tego czasu możesz korzystać z Dobra już teraz w przeglądarce — i dodać ją do ekranu głównego jak aplikację.",
  soonWeb: "Korzystaj z Dobra w przeglądarce",
  close: "Zamknij",
  contact: "Kontakt",
  company: "Firma",
  hours: "Obsługa klienta: codziennie 10:00–22:00",
  payments: "Metody płatności",
  complaints: "Reklamacje i zwroty",
  howTitle: "Jak działa Dobra",
  how: [
    ["Wybierz", "Przeglądaj lokalne restauracje i sprawdź ceny w PLN wraz z opłatą za dostawę i serwis przed zapłatą."],
    ["Zapłać bezpiecznie", "Płać online kartą, BLIK-iem lub przelewem albo gotówką przy odbiorze."],
    ["Śledź i smacznego", "Obserwuj kuriera na mapie na żywo, aż zamówienie dotrze pod drzwi."],
  ],
  joinTitle: "Rozwijaj się z Dobra",
  join: [
    { title: "Zamów jedzenie", body: "Ulubione lokalne dania, szybko dostarczone.", cta: "Zamów teraz" },
    { title: "Dodaj restaurację", body: "Docieraj do nowych klientów i zarządzaj zamówieniami w prostym panelu.", cta: "Zostań partnerem" },
    { title: "Dostarczaj z Dobra", body: "Elastyczne godziny i zarobek za każdą zrealizowaną dostawę.", cta: "Zacznij dostarczać" },
  ],
  trustTitle: "Bezpiecznie i przejrzyście",
  trust: [
    ["Bezpieczne płatności", "Płatności online obsługują licencjonowani operatorzy przez szyfrowane połączenie. Nie przechowujemy pełnego numeru karty."],
    ["Jasne ceny", "Wszystkie ceny zawierają VAT. Opłaty za dostawę i serwis są zawsze widoczne przed potwierdzeniem."],
    ["Zwroty", "Jeśli zamówienie zostanie anulowane lub niedostarczone, zwracamy pieniądze na pierwotną metodę płatności."],
  ],
  faqTitle: "Najczęstsze pytania",
  faq: [
    ["Jakie metody płatności są dostępne?", "Karta (Visa, Mastercard), BLIK, szybki przelew, Apple Pay, Google Pay oraz gotówka przy odbiorze, tam gdzie jest dostępna."],
    ["Gdzie dostarcza Dobra?", "W wybranych miastach w Polsce i Kamerunie. Lista miast znajduje się na tej stronie."],
    ["Czy mogę anulować zamówienie?", "Tak, dopóki restauracja nie zacznie go przygotowywać. Płatności online zwracamy w całości, zwykle w ciągu 3–10 dni roboczych."],
    ["Jak złożyć reklamację?", "Napisz na support@mydobra.pl lub skorzystaj z czatu w aplikacji. Odpowiadamy w ciągu 14 dni, zwykle znacznie szybciej."],
    ["Czy jest aplikacja?", "Aplikacje mobilne pojawią się wkrótce. Już teraz możesz korzystać z Dobra w każdej przeglądarce."],
  ],
  contactTitle: "Skontaktuj się z nami",
  contactIntro: "Pytania o zamówienie, współpracę lub płatności? Chętnie pomożemy.",
  formName: "Imię i nazwisko",
  formEmail: "E-mail",
  formMessage: "Wiadomość",
  formSend: "Wyślij wiadomość",
  formSent: "Otworzy się Twoja aplikacja pocztowa z gotową wiadomością.",
  complaintsTitle: "Reklamacje i zwroty",
  complaintsBody: [
    "Reklamację możesz złożyć e-mailem na support@mydobra.pl, telefonicznie lub przez czat w aplikacji. Podaj numer zamówienia i krótki opis problemu.",
    "Rozpatrujemy każdą reklamację w ciągu 14 dni. Po jej uznaniu zwracamy kwotę na pierwotną metodę płatności, zwykle w ciągu 3–10 dni roboczych.",
    "Konsumenci mogą także skorzystać z pozasądowych sposobów rozpatrywania reklamacji, w tym z unijnej platformy ODR.",
  ],
};

const uk: Copy = {
  soonTitle: "Незабаром у магазинах",
  soonBody:
    "Наші застосунки для iPhone та Android скоро з'являться в App Store і Google Play. А поки що користуйтеся Dobra просто в браузері — і додайте її на головний екран як застосунок.",
  soonWeb: "Відкрити Dobra в браузері",
  close: "Закрити",
  contact: "Контакти",
  company: "Компанія",
  hours: "Служба підтримки: щодня 10:00–22:00",
  payments: "Способи оплати",
  complaints: "Скарги та повернення",
  howTitle: "Як працює Dobra",
  how: [
    ["Обирайте", "Переглядайте місцеві ресторани й бачте ціни разом із доставкою та сервісним збором ще до оплати."],
    ["Платіть безпечно", "Оплачуйте онлайн карткою, BLIK або переказом чи готівкою при отриманні."],
    ["Стежте й смакуйте", "Відстежуйте кур'єра на карті в реальному часі до самих дверей."],
  ],
  joinTitle: "Зростайте з Dobra",
  join: [
    { title: "Замовити їжу", body: "Улюблені місцеві страви зі швидкою доставкою.", cta: "Замовити" },
    { title: "Додати ресторан", body: "Залучайте нових клієнтів і керуйте замовленнями в простій панелі.", cta: "Стати партнером" },
    { title: "Доставляти з Dobra", body: "Гнучкий графік і заробіток за кожну доставку.", cta: "Почати доставляти" },
  ],
  trustTitle: "Безпечно й прозоро",
  trust: [
    ["Безпечні платежі", "Онлайн-платежі обробляють ліцензовані платіжні провайдери через захищене з'єднання. Ми не зберігаємо повний номер картки."],
    ["Зрозумілі ціни", "Усі ціни включають ПДВ. Доставку та сервісний збір завжди видно до підтвердження."],
    ["Повернення", "Якщо замовлення скасовано або не доставлено, кошти повертаються на початковий спосіб оплати."],
  ],
  faqTitle: "Поширені запитання",
  faq: [
    ["Які способи оплати доступні?", "Картка (Visa, Mastercard), BLIK, онлайн-переказ, Apple Pay, Google Pay і готівка при отриманні, де доступно."],
    ["Де працює Dobra?", "У вибраних містах Польщі та Камеруну. Список міст — на цій сторінці."],
    ["Чи можна скасувати замовлення?", "Так, поки ресторан не почав його готувати. Онлайн-оплату повертаємо повністю, зазвичай за 3–10 робочих днів."],
    ["Як подати скаргу?", "Напишіть на support@mydobra.pl або в чат у застосунку. Відповідаємо протягом 14 днів, зазвичай швидше."],
    ["Чи є застосунок?", "Мобільні застосунки скоро. Вже зараз Dobra працює в будь-якому браузері."],
  ],
  contactTitle: "Зв'яжіться з нами",
  contactIntro: "Питання щодо замовлення, співпраці чи оплати? Ми раді допомогти.",
  formName: "Ваше ім'я",
  formEmail: "Email",
  formMessage: "Повідомлення",
  formSend: "Надіслати",
  formSent: "Відкриється ваша поштова програма з готовим повідомленням.",
  complaintsTitle: "Скарги та повернення",
  complaintsBody: [
    "Подати скаргу можна на support@mydobra.pl, телефоном або через чат у застосунку. Вкажіть номер замовлення та короткий опис.",
    "Ми розглядаємо кожну скаргу протягом 14 днів. Якщо її задоволено, повертаємо кошти на початковий спосіб оплати, зазвичай за 3–10 робочих днів.",
    "Споживачі також можуть скористатися позасудовими способами вирішення спорів, зокрема платформою ODR ЄС.",
  ],
};

const fr: Copy = {
  soonTitle: "Bientôt dans les stores",
  soonBody:
    "Nos applications iPhone et Android arrivent bientôt sur l'App Store et Google Play. En attendant, utilisez Dobra dès maintenant dans votre navigateur — et ajoutez-la à votre écran d'accueil comme une application.",
  soonWeb: "Utiliser Dobra dans le navigateur",
  close: "Fermer",
  contact: "Contact",
  company: "Société",
  hours: "Service client : tous les jours 10h00–22h00",
  payments: "Moyens de paiement",
  complaints: "Réclamations et remboursements",
  howTitle: "Comment fonctionne Dobra",
  how: [
    ["Choisissez", "Parcourez les restaurants locaux et voyez les prix, frais de livraison et de service compris, avant de payer."],
    ["Payez en sécurité", "Payez en ligne par carte, BLIK ou virement, ou en espèces à la livraison."],
    ["Suivez et dégustez", "Suivez votre livreur en direct sur la carte jusqu'à votre porte."],
  ],
  joinTitle: "Grandissez avec Dobra",
  join: [
    { title: "Commander", body: "Vos plats locaux préférés, livrés rapidement.", cta: "Commander" },
    { title: "Ajouter votre restaurant", body: "Touchez de nouveaux clients et gérez vos commandes facilement.", cta: "Devenir partenaire" },
    { title: "Livrer avec Dobra", body: "Horaires flexibles et revenus pour chaque livraison.", cta: "Commencer à livrer" },
  ],
  trustTitle: "Sûr et transparent",
  trust: [
    ["Paiements sécurisés", "Les paiements en ligne sont traités par des prestataires agréés via une connexion chiffrée. Nous ne stockons jamais votre numéro de carte complet."],
    ["Prix clairs", "Tous les prix incluent la TVA. Les frais de livraison et de service sont affichés avant confirmation."],
    ["Remboursements", "Si une commande est annulée ou non livrée, vous êtes remboursé sur le moyen de paiement d'origine."],
  ],
  faqTitle: "Questions fréquentes",
  faq: [
    ["Quels moyens de paiement puis-je utiliser ?", "Carte (Visa, Mastercard), BLIK, virement en ligne, Apple Pay, Google Pay et espèces à la livraison selon disponibilité."],
    ["Où Dobra livre-t-elle ?", "Dans certaines villes de Pologne et du Cameroun. Voir la liste des villes sur cette page."],
    ["Puis-je annuler ma commande ?", "Oui, tant que le restaurant n'a pas commencé à la préparer. Les paiements en ligne sont remboursés intégralement, généralement sous 3 à 10 jours ouvrés."],
    ["Comment faire une réclamation ?", "Écrivez à support@mydobra.pl ou utilisez le chat de l'application. Nous répondons sous 14 jours, souvent bien plus vite."],
    ["Y a-t-il une application ?", "Nos applications mobiles arrivent bientôt. Dobra fonctionne déjà dans tout navigateur."],
  ],
  contactTitle: "Nous contacter",
  contactIntro: "Une question sur une commande, un partenariat ou un paiement ? Nous sommes là pour vous aider.",
  formName: "Votre nom",
  formEmail: "E-mail",
  formMessage: "Message",
  formSend: "Envoyer",
  formSent: "Votre messagerie va s'ouvrir avec votre message prêt à être envoyé.",
  complaintsTitle: "Réclamations et remboursements",
  complaintsBody: [
    "Vous pouvez déposer une réclamation par e-mail à support@mydobra.pl, par téléphone ou via le chat de l'application, en indiquant votre numéro de commande.",
    "Nous traitons chaque réclamation sous 14 jours. Si elle est acceptée, nous remboursons sur le moyen de paiement d'origine, généralement sous 3 à 10 jours ouvrés.",
    "Les consommateurs peuvent aussi recourir aux procédures extrajudiciaires, notamment la plateforme européenne ODR.",
  ],
};

export const SITE_COPY: Record<Locale, Copy> = { en, pl, uk, fr };
