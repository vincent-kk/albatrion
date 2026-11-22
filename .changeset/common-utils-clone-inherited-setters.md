---
"@winglet/common-utils": patch
---

`clone` now copies an own property as an own data property even when the prototype defines a setter, getter or read-only property of the same name, instead of calling the inherited setter or failing. `clone` reads each prototype chain once and caches what it learns, so a setter added to a prototype after an instance of it was first cloned is still called by later clones. Cloning plain objects, arrays and class instances is faster than before.
