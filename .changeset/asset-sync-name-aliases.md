---
"@slats/agents-assets-sync": patch
---

Preserve installed files when a managed name differs only by case or Unicode normalization and the destination filesystem resolves both names to the same file. Forced updates no longer delete those live files.
