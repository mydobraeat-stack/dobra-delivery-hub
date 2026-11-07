# Task roadmap

## Driver Home and delivery history
- [x] Restore immediate-dismiss offline confirmation with optimistic save/rollback and backdrop/Back cleanup; compact dynamic-height Home and upgrade search animation. Four requested states captured at 360x740, 390x844 and 412x915; simulated save/readback/reload, rollback, backdrop, Back, reduced motion and four-language checks passed, with 14 rule tests and clean build. Real-phone/live driver saving and Google map rendering remain unverified; local map key is not configured.
- [x] Add direct offline switching, remove the confirmation/close button, compact controls, round the search display and add sound/vibration; eight tests and simulated mobile/desktop write/readback checks passed. Preserve active-delivery safety with localized failure guidance. Real-driver persistence and physical phone feedback remain unverified because the available account is an admin.
- [x] Add same-button offline confirmation and visible rolling search text in the empty area; simulated mobile/desktop cancel, confirm and reduced-motion checks passed, six rule tests passed and build clean. Real-driver checks remain blocked by account approval below.
- [x] Make online control green with a pulsing Online indicator and activation beep, slim the horizontal searching strip and hide stats online; simulated mobile/desktop browser checks and audio scheduling passed, six tests passed and build clean. Real-phone audibility remains unverified.
- [x] Add localized rolling search strip directly below the toggle with offer/active/offline and reduced-motion handling.
- [x] Keep delivery lists on Deliveries with newest-first dates, pickup, status, payout and empty states.
- [x] Pass 20 focused tests and mobile/desktop simulated browser checks (online, decline/return, offline, active job, reduced motion, populated/empty history); signed-in Home checked, build clean.
- [ ] Verify online/offer transitions with a real driver account — blocked: driver test-account session approval was declined; simulated checks are not live delivery verification.

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
