---
"@winglet/common-utils": patch
---

Preserve the prototypes and inherited methods of `Array`, `Date`, `RegExp`, `Map`, and `Set` subclasses in `clone`, including values from another realm. Cloning allocates native slots without running the subclass constructor. Existing limits on additional own properties remain unchanged.
