---
"@winglet/json": major
---

Breaking change: `applyPatch` now applies `move` and `copy` as RFC 6902 defines them. `move` removes the value at `from` and then adds it at `path`, and `copy` adds a deep copy at `path`, so a target array index inserts instead of overwriting the element there. Moving out of an array closes the gap instead of leaving a hole, and `path` is resolved against the document after the removal. A `move` whose `from` does not exist now throws (`PATCH_OBJECT_PROPERTY_NOT_FOUND`, `PATCH_ARRAY_INDEX_OUT_OF_BOUNDS` or `PATCH_PATH_INVALID_INTERMEDIATE`, as `remove` does) instead of writing `undefined`, and a `copy` whose `from` does not exist throws the same codes instead of creating a member whose value is `undefined`. A `from` that exists with the value `undefined`, such as a member set to `undefined`, an array hole or an `undefined` element, is still copied. A `move` onto its own `from` leaves the document unchanged instead of throwing, and `copy` into its own descendant succeeds, so `PATCH_COPY_INTO_DESCENDANT_FORBIDDEN` is no longer thrown. A `move` into its own descendant still throws `PATCH_MOVE_INTO_DESCENDANT_FORBIDDEN`. With `immutable: false`, a `move` whose add step fails, for example at an index past the end, leaves its removal applied to the source, like any operation that ran before a failure; the default `immutable: true` leaves the source untouched.

Before:

```ts
import { applyPatch } from "@winglet/json";

applyPatch({ foo: ["all", "grass", "cows", "eat"] }, [
  { op: "move", from: "/foo/1", path: "/foo/3" },
]);
// { foo: ['all', <empty>, 'cows', 'grass'] } — 'eat' overwritten, hole left behind

applyPatch({ a: [1, 2, 3], x: 9 }, [{ op: "copy", from: "/x", path: "/a/1" }]);
// { a: [1, 9, 3], x: 9 }

applyPatch({ a: 1 }, [{ op: "copy", from: "/missing", path: "/b" }]);
// { a: 1, b: undefined }
```

After:

```ts
import { applyPatch } from "@winglet/json";

applyPatch({ foo: ["all", "grass", "cows", "eat"] }, [
  { op: "move", from: "/foo/1", path: "/foo/3" },
]);
// { foo: ['all', 'cows', 'eat', 'grass'] }

applyPatch({ a: [1, 2, 3], x: 9 }, [{ op: "copy", from: "/x", path: "/a/1" }]);
// { a: [1, 9, 2, 3], x: 9 }

applyPatch({ a: 1 }, [{ op: "copy", from: "/missing", path: "/b" }]);
// throws JSONPatchError with specific 'PATCH_OBJECT_PROPERTY_NOT_FOUND'

// To overwrite an element, use replace:
applyPatch({ a: [1, 2, 3], x: 9 }, [{ op: "replace", path: "/a/1", value: 9 }]);
// { a: [1, 9, 3], x: 9 }
```
