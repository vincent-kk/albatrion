---
"@canard/schema-form": patch
---

Evaluate `controls.active` declared inside a `$ref` target at each field's actual location. Relative and absolute dependencies now activate referenced fields consistently with inline schemas, preventing their values from being omitted.
