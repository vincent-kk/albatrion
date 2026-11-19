---
"@canard/schema-form-mui-plugin": patch
---

Align slider endpoints to multiples of `multipleOf` within `minimum` and `maximum`, so pointer and keyboard selections use the same valid grid even when the bounds are not multiples.

Integer sliders use the integer intersection of the multiple grid. Number sliders without `multipleOf` keep fractional bounds, and a range with no valid value is disabled.
