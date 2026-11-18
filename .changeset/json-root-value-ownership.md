---
"@winglet/json": patch
---

Keep caller-owned values unchanged when immutable `applyPatch` applies a root `add` or `replace` followed by further edits. Values shared with the source remain unchanged even if a later operation fails, and the same patch can be applied again safely.
