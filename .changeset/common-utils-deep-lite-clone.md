---
"@winglet/common-utils": patch
---

`cloneLite` copies deeply nested non-cyclic objects and arrays without exhausting the call stack. Depth limits, sparse array holes, null prototypes, own reserved keys and unsupported leaf references retain their existing behavior. Ordinary inputs keep the recursive fast path, with explicit work frames used only after 256 levels.
