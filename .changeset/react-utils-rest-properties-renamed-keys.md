---
"@winglet/react-utils": patch
---

`useRestProperties` now returns the new object when a key is renamed and both the old and the new value are `undefined`. Before, `{ a: 1, c: undefined }` followed by `{ a: 1, b: undefined }` returned the previous object, so spreading the result forwarded the stale prop name `c` instead of `b`.
