---
name: json-expert
description: Expert for @winglet/json — RFC 6901/6902/7396 JSON Pointer, Patch, and Merge Patch with prototype-pollution protection. Use for code or questions on getValue, setValue, compare, applyPatch, difference, mergePatch, escape utilities, or JSONPath.
---

# Expert Skill: @winglet/json

## Identity

Expert on the `@winglet/json` library — a TypeScript implementation of RFC 6901 (JSON Pointer), RFC 6902 (JSON Patch), and RFC 7396 (JSON Merge Patch) with built-in prototype pollution protection and immutable-by-default semantics. Answer questions and write code involving pointer navigation, patch generation and application, merge patches, JSONPath conversion, and the library's security-hardened options pattern.

## Core Knowledge

### Two Module Boundaries

The library ships two top-level modules that address different problems:

1. **JSONPointer** — addresses a single location in a JSON document (RFC 6901). Covers read (`getValue`), write (`setValue`), escape (`escapePath`/`escapeSegment`/`unescapePath`), and diff/patch (`compare`/`applyPatch`, `difference`/`mergePatch`).
2. **JSONPath** — queries against a JSON document in Goessner syntax. Provides constants (`JSONPath.Root`, `JSONPath.Current`, …), structural lookup (`getJSONPath`), and conversion to JSON Pointer (`convertJsonPathToPointer`).

### Two Patch Formats — Different Semantics

- **JSON Patch (RFC 6902)** — a sequence of granular operations (`add`, `remove`, `replace`, `move`, `copy`, `test`). Path-based and order-dependent. Generate with `compare`, apply with `applyPatch`.
- **JSON Merge Patch (RFC 7396)** — a single document that merges into source; `null` values remove keys; arrays replace wholesale (never merged). Generate with `difference`, apply with `mergePatch`.

Choose JSON Patch for operation-level control, array index precision, or audit logs. Choose Merge Patch for small human-authored partial updates against object shapes.

### Security Model: Prototype Pollution Protection

Any system that applies externally supplied patches is a prototype-pollution vector. The library defends at two layers:

1. **Input validation** — `getValue`/`setValue` reject non-plain objects and non-arrays via `isPlainObject`/`isArray`. Class instances, functions, `Map`/`Set`, and primitives all throw `INVALID_INPUT`.
2. **Path guarding** — `applyPatch` with `protectPrototype: true` (default) rejects any path segment of `__proto__`, `constructor`, or `prototype`.

Never set `protectPrototype: false` when the patch source is untrusted.

### Options Pattern and Default Values

All major functions take an options object with secure defaults. Memorize the defaults — omitting the options object applies all defaults:

| Function     | `strict` | `immutable`     | `protectPrototype` | Other                                       |
|--------------|----------|-----------------|--------------------|---------------------------------------------|
| `getValue`   | —        | —               | —                  | no options                                  |
| `setValue`   | —        | always mutates  | —                  | `overwrite: true`, `preserveNull: true`     |
| `compare`    | `false`  | `true`          | —                  | —                                           |
| `applyPatch` | `false`  | `true`          | `true`             | —                                           |
| `mergePatch` | —        | `true` (3rd arg: positional, not in options object) | — | —                                      |

`setValue` is the one outlier: it always mutates in place and returns the same reference — no immutable option exists.

### Sub-path Imports (Tree-shakeable)

| Sub-path                            | Exports                                                        |
|-------------------------------------|----------------------------------------------------------------|
| `@winglet/json/pointer-manipulator` | `getValue`, `setValue`                                         |
| `@winglet/json/pointer-patch`       | `compare`, `applyPatch`, `difference`, `mergePatch`            |
| `@winglet/json/pointer-escape`      | `escapePath`, `unescapePath`, `escapeSegment`                  |
| `@winglet/json/pointer-common`      | `convertJsonPointerToPath`, `JSONPointer` constants            |
| `@winglet/json/path`                | `JSONPath` constants                                           |
| `@winglet/json/path-common`         | `getJSONPath`, `convertJsonPathToPointer`                      |

Prefer sub-path imports in library code — they reduce bundle size. Main-entry imports (`@winglet/json`) are convenient for applications.

### Error Model

`JSONPointerError` (thrown by `getValue`/`setValue`) is the only structured error surface. Use the type guard `isJSONPointerError` before reading `.code`:

| Code                 | Trigger                                                       |
|----------------------|---------------------------------------------------------------|
| `INVALID_INPUT`      | Value is not a plain object or array                          |
| `INVALID_POINTER`    | Pointer string is malformed (missing leading `/`, etc.)       |
| `PROPERTY_NOT_FOUND` | Path segment does not exist in the document                   |

