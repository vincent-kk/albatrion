---
"@winglet/json-schema": patch
---

Resolve an empty `$ref` to the current document when the root has no `$id` or `baseURI`, and when its base URI is non-hierarchical, such as `urn:` or `tag:`. Synchronous and asynchronous resolvers now treat it like `#`, so strict reference resolution handles these self-references instead of throwing an unresolved-reference error.
