---
"@canard/schema-form-ajv6-plugin": patch
---

Keep form issue paths as JSON Pointers independently of application compilation order and the `jsonPointers` or `errorDataPath` options on a supplied AJV instance. Application validators retain their own configured error paths, while the plugin uses an independent compiled-schema cache for normalized paths.
