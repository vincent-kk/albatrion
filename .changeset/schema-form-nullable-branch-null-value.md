---
"@canard/schema-form": patch
---

The nullable branch guide now states that a nullable array or object field whose value is `null` reads `null` from `node.value` and from the FieldInput `value` prop, the same as with `options.terminal: true` and as in 0.16.1. A custom FieldInput for such a field handles `null` before calling `value.map(…)` or `Object.keys(value)`.
