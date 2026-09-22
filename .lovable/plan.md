# Profile hub for Customer, Driver and Vendor

Turn the current single long profile page into a "Profile" hub screen with a tidy menu list, and move the detail editing into an "Account" sub-page.

## 1. Bottom navigation

- Customer and Vendor bottom tabs currently say "Account" — rename to "Profile" (person icon unchanged), in all four languages.
- Driver bottom tabs have no profile entry today (Home, Earnings, Deliveries, Help). Add a "Profile" tab so drivers reach the same hub; Help stays reachable from inside the hub as well.

## 2. Profile hub screen (`/profile`)

Header reads "Profile". Top card shows the avatar (initials fallback when no photo is uploaded) with name, email and role badge. Below it a tappable menu list:

| Item | Goes to | Shown for |
| --- | --- | --- |
| Order history | existing orders screen per role | customer / vendor / driver |
| Account | new `/profile/account` | all |
| Promo codes | new `/profile/promos` (placeholder: "No promo codes yet") | customer |
| Language | new `/profile/language` | all |
| FAQ / Help | `/help` for customer & vendor, existing driver help screen for drivers | all |
| Notifications | new `/profile/notifications` | all |
| Support chat | existing chat button | non-admin |
| Driver verification | existing documents screen | driver |
| Business / restaurants | existing vendor dashboard link | vendor |

Log out sits at the bottom, visually separated.

Appearance (light/dark) is skipped — no dark theme exists in the project.

## 3. Sub-pages

- `/profile/account` — everything that is on the profile page today: photo upload, full name, phone, country, read-only email, save button. Plus a "Change password" action that sends a reset email to the signed-in address. Addresses stay where they are (chosen at checkout) — no address book exists yet.
- `/profile/language` — the existing language switcher on its own page.
- `/profile/notifications` — the existing push notification settings card.
- `/profile/promos` — placeholder screen with an empty state, ready for a future promo system.

All four keep the phone-width frame for customer/driver and the full-width layout for vendor, matching today's behaviour.

## 4. Admin

Left as-is.

## Technical notes

- New routes: `src/routes/_authenticated/profile.index.tsx`, `profile.account.tsx`, `profile.language.tsx`, `profile.notifications.tsx`, `profile.promos.tsx`; `profile.tsx` becomes a layout rendering `<Outlet />` inside the role-appropriate shell (PhoneFrame for customer/driver) with `AppHeader` + `TabBar`.
- Shared `ProfileMenuItem` component (icon, label, chevron) in `src/components/dobra/`.
- Initials avatar derived from `full_name`, falling back to the email.
- `TabBar` customer/vendor label key `common.tabs.account` → `common.tabs.profile`; driver tabs gain the profile entry.
- New i18n keys under `common.profileMenu.*` in en/pl/uk/fr.
- Password change uses `supabase.auth.resetPasswordForEmail` with the existing auth redirect.
