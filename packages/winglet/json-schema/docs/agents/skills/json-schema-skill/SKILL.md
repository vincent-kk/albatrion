---
name: json-schema-skill
description: '@winglet/json-schema library expert. Guide JSON Schema traversal, transformation, and analysis: Visitor pattern, stack-based DFS, $ref resolution (sync/async), circular-ref handling, mutation, and nullable-aware type guards.'
---

# @winglet/json-schema — traversal, $ref resolution, nullable-aware guards

Applies when walking a JSON Schema with `enter`/`exit` callbacks, resolving `$ref` (internal or remote), filtering or transforming nodes mid-traversal, checking schema types at runtime, or reasoning about traversal order, depth limits and circular references.

## Mental Model

**Scanning collects; `getValue()` applies.** `scan()` walks the tree and records each mutation and resolved `$ref` as a deferred `[path, schema]` pair — it never writes to the input. `getValue()` replays those pairs onto a deep clone. Nothing recorded means nothing to replay: you get the original object back, by reference.

**One stack-based pass, not recursion.** A single explicit-stack DFS in which `enter`, `$ref` resolution and child discovery are fused into one visit per node. Arbitrarily deep schemas cannot overflow the stack.

**A type is a set, not a string.** `{ type: 'string' }` and `{ type: ['string', 'null'] }` describe the same base type with different nullability, so every guard ships in three variants and comparison is set-based rather than string equality.

## Decision Guide

Each base type (object, array, string, number, boolean) has three guards. `null` has only `isNullSchema` — there is no nullable-null.

| Need                                                   | Use                                   |
| ------------------------------------------------------ | ------------------------------------- |
| Type check that tolerates nullable — **the default**   | `isObjectSchema`, `isStringSchema`, … |
| Only `{ type: 'x' }`, rejecting the nullable spelling  | `isNonNullable<X>Schema`              |
| Only `{ type: ['x', 'null'] }`                         | `isNullable<X>Schema`                 |
| "Can this be null?"                                    | `hasNullInType`                       |
| Strict type equality, nullable-aware                   | `isIdenticalSchemaType`               |
| Loose compatibility (number/integer, nullable ignored) | `isCompatibleSchemaType`              |

Reach for the union variant unless you specifically need to _distinguish_ nullable from non-nullable. The non-nullable guard silently rejects `['string', 'null']`, which is the usual cause of a branch that mysteriously never fires.

## Invariants & Gotchas

1. `scan()` is synchronous and returns `this`; `JsonSchemaScannerAsync.scan()` returns `Promise<this>`. `getValue()` is synchronous in both.
2. `getValue()` returns `undefined` before `scan()`, applies deferred work on its first call, then caches the result.
3. **`enter` fires BEFORE `$ref` resolution.** `referenceResolved`, `referencePath`, `hasReference` and `referenceSkipped` are all unset during `enter` — read them in `exit`. The class JSDoc's `enter: (entry) => { if (entry.referenceResolved) … }` example therefore never fires; do not copy it.
4. Traversal order within a node is fixed by descriptor order, **not** key insertion order: `$defs` → `definitions` → `additionalProperties` → `not`/`if`/`then`/`else` → `allOf`/`anyOf`/`oneOf` → `prefixItems` → `items` → `properties`.
5. Circular refs are tracked per-`scan()` in a `visitedReference` set and **removed on `Exit`**, so a repeated ref terminates a cycle without blocking legitimate reuse in a sibling branch.
6. `filter` returning `false` skips the node and its entire subtree — and fires neither `enter` nor `exit` for it.
7. Nodes under `$defs`/`definitions` are never handed to `resolveReference` (they exit with `referenceSkipped: 'definition'`).
8. `isNumberSchema` matches `integer` as well as `number` — yet `isIdenticalSchemaType({ type: 'number' }, { type: 'integer' })` is `false`. Identity is stricter than the guard; only `isCompatibleSchemaType` unifies the two.
9. `hasNullInType({ type: 'null' })` is **`false`** — it tests for `'null'` inside a type _array_. Use `isNullSchema` for the pure null schema.
10. `isIdenticalSchemaType` treats `{ type: ['string','null'] }` and `{ type: 'string', nullable: true }` as equal (OpenAPI 3.0 spelling), and `{ type: ['string'] }` as equal to `{ type: 'string' }`.
11. Both comparison functions return `false` when either side has no `type`. `isCompatibleSchemaType` is symmetric, and `{ type: [] }` is compatible with nothing — itself included.
12. Sub-path imports (`/scanner`, `/async-scanner`, `/filter`) are tree-shakeable. `EXTENDED_KEYWORDS` is **not** re-exported from `/async-scanner` — take it from the root entry or `/scanner`.

## Knowledge Router

| Topic                                                                                | File                          |
| ------------------------------------------------------------------------------------ | ----------------------------- |
| Scanner behavior — options, callback timing, `getValue()`, cycles, depth, vocabulary | `knowledge/schema-scanner.md` |
| `InferValueType` / `InferJsonSchema` — how a schema maps to a value type             | `knowledge/type-inference.md` |

## API Truth

Signatures, option shapes and the full schema type hierarchy are mechanically derivable — read `node_modules/@winglet/json-schema/dist/*.d.ts` and the README rather than guessing at them.

```typescript
import {
  JsonSchemaScanner, JsonSchemaScannerAsync, resolveReference, EXTENDED_KEYWORDS,
} from '@winglet/json-schema';
import type {
  JsonSchema, UnknownSchema, ObjectSchema, ArraySchema, StringSchema, NumberSchema,
  BooleanSchema, NullSchema, RefSchema, InferJsonSchema, InferValueType,
} from '@winglet/json-schema';

// Tree-shakeable sub-paths
import { JsonSchemaScanner, EXTENDED_KEYWORDS } from '@winglet/json-schema/scanner';
import { JsonSchemaScannerAsync } from '@winglet/json-schema/async-scanner';
import {
  isObjectSchema, isNumberSchema, hasNullInType,
  isCompatibleSchemaType, isIdenticalSchemaType,
} from '@winglet/json-schema/filter';
```

Collecting every property path — `keyword === 'properties'` fires on each property child (not on the `properties` map itself), and `dataPath` is the JSON Pointer to the corresponding data location:

```typescript
const paths: string[] = [];
new JsonSchemaScanner({
  visitor: {
    enter: (entry) => {
      if (entry.keyword === 'properties') paths.push(entry.dataPath);
    },
  },
}).scan(schema);
```
