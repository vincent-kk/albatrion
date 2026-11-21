---
"@canard/schema-form-ajv8-plugin": patch
---

Resolve a pointer guard's external references from the same base as the containing root. A root without `$id` can use a relatively registered application schema in `compileGuard`, before or after whole-schema compilation, without exposing private registration keys or changing the application instance.
