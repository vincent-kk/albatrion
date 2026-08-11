---
name: json-skill
description: Expert for @winglet/json — RFC 6901/6902/7396 JSON Pointer, Patch, and Merge Patch with prototype-pollution protection. Use for code or questions on getValue, setValue, compare, applyPatch, difference, mergePatch, escape utilities, JSONPointer, or JSONPath.
---

# @winglet/json — JSON Pointer, Patch, and Merge Patch

Applies when code addresses a location inside a JSON document, diffs two documents, or applies a patch that came from somewhere else. The library's defaults are secure but lenient: several guarantees people assume are on are actually opt-in, and the surface names differ from the RFC vocabulary in ways that produce silent no-ops rather than errors.

## Mental Model

**Two modules, two jobs.** `JSONPointer` addresses one location and mutates or diffs at it (RFC 6901/6902/7396). `JSONPath` is a lookup helper that answers "where does this object live", in Goessner syntax. They are not two spellings of one idea, and their string formats do not interconvert cleanly — see the knowledge file before bridging them.

**`strict` is one feature split across two functions.** `compare(strict: true)` _writes_ `test` guard operations into the patch; `applyPatch(strict: true)` _enforces_ them. Both default to `false`, so by default guards are neither written nor checked. Applying `[{op:'test',path:'/v',value:1},{op:'replace',path:'/v',value:2}]` to the drifted document `{v:999}` yields `{v:2}` with no error at all. Round-trip integrity requires `strict: true` on **both** ends.

**Immutability is per-function, not a library-wide policy.** There is no single `immutable` switch, and the word means something different in each place it appears. `setValue` always mutates. `compare` never mutates its inputs — its `immutable` option decides whether emitted patch values are deep clones or live references into the source. Only `applyPatch` and `mergePatch` protect the source document.

**Externally supplied patches are a prototype-pollution vector.** The defense is on by default in `applyPatch`, where it throws, and always on in `setValue`, where it silently abandons the write. The two functions use different rules and report differently, so "protected" does not mean "you will hear about it".

**Failures are silent more often than loud.** A missing read returns `undefined`; a blocked write returns the document; a `test` guard passes unchecked; a mis-chosen escape function yields a valid-looking wrong pointer. Check return values — an exception is not the library's usual way of telling you something went wrong.

## Decision Guide

| Question                                                 | Answer                                                                                                                                                                                                                         |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Diff format: Patch or Merge Patch?                       | JSON Patch (`compare`/`applyPatch`) for operation-level control, array index precision, audit logs, or optimistic-concurrency guards. Merge Patch (`difference`/`mergePatch`) for small partial updates against object shapes. |
| Escaping: `escapePath` or `escapeSegment`?               | `escapePath` for a whole pointer whose `/` are structural separators. `escapeSegment` for one key that may itself contain `/` or `~`. Picking wrong is silent — see the knowledge file.                                        |
| Need the pointer to a nested object?                     | `getJSONPointer(root, target)` from `@winglet/json/pointer-common`. Do **not** build it by converting a `getJSONPath` result.                                                                                                  |
| Editing one element of an array?                         | JSON Patch. Merge Patch replaces an array wholesale at every depth — there is no element-level merge.                                                                                                                          |
| Patch must refuse a document that changed underneath it? | `strict: true` on `compare` **and** on `applyPatch`. Either one alone does nothing.                                                                                                                                            |
| Applying a patch from a client or network?               | `{ strict: true, protectPrototype: true, immutable: true }` — only `protectPrototype` and `immutable` are already the defaults.                                                                                                |

## Invariants & Gotchas

Defaults, from source. Omitting the options object applies all of them:

| Function     | `strict` | `immutable`                                        | `protectPrototype` | Other                                   |
| ------------ | -------- | -------------------------------------------------- | ------------------ | --------------------------------------- |
| `getValue`   | —        | —                                                  | —                  | no options                              |
| `setValue`   | —        | always mutates                                     | always on, silent  | `overwrite: true`, `preserveNull: true` |
| `compare`    | `false`  | `true`                                             | —                  | —                                       |
| `applyPatch` | `false`  | `true`                                             | `true`             | —                                       |
| `mergePatch` | —        | `true` (3rd positional arg, not an options object) | —                  | —                                       |
| `difference` | —        | —                                                  | —                  | no options                              |

Corrections for claims that are commonly assumed and are wrong here:

