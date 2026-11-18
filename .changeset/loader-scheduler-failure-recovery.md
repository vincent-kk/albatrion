---
"@winglet/data-loader": patch
---

Recover after a custom `batchScheduler` throws synchronously. Failed batches release their cached promises and pending requests, later loads can retry, and callbacks queued by the failed scheduler do not dispatch the cancelled batch.
