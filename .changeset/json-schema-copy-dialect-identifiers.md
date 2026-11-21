---
"@winglet/json-schema": patch
---

`createReferenceResolver` and `resolveReference` no longer drop keywords from an inlined copy when they are not identifiers in that copy's dialect. Only `$schema`, `id` (draft-04), `$id` (draft-06 and later), `$anchor` and `$vocabulary` (2019-09 and 2020-12), `$recursiveAnchor` (2019-09) and `$dynamicAnchor` (2020-12) are removed. Before, every one of these names was removed in every dialect, so an annotation such as `id: "user"` in a 2020-12 schema or `$anchor` in a draft-07 schema disappeared from the resolved output.
