---
"@winglet/common-utils": patch
---

Reject non-ASCII characters in `fromBase` instead of accepting Unicode case mappings as digits. ASCII letters remain case-insensitive for bases up to 36.
