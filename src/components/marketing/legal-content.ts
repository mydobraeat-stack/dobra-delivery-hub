export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalDocument = {
  title: string;
  meta: string[];
  intro: string[];
  sections: LegalSection[];
};

export const PRIVACY_DOC: LegalDocument = {
  title: "Polityka prywatności i ochrony danych osobowych",
  meta: ["RODO", "Wersja 1.0", "Terytorium: Rzeczpospolita Polska"],
  intro: [
    "Niniejsza Polityka Prywatności wyjaśnia, w jaki sposób NICKOVWAY SP. Z O.O., działająca pod marką Dobra, przetwarza dane osobowe użytkowników Platformy Dobra, Klientów, osób kontaktowych Partnerów Restauracyjnych oraz innych osób korzystających z usług Dobra.",
  ],
  sections: [
    {
      heading: "1. Administrator danych",
      paragraphs: [
        "Administratorem danych osobowych jest NICKOVWAY SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ, ul. Kościańska 34/8, 54-027 Wrocław, Polska, KRS 0000791473, NIP 8982251132, REGON 383675818 („Dobra”, „Administrator”).",
        "Kontakt w sprawach prywatności i ochrony danych: legal@mydobra.pl. Obsługa Klienta: support@mydobra.pl, tel. +48 505 645 999.",
        "Jeżeli Dobra wyznaczy Inspektora Ochrony Danych, jego dane kontaktowe zostaną opublikowane w Platformie i w niniejszej Polityce.",
      ],
    },
    {
      heading: "2. Kogo dotyczy Polityka",
      bullets: [
        "Klientów i użytkowników aplikacji lub strony Dobra;",
        "osób zakładających konto lub składających Zamówienia;",
        "osób kontaktujących się z obsługą Klienta;",
        "osób reprezentujących lub zatrudnionych przez Restauracje i innych Partnerów;",
        "odbiorców dostaw i innych osób, których dane są przekazane w związku z Zamówieniem;",
        "użytkowników uczestniczących w promocjach, programach poleceń, ankietach lub badaniach.",
      ],
    },
    {
      heading: "3. Jakie dane możemy przetwarzać",
      bullets: [
        "dane identyfikacyjne i konta: imię, nazwisko, identyfikator użytkownika, dane logowania;",
        "dane kontaktowe: e-mail, numer telefonu, adres dostawy;",
        "dane Zamówień: Restauracja, produkty, kwoty, historia i status Zamówień, instrukcje dostawy;",
        "dane płatnicze i rozliczeniowe: metoda płatności, identyfikatory transakcji, status płatności, zwroty i chargebacki; pełne dane karty są co do zasady obsługiwane przez dostawcę płatności;",
        "dane lokalizacyjne: lokalizacja urządzenia za zgodą oraz lokalizacja potrzebna do dostawy;",
        "dane techniczne: adres IP, identyfikatory urządzenia lub aplikacji, system operacyjny, przeglądarka, logi, zdarzenia bezpieczeństwa;",
        "dane komunikacji: treść zgłoszeń, czatów, e-maili, połączeń lub innych kontaktów z Dobra, w zakresie zgodnym z prawem;",
        "dane opinii i ocen;",
        "dane dotyczące promocji, kuponów, poleceń i preferencji;",
        "dane przeciwdziałania nadużyciom i bezpieczeństwa, w tym sygnały ryzyka transakcji lub konta;",
        "dane przedstawicieli Partnerów: dane służbowe, stanowisko, uprawnienia, dane rozliczeniowe i kontaktowe.",
      ],
    },
    {
      heading: "4. Źródła danych",
      paragraphs: [
        "Dane otrzymujemy bezpośrednio od użytkownika, podczas rejestracji, składania Zamówienia, płatności, kontaktu z pomocą, korzystania z lokalizacji lub innych funkcji.",
        "Możemy otrzymywać dane także od Restauracji, kurierów i partnerów flotowych, dostawców płatności, dostawców logowania lub usług technicznych, partnerów zapobiegania oszustwom oraz ze źródeł publicznych w zakresie dozwolonym prawem.",
        "Jeżeli dane nie zostały pozyskane bezpośrednio od osoby, Dobra realizuje obowiązek informacyjny zgodnie z art. 14 RODO, chyba że ma zastosowanie ustawowy wyjątek.",
      ],
    },
    {
      heading: "5. Cele i podstawy prawne przetwarzania",
      paragraphs: [
        "Dobra przetwarza dane tylko wtedy, gdy istnieje odpowiednia podstawa prawna. W zależności od procesu może nią być wykonanie umowy lub działania przed jej zawarciem (art. 6 ust. 1 lit. b RODO), obowiązek prawny (lit. c), prawnie uzasadniony interes Dobra lub osoby trzeciej (lit. f) albo zgoda (lit. a).",
        "Podstawę prawną należy oceniać dla każdego procesu osobno; zgoda nie jest stosowana jako domyślna podstawa, jeżeli przetwarzanie jest konieczne do wykonania umowy lub obowiązku prawnego.",
      ],
    },
    {
      heading: "6. Realizacja konta i Zamówień",
      paragraphs: [
        "Przetwarzamy dane w celu utworzenia i obsługi konta, przyjęcia Zamówienia, przekazania go Restauracji, zapewnienia funkcji Platformy, komunikacji o statusie i obsługi dostawy.",
        "Podstawą jest przede wszystkim art. 6 ust. 1 lit. b RODO — niezbędność do wykonania umowy lub działań na żądanie użytkownika przed jej zawarciem.",
      ],
    },
    {
      heading: "7. Płatności, rozliczenia i zwroty",
      paragraphs: [
        "Przetwarzamy dane potrzebne do inicjowania i obsługi płatności, potwierdzania statusu transakcji, rozliczeń z Restauracjami, zwrotów, reklamacji płatniczych i księgowości.",
        "Podstawą może być wykonanie umowy, obowiązki prawne podatkowe i rachunkowe oraz prawnie uzasadniony interes w dochodzeniu lub obronie roszczeń.",
        "Usługi płatnicze mogą być wykonywane przez odrębnego dostawcę usług płatniczych działającego jako niezależny administrator lub podmiot przetwarzający — zgodnie z jego rolą i dokumentacją.",
      ],
    },
    {
      heading: "8. Dostawa i geolokalizacja",
      paragraphs: [
        "Dane adresowe i kontaktowe są wykorzystywane do realizacji dostawy. Jeżeli użytkownik włączy dostęp do lokalizacji urządzenia, Dobra może używać lokalizacji do ustalenia obszaru dostawy, proponowania adresu, szacowania czasu i wspierania realizacji Zamówienia.",
        "Podstawą przetwarzania danych koniecznych do dostawy jest wykonanie umowy. Dostęp aplikacji do precyzyjnej lokalizacji urządzenia zależy od ustawień i uprawnień użytkownika.",
        "W czasie aktywnej dostawy Dobra może prezentować Klientowi przybliżoną lub bieżącą lokalizację kuriera w zakresie potrzebnym do realizacji usługi i bezpieczeństwa.",
      ],
    },
    {
      heading: "9. Obsługa Klienta i reklamacje",
      paragraphs: [
        "Przetwarzamy dane zgłoszeń w celu udzielania pomocy, obsługi reklamacji, zwrotów, sporów, bezpieczeństwa i poprawy jakości usług.",
        "Podstawą może być wykonanie umowy, obowiązek prawny lub prawnie uzasadniony interes Dobra w obsłudze użytkowników, dokumentowaniu zdarzeń i obronie roszczeń.",
      ],
    },
    {
      heading: "10. Bezpieczeństwo, nadużycia i zapobieganie oszustwom",
      paragraphs: [
        "Dobra może analizować dane konta, urządzenia, Zamówień, płatności i zachowania na Platformie w celu wykrywania oszustw, nadużyć promocji, przejęcia kont, zagrożeń bezpieczeństwa i innych nieprawidłowości.",
        "Podstawą jest w szczególności prawnie uzasadniony interes Dobra, Klientów, Restauracji i partnerów w ochronie Platformy i transakcji oraz — gdy ma zastosowanie — obowiązek prawny.",
        "Jeżeli w przyszłości decyzja wywołująca skutki prawne lub podobnie istotnie wpływająca na osobę będzie oparta wyłącznie na zautomatyzowanym przetwarzaniu, Dobra zapewni informacje i gwarancje wymagane art. 22 RODO.",
      ],
    },
    {
      heading: "11. Personalizacja, ranking i analityka",
      paragraphs: [
        "Dobra może wykorzystywać informacje o lokalizacji, historii Zamówień, dostępności Restauracji, popularności, ocenach i interakcjach w celu uporządkowania wyników, poprawy trafności i działania Platformy.",
        "Podstawą może być wykonanie usługi oraz prawnie uzasadniony interes w rozwijaniu i dostosowywaniu Platformy. Jeżeli przepisy wymagają zgody na określone technologie śledzące, dane będą wykorzystywane dopiero po jej uzyskaniu.",
      ],
    },
    {
      heading: "12. Marketing i komunikacja handlowa",
      paragraphs: [
        "Dobra może wysyłać informacje o promocjach, ofertach lub nowych funkcjach wyłącznie zgodnie z właściwymi przepisami dotyczącymi marketingu elektronicznego i zgód.",
        "Użytkownik może w każdej chwili wycofać zgodę marketingową lub sprzeciwić się marketingowi bezpośredniemu. Wycofanie zgody nie wpływa na zgodność wcześniejszego przetwarzania.",
        "Komunikaty czysto transakcyjne, np. potwierdzenie Zamówienia lub informacja o dostawie, nie są marketingiem i mogą być wysyłane w celu wykonania usługi.",
      ],
    },
    {
      heading: "13. Pliki cookie, SDK i podobne technologie",
      paragraphs: [
        "Strona i aplikacja Dobra mogą korzystać z plików cookie, SDK i podobnych technologii niezbędnych do działania, bezpieczeństwa, zapamiętywania ustawień, analityki i marketingu.",
        "Technologie, które nie są ściśle niezbędne, będą uruchamiane na podstawie wymaganej zgody. Użytkownik powinien mieć możliwość zarządzania zgodami i ich wycofania.",
      ],
    },
    {
      heading: "14. Komu ujawniamy dane",
      bullets: [
        "Restauracjom — w zakresie potrzebnym do przyjęcia i wykonania Zamówienia oraz reklamacji;",
        "kurierom i partnerom flotowym — w zakresie potrzebnym do odbioru i dostawy;",
        "dostawcom usług płatniczych i instytucjom finansowym;",
        "dostawcom hostingu, chmury, baz danych, komunikacji, wsparcia, map, analityki, cyberbezpieczeństwa i narzędzi IT;",
        "doradcom prawnym, podatkowym, księgowym, audytorom i ubezpieczycielom;",
        "organom publicznym, sądom i organom ścigania, gdy istnieje podstawa prawna;",
        "nabywcom lub następcom prawnym w ramach reorganizacji, połączenia lub sprzedaży przedsiębiorstwa, z odpowiednimi zabezpieczeniami.",
      ],
    },
    {
      heading: "15. Restauracje, kurierzy i niezależni administratorzy",
      paragraphs: [
        "Restauracja jest co do zasady niezależnym administratorem danych, które otrzymuje w celu wykonania swojej umowy sprzedaży z Klientem i własnych obowiązków prawnych.",
        "W zależności od modelu kurier, partner flotowy lub dostawca płatności może działać jako niezależny administrator albo przetwarzać dane w imieniu Dobra.",
        "Dobra nie odpowiada za niezależne cele przetwarzania realizowane przez innego administratora; podmiot taki powinien przekazać własne informacje wymagane RODO.",
      ],
    },
    {
      heading: "16. Przekazywanie danych poza EOG",
      paragraphs: [
        "Dobra preferuje przetwarzanie danych w Europejskim Obszarze Gospodarczym, ale niektórzy dostawcy technologiczni mogą przetwarzać dane poza EOG.",
        "Jeżeli dane są przekazywane do państwa bez decyzji stwierdzającej odpowiedni stopień ochrony, Dobra zastosuje odpowiedni mechanizm przewidziany w RODO, np. standardowe klauzule umowne, oraz dodatkowe środki ochronne, gdy są wymagane.",
        "Informacje o stosowanych zabezpieczeniach można uzyskać pod adresem legal@mydobra.pl.",
      ],
    },
    {
      heading: "17. Okresy przechowywania",
      paragraphs: [
        "Dobra przechowuje dane nie dłużej, niż jest to konieczne do celów, dla których zostały zebrane, z uwzględnieniem wymagań prawnych, podatkowych, rachunkowych, bezpieczeństwa i przedawnienia roszczeń.",
        "Konto i dane operacyjne mogą być przechowywane przez okres korzystania z konta, a po jego zamknięciu przez okres potrzebny do rozliczeń, reklamacji, ochrony przed roszczeniami i obowiązków prawnych.",
        "Dokumentacja podatkowa i księgowa jest przechowywana przez okres wymagany prawem. Dane bezpieczeństwa i logi są przechowywane przez okres proporcjonalny do ryzyka i potrzeb dochodzeniowych.",
      ],
    },
    {
      heading: "18. Bezpieczeństwo danych",
      paragraphs: [
        "Dobra stosuje odpowiednie środki techniczne i organizacyjne adekwatne do ryzyka, mogące obejmować kontrolę dostępu, uwierzytelnianie, szyfrowanie w tranzycie i w odpowiednich przypadkach w spoczynku, rejestrowanie zdarzeń, kopie zapasowe, zarządzanie podatnościami, ograniczenie uprawnień i procedury reagowania na incydenty.",
        "Żaden system nie zapewnia absolutnego bezpieczeństwa, dlatego środki są okresowo oceniane i dostosowywane do ryzyka.",
      ],
    },
    {
      heading: "19. Prawa osób, których dane dotyczą",
      bullets: [
        "prawo dostępu do danych i uzyskania ich kopii;",
        "prawo sprostowania nieprawidłowych danych;",
        "prawo usunięcia danych, gdy spełnione są przesłanki RODO;",
        "prawo ograniczenia przetwarzania;",
        "prawo przenoszenia danych w przypadkach przewidzianych RODO;",
        "prawo sprzeciwu wobec przetwarzania opartego na prawnie uzasadnionym interesie;",
        "bezwzględne prawo sprzeciwu wobec marketingu bezpośredniego;",
        "prawo wycofania zgody w dowolnym momencie, gdy przetwarzanie opiera się na zgodzie;",
        "prawa dotyczące zautomatyzowanego podejmowania decyzji, gdy art. 22 RODO ma zastosowanie.",
      ],
    },
    {
      heading: "20. Jak wykonać prawa",
      paragraphs: [
        "Wniosek można przesłać na legal@mydobra.pl. Dobra może poprosić o informacje konieczne do potwierdzenia tożsamości i ochrony danych przed nieuprawnionym ujawnieniem.",
        "Dobra odpowiada na wnioski w terminach przewidzianych RODO. W przypadkach określonych prawem realizacja prawa może zostać ograniczona, np. gdy dalsze przechowywanie jest wymagane obowiązkiem prawnym lub potrzebne do ustalenia, dochodzenia lub obrony roszczeń.",
      ],
    },
    {
      heading: "21. Skarga do organu nadzorczego",
      paragraphs: [
        "Osoba, której dane dotyczą, ma prawo wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych (PUODO), jeżeli uważa, że przetwarzanie jej danych narusza RODO.",
        "Aktualne dane kontaktowe i informacje o sposobie składania skarg są dostępne na oficjalnej stronie Urzędu Ochrony Danych Osobowych.",
      ],
    },
    {
      heading: "22. Dane dzieci",
      paragraphs: [
        "Platforma Dobra jest przeznaczona do zamawiania żywności i usług dostawy. Dobra nie zamierza świadomie gromadzić danych dzieci bez zapewnienia wymaganej prawem podstawy lub zgody przedstawiciela ustawowego.",
      ],
    },
    {
      heading: "23. Odbiorca Zamówienia inny niż użytkownik",
      paragraphs: [
        "Jeśli użytkownik podaje dane innej osoby jako odbiorcy Zamówienia, powinien przekazać wyłącznie dane potrzebne do dostawy i poinformować tę osobę, że jej dane zostaną wykorzystane w celu realizacji dostawy.",
        "Dobra przetwarza takie dane w zakresie niezbędnym do wykonania Zamówienia i odpowiednich prawnie uzasadnionych interesów, z uwzględnieniem obowiązków informacyjnych z art. 14 RODO.",
      ],
    },
    {
      heading: "24. Zmiany Polityki Prywatności",
      paragraphs: [
        "Dobra może aktualizować Politykę w związku ze zmianą prawa, funkcjonalności, dostawców, procesów lub środków bezpieczeństwa.",
        "O istotnych zmianach użytkownicy zostaną poinformowani w odpowiedni sposób, np. w aplikacji, na stronie lub pocztą elektroniczną, gdy jest to wymagane lub uzasadnione.",
      ],
    },
    {
      heading: "25. Kontakt",
      paragraphs: [
        "NICKOVWAY SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ, ul. Kościańska 34/8, 54-027 Wrocław, Polska.",
        "KRS: 0000791473 | NIP: 8982251132 | REGON: 383675818",
        "Sprawy prywatności i RODO: legal@mydobra.pl. Obsługa Klienta: support@mydobra.pl, tel. +48 505 645 999.",
      ],
    },
    {
      heading: "Podstawowe akty prawne",
      bullets: [
        "Rozporządzenie Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO).",
        "Ustawa z dnia 10 maja 2018 r. o ochronie danych osobowych.",
        "Właściwe polskie i unijne przepisy dotyczące usług elektronicznych, komunikacji elektronicznej oraz praw konsumenta.",
      ],
    },
  ],
};

