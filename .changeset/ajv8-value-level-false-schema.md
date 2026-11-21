---
"@canard/schema-form-ajv8-plugin": patch
---

A `false` schema reached through an in-place keyword, such as `then: false`, `allOf: [false]` or a `$ref` to a `false` definition, now stays on the rejected value: its issue keeps the value's `dataPath` and has no `rejectedKey`. This also holds on a field whose name is spelled like a keyword, such as `items` or `properties`. Before, the issue moved to the parent object while the matching `if` issue stayed on the field. A `false` schema under `properties`, `patternProperties`, `items` or `prefixItems` still rejects the child's key.
