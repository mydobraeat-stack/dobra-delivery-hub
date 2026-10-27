# Task roadmap

## Driver cash payouts
- [ ] Add audited Super Admin cash payout records, prevent duplicate/overpayments, and update available cash automatically.
- [ ] Add payout page, balance links, and tests; verify payment recording and readback.

## Page gradients
- [ ] Add subtle light-only Dobra gradients to page backgrounds and primary buttons; verify homepage and admin pages.

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
