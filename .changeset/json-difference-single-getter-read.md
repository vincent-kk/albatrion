---
"@winglet/json": patch
---

`difference` reads a shared target getter once, even when another member is added or removed. The same rule applies to deeply nested values. A new target getter still runs before checking whether that key exists on the source.