export const TERMS_DOC: LegalDocument = {
  title: "Regulamin Platformy Dobra",
  meta: ["Wersja 1.0", "Terytorium: Rzeczpospolita Polska"],
  intro: [
    "Niniejszy Regulamin określa zasady dostępu do i korzystania z aplikacji mobilnej Dobra, strony internetowej oraz powiązanych usług („Platforma Dobra”).",
    "Platforma Dobra jest prowadzona przez NICKOVWAY SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ, ul. Kościańska 34/8, 54-027 Wrocław, Polska. KRS: 0000791473, NIP: 8982251132, REGON: 383675818, kapitał zakładowy: 5 000 PLN.",
    "Obsługa Klienta: support@mydobra.pl, tel. +48 505 645 999. Kontakt prawny i dotyczący prywatności: legal@mydobra.pl.",
  ],
  sections: [
    {
      heading: "1. Cel i zakres Regulaminu",
      paragraphs: [
        "1.1. Dobra prowadzi platformę internetową umożliwiającą zamawianie jedzenia i organizację dostawy na terytorium Polski.",
        "1.2. Za pośrednictwem Platformy Dobra Klient może w szczególności:",
      ],
      bullets: [
        "wyszukiwać restauracje i inne lokale gastronomiczne współpracujące z Dobra („Restauracje”);",
        "przeglądać menu i oferty Restauracji;",
        "składać zamówienia u Restauracji;",
        "dokonywać płatności przy użyciu metod dostępnych na Platformie;",
        "korzystać z usługi dostawy, jeżeli jest ona dostępna;",
        "śledzić status zamówienia i dostawy;",
        "kontaktować się z Dobra w sprawach dotyczących zamówień i dostaw.",
      ],
    },
    {
      heading: "2. Rola Dobra i Restauracji",
      paragraphs: [
        "2.1. Dobra udostępnia rozwiązanie technologiczne umożliwiające Klientom i Restauracjom zawieranie transakcji. O ile wyraźnie nie wskazano inaczej, Dobra nie jest sprzedawcą ani producentem żywności lub napojów oferowanych na Platformie.",
        "2.2. Restauracja wskazana na stronie Restauracji oraz podczas składania zamówienia jest sprzedawcą produktów i odpowiada w szczególności za przygotowanie posiłków, jakość i zgodność produktów, składniki, informacje o alergenach, bezpieczeństwo żywności, opisy i dostępność produktów oraz wymagane zezwolenia.",
        "2.3. Jeżeli zamówienie jest oznaczone jako dostarczane przez Dobra, Dobra organizuje lub zapewnia usługę dostawy z Restauracji do Klienta. Dostawa może być realizowana przez pracowników Dobra, niezależnych kurierów, przedsiębiorców w modelu B2B lub partnerów flotowych.",
        "2.4. Żadne postanowienie Regulaminu nie ogranicza praw Klienta wynikających z bezwzględnie obowiązujących przepisów prawa polskiego lub prawa Unii Europejskiej.",
      ],
    },
    {
      heading: "3. Konto Klienta",
      paragraphs: [
        "3.1. Korzystanie z niektórych funkcjonalności Platformy może wymagać utworzenia konta Dobra.",
        "3.2. Klient zobowiązany jest podawać prawdziwe, aktualne i kompletne dane.",
        "3.3. Klient nie może tworzyć konta przy użyciu danych innej osoby bez jej zgody, podawać fałszywych danych, tworzyć kont w celu oszustwa, udostępniać konta osobom nieuprawnionym ani korzystać z Platformy niezgodnie z prawem.",
        "3.4. Klient odpowiada za zachowanie poufności danych logowania. Podejrzenie nieautoryzowanego dostępu należy niezwłocznie zgłosić na support@mydobra.pl.",
      ],
    },
    {
      heading: "4. Usługi świadczone drogą elektroniczną i wymagania techniczne",
      paragraphs: [
        "4.1. Dobra świadczy drogą elektroniczną m.in. prowadzenie Konta Klienta, udostępnianie ofert Restauracji, składanie zamówień, obsługę płatności i dostaw, informacje o statusie zamówienia, obsługę klienta, system ocen i opinii, funkcjonalności promocyjne oraz powiadomienia.",
        "4.2. Korzystanie z Platformy wymaga dostępu do Internetu, kompatybilnego urządzenia, wspieranego systemu operacyjnego lub przeglądarki oraz — w razie potrzeby — aktywnego adresu e-mail i numeru telefonu.",
        "4.3. Klient nie może dostarczać treści bezprawnych ani korzystać z Platformy w sposób zakłócający jej działanie lub bezpieczeństwo.",
      ],
    },
    {
      heading: "5. Informacje o Restauracjach i produktach",
      paragraphs: [
        "5.1. Restauracja odpowiada za prawidłowość informacji dotyczących swoich produktów i ofert, w tym nazwy, adresu, menu, cen, składników, alergenów, opisów, godzin otwarcia i dostępności.",
        "5.2. Dobra może pomagać Restauracjom w prezentacji tych informacji, jednak nie powoduje to, że Dobra staje się sprzedawcą produktów Restauracji.",
      ],
    },
    {
      heading: "6. Alergie i nietolerancje pokarmowe",
      paragraphs: [
        "6.1. Klient posiadający alergie, nietolerancję pokarmową lub szczególne wymagania dietetyczne powinien dokładnie zapoznać się z informacjami przekazanymi przez Restaurację i w razie potrzeby skontaktować się z nią przed złożeniem zamówienia.",
        "6.2. Restauracja odpowiada za przekazywanie wymaganych prawem informacji o alergenach. Klient nie powinien zakładać, że produkt nie zawiera alergenu tylko dlatego, że nie występuje on w nazwie produktu.",
      ],
    },
    {
      heading: "7. Składanie zamówienia",
      paragraphs: [
        "7.1. Klient wybiera Restaurację, produkty, ilość, warianty, adres dostawy, sposób dostawy lub odbioru oraz metodę płatności.",
        "7.2. Przed złożeniem zamówienia Klient może sprawdzić zamówienie i poprawić ewentualne błędy.",
        "7.3. Przed potwierdzeniem zamówienia Dobra wyświetla całkowitą kwotę do zapłaty wraz z obowiązkowymi opłatami, a przycisk finalizacji jednoznacznie wskazuje obowiązek zapłaty.",
        "7.4. Automatyczne potwierdzenie otrzymania zamówienia nie musi oznaczać jego przyjęcia przez Restaurację. Klient otrzyma informację o przyjęciu lub odrzuceniu zamówienia.",
      ],
    },
    {
      heading: "8. Ceny i opłaty",
      paragraphs: [
        "8.1. Ceny dla Klientów podawane są w złotych polskich (PLN) i obejmują obowiązujące podatki, jeżeli wymagają tego przepisy.",
        "8.2. Całkowita cena zamówienia może obejmować:",
      ],
      bullets: [
        "wartość produktów Restauracji;",
        "opłatę za dostawę;",
        "opłatę serwisową, jeżeli jest stosowana;",
        "opłatę za małe zamówienie;",
        "inne dozwolone prawem opłaty, o których Klient zostanie wyraźnie poinformowany przed złożeniem zamówienia.",
      ],
    },
    {
      heading: "9. Płatności",
      paragraphs: [
        "9.1. Dobra umożliwia płatności za zamówienia Restauracji oraz usługi Dobra przy użyciu metod dostępnych na Platformie. Nie oznacza to, że Dobra staje się sprzedawcą produktów Restauracji.",
        "9.2. Płatności mogą być technicznie przetwarzane, rozliczane lub obsługiwane przez uprawnionych zewnętrznych dostawców usług płatniczych.",
        "9.3. Dostępne metody płatności mogą obejmować karty płatnicze, płatności mobilne i elektroniczne, przelewy oraz inne metody dostępne na Platformie.",
        "9.4. Dobra nie przechowuje pełnych danych kart płatniczych, jeżeli obsługa płatności realizowana jest przez zewnętrznego dostawcę.",
      ],
    },
    {
      heading: "10. Dostawa",
      paragraphs: [
        "10.1. Jeżeli Dobra zapewnia dostawę, organizuje transport przyjętego zamówienia z Restauracji na adres wskazany przez Klienta.",
        "10.2. Klient zobowiązany jest podać prawidłowy adres dostawy oraz informacje niezbędne do jej wykonania (numer budynku i mieszkania, kod lub instrukcje wejścia, inne informacje dotyczące dostępu) i pozostawać dostępny pod podanym numerem telefonu.",
        "10.3. Przewidywany czas dostawy ma charakter orientacyjny i nie stanowi gwarantowanego terminu. Na czas dostawy mogą wpływać m.in. czas przygotowania zamówienia, warunki drogowe i pogodowe, odległość, dostępność kurierów oraz inne okoliczności poza rozsądną kontrolą Dobra.",
      ],
    },
    {
      heading: "11. Nieobecność Klienta przy dostawie",
      paragraphs: [
        "11.1. Jeżeli kurier dotrze na miejsce, lecz nie będzie mógł zrealizować dostawy, mogą zostać podjęte rozsądne próby kontaktu telefonicznego, przez powiadomienie w aplikacji lub wiadomość elektroniczną.",
        "11.2. Dostawa może zostać uznana za nieudaną w przypadku błędnego adresu, braku dostępu do miejsca dostawy, braku kontaktu z Klientem lub nieodebrania zamówienia w rozsądnym czasie.",
        "11.3. Obciążenie Klienta kosztami lub odmowa zwrotu może nastąpić wyłącznie w zakresie zgodnym z obowiązującymi przepisami prawa.",
      ],
    },
    {
      heading: "12. Anulowanie zamówienia",
      paragraphs: [
        "12.1. Klient może wystąpić o anulowanie zamówienia za pośrednictwem Platformy, jeżeli taka funkcjonalność jest dostępna.",
        "12.2. Możliwość bezpłatnego anulowania może zależeć od tego, czy Restauracja przyjęła zamówienie, rozpoczęła lub zakończyła jego przygotowywanie oraz czy dostawa już się rozpoczęła.",
        "12.3. Punkt ten nie ogranicza bezwzględnie obowiązujących praw Klienta wynikających z prawa polskiego.",
      ],
    },
    {
      heading: "13. Prawo odstąpienia od umowy",
      paragraphs: [
        "13.1. Ustawowe prawo odstąpienia od umowy zawartej na odległość podlega wyjątkom określonym w przepisach prawa, w szczególności w odniesieniu do produktów szybko psujących się lub o krótkim terminie przydatności.",
        "13.2. Żadne postanowienie Regulaminu nie wyłącza prawa odstąpienia, jeżeli przysługuje ono Klientowi na podstawie bezwzględnie obowiązujących przepisów.",
      ],
    },
    {
      heading: "14. Nieprawidłowe, niekompletne lub uszkodzone zamówienia",
      paragraphs: [
        "Problemy dotyczące zamówienia należy zgłaszać w aplikacji Dobra lub na support@mydobra.pl — mogą one obejmować brakujące lub niewłaściwe produkty, poważne uszkodzenie zamówienia, brak dostawy, dostawę pod niewłaściwy adres lub istotne problemy jakościowe.",
        "Klient powinien podać numer zamówienia, opis problemu oraz, jeżeli to pomocne, zdjęcia. W zależności od charakteru problemu odpowiedzialność ponosi Restauracja lub Dobra, zgodnie z obowiązującym prawem.",
      ],
    },
    {
      heading: "15. Zwroty płatności",
      paragraphs: [
        "15.1. W zależności od okoliczności Klient może być uprawniony do pełnego lub częściowego zwrotu, wymiany produktu, uzupełnienia zamówienia lub innego środka ochrony przewidzianego prawem.",
        "15.2. Zwrot może być dokonany przy użyciu pierwotnej metody płatności, o ile jest to technicznie możliwe; czas zaksięgowania zależy od dostawcy płatności i banku Klienta.",
        "15.3. Dobra może dobrowolnie przyznać środki Dobra, kupon, rabat lub inną rekompensatę. Nie zastępuje to ustawowych praw Klienta.",
      ],
    },
    {
      heading: "16. Reklamacje",
      paragraphs: [
        "Reklamacje dotyczące Platformy Dobra lub usług dostawy można składać na adres: NICKOVWAY SP. Z O.O., ul. Kościańska 34/8, 54-027 Wrocław, Polska, e-mail: support@mydobra.pl, tel. +48 505 645 999.",
        "Reklamacja powinna, jeżeli to możliwe, zawierać imię i nazwisko Klienta, numer zamówienia, opis problemu oraz oczekiwany sposób rozwiązania sprawy. Dobra rozpatruje reklamacje w terminie wymaganym przepisami prawa.",
      ],
    },
    {
      heading: "17. Oceny i opinie",
      paragraphs: [
        "17.1. Dobra może umożliwiać Klientom wystawianie ocen i opinii dotyczących Restauracji, produktów oraz dostawy i oznaczać opinie pochodzące od Klientów, którzy faktycznie złożyli zamówienie.",
        "17.2. Opinie nie mogą zawierać treści bezprawnych, gróźb, treści obraźliwych, dyskryminujących, fałszywych informacji, spamu, nieuprawnionych reklam, danych osobowych ujawnionych bez podstawy prawnej ani treści naruszających prawa osób trzecich.",
      ],
    },
    {
      heading: "18. Ranking Restauracji",
      paragraphs: [
        "Restauracje i oferty mogą być porządkowane w oparciu o lokalizację Klienta i Restauracji, odległość i przewidywany czas dostawy, dostępność, godziny otwarcia, popularność, historię zamówień, oceny Klientów, cenę, dopasowanie, przepustowość dostaw, promocje i ustalenia handlowe z Dobra.",
        "Płatne pozycjonowanie, reklamy lub inne formy płatnego wpływania na widoczność będą oznaczone, jeżeli wymagają tego przepisy prawa.",
      ],
    },
    {
      heading: "19. Promocje i środki Dobra",
      paragraphs: [
        "19.1. Dobra może oferować kody rabatowe, kampanie promocyjne, programy poleceń, darmową dostawę, środki na koncie oraz promocje dotyczące konkretnych Restauracji.",
        "19.2. Warunki promocji mogą obejmować datę ważności, minimalną wartość zamówienia, wybrane Restauracje, ograniczenia terytorialne, warunki dotyczące konta, maksymalną wartość rabatu i ograniczenie liczby użyć.",
        "19.3. Zabronione jest nadużywanie promocji, m.in. przez tworzenie wielu kont, fałszywe polecenia lub nieuczciwe transakcje. Dobra może anulować korzyści uzyskane wskutek oszustwa lub nadużycia.",
      ],
    },
    {
      heading: "20. Dane lokalizacyjne Klienta",
      paragraphs: [
        "20.1. Za zgodą Klienta Dobra może wykorzystywać lokalizację urządzenia, aby wyświetlać Restauracje obsługujące dany obszar, sprawdzać dostępność dostawy, ułatwiać określenie miejsca dostawy, wyliczać przewidywany czas dostawy i prezentować odpowiednie oferty.",
        "20.2. Dostęp do lokalizacji można kontrolować w ustawieniach urządzenia. Szczegóły przetwarzania danych lokalizacyjnych opisuje Polityka Prywatności Dobra.",
      ],
    },
    {
      heading: "21. Śledzenie dostawy",
      paragraphs: [
        "21.1. Dobra może udostępniać funkcję śledzenia dostawy w czasie rzeczywistym lub w sposób przybliżony; w czasie aktywnej dostawy Klient może otrzymać informację o lokalizacji kuriera.",
        "21.2. Informacje te są udostępniane w celu realizacji zamówienia, bezpieczeństwa i usprawnienia dostawy i mogą nie przedstawiać dokładnego położenia kuriera w każdej chwili.",
      ],
    },
    {
      heading: "22. Dozwolone korzystanie z Platformy",
      bullets: [
        "korzystanie z Dobra w celach niezgodnych z prawem;",
        "dokonywanie lub próby dokonywania oszustw płatniczych;",
        "nadużywanie mechanizmów zwrotów lub chargeback;",
        "manipulowanie promocjami i tworzenie fałszywych kont;",
        "grożenie, nękanie lub obrażanie kurierów, pracowników Restauracji, pracowników Dobra lub innych osób;",
        "próby nieautoryzowanego dostępu do systemów Dobra lub zakłócanie bezpieczeństwa Platformy;",
        "wprowadzanie wirusów, złośliwego oprogramowania lub innego szkodliwego kodu;",
        "systematyczne pobieranie lub kopiowanie danych Platformy w sposób sprzeczny z prawem.",
      ],
      paragraphs: ["Klientowi zabrania się w szczególności:"],
    },
    {
      heading: "23. Ograniczenie lub zawieszenie konta",
      paragraphs: [
        "Dobra może ograniczyć, zawiesić lub — w uzasadnionych przypadkach — zakończyć możliwość korzystania z konta z powodu oszustwa lub jego podejrzenia, poważnego lub powtarzającego się naruszania Regulaminu, nadużyć płatniczych, gróźb lub nękania, zagrożenia bezpieczeństwa, działalności niezgodnej z prawem, nadużywania promocji lub konieczności ochrony Klientów, Restauracji, kurierów albo Dobra.",
        "Działania takie będą podejmowane z poszanowaniem bezwzględnie obowiązujących przepisów prawa i proporcjonalnie do okoliczności.",
      ],
    },
    {
      heading: "24. Dostępność Platformy",
      paragraphs: [
        "Dobra podejmuje uzasadnione działania w celu zapewnienia stabilnego działania Platformy, jednak nie gwarantuje nieprzerwanej dostępności. Przerwy mogą wystąpić m.in. z powodu prac serwisowych, aktualizacji, awarii technicznych lub sieci telekomunikacyjnych, incydentów cyberbezpieczeństwa oraz okoliczności poza rozsądną kontrolą Dobra.",
        "Niniejszy punkt nie ogranicza bezwzględnie obowiązujących praw Klienta.",
      ],
    },
    {
      heading: "25. Odpowiedzialność",
      paragraphs: [
        "25.1. Dobra odpowiada za własne zobowiązania wynikające z umowy zgodnie z obowiązującym prawem, w tym za zobowiązania związane z usługą dostawy.",
        "25.2. Jeżeli Restauracja jest sprzedawcą, odpowiedzialność za umowę sprzedaży oraz produkty Restauracji spoczywa na Restauracji w zakresie wynikającym z prawa.",
        "25.3. Żadne postanowienie Regulaminu nie wyłącza ani nie ogranicza odpowiedzialności tam, gdzie jest to prawnie niedopuszczalne, ani bezwzględnie obowiązujących praw konsumenta.",
      ],
    },
    {
      heading: "26. Dane osobowe",
      paragraphs: [
        "Dane osobowe są przetwarzane zgodnie z Polityką Prywatności Dobra. W zależności od sposobu korzystania z Platformy Dobra może przetwarzać m.in. dane konta, imię i nazwisko, numer telefonu, adres e-mail, adresy dostawy, historię zamówień, korespondencję z obsługą klienta, informacje o płatnościach, urządzeniu, adresie IP i lokalizacji oraz dane wykorzystywane do zapobiegania oszustwom.",
        "Kontakt w sprawach prywatności: legal@mydobra.pl.",
      ],
    },
    {
      heading: "27. Zmiany Regulaminu",
      paragraphs: [
        "Dobra może zmienić Regulamin z uzasadnionych przyczyn, takich jak zmiany przepisów prawa, nowe wymagania regulacyjne, wprowadzenie nowych funkcjonalności, zmiana usług, wymagania bezpieczeństwa, zmiany technologiczne lub zmiany modelu działalności.",
        "Klienci zostaną poinformowani o istotnych zmianach zgodnie z obowiązującym prawem. Zmiany nie pozbawiają Klienta praw nabytych w odniesieniu do zamówień zrealizowanych przed ich wejściem w życie.",
      ],
    },
    {
      heading: "28. Prawa konsumenta",
      paragraphs: [
        "Żadne postanowienie Regulaminu nie wyłącza, nie ogranicza ani nie zmienia praw konsumenta, których nie można skutecznie wykluczyć na podstawie prawa polskiego lub prawa Unii Europejskiej.",
        "Klient może uzyskać informacje dotyczące praw konsumenta od właściwych organów ochrony konsumentów oraz organizacji konsumenckich.",
      ],
    },
    {
      heading: "29. Prawo właściwe i spory",
      paragraphs: [
        "Niniejszy Regulamin podlega prawu Rzeczypospolitej Polskiej, z uwzględnieniem bezwzględnie obowiązujących przepisów prawa Unii Europejskiej.",
        "W przypadku Klientów będących konsumentami postanowienia Regulaminu nie ograniczają zasad jurysdykcji ani innych praw ochronnych. Spory mogą być kierowane do właściwych sądów zgodnie z obowiązującymi przepisami.",
      ],
    },
    {
      heading: "30. Kontakt",
      paragraphs: [
        "Obsługa Klienta: support@mydobra.pl, tel. +48 505 645 999 — sprawy dotyczące zamówień, dostaw, zwrotów, kont i reklamacji.",
        "Sprawy prawne i prywatność: legal@mydobra.pl.",
        "Operator Platformy: NICKOVWAY SP. Z O.O., ul. Kościańska 34/8, 54-027 Wrocław, Polska. KRS: 0000791473 | NIP: 8982251132 | REGON: 383675818 | Kapitał zakładowy: 5 000 PLN.",
      ],
    },
  ],
};
