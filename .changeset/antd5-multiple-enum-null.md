---
"@canard/schema-form-antd5-plugin": patch
---

A multiple enum select whose array field holds `null` now shows no selection. Before, it showed a `null` tag, because a nullable array field can now report `null` instead of `[]`. Choosing an option still stores an array.
