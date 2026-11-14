---
'@winglet/common-utils': minor
---

Add a type-only overload to `isArray` so that a `string | readonly T[]` value narrows
to `readonly T[]` in the true branch and to `string` in the false branch. The runtime
function is still `Array.isArray`, and every existing signature is kept.
