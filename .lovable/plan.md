# Driver verification flow: fixes and upgrades

## 1. Upload bug (root cause found)

The database has **two** rules on the document type column. An older one still
only allows the original five types, so uploading a vehicle photo or insulated
bag photo is rejected even though the newer rule allows them. Fix: remove the
stale rule (a migration), keeping the up-to-date one.

## 2. Documents required depend on vehicle type

New helper `requiredDocsFor(vehicleType)` in `src/lib/driver-docs.ts`:

| Vehicle | Required documents |
|---|---|
| Bicycle, E-bike, Scooter | Selfie, ID, Vehicle photo, Insulated bag |
| Motorbike, Car | All of the above + Driving licence, Insurance, Vehicle registration |
| On foot | Selfie, ID, Insulated bag |

The Documents screen renders only the applicable list and switches instantly
when the vehicle type dropdown changes (no save needed to see the change).
"Submit for review" unlocks based on that list. The same helper drives the
driver's own verification card on Account and the admin review screen, so the
progress count matches what each driver was actually asked for.

## 3. Camera capture for selfie and ID

`ImageUpload` gains a `capture` option. Selfie uses the front camera, ID the
back camera, both opening the camera directly (`capture` attribute on the file
input). Vehicle and bag photos keep the normal picker.

## 4. Round placeholders

All document upload placeholders become circular with the existing animated
gradient ring, not just the selfie.

## 5. Go Online gating instead of a wall

Driver Home always renders. The pending/rejected full-screen wall is removed
from Home (the screens stay for other uses). Tapping Go Online when not
approved opens a dialog:

- nothing submitted yet: "Please verify your account to go online"
- started but incomplete or awaiting review: "Please finish verifying your account to go online"
- rejected: explains it wasn't approved and links to Documents

Each dialog has a button to the Documents screen. Approved drivers toggle as
before. Map, stats and lists load for everyone.

## 6. Reference examples

Generate four small images: good/avoid insulated bag, good/avoid selfie. They
appear side by side, labelled, above those two upload steps.

## Technical notes

- Migration: `ALTER TABLE public.driver_documents DROP CONSTRAINT driver_documents_type_check;`
- Files: `src/lib/driver-docs.ts`, `src/components/dobra/ImageUpload.tsx`,
  `src/routes/_authenticated/driver.documents.tsx`, `driver.index.tsx`,
  `profile.tsx`, `admin.reviews.tsx`, new `DocExamples` component, new
  `src/assets/doc-*.jpg`, and `driver.*` i18n keys in en/pl/uk/fr.
- Tests: Playwright — real upload of a vehicle photo as a driver, and switching
  Bicycle vs Car to confirm the required list changes.
