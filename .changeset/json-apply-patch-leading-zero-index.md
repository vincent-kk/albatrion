---
"@winglet/json": major
---

Breaking change: `applyPatch` rejects an array index with a leading zero, such as `/a/01`, with `PATCH_ARRAY_INDEX_INVALID` in every mode, as RFC 6901 requires for `path` and `from` pointers. Before, `/a/01` addressed index 1. `0` and indexes without a leading zero are unchanged.

Before:

```ts
import { applyPatch } from "@winglet/json";

applyPatch({ a: [1, 2] }, [{ op: "remove", path: "/a/01" }]);
// { a: [1] }
```

After:

```ts
import { applyPatch } from "@winglet/json";

applyPatch({ a: [1, 2] }, [{ op: "remove", path: "/a/01" }]);
// throws JSONPatchError with specific 'PATCH_ARRAY_INDEX_INVALID'

applyPatch({ a: [1, 2] }, [{ op: "remove", path: "/a/1" }]);
// { a: [1] }
```
