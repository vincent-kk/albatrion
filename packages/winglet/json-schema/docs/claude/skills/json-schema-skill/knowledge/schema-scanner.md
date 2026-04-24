# Schema Scanner — JsonSchemaScanner & JsonSchemaScannerAsync

## Overview

Both scanners implement a **stack-based depth-first search** (DFS) over a JSON Schema tree. They use the **Visitor pattern** — callers supply `enter` and `exit` callbacks that fire as nodes are pushed onto and popped from the traversal stack.

The sync scanner (`JsonSchemaScanner`) processes everything in a single synchronous loop. The async scanner (`JsonSchemaScannerAsync`) is a parallel implementation whose `scan()` returns a `Promise<this>`, allowing all callbacks and the `resolveReference` hook to be async.

---

## Construction

```typescript
// Sync
const scanner = new JsonSchemaScanner<Schema, ContextType>({
  visitor?: SchemaVisitor<Schema, ContextType>,
  options?: JsonScannerOptions<Schema, ContextType>,
});

// Async
const scanner = new JsonSchemaScannerAsync<Schema, ContextType>({
  visitor?: SchemaVisitor<Schema, ContextType>,
  options?: JsonScannerOptionsAsync<Schema, ContextType>,
});
```

Both constructors accept an optional `props` object. Omitting it creates a no-op scanner.

**Type parameters**

| Parameter | Default | Description |
|-----------|---------|-------------|
| `Schema` | `UnknownSchema` | The schema node type flowing through visitors |
| `ContextType` | `void` | Shared mutable context passed to all callbacks |

---

## SchemaVisitor

```typescript
interface SchemaVisitor<Schema, ContextType> {
  enter?: (entry: SchemaEntry<Schema>, context?: ContextType) => void;  // sync
  exit?:  (entry: SchemaEntry<Schema>, context?: ContextType) => void;  // sync
}
// Async scanner accepts the same interface, but callbacks may return Promise<void>
```

- `enter` fires **before** children are pushed — ideal for pre-order operations.
- `exit` fires **after** all descendants have been processed — ideal for post-order aggregation.

---

## JsonScannerOptions

```typescript
interface JsonScannerOptions<Schema, ContextType> {
  filter?:           (entry: SchemaEntry<Schema>, context?: ContextType) => boolean;
  mutate?:           (entry: SchemaEntry<Schema>, context?: ContextType) => Schema | void;
  resolveReference?: (reference: string, entry: SchemaEntry<Schema>, context?: ContextType) => Schema | undefined;
  maxDepth?:         number;
  context?:          ContextType;
}
```

For `JsonScannerOptionsAsync`, `resolveReference` may return `Schema | Promise<Schema | undefined> | undefined`.

### Option semantics

**`filter(entry, context) => boolean`**
- Called at `Enter` phase before `enter` visitor fires.
- Return `false` to skip the node AND all its descendants.
- Does not affect sibling nodes.

**`mutate(entry, context) => Schema | void`**
- Called at `Enter` phase after `filter` passes.
- Return a replacement schema to transform the node in-place.
- The replacement is recorded in `__resolves__` and applied by `getValue()`.
- Return `undefined` / `void` to leave the node unchanged.

**`resolveReference(ref, entry, context) => Schema | undefined`**
- Called at `Reference` phase when a node has a `$ref` property.
- Not called for nodes inside `$defs` / `definitions` subtrees.
- Not called if the same `$ref` path was already visited (circular detection).
- Return the resolved schema to inline it; return `undefined` to leave `$ref` in place.

**`maxDepth: number`**
- Prevents traversal below this depth (root node is depth 0).
- Checked at `ChildEntries` phase — the node at `maxDepth` is visited but its children are not.

**`context: ContextType`**
- Passed as the second argument to every callback.
- Mutations to `context` are visible across all callbacks (shared mutable object).

---

## scan() and getValue()

```typescript
// Sync
const result: Schema | undefined = scanner.scan(schema).getValue();

// Async — must await scan before calling getValue
const instance = await scanner.scan(schema);
const result: Schema | undefined = instance.getValue();
// or:
const result = await scanner.scan(schema).then(s => s.getValue());
```

- `scan(schema)` resets internal state and runs the traversal. Returns `this` for chaining.
- `getValue()` is synchronous in both classes.
  - On first call it applies all deferred reference resolutions (`__resolves__`) onto a deep clone of the original schema and caches the result.
  - Subsequent calls return the cache.
  - Returns `undefined` if called before `scan()`.
  - Returns the original schema reference (no clone) when no `$ref` was resolved.

`getValue` accepts an optional generic to narrow the output type:
```typescript
const typed = scanner.scan(schema).getValue<MyResolvedSchema>();
```

---

## Traversal Phases (OperationPhase)

Each stack entry cycles through these phases via an internal `Map<Entry, OperationPhase>`:

| Phase | Bit | Description |
|-------|-----|-------------|
| `Enter` | `1` | Apply `filter`, `mutate`, call `visitor.enter` |
| `Reference` | `4` | Detect and resolve `$ref` |
| `ChildEntries` | `2` | Check `maxDepth`, push child entries to stack |
| `Exit` | `8` | Call `visitor.exit`, clean up circular ref tracking |

