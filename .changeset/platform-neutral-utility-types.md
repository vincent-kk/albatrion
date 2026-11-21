---
"@winglet/common-utils": patch
---

Allow utility declarations to type-check without the DOM library or newer Node global types. `isBlob`, `isFile`, and cancellation options use the consumer's available platform types without requiring missing global declarations.
