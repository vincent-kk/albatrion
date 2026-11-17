---
"@winglet/common-utils": patch
---

`clone` now copies boxed `Number`, `String` and `Boolean` values, including boxes created in another realm such as an iframe or `node:vm` context, with their primitive value and prototype, so calling `valueOf()` on the copy works. An `AggregateError` copy keeps its `message` and a deep copy of its `errors`.
