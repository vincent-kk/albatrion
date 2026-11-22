---
"@winglet/data-loader": patch
---

`DataLoader` now settles `load()` and `loadMany()` when `batchScheduler` runs its task synchronously, such as the documented `batchScheduler: (fn) => fn()`. Before, such a scheduler never called the batch loader and every returned promise stayed pending. With a synchronous scheduler each `load()` now dispatches its own one-key batch before it returns, and a repeated key still resolves from the cache. Asynchronous schedulers, including the default, batch exactly as before.
