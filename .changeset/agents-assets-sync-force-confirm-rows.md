---
"@slats/agents-assets-sync": patch
---

The interactive `--force` confirmation lists a path once per agent when the same file diverged under several agents, instead of triggering a React duplicate-key warning that could drop a row.
