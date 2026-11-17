---
"@canard/schema-form-ajv7-plugin": patch
---

A single-key `not: { required: [key] }` under a property whose name needs URI encoding, such as a name with Korean letters, a space or `%`, now reports its `rejectedKey`. The issue is routed the same way as one under a plain property name.
