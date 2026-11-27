---
"@winglet/json-schema": patch
---

Allow a later explicit `createReferenceResolverAsync` resolution to retry after its loader rejects. Concurrent callers still share one request and receive the same error; successful and missing results remain cached. Each resolution attempts the loader only once.
