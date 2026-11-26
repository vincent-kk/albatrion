---
"@winglet/json": major
---

Breaking change: `getValue` reads only own object members and canonical array indexes. A pointer that names an inherited member, such as `/toString`, or an array's `length` now returns `undefined`; before, it returned the inherited value or the length. The `from` of an `applyPatch` `copy` or `move` follows the same rule: such a `from` now throws, with `PATCH_OBJECT_PROPERTY_NOT_FOUND` for an inherited member and `PATCH_ARRAY_INDEX_INVALID` for `length`, instead of copying the inherited value or the length.

Before:

```ts
import { applyPatch, getValue } from "@winglet/json";

getValue({}, "/toString"); // Object.prototype.toString
getValue({ items: ["a"] }, "/items/length"); // 1
applyPatch({ items: ["a"] }, [
  { op: "copy", from: "/items/length", path: "/count" },
]);
// { items: ['a'], count: 1 }
```

After:

```ts
import { applyPatch, getValue } from "@winglet/json";

getValue({}, "/toString"); // undefined
getValue({ items: ["a"] }, "/items/length"); // undefined
applyPatch({ items: ["a"] }, [
  { op: "copy", from: "/items/length", path: "/count" },
]);
// throws JSONPatchError with specific 'PATCH_ARRAY_INDEX_INVALID'

// Store a derived value as an own member before reading or copying it:
const items = ["a"];
const document = { items, count: items.length };
getValue(document, "/count"); // 1
```
