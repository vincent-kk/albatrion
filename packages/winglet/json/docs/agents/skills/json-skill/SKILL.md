---
name: json-skill
description: Expert for @winglet/json — RFC 6901/6902/7396 JSON Pointer, Patch, and Merge Patch with prototype-pollution protection. Use for code or questions on getValue, setValue, compare, applyPatch, difference, mergePatch, escape utilities, JSONPointer, or JSONPath.
---

# @winglet/json — JSON Pointer, Patch, and Merge Patch

Applies when code addresses a location inside a JSON document, diffs two documents, or applies a patch that came from somewhere else. The library's defaults are secure but lenient: several guarantees people assume are on are actually opt-in, and the surface names differ from the RFC vocabulary in ways that produce silent no-ops rather than errors.

## Mental Model

**Two modules, two jobs.** `JSONPointer` addresses one location and mutates or diffs at it (RFC 6901/6902/7396). `JSONPath` is a lookup helper that answers "where does this object live", in Goessner syntax. They are not two spellings of one idea, and their string formats do not interconvert cleanly — see the knowledge file before bridging them.

**`compare` writes `test` guards only on request; `applyPatch` always enforces them.** `compare(strict: true)` inserts a `test` operation carrying the old value before each `replace` and `remove`. `applyPatch` compares every `test` value in every mode and aborts the whole patch on a mismatch, so applying `[{op:'test',path:'/v',value:1},{op:'replace',path:'/v',value:2}]` to the drifted document `{v:999}` throws `PATCH_TEST_FAILED`. `applyPatch`'s own `strict` option is deprecated and ignored.

**Immutability is per-function, not a library-wide policy.** There is no single `immutable` switch, and the word means something different in each place it appears. `setValue` always mutates. `compare` never mutates its inputs — its `immutable` option decides whether emitted patch values are deep clones or live references into the source. Only `applyPatch` and `mergePatch` protect the source document.

**Externally supplied patches are a prototype-pollution vector.** The defense is on by default in `applyPatch`, where it throws, and always on in `setValue`, where it silently abandons the write. The two functions use different rules and report differently, so "protected" does not mean "you will hear about it".

**Failures are silent more often than loud.** A missing read returns `undefined`; a blocked write returns the document; a mis-chosen escape function yields a valid-looking wrong pointer. Check return values — an exception is not the library's usual way of telling you something went wrong.

## Decision Guide

| Question                                                 | Answer                                                                                                                                                                                                                         |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Diff format: Patch or Merge Patch?                       | JSON Patch (`compare`/`applyPatch`) for operation-level control, array index precision, audit logs, or optimistic-concurrency guards. Merge Patch (`difference`/`mergePatch`) for small partial updates against object shapes. |
| Escaping: `escapePath` or `escapeSegment`?               | `escapePath` for a whole pointer whose `/` are structural separators. `escapeSegment` for one key that may itself contain `/` or `~`. Picking wrong is silent — see the knowledge file.                                        |
| Need the pointer to a nested object?                     | `getJSONPointer(root, target)` from `@winglet/json/pointer-common`. Do **not** build it by converting a `getJSONPath` result.                                                                                                  |
| Editing one element of an array?                         | JSON Patch. Merge Patch replaces an array wholesale at every depth — there is no element-level merge.                                                                                                                          |
| Patch must refuse a document that changed underneath it? | `compare(..., { strict: true })` to write `test` guards; `applyPatch` enforces them with no option.                                                                                                                            |
| Applying a patch from a client or network?               | Defaults — `immutable: true` keeps the source untouched on failure, `test` guards are always enforced, and reserved-member safety is structural (no option involved).                                                          |

## Invariants & Gotchas

Defaults, from source. Omitting the options object applies all of them:

| Function     | `strict` | `immutable`                                        | Other                                   |
| ------------ | -------- | -------------------------------------------------- | --------------------------------------- |
| `getValue`   | —        | —                                                  | no options                              |
| `setValue`   | —        | always mutates                                     | `overwrite: true`, `preserveNull: true` |
| `compare`    | `false`  | `true`                                             | —                                       |
| `applyPatch` | ignored  | `true`                                             | —                                       |
| `mergePatch` | —        | `true` (3rd positional arg, not an options object) | —                                       |
| `difference` | —        | —                                                  | no options                              |

Reserved member names (`__proto__`, `constructor`, `prototype`) are opaque own data in every function above — reads are own-only, writes define own data properties, and no option exists to change that.

Corrections for claims that are commonly assumed and are wrong here:

