# Driver availability colors

- Keep the compact layout and existing four-language labels.
- Show green with a live dot online; show Dobra red without a dot offline, with a 200 ms color transition and readable contrast even while saving.
- Update the shared availability state immediately on confirmation and restore all indicators if saving fails.
- Check simulated phones at 360×740, 390×844 and 412×915, including delayed saves and rollback. Real-phone saving and physical feedback remain outside simulated verification.

## Technical details
Use semantic availability colors and the existing optimistic driver-query cache. Avoid the shared red-button gradient and disabled opacity overriding availability colors. Inspect any other availability display for consistency.