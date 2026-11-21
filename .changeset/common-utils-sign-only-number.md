---
"@winglet/common-utils": patch
---

`fromBase` rejects a lone minus sign instead of returning negative zero. A sign must be followed by digits.
