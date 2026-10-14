---
'@winglet/json': minor
---

Add a type-only `getValue` overload that accepts an `unknown` document and returns
`unknown`, matching the input validation the function already performs at runtime.
The implementation and the existing object and array signatures are unchanged.
