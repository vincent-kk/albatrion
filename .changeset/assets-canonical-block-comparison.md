---
"@slats/agents-assets-sync": patch
---

Preserve source blank lines when deciding whether an installed rule has changed. Only the final newline needed to delimit a rule without one is treated as padding; additional blank lines are local edits and require --force to overwrite.
