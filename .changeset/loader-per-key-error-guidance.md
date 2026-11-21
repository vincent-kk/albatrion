---
"@winglet/data-loader": patch
---

Clarify that per-key `Error` results remain cached and that transient per-key failures require `clear(key)` before retrying. Batch-wide failures continue to clear their cached keys automatically.
