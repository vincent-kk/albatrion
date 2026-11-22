---
"@slats/agents-assets-sync": patch
---

Behavior change: an embedded rule whose remaining byte order mark or top-level managed markers make its block boundary ambiguous is refused before its unit writes anything. Put marker examples inside a closed supported fence or comment; complete markers remain allowed in standalone file copies.

Use the same rule bytes for Markdown validation, block writing and comparison. A leading byte order mark of a rule source is not copied into the block, CRLF and CR become LF, and other bytes retain their encoding. Hash manifests include optional ruleBodyHashes so installed blocks can be checked after source files are omitted.

Every source kind uses a checked snapshot of bytes and mode, including when a source changes or disappears after planning. File copies and embedded rules use that snapshot without reading or inspecting the source again during apply. Embedded sources are checked in their block context before any action in their unit runs; standalone copies may contain complete managed markers.
