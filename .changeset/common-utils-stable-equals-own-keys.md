---
"@winglet/common-utils": patch
---

`stableEquals` no longer accepts a key that the right operand only inherits as a match for an own key of the left operand. For example, `stableEquals({ constructor: Object, x: 1 }, { x: 1, y: 2 })` now returns `false`.
