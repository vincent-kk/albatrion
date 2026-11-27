---
"@winglet/data-loader": patch
---

Remove a request from its batch when a custom cache's `set` throws, including writes into an already open batch. The failed request no longer reaches the batch loader or produces an orphaned rejection, and a partial cache write is removed before retrying.
