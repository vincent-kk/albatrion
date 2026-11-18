---
"@winglet/json": patch
---

Correct the reserved-member documentation: `setValue` creates missing own-data containers, while `applyPatch` requires existing intermediate containers. Also clarify that `getJSONPointer` returns an empty string for the root.
