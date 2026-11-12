---
"@lerx/promise-modal": minor
---

Make `useDestroyAfter` wait for a modal result to settle before scheduling destruction. Navigating away only hides a pending modal, so its frame and Promise survive until route return, cancellation, or confirmation. The hook performs cleanup after closing; it does not close the modal.
