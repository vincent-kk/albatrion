---
"@winglet/common-utils": patch
---

`equals` throws a `RangeError` when a comparison pair repeats on the active path. An unbounded `cloneLite` throws a `RangeError` on a cycle. Shared descendants on separate paths remain supported. Use `stableEquals` to compare cyclic values and `clone` to copy them.
