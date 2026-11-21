---
"@canard/schema-form-ajv7-plugin": patch
---

A `false` schema reached through an in-place keyword, such as `then: false`, `allOf: [false]`, `dependencies: { a: false }`, `dependentSchemas: { a: false }` or a `$ref` to a `false` definition, now stays on the rejected value: its issue keeps the value's `dataPath` and has no `rejectedKey`. Before, the issue moved to the parent object while the matching `if` issue stayed on the field. This also holds for a field whose name is spelled like a keyword, such as `items` or `properties`. A `propertyNames: false` issue now keeps the object's `dataPath` instead of moving to its parent, and still names the offending key as `rejectedKey`. A `false` schema under `properties`, `patternProperties` or `items` still rejects the child's key.
