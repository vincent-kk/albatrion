---
"@slats/agents-assets-sync": patch
---

Preserve marker examples inside Markdown code fences, including backtick and tilde fences, when updating AGENTS.md.

Recognize fences and managed blocks after one leading UTF-8 byte-order mark while preserving the mark and all source bytes during updates.
