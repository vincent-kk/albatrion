---
"@winglet/json-schema": patch
---

Recognize `$schema` declarations and custom dialect aliases regardless of the URI scheme or host letter case, as RFC 3986 requires. Path, query and user-information case remain significant, and ordinary supported metaschema spellings keep a direct lookup path.
