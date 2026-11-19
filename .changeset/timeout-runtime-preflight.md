---
"@winglet/common-utils": patch
---

Check `AbortController` availability before `withTimeout` starts the wrapped function. Hosts without that API now receive a synchronous `TypeError` before the operation runs; provide a compatible polyfill to use this timeout helper there.
