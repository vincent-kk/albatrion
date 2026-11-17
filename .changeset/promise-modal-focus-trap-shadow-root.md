---
"@lerx/promise-modal": patch
---

Let Tab reach controls inside open shadow roots, such as web component design systems, in a focus-trapped modal. The trap places those controls at their host's position, wraps from the last one, and no longer sends Tab out of the modal when focus is inside a shadow root. Radios inside a shadow root form their own group even when a light-DOM radio shares the name, and host children that no slot renders are skipped. Closed shadow roots stay unreachable, and slotted children count at their host's position rather than at their slot.
