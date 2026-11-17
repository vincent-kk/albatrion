---
"@canard/schema-form-ajv6-plugin": patch
---

Route errors for hyphenated, quoted, escaped and empty property names to the correct field. AJV6 bracket paths are decoded and escaped as JSON Pointer, while existing pointer paths keep their empty-name segments.

Keep common dotted and unescaped property paths fast while retaining correct decoding of quoted names.
