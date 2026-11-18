---
"@canard/schema-form": patch
---

Report `IfWithoutElseFalse` and `NullBranchIgnoredForForm` consistently for inline and `$ref` branches of `oneOf` and `anyOf`. Referencing a branch no longer hides these advisory diagnostics.
