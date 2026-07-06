---
"@winglet/json-schema": minor
---

`cloneResolvedSchema` now defaults to `true`: each resolved `$ref` is deep-cloned before being inlined during traversal, so repeated occurrences of the same `$ref` are no longer aliased in the processed output.

Before this option existed, resolution behaved as if `cloneResolvedSchema` were `false` — the resolved schema was assigned in place with no clone, so multiple occurrences of the same `$ref` shared one aliased object. If you depend on that previous aliased behavior (e.g. relying on `===` identity between repeated `$ref` occurrences), pass `cloneResolvedSchema: false` to restore it.
