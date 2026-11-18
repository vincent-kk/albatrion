---
"@winglet/common-utils": patch
---

Do not start the function passed to `withTimeout` when its signal is already aborted. The returned promise rejects with `AbortError` without starting side effects.
