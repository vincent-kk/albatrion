---
"@winglet/data-loader": patch
---

`DataLoader.load()` now uses the cache for falsy cache keys such as `0` and `''`. Before, `load(0)` with the default `cacheKeyFn` ignored a value set by `prime(0, value)`, called the batch loader again, and did not deduplicate repeated loads of the same key. If your batch loader relied on being called for every load of such a key, call `clear(key)` before loading it.
