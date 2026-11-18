---
"@canard/schema-form": patch
---

Report `RECURSIVE_SHAPE_DIVERGED` when expanding a value would exceed 256 object or array node levels, rather than overflowing the JavaScript call stack. Keep recursive values within this depth; each object and array counts as one level.
