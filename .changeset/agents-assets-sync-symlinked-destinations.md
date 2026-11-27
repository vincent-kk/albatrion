---
"@slats/agents-assets-sync": patch
---

At `--scope=project`, `inject-agents-settings` now refuses a destination that a symbolic link resolves outside the project, and names the link. This covers the agent directories (`.claude/skills`, `.claude/rules`, `.claude/commands`, `.agents/skills`), the `AGENTS.md` file rules are merged into, each installed skill directory, and every directory or file below them that the run writes. Before, a cloned repository that committed a link such as `.claude/skills/<name> -> /some/other/place`, `.claude/skills/<name>/knowledge -> /some/other/place` or `.claude/skills/<name>/SKILL.md -> /some/other/file` made the run copy or overwrite files there, and `--force` deleted files under a linked skill directory. A link that stays inside the project is still followed. Nothing is written or deleted for a refused package. `--scope=user` is unchanged and still follows such links, because linking `~/.claude` to a dotfiles repository is a deliberate setup.
