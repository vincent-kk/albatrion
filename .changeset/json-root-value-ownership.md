---
"@winglet/json": patch
---

Immutable `applyPatch` never mutates its source or any patch value. The result shares structure with both the source and patch values, at the root exactly as at a nested path: a final root `add` or `replace` returns its patch value itself, just as a nested `add` installs that value itself. Root `move` follows the same sharing rule.

Root ownership is obtained lazily before a following write instead of eagerly copying an installed object or array. Deep writes, array writes, removes, reserved keys, frozen inputs and failing batches preserve caller-owned graphs. A patch can be applied again safely. Mutable mode retains its in-place behavior.

Copying the whole root also works after a preceding operation replaces it with a primitive value. Empty pointer and empty URI-fragment spellings follow the same RFC 6901 root semantics.
