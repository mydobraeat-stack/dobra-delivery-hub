# Driver Home and delivery history

- Put a compact yellow/red scooter-and-scrolling-road strip immediately below the Online/Offline controls, outside the map. Translate “Searching for orders…” into English, Polish, Ukrainian and French.
- Show it only while online, with loaded order data, no active delivery and no visible offer. Restore it after declining or expiry; stop motion for reduced-motion preferences.
- Keep Home focused on the map, earnings, toggle, search strip and stats. Move delivery lists to Deliveries, preserving access to active delivery details there.
- Complete Deliveries with newest-first past records, restaurant or package pickup, country-local date/time, status, existing locked payout, and loading/error/empty states.
- Test visibility and sorting rules, then check mobile/desktop and offer transitions in the browser. Report separately any real-driver checks blocked by account access; do not create live orders merely for screenshots.

## Technical details

Share visible-offer state from the existing offer popup rather than treating declined orders as pending offers. Reuse existing driver approval checks, order timestamps and payout helpers; no database or payment-rule changes.