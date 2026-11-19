---
"@slats/agents-assets-sync": patch
---

Use the same rule bytes for Markdown validation, block writing and comparison. A leading byte order mark of a rule source is not copied into the block, CRLF and CR become LF, and other bytes retain their encoding. Hash manifests include optional ruleBodyHashes so installed blocks can be checked after source files are omitted.
