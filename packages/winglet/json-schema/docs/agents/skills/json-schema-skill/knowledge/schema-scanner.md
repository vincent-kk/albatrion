# Schema Scanner — behavior of JsonSchemaScanner & JsonSchemaScannerAsync

Semantics you cannot read off the type declarations. For constructor shapes and option types, read `dist/*.d.ts`.

## The deferred-resolution model

`scan()` never writes to the schema you pass it. Each mutation and each resolved `$ref` is appended to an internal list as a `[path, schema]` pair. `getValue()` is what applies them:

- **Before `scan()`** it returns `undefined`.
- **On its first call** it deep-clones the original and replays every recorded pair onto the clone, then caches that result. Later calls return the cache.
- **When the list is empty** it returns the **original object by reference** — no clone. So `scanner.scan(s).getValue() === s` holds for a read-only traversal, and consumers must not assume they own the result.

The list is filled by mutation _as well as_ by reference resolution, so a scan whose only effect is a `mutate` return also takes the clone path. A scan that resolves nothing and mutates nothing takes the identity path.

```typescript
const out = new JsonSchemaScanner().scan(schema).getValue();
out === schema; // true — nothing was recorded, so nothing was cloned
```

If a scan throws, internal state is reset and the error propagates: `getValue()` then returns `undefined` rather than a partial result.

## Callback timing

One visit per node runs `filter` → `mutate` → `enter` → `$ref` resolution → child discovery. `exit` runs after all descendants (inline for a leaf).

The order has one consequence that costs people hours: **the reference fields are populated after `enter` returns.** During `enter`, `hasReference`, `referenceResolved`, `referencePath` and `referenceSkipped` are still unset on every entry. Read them in `exit`.

```typescript
new JsonSchemaScanner({
  visitor: {
    enter: (entry) => entry.referenceResolved, // always undefined — too early
    exit: (entry) => entry.referenceResolved, // true once the $ref was inlined
  },
  options: { resolveReference },
}).scan(schema);
```

`context` is passed by reference to every callback, so it is a shared mutable object: mutate it to accumulate results, and hold your own reference to it, since the scanner's options are private.

## The async scanner

`JsonSchemaScannerAsync` drives the same traversal core, so every rule here holds unchanged. Three differences:

- `scan()` returns `Promise<this>` while `getValue()` stays synchronous, so the scan must be awaited first. `scanner.scan(s).getValue()` is a type error rather than a race.
- **Every** callback may be async, `enter` and `exit` included — the driver awaits whatever a callback returns if it is thenable, and skips the microtask hop when it is not. The shared `SchemaVisitor` type declares `enter`/`exit` as void-returning, which still accepts an `async` function.
- Resolution is **sequential, not parallel**: the DFS awaits each `resolveReference` before continuing, so N remote refs cost N round trips in series. For a large schema prefer a resolver backed by a prefetched map, and enable `cacheResolvedReference` when refs repeat.

```typescript
const scanner = new JsonSchemaScannerAsync({
  options: { resolveReference: async (ref) => (await fetch(ref)).json() },
});
const result = (await scanner.scan(schema)).getValue();
```

## filter, mutate, maxDepth

**`filter` returning `false`** drops the node and its whole subtree, and no `enter` or `exit` fires for it. Siblings are unaffected.

**`mutate` returning a schema** replaces the node for the rest of the traversal (children are discovered from the replacement) and records the replacement for `getValue()`. Returning `undefined` leaves the node alone. The input schema is still never written to.

**`maxDepth`** limits child discovery, not visiting: the node _at_ `maxDepth` is visited normally, its children are never pushed. Root is depth 0, so `maxDepth: 2` visits depths 0, 1 and 2.

## $ref resolution and cycles

`resolveReference(ref, entry, context)` is called only for a node whose `$ref` is a string — identified structurally, not by type membership. Two cases skip the resolver entirely, and each records why in `entry.referenceSkipped`:

| `referenceSkipped` | Cause                                                                    |
| ------------------ | ------------------------------------------------------------------------ |
| `'definition'`     | The node lives under `$defs`/`definitions` — deliberately never resolved |
| `'cycle'`          | The same ref is already being resolved on the current path               |
| `'unresolved'`     | No resolver configured, or the resolver returned nothing                 |

