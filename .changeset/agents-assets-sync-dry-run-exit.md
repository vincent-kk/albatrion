---
"@slats/agents-assets-sync": patch
---

`--dry-run` now exits with code 0 when the plan needs `--force`, as the documented exit codes state, in the plain text, `--json` and interactive output alike. It still writes nothing and reports that applying needs `--force`; the `--json` document carries `exitCode: 0` and each unit's `requiresForce`. Before, a dry run of an install with locally edited files exited with code 2, although the error for that case suggests inspecting it with `--dry-run`.
