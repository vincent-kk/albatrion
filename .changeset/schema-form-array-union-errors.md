---
"@canard/schema-form": patch
---

Fix inactive `oneOf` and `anyOf` branch errors appearing on array item fields. Reuse schema-path ownership analysis and avoid repeated subtree scans and unrelated-field traversal while routing branch errors. Error display now follows each item's selected branch, including after items move, while preserving the complete validation result.