| Assumption                                                | Reality                                                                                                                                                                                     |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getValue` throws when the path is missing                | It returns `undefined`. It throws only for a non-plain-object/array input or a malformed pointer.                                                                                           |
| `getValue` can read inherited members                    | Object paths require own members and array paths require own elements at canonical indices. A missing location returns `undefined`. |
| `err.code === 'INVALID_INPUT'` matches                    | `.code` is namespaced: `'JSON_POINTER.INVALID_INPUT'`. The bare code is on `.specific`.                                                                                                     |
| `JSONPointerError` / `isJSONPointerError` can be imported | Neither is exported, from the main entry or any sub-path. Match on `.name` (`'JSONPointer'` / `'JSONPatch'`) or on `.code`.                                                                 |
| `compare` emits only `add`/`remove`/`replace`             | With `strict: true` it also emits a `test` guard before each `replace` and `remove`. `add` never gets a guard.                                                                              |
| `strict: true` on `applyPatch` rejects RFC violations     | The option is deprecated and ignored. RFC violations throw in every mode — `replace` of a missing member included.                                                                          |
| `strict: false` makes `applyPatch` lenient                | Failures throw regardless of `strict`: a `test` whose value differs or whose location is missing, `remove` of a missing property, array index out of bounds.                                |
| `escapePath` escapes `/` inside a key                     | It splits on `/` first, so a `/` is never escaped — `escapePath('config/database')` returns `'config/database'` unchanged.                                                                  |
| `unescapeSegment` is the inverse of `escapeSegment`       | `unescapeSegment` is an alias for `unescapePath` — the same function object.                                                                                                                |
| `setValue` skips or rejects reserved member keys          | It writes them as own data properties, prototype untouched. There is no silent skip.                                                                                                        |
| `difference` result is always usable                      | It returns `undefined` when the inputs are identical — guard before passing downstream.                                                                                                     |
| `-` works wherever a path does                            | `-` (append) is valid only in `setValue` and JSON Patch `add`.                                                                                                                              |
| `getJSONPath` cannot find primitives                      | It matches with `===`, so primitives are found; with duplicate values you get one traversal-order-dependent match, not all.                                                                 |
| `convertJSONPointerToPath` returns unescaped tokens       | It returns a **string** in dot/bracket form — `'/users/0/name'` becomes `'.users[0].name'`, unescaped. `compilePointer` is the token splitter.                                              |
| `convertJSONPathToPointer` takes a `$`-rooted JSONPath    | It takes a bare data path and treats `$` as an ordinary key, so a `getJSONPath` result cannot be piped into it.                                                                             |
| `compare` emits `move` when a subtree relocates           | It never emits `move` or `copy`; a relocation appears as `remove` plus `add`. Those two ops are apply-only and must be hand-written.                                                        |
| `setValue(doc, ptr, undefined)` assigns `undefined`       | It **deletes** the key instead.                                                                                                                                                             |
| `protectPrototype` guards `applyPatch` against pollution  | No such option exists. Reserved members are own data everywhere; a reserved intermediate without an own container fails as `PATCH_PATH_INVALID_INTERMEDIATE` like any missing path.         |
| `mergePatch` merges arrays element-wise                   | An array in the patch body replaces the target wholesale, at every depth. Use JSON Patch for element-level array edits.                                                                     |

`JSONPointerError` has exactly two codes — `INVALID_INPUT` and `INVALID_POINTER_TYPE`. There is no `INVALID_POINTER` and no `PROPERTY_NOT_FOUND`. Patch failures are a separate class, `JSONPatchError`, whose codes are prefixed `JSON_PATCH.` and include `PATCH_TEST_FAILED`, `PATCH_OBJECT_PROPERTY_NOT_FOUND`, `PATCH_ARRAY_INDEX_OUT_OF_BOUNDS`, `PATCH_ARRAY_INDEX_INVALID`, `PATCH_OPERATION_INVALID`, `PATCH_TARGET_NOT_OBJECT`, `PATCH_PATH_INVALID_INTERMEDIATE`, `PATCH_PATH_PROCESSING_ERROR`, and `PATCH_MOVE_INTO_DESCENDANT_FORBIDDEN`. There is no security-specific code — reserved-member paths fail (or succeed) exactly like ordinary paths.

## Knowledge Router

- [pointers-and-paths.md](./knowledge/pointers-and-paths.md) — `getValue`/`setValue` semantics, the escape trio, `getJSONPointer`, `getJSONPath`, and why the JSONPath-to-pointer bridge needs care.
- [patching-and-safety.md](./knowledge/patching-and-safety.md) — prototype pollution, the `test` guard pipeline, per-function immutability, Merge Patch replacement rules, partial application.

## API Truth

Do not guess signatures or option names — read `node_modules/@winglet/json/dist/**/*.d.ts`. The entry points and their real exports:

```typescript
// Main entry — everything below except getJSONPointer
import { getValue, setValue, compare, applyPatch, difference, mergePatch,
         escapePath, escapeSegment, unescapePath, unescapeSegment,
         convertJSONPointerToPath, convertJSONPathToPointer, getJSONPath,
         compilePointer, JSONPointer, JSONPath } from '@winglet/json';

// Sub-paths (preferred in library code)
import { getValue, setValue, compilePointer } from '@winglet/json/pointer-manipulator';
import { compare, applyPatch, difference, mergePatch } from '@winglet/json/pointer-patch';
import { escapePath, escapeSegment, unescapePath, unescapeSegment } from '@winglet/json/pointer-escape';
import { convertJSONPointerToPath, getJSONPointer } from '@winglet/json/pointer-common';
import { getJSONPath, convertJSONPathToPointer } from '@winglet/json/path-common';
```

`getJSONPointer` is reachable only from `@winglet/json/pointer-common` (or `@winglet/json/pointer`), never from the main entry. The `JSONPointer` and `JSONPath` constant objects come from the main entry or `@winglet/json/pointer` and `@winglet/json/path` — `pointer-common` does not carry them. Prefer sub-paths in library code so consumers can tree-shake; the main entry is a convenience for applications.

Calls, with the effective options that make each one correct:

```typescript
getValue(doc, '/users/0/name'); // undefined if absent — never throws for a miss
setValue(doc, '/settings/theme', 'dark'); // mutates doc, creates missing parents
setValue(doc, '/items/-', item); // '-' appends

const patches = compare(before, after, { strict: true }); // writes test guards
const next = applyPatch(before, patches); // enforces them; before untouched

const body = difference(before, after); // undefined when identical — guard it
const merged = mergePatch(before, body);

const pointer = `/config/${escapeSegment(dynamicKey)}`; // escapeSegment, never escapePath
```
