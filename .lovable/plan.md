# Dobra app icons for all devices

Use the uploaded "D" icon set so the Dobra mark shows up in browser tabs, on Android home screens, on iPhone home screens, and in push notifications.

## What will change

1. Add the uploaded icons to the app's public files:
   - 16x16, 32x32, 48x48 tab icons
   - 180x180 Apple touch icon (iPhone/iPad home screen)
   - 192x192 and 512x512 Android/PWA icons
   - a new `favicon.ico` generated from the 48x48 image (replacing the current Lovable one)
2. Reference them in the site head (`src/routes/__root.tsx`): replace the single `icon` link with the full set plus `apple-touch-icon` and a theme colour matching Dobra yellow.
3. Add a web app manifest (`public/site.webmanifest`) naming the app "Dobra", pointing at the 192/512 icons, standalone display, yellow theme — this is what Android and installed-to-home-screen iOS use, and it also improves the Web Push install flow already in the app.
4. Update `public/sw.js` push notification `icon`/`badge` to the 192x192 PNG so phone alerts show the Dobra mark instead of the old favicon.

## Technical notes

- Icons are copied as real files under `public/` (not CDN asset pointers) since browsers request them at fixed paths.
- `favicon.ico` is regenerated with ImageMagick from the 48x48 PNG; the old one is removed.
- Manifest is linked from `head().links` in the root route.
