---
"@canard/schema-form": patch
---

Inside `node.batch()`, which is new in this release, a `controls.injectTo` or `controls.derived` write of an object replaces its target the same way it does outside a batch, also when the batch writes other fields: a field the written object omits is cleared, and a value it names for an inactive field is kept for that field.
