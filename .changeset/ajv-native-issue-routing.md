---
"@canard/schema-form-ajv6-plugin": patch
"@canard/schema-form-ajv7-plugin": patch
"@canard/schema-form-ajv8-plugin": patch
---

Preserve AJV schema locations and rejected keys in form issues. Encoded names in single-key `not.required` constraints identify the authored property, and value-level false schemas keep the value's data path. The AJV 6 and 7 keyed factories derive issue details from the schema selected by the application key. AJV 6 uses JSON Pointer paths for keyed validation, preserving dynamic property names such as `/it's` and reporting the original pointer in `source.dataPath`. AJV 8 also reports authored paths for named roots and includes the offending key on inner `propertyNames` issues.
