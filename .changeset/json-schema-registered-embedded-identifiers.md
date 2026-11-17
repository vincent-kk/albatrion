---
"@winglet/json-schema": patch
---

A reference to an identifier embedded in a document registered through `resources` now resolves whatever the reference order, with `createReferenceResolver`, `createReferenceResolverAsync` and `resolveReference`. Before, such an identifier was found only after the document holding it had been referenced, so a schema resolved or kept the reference depending on property order, and `createReferenceResolverAsync` called `load` for an address a registered document already declared.

The first lookup of an absolute document address that no `resources` key names now indexes every registered document before looking again. As a result, an identifier declared twice among the registered documents throws a duplicate identifier error at that lookup even when no reference names the documents involved; a lookup whose key is registered still indexes only that document.
