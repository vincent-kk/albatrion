---
"@winglet/json": patch
---

`compare`, `difference`, `mergePatch` and `applyPatch` test operations support deeply nested non-cyclic documents without exhausting the call stack. Strict test ordering, array removals, reserved own data and input isolation are preserved.