Cycle detection is per-`scan()`: a resolved ref is added to a `visitedReference` set and **removed again on that node's `Exit`**. That removal is the whole design. It means the set tracks _the current path_, not everything seen, so `A → B → A` terminates at the repeat while two sibling properties pointing at the same `$ref` both still resolve. A global seen-set would have silently dropped the second sibling.

```typescript
// A → B → A, with both definitions resolvable:
//   exit '#/$defs/A/properties/b'                     → 'definition'
//   exit '#/$defs/B/properties/a'                     → 'definition'
//   exit '#/properties/root/properties/b/properties/a' → 'cycle'  ← terminates here
```

## Options that are easy to miss

### `cloneResolvedSchema` (default `true`)

Each resolved `$ref` is deep-cloned at inline time. Two occurrences of the same `$ref` therefore produce two independent objects in the output, and the object the resolver returned is never captured by the result.

**This default changed.** Earlier versions behaved as if it were `false`, and docs written against them predict alias-sharing — that `out.properties.x === out.properties.y` for two identical `$ref`s, or that the output aliases `schema.definitions.A`. Both predictions are now wrong. Set `cloneResolvedSchema: false` to restore that behavior, or to skip the clone cost when your resolver already hands back a freshly-owned object.

```typescript
// default (true):  out.properties.x !== out.properties.y
// false:           out.properties.x === schema.definitions.A
```

### `cacheResolvedReference` (default `false`)

By default the resolver runs once **per occurrence** — three identical `$ref`s mean three calls. Enable it to memoize the raw resolver result per reference string, which is what you want for expensive or remote resolvers. Caching does not reintroduce aliasing: the cached result is cloned at each inline point (subject to `cloneResolvedSchema`), so the three outputs stay distinct while the resolver runs once. Works on the async scanner too.

### `additionalKeywords` and the `EXTENDED_KEYWORDS` preset

The traversal vocabulary is a list of keyword descriptors, and the built-in list is deliberately narrow. Applicator keywords outside it are **not descended into at all** — by default a node's `patternProperties`, `propertyNames`, `contains` and `dependentSchemas` subschemas are never visited. Opt in:

```typescript
import {
  EXTENDED_KEYWORDS,
  JsonSchemaScanner,
} from '@winglet/json-schema/scanner';

new JsonSchemaScanner({
  options: { additionalKeywords: EXTENDED_KEYWORDS },
}).scan(schema);
```

`EXTENDED_KEYWORDS` covers the draft 2019-09 / 2020-12 applicators: `patternProperties`, `dependentSchemas`, `propertyNames`, `contains`, `additionalItems`, `unevaluatedProperties`, `unevaluatedItems`, `contentSchema`. Draft-07 `dependencies` is excluded on purpose — its array form is not a subschema.

You can also supply your own descriptors, e.g. `[{ keyword: 'x-widget', kind: 'schema' }]`, for vendor keywords. Two things to know: added descriptors are appended, so they are traversed **after** the built-ins (`properties` included); and a descriptor reusing a built-in keyword name **overrides** that built-in's kind and position rather than adding to it.

## Child discovery order

Children are discovered by matching the node's own keys against the vocabulary, then re-sorting into descriptor order — so **key insertion order in the schema is irrelevant** and traversal is stable:

`$defs` → `definitions` → `additionalProperties` → `not` → `if` → `then` → `else` → `allOf` → `anyOf` → `oneOf` → `prefixItems` → `items` → `properties`

Only non-null object subschemas become entries. `items: false`, a primitive property value, or a non-object element inside `allOf` is skipped rather than visited as a garbage node — which is also why `additionalProperties: false` produces no child. Inherited enumerable keys are not traversed; own keys only.

Each child entry carries `path` (schema JSON Pointer, RFC 6901-escaped), `dataPath` (pointer to the data location — only `properties` and tuple `items` extend it), `depth`, `keyword`, and `variant` (property key, composition index, or absent).
