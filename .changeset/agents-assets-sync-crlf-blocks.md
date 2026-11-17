---
"@slats/agents-assets-sync": patch
---

Rule blocks in an `AGENTS.md` whose line endings were converted to CRLF, as a `core.autocrlf=true` checkout does, are now recognized. Before, the next `--agent=codex` or `--agent=agents` run appended a second copy of every block, and the old copy was never updated or removed. `parseBlocks` now returns those blocks, and a block whose only change is its line endings is reported as up to date.
