---
"@winglet/json": patch
---

Preserve empty reference tokens in `convertJSONPointerToPath`, including trailing empty tokens. For example, `//x` becomes `..x` and `/a/` becomes `.a.`. Existing root, numeric, append, dot, and bracket spellings remain unchanged and can still be lossy; retain the original JSON Pointer when an unambiguous address is required.
