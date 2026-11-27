---
"@winglet/json": major
---

Breaking change: `applyPatch` rejects an array index written with a leading zero, such as `/a/01`, with `PATCH_ARRAY_INDEX_INVALID` in both `path` and `from`, as RFC 6901 requires. Before, `/a/01` in a `path` addressed index 1, and in a `from` it addressed no element, so `move` and `copy` wrote `undefined` at their target. A `path` index of 2147483648 or more is now read as its real value: before, it wrapped to a 32-bit integer and could address a real element, so `remove /a/4294967295` deleted the last element and `remove /a/4294967296` deleted index 0. Now an index up to 4294967294, the largest array index, is checked against the array length like any other index, and a larger index throws `PATCH_ARRAY_INDEX_INVALID`. `0` and indexes up to 2147483647 without a leading zero are unchanged. Write array indexes without leading zeros.

Before:

```ts
import { applyPatch } from "@winglet/json";

applyPatch({ a: [1, 2] }, [{ op: "remove", path: "/a/01" }]);
// { a: [1] }

applyPatch({ a: [1, 2] }, [{ op: "copy", from: "/a/01", path: "/b" }]);
// { a: [1, 2], b: undefined }

applyPatch({ a: [1, 2] }, [{ op: "remove", path: "/a/4294967296" }]);
// { a: [2] }
```

After:

```ts
import { applyPatch } from "@winglet/json";

applyPatch({ a: [1, 2] }, [{ op: "remove", path: "/a/01" }]);
// throws JSONPatchError with specific 'PATCH_ARRAY_INDEX_INVALID'

applyPatch({ a: [1, 2] }, [{ op: "copy", from: "/a/01", path: "/b" }]);
// throws JSONPatchError with specific 'PATCH_ARRAY_INDEX_INVALID'

applyPatch({ a: [1, 2] }, [{ op: "remove", path: "/a/4294967296" }]);
// throws JSONPatchError with specific 'PATCH_ARRAY_INDEX_INVALID'

applyPatch({ a: [1, 2] }, [{ op: "remove", path: "/a/1" }]);
// { a: [1] }
```
