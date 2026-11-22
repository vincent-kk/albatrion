---
"@canard/schema-form-ajv6-plugin": patch
---

Preserve hyphenated, quoted, escaped, and empty property names in validation paths. AJV 6 validators use JSON Pointers, including when compiled from an explicit key. A dynamic property such as `it's` appears as `/it's` both in the issue path and in `source.dataPath`. Required-property issues append the missing field name to the normalized issue path.
