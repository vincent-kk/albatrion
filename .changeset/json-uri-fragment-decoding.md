---
"@winglet/json": major
---

Breaking change: JSON Pointer URI fragments decode percent escapes once before interpreting the pointer. Plain slash-prefixed pointers keep literal percent characters, and array-prefix conventions remain unchanged.

Before:
```ts
getValue({ 'a%20b': 1, 'a b': 2 }, '#/a%20b'); // 1
```

After:
```ts
getValue({ 'a%20b': 1, 'a b': 2 }, '#/a%20b'); // 2
getValue({ 'a%20b': 1, 'a b': 2 }, '#/a%2520b'); // 1
```

The same decoding applies to `setValue`, `compilePointer` and `applyPatch` target/source locations. Malformed escapes produce structured pointer or patch errors.
