---
"@winglet/common-utils": patch
---

Handle deeply nested ordinary-object and array graphs in `clone` and `stableEquals`, including cycles, without exhausting the call stack. Clone depth bounds, shared references, sparse-array distinctions and omitted comparison keys retain their existing behavior. User callbacks, proxies, constructors and chains made entirely of other built-ins remain outside this depth guarantee.
