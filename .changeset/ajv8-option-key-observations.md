---
"@canard/schema-form-ajv8-plugin": patch
---

New validator and guard compilations observe current AJV option names and values even when an undefined option is replaced by another option and the number of options stays the same. Previously returned functions retain their compiled snapshots.
