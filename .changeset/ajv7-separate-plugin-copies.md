---
"@canard/schema-form-ajv7-plugin": patch
---

Allow separately evaluated copies of the plugin to share an AJV instance without registration-key collisions. Compatible copies share instance-scoped ownership metadata, preserving isolation between live schemas with the same `$id`.
