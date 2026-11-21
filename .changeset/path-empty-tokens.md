---
"@winglet/json": patch
---

Preserve consecutive and trailing empty property tokens in `convertJSONPathToPointer`, so canonical data paths round-trip with `convertJSONPointerToPath`. Existing lossy spellings for roots, numeric and bracket keys remain unchanged.
