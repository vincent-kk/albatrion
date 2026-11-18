---
"@lerx/promise-modal": patch
---

Keep lazy or suspending modal content isolated inside its own Suspense boundary so it cannot enter a Provider update loop or interrupt peer requests.