Processing is **not recursive** — it uses a `while (stack.length > 0)` loop with a phase map so each entry can be resumed across iterations.

---

## Child Discovery Order

When `getStackEntriesForNode` processes a node, children are discovered in this order and pushed to the stack (reversed for correct DFS pop order):

1. `$defs` entries
2. `definitions` entries
3. `additionalProperties` (only when it is an object schema)
4. `not`, `if`, `then`, `else` (conditional keywords)
5. `allOf`, `anyOf`, `oneOf` items (composition keywords)
6. `prefixItems` (array tuple schemas)
7. `items` (array item schema)
8. `properties` entries

Each child entry carries:
- `schema` — the child schema object
- `path` — JSON Pointer fragment (e.g., `#/properties/name`)
- `dataPath` — JSON Pointer to the corresponding data location (e.g., `/name`)
- `depth` — parent depth + 1
- `keyword` — the structural keyword that produced this child
- `variant` — property key (string), composition index (number), or undefined

---

## SchemaEntry

```typescript
type SchemaEntry<Schema> = {
  schema:             Schema;
  path:               string;    // JSON Pointer fragment, e.g. "#/properties/name"
  dataPath:           string;    // data JSON Pointer, e.g. "/name"
  depth:              number;
  hasReference?:      boolean;   // true when $ref was encountered but not resolved
  referencePath?:     string;    // the original $ref value when resolved
  referenceResolved?: boolean;   // true when resolveReference returned a schema
} & KeywordVariant;
```

`keyword` values: `'properties'`, `'$defs'`, `'definitions'`, `'items'`, `'prefixItems'`, `'additionalProperties'`, `'not'`, `'if'`, `'then'`, `'else'`, `'allOf'`, `'anyOf'`, `'oneOf'`, or absent (`keyword?: never`).

---

## Circular Reference Detection

The scanner tracks resolved `$ref` paths in a `visitedReference: Set<string>` per `scan()` call.

- When `resolveReference` returns a schema for path `P`, `P` is added to the set and children of the resolved schema are traversed.
- On `Exit` of that node, `P` is removed from the set (allowing the same ref in a different branch).
- If `P` is already in the set when encountered again, the node is marked `hasReference: true` and immediately moves to `Exit` — no children, no further resolution.

This is **stack-safe** and handles mutual references (A → B → A).

---

## Static Helper: resolveReference (standalone utility)

```typescript
import { resolveReference } from '@winglet/json-schema';

const inlined = resolveReference(schema);
```

This is a two-pass utility that:
1. Scans for all `$ref` nodes that could not be auto-resolved (definition schemas).
2. Builds a map from ref path → resolved schema using `@winglet/json/pointer` `getValue`.
3. Runs a second scan with that map as the `resolveReference` option to inline all refs.

Returns the inlined schema or `undefined` if input is undefined.

---

## Examples

### Basic traversal

```typescript
import { JsonSchemaScanner } from '@winglet/json-schema/scanner';

const schema = {
  type: 'object',
  properties: {
    id:   { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
  },
};

const scanner = new JsonSchemaScanner({
  visitor: {
    enter: ({ path, schema }) => console.log('enter', path, schema.type),
    exit:  ({ path })         => console.log('exit',  path),
  },
});
scanner.scan(schema);
// enter #  object
// enter #/properties/id    string
// exit  #/properties/id
// enter #/properties/tags  array
// enter #/properties/tags/items  string
// exit  #/properties/tags/items
// exit  #/properties/tags
// exit  #
```

### Typed context

`context` is passed by reference to every callback. Hold onto your own
reference to the context object — the scanner's internal options are private,
so mutations are observed through the variable you supplied, not through the
scanner instance.

```typescript
interface Stats { strings: number; objects: number }

const stats: Stats = { strings: 0, objects: 0 };

new JsonSchemaScanner<UnknownSchema, Stats>({
  options: { context: stats },
  visitor: {
    enter: (entry, ctx) => {
      if (isStringSchema(entry.schema)) ctx!.strings++;
      if (isObjectSchema(entry.schema)) ctx!.objects++;
    },
  },
}).scan(mySchema);

console.log(stats); // { strings: N, objects: M }
```

### Async remote ref resolution

```typescript
import { JsonSchemaScannerAsync } from '@winglet/json-schema/async-scanner';

const scanner = new JsonSchemaScannerAsync({
  options: {
    resolveReference: async (ref) => {
      const res = await fetch(ref);
      return res.json();
    },
  },
});
const result = await scanner.scan(schemaWithRemoteRefs).then(s => s.getValue());
```

### Depth-limited traversal

```typescript
const scanner = new JsonSchemaScanner({ options: { maxDepth: 2 } });
scanner.scan(deepSchema);
// Only root (depth 0), direct children (depth 1), and grandchildren (depth 2) are visited.
// Great-grandchildren are discovered at depth 2's ChildEntries phase but not pushed.
```
