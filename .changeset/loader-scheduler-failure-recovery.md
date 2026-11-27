---
"@winglet/data-loader": patch
---

Recover after a custom `batchScheduler` throws synchronously. Failed batches release their cached promises and pending requests, later loads can retry, and callbacks queued by the failed scheduler do not dispatch the cancelled batch.

A late result or rejection from a batch whose scheduler threw no longer invalidates a newer request for the same key or triggers a duplicate fetch. The keys already handed to the batch function remain unchanged.
