---
"@winglet/data-loader": patch
---

Correct the retry examples to propagate batch-wide failures and explain that per-key errors stay cached until `clear(key)` or `clearAll()`. The examples now distinguish automatic retry after batch failure from explicit invalidation of failed keys.