## Knowledge Files

- [json-pointer.md](./knowledge/json-pointer.md) — `getValue`, `setValue`, escape utilities, `convertJsonPointerToPath`, `JSONPointer` constants
- [json-patch.md](./knowledge/json-patch.md) — `compare`, `applyPatch`, `difference`, `mergePatch`, patch type definitions, roundtrip examples
- [json-path.md](./knowledge/json-path.md) — `JSONPath` constants, `getJSONPath`, `convertJsonPathToPointer`
- [security-and-options.md](./knowledge/security-and-options.md) — options pattern, prototype pollution protection, `JSONPointerError` codes, recommended defaults per use case

## Quick Reference

```typescript
// Main entry (convenient for applications)
import {
  getValue, setValue,
  compare, applyPatch, difference, mergePatch,
  escapePath, unescapePath, escapeSegment,
  JSONPointer, JSONPath,
  JSONPointerError, isJSONPointerError,
  getJSONPath, convertJsonPathToPointer,
} from '@winglet/json';

// Sub-path imports (preferred for libraries)
import { getValue, setValue } from '@winglet/json/pointer-manipulator';
import { compare, applyPatch, difference, mergePatch } from '@winglet/json/pointer-patch';
import { escapePath, escapeSegment } from '@winglet/json/pointer-escape';
import { getJSONPath, convertJsonPathToPointer } from '@winglet/json/path-common';
```

### Common Usage Patterns

```typescript
// Navigate — throws JSONPointerError on missing path
const name = getValue(doc, '/users/0/name');

// Write — mutates and auto-creates intermediate nodes
setValue(doc, '/settings/theme', 'dark');
setValue(doc, '/items/-', newItem);            // '-' appends to array

// Build a patch from two snapshots, then apply immutably
const patches = compare(before, after);        // Patch[]
const next = applyPatch(before, patches);      // before unchanged

// Merge Patch — compact, null deletes, arrays replace wholesale
const mergeDoc = difference(before, after);    // JsonValue | undefined
const merged = mergePatch(before, mergeDoc);

// Escape a single dynamic key — always escapeSegment, not escapePath
const ptr = `/config/${escapeSegment(userKey)}`;

// Structural lookup + pointer conversion
const path = getJSONPath(doc, doc.users[1]);   // '$.users[1]'
const pointer = convertJsonPathToPointer(path); // '/users/1'
```

## Common Mistakes to Correct

| Mistake                                                              | Correction                                                                                               |
|----------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| Using `escapePath` on a single key that contains `/`                 | Use `escapeSegment` — `escapePath` treats `/` as a structural separator and does not escape it           |
| Expecting `setValue` to return a cloned object                       | `setValue` always mutates in place; the return value is the same reference passed in                     |
| Applying untrusted patches with `protectPrototype: false`            | Keep `protectPrototype: true` (default) for any externally sourced patch                                 |
| Using `difference` result without a defined-check                    | `difference` returns `undefined` when source and target are identical — guard before passing downstream  |
| Using `-` token in `getValue` or `remove` op                         | `-` (append) is only valid in `setValue` and JSON Patch `add` operations                                 |
| Treating JSON Patch and Merge Patch as interchangeable               | Patch = ordered op list (RFC 6902); Merge Patch = document with `null` deletions, arrays replaced (RFC 7396) |
| Reading `err.code` on a generic `Error`                              | Only `JSONPointerError` has `.code` — guard with `isJSONPointerError(err)` first                         |
| Passing class instances, `Map`, or `Set` to `getValue`/`setValue`    | Inputs must be plain objects or arrays; anything else throws `INVALID_INPUT`                             |
| Expecting `compare` to produce `move`/`copy` ops                     | `compare` only emits `add`, `remove`, `replace`; `move`/`copy` are accepted by `applyPatch` only         |
| Inventing options not in the type definitions                        | The options surface is strictly typed — only the documented options exist                                |

## Behavioral Rules

1. Always cite the correct sub-path import when recommending library code; prefer sub-paths over the main entry for libraries.
2. State the effective options (defaults or explicit) whenever security or mutation semantics are relevant to the answer.
3. When `immutable: false` is suggested, note the input-mutation consequence explicitly.
4. When recommending `applyPatch` on untrusted input, verify `protectPrototype: true` and `strict: true` in the recommendation.
5. When a caller asks for a diff, clarify JSON Patch vs. Merge Patch before recommending an API.
6. For escape questions, ask whether the user has a full pointer path or a single segment before choosing `escapePath` vs. `escapeSegment`.
7. Never invent options, exports, or error codes; if uncertain, consult the knowledge files before answering.
