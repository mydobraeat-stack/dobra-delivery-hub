import type { LegalDocument } from "./legal-content";

/** Machine-assisted translations of the Polish legal documents (Polish is the binding version). */
export const LEGAL_TRANSLATIONS: Record<"en" | "uk" | "fr", { privacy: LegalDocument; terms: LegalDocument }> = {
 "en": {
  "privacy": {
   "sections": [
    {
     "heading": "1. Data Controller",
     "paragraphs": [
      "The Data Controller is NICKOVWAY SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ, ul. Jana III Sobieskiego 38, 55-330 Lutynia, Poland, KRS 0000791473, NIP 8982251132, REGON 383675818 (“Dobra”, “Controller”).",
      "Contact for privacy and data protection matters: legal@mydobra.pl. Customer Service: support@mydobra.pl, tel. +48 505 645 999.",
      "If Dobra appoints a Data Protection Officer, their contact details will be published on the Platform and in this Policy."
     ]
    },
    {
     "heading": "2. Who the Policy applies to",
     "bullets": [
      "Clients and users of the application or website of Dobra;",
      "persons setting up an account or placing Orders;",
      "persons contacting Customer Service;",
      "persons representing or employed by Restaurants and other Partners;",
      "recipients of deliveries and other persons whose data is provided in connection with an Order;",
      "users participating in promotions, referral programs, surveys or research."
     ]
    },
    {
     "heading": "3. What data we may process",
     "bullets": [
      "identification and account data: first name, last name, user ID, login details;",
      "contact data: e-mail, phone number, delivery address;",
      "Order data: Restaurant, products, amounts, order history and status, delivery instructions;",
      "payment and billing data: payment method, transaction identifiers, payment status, refunds and chargebacks; full card details are generally handled by the payment provider;",
      "location data: device location with consent and location required for delivery;",
      "technical data: IP address, device or application identifiers, operating system, browser, logs, security events;",
      "communication data: content of reports, chats, emails, calls or other contacts with Dobra, to the extent permitted by law;",
      "feedback and ratings data;",
      "data on promotions, coupons, referrals and preferences;",
      "fraud prevention and security data, including transaction or account risk signals;",
      "data of Partners' representatives: business data, position, authorizations, billing and contact data."
     ]
    },
    {
     "heading": "4. Sources of Data",
     "paragraphs": [
      "We obtain data directly from the user during registration, placing an Order, making payments, contacting support, using location, or other functions.",
      "We may also receive data from Restaurants, couriers and fleet partners, payment providers, login or technical service providers, fraud prevention partners, and from public sources to the extent permitted by law.",
      "If data has not been obtained directly from the individual, Dobra fulfills the information obligation in accordance with Art. 14 GDPR, unless a statutory exception applies."
     ]
    },
    {
     "heading": "5. Purposes and Legal Bases for Processing",
     "paragraphs": [
      "Dobra processes data only when there is an appropriate legal basis. Depending on the process, this may be the performance of a contract or actions prior to its conclusion (Art. 6 section 1 letter b GDPR), a legal obligation (letter c), the legitimate interest of Dobra or a third party (letter f), or consent (letter a).",
      "The legal basis should be assessed separately for each process; consent is not used as a default basis if processing is necessary for the performance of a contract or a legal obligation."
     ]
    },
    {
     "heading": "6. Account and Order Processing",
     "paragraphs": [
      "We process data for the purpose of creating and managing accounts, accepting Orders, forwarding them to the Restaurant, ensuring Platform functionality, communicating status, and handling delivery.",
      "The legal basis is primarily Article 6(1)(b) of the GDPR — necessity for the performance of a contract or for taking steps at the request of the data subject prior to entering into a contract."
     ]
    },
    {
     "heading": "7. Payments, Settlements, and Refunds",
     "paragraphs": [
      "We process data necessary for initiating and handling payments, confirming transaction status, settlements with Restaurants, refunds, payment complaints, and accounting.",
      "The basis for this may be the performance of a contract, legal tax and accounting obligations, and a legitimate interest in pursuing or defending claims.",
      "Payment services may be performed by a separate payment service provider acting as an independent controller or processor — in accordance with its role and documentation."
     ]
    },
    {
     "heading": "8. Delivery and geolocation",
     "paragraphs": [
      "Address and contact details are used for delivery fulfillment. If the user enables access to the device's location, Dobra may use the location to determine the delivery area, suggest an address, estimate time, and support Order fulfillment.",
      "The basis for processing data necessary for delivery is the performance of the contract. Application access to the device's precise location depends on the user's settings and permissions.",
      "During active delivery, Dobra may present the Customer with the courier's approximate or current location to the extent necessary for service fulfillment and safety."
     ]
    },
    {
     "heading": "9. Customer Service and Complaints",
     "paragraphs": [
      "We process data related to reports for the purpose of providing assistance, handling complaints, returns, disputes, ensuring security, and improving service quality.",
      "The legal basis for this may be the performance of a contract, a legal obligation, or the legitimate interest of Dobra in serving users, documenting events, and defending against claims."
     ]
    },
    {
     "heading": "10. Security, Abuse, and Fraud Prevention",
     "paragraphs": [
      "Dobra may analyze account, device, Order, payment, and Platform behavior data to detect fraud, promotion abuse, account takeovers, security threats, and other irregularities.",
      "The legal basis for this is, in particular, the legitimate interest of Dobra, Customers, Restaurants, and partners in protecting the Platform and transactions, and — where applicable — a legal obligation.",
      "If, in the future, a decision producing legal effects or similarly significantly affecting an individual is based solely on automated processing, Dobra will provide the information and safeguards required by Article 22 of the GDPR."
     ]
    },
    {
     "heading": "11. Personalisation, Ranking, and Analytics",
     "paragraphs": [
      "Dobra may use information regarding location, Order history, Restaurant availability, popularity, ratings, and interactions to order results, improve relevance, and enhance the Platform's operation.",
      "The basis for this may be the performance of the service and a legitimate interest in developing and adapting the Platform. If regulations require consent for specific tracking technologies, data will be used only after such consent has been obtained."
     ]
    },
    {
     "heading": "12. Marketing and commercial communication",
     "paragraphs": [
      "Dobra may send information about promotions, offers, or new features solely in accordance with applicable electronic marketing regulations and consents.",
      "The User may withdraw marketing consent or object to direct marketing at any time. Withdrawal of consent does not affect the lawfulness of prior processing.",
      "Purely transactional communications, such as Order confirmation or delivery information, are not marketing and may be sent for the purpose of service performance."
     ]
    },
    {
     "heading": "13. Cookies, SDK and similar technologies",
     "paragraphs": [
      "The Dobra website and application may use cookies, SDKs, and similar technologies essential for operation, security, remembering settings, analytics, and marketing.",
      "Technologies that are not strictly necessary will be activated based on required consent. The User should be able to manage and withdraw their consents."
     ]
    },
    {
     "heading": "14. To whom we disclose data",
     "bullets": [
      "Restaurants — to the extent necessary for the acceptance and execution of the Order and complaints;",
      "couriers and fleet partners — to the extent necessary for collection and delivery;",
      "payment service providers and financial institutions;",
      "providers of hosting, cloud, databases, communication, support, maps, analytics, cybersecurity, and IT tools;",
      "legal, tax, accounting advisors, auditors, and insurers;",
      "public authorities, courts, and law enforcement agencies, when there is a legal basis;",
      "purchasers or legal successors in the context of reorganization, merger, or sale of the business, with appropriate safeguards."
     ]
    },
    {
     "heading": "15. Restaurants, Couriers, and Independent Controllers",
     "paragraphs": [
      "A restaurant is, as a rule, an independent data controller of the data it receives for the purpose of fulfilling its sales contract with the Customer and its own legal obligations.",
      "Depending on the model, a courier, fleet partner, or payment provider may act as an independent controller or process data on behalf of Dobra.",
      "Dobra is not responsible for independent processing purposes carried out by another controller; such an entity should provide its own information required by the GDPR."
     ]
    },
    {
     "heading": "16. Transfer of Data Outside the EEA",
     "paragraphs": [
      "Dobra prefers to process data within the European Economic Area; however, some technological service providers may process data outside the EEA.",
      "If data is transferred to a country without an adequacy decision, Dobra will apply appropriate mechanisms provided for in the GDPR, such as standard contractual clauses, and additional safeguards where required.",
      "Information regarding the applied safeguards can be obtained by contacting legal@mydobra.pl."
     ]
    },
    {
     "heading": "17. Retention Periods",
     "paragraphs": [
      "Dobra retains data for no longer than is necessary for the purposes for which it was collected, taking into account legal, tax, accounting, security, and claims limitation period requirements.",
      "The account and operational data may be stored for the period of account use, and after its closure, for the period necessary for settlements, complaints, protection against claims, and legal obligations.",
      "Tax and accounting documentation is stored for the period required by law. Security data and logs are stored for a period proportional to the risk and investigative needs."
     ]
    },
    {
     "heading": "18. Data Security",
     "paragraphs": [
      "Dobra implements appropriate technical and organizational measures commensurate with the risk, which may include access control, authentication, encryption in transit and, where appropriate, at rest, event logging, backups, vulnerability management, privilege restriction, and incident response procedures.",
      "No system provides absolute security; therefore, measures are periodically assessed and adjusted to the risk."
     ]
    },
    {
     "heading": "19. Rights of Data Subjects",
     "bullets": [
      "the right to access data and obtain a copy thereof;",
      "the right to rectification of inaccurate data;",
      "the right to erasure of data, when the conditions of the GDPR are met;",
      "the right to restriction of processing;",
      "the right to data portability in cases provided for by the GDPR;",
      "the right to object to processing based on a legitimate interest;",
      "the absolute right to object to direct marketing;",
      "the right to withdraw consent at any time, when processing is based on consent;",
      "rights relating to automated decision-making, where Article 22 of the GDPR applies."
     ]
    },
    {
     "heading": "20. How to exercise your rights",
     "paragraphs": [
      "Requests can be sent to legal@mydobra.pl. Dobra may request information necessary to confirm identity and protect data from unauthorized disclosure.",
      "Dobra responds to requests within the timeframes stipulated by the GDPR. In cases defined by law, the exercise of a right may be restricted, for example, when further storage is required by a legal obligation or is necessary for the establishment, exercise, or defense of legal claims."
     ]
    },
    {
     "heading": "21. Complaint to the Supervisory Authority",
     "paragraphs": [
      "The data subject has the right to lodge a complaint with the President of the Personal Data Protection Office (PUODO) if they consider that the processing of their data violates the GDPR.",
      "Current contact details and information on how to lodge a complaint are available on the official website of the Personal Data Protection Office."
     ]
    },
    {
     "heading": "22. Children's Data",
     "paragraphs": [
      "The Dobra Platform is intended for ordering food and delivery services. Dobra does not knowingly collect children's data without providing the legally required basis or the consent of a legal representative."
     ]
    },
    {
     "heading": "23. Recipient of the Order other than the user",
     "paragraphs": [
      "If the user provides the data of another person as the recipient of the Order, they should provide only the data necessary for delivery and inform that person that their data will be used for delivery purposes.",
      "Dobra processes such data to the extent necessary for the performance of the Order and the relevant legitimate interests, taking into account the information obligations under Article 14 of the GDPR."
     ]
    },
    {
     "heading": "24. Amendments to the Privacy Policy",
     "paragraphs": [
      "Dobra may update the Policy due to changes in law, functionality, suppliers, processes, or security measures.",
      "Users will be informed of significant changes in an appropriate manner, e.g., within the application, on the website, or via email, when required or justified."
     ]
    },
    {
     "heading": "25. Contact",
     "paragraphs": [
      "NICKOVWAY SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ, ul. Jana III Sobieskiego 38, 55-330 Lutynia, Polska.",
      "KRS: 0000791473 | NIP: 8982251132 | REGON: 383675818",
      "Privacy and GDPR matters: legal@mydobra.pl. Customer Service: support@mydobra.pl, tel. +48 505 645 999."
     ]
    },
    {
     "heading": "Basic Legal Acts",
     "bullets": [
      "Regulation (EU) 2016/679 of the European Parliament and of the Council (GDPR).",
      "Act of May 10, 2018, on the Protection of Personal Data.",
      "Relevant Polish and EU regulations concerning electronic services, electronic communication, and consumer rights."
     ]
    }
   ],
   "title": "Privacy and Personal Data Protection Policy",
   "meta": [
    "GDPR",
    "Version 1.0",
    "Territory: Republic of Poland"
   ],
   "intro": [
    "This Privacy Policy explains how NICKOVWAY SP. Z O.O., operating under the brand Dobra, processes the personal data of Dobra Platform users, Customers, contact persons of Restaurant Partners, and other individuals using Dobra's services."
   ]
  },
  "terms": {
   "sections": [
    {
     "heading": "1. Purpose and Scope of the Regulations",
     "paragraphs": [
      "1.1. Dobra operates an online platform enabling the ordering of food and the organization of delivery within the territory of Poland.",
      "1.2. Through the Dobra Platform, the Client may, in particular:"
     ],
     "bullets": [
      "search for restaurants and other catering establishments cooperating with Dobra (\"Restaurants\");",
      "browse menus and offers of Restaurants;",
      "place orders with Restaurants;",
      "make payments using the methods available on the Platform;",
      "utilize delivery services, if available;",
      "track the status of orders and deliveries;",
      "contact Dobra regarding orders and deliveries."
     ]
    },
    {
     "heading": "2. The Role of Dobra and Restaurants",
     "paragraphs": [
      "2.1. Dobra provides a technological solution enabling Customers and Restaurants to enter into transactions. Unless expressly stated otherwise, Dobra is not the seller or producer of the food or beverages offered on the Platform.",
      "2.2. The Restaurant indicated on the Restaurant's page and during order placement is the seller of the products and is responsible, in particular, for meal preparation, product quality and conformity, ingredients, allergen information, food safety, product descriptions and availability, and required permits.",
      "2.3. If an order is marked as delivered by Dobra, Dobra organizes or provides the delivery service from the Restaurant to the Customer. Delivery may be carried out by Dobra's employees, independent couriers, B2B entrepreneurs, or fleet partners.",
      "2.4. No provision of the Regulations shall limit the Customer's rights arising from mandatory provisions of Polish law or European Union law."
     ]
    },
    {
     "heading": "3. Client Account",
     "paragraphs": [
      "3.1. The use of certain functionalities of the Platform may require the creation of a Dobra account.",
      "3.2. The Client is obliged to provide true, current, and complete data.",
      "3.3. The Client may not create an account using another person's data without their consent, provide false data, create accounts for the purpose of fraud, share the account with unauthorized persons, or use the Platform unlawfully.",
      "3.4. The Client is responsible for maintaining the confidentiality of login data. Suspicion of unauthorized access should be reported immediately to support@mydobra.pl."
     ]
    },
    {
     "heading": "4. Services Provided Electronically and Technical Requirements",
     "paragraphs": [
      "4.1. The Goods Provider offers electronically, among others, the maintenance of the Customer Account, presentation of Restaurant offers, order placement, payment and delivery handling, order status information, customer service, a rating and review system, promotional functionalities, and notifications.",
      "4.2. Use of the Platform requires Internet access, a compatible device, a supported operating system or browser, and – if necessary – an active email address and phone number.",
      "4.3. The Customer may not provide unlawful content or use the Platform in a manner that disrupts its operation or security."
     ]
    },
    {
     "heading": "5. Information about Restaurants and products",
     "paragraphs": [
      "5.1. The Restaurant is responsible for the accuracy of information regarding its products and offers, including name, address, menu, prices, ingredients, allergens, descriptions, opening hours, and availability.",
      "5.2. Dobra may assist Restaurants in presenting this information; however, this does not mean that Dobra becomes the seller of the Restaurant's products."
     ]
    },
    {
     "heading": "6. Food allergies and intolerances",
     "paragraphs": [
      "6.1. A Customer with allergies, food intolerance or special dietary requirements should carefully review the information provided by the Restaurant and, if necessary, contact the Restaurant before placing an order.",
      "6.2. The Restaurant is responsible for providing legally required allergen information. The Customer should not assume that a product does not contain an allergen merely because it is not present in the product's name."
     ]
    },
    {
     "heading": "7. Placing an Order",
     "paragraphs": [
      "7.1. The Client selects the Restaurant, products, quantity, variants, delivery address, delivery or pick-up method, and payment method.",
      "7.2. Before placing an order, the Client may review the order and correct any errors.",
      "7.3. Before confirming the order, Dobra displays the total amount due, including mandatory fees, and the finalisation button clearly indicates the obligation to pay.",
      "7.4. Automatic confirmation of order receipt does not necessarily mean its acceptance by the Restaurant. The Client will receive information regarding the acceptance or rejection of the order."
     ]
    },
    {
     "heading": "8. Prices and Fees",
     "paragraphs": [
      "8.1. Prices for Clients are provided in Polish Zloty (PLN) and include applicable taxes, if required by law.",
      "8.2. The total price of an order may include:"
     ],
     "bullets": [
      "the value of the Restaurant's products;",
      "delivery fee;",
      "service fee, if applicable;",
      "small order fee;",
      "other legally permissible fees, of which the Client will be expressly informed before placing the order."
     ]
    },
    {
     "heading": "9. Payments",
     "paragraphs": [
      "9.1. Dobra enables payments for Restaurant orders and Dobra services using the methods available on the Platform. This does not imply that Dobra becomes the seller of the Restaurant's products.",
      "9.2. Payments may be technically processed, settled, or handled by authorized external payment service providers.",
      "9.3. Available payment methods may include payment cards, mobile and electronic payments, bank transfers, and other methods available on the Platform.",
      "9.4. Dobra does not store full payment card data if payment processing is carried out by an external provider."
     ]
    },
    {
     "heading": "10. Delivery",
     "paragraphs": [
      "10.1. If Dobra provides delivery, it will arrange for the transportation of the accepted order from the Restaurant to the address specified by the Customer.",
      "10.2. The Customer is obliged to provide a correct delivery address and information necessary for its execution (building and apartment number, entry code or instructions, other access information) and to remain available at the provided phone number.",
      "10.3. The estimated delivery time is indicative and does not constitute a guaranteed deadline. Delivery time may be affected by, among other factors, order preparation time, road and weather conditions, distance, courier availability, and other circumstances beyond Dobra's reasonable control."
     ]
    },
    {
     "heading": "11. Client Absence at Delivery",
     "paragraphs": [
      "11.1. If the courier arrives at the location but is unable to complete the delivery, reasonable attempts may be made to contact the client by telephone, in-app notification, or electronic message.",
      "11.2. Delivery may be deemed unsuccessful in cases of an incorrect address, lack of access to the delivery location, inability to contact the Client, or failure to collect the order within a reasonable timeframe.",
      "11.3. The Client may be charged costs or denied a refund only to the extent consistent with applicable law."
     ]
    },
    {
     "heading": "12. Order Cancellation",
     "paragraphs": [
      "12.1. The Customer may request an order cancellation via the Platform, if such functionality is available.",
      "12.2. The possibility of free cancellation may depend on whether the Restaurant has accepted the order, started or completed its preparation, and whether delivery has already commenced.",
      "12.3. This point does not limit the Customer's mandatory rights arising from Polish law."
     ]
    },
    {
     "heading": "13. Right of withdrawal from the contract",
     "paragraphs": [
      "13.1. The statutory right to withdraw from a distance contract is subject to exceptions specified in legal provisions, particularly regarding perishable products or products with a short shelf life.",
      "13.2. No provision of these Regulations excludes the right of withdrawal, if such right is vested in the Customer pursuant to absolutely binding legal provisions."
     ]
    },
    {
     "heading": "14. Incorrect, Incomplete, or Damaged Orders",
     "paragraphs": [
      "Order-related issues should be reported via the Dobra application or to support@mydobra.pl — these may include missing or incorrect products, significant damage to the order, non-delivery, delivery to the wrong address, or substantial quality problems.",
      "The Customer should provide the order number, a description of the issue, and, if helpful, photographs. Depending on the nature of the problem, responsibility lies with the Restaurant or Dobra, in accordance with applicable law."
     ]
    },
    {
     "heading": "15. Refunds",
     "paragraphs": [
      "15.1. Depending on the circumstances, the Customer may be entitled to a full or partial refund, product exchange, order completion, or other legal remedy.",
      "15.2. A refund may be issued using the original payment method, if technically possible; the time for crediting depends on the payment provider and the Customer's bank.",
      "15.3. Dobra may voluntarily grant Dobra funds, a voucher, discount, or other compensation. This does not supersede the Customer's statutory rights."
     ]
    },
    {
     "heading": "16. Complaints",
     "paragraphs": [
      "Complaints regarding the Dobra Platform or delivery services may be submitted to the following address: NICKOVWAY SP. Z O.O., ul. Jana III Sobieskiego 38, 55-330 Lutynia, Polska, e-mail: support@mydobra.pl, tel. +48 505 645 999.",
      "A complaint should, if possible, include the Customer's name and surname, order number, a description of the problem, and the expected resolution. Dobra shall process complaints within the period required by law."
     ]
    },
    {
     "heading": "17. Ratings and Reviews",
     "paragraphs": [
      "17.1. Dobra may enable Clients to post ratings and reviews concerning Restaurants, products, and delivery, and may designate reviews originating from Clients who have actually placed an order.",
      "17.2. Reviews may not contain unlawful content, threats, offensive content, discriminatory content, false information, spam, unauthorized advertisements, personal data disclosed without a legal basis, or content infringing on the rights of third parties."
     ]
    },
    {
     "heading": "18. Restaurant Ranking",
     "paragraphs": [
      "Restaurants and offers may be ranked based on the Customer's and Restaurant's location, distance and estimated delivery time, availability, opening hours, popularity, order history, Customer ratings, price, suitability, delivery capacity, promotions, and commercial arrangements with Dobra.",
      "Paid positioning, advertisements, or other forms of paid influence on visibility will be marked if required by law."
     ]
    },
    {
     "heading": "19. Promotions and Dobra Funds",
     "paragraphs": [
      "19.1. Dobra may offer discount codes, promotional campaigns, referral programs, free delivery, account credits, and promotions related to specific Restaurants.",
      "19.2. Promotion conditions may include an expiry date, minimum order value, selected Restaurants, territorial restrictions, account-related conditions, maximum discount value, and a limit on the number of uses.",
      "19.3. Abuse of promotions is prohibited, including through the creation of multiple accounts, false referrals, or fraudulent transactions. Dobra may cancel benefits obtained as a result of fraud or abuse."
     ]
    },
    {
     "heading": "20. Client Location Data",
     "paragraphs": [
      "20.1. With the Client's consent, Dobra may use the device's location to display Restaurants serving a given area, check delivery availability, facilitate the determination of the delivery location, calculate the estimated delivery time, and present relevant offers.",
      "20.2. Access to location can be controlled in the device settings. Details regarding the processing of location data are described in Dobra's Privacy Policy."
     ]
    },
    {
     "heading": "21. Delivery Tracking",
     "paragraphs": [
      "21.1. Dobra may provide a real-time or approximate delivery tracking function; during active delivery, the Client may receive information about the courier's location.",
      "21.2. This information is provided for the purpose of order fulfillment, security, and improvement of delivery, and may not represent the exact position of the courier at all times."
     ]
    },
    {
     "heading": "22. Prohibited Use of the Platform",
     "bullets": [
      "using the Service for unlawful purposes;",
      "committing or attempting to commit payment fraud;",
      "abusing return or chargeback mechanisms;",
      "manipulating promotions and creating fake accounts;",
      "threatening, harassing, or insulting couriers, Restaurant employees, Service employees, or other individuals;",
      "attempting unauthorized access to Service systems or disrupting the security of the Platform;",
      "introducing viruses, malware, or other harmful code;",
      "systematically downloading or copying Platform data in an unlawful manner."
     ],
     "paragraphs": [
      "The Client is specifically prohibited from:"
     ]
    },
    {
     "heading": "23. Restriction or suspension of account",
     "paragraphs": [
      "Dobra may restrict, suspend or – in justified cases – terminate the possibility of using an account due to fraud or suspected fraud, serious or repeated violation of the Regulations, payment abuse, threats or harassment, security threats, illegal activities, abuse of promotions, or the need to protect Customers, Restaurants, couriers, or Dobra.",
      "Such actions will be taken in compliance with absolutely binding legal provisions and proportionally to the circumstances."
     ]
    },
    {
     "heading": "24. Platform Availability",
     "paragraphs": [
      "Dobra undertakes reasonable measures to ensure the stable operation of the Platform; however, it does not guarantee uninterrupted availability. Interruptions may occur, inter alia, due to maintenance work, updates, technical failures or telecommunications networks, cybersecurity incidents, and circumstances beyond Dobra's reasonable control.",
      "This clause does not limit the absolutely binding rights of the Client."
     ]
    },
    {
     "heading": "25. Liability",
     "paragraphs": [
      "25.1. Dobra shall be liable for its own obligations arising from the agreement in accordance with applicable law, including obligations related to the delivery service.",
      "25.2. If the Restaurant is the seller, liability for the sales contract and the Restaurant's products rests with the Restaurant to the extent provided by law.",
      "25.3. No provision of the Regulations shall exclude or limit liability where it is legally impermissible, nor shall it exclude or limit the absolute rights of the consumer."
     ]
    },
    {
     "heading": "26. Personal Data",
     "paragraphs": [
      "Personal data is processed in accordance with Dobra's Privacy Policy. Depending on how the Platform is used, Dobra may process, among others, account data, name and surname, phone number, email address, delivery addresses, order history, correspondence with customer service, payment information, device information, IP address and location, and data used for fraud prevention.",
      "Contact for privacy matters: legal@mydobra.pl."
     ]
    },
    {
     "heading": "27. Amendments to the Regulations",
     "paragraphs": [
      "Dobra may amend the Regulations for justified reasons, such as changes in legal provisions, new regulatory requirements, the introduction of new functionalities, changes in services, security requirements, technological changes, or changes in the business model.",
      "Clients will be informed about significant changes in accordance with applicable law. Amendments shall not deprive the Client of rights acquired in relation to orders fulfilled before their entry into force."
     ]
    },
    {
     "heading": "28. Consumer Rights",
     "paragraphs": [
      "No provision of these Regulations shall exclude, limit, or alter consumer rights that cannot be effectively excluded under Polish law or European Union law.",
      "The Customer may obtain information regarding consumer rights from the relevant consumer protection authorities and consumer organizations."
     ]
    },
    {
     "heading": "29. Governing Law and Disputes",
     "paragraphs": [
      "These Regulations are governed by the law of the Republic of Poland, taking into account the mandatory provisions of European Union law.",
      "In the case of Customers who are consumers, the provisions of the Regulations do not restrict jurisdiction rules or other protective rights. Disputes may be referred to the competent courts in accordance with applicable regulations."
     ]
    },
    {
     "heading": "30. Contact",
     "paragraphs": [
      "Customer Service: support@mydobra.pl, tel. +48 505 645 999 — matters concerning orders, deliveries, returns, accounts, and complaints.",
      "Legal and Privacy matters: legal@mydobra.pl.",
      "Platform Operator: NICKOVWAY SP. Z O.O., ul. Jana III Sobieskiego 38, 55-330 Lutynia, Polska. KRS: 0000791473 | NIP: 8982251132 | REGON: 383675818 | Share capital: 5,000 PLN."
     ]
    }
   ],
   "title": "Dobra Platform Terms of Service",
   "meta": [
    "Version 1.0",
    "Territory: Republic of Poland"
   ],
   "intro": [
    "These Regulations define the rules for accessing and using the Dobra mobile application, website, and related services (the \"Dobra Platform\").",
    "The Dobra Platform is operated by NICKOVWAY SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ, ul. Jana III Sobieskiego 38, 55-330 Lutynia, Polska. KRS: 0000791473, NIP: 8982251132, REGON: 383675818, share capital: 5,000 PLN.",
    "Customer Support: support@mydobra.pl, tel. +48 505 645 999. Legal and Privacy Contact: legal@mydobra.pl."
   ]
  }
 },
 "uk": {
  "privacy": {
   "sections": [
    {
     "heading": "1. Адміністратор даних",
     "paragraphs": [
      "Адміністратором персональних даних є NICKOVWAY SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ, ul. Jana III Sobieskiego 38, 55-330 Lutynia, Polska, KRS 0000791473, NIP 8982251132, REGON 383675818 («Dobra», «Адміністратор»).",
      "Контакт з питань конфіденційності та захисту даних: legal@mydobra.pl. Служба підтримки клієнтів: support@mydobra.pl, тел. +48 505 645 999.",
      "Якщо Dobra призначить Інспектора із захисту даних, його контактні дані будуть опубліковані на Платформі та в цій Політиці."
     ]
    },
    {
     "heading": "2. Кого стосується Політика",
     "bullets": [
      "Клієнтів та користувачів додатку або вебсайту Dobra;",
      "осіб, які реєструють обліковий запис або оформлюють Замовлення;",
      "осіб, які контактують зі службою підтримки Клієнтів;",
      "осіб, які представляють Ресторани та інших Партнерів або є їхніми працівниками;",
      "одержувачів поставок та інших осіб, чиї дані надаються у зв'язку із Замовленням;",
      "користувачів, які беруть участь в акціях, реферальних програмах, опитуваннях або дослідженнях."
     ]
    },
    {
     "heading": "3. Які дані ми можемо обробляти",
     "bullets": [
      "ідентифікаційні дані та дані облікового запису: ім’я, прізвище, ідентифікатор користувача, дані для входу;",
      "контактні дані: електронна пошта, номер телефону, адреса доставки;",
      "дані Замовлень: Ресторан, продукти, суми, історія та статус Замовлень, інструкції щодо доставки;",
      "платіжні та розрахункові дані: метод оплати, ідентифікатори транзакцій, статус платежу, повернення коштів та відкликання платежів (chargeback); повні дані картки, як правило, обробляються постачальником платіжних послуг;",
      "дані про місцезнаходження: місцезнаходження пристрою за згодою, а також місцезнаходження, необхідне для доставки;",
      "технічні дані: IP-адреса, ідентифікатори пристрою або програми, операційна система, браузер, журнали, події безпеки;",
      "дані комунікації: зміст звернень, чатів, електронних листів, дзвінків або інших контактів з Dobra, у межах, дозволених законом;",
      "дані відгуків та оцінок;",
      "дані щодо акцій, купонів, рекомендацій та уподобань;",
      "дані для запобігання зловживанням та забезпечення безпеки, включаючи сигнали ризику транзакції або облікового запису;",
      "дані представників Партнерів: службові дані, посада, повноваження, розрахункові та контактні дані."
     ]
    },
    {
     "heading": "4. Джерела даних",
     "paragraphs": [
      "Дані отримуємо безпосередньо від користувача під час реєстрації, оформлення Замовлення, здійснення оплати, контакту зі службою підтримки, використання локації або інших функцій.",
      "Ми також можемо отримувати дані від Ресторанів, кур'єрів та партнерів з автопарку, постачальників платіжних послуг, постачальників послуг логування або технічних послуг, партнерів із запобігання шахрайству, а також із публічних джерел у межах, дозволених законом.",
      "Якщо дані не були отримані безпосередньо від особи, Dobra виконує інформаційний обов'язок відповідно до ст. 14 GDPR, якщо тільки не застосовується законодавчий виняток."
     ]
    },
    {
     "heading": "5. Цілі та правові підстави обробки",
     "paragraphs": [
      "Dobra обробляє дані лише тоді, коли існує відповідна правова підстава. Залежно від процесу, це може бути виконання договору або дії до його укладення (ст. 6 розд. 1 літ. b GDPR), юридичний обов'язок (літ. c), законний інтерес Dobra або третьої особи (літ. f) або згода (літ. a).",
      "Правову підставу слід оцінювати для кожного процесу окремо; згода не використовується як типова підстава, якщо обробка необхідна для виконання договору або юридичного обов'язку."
     ]
    },
    {
     "heading": "6. Створення та виконання облікового запису і Замовлень",
     "paragraphs": [
      "Ми обробляємо дані з метою створення та обслуговування облікового запису, прийняття Замовлення, його передачі Ресторану, забезпечення функцій Платформи, комунікації щодо статусу та забезпечення доставки.",
      "Підставою для цього є, насамперед, ст. 6 абз. 1 літ. b GDPR — необхідність для виконання договору або дій на запит користувача перед його укладенням."
     ]
    },
    {
     "heading": "7. Платежі, розрахунки та повернення",
     "paragraphs": [
      "Ми обробляємо дані, необхідні для ініціювання та обслуговування платежів, підтвердження статусу транзакцій, розрахунків з Ресторанами, повернень, платіжних претензій та бухгалтерського обліку.",
      "Підставою можуть бути виконання договору, податкові та бухгалтерські правові зобов'язання, а також законний інтерес у поданні позовів або захисті від них.",
      "Платіжні послуги можуть надаватися окремим постачальником платіжних послуг, що діє як незалежний адміністратор або обробник даних — відповідно до його ролі та документації."
     ]
    },
    {
     "heading": "8. Доставка та геолокація",
     "paragraphs": [
      "Адресні та контактні дані використовуються для здійснення доставки. Якщо користувач увімкне доступ до місцезнаходження пристрою, Dobra може використовувати місцезнаходження для визначення зони доставки, пропонування адреси, оцінки часу та підтримки виконання Замовлення.",
      "Підставою для обробки даних, необхідних для доставки, є виконання договору. Доступ програми до точного місцезнаходження пристрою залежить від налаштувань та дозволів користувача.",
      "Під час активної доставки Dobra може надавати Клієнту приблизне або поточне місцезнаходження кур'єра в обсязі, необхідному для виконання послуги та безпеки."
     ]
    },
    {
     "heading": "9. Обслуговування клієнтів та скарги",
     "paragraphs": [
      "Ми обробляємо дані заявок з метою надання допомоги, розгляду скарг, повернення коштів, врегулювання спорів, забезпечення безпеки та покращення якості послуг.",
      "Підставою може бути виконання договору, правовий обов'язок або законний інтерес Добров щодо обслуговування користувачів, документування подій та захисту претензій."
     ]
    },
    {
     "heading": "10. Безпека, зловживання та запобігання шахрайству",
     "paragraphs": [
      "Dobra може аналізувати дані облікових записів, пристроїв, Замовлень, платежів та поведінки на Платформі з метою виявлення шахрайства, зловживання акціями, захоплення облікових записів, загроз безпеці та інших порушень.",
      "Основою є, зокрема, законний інтерес Dobra, Клієнтів, Ресторанів та партнерів у захисті Платформи та транзакцій, а також — у відповідних випадках — юридичний обов'язок.",
      "Якщо в майбутньому рішення, що породжує правові наслідки або подібним чином суттєво впливає на особу, буде базуватися виключно на автоматизованій обробці, Dobra надасть інформацію та гарантії, передбачені ст. 22 GDPR."
     ]
    },
    {
     "heading": "11. Персоналізація, ранжування та аналітика",
     "paragraphs": [
      "Товари можуть використовувати інформацію про місцезнаходження, історію Замовлень, доступність Ресторану, популярність, оцінки та взаємодії для впорядкування результатів, підвищення релевантності та функціонування Платформи.",
      "Підставою може бути надання послуг та законний інтерес у розвитку та адаптації Платформи. Якщо законодавство вимагає згоди на певні технології відстеження, дані будуть використовуватися лише після її отримання."
     ]
    },
    {
     "heading": "12. Маркетинг та комерційні комунікації",
     "paragraphs": [
      "Добра може надсилати інформацію про акції, пропозиції або нові функції виключно відповідно до відповідних положень щодо електронного маркетингу та згод.",
      "Користувач може в будь-який час відкликати маркетингову згоду або заперечити проти прямого маркетингу. Відкликання згоди не впливає на відповідність попередньої обробки.",
      "Суто транзакційні повідомлення, наприклад, підтвердження Замовлення або інформація про доставку, не є маркетингом і можуть надсилатися з метою надання послуги."
     ]
    },
    {
     "heading": "13. Файли cookie, SDK та подібні технології",
     "paragraphs": [
      "Сайт та додаток Dobra можуть використовувати файли cookie, SDK та подібні технології, необхідні для функціонування, безпеки, запам'ятовування налаштувань, аналітики та маркетингу.",
      "Технології, які не є суворо необхідними, будуть активовані на підставі необхідної згоди. Користувач повинен мати можливість керувати згодами та відкликати їх."
     ]
    },
    {
     "heading": "14. Кому ми розкриваємо дані",
     "bullets": [
      "Ресторанам — в обсязі, необхідному для прийняття та виконання Замовлення, а також для розгляду скарг;",
      "Кур'єрам та партнерам з автопарку — в обсязі, необхідному для отримання та доставки;",
      "Постачальникам платіжних послуг та фінансовим установам;",
      "Постачальникам послуг хостингу, хмарних сервісів, баз даних, комунікацій, підтримки, карт, аналітики, кібербезпеки та ІТ-інструментів;",
      "Юридичним, податковим, бухгалтерським консультантам, аудиторам та страховим компаніям;",
      "Державним органам, судам та правоохоронним органам, за наявності правової підстави;",
      "Покупцям або правонаступникам у рамках реорганізації, злиття або продажу підприємства, з відповідними гарантіями."
     ]
    },
    {
     "heading": "15. Ресторани, кур'єри та незалежні адміністратори",
     "paragraphs": [
      "Ресторан, як правило, є незалежним адміністратором даних, які він отримує для виконання свого договору купівлі-продажу з Клієнтом та своїх законних зобов'язань.",
      "Залежно від моделі, кур'єр, партнер автопарку або постачальник платіжних послуг може виступати як незалежний адміністратор або обробляти дані від імені Dobra.",
      "Dobra не несе відповідальності за незалежні цілі обробки, що реалізуються іншим адміністратором; такий суб'єкт повинен надати власну інформацію, що вимагається GDPR."
     ]
    },
    {
     "heading": "16. Передача даних за межі ЄЕЗ",
     "paragraphs": [
      "Dobra віддає перевагу обробці даних у Європейській економічній зоні, але деякі постачальники технологій можуть обробляти дані за межами ЄЕЗ.",
      "Якщо дані передаються до країни без рішення про адекватний рівень захисту, Dobra застосує відповідний механізм, передбачений GDPR, наприклад, стандартні договірні положення, та додаткові заходи захисту, якщо це вимагається.",
      "Інформацію про застосовані заходи безпеки можна отримати за адресою legal@mydobra.pl."
     ]
    },
    {
     "heading": "17. Терміни зберігання",
     "paragraphs": [
      "Dobra зберігає дані не довше, ніж це необхідно для цілей, для яких вони були зібрані, з урахуванням правових, податкових, бухгалтерських вимог, вимог безпеки та строків позовної давності.",
      "Обліковий запис та операційні дані можуть зберігатися протягом періоду користування обліковим записом, а після його закриття – протягом періоду, необхідного для розрахунків, розгляду скарг, захисту від претензій та виконання законодавчих обов'язків.",
      "Податкова та бухгалтерська документація зберігається протягом терміну, встановленого законом. Дані безпеки та логи зберігаються протягом періоду, пропорційного ризику та потребам розслідування."
     ]
    },
    {
     "heading": "18. Безпека даних",
     "paragraphs": [
      "Dobra застосовує відповідні технічні та організаційні заходи, адекватні ризику, які можуть включати контроль доступу, автентифікацію, шифрування під час передачі та, у відповідних випадках, у стані спокою, реєстрацію подій, резервне копіювання, управління вразливостями, обмеження прав та процедури реагування на інциденти.",
      "Жодна система не забезпечує абсолютної безпеки, тому заходи періодично оцінюються та коригуються відповідно до ризику."
     ]
    },
    {
     "heading": "19. Права суб'єктів даних",
     "bullets": [
      "право доступу до даних та отримання їх копій;",
      "право на виправлення неточних даних;",
      "право на видалення даних, якщо виконуються умови GDPR;",
      "право на обмеження обробки;",
      "право на перенесення даних у випадках, передбачених GDPR;",
      "право на заперечення проти обробки, заснованої на законному інтересі;",
      "абсолютне право на заперечення проти прямого маркетингу;",
      "право на відкликання згоди в будь-який час, якщо обробка ґрунтується на згоді;",
      "права, що стосуються автоматизованого прийняття рішень, якщо застосовується ст. 22 GDPR."
     ]
    },
    {
     "heading": "20. Як реалізувати права",
     "paragraphs": [
      "Запит можна надіслати на legal@mydobra.pl. Dobra може попросити інформацію, необхідну для підтвердження особи та захисту даних від несанкціонованого розголошення.",
      "Dobra відповідає на запити у терміни, передбачені GDPR. У випадках, визначених законодавством, реалізація права може бути обмежена, наприклад, коли подальше зберігання вимагається юридичним обов'язком або потрібне для встановлення, здійснення чи захисту претензій."
     ]
    },
    {
     "heading": "21. Скарга до наглядового органу",
     "paragraphs": [
      "Суб’єкт даних має право подати скаргу до Голови Управління із захисту персональних даних (PUODO), якщо вважає, що обробка його даних порушує GDPR.",
      "Актуальні контактні дані та інформація щодо порядку подання скарг доступні на офіційному сайті Управління із захисту персональних даних."
     ]
    },
    {
     "heading": "22. Дані дітей",
     "paragraphs": [
      "Платформа Dobra призначена для замовлення їжі та послуг доставки. Dobra не має наміру свідомо збирати дані дітей без забезпечення необхідної законом підстави або згоди законного представника."
     ]
    },
    {
     "heading": "23. Одержувач Замовлення, відмінний від користувача",
     "paragraphs": [
      "Якщо користувач надає дані іншої особи як одержувача Замовлення, він повинен передати виключно дані, необхідні для доставки, та поінформувати цю особу, що її дані будуть використані для здійснення доставки.",
      "Dobra обробляє такі дані в обсязі, необхідному для виконання Замовлення та відповідних законних інтересів, з урахуванням інформаційних зобов'язань згідно зі ст. 14 GDPR."
     ]
    },
    {
     "heading": "24. Зміни Політики конфіденційності",
     "paragraphs": [
      "Dobra може оновлювати Політику у зв'язку зі зміною законодавства, функціональності, постачальників, процесів або засобів безпеки.",
      "Про суттєві зміни користувачі будуть повідомлені відповідним чином, наприклад, у застосунку, на вебсайті або електронною поштою, якщо це вимагається або виправдано."
     ]
    },
    {
     "heading": "25. Контакти",
     "paragraphs": [
      "NICKOVWAY SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ, ul. Jana III Sobieskiego 38, 55-330 Lutynia, Polska.",
      "KRS: 0000791473 | NIP: 8982251132 | REGON: 383675818",
      "Питання конфіденційності та GDPR: legal@mydobra.pl. Служба підтримки клієнтів: support@mydobra.pl, тел. +48 505 645 999."
     ]
    },
    {
     "heading": "Основні правові акти",
     "bullets": [
      "Регламент Європейського Парламенту та Ради (ЄС) 2016/679 (RODO).",
      "Закон від 10 травня 2018 р. Про захист персональних даних.",
      "Відповідні польські та європейські норми щодо електронних послуг, електронних комунікацій та прав споживачів."
     ]
    }
   ],
   "title": "Політика конфіденційності та захисту персональних даних",
   "meta": [
    "GDPR",
    "Версія 1.0",
    "Територія: Республіка Польща"
   ],
   "intro": [
    "Ця Політика конфіденційності пояснює, як NICKOVWAY SP. Z O.O., що діє під брендом Dobra, обробляє персональні дані користувачів Платформи Dobra, Клієнтів, контактних осіб Партнерів-рестораторів та інших осіб, які користуються послугами Dobra."
   ]
  },
  "terms": {
   "sections": [
    {
     "heading": "1. Мета та сфера дії Регламенту",
     "paragraphs": [
      "1.1. Dobra керує інтернет-платформою, яка дозволяє замовляти їжу та організовувати доставку на території Польщі.",
      "1.2. За допомогою Платформи Dobra Клієнт може, зокрема:"
     ],
     "bullets": [
      "шукати ресторани та інші гастрономічні заклади, які співпрацюють з Dobra («Ресторани»);",
      "переглядати меню та пропозиції Ресторанів;",
      "розміщувати замовлення в Ресторанах;",
      "здійснювати платежі за допомогою методів, доступних на Платформі;",
      "користуватися послугою доставки, якщо вона доступна;",
      "відстежувати статус замовлення та доставки;",
      "звертатися до Dobra з питань, що стосуються замовлень та доставок."
     ]
    },
    {
     "heading": "2. Роль Dobra та Ресторанів",
     "paragraphs": [
      "2.1. Dobra надає технологічне рішення, що дозволяє Клієнтам та Ресторанам укладати угоди. Якщо прямо не зазначено інше, Dobra не є продавцем або виробником їжі чи напоїв, пропонованих на Платформі.",
      "2.2. Ресторан, зазначений на сторінці Ресторану та під час оформлення замовлення, є продавцем продуктів і відповідає, зокрема, за приготування страв, якість та відповідність продуктів, інгредієнти, інформацію про алергени, безпечність харчових продуктів, описи та доступність продуктів, а також необхідні дозволи.",
      "2.3. Якщо замовлення позначене як таке, що доставляється Dobra, Dobra організовує або забезпечує послугу доставки з Ресторану до Клієнта. Доставка може здійснюватися працівниками Dobra, незалежними кур'єрами, підприємцями за моделлю B2B або партнерами по флоту.",
      "2.4. Жодне положення Регламенту не обмежує прав Клієнта, що випливають з імперативних норм польського законодавства або законодавства Європейського Союзу."
     ]
    },
    {
     "heading": "3. Обліковий запис Клієнта",
     "paragraphs": [
      "3.1. Користування деякими функціональними можливостями Платформи може вимагати створення облікового запису Dobra.",
      "3.2. Клієнт зобов'язаний надавати правдиві, актуальні та повні дані.",
      "3.3. Клієнт не може створювати обліковий запис, використовуючи дані іншої особи без її згоди, надавати фальшиві дані, створювати облікові записи з метою шахрайства, надавати доступ до облікового запису неавторизованим особам або використовувати Платформу всупереч закону.",
      "3.4. Клієнт відповідає за збереження конфіденційності даних для входу. Про підозру на несанкціонований доступ слід негайно повідомити на support@mydobra.pl."
     ]
    },
    {
     "heading": "4. Послуги, що надаються в електронному вигляді, та технічні вимоги",
     "paragraphs": [
      "4.1. Додаток надає в електронному вигляді, зокрема, ведення Облікового запису Клієнта, надання пропозицій Ресторанів, розміщення замовлень, обробку платежів та доставок, інформацію про статус замовлення, обслуговування клієнтів, систему оцінок та відгуків, рекламні функції та сповіщення.",
      "4.2. Користування Платформою вимагає доступу до Інтернету, сумісного пристрою, підтримуваної операційної системи або браузера, а також — за потреби — активної адреси електронної пошти та номера телефону.",
      "4.3. Клієнт не може надавати незаконний контент або використовувати Платформу способом, що порушує її роботу або безпеку."
     ]
    },
    {
     "heading": "5. Інформація про Ресторани та продукти",
     "paragraphs": [
      "5.1. Ресторан несе відповідальність за точність інформації щодо своїх продуктів та пропозицій, включаючи назву, адресу, меню, ціни, інгредієнти, алергени, описи, години роботи та доступність.",
      "5.2. Dobra може допомагати Ресторанам у поданні цієї інформації, однак це не означає, що Dobra стає продавцем продуктів Ресторану."
     ]
    },
    {
     "heading": "6. Алергії та харчові непереносимості",
     "paragraphs": [
      "6.1. Клієнт, який має алергії, харчову непереносимість або особливі дієтичні вимоги, повинен ретельно ознайомитися з інформацією, наданою Рестораном, і за необхідності зв'язатися з ним перед оформленням замовлення.",
      "6.2. Ресторан відповідає за надання інформації про алергени, що вимагається законодавством. Клієнт не повинен вважати, що продукт не містить алергену лише тому, що його немає в назві продукту."
     ]
    },
    {
     "heading": "7. Оформлення замовлення",
     "paragraphs": [
      "7.1. Клієнт обирає Ресторан, продукти, кількість, варіанти, адресу доставки, спосіб доставки або самовивозу та метод оплати.",
      "7.2. Перед оформленням замовлення Клієнт може перевірити замовлення та виправити можливі помилки.",
      "7.3. Перед підтвердженням замовлення Dobra відображає загальну суму до сплати разом з обов'язковими зборами, а кнопка фіналізації однозначно вказує на зобов'язання щодо оплати.",
      "7.4. Автоматичне підтвердження отримання замовлення не обов'язково означає його прийняття Рестораном. Клієнт отримає інформацію про прийняття або відхилення замовлення."
     ]
    },
    {
     "heading": "8. Ціни та збори",
     "paragraphs": [
      "8.1. Ціни для Клієнтів вказуються в польських злотих (PLN) і включають чинні податки, якщо цього вимагають положення.",
      "8.2. Загальна ціна замовлення може включати:"
     ],
     "bullets": [
      "вартість продуктів Ресторану;",
      "плату за доставку;",
      "сервісний збір, якщо застосовується;",
      "плату за невелике замовлення;",
      "інші дозволені законом збори, про які Клієнта буде чітко поінформовано перед розміщенням замовлення."
     ]
    },
    {
     "heading": "9. Платежі",
     "paragraphs": [
      "9.1. Dobra уможливлює платежі за замовлення Ресторану та послуги Dobra за допомогою методів, доступних на Платформі. Це не означає, що Dobra стає продавцем продукції Ресторану.",
      "9.2. Платежі можуть технічно оброблятися, розраховуватися або обслуговуватися уповноваженими зовнішніми постачальниками платіжних послуг.",
      "9.3. Доступні методи оплати можуть включати платіжні картки, мобільні та електронні платежі, перекази та інші методи, доступні на Платформі.",
      "9.4. Dobra не зберігає повні дані платіжних карток, якщо обслуговування платежів здійснюється зовнішнім постачальником."
     ]
    },
    {
     "heading": "10. Доставка",
     "paragraphs": [
      "10.1. Якщо Компанія забезпечує доставку, вона організовує транспортування прийнятого замовлення з Ресторану за адресою, вказаною Клієнтом.",
      "10.2. Клієнт зобов'язаний надати правильну адресу доставки та інформацію, необхідну для її здійснення (номер будинку та квартири, код або інструкції доступу, іншу інформацію щодо доступу) та залишатися доступним за вказаним номером телефону.",
      "10.3. Орієнтовний час доставки має інформаційний характер і не є гарантованим терміном. На час доставки можуть впливати, зокрема, час приготування замовлення, дорожні та погодні умови, відстань, доступність кур'єрів та інші обставини, що знаходяться поза розумним контролем Компанії."
     ]
    },
    {
     "heading": "11. Відсутність Клієнта під час доставки",
     "paragraphs": [
      "11.1. Якщо кур'єр прибуде на місце, але не зможе здійснити доставку, можуть бути здійснені розумні спроби зв'язку телефоном, через сповіщення у додатку або електронне повідомлення.",
      "11.2. Доставка може бути визнана невдалою у випадку неправильної адреси, відсутності доступу до місця доставки, відсутності контакту з Клієнтом або неотримання замовлення протягом розумного часу.",
      "11.3. Списання коштів з Клієнта або відмова у поверненні може відбутися виключно в межах, що відповідають чинним нормам законодавства."
     ]
    },
    {
     "heading": "12. Скасування замовлення",
     "paragraphs": [
      "12.1. Клієнт може подати запит на скасування замовлення через Платформу, якщо така функціональність доступна.",
      "12.2. Можливість безоплатного скасування може залежати від того, чи Ресторан прийняв замовлення, розпочав чи завершив його приготування, а також чи розпочалася вже доставка.",
      "12.3. Цей пункт не обмежує імперативних прав Клієнта, що випливають з польського законодавства."
     ]
    },
    {
     "heading": "13. Право на відмову від договору",
     "paragraphs": [
      "13.1. Законодавче право на відмову від дистанційного договору підлягає виняткам, визначеним у положеннях закону, зокрема щодо товарів, що швидко псуються або мають короткий термін придатності.",
      "13.2. Жодне положення Регламенту не виключає права на відмову від договору, якщо воно належить Клієнту на підставі імперативних положень."
     ]
    },
    {
     "heading": "14. Неправильні, неповні або пошкоджені замовлення",
     "paragraphs": [
      "Проблеми, що стосуються замовлення, слід повідомляти в застосунку Dobra або на support@mydobra.pl — вони можуть включати відсутні або неправильні продукти, серйозне пошкодження замовлення, відсутність доставки, доставку за неправильною адресою або суттєві проблеми з якістю.",
      "Клієнт повинен вказати номер замовлення, опис проблеми та, якщо це доцільно, фотографії. Залежно від характеру проблеми відповідальність несе Ресторан або Dobra, згідно з чинним законодавством."
     ]
    },
    {
     "heading": "15. Повернення платежів",
     "paragraphs": [
      "15.1. Залежно від обставин, Клієнт може мати право на повне або часткове повернення коштів, обмін продукту, доповнення замовлення або інший засіб захисту, передбачений законом.",
      "15.2. Повернення може бути здійснено за допомогою первинного методу оплати, якщо це технічно можливо; час зарахування залежить від постачальника платіжних послуг та банку Клієнта.",
      "15.3. Dobra може добровільно надати кошти Dobra, купон, знижку або іншу компенсацію. Це не замінює законних прав Клієнта."
     ]
    },
    {
     "heading": "16. Рекламації",
     "paragraphs": [
      "Рекламації щодо Платформи Dobra або послуг доставки можна подавати за адресою: NICKOVWAY SP. Z O.O., ul. Jana III Sobieskiego 38, 55-330 Lutynia, Polska, e-mail: support@mydobra.pl, тел. +48 505 645 999.",
      "Рекламація повинна, якщо це можливо, містити ім'я та прізвище Клієнта, номер замовлення, опис проблеми та очікуваний спосіб вирішення справи. Dobra розглядає рекламації у термін, передбачений нормами права."
     ]
    },
    {
     "heading": "17. Оцінки та відгуки",
     "paragraphs": [
      "17.1. Товари можуть дозволяти Клієнтам надавати оцінки та відгуки щодо Ресторанів, продуктів та доставки, а також позначати відгуки, що надходять від Клієнтів, які фактично здійснили замовлення.",
      "17.2. Відгуки не можуть містити протиправного змісту, погроз, образливого, дискримінаційного змісту, неправдивої інформації, спаму, несанкціонованої реклами, персональних даних, розкритих без правової підстави, або змісту, що порушує права третіх осіб."
     ]
    },
    {
     "heading": "18. Рейтинг Ресторанів",
     "paragraphs": [
      "Ресторани та пропозиції можуть бути впорядковані на основі місцезнаходження Клієнта та Ресторану, відстані та очікуваного часу доставки, доступності, годин роботи, популярності, історії замовлень, оцінок Клієнтів, ціни, відповідності, пропускної здатності доставки, акцій та комерційних угод з Доброю.",
      "Платне позиціонування, реклама або інші форми платного впливу на видимість будуть позначені, якщо цього вимагають положення законодавства."
     ]
    },
    {
     "heading": "19. Акції та кошти Dobra",
     "paragraphs": [
      "19.1. Dobra може пропонувати промокоди, рекламні кампанії, реферальні програми, безкоштовну доставку, кошти на рахунку та акції, що стосуються конкретних Ресторанів.",
      "19.2. Умови акції можуть включати термін дії, мінімальну вартість замовлення, обрані Ресторани, територіальні обмеження, умови щодо облікового запису, максимальну вартість знижки та обмеження кількості використань.",
      "19.3. Заборонено зловживати акціями, зокрема, шляхом створення кількох облікових записів, фальшивих рекомендацій або недобросовісних транзакцій. Dobra може анулювати переваги, отримані внаслідок шахрайства або зловживання."
     ]
    },
    {
     "heading": "20. Дані про місцезнаходження Клієнта",
     "paragraphs": [
      "20.1. За згодою Клієнта Добрі може використовувати місцезнаходження пристрою, щоб відображати Ресторани, які обслуговують певну територію, перевіряти доступність доставки, полегшувати визначення місця доставки, розраховувати очікуваний час доставки та презентувати відповідні пропозиції.",
      "20.2. Доступ до місцезнаходження можна контролювати в налаштуваннях пристрою. Деталі обробки даних про місцезнаходження описані в Політиці конфіденційності Добрі."
     ]
    },
    {
     "heading": "21. Відстеження доставки",
     "paragraphs": [
      "21.1. Добра може надавати функцію відстеження доставки в реальному часі або в приблизний спосіб; під час активної доставки Клієнт може отримати інформацію про місцезнаходження кур'єра.",
      "21.2. Ця інформація надається з метою виконання замовлення, забезпечення безпеки та покращення доставки і може не відображати точне місцезнаходження кур'єра в будь-який момент."
     ]
    },
    {
     "heading": "22. Дозволене використання Платформи",
     "bullets": [
      "використання Продукту/Послуги в незаконних цілях;",
      "здійснення або спроби здійснення шахрайських платежів;",
      "зловживання механізмами повернення коштів або чарджбеків;",
      "маніпулювання акціями та створення фальшивих облікових записів;",
      "погрози, переслідування або образа кур'єрів, працівників Ресторану, працівників Продукту/Послуги або інших осіб;",
      "спроби несанкціонованого доступу до систем Продукту/Послуги або порушення безпеки Платформи;",
      "впровадження вірусів, шкідливого програмного забезпечення або іншого шкідливого коду;",
      "систематичне завантаження або копіювання даних Платформи способом, що суперечить закону."
     ],
     "paragraphs": [
      "Клієнту, зокрема, забороняється:"
     ]
    },
    {
     "heading": "23. Обмеження або призупинення дії облікового запису",
     "paragraphs": [
      "Dobra може обмежити, призупинити або — в обґрунтованих випадках — припинити можливість використання облікового запису через шахрайство або підозру в ньому, серйозне або повторне порушення Правил, зловживання платежами, погрози або переслідування, загрозу безпеці, незаконну діяльність, зловживання акціями або необхідність захисту Клієнтів, Ресторанів, кур'єрів або Dobra.",
      "Такі дії вживатимуться з дотриманням чинного законодавства та пропорційно до обставин."
     ]
    },
    {
     "heading": "24. Доступність Платформи",
     "paragraphs": [
      "Добра вживає обґрунтованих заходів для забезпечення стабільної роботи Платформи, однак не гарантує безперервної доступності. Перебої можуть виникати, серед іншого, через сервісні роботи, оновлення, технічні несправності або несправності телекомунікаційних мереж, інциденти кібербезпеки, а також обставини, що знаходяться поза розумним контролем Добра.",
      "Цей пункт не обмежує імперативних прав Клієнта."
     ]
    },
    {
     "heading": "25. Відповідальність",
     "paragraphs": [
      "25.1. Dobra відповідає за власні зобов'язання, що виникають з договору, відповідно до чинного законодавства, включаючи зобов'язання, пов'язані з послугою доставки.",
      "25.2. Якщо Ресторан є продавцем, відповідальність за договір купівлі-продажу та продукцію Ресторану покладається на Ресторан у межах, передбачених законом.",
      "25.3. Жодне положення Регламенту не виключає та не обмежує відповідальності там, де це юридично неприпустимо, а також не обмежує абсолютно обов'язкових прав споживача."
     ]
    },
    {
     "heading": "26. Персональні дані",
     "paragraphs": [
      "Персональні дані обробляються відповідно до Політики конфіденційності Dobra. Залежно від способу використання Платформи, Dobra може обробляти, зокрема, дані облікового запису, ім'я та прізвище, номер телефону, адресу електронної пошти, адреси доставки, історію замовлень, кореспонденцію зі службою підтримки клієнтів, інформацію про платежі, пристрій, IP-адресу та місцезнаходження, а також дані, що використовуються для запобігання шахрайству.",
      "Контакт з питань конфіденційності: legal@mydobra.pl."
     ]
    },
    {
     "heading": "27. Зміни Регламенту",
     "paragraphs": [
      "Dobra може змінювати Регламент з обґрунтованих причин, таких як зміни законодавства, нові регуляторні вимоги, впровадження нових функціональних можливостей, зміна послуг, вимоги безпеки, технологічні зміни або зміни бізнес-моделі.",
      "Клієнти будуть повідомлені про суттєві зміни відповідно до чинного законодавства. Зміни не позбавляють Клієнта набутих прав щодо замовлень, виконаних до їх набрання чинності."
     ]
    },
    {
     "heading": "28. Права споживача",
     "paragraphs": [
      "Жодне положення Регламенту не виключає, не обмежує та не змінює прав споживача, які не можуть бути ефективно виключені згідно з польським законодавством або законодавством Європейського Союзу.",
      "Клієнт може отримати інформацію щодо прав споживача від відповідних органів захисту прав споживачів та споживчих організацій."
     ]
    },
    {
     "heading": "29. Застосовне право та спори",
     "paragraphs": [
      "Цей Регламент регулюється законодавством Республіки Польща, з урахуванням імперативних норм права Європейського Союзу.",
      "У випадку Клієнтів, які є споживачами, положення Регламенту не обмежують правил юрисдикції чи інших захисних прав. Спори можуть бути передані до відповідних судів згідно з чинним законодавством."
     ]
    },
    {
     "heading": "30. Контакти",
     "paragraphs": [
      "Служба підтримки клієнтів: support@mydobra.pl, тел. +48 505 645 999 — питання, що стосуються замовлень, доставок, повернень, облікових записів та скарг.",
      "Юридичні питання та конфіденційність: legal@mydobra.pl.",
      "Оператор Платформи: NICKOVWAY SP. Z O.O., ul. Jana III Sobieskiego 38, 55-330 Lutynia, Polska. KRS: 0000791473 | NIP: 8982251132 | REGON: 383675818 | Статутний капітал: 5 000 PLN."
     ]
    }
   ],
   "title": "Регламент Платформи Dobra",
   "meta": [
    "Версія 1.0",
    "Територія: Республіка Польща"
   ],
   "intro": [
    "Цей Регламент визначає правила доступу до та користування мобільним додатком Dobra, вебсайтом та пов'язаними послугами («Платформа Dobra»).",
    "Платформа Dobra керується NICKOVWAY SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ, ul. Jana III Sobieskiego 38, 55-330 Lutynia, Polska. KRS: 0000791473, NIP: 8982251132, REGON: 383675818, статутний капітал: 5 000 PLN.",
    "Служба підтримки клієнтів: support@mydobra.pl, тел. +48 505 645 999. Контакт з юридичних питань та питань приватності: legal@mydobra.pl."
   ]
  }
 },
 "fr": {
  "privacy": {
   "sections": [
    {
     "heading": "1. Responsable du traitement des données",
     "paragraphs": [
      "Le responsable du traitement des données personnelles est NICKOVWAY SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ, ul. Jana III Sobieskiego 38, 55-330 Lutynia, Polska, KRS 0000791473, NIP 8982251132, REGON 383675818 (« Dobra », « le Responsable du traitement »).",
      "Contact pour les questions de confidentialité et de protection des données : legal@mydobra.pl. Service Client : support@mydobra.pl, tél. +48 505 645 999.",
      "Si Dobra nomme un Délégué à la Protection des Données, ses coordonnées seront publiées sur la Plateforme et dans la présente Politique."
     ]
    },
    {
     "heading": "2. Qui est concerné par la présente Politique",
     "bullets": [
      "Clients et utilisateurs des applications ou du site Web de Dobra;",
      "personnes créant un compte ou passant des Commandes;",
      "personnes contactant le service Clientèle;",
      "personnes représentant ou employées par les Restaurants et autres Partenaires;",
      "destinataires des livraisons et autres personnes dont les données sont transmises dans le cadre d'une Commande;",
      "utilisateurs participant à des promotions, des programmes de parrainage, des sondages ou des enquêtes."
     ]
    },
    {
     "heading": "3. Quelles données nous pouvons traiter",
     "bullets": [
      "données d'identification et de compte : nom, prénom, identifiant utilisateur, données de connexion;",
      "données de contact : e-mail, numéro de téléphone, adresse de livraison;",
      "données des Commandes : Restaurant, produits, montants, historique et statut des Commandes, instructions de livraison;",
      "données de paiement et de facturation : méthode de paiement, identifiants de transaction, statut du paiement, remboursements et rétrofacturations ; les données complètes de la carte sont en principe traitées par le prestataire de services de paiement;",
      "données de localisation : localisation de l'appareil avec consentement et localisation nécessaire à la livraison;",
      "données techniques : adresse IP, identifiants de l'appareil ou de l'application, système d'exploitation, navigateur, journaux, événements de sécurité;",
      "données de communication : contenu des signalements, chats, e-mails, appels ou autres contacts avec Dobra, dans les limites autorisées par la loi;",
      "données d'avis et d'évaluations;",
      "données relatives aux promotions, coupons, parrainages et préférences;",
      "données de lutte contre la fraude et de sécurité, y compris les signaux de risque de transaction ou de compte;",
      "données des représentants des Partenaires : données professionnelles, poste, autorisations, données de facturation et de contact."
     ]
    },
    {
     "heading": "4. Sources de données",
     "paragraphs": [
      "Nous recevons les données directement de l'utilisateur lors de l'enregistrement, de la passation de Commande, du paiement, du contact avec l'assistance, de l'utilisation de la localisation ou d'autres fonctions.",
      "Nous pouvons également recevoir des données des Restaurants, des coursiers et partenaires de flotte, des fournisseurs de services de paiement, des fournisseurs de connexion ou de services techniques, des partenaires de prévention de la fraude, ainsi que de sources publiques dans la mesure permise par la loi.",
      "Si les données n'ont pas été obtenues directement de la personne, Dobra s'acquitte de son obligation d'information conformément à l'article 14 du RGPD, à moins qu'une exception légale ne s'applique."
     ]
    },
    {
     "heading": "5. Objectifs et bases légales du traitement",
     "paragraphs": [
      "Dobra ne traite les données que s'il existe une base légale appropriée. Selon le processus, il peut s'agir de l'exécution d'un contrat ou d'actions précédant sa conclusion (article 6, paragraphe 1, point b du RGPD), d'une obligation légale (point c), de l'intérêt légitime de Dobra ou d'un tiers (point f) ou du consentement (point a).",
      "La base légale doit être évaluée séparément pour chaque processus ; le consentement n'est pas utilisé comme base par défaut si le traitement est nécessaire à l'exécution d'un contrat ou d'une obligation légale."
     ]
    },
    {
     "heading": "6. Création de compte et Commandes",
     "paragraphs": [
      "Nous traitons les données afin de créer et gérer le compte, d'accepter la Commande, de la transmettre au Restaurant, d'assurer les fonctionnalités de la Plateforme, de communiquer le statut et de gérer la livraison.",
      "Le fondement juridique est principalement l'art. 6 par. 1 let. b du RGPD — nécessité d'exécuter un contrat ou d'entreprendre des démarches à la demande de l'utilisateur avant sa conclusion."
     ]
    },
    {
     "heading": "7. Paiements, règlements et remboursements",
     "paragraphs": [
      "Nous traitons les données nécessaires à l'initiation et à la gestion des paiements, à la confirmation du statut des transactions, aux règlements avec les restaurants, aux remboursements, aux réclamations de paiement et à la comptabilité.",
      "La base juridique peut être l'exécution d'un contrat, les obligations légales fiscales et comptables, ainsi que l'intérêt légitime à poursuivre ou à défendre des réclamations.",
      "Les services de paiement peuvent être exécutés par un prestataire de services de paiement distinct agissant en tant que responsable du traitement indépendant ou sous-traitant – conformément à son rôle et à sa documentation."
     ]
    },
    {
     "heading": "8. Livraison et géolocalisation",
     "paragraphs": [
      "Les données d'adresse et de contact sont utilisées pour effectuer la livraison. Si l'utilisateur active l'accès à la localisation de l'appareil, Dobra peut utiliser la localisation pour déterminer la zone de livraison, suggérer une adresse, estimer le temps et faciliter l'exécution de la Commande.",
      "La base du traitement des données nécessaires à la livraison est l'exécution du contrat. L'accès de l'application à la localisation précise de l'appareil dépend des paramètres et des autorisations de l'utilisateur.",
      "Pendant une livraison active, Dobra peut présenter au Client la localisation approximative ou actuelle du coursier dans la mesure nécessaire à l'exécution du service et à la sécurité."
     ]
    },
    {
     "heading": "9. Service client et réclamations",
     "paragraphs": [
      "Nous traitons les données des signalements afin de fournir une assistance, de traiter les réclamations, les retours, les litiges, d'assurer la sécurité et d'améliorer la qualité des services.",
      "La base peut être l'exécution d'un contrat, une obligation légale ou l'intérêt légitime de Dobra à servir les utilisateurs, à documenter les événements et à défendre les réclamations."
     ]
    },
    {
     "heading": "10. Sécurité, abus et prévention de la fraude",
     "paragraphs": [
      "Dobra peut analyser les données de compte, d'appareil, de Commandes, de paiement et de comportement sur la Plateforme afin de détecter les fraudes, les abus de promotion, les prises de contrôle de comptes, les menaces de sécurité et d'autres irrégularités.",
      "La base est, en particulier, l'intérêt légitime de Dobra, des Clients, des Restaurants et des partenaires à protéger la Plateforme et les transactions et – le cas échéant – l'obligation légale.",
      "Si, à l'avenir, une décision produisant des effets juridiques ou affectant de manière significative une personne devait être basée exclusivement sur un traitement automatisé, Dobra fournira les informations et garanties requises par l'article 22 du RGPD."
     ]
    },
    {
     "heading": "11. Personnalisation, classement et analyse",
     "paragraphs": [
      "Dobra peut utiliser des informations sur la localisation, l'historique des Commandes, la disponibilité des Restaurants, la popularité, les évaluations et les interactions afin d'organiser les résultats, d'améliorer la pertinence et le fonctionnement de la Plateforme.",
      "La base peut être l'exécution du service et l'intérêt légitime à développer et adapter la Plateforme. Si la réglementation exige un consentement pour certaines technologies de suivi, les données ne seront utilisées qu'après l'obtention de ce consentement."
     ]
    },
    {
     "heading": "12. Marketing et communication commerciale",
     "paragraphs": [
      "Dobra ne peut envoyer des informations sur les promotions, les offres ou les nouvelles fonctionnalités qu'en conformité avec les réglementations applicables en matière de marketing électronique et les consentements.",
      "L'Utilisateur peut à tout moment retirer son consentement marketing ou s'opposer au marketing direct. Le retrait du consentement n'affecte pas la licéité du traitement antérieur.",
      "Les communications purement transactionnelles, telles que la confirmation de Commande ou l'information de livraison, ne constituent pas du marketing et peuvent être envoyées pour l'exécution du service."
     ]
    },
    {
     "heading": "13. Cookies, SDK et technologies similaires",
     "paragraphs": [
      "Le site web et l'application Dobra peuvent utiliser des cookies, SDK et technologies similaires nécessaires à leur fonctionnement, à la sécurité, à la mémorisation des paramètres, à l'analyse et au marketing.",
      "Les technologies qui ne sont pas strictement nécessaires seront activées sur la base du consentement requis. L'utilisateur doit avoir la possibilité de gérer et de retirer ses consentements."
     ]
    },
    {
     "heading": "14. À qui divulguons-nous les données",
     "bullets": [
      "Aux restaurants – dans la mesure nécessaire à la réception et à l'exécution de la Commande ainsi qu'aux réclamations;",
      "Aux coursiers et partenaires de flotte – dans la mesure nécessaire à la collecte et à la livraison;",
      "Aux fournisseurs de services de paiement et aux institutions financières;",
      "Aux fournisseurs d'hébergement, de cloud, de bases de données, de communication, de support, de cartes, d'outils d'analyse, de cybersécurité et d'outils informatiques;",
      "Aux conseillers juridiques, fiscaux, comptables, aux auditeurs et aux assureurs;",
      "Aux autorités publiques, aux tribunaux et aux organismes chargés de l'application de la loi, lorsqu'il existe une base légale;",
      "Aux acquéreurs ou successeurs légaux dans le cadre d'une réorganisation, d'une fusion ou d'une vente d'entreprise, avec les garanties appropriées."
     ]
    },
    {
     "heading": "15. Restaurants, coursiers et administrateurs indépendants",
     "paragraphs": [
      "Le restaurant est, en principe, un administrateur indépendant des données qu'il reçoit dans le but d'exécuter son contrat de vente avec le Client et ses propres obligations légales.",
      "Selon le modèle, le coursier, le partenaire de flotte ou le fournisseur de paiement peut agir en tant qu'administrateur indépendant ou traiter les données au nom de Dobra.",
      "Dobra n'est pas responsable des finalités de traitement indépendantes réalisées par un autre administrateur ; une telle entité doit fournir ses propres informations requises par le RGPD."
     ]
    },
    {
     "heading": "16. Transfert de données en dehors de l'EEE",
     "paragraphs": [
      "Dobra privilégie le traitement des données au sein de l'Espace Économique Européen, mais certains fournisseurs technologiques peuvent traiter des données en dehors de l'EEE.",
      "Si des données sont transférées vers un pays ne faisant pas l'objet d'une décision d'adéquation, Dobra appliquera le mécanisme approprié prévu par le RGPD, tel que les clauses contractuelles types, ainsi que des mesures de protection supplémentaires, si elles sont requises.",
      "Des informations sur les garanties appliquées peuvent être obtenues à l'adresse legal@mydobra.pl."
     ]
    },
    {
     "heading": "17. Périodes de conservation",
     "paragraphs": [
      "Dobra conserve les données pas plus longtemps que nécessaire aux fins pour lesquelles elles ont été collectées, en tenant compte des exigences légales, fiscales, comptables, de sécurité et de prescription des créances.",
      "Le compte et les données opérationnelles peuvent être conservés pendant la période d'utilisation du compte, et après sa clôture, pendant la période nécessaire aux règlements, réclamations, à la protection contre les créances et aux obligations légales.",
      "La documentation fiscale et comptable est conservée pendant la période requise par la loi. Les données de sécurité et les journaux sont conservés pendant une période proportionnelle au risque et aux besoins d'enquête."
     ]
    },
    {
     "heading": "18. Sécurité des données",
     "paragraphs": [
      "Dobra met en œuvre des mesures techniques et organisationnelles appropriées et proportionnées au risque, pouvant inclure le contrôle d'accès, l'authentification, le chiffrement en transit et, le cas échéant, au repos, l'enregistrement des événements, les sauvegardes, la gestion des vulnérabilités, la restriction des autorisations et les procédures de réponse aux incidents.",
      "Aucun système n'assure une sécurité absolue, c'est pourquoi les mesures sont périodiquement évaluées et ajustées en fonction du risque."
     ]
    },
    {
     "heading": "19. Droits des personnes concernées",
     "bullets": [
      "droit d'accès aux données et d'obtention de leur copie;",
      "droit de rectification des données incorrectes;",
      "droit à l'effacement des données, lorsque les conditions du RGPD sont remplies;",
      "droit à la limitation du traitement;",
      "droit à la portabilité des données dans les cas prévus par le RGPD;",
      "droit d'opposition au traitement fondé sur l'intérêt légitime;",
      "droit absolu de s'opposer au marketing direct;",
      "droit de retirer le consentement à tout moment, lorsque le traitement est fondé sur le consentement;",
      "droits relatifs à la prise de décision individuelle automatisée, lorsque l'article 22 du RGPD est applicable."
     ]
    },
    {
     "heading": "20. Comment exercer vos droits",
     "paragraphs": [
      "La demande peut être envoyée à legal@mydobra.pl. Dobra peut demander les informations nécessaires pour confirmer votre identité et protéger les données contre toute divulgation non autorisée.",
      "Dobra répond aux demandes dans les délais prévus par le RGPD. Dans les cas définis par la loi, l'exercice du droit peut être limité, par exemple lorsque la conservation ultérieure est requise par une obligation légale ou nécessaire pour la constatation, l'exercice ou la défense de droits."
     ]
    },
    {
     "heading": "21. Plainte auprès de l'autorité de contrôle",
     "paragraphs": [
      "La personne concernée a le droit de déposer une plainte auprès du Président de l'Office de Protection des Données Personnelles (PUODO) si elle estime que le traitement de ses données enfreint le RODO.",
      "Les coordonnées actuelles et les informations sur la manière de déposer une plainte sont disponibles sur le site officiel de l'Office de Protection des Données Personnelles."
     ]
    },
    {
     "heading": "22. Données concernant les enfants",
     "paragraphs": [
      "La plateforme Dobra est destinée à la commande de produits alimentaires et de services de livraison. Dobra n'a pas l'intention de collecter sciemment des données d'enfants sans la base légale requise ou le consentement du représentant légal."
     ]
    },
    {
     "heading": "23. Destinataire de la Commande autre que l'utilisateur",
     "paragraphs": [
      "Si l'utilisateur fournit les données d'une autre personne en tant que destinataire de la Commande, il doit communiquer uniquement les données nécessaires à la livraison et informer cette personne que ses données seront utilisées aux fins de la réalisation de la livraison.",
      "Dobra traite ces données dans la mesure nécessaire à l'exécution de la Commande et aux intérêts légitimes pertinents, en tenant compte des obligations d'information découlant de l'article 14 du RGPD."
     ]
    },
    {
     "heading": "24. Modifications de la Politique de Confidentialité",
     "paragraphs": [
      "Dobra peut mettre à jour la Politique en cas de modification de la loi, des fonctionnalités, des fournisseurs, des processus ou des mesures de sécurité.",
      "Les utilisateurs seront informés des modifications importantes de manière appropriée, par exemple, via l'application, sur le site web ou par courrier électronique, lorsque cela est requis ou justifié."
     ]
    },
    {
     "heading": "25. Contact",
     "paragraphs": [
      "NICKOVWAY SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ, ul. Jana III Sobieskiego 38, 55-330 Lutynia, Polska.",
      "KRS: 0000791473 | NIP: 8982251132 | REGON: 383675818",
      "Questions de confidentialité et RGPD : legal@mydobra.pl. Service Client : support@mydobra.pl, tél. +48 505 645 999."
     ]
    },
    {
     "heading": "Actes juridiques fondamentaux",
     "bullets": [
      "Règlement (UE) 2016/679 du Parlement européen et du Conseil (RGPD).",
      "Loi du 10 mai 2018 relative à la protection des données personnelles.",
      "Dispositions polonaises et européennes pertinentes concernant les services électroniques, les communications électroniques et les droits des consommateurs."
     ]
    }
   ],
   "title": "Politique de confidentialité et de protection des données personnelles",
   "meta": [
    "RGPD",
    "Version 1.0",
    "Territoire: République de Pologne"
   ],
   "intro": [
    "La présente Politique de Confidentialité explique comment NICKOVWAY SP. Z O.O., opérant sous la marque Dobra, traite les données personnelles des utilisateurs de la Plateforme Dobra, des Clients, des personnes de contact des Partenaires Restaurateurs et d'autres personnes utilisant les services de Dobra."
   ]
  },
  "terms": {
   "sections": [
    {
     "heading": "1. Objet et portée du Règlement",
     "paragraphs": [
      "1.1. Dobra gère une plateforme internet permettant de commander des repas et d'organiser leur livraison sur le territoire polonais.",
      "1.2. Par l'intermédiaire de la Plateforme Dobra, le Client peut notamment :"
     ],
     "bullets": [
      "rechercher des restaurants et autres établissements de restauration partenaires de Dobra (les « Restaurants ») ;",
      "consulter les menus et les offres des Restaurants ;",
      "passer des commandes auprès des Restaurants ;",
      "effectuer des paiements en utilisant les méthodes disponibles sur la Plateforme ;",
      "utiliser le service de livraison, si disponible ;",
      "suivre le statut de la commande et de la livraison ;",
      "contacter Dobra pour toute question relative aux commandes et aux livraisons."
     ]
    },
    {
     "heading": "2. Rôle de Dobra et des Restaurants",
     "paragraphs": [
      "2.1. Dobra fournit une solution technologique permettant aux Clients et aux Restaurants de conclure des transactions. Sauf indication contraire expresse, Dobra n'est ni le vendeur ni le producteur des aliments ou boissons proposés sur la Plateforme.",
      "2.2. Le Restaurant indiqué sur sa page et lors de la commande est le vendeur des produits et est responsable notamment de la préparation des repas, de la qualité et de la conformité des produits, des ingrédients, des informations sur les allergènes, de la sécurité alimentaire, des descriptions et de la disponibilité des produits, ainsi que des autorisations requises.",
      "2.3. Si la commande est indiquée comme étant livrée par Dobra, Dobra organise ou assure le service de livraison du Restaurant au Client. La livraison peut être effectuée par les employés de Dobra, des coursiers indépendants, des entrepreneurs en modèle B2B ou des partenaires de flotte.",
      "2.4. Aucune disposition du Règlement ne limite les droits du Client découlant des dispositions impératives du droit polonais ou du droit de l'Union Européenne."
     ]
    },
    {
     "heading": "3. Compte Client",
     "paragraphs": [
      "3.1. L'utilisation de certaines fonctionnalités de la Plateforme peut nécessiter la création d'un compte Dobra.",
      "3.2. Le Client est tenu de fournir des données véridiques, actuelles et complètes.",
      "3.3. Le Client ne peut pas créer de compte en utilisant les données d'une autre personne sans son consentement, fournir de fausses données, créer des comptes dans le but de frauder, partager son compte avec des personnes non autorisées, ni utiliser la Plateforme de manière illégale.",
      "3.4. Le Client est responsable du maintien de la confidentialité de ses données de connexion. Tout soupçon d'accès non autorisé doit être immédiatement signalé à support@mydobra.pl."
     ]
    },
    {
     "heading": "4. Services fournis par voie électronique et exigences techniques",
     "paragraphs": [
      "4.1. Dobra fournit par voie électronique, entre autres, la gestion du Compte Client, la mise à disposition des offres des Restaurants, la passation de commandes, la gestion des paiements et des livraisons, les informations sur le statut de la commande, le service client, le système d'évaluation et d'avis, les fonctionnalités promotionnelles et les notifications.",
      "4.2. L'utilisation de la Plateforme nécessite un accès à Internet, un appareil compatible, un système d'exploitation ou un navigateur pris en charge et — si nécessaire — une adresse e-mail et un numéro de téléphone actifs.",
      "4.3. Le Client ne peut pas fournir de contenus illicites ni utiliser la Plateforme d'une manière qui perturberait son fonctionnement ou sa sécurité."
     ]
    },
    {
     "heading": "5. Informations sur les Restaurants et les produits",
     "paragraphs": [
      "5.1. Le Restaurant est responsable de l'exactitude des informations concernant ses produits et offres, y compris le nom, l'adresse, le menu, les prix, les ingrédients, les allergènes, les descriptions, les heures d'ouverture et la disponibilité.",
      "5.2. Dobra peut aider les Restaurants à présenter ces informations, mais cela n'entraîne pas que Dobra devienne le vendeur des produits du Restaurant."
     ]
    },
    {
     "heading": "6. Allergies et intolérances alimentaires",
     "paragraphs": [
      "6.1. Le Client ayant des allergies, des intolérances alimentaires ou des exigences diététiques particulières doit lire attentivement les informations fournies par le Restaurant et, si nécessaire, le contacter avant de passer commande.",
      "6.2. Le Restaurant est responsable de la fourniture des informations sur les allergènes requises par la loi. Le Client ne doit pas supposer qu'un produit ne contient pas d'allergène simplement parce qu'il n'apparaît pas dans le nom du produit."
     ]
    },
    {
     "heading": "7. Passer une commande",
     "paragraphs": [
      "7.1. Le Client sélectionne le Restaurant, les produits, la quantité, les variantes, l'adresse de livraison, le mode de livraison ou de retrait et la méthode de paiement.",
      "7.2. Avant de passer commande, le Client peut vérifier la commande et corriger les éventuelles erreurs.",
      "7.3. Avant de confirmer la commande, la Plateforme affiche le montant total à payer, incluant les frais obligatoires, et le bouton de finalisation indique clairement l'obligation de paiement.",
      "7.4. La confirmation automatique de la réception de la commande n'implique pas nécessairement son acceptation par le Restaurant. Le Client sera informé de l'acceptation ou du refus de la commande."
     ]
    },
    {
     "heading": "8. Prix et frais",
     "paragraphs": [
      "8.1. Les prix pour les Clients sont indiqués en zlotys polonais (PLN) et incluent les taxes applicables, si la réglementation l'exige.",
      "8.2. Le prix total de la commande peut inclure :"
     ],
     "bullets": [
      "la valeur des produits du Restaurant ;",
      "les frais de livraison ;",
      "les frais de service, s'ils sont appliqués ;",
      "les frais de petite commande ;",
      "d'autres frais autorisés par la loi, dont le Client sera expressément informé avant de passer la commande."
     ]
    },
    {
     "heading": "9. Paiements",
     "paragraphs": [
      "9.1. Dobra permet les paiements pour les commandes des Restaurants et les services de Dobra en utilisant les méthodes disponibles sur la Plateforme. Cela ne signifie pas que Dobra devient le vendeur des produits du Restaurant.",
      "9.2. Les paiements peuvent être techniquement traités, réglés ou gérés par des prestataires de services de paiement externes autorisés.",
      "9.3. Les méthodes de paiement disponibles peuvent inclure les cartes de crédit, les paiements mobiles et électroniques, les virements et d'autres méthodes disponibles sur la Plateforme.",
      "9.4. Dobra ne stocke pas les données complètes des cartes de crédit si le traitement des paiements est effectué par un prestataire externe."
     ]
    },
    {
     "heading": "10. Livraison",
     "paragraphs": [
      "10.1. Si Dobra assure la livraison, elle organise le transport de la commande acceptée du Restaurant à l'adresse indiquée par le Client.",
      "10.2. Le Client est tenu de fournir une adresse de livraison correcte ainsi que les informations nécessaires à son exécution (numéro de bâtiment et d'appartement, code ou instructions d'accès, autres informations relatives à l'accès) et de rester joignable au numéro de téléphone indiqué.",
      "10.3. Le délai de livraison estimé est indicatif et ne constitue pas une date garantie. Le délai de livraison peut être influencé, entre autres, par le temps de préparation de la commande, les conditions routières et météorologiques, la distance, la disponibilité des coursiers et d'autres circonstances indépendantes de la volonté raisonnable de Dobra."
     ]
    },
    {
     "heading": "11. Absence du Client lors de la livraison",
     "paragraphs": [
      "11.1. Si le livreur arrive sur place mais ne peut pas effectuer la livraison, des tentatives raisonnables de contact téléphonique, via une notification dans l'application ou un message électronique, peuvent être entreprises.",
      "11.2. La livraison peut être considérée comme échouée en cas d'adresse erronée, d'impossibilité d'accès au lieu de livraison, d'absence de contact avec le Client ou de non-réception de la commande dans un délai raisonnable.",
      "11.3. La facturation des frais au Client ou le refus de remboursement ne peut avoir lieu que dans la mesure conforme aux dispositions légales en vigueur."
     ]
    },
    {
     "heading": "12. Annulation de commande",
     "paragraphs": [
      "12.1. Le Client peut demander l'annulation d'une commande via la Plateforme, si cette fonctionnalité est disponible.",
      "12.2. La possibilité d'une annulation gratuite peut dépendre du fait que le Restaurant ait accepté la commande, ait commencé ou terminé sa préparation, et que la livraison ait déjà débuté.",
      "12.3. Ce point ne limite pas les droits impératifs du Client découlant du droit polonais."
     ]
    },
    {
     "heading": "13. Droit de rétractation",
     "paragraphs": [
      "13.1. Le droit légal de rétractation concernant un contrat conclu à distance est soumis aux exceptions définies par la loi, en particulier en ce qui concerne les produits périssables ou à durée de conservation limitée.",
      "13.2. Aucune disposition des présentes Conditions Générales ne saurait exclure le droit de rétractation, si celui-ci est dû au Client en vertu de dispositions impératives."
     ]
    },
    {
     "heading": "14. Commandes incorrectes, incomplètes ou endommagées",
     "paragraphs": [
      "Les problèmes relatifs à la commande doivent être signalés via l'application Dobra ou à support@mydobra.pl — ceux-ci peuvent inclure des produits manquants ou incorrects, des dommages importants à la commande, une absence de livraison, une livraison à une adresse incorrecte ou des problèmes de qualité significatifs.",
      "Le Client doit fournir le numéro de commande, une description du problème et, si cela est utile, des photographies. En fonction de la nature du problème, la responsabilité incombe au Restaurant ou à Dobra, conformément à la législation en vigueur."
     ]
    },
    {
     "heading": "15. Remboursements de paiements",
     "paragraphs": [
      "15.1. Selon les circonstances, le Client peut avoir droit à un remboursement total ou partiel, à un échange de produit, à un complément de commande ou à un autre recours prévu par la loi.",
      "15.2. Le remboursement peut être effectué en utilisant la méthode de paiement initiale, si cela est techniquement possible ; le temps d'enregistrement dépend du fournisseur de paiement et de la banque du Client.",
      "15.3. Dobra peut volontairement accorder des fonds Dobra, un bon, un rabais ou une autre compensation. Cela ne remplace pas les droits statutaires du Client."
     ]
    },
    {
     "heading": "16. Réclamations",
     "paragraphs": [
      "Les réclamations concernant la Plateforme Dobra ou les services de livraison peuvent être adressées à : NICKOVWAY SP. Z O.O., ul. Jana III Sobieskiego 38, 55-330 Lutynia, Polska, e-mail : support@mydobra.pl, tél. : +48 505 645 999.",
      "La réclamation devrait, si possible, contenir le nom et le prénom du Client, le numéro de commande, la description du problème et la solution attendue. Dobra traite les réclamations dans le délai requis par les dispositions légales."
     ]
    },
    {
     "heading": "17. Évaluations et avis",
     "paragraphs": [
      "17.1. Le Bien peut permettre aux Clients de publier des évaluations et des avis concernant le Restaurant, les produits et la livraison, et d'identifier les avis provenant des Clients qui ont effectivement passé une commande.",
      "17.2. Les avis ne peuvent contenir de contenu illégal, de menaces, de contenu offensant, discriminatoire, de fausses informations, de spam, de publicités non autorisées, de données personnelles divulguées sans fondement légal, ni de contenu violant les droits de tiers."
     ]
    },
    {
     "heading": "18. Classement des Restaurants",
     "paragraphs": [
      "Les restaurants et les offres peuvent être classés en fonction de la localisation du Client et du Restaurant, de la distance et du temps de livraison estimé, de la disponibilité, des heures d'ouverture, de la popularité, de l'historique des commandes, des évaluations des Clients, du prix, de la pertinence, de la capacité de livraison, des promotions et des accords commerciaux avec Dobra.",
      "Le positionnement payant, les publicités ou toute autre forme d'influence rémunérée sur la visibilité seront clairement indiqués si les dispositions légales l'exigent."
     ]
    },
    {
     "heading": "19. Promotions et crédits Dobra",
     "paragraphs": [
      "19.1. Dobra peut offrir des codes de réduction, des campagnes promotionnelles, des programmes de parrainage, la livraison gratuite, des crédits sur le compte et des promotions concernant des Restaurants spécifiques.",
      "19.2. Les conditions des promotions peuvent inclure une date de validité, une valeur minimale de commande, des Restaurants sélectionnés, des restrictions territoriales, des conditions relatives au compte, une valeur maximale de réduction et une limitation du nombre d'utilisations.",
      "19.3. Il est interdit d'abuser des promotions, notamment en créant plusieurs comptes, en effectuant de faux parrainages ou des transactions frauduleuses. Dobra peut annuler les avantages obtenus suite à une fraude ou à un abus."
     ]
    },
    {
     "heading": "20. Données de localisation du Client",
     "paragraphs": [
      "20.1. Avec le consentement du Client, Dobra peut utiliser la localisation de l'appareil afin d'afficher les Restaurants desservant une zone donnée, de vérifier la disponibilité de la livraison, de faciliter la détermination du lieu de livraison, de calculer le temps de livraison estimé et de présenter des offres pertinentes.",
      "20.2. L'accès à la localisation peut être contrôlé dans les paramètres de l'appareil. Les détails du traitement des données de localisation sont décrits dans la Politique de Confidentialité de Dobra."
     ]
    },
    {
     "heading": "21. Suivi de livraison",
     "paragraphs": [
      "21.1. La Société peut mettre à disposition une fonction de suivi de livraison en temps réel ou approximative ; pendant une livraison active, le Client peut recevoir des informations sur la localisation du coursier.",
      "21.2. Ces informations sont fournies dans le but d'exécuter la commande, d'assurer la sécurité et d'améliorer la livraison, et peuvent ne pas représenter la localisation exacte du coursier à tout moment."
     ]
    },
    {
     "heading": "22. Utilisation autorisée de la Plateforme",
     "bullets": [
      "l'utilisation des Biens à des fins illégales;",
      "la réalisation ou la tentative de réalisation de fraudes de paiement;",
      "l'abus des mécanismes de retour ou de chargeback;",
      "la manipulation des promotions et la création de faux comptes;",
      "les menaces, le harcèlement ou l'insulte envers les coursiers, les employés des Restaurants, les employés de Dobra ou d'autres personnes;",
      "les tentatives d'accès non autorisé aux systèmes de Dobra ou la perturbation de la sécurité de la Plateforme;",
      "l'introduction de virus, de logiciels malveillants ou de tout autre code nuisible;",
      "le téléchargement ou la copie systématique des données de la Plateforme d'une manière illégale."
     ],
     "paragraphs": [
      "Il est notamment interdit au Client de :"
     ]
    },
    {
     "heading": "23. Restriction ou suspension du compte",
     "paragraphs": [
      "Dobra peut restreindre, suspendre ou – dans des cas justifiés – mettre fin à la possibilité d'utiliser un compte en raison de fraude ou de suspicion de fraude, de violation grave ou répétée du Règlement, d'abus de paiement, de menaces ou de harcèlement, de menace à la sécurité, d'activités illégales, d'abus de promotions, ou de la nécessité de protéger les Clients, les Restaurants, les coursiers ou Dobra.",
      "Ces actions seront entreprises dans le respect des dispositions légales impératives et proportionnellement aux circonstances."
     ]
    },
    {
     "heading": "24. Disponibilité de la Plateforme",
     "paragraphs": [
      "Dobra prend des mesures raisonnables pour assurer le fonctionnement stable de la Plateforme, mais ne garantit pas une disponibilité ininterrompue. Des interruptions peuvent survenir, entre autres, en raison de travaux de maintenance, de mises à jour, de pannes techniques ou de réseaux de télécommunication, d'incidents de cybersécurité et de circonstances échappant au contrôle raisonnable de Dobra.",
      "La présente clause ne limite pas les droits impératifs du Client."
     ]
    },
    {
     "heading": "25. Responsabilité",
     "paragraphs": [
      "25.1. Dobra est responsable de ses propres obligations contractuelles conformément à la loi applicable, y compris les obligations liées au service de livraison.",
      "25.2. Si le Restaurant est le vendeur, la responsabilité relative au contrat de vente et aux produits du Restaurant incombe au Restaurant dans les limites fixées par la loi.",
      "25.3. Aucune disposition du Règlement ne saurait exclure ou limiter la responsabilité là où cela est légalement inadmissible, ni les droits impératifs du consommateur."
     ]
    },
    {
     "heading": "26. Données personnelles",
     "paragraphs": [
      "Les données personnelles sont traitées conformément à la Politique de Confidentialité de Dobra. Selon la manière dont la Plateforme est utilisée, Dobra peut traiter, entre autres : les données de compte, le nom et le prénom, le numéro de téléphone, l'adresse e-mail, les adresses de livraison, l'historique des commandes, la correspondance avec le service client, les informations de paiement, les informations sur l'appareil, l'adresse IP et la localisation, ainsi que les données utilisées pour la prévention de la fraude.",
      "Contact pour les questions de confidentialité : legal@mydobra.pl."
     ]
    },
    {
     "heading": "27. Modifications du Règlement",
     "paragraphs": [
      "Dobra peut modifier le Règlement pour des raisons justifiées, telles que des changements dans les dispositions légales, de nouvelles exigences réglementaires, l'introduction de nouvelles fonctionnalités, la modification des services, les exigences de sécurité, les changements technologiques ou les modifications du modèle commercial.",
      "Les Clients seront informés des modifications importantes conformément à la législation en vigueur. Les modifications ne privent pas le Client des droits acquis concernant les commandes exécutées avant leur entrée en vigueur."
     ]
    },
    {
     "heading": "28. Droits du consommateur",
     "paragraphs": [
      "Aucune disposition du Règlement n'exclut, ne limite ou ne modifie les droits du consommateur qui ne peuvent être effectivement écartés en vertu du droit polonais ou du droit de l'Union européenne.",
      "Le Client peut obtenir des informations concernant les droits du consommateur auprès des autorités compétentes de protection des consommateurs et des organisations de consommateurs."
     ]
    },
    {
     "heading": "29. Droit applicable et litiges",
     "paragraphs": [
      "Le présent Règlement est régi par le droit de la République de Pologne, compte tenu des dispositions impératives du droit de l'Union européenne.",
      "Dans le cas de Clients consommateurs, les dispositions du Règlement ne limitent pas les règles de compétence juridictionnelle ni d'autres droits protecteurs. Les litiges peuvent être soumis aux tribunaux compétents conformément aux dispositions en vigueur."
     ]
    },
    {
     "heading": "30. Contact",
     "paragraphs": [
      "Service Client : support@mydobra.pl, tél. +48 505 645 999 — questions relatives aux commandes, livraisons, retours, comptes et réclamations.",
      "Affaires juridiques et confidentialité : legal@mydobra.pl.",
      "Opérateur de la Plateforme : NICKOVWAY SP. Z O.O., ul. Jana III Sobieskiego 38, 55-330 Lutynia, Polska. KRS: 0000791473 | NIP: 8982251132 | REGON: 383675818 | Capital social : 5 000 PLN."
     ]
    }
   ],
   "title": "Règlement de la Plateforme Dobra",
   "meta": [
    "Version 1.0",
    "Territoire : République de Pologne"
   ],
   "intro": [
    "Le présent Règlement définit les principes d'accès et d'utilisation de l'application mobile Dobra, du site internet et des services associés (« Plateforme Dobra »).",
    "La Plateforme Dobra est exploitée par NICKOVWAY SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ, ul. Jana III Sobieskiego 38, 55-330 Lutynia, Polska. KRS: 0000791473, NIP: 8982251132, REGON: 383675818, kapitał zakładowy: 5 000 PLN.",
    "Service Client : support@mydobra.pl, tél. +48 505 645 999. Contact juridique et de confidentialité : legal@mydobra.pl."
   ]
  }
 }
};
