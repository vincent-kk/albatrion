---
"@slats/agents-assets-sync": patch
---

`inject-agents-settings` and `resolveDestinations` now refuse a manifest path or skill namespace prefix that contains a `..` segment, with either `/` or `\` as the separator, and name the offending path in the error. Before, a tampered `dist/agents-hashes.json` with a key such as `skills/pp/../../../../escaped.md` made the CLI write outside the agent directory, and with `--force` it could overwrite any file the user can write. The run now fails for that package before anything is written. Names that merely contain dots, such as `a..b`, are unaffected.
