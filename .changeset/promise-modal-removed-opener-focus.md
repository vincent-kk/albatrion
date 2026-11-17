---
"@lerx/promise-modal": patch
---

Move focus into the remaining dimmed modal when a nested modal closes after the element that opened it was removed. Focus used to stay on the closed modal or the page body while the page was still inert. With no dimmed modal remaining, a removed opener is still ignored.
