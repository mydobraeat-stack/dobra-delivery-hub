# Vendor Dashboard: create restaurant, logo, menu, orders

Turn the vendor side into a real working dashboard: a restaurant owner can set up
their restaurant, upload a logo, build a menu with photos and prices, and run the
day-to-day order flow.

## What the vendor gets

1. **No restaurant yet → setup form**
   Name, cuisine, city, country, average delivery time, delivery fee, and a logo
   upload. On save, the restaurant is created in "pending approval" state (only
   the platform can approve it), and the dashboard switches to the managing view.

2. **Restaurant header**
   Logo, name, cuisine, city, approval badge (pending / approved), plus quick
   counters: active orders and delivered revenue. An "Edit details" panel updates
   name, cuisine, city, delivery time and fee, and replaces the logo.
   Owners with several restaurants keep the existing switcher, plus an
   "Add restaurant" button.

3. **Menu management**
   - Add a dish: name, price, currency, photo upload.
   - Edit price/name, replace the photo, toggle availability, delete a dish.
   - Empty state that invites the first dish.

4. **Orders**
   - Live list split into Active and Completed.
   - Each order expands to show the dishes, quantities and line prices.
   - Actions: Accept → Start preparing → Mark ready, plus Cancel while the order
     has not been picked up. Once ready, drivers see it on their side.

5. **Pending approval**
   A vendor whose account is still pending keeps the current pending screen, but
   can already create their restaurant and menu so they are ready to go live.

## Fixes needed along the way

- Creating a restaurant currently fails: the database rule that lets a vendor
  insert a restaurant calls a helper function that signed-in users are no longer
  allowed to run (the same cause as the order-list error fixed earlier). The same
  problem affects the rule that lets a driver save their own driver record. Both
  rules get rewritten to check the role directly, with no helper call.
- Uploaded images live in private storage, so the app will fetch short-lived
  signed links for them. Seeded photos already stored as plain URLs keep working
  unchanged.

## Technical notes

- Migration: drop and recreate `restaurants` INSERT policy and `drivers` ALL
  policy, replacing `has_role(auth.uid(), ...)` with
  `EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = '<role>')`.
  Add a `menu_items` DELETE path (already covered by the owner ALL policy) — verify
  only, no change expected. No new tables.
- Storage: upload to `restaurant-logos/<uid>/<uuid>.<ext>` and
  `menu-images/<uid>/<uuid>.<ext>` (matches existing `storage.objects` policies).
  Persist the object path in `restaurants.logo_url` / `menu_items.image_url`.
  New helper `src/lib/storage.ts`: `uploadImage(bucket, file)` and
  `useImageUrl(value)` — values starting with `/` or `http` are used as-is,
  anything else is resolved through `createSignedUrl` (1 hour) and cached by
  React Query.
- New file `src/components/dobra/ImageUpload.tsx` — file input + preview +
  progress/error state, used by both the restaurant form and the dish form.
- Extend `src/lib/dobra.ts` with mutations: `createRestaurant`, `updateRestaurant`,
  `createMenuItem`, `updateMenuItem`, `deleteMenuItem`, `cancelOrder`, and
  `vendorOrderItemsQuery` for the expandable order details.
- Rewrite `src/routes/_authenticated/vendor.tsx` around three sections
  (restaurant, orders, menu) with shadcn `Dialog` forms, `react-hook-form` + zod
  validation, and `sonner` toasts; invalidate the relevant query keys after each
  mutation.
- Customer and restaurant-detail pages switch to the same `useImageUrl` helper so
  vendor-uploaded photos show up there too.
