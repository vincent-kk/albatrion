---
"@winglet/common-utils": patch
---

Preserve the ownership of shared references in depth-limited clones of deeply nested objects and arrays. Deep traversal now visits properties in the same order as shallow traversal.

Preserve all native Map and Set entries when cloning subclasses that expose a filtered iterator.
