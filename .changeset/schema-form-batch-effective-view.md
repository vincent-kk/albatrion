---
"@canard/schema-form": patch
---

Inside `node.batch()`, an updater passed to `setValue` and the same-tuple check of a virtual group now read what the earlier calls of the batch produced, as they would outside a batch. The field's own value is the base, so an object field emptied to `{}` is read as `{}` instead of `undefined`, and each earlier write is read after the field's type conversion, so after `setValue('2')` on a number field an updater receives `2` instead of the string `'2'`. Before, an updater could receive `undefined` or an unconverted value, and writing a group's current tuple back cleared the retained values of that field's inactive children.
