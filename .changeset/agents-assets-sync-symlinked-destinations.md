---
"@slats/agents-assets-sync": patch
---

At `--scope=project`, `inject-agents-settings` now refuses a destination that a symbolic link resolves outside the project, and names the link. This covers the agent directories (`.claude/skills`, `.claude/rules`, `.claude/commands`, `.agents/skills`), the `AGENTS.md` file rules are merged into, and each installed skill directory. Before, a cloned repository that committed a link such as `.claude/skills/<name> -> /some/other/place` made the run copy files there, and `--force` deleted files there. Nothing is written or deleted for a refused package. `--scope=user` is unchanged and still follows such links, because linking `~/.claude` to a dotfiles repository is a deliberate setup.
