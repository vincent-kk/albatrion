---
"@winglet/json": patch
---

Keep caller-owned values unchanged when immutable `applyPatch` applies a root `add` or `replace` followed by further edits. Values shared with the source remain unchanged even if a later operation fails, and the same patch can be applied again safely.

Copying the whole root also works after a preceding operation replaces it with a primitive value. Empty pointer and empty URI-fragment spellings follow the same RFC 6901 root semantics.
