---
"@winglet/json-schema": patch
---

Resolve an empty `$ref` to the current document even when the root has no `$id` or `baseURI`. Synchronous and asynchronous resolvers now treat it like `#`, allowing strict reference resolution to preserve self-references as cycles instead of throwing an unresolved-reference error.
