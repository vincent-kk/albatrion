---
"@canard/schema-form-ajv6-plugin": patch
"@canard/schema-form-ajv7-plugin": patch
"@canard/schema-form-ajv8-plugin": patch
---

Compile whole-schema validators with the asynchronous marker when their form root needs it, including named roots. Declare `$async: true` on separately registered application schemas that need asynchronous validation. Guards remain synchronous.
