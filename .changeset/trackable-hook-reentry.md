---
"@winglet/common-utils": patch
---

Apply `getTrackableHandler` concurrency protection during lifecycle hooks as well as the original operation. A call re-entering from `beforeExecute` no longer bypasses the default `preventConcurrent` guard.
