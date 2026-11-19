---
"@winglet/common-utils": patch
---

Clarify that cyclic input to `equals` and `cloneLite` can fail to terminate. Use `stableEquals` and `clone` for values that may contain cycles.
