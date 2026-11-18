---
"@canard/schema-form-ajv8-plugin": patch
---

Compile guards for property names containing literal percent signs correctly. RFC 6901 pointer names such as `100%` and `a%20b` select their own condition rather than failing or evaluating a decoded sibling name.
