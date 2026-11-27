---
"@canard/schema-form": patch
---

Inside `node.batch()`, which is new in this release, an updater passed to `setValue` and the same-tuple check of a virtual group read what the earlier calls of the batch produced, as they would outside a batch. The field's own value is the base, so an object field emptied to `{}` is read as `{}`, and each earlier write is read after the field's type conversion, so after `setValue('2')` on a number field an updater receives `2`. Writing a group's current tuple back keeps the retained values of that field's inactive children.

Object updaters read declared own properties even when the properties are non-enumerable. Array updaters treat holes as empty slots without invoking inherited index getters.
