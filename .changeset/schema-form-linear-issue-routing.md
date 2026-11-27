---
"@canard/schema-form": patch
---

Validation issues collected on one field now take linear collection work instead of repeatedly copying the entire issue list. Large terminal arrays retain every issue in order without changing earlier error snapshots.
