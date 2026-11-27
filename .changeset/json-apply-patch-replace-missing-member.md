---
"@winglet/json": major
---

Breaking change: `replace` on an object member that does not exist now throws `PATCH_OBJECT_PROPERTY_NOT_FOUND` in every mode, as RFC 6902 requires. Before, it added the member, even with `strict: true`, so a patch written against a mistyped path still succeeded. Array `replace` already rejected an index past the end.

Before:

```ts
import { applyPatch } from "@winglet/json";

applyPatch({ a: 1 }, [{ op: "replace", path: "/b", value: 2 }]);
// { a: 1, b: 2 }
```

After:

```ts
import { applyPatch } from "@winglet/json";

applyPatch({ a: 1 }, [{ op: "replace", path: "/b", value: 2 }]);
// throws JSONPatchError with specific 'PATCH_OBJECT_PROPERTY_NOT_FOUND'

// To create or overwrite a member, use add:
applyPatch({ a: 1 }, [{ op: "add", path: "/b", value: 2 }]);
// { a: 1, b: 2 }
```
