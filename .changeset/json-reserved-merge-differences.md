---
"@winglet/json": major
---

Breaking change: `difference` includes own `__proto__`, `constructor` and `prototype` members instead of omitting them. Additions, changes and removals round-trip through `mergePatch` without changing the result prototype.

Before:
```ts
difference({ constructor: 1, a: 1 }, { a: 1 }); // undefined
```

After:
```ts
difference({ constructor: 1, a: 1 }, { a: 1 }); // { constructor: null }
```

Callers that intentionally exclude these data members should remove them from their comparison inputs explicitly.
