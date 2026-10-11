export default {
  callDriver: "Appeler le livreur",
  callCustomer: "Appeler le client",
  callSender: "Appeler l'expéditeur",
  callRecipient: "Appeler le destinataire",
  failed: "Impossible de lancer l'appel. Réessayez ou utilisez le chat.",
  noNumber: {
    driver: "Votre livreur n'a pas encore ajouté de numéro — utilisez le chat.",
    customer: "Le client n'a pas ajouté de numéro — utilisez le chat.",
    recipient: "Aucun numéro de destinataire — appelez l'expéditeur ou utilisez le chat.",
  },
  phone: {
    label: "Numéro de téléphone",
    hint: "Format international, ex. +48 600 123 456. Communiqué au livreur uniquement pendant une commande active.",
    driverHint: "Format international. Communiqué au client uniquement pendant la livraison.",
    recipientLabel: "Téléphone du destinataire (facultatif)",
    recipientHint: "Permet au livreur d'appeler le destinataire à la livraison. Communiqué uniquement pendant la livraison.",
    saved: "Numéro enregistré.",
    error: {
      required: "Veuillez saisir votre numéro de téléphone.",
      format: "Commencez par + et l'indicatif du pays, ex. +48.",
      length: "Ce numéro semble trop court ou trop long — vérifiez les chiffres.",
    },
  },
  driverPhone: {
    title: "Votre numéro de téléphone",
    body: "Les clients peuvent vous appeler pendant que vous livrez leur commande. Votre numéro n'est jamais affiché à l'écran.",
    save: "Enregistrer le numéro",
    missing: "Ajoutez votre numéro de téléphone avant de passer en ligne.",
    missingItem: "numéro de téléphone",
  },
};
