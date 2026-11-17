---
"@winglet/common-utils": patch
---

`equals` and `stableEquals` return different results for some built-in values. Two `ArrayBuffer`s, `DataView`s or boxed `Number`, `String` or `Boolean` values used to compare equal whatever their contents; they are now unequal when their bytes or primitive values differ, and when those match their own properties are still compared, so `new Number(1)` with `extra: 1` and with `extra: 2` stay unequal. `equals` also reports errors with a different `name` or `message` as unequal. If your code relied on these values comparing equal, compare them explicitly before calling `equals`. Plain objects and arrays are compared exactly as before, and the packaged agent guide now states the comparison rules of both functions.
