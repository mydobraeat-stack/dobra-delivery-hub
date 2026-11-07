# Task roadmap

## Driver Home and delivery history
- [ ] Add localized rolling search strip directly below the toggle with offer/active/offline and reduced-motion handling.
- [ ] Keep delivery lists on Deliveries with newest-first dates, pickup, status, payout and empty states.
- [ ] Run rule tests and browser checks; disclose any real-driver session or offer verification blockers.

## Existing customer driver applications
- [x] Add same-account application, localized introduction/status and reuse driver onboarding with main Terms acceptance.
- [x] Enforce approval and mode switching safeguards, admin review tags and notifications.
- [x] Run 21 rule tests, verify phone/desktop introduction and signed-in admin approvals; verify admins cannot start customer applications.
- [ ] Verify existing-customer application, mode switches, active-delivery block, self-approval denial, private driver reads and online denial end to end — blocked: customer test-account session approval is unavailable; requesting user's available session is an admin.

## Driver cash payouts
- [x] Add audited Super Admin cash payout records, prevent duplicate/overpayments, and update available cash automatically.
- [x] Add payout page, balance links, and 24 passing safeguard tests; verify signed-in page and rejection of unearned payouts.
- [ ] Verify successful cash payment recording and readback — blocked: no settled cash is available; do not invent a real cash handover.

## Page gradients
- [x] Add subtle light-only Dobra gradients to page backgrounds and primary buttons; verify homepage and admin pages.
- [x] Extend the gradient washes to the marketing, legal, sign-in, customer, vendor, driver and admin surfaces; keep checkout panels crisp white with a distinct total panel and verify signed-in.

## Admin mobile layout
- [x] Arrange admin navigation, page controls, records, and dialogs for phone and desktop screens.
- [x] Verify signed-in admin navigation and populated pages on mobile and desktop.

## Dark theme
- [x] Make dark the default theme on every screen, keep the light / match-device choice, and fix yellow-surface and inverted-card contrast.

## Admin safeguards
- [x] Enforce safe order changes and cancellation reasons in the database and admin controls.
- [x] Tighten Support Agent permissions and reserve manual status progression for Super Admins.
- [x] Add nine rule tests and verify signed-in admin rejection checks, confirmation, and note save/readback.
- [ ] Verify Support Agent permissions in the browser — blocked: no Support Agent account exists; permission rules covered by unit tests.
