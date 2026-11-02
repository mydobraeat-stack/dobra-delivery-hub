# Dobra backend inventory and migration plan (read-only, nothing changed)

Checked live on 2 Nov 2026 by reading the database and the code. Anything marked UNVERIFIED could not be read from here.

## 1. Database

Tables and approximate row counts:

| Table | Rows | Table | Rows |
|---|---|---|---|
| notifications | 168 | restaurants | 9 |
| order_items | 46 | driver_documents | 9 |
| orders | 37 | admin_audit_log | 6 |
| user_roles | 21 | chat_messages / chat_threads | 6 / 6 |
| profiles | 20 | drivers | 3 |
| menu_items | 19 | country_pricing / driver_locations / push_subscriptions | 2 / 2 / 2 |
| cities | 11 | call_logs, order_admin_notes, platform_settings, reviews | 1 each |

Empty: announcements, driver_cash_payouts, order_contacts, order_disputes, prime_memberships, promo_codes, promo_redemptions.

- **RLS policies:** about 90 on public tables, plus 7 on storage files. All are role-based (anon/authenticated) and use `has_role` and `private.is_staff` / `is_platform_admin`. The full list was read. All of them are in the migration files, so they recreate automatically.
- **Functions:** 37 public functions (the admin_* RPCs, call/chat/promo helpers, triggers) and 15 in a `private` schema (is_staff, is_platform_admin, log_admin, notify_*, order lifecycle and payout triggers, promo_discount, audit_changes).
- **Triggers:** about 45, including `on_auth_user_created` on auth.users, which creates the profile and role.
- **Enum:** `app_role` with customer, vendor, driver, admin and support_agent.
- **Extensions:** pgcrypto, uuid-ossp, pg_net, pg_cron, supabase_vault, pg_stat_statements.
- **Realtime:** turned on for orders, notifications, driver_locations, chat_threads and chat_messages.
- **Scheduled jobs:** UNVERIFIED. My access can't read the job list. `purge_old_call_logs()` exists, so a 12‑month call-log purge job is probably scheduled. You can check in the new project under Database → Cron.
- **Schema source:** 44 files in `supabase/migrations` plus 9 files in `drizzle/migrations`. Both sets must be applied, in date order.
- **Hardcoded value to watch:** `dispatch_web_push()` contains the old `lovable.app` address and a push secret written directly into the function.

## 2. Auth

- **Users:** 20 in total. 11 customers (4 have not confirmed their email), 4 vendors (1 unconfirmed), 3 drivers and 2 admins. There are no support agents.
- **Sign-in methods:** only email and password are in use (all 20 accounts). Google is switched off. No one has an Apple, Lovable or phone sign-in. When Google was on, it used Lovable's shared credentials.
- **Auth emails:** 6 branded templates (signup, recovery, magic link, invite, email change, reauthentication). They are sent through Lovable's managed email service by a webhook route in the app, from `noreply@mydobra.pl` via `notify.mydobra.pl`. The notify subdomain points to Lovable's nameservers.
- **Site URL and redirect URLs:** UNVERIFIED from here. Check More → Users → Auth settings → Advanced. Expect mydobra.pl, www.mydobra.pl, dobra-delivery-hub.lovable.app and the preview address.

## 3. Storage (all 5 buckets are private)

| Bucket | Files | Size | Holds | Personal data |
|---|---|---|---|---|
| driver-documents | 19 | ~25.8 MB | Driver ID, licence and vehicle papers | **YES, sensitive (identity documents)** |
| profile-photos | 4 | ~0.8 MB | User avatars | Yes |
| chat-uploads | 1 | ~0.5 MB | Chat attachments | Yes |
| restaurant-logos | 3 | ~3.7 MB | Logos and cover photos | No |
| menu-images | 1 | ~1.5 MB | Dish photos | No |

Some restaurant and dish images are bundled with the app rather than stored in these buckets.

## 4. Edge functions

There are none. All server logic runs inside the app as server functions and routes:
- `/api/public/stripe-webhook` reads the Stripe keys and the webhook secret.
- `/api/public/push/dispatch` reads the VAPID keys and PUSH_HOOK_SECRET.
- `/lovable/email/auth/webhook` reads LOVABLE_API_KEY.

So no verify_jwt settings apply.

## 5. Secrets (names only)

| Secret | Who supplied it | In the new project |
|---|---|---|
| STRIPE_SECRET_KEY, STRIPE_RESTRICTED_API_KEY | You | Copy the same values |
| STRIPE_WEBHOOK_SECRET | You | Regenerate. Add a new endpoint in Stripe (or keep the same URL) and take its new signing secret |
| VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT | You (generated earlier) | **Copy the exact same pair.** The 2 existing push subscriptions keep working only if both keys are identical. A new pair means users must re-enable notifications |
| PUSH_HOOK_SECRET | You | Copy it, or create a new one and update the database function to match |
| GOOGLE_API_KEY | You | Copy (not used by current code) |
| GOOGLE_MAPS_API_KEY, _BROWSER_KEY, _TRACKING_ID | Lovable connector | Replace with your own Google Cloud keys |
| LOVABLE_API_KEY | Lovable | Doesn't apply outside Lovable (email sending) |
| LOVABLE_CRON_SECRET | Lovable | Doesn't apply |
| SUPABASE_URL, _ANON_KEY, _SERVICE_ROLE_KEY, _DB_URL | Lovable | Your new project creates its own |

