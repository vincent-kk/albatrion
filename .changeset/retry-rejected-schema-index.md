---
"@winglet/json-schema": patch
---

Retry document indexing after a duplicate identifier or anchor is rejected. Reusing a resolver no longer exposes resources from the rejected document, and asynchronous resolvers retry its loader on the next explicit lookup while retaining successfully indexed documents.