| Assumption                                                          | Reality                                                                                                                                                       |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getValue` throws when the path is missing                          | It returns `undefined`. It throws only for a non-plain-object/array input or a malformed pointer.                                                             |
| `err.code === 'INVALID_INPUT'` matches                              | `.code` is namespaced: `'JSON_POINTER.INVALID_INPUT'`. The bare code is on `.specific`.                                                                       |
| `JSONPointerError` / `isJSONPointerError` can be imported           | Neither is exported, from the main entry or any sub-path. Match on `.name` (`'JSONPointer'` / `'JsonPatch'`) or on `.code`.                                   |
| `compare` emits only `add`/`remove`/`replace`                       | With `strict: true` it also emits a `test` guard before each `replace` and `remove`. `add` never gets a guard.                                                |
| `strict: true` on `applyPatch` rejects RFC violations               | It governs one thing: whether `test` operations compare values. `replace` on a missing path silently adds it either way.                                      |
| `strict: false` makes `applyPatch` lenient                          | Unrelated failures throw regardless of `strict`: `remove` of a missing property, `test` on a missing property, array index out of bounds.                     |
| `escapePath` escapes `/` inside a key                               | It splits on `/` first, so a `/` is never escaped — `escapePath('config/database')` returns `'config/database'` unchanged.                                    |
| `unescapeSegment` is the inverse of `escapeSegment`                 | `unescapeSegment` is an alias for `unescapePath` — the same function object.                                                                                  |
| `setValue` reports a rejected prototype key                         | It returns the document untouched, with no error.                                                                                                             |
| `difference` result is always usable                                | It returns `undefined` when the inputs are identical — guard before passing downstream.                                                                       |
| `-` works wherever a path does                                      | `-` (append) is valid only in `setValue` and JSON Patch `add`.                                                                                                |
| `getJSONPath` cannot find primitives                                | It matches with `===`, so primitives are found; with duplicate values you get one traversal-order-dependent match, not all.                                   |
| `convertJsonPointerToPath` returns unescaped tokens                 | It returns a **string** in dot/bracket form — `'/users/0/name'` becomes `'.users[0].name'`, unescaped. `compilePointer` is the token splitter.                |
| `convertJsonPathToPointer` takes a `$`-rooted JSONPath              | It takes a bare data path and treats `$` as an ordinary key, so a `getJSONPath` result cannot be piped into it.                                               |
| `compare` emits `move` when a subtree relocates                     | It never emits `move` or `copy`; a relocation appears as `remove` plus `add`. Those two ops are apply-only and must be hand-written.                          |
| `setValue(doc, ptr, undefined)` assigns `undefined`                 | It **deletes** the key instead.                                                                                                                               |
| `protectPrototype` rejects any `constructor` or `prototype` segment | It rejects `__proto__` anywhere, and `prototype` only directly after `constructor`. A bare `/constructor/x` is refused structurally instead, guard on or off. |
| `mergePatch` merges arrays element-wise                             | An array in the patch body replaces the target wholesale, at every depth. Use JSON Patch for element-level array edits.                                       |

`JSONPointerError` has exactly two codes — `INVALID_INPUT` and `INVALID_POINTER_TYPE`. There is no `INVALID_POINTER` and no `PROPERTY_NOT_FOUND`. Patch failures are a separate class, `JsonPatchError`, whose codes are prefixed `JSON_PATCH.` and include `PATCH_TEST_FAILED`, `PATCH_OBJECT_PROPERTY_NOT_FOUND`, `PATCH_ARRAY_INDEX_OUT_OF_BOUNDS`, `PATCH_ARRAY_INDEX_INVALID`, `PATCH_OPERATION_INVALID`, `PATCH_TARGET_NOT_OBJECT`, `PATCH_PATH_INVALID_INTERMEDIATE`, `PATCH_PATH_PROCESSING_ERROR`, `PATCH_MOVE_INTO_DESCENDANT_FORBIDDEN`, `PATCH_COPY_INTO_DESCENDANT_FORBIDDEN`, and `SECURITY_PROTOTYPE_MODIFICATION_FORBIDDEN`.

## Knowledge Router

- [pointers-and-paths.md](./knowledge/pointers-and-paths.md) — `getValue`/`setValue` semantics, the escape trio, `getJSONPointer`, `getJSONPath`, and why the JSONPath-to-pointer bridge needs care.
- [patching-and-safety.md](./knowledge/patching-and-safety.md) — prototype pollution, the `strict` guard pipeline, per-function immutability, Merge Patch replacement rules, partial application.

## API Truth

Do not guess signatures or option names — read `node_modules/@winglet/json/dist/**/*.d.ts`. The entry points and their real exports:

```typescript
// Main entry — everything below except getJSONPointer
import { getValue, setValue, compare, applyPatch, difference, mergePatch,
         escapePath, escapeSegment, unescapePath, unescapeSegment,
         convertJsonPointerToPath, convertJsonPathToPointer, getJSONPath,
         compilePointer, JSONPointer, JSONPath } from '@winglet/json';

// Sub-paths (preferred in library code)
import { getValue, setValue, compilePointer } from '@winglet/json/pointer-manipulator';
import { compare, applyPatch, difference, mergePatch } from '@winglet/json/pointer-patch';
import { escapePath, escapeSegment, unescapePath, unescapeSegment } from '@winglet/json/pointer-escape';
import { convertJsonPointerToPath, getJSONPointer } from '@winglet/json/pointer-common';
import { getJSONPath, convertJsonPathToPointer } from '@winglet/json/path-common';
```

`getJSONPointer` is reachable only from `@winglet/json/pointer-common` (or `@winglet/json/pointer`), never from the main entry. The `JSONPointer` and `JSONPath` constant objects come from the main entry or `@winglet/json/pointer` and `@winglet/json/path` — `pointer-common` does not carry them. Prefer sub-paths in library code so consumers can tree-shake; the main entry is a convenience for applications.

Calls, with the effective options that make each one correct:

```typescript
getValue(doc, '/users/0/name'); // undefined if absent — never throws for a miss
setValue(doc, '/settings/theme', 'dark'); // mutates doc, creates missing parents
setValue(doc, '/items/-', item); // '-' appends

const patches = compare(before, after, { strict: true }); // writes test guards
const next = applyPatch(before, patches, { strict: true }); // enforces them; before untouched

const body = difference(before, after); // undefined when identical — guard it
const merged = mergePatch(before, body);

const pointer = `/config/${escapeSegment(dynamicKey)}`; // escapeSegment, never escapePath
```
