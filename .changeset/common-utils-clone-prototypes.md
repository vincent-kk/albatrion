---
"@winglet/common-utils": patch
---

`cloneLite` keeps the prototype of a plain object it clones, so an object created with `Object.create(null)` stays prototype-less instead of gaining `Object.prototype`. `clone` copies an own `__proto__` key as an own data property instead of replacing the prototype of the clone.
