---
"@canard/schema-form-antd6-plugin": patch
---

A nullable array enum field whose value is `null` now renders an empty multiple select. Before, with `@canard/schema-form` reporting `null` for such a field, the select showed a `null` tag.
