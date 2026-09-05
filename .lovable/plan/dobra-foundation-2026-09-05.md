# Dobra — Foundation

A yellow-and-red delivery app shell serving three kinds of people: customers, restaurants, and drivers.

## Branding

- Background/accent: warm golden yellow (#FFD100)
- Text: near-black charcoal
- "Dobra" wordmark: bold red script, used on every screen header
- Clean card-based layout in the Uber Eats / Glovo spirit

## Screens

1. **Welcome (/)** — big Dobra wordmark, three role cards ("I'm a Customer", "I'm a Vendor", "I'm a Driver"), then Sign Up / Log In buttons.
2. **Sign up / Log in (/auth)** — email and password. Sign-up carries the chosen role plus full name and country. Google sign-in included alongside email as the standard option.
3. **Customer Home** — header, search bar placeholder, "Restaurants near you" placeholder cards.
4. **Vendor Dashboard** — header, "Your Orders" and "Menu" placeholders; if the restaurant is not approved yet, a friendly "pending approval" panel replaces them.
5. **Driver Home** — header, "Available Deliveries" and "My Earnings" placeholders; same pending-approval panel when not yet approved.

After login, people land on the screen matching their role automatically.

## Accounts and data

Lovable Cloud provides the accounts and database (no separate setup or account needed).

- A profile record per person: id, email, full name, country, approval status, created date.
- Roles are kept in their own separate table for safety, so nobody can grant themselves extra access.
- Each person can only read and edit their own profile; approval status is not self-editable.
- Profile is created automatically on sign-up with the role picked on the welcome screen.

## Technical notes

- Enable Lovable Cloud (Supabase) first.
- Migration: `public.profiles` (id uuid PK → auth.users on delete cascade, email, full_name, country, approval_status text default 'pending', created_at) and `public.user_roles` with `app_role` enum ('customer','vendor','driver') + `has_role()` security-definer function. GRANTs for `authenticated`/`service_role`, RLS on both, self-scoped SELECT/UPDATE policies (UPDATE restricted so approval_status stays server-side), user_roles read-own only.
- `handle_new_user` trigger inserts profile + role from sign-up metadata.
- Routes: `src/routes/index.tsx` (welcome), `/auth`, and `_authenticated/customer`, `_authenticated/vendor`, `_authenticated/driver` under the managed auth gate; a small role-router redirects after login.
- Design tokens (yellow surface, red brand, charcoal ink, script display font loaded via `<link>` in `__root.tsx`) go in `src/styles.css`; no hardcoded colors in components.
- Per-route head() metadata for title/description/OG.

Approval flow (who approves vendors/drivers) is out of scope here — status starts as pending and will get an admin surface later.
