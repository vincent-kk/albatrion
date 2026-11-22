---
"@winglet/json": major
---

`getValue` and JSON Patch COPY now require own object members or own array elements at canonical decimal indices. This breaking change aligns reads with JSON Pointer member resolution. An inherited property, an array's `length`, or an index with a leading zero no longer resolves. A missing `getValue` path returns `undefined`. COPY rejects a missing source position.

Before:

```ts
getValue({}, '/toString'); // Object.prototype.toString
getValue({ items: ['a'] }, '/items/length'); // 1
```

After:

```ts
getValue({}, '/toString'); // undefined
getValue({ items: ['a'] }, '/items/length'); // undefined

const items = ['a'];
const document = { items, itemCount: items.length };
getValue(document, '/itemCount'); // 1
applyPatch(document, [{ op: 'copy', from: '/itemCount', path: '/count' }]);
```

Read application metadata directly or include it as an own member of the document before reading or copying it through a pointer. `convertJSONPointerToPath` returns a dot and bracket path string. Match JSON Pointer errors by `name` or by their `specific` code.
