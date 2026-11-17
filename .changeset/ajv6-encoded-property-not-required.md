---
"@canard/schema-form-ajv6-plugin": patch
---

A `not: { required: [name] }` failure under a property whose name needs URI encoding, such as a name with non-ASCII letters, a space or `%`, now reports `name` as its `rejectedKey`. This also holds inside a subschema with its own `$id` that is referenced by exactly that `$id` or by a fragment of it. Before, the key was missing, so the issue was routed differently depending on how the property was spelled.

The key now also comes from the schema the validator compiled: mutating the schema object after `compile` no longer changes which `rejectedKey` an issue reports.
