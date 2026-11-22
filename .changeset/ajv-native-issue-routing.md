---
"@canard/schema-form-ajv6-plugin": patch
"@canard/schema-form-ajv7-plugin": patch
"@canard/schema-form-ajv8-plugin": patch
---

Preserve AJV schema locations and rejected keys in form issues. Encoded names in single-key `not.required` constraints identify the authored property, and value-level false schemas keep the value's data path. AJV 8 also reports authored paths for named roots and includes the offending key on inner `propertyNames` issues.
