---
"@slats/agents-assets-sync": major
---

Breaking change: `--force` can now remove unchanged retired Claude rules and entire skill namespaces with verified ownership. These files could previously require manual cleanup even after a successful installation.

Before upgrading, unattended installations could use:

```sh
inject-agents-settings --package @example/docs --agent claude --scope project --force --yes
```

After upgrading, preview an update when you need to review newly eligible deletions before applying them:

```sh
inject-agents-settings --package @example/docs --agent claude --scope project --dry-run
inject-agents-settings --package @example/docs --agent claude --scope project --force --yes
```

The tool stores the paths and SHA-256 hashes of completed skill and copied-rule file actions in `agents-assets-sync.json` beside the agent's assets. It keeps a completed action's record even if another action fails, and concurrent record updates preserve other packages' ownership. Files with edits, competing owners, or no ownership evidence are protected from record-based deletion. Managed rule blocks continue to use their own markers.

If the record cannot be written, the CLI reports an error and keeps the file changes that already succeeded. Verify and deliberately reinstall affected files to establish ownership. A retry does not take ownership of matching files that have no record.

`resolveAgentTarget` also reports the absolute record path in `installedAssetsFile`.
