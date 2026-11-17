---
"@winglet/common-utils": patch
---

`withTimeout` now rejects with `AbortError` at once when the `signal` passed in is already aborted, instead of waiting for `ms` and rejecting with `TimeoutError`. This matches `delay` and `timeout`.
