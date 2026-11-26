---
"@canard/schema-form": patch
---

Report `RECURSIVE_SHAPE_DIVERGED` when expanding a value would create a node more than 256 levels below the root, rather than overflowing the JavaScript call stack. Keep recursive values within this depth; a field is one level below the object or array that holds it.
