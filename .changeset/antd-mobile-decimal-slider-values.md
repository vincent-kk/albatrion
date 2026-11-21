---
"@canard/schema-form-antd-mobile-plugin": patch
---

Keep slider pointer and keyboard values within the field's inclusive and exclusive bounds, decimal `multipleOf`, and integer constraints. Small steps written with exponents, Page keys, Shift+Arrow, and steps from off-grid or out-of-bounds stored values now use the same decimal grid. `Home` and `End` select the first and last permitted values; an empty grid stores nothing. Existing inclusive endpoints without `multipleOf` and the default commit timing are preserved.
