---
"@canard/schema-form": patch
---

A `controls.injectTo` or `controls.derived` write of an object inside `node.batch()` now replaces its target the same way it does outside a batch: a field the written object omits is cleared, and a value it names for an inactive field is kept for that field. Before, when the batch also wrote other fields, the object was merged into the current value, so omitted fields kept their old values and values for inactive fields were dropped.