## 6. Lovable-managed services that won't carry over

- **Auth and app email via notify.mydobra.pl:** replace with your own sender (Resend, Postmark or SES) set up as Supabase custom SMTP or a send-email hook. Remove the Lovable NS records for `notify` at your registrar.
- **Google Maps connection:** Lovable's gateway (`connector-gateway.lovable.dev`) and its keys. Replace with your own Maps keys called directly, restricted to mydobra.pl, with billing on your account.
- **Managed Google sign-in:** already off. Later, use your own Google OAuth client in Supabase.
- **AI features:** none found in the code.
- **Hosting:** the app itself also runs on Lovable. Moving the backend doesn't move the website. The site can stay on Lovable with an external backend, or move to Cloudflare or Vercel later.
- **Error reporting and the build config package:** these are Lovable-specific.

## 7. Code coupling

- `package.json`: `@lovable.dev/email-js`, `@lovable.dev/webhooks-js`, `@lovable.dev/cloud-auth-js` and `@lovable.dev/vite-tanstack-config`.
- `src/routes/lovable/email/auth/*` and `src/lib/email-templates/*`: the email webhook. The templates can be reused.
- `src/integrations/lovable/index.ts`: Lovable sign-in helper, now unused because Google is off.
- `src/lib/maps.functions.ts` and `src/components/dobra/MapView.tsx`: the Maps gateway and `VITE_LOVABLE_CONNECTOR_*` keys.
- `src/lib/lovable-error-reporting.ts`, used in `__root.tsx`.
- `vite.config.ts` and `src/integrations/supabase/*`: auto-generated clients that read the project URL and key from `.env`.
- `dispatch_web_push()` in the database: hardcoded app address and secret.

## 8. Step-by-step migration (safe order)

1. **You:** create the new Supabase project in the EU region (for GDPR, ideally Frankfurt). Enable pg_net, pg_cron and pgcrypto.
2. **Me (after approval):** combine the 44 + 9 migration files into one ordered schema script, and fix `dispatch_web_push` to read its address and secret from settings.
3. **You:** run that script in the new project's SQL editor, then turn on realtime for the 5 tables and create the 5 private buckets.
4. **You, on your computer:** move the user accounts with the Supabase CLI (`pg_dump` of the auth schema, or an auth export/import). This step **keeps password hashes, so users don't need to reset**. Lovable Cloud doesn't give a full dump from chat. The data export is at More → Database → Manage → Settings → Export data. Moving auth users with their passwords may need help from Lovable staff. **UNVERIFIED** whether the export includes auth.users.
5. **You:** import the table data in dependency order (profiles, then roles, restaurants, orders and the rest). **Me:** I can export individual tables as CSV.
6. **You:** copy the storage files. I can download the bucket files to Files if you ask. Handle driver-documents as sensitive data.
7. **You:** set up email (SMTP or hook), the Site URL and redirect URLs, your own Maps keys, and the secrets from section 5 (same VAPID pair).
8. **Me:** switch the code to the new project (env/client), replace the Maps gateway and the email route, and remove the Lovable packages.
9. **You:** in Stripe, point the webhook at the live site and update its secret.
10. **Cutover:** this is the downtime window, about 30–60 minutes. Pause ordering using maintenance mode, do a final data sync, publish, and test.
11. Only after about 2 weeks of stable running: remove Lovable Cloud (this can't be undone).

**Test before removing anything:** sign in with an existing password in each role; place a cash order and a small card and BLIK order and confirm the webhook marks it paid; the vendor accepts the order; driver offer, navigation and live tracking; push notifications; chat with an attachment; call buttons; a password-reset email; admin balances and audit log; images in each bucket load.

**Re-login:** everyone will be signed out at cutover, because sessions are tied to the old project.

## 9. Risks

- **Password carry-over** depends on getting the auth.users hashes out. If that fails, all 20 users need password resets.
- **Personal data in exports:** driver ID documents, phone numbers, addresses, chat and call logs. Keep files encrypted, delete local copies afterwards, and record the new data processor in the Privacy policy.
- **Live ordering:** Stripe payments in progress during cutover. Use a quiet window and keep the old webhook until the new one is confirmed.
- **Push:** a different VAPID pair silently breaks notifications.
- **Email:** if `notify.mydobra.pl` NS records stay pointed at Lovable, a new provider can't verify that subdomain. Sign-up confirmations stop until the new sender works.
- **Maps:** the new keys need billing, or address search and maps break.
- **Unknown cron jobs** must be recreated by hand.
- **Order of the two migration folders:** applying them in the wrong order breaks the payout and cash rules.
