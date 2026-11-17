---
"@winglet/json": major
---

Breaking change: `applyPatch` rejects an array index with a leading zero, such as `/a/01`, with `PATCH_ARRAY_INDEX_INVALID` in every mode, as RFC 6901 requires for `path` and `from` pointers. An index longer than nine digits is rejected the same way: before, it wrapped to a 32-bit integer and addressed a real element, so `remove /a/4294967296` deleted index 0 and `remove /a/4294967295` deleted the last element. Before, `/a/01` addressed index 1. `0` and indexes of up to nine digits without a leading zero are unchanged.

Before:

```ts
import { applyPatch } from "@winglet/json";

applyPatch({ a: [1, 2] }, [{ op: "remove", path: "/a/01" }]);
// { a: [1] }

applyPatch({ a: [1, 2] }, [{ op: "remove", path: "/a/4294967296" }]);
// { a: [2] }
```

After:

```ts
import { applyPatch } from "@winglet/json";

applyPatch({ a: [1, 2] }, [{ op: "remove", path: "/a/01" }]);
// throws JSONPatchError with specific 'PATCH_ARRAY_INDEX_INVALID'

applyPatch({ a: [1, 2] }, [{ op: "remove", path: "/a/4294967296" }]);
// throws JSONPatchError with specific 'PATCH_ARRAY_INDEX_INVALID'

applyPatch({ a: [1, 2] }, [{ op: "remove", path: "/a/1" }]);
// { a: [1] }
```
