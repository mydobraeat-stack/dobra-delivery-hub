export default {
  callDriver: "Call driver",
  callCustomer: "Call customer",
  callSender: "Call sender",
  callRecipient: "Call recipient",
  failed: "We couldn't start the call. Please try again or use the chat.",
  noNumber: {
    driver: "Your driver hasn't added a phone number yet — use the chat instead.",
    customer: "The customer hasn't added a phone number — use the chat instead.",
    recipient: "No recipient number was given — call the sender or use the chat.",
  },
  phone: {
    label: "Phone number",
    hint: "International format, e.g. +48 600 123 456. Shared with your courier only during an active order.",
    driverHint: "International format. Shared with the customer only during an active delivery.",
    recipientLabel: "Recipient's phone (optional)",
    recipientHint: "Lets the courier call the recipient at drop-off. Shared only during the delivery.",
    saved: "Phone number saved.",
    error: {
      required: "Please enter your phone number.",
      format: "Start with + and your country code, e.g. +48.",
      length: "This number looks too short or too long — check the digits.",
    },
  },
  driverPhone: {
    title: "Your phone number",
    body: "Customers can call you while you deliver their order. Your number is never shown on screen.",
    save: "Save phone number",
    missing: "Add your phone number before going online.",
    missingItem: "phone number",
  },
};
