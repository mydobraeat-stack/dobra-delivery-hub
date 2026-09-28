# Admin panel expansion

This is a large build. I'll build it in phases, in your priority order. Each phase is tested in the browser before the next one starts, and each one ships working on its own.

## Phase 1: Order and money controls (built first, fully tested)
- **Order actions:** available for food and package orders.
  - Cancel, with a required reason.
  - Refund, full or partial, after a confirmation step. Cash orders are marked refunded or voided. Card orders are refunded through Stripe once the Stripe key is added. Until then, the refund is recorded as "pending card refund".
  - Reassign to another approved driver, picked from a list.
  - Force a status change, with a reason.
  - Internal admin notes, which only admins can see.
- **Disputes queue:** problem orders show up here automatically:
  - cancelled after a driver was assigned
  - running more than 30 minutes past their estimated time
  - a customer complaint (a new "Report a problem" button on the order screen)
  - a manual flag by an admin

  Admins can mark each one resolved with a note.
- **Audit log:** starts now, so every admin action from Phase 1 onward is recorded.
- **Admin levels:** Super Admin and Support Agent. Support Agents can handle orders and disputes only.

## Phase 2: Pricing and fees
- **Settings > Pricing, per country:** each country has its own currency (Poland PLN, Cameroon XAF), and admins set:
  - commission %
  - customer service fee
  - default delivery fee
  - minimum order
  - package base fee, per-km rate and minimum fee
- **City overrides:** a city can have its own delivery fee.
- **Checkout and package pricing:** both read these settings, which replaces the fixed 12 PLN + 2.5 PLN/km.

## Phase 3: Users and partners
- **Users list:** search and filter by role, country and status. Admins can suspend or ban with a reason, reactivate, and see a user's orders.
- **Suspended users:** they see a "suspended" screen and can't place, accept or sell orders.
- **Driver stats:** deliveries, acceptance rate and real ratings. Documents expiring within 30 days are flagged.
- **Restaurants:** suspend or unsuspend, set a commission for one restaurant, and mark a restaurant as featured so it's shown first to customers.

## Phase 4: Marketing and platform
- **Promo codes:** create, edit, disable and delete, including percentage or fixed discounts, limits, expiry, minimum order and country. Customers can enter a code at checkout and the discount is checked by the app itself, so it can't be faked.
- **Prime members:** see the list and grant or revoke membership manually.
- **Announcements:** send an in-app and push message to everyone, or only to one role or country.
- **Cities and countries:** turn each one on or off. The public "Cities we serve" list reads from these settings.
- **Maintenance mode:** turns on a "we'll be right back" screen for customers.

## Phase 5: Insight and safety
- **Analytics:** filter by date range and country. It shows orders, revenue, active drivers, average delivery time and top restaurants, with simple charts.
- **Reviews:** hide or remove inappropriate reviews.
- **Audit log:** a screen to view and filter every recorded admin action.
- **CSV export:** download the orders and users lists.

## Technical details
- **New tables:**
  - platform_settings: a single row for maintenance mode and similar switches
  - country_pricing
  - cities
  - order_admin_notes
  - order_disputes
  - admin_audit_log
  - promo_codes and promo_redemptions
  - announcements
- **New columns:**
  - profiles: account_status and suspension_reason
  - restaurants: commission_rate and featured
  - orders: refund_amount, refund_status, cancel_reason, discount and promo_code
- **Admin levels:** a new role called support_agent, alongside admin (Super Admin). Access rules check them with has_role.
- **Admin actions** run as secure database functions (for example admin_cancel_order and admin_refund_order). Each one checks the admin's role and writes to the audit log in the same step.
- **Stripe refunds** run on the server, behind the Super Admin or Support Agent check.
- **Pricing** is read from country_pricing in `src/lib/dobra.ts`. Promo codes are checked in the database when the order is placed.
- **The admin panel** stays full-width and responsive, with new tabs grouped as Operations, Pricing, People, Marketing, Insights and Settings.

## What I assume
- A dispute is flagged as "late" 30 minutes after the estimated time. You can change this in Settings.
- Your current admin accounts become Super Admins.
- Browser tests will use your own account, since the test logins don't work. For driver reassignment, I'll create a temporary test driver and remove it afterwards.

When you approve, I'll build Phase 1 and test it. Then I'll carry on through Phases 2 to 5 in the same way, and report after each phase what's done and what's left.
