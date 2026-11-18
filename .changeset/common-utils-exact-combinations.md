---
"@winglet/common-utils": patch
---

`combination` returns the exact result whenever the binomial coefficient is a safe integer, even when an intermediate product exceeds that range. Small inputs continue to use number arithmetic.
