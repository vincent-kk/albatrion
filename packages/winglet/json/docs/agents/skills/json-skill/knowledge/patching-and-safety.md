# Patching and Safety

Generating and applying diffs, and the three things that decide whether that is safe: the reserved-member data contract, the `strict` guard pipeline, and which function is allowed to mutate what.

## Prototype pollution

A patch that arrives from a client, a queue, or a config file is arbitrary attacker-controlled path data. Applied naively, it reaches `Object.prototype` and every object in the process inherits the result:

```json
[
  { "op": "add", "path": "/__proto__/isAdmin", "value": true },
  { "op": "add", "path": "/constructor/prototype/isAdmin", "value": true }
]
```

The library defends structurally, and the rule is uniform across `setValue`, `applyPatch`, and `mergePatch`:

1. **Container validation.** `getValue` and `setValue` accept only plain objects and arrays. Class instances, functions, `Map`, `Set`, and primitives are rejected outright, so a patch cannot start a traversal on a prototype chain by accident.
2. **Reserved members are opaque own data.** `__proto__`, `constructor`, and `prototype` are treated exactly like any other member name, per RFC 6901/6902/7396: reads return the own data property or `undefined` — never the prototype chain — and writes define an own data property without triggering the `__proto__` setter. There is no guard to configure and nothing to switch off; no input can modify `Object.prototype` or any inherited object.

Both payload lines above therefore fail structurally with `PATCH_PATH_INVALID_INTERMEDIATE`, for the same reason `/missing/isAdmin` fails: the intermediate container is not an own property. Writing `/__proto__` directly (one segment, no missing intermediate) succeeds — as an own data property on the document, prototype untouched. The same pointer produces the same observable result through all three write APIs: no API throws a security error, none silently skips, and there is no `protectPrototype` option.

One consequence worth knowing: a returned document can now carry an own `__proto__` data key (exactly as `JSON.parse` output can). Spread (`{ ...x }`), `JSON.parse(JSON.stringify(x))`, and `structuredClone` preserve it as data, but `Object.assign({}, x)` and a `for-in` copy loop will swap the copy's prototype. Prefer spread when copying documents that may contain reserved member keys.

## The strict pipeline: compare writes guards, applyPatch enforces them

`strict` is not a validation-strictness dial. It is one optimistic-concurrency feature whose two halves live in different functions, both defaulting to `false`.

`compare(source, target, { strict: true })` inserts a `test` operation carrying the _old_ value before each `replace` and each `remove`. Additions get no guard, since there is nothing yet to assert:

```typescript
compare({ v: 1 }, { v: 2 }, { strict: true });
// [ { op: 'test', path: '/v', value: 1 },
//   { op: 'replace', path: '/v', value: 2 } ]
```

`applyPatch(doc, patches, { strict: true })` is what makes those guards do anything. With the default `strict: false`, a `test` operation whose property exists **always passes without comparing the value**:

```typescript
const guarded = compare({ v: 1 }, { v: 2 }, { strict: true });
applyPatch({ v: 999 }, guarded); // { v: 2 }  — guard ignored, drift overwritten
applyPatch({ v: 999 }, guarded, { strict: true }); // throws PATCH_TEST_FAILED
```

So a patch that looks guarded is only guarded if the applying side also opts in. Set `strict: true` on both ends, or the `test` operations are decoration.

Everything else `applyPatch` rejects is independent of `strict` and always throws: `remove` of a missing property, `test` naming a missing property, an array index out of bounds or non-numeric, an unknown `op`, and `move`/`copy` whose destination lies inside the source subtree. The one case that never throws is `replace` on a path that does not exist — it is applied as an add, in both modes.

## Who is allowed to mutate

| Function     | Effect on its inputs                                                                                        |
| ------------ | ----------------------------------------------------------------------------------------------------------- |
| `compare`    | Never mutates, in either mode.                                                                              |
| `difference` | Never mutates.                                                                                              |
| `setValue`   | Always mutates and returns the same reference. No option changes this.                                      |
| `applyPatch` | `immutable: true` (default) deep-clones first; `immutable: false` mutates and returns the same reference.   |
| `mergePatch` | Same, via a third **positional** argument — `mergePatch(source, patch, false)`, not `{ immutable: false }`. |

