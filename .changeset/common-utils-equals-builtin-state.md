---
"@winglet/common-utils": patch
---

`equals` and `stableEquals` now compare the state of `ArrayBuffer`, `DataView` and boxed `Number`, `String` and `Boolean` values, so two of them with different bytes or primitive values are no longer reported equal. Errors whose `name` or `message` differ are also unequal, while errors that match on both are still compared by their own properties. Plain objects and arrays are compared exactly as before. The packaged agent guide now states these comparison rules for both functions.
