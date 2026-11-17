---
"@canard/schema-form-ajv6-plugin": patch
---

A `false` schema reached through a keyword that applies to the value itself, such as `then: false`, `allOf: [false]`, a `$ref` to a `false` definition or `propertyNames: false`, now stays on the rejected value. Its issue keeps the value's `dataPath` and, except under `propertyNames`, has no `rejectedKey`. This also holds on a field whose name is spelled like a keyword, such as `items` or `properties`. Before, the issue moved to the parent object while the matching `if` issue stayed on the field, and a nested `propertyNames: false` issue moved to the grandparent. A `false` schema under `properties`, `patternProperties` or `items` still rejects the child's key.
