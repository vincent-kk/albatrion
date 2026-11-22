---
"@canard/schema-form": patch
---

`controls.derived` and `controls.unsetValue` now re-evaluate when a field they read leaves the form, for example through `controls.active` or a `oneOf` switch. Before, the rule kept its previous result, so `getValue()` and submit returned a stale value, the result differed from mounting with the same input, and the missed update later overwrote a value the user had typed into the target field.
