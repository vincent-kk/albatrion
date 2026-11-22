---
"@winglet/json": patch
---

`applyPatch` preserves its input when a move to the document root is followed by another write. Object and array roots retain copy-on-write isolation.
