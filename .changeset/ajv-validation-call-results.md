---
"@canard/schema-form-ajv6-plugin": patch
"@canard/schema-form-ajv7-plugin": patch
"@canard/schema-form-ajv8-plugin": patch
---

Keep validation issues tied to the call that produced them and pass through execution exceptions. Successful asynchronous validation resolves to `null` for falsy data. The AJV 6 and 7 keyed factories use the selected validator's schema, and AJV 6 keeps the required-property path already reported by AJV.
