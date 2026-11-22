---
"@winglet/data-loader": patch
---

Keep `loadMany` failures isolated per key when a cache or key-conversion callback throws synchronously. A call that previously threw now resolves with the error at that key's position while the other keys finish; consumers that caught that throw should inspect the returned entries. An invalid keys argument still throws synchronously.
