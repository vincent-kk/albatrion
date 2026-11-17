---
"@winglet/json": major
---

Breaking change: a `test` operation in `applyPatch` now compares values in every mode and throws `PATCH_TEST_FAILED` on a mismatch, which stops the whole patch as RFC 6902 requires. Before, a `test` only compared values with `strict: true`, so a failed guard let the following operations run. The `strict` option of `applyPatch` no longer has any effect and is deprecated; `compare`'s `strict` option, which writes `test` guards into generated patches, is unchanged.

Before:

```ts
import { applyPatch } from "@winglet/json";

applyPatch({ status: "published" }, [
  { op: "test", path: "/status", value: "draft" },
  { op: "replace", path: "/status", value: "archived" },
]);
// { status: 'archived' } — the guard was ignored
```

After:

```ts
import { applyPatch, type Patch } from "@winglet/json";

applyPatch({ status: "published" }, [
  { op: "test", path: "/status", value: "draft" },
  { op: "replace", path: "/status", value: "archived" },
]);
// throws JSONPatchError with specific 'PATCH_TEST_FAILED'

// Code that relied on unchecked test operations removes them before applying:
const patches: Patch[] = [
  { op: "test", path: "/status", value: "draft" },
  { op: "replace", path: "/status", value: "archived" },
];
applyPatch(
  { status: "published" },
  patches.filter((patch) => patch.op !== "test"),
);
// { status: 'archived' }
```
