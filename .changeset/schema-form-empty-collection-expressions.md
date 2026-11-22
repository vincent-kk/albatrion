---
"@canard/schema-form": patch
---

The packaged collection-control examples now guard empty arrays with optional chaining. With omitEmpty enabled an empty array emits undefined; the examples also explain that a degraded form requires a form-level reset or load after correcting a throwing expression.
