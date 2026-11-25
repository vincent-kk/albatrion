---
"@canard/schema-form": patch
---

The packaged collection-control examples now guard empty arrays with optional chaining. With omitEmpty enabled an empty array emits undefined; the examples also explain that a degraded form requires a form-level reset or load after correcting a throwing expression.

A throwing controls expression reached at mount, by a `context` change, or by a reset the Form runs on commit (after a `validatorFactory` change, or after props change in the same update as `reset()`) is now reported through `onError` and `reportError` and leaves the form mounted and degraded; 0.16 replaced the form with its error fallback at mount and on a `context` change.
