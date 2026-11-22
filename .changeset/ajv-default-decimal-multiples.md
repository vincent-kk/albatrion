---
"@canard/schema-form-ajv6-plugin": patch
"@canard/schema-form-ajv7-plugin": patch
"@canard/schema-form-ajv8-plugin": patch
---

Accept decimal multiples such as `19.99` for `multipleOf: 0.01` in the default validator. The default validator still rejects a zero divisor when compiling a schema. A supplied AJV instance keeps its chosen precision and schema-validation options.

AJV 6.12.6 can accept a number in a synchronous guard with an invalid zero divisor. Whole-schema compilation still rejects that schema.
