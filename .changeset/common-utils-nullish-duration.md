---
"@winglet/common-utils": patch
---

`convertMsFromDuration` accepts `null` and `undefined` and returns zero, matching the fallback for a missing duration string.
