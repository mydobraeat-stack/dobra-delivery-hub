# Existing customers can apply to drive

- Add a branded “Become a driver” profile option for customers without a driver role, followed by a brief four-language introduction with no earnings promises.
- Start a draft application on the same account. Reuse vehicle-dependent documents, photo capture/examples and the existing profile phone. Record acceptance of the main Terms before submission; no separate driver terms were found.
- Show application status and remembered Customer/Driver mode switches. Switching to Customer sets the driver offline; any active delivery blocks switching.
- Add existing-customer tags to Pending Approvals and notify admins/applicants of application events and decisions.
- Enforce approval, document-review protection, role assignment and switching rules in the database. Test concrete rules and exercise the existing-customer flow in the browser; disclose account-access or live-delivery verification limits.

## Technical implementation

Use authenticated, narrow SECURITY DEFINER database RPCs with caller checks and driver-row locking. Keep roles in the existing multi-role user_roles table; application approval stays separate from customer profile approval. Store preferred mode and Terms acceptance durably. Protect driver-only reads/claims and online status with aggregate document approval plus an active account, and preserve existing admin audit triggers.