`compare`'s `immutable` option therefore means something different from the others: since comparison reads only, it controls whether the values _embedded in the emitted patch_ are deep clones or live references into the source document. With `immutable: false` the patch aliases your data, so a later mutation of the document silently rewrites the patch you are holding. Keep the default unless the patch is consumed immediately.

When `immutable: false` and an operation fails partway through the sequence, the earlier operations have already been written to the original document. There is no rollback:

```typescript
const doc = { a: 1, b: 2 };
applyPatch(
  doc,
  [
    { op: 'replace', path: '/a', value: 99 },
    { op: 'remove', path: '/missing' }, // throws
  ],
  { immutable: false },
);
// doc is now { a: 99, b: 2 } — first operation stuck, second never ran
```

The default `immutable: true` makes failure atomic from the caller's point of view: the clone is discarded and the original is untouched.

## What compare produces

Only `add`, `remove`, `replace`, and — under `strict` — `test`. It never emits `move` or `copy`, even when a subtree is relocated; that shows up as a `remove` plus an `add`. `move` and `copy` are accepted by `applyPatch` but must be hand-written.

Objects exposing a `toJson()` method are serialized through it before comparison, so a domain model diffs as its JSON projection rather than by its class fields.

## Merge Patch replaces more than people expect

`difference` returns `undefined` — not `{}` — when the two inputs are identical. Guard before passing the result on, since `undefined` is also the documented "no change" input to `mergePatch`.

`mergePatch` replaces the source wholesale whenever the patch body is not a plain object. That includes arrays, `null`, and primitives:

```typescript
mergePatch({ complex: 'object' }, 'simple'); // 'simple'
mergePatch({ a: { b: 1 } }, [1, 2]); // [1, 2]
mergePatch({ a: 1 }, undefined); // { a: 1 } — the one no-op case
```

Inside an object body, `null` deletes the key and any other value adds or replaces it. Arrays are never merged element-wise at any depth — an array in the patch replaces the array in the source entirely, which is why `difference({ a: [1] }, { a: [1, 2] })` returns the whole `{ a: [1, 2] }`. If you need element-level array edits, that is the reason to choose JSON Patch instead.

## Catching what these functions throw

Neither error class nor its type guard is exported, so `instanceof JsonPatchError` and `isJSONPointerError` are not available to consumers — importing them fails. Discriminate structurally instead. Both classes set a distinctive `name` (`'JsonPatch'` and `'JSONPointer'`), and both carry a namespaced `code` plus the bare code on `specific`, along with a `details` object holding the offending patch and its index:

```typescript
try {
  return applyPatch(doc, untrustedPatches, { strict: true });
} catch (error) {
  if (error instanceof Error && error.name === 'JsonPatch') {
    const code = (error as Error & { specific: string }).specific;
    if (code === 'PATCH_TEST_FAILED') return retryWithFreshDocument();
    if (code === 'PATCH_PATH_INVALID_INTERMEDIATE') return reject(error);
  }
  throw error;
}
```

Matching on `code` works too, but remember it is prefixed — `'JSON_PATCH.PATCH_TEST_FAILED'`, not `'PATCH_TEST_FAILED'`. Comparing `code` against a bare code silently never matches, which is the single most common way this error surface is used wrongly.

## Recommended options by use case

| Use case                                         | Options                                                                       |
| ------------------------------------------------ | ----------------------------------------------------------------------------- |
| Reading a value that may be absent               | `getValue` — no options; check for `undefined`                                |
| Applying a patch from an untrusted source        | `{ strict: true, immutable: true }` — reserved-member safety is structural    |
| Applying a patch you generated, in a hot path    | `{ immutable: false, strict: false }` — after confirming you own the document |
| Optimistic concurrency against a shared document | `compare(..., { strict: true })` **and** `applyPatch(..., { strict: true })`  |
| Diffing for state management                     | `compare` defaults; keep `immutable: true` if the patch outlives the tick     |
| Merging an API response                          | `mergePatch(source, patch)` — defaults are correct                            |
| Updating one form field                          | `setValue(state, pointer, value)` — mutation is the point                     |
