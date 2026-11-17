---
"@slats/agents-assets-sync": patch
---

`--force` now confirms and lists orphan deletions the same way it does overwrites. On a TTY without `--yes`, a run whose only change is deleting files the package no longer ships opens the confirmation dialog instead of deleting them silently, and the dialog lists those paths. A non-interactive `--force` run now writes the deleted paths to stderr alongside the overwritten ones.

In `--json` output, a unit's `requiresForce` is now `true` whenever applying it deletes orphans, also when `--force` was passed; before, it was `false` for a forced unit whose only changes were deletions. Exit codes are unchanged.
