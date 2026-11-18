---
"@canard/schema-form": patch
---

Reused and recursive `$ref` templates now reactivate fields at every location when an `active` condition changes. Context-dependent `controls.fields`, `oneOf`, and `anyOf` gates also reactivate missing fields in inline schemas. The same schema now follows the same controls when referenced or written inline.
