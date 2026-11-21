---
"@winglet/common-utils": patch
---

Preserve the enumerability of supported Error properties when using `clone`, including Errors from another realm. Enumerable causes remain visible to JSON serialization, and hidden metadata stays hidden.
