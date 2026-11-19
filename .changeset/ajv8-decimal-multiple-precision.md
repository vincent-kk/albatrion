---
"@canard/schema-form-ajv8-plugin": patch
---

Accept exact decimal multiples such as `19.99` for `multipleOf: 0.01` in plugin-created validators. The default is `multipleOfPrecision: 9`, with a quotient tolerance of `1e-9` and guaranteed exact multiples for finite values and finite normal divisors when `Math.abs(value / multipleOf) <= 1e6`; extremely close nonmultiples can also pass. Application-supplied AJV options remain unchanged.
