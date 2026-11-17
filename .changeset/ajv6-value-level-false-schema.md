---
"@canard/schema-form-ajv6-plugin": patch
---

A `false` schema reached through a keyword that applies to the value itself, such as `then: false`, `allOf: [false]`, a `$ref` to a `false` definition or `propertyNames: false`, now stays on the rejected value. Its issue keeps the value's `dataPath` and, except under `propertyNames`, has no `rejectedKey`. This also holds on a field whose name is spelled like a keyword, such as `items` or `properties`, including inside a subschema with its own `$id` that is referenced by exactly that `$id` or by a fragment of it. Before, the issue moved to the parent object while the matching `if` issue stayed on the field, and a nested `propertyNames: false` issue moved to the grandparent. A `false` schema under `properties`, `patternProperties` or `items` still rejects the child's key.

Not supported: a reference spelled differently from the authored `$id`, for example a relative `$id` reached through an absolute reference, or a reference that AJV resolves against a base. Such a path is classified by its last two segments only, so a field named `items` or `properties` there can still move its value-level `false` issue to the parent.
