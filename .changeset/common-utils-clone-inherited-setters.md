---
"@winglet/common-utils": patch
---

`clone` now copies an own property as an own data property even when the prototype defines a setter, getter or read-only property of the same name, instead of calling the inherited setter or failing. Cloning plain objects and arrays is faster than before.
