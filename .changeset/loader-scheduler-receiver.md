---
"@winglet/data-loader": patch
---

Call custom `batchScheduler` functions without using the loader as their receiver. Bare browser schedulers such as `queueMicrotask` work like arrow-function wrappers instead of throwing an illegal-invocation error.
