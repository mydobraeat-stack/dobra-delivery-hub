# Dobra

Food and package delivery platform. Customers order from local restaurants, restaurants run their menu and orders, drivers accept and complete deliveries, and an admin panel runs the whole platform.

**Live site:** https://mydobra.pl

## What it does

**Customer**
- Browse restaurants and menus near a chosen city, search, categories, dish photos
- Cart and checkout: card, BLIK, Apple Pay / Google Pay (through Stripe) or cash on delivery
- Promo codes, delivery address with manual formatting, optional package delivery to another person
- Live order tracking with the driver's position, order timeline, reviews, chat with restaurant/driver
- In-app notifications and browser (web push) notifications

**Restaurant (vendor)**
- Restaurant profile and logo, opening state, menu with categories, dishes, prices, availability
- Incoming orders, accept / prepare / hand over, order history

**Driver**
- Approval-gated: driver home unlocks after verification, with ID document upload
- Timed delivery offers with sound, accept or decline, pickup and drop-off steps
- One-tap navigation to Google Maps (restaurant, then customer), travel mode by vehicle
- Cash settlement handover, earnings, payout history

**Admin**
- Orders (with safeguards and audited manual actions), users, restaurants, drivers
- Per-city and per-country pricing: commission, service fee, delivery fee, minimums, currency
- Promo codes, disputes, support tickets, review moderation, feedback
- Analytics, platform balances (online collected vs cash held), cash payouts to drivers
- Audit log of every staff action

**Public site**
- Marketing pages: home, about, cities, restaurants, partner, deliver, business, get started
- Legal and help: privacy, terms, refunds, complaints, help, contact
- Four languages — English (default), Polish, Ukrainian, French

## Tech stack

- React 19, TanStack Start (server-side rendering), TanStack Router, TanStack Query
- Vite 7, Tailwind CSS v4
- Supabase: Postgres with Row Level Security, Auth, Storage, Realtime
- react-hook-form + zod, Recharts, Web Push (`@block65/webcrypto-web-push`)
- Vitest for unit tests

## Repository layout

```text
src/
  routes/                 public pages: home, auth, about, contact, legal, help, cities…
    _authenticated/       signed-in pages, split by role:
                          customer.*, vendor.*, driver.*, admin.*, profile.*, checkout, chat
    api/public/           server endpoints: stripe-webhook, push dispatch
  lib/                    business logic: cart, checkout address, pricing, payouts,
                          phone validation, navigation, company details, admin rules,
                          server functions for payments and maps, i18n/ (en, pl, uk, fr),
                          email-templates/
  components/             dobra/ (app UI), marketing/ (public site), admin/, ui/ (shadcn)
  integrations/supabase/  generated Supabase client and types
supabase/migrations/      database migrations, apply in filename order
drizzle/migrations/       later migrations, apply after the above in date order
public/                   service worker (sw.js), icons, manifest, robots.txt, sitemap.xml
```

## Getting started

You need Node.js 20+ (or Bun) and access to the project's Supabase backend.

```sh
git clone <repository-url>
cd <repository-name>
npm install
npm run dev
```

The app is then served at http://localhost:8080.

## Environment variables

Browser-side (prefixed `VITE_`, shipped to visitors — public by design):

| Name | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Backend address the app talks to |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public API key |
| `VITE_SUPABASE_PROJECT_ID` | Backend project id |
| `VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY` | Google Maps browser key (restrict it to your domain) |
| `VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID` | Maps tracking id |

Server-side only (read with `process.env` inside handlers — never expose these):

| Name | Purpose |
| --- | --- |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | Backend access from the server |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged server work only (bypasses row-level security) |
| `STRIPE_SECRET_KEY` or `STRIPE_RESTRICTED_API_KEY` | Creating checkout sessions and refunds |
| `STRIPE_WEBHOOK_SECRET` | Verifies Stripe webhook signatures |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | Web push — the key pair must match the one existing subscribers were registered with |
| `PUSH_HOOK_SECRET` | Guards the push dispatch endpoint |
| `GOOGLE_MAPS_API_KEY` | Server-side Maps requests |

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run build` | Production build |
| `npm run preview` | Serve the built app locally |
| `npm run lint` | ESLint over the whole project |
| `npm run format` | Prettier |
| `npx vitest run` | Unit tests (pricing, balances, payouts, phone and address validation, navigation, order rules) |

## Self-hosting notes

- The app expects a Supabase-shaped backend: Auth, Storage buckets (`driver-documents`, `profile-photos`, `chat-uploads`, `restaurant-logos`, `menu-images`), and Realtime enabled on `orders`, `notifications`, `driver_locations`, `chat_threads`, `chat_messages`.
- Both migration folders must be applied in date order before the app is used.
- Auth emails are rendered from `src/lib/email-templates`; the sender is currently Lovable's managed email service, so switch the sending provider if you host elsewhere.
- Stripe payments need the webhook endpoint `POST /api/public/stripe-webhook` registered in your Stripe dashboard; the signature is checked against `STRIPE_WEBHOOK_SECRET`.
- Push notifications run through `public/sw.js` and the guarded dispatch endpoint `/api/public/push/dispatch`.
- A few `@lovable.dev/*` packages remain in `package.json` (build configuration, email and auth helpers); they are only needed while the app runs on Lovable's hosting and email service.
