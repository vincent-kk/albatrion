---
"@canard/schema-form-ajv6-plugin": patch
---

A `not: { required: [name] }` failure under a property whose name needs URI encoding, such as a name with non-ASCII letters, a space or `%`, now reports `name` as its `rejectedKey`. Before, the key was missing, so the issue was routed differently depending on how the property was spelled.
