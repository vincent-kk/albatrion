---
"@slats/agents-assets-sync": patch
---

Use the same rule bytes for Markdown validation, block writing and comparison. A leading byte order mark of a rule source is not copied into the block, CRLF and CR become LF, and other bytes retain their encoding. Hash manifests include optional ruleBodyHashes so installed blocks can be checked after source files are omitted.

Rule file copies and embedded rules now use the same checked source snapshot, including when a source changes after planning. Embedded sources are checked in their block context before any action in their unit runs; standalone copies may contain complete managed markers.
