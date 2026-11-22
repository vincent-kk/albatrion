---
"@slats/agents-assets-sync": patch
---

Files that are never shipped as assets (`.DS_Store`, `*.log` and anything under `.omc/`) are no longer treated as orphans inside an installed skill directory. Before, opening an installed skill folder in the macOS Finder made the next run stop with exit code 2, and `--force` deleted the Finder's `.DS_Store`.
