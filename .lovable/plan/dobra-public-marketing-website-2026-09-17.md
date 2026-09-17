# Dobra public marketing website

Build a normal, fully responsive marketing site at the root URL. The app itself (Customer/Driver phone-width, Vendor/Admin dashboards) is untouched.

## Routing

- `/` — new marketing homepage (fully responsive, not phone-locked).
- `/get-started` — the current role-selector screen (Customer / Vendor / Driver + Sign up / Log in), moved out of `/`. Reached from the marketing site's Sign up / Log in buttons.
- Placeholder content pages so every footer link works: `/about`, `/cities`, `/help`, `/partner` (add your restaurant), `/deliver` (sign up to deliver), `/business`, `/privacy`, `/terms`. Each is a short branded page with a heading, a paragraph, and a link back home — real copy later.

## Page sections

1. **Sticky header** — Dobra logo left; on desktop: "Sign up to deliver" text link, outlined "Log in", solid red "Sign up". On mobile: hamburger opening a sheet with the same items.
2. **Hero** — brand yellow background with an appetizing food photo on the right (generated image), dark overlay where text sits over imagery. Big headline "Order delivery near you", address input + solid red "Find Food" button, small "Or Sign In" link underneath. Submitting the address carries it to sign-up (`/get-started?address=…`), so the customer flow can prefill it later.
3. **Cities we serve** — two map cards side by side on desktop, stacked on mobile: one centred on Poland, one on Cameroon, with pins on each city, using the existing Google Maps component. Under each map, the city list: Warsaw, Kraków, Gdańsk / Yaoundé, Douala (placeholders). Where the map key is unavailable the existing friendly fallback shows and the city lists still read fine.
4. **Footer** — logo, two link columns (Get Help, Add your restaurant, Sign up to deliver, Create a business account / Restaurants near me, View all cities, About Dobra), App Store + Google Play badges (placeholder links), the existing language switcher, social icons, and a small print row with copyright plus Privacy and Terms.

## Technical notes

- New `src/components/marketing/` components (`SiteHeader`, `Hero`, `CityMaps`, `SiteFooter`) plus a `marketing` i18n namespace added to all four locale files (en/pl/uk/fr), so the site is translated like the rest of the app.
- `MapView` gains support for plain labelled city pins (existing `MapPoint` kinds already cover this; a `center`/`zoom` override is used so each map frames its country).
- Marketing routes render outside `PhoneFrame` entirely; the root layout is unchanged.
- Each route gets its own head metadata (title, description, og tags).
- One generated food hero image stored in `src/assets`.
- Verified in-browser at 390px and 1440px with screenshots before reporting done.
