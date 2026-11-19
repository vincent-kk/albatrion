---
"@slats/agents-assets-sync": patch
---

Behavior change: --force refuses to delete a read-only orphan file that could previously be unlinked. Make the file writable before rerunning. Existing refusal of dangling write links remains.

Preserve hard links, mode, owner and group when overwriting agent files and managed documents. Atomic replacement is used when the identity can be reproduced; otherwise the file is written in place, which is not crash-atomic. Read-only files and dangling write links are refused.
