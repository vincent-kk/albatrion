---
"@winglet/json": major
---

Breaking change: `getValue` and JSON Patch COPY no longer take values from inherited members, array `length`, or array indices with leading zeroes. Both resolve values through own object members and canonical decimal array indices. A missing `getValue` path returns `undefined`. COPY rejects a missing final object member or an out-of-range final array index. An in-range array hole still copies as `undefined`, even if the prototype has a value at that index.

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
