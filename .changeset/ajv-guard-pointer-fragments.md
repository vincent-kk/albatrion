---
"@canard/schema-form-ajv6-plugin": patch
"@canard/schema-form-ajv7-plugin": patch
"@canard/schema-form-ajv8-plugin": patch
---

Select the authored condition with `compileGuard` when a JSON Pointer contains a literal percent in a property name. For example, `/properties/a%20b/if` selects the property named `a%20b`.
