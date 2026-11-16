---
"@canard/schema-form": patch
---

Fix inactive `oneOf` and `anyOf` branch errors appearing on array item fields. Error display now follows each item's selected branch, including after items move, while preserving the complete validation result.
