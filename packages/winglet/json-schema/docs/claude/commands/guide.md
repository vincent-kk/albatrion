# @winglet/json-schema — Developer Guide

## Quick Start

```bash
yarn add @winglet/json-schema
# or
npm install @winglet/json-schema
```

```typescript
import { JsonSchemaScanner } from '@winglet/json-schema';
import { isObjectSchema, isStringSchema } from '@winglet/json-schema/filter';

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
    age:  { type: 'number', minimum: 0 },
  },
  required: ['name'],
};

const scanner = new JsonSchemaScanner({
  visitor: {
    enter: ({ path, schema }) => {
      if (isStringSchema(schema)) console.log('string field at', path);
    },
  },
});

scanner.scan(schema);
```

---

## Import Paths

| Import | Exports |
|--------|---------|
| `@winglet/json-schema` | Everything: scanners, filters, utilities, types |
| `@winglet/json-schema/scanner` | `JsonSchemaScanner` only |
| `@winglet/json-schema/async-scanner` | `JsonSchemaScannerAsync` only |
| `@winglet/json-schema/filter` | All type guards and comparison functions |

Use sub-paths to keep bundles small.

---

## Core Concepts

### 1. The Scanner is a Visitor Engine

`JsonSchemaScanner` traverses a schema tree depth-first and calls your `enter` and `exit` callbacks on each node. You never write recursive schema-walking code.

```typescript
const scanner = new JsonSchemaScanner({
  visitor: {
    enter: (entry) => { /* called before children */ },
    exit:  (entry) => { /* called after all descendants */ },
  },
});
scanner.scan(mySchema);
```

### 2. SchemaEntry carries full context

Each callback receives a `SchemaEntry`:
- `entry.schema` — the current schema node
- `entry.path` — JSON Pointer to the node (e.g., `#/properties/address/properties/city`)
- `entry.dataPath` — corresponding data path (e.g., `/address/city`)
- `entry.depth` — traversal depth (root = 0)
- `entry.keyword` — structural keyword that produced this node (`'properties'`, `'items'`, etc.)
- `entry.variant` — property name or array index

### 3. Options control traversal behavior

| Option | Purpose |
|--------|---------|
| `filter` | Return `false` to skip a node and all its descendants |
| `mutate` | Return a new schema to replace the node (applied on `getValue()`) |
| `resolveReference` | Provide a resolved schema for a `$ref` node |
| `maxDepth` | Stop descending beyond this depth |
| `context` | Shared mutable object passed to every callback |

### 4. Call getValue() to get the result

```typescript
const result = scanner.scan(schema).getValue();
```

`getValue()` is where deferred mutations and resolved references are applied. It clones the original schema only when changes exist. Subsequent calls return the cache.

---

## Recipes

### Collect all field paths

```typescript
const fieldPaths: string[] = [];

new JsonSchemaScanner({
  visitor: {
    enter: ({ keyword, dataPath }) => {
      if (keyword === 'properties') fieldPaths.push(dataPath);
    },
  },
}).scan(schema);

console.log(fieldPaths);
// ['/name', '/age', '/address', '/address/city']
```

### Add titles to all string fields

```typescript
import { isStringSchema } from '@winglet/json-schema/filter';

const titled = new JsonSchemaScanner({
  options: {
    mutate: ({ schema, dataPath }) => {
      if (isStringSchema(schema) && !schema.title)
        return { ...schema, title: dataPath };
    },
  },
}).scan(originalSchema).getValue();
```

### Count schema types

```typescript
import { isObjectSchema, isArraySchema, isStringSchema, isNumberSchema } from '@winglet/json-schema/filter';

interface Stats { object: number; array: number; string: number; number: number }

const ctx: Stats = { object: 0, array: 0, string: 0, number: 0 };

new JsonSchemaScanner<UnknownSchema, Stats>({
  options: { context: ctx },
  visitor: {
    enter: ({ schema }, context) => {
      if (isObjectSchema(schema))  context!.object++;
      else if (isArraySchema(schema))  context!.array++;
      else if (isStringSchema(schema)) context!.string++;
      else if (isNumberSchema(schema)) context!.number++;
    },
  },
}).scan(schema);

console.log(ctx);
```

### Resolve all internal $refs

```typescript
import { resolveReference } from '@winglet/json-schema';

const schema = {
  type: 'object',
  properties: {
    user: { $ref: '#/definitions/User' },
  },
  definitions: {
    User: { type: 'object', properties: { id: { type: 'string' } } },
  },
};

const inlined = resolveReference(schema);
// inlined.properties.user is now { type: 'object', properties: { id: { type: 'string' } } }
```

### Limit traversal depth

```typescript
// Only visit root + 2 levels deep
const scanner = new JsonSchemaScanner({
  options: { maxDepth: 2 },
  visitor: { enter: ({ depth, path }) => console.log(depth, path) },
});
scanner.scan(deepSchema);
```

### Skip definition schemas during traversal

```typescript
new JsonSchemaScanner({
  options: {
    filter: ({ path }) => !path.startsWith('#/definitions') && !path.startsWith('#/$defs'),
  },
  visitor: {
    enter: ({ schema }) => processSchema(schema),
  },
}).scan(schema);
```

### Async remote reference resolution

```typescript
import { JsonSchemaScannerAsync } from '@winglet/json-schema/async-scanner';

const scanner = new JsonSchemaScannerAsync({
  options: {
    resolveReference: async (ref) => {
      const response = await fetch(ref);
      return response.json();
    },
  },
  visitor: {
    enter: async ({ path, referenceResolved }) => {
      if (referenceResolved) await logResolution(path);
    },
  },
});

const result = await scanner.scan(schemaWithRemoteRefs).then(s => s.getValue());
```

### Re-use scanner instance

`scan()` resets internal state on each call. You can re-use the same scanner instance safely:

```typescript
const scanner = new JsonSchemaScanner({ visitor: myVisitor });
const result1 = scanner.scan(schema1).getValue();
const result2 = scanner.scan(schema2).getValue();
```

---

## Type Guards — Quick Reference

```typescript
// Union (nullable + non-nullable) — use these in most cases
isObjectSchema(s)   // { type: 'object' }  or  { type: ['object', 'null'] }
isArraySchema(s)    // { type: 'array' }   or  { type: ['array', 'null'] }
isStringSchema(s)   // { type: 'string' }  or  { type: ['string', 'null'] }
isNumberSchema(s)   // { type: 'number'|'integer' }  or  nullable variants
isBooleanSchema(s)  // { type: 'boolean' } or  { type: ['boolean', 'null'] }
isNullSchema(s)     // { type: 'null' }    (pure null schema)

// Specific variants
isNonNullableObjectSchema(s)  // only { type: 'object' }
isNullableObjectSchema(s)     // only { type: ['object', 'null'] }

// Nullable check on type array
hasNullInType(s)  // true when s.type is an array containing 'null'

// Schema comparison
isIdenticalSchemaType(a, b)   // exact type equality, nullable-aware
isCompatibleSchemaType(a, b)  // loose — number/integer compatible, nullable ignored
```

---

## TypeScript Utility Types

```typescript
// Infer schema type from a value type
type MySchema = InferJsonSchema<string>;         // NonNullableStringSchema
type NullableSchema = InferJsonSchema<string | null>; // NullableStringSchema

// Infer value type from a schema type
type Val = InferValueType<{ type: 'string' }>;            // string
type NullableVal = InferValueType<{ type: ['string', 'null'] }>; // string | null

// Generic schema types
const schema: JsonSchema = { type: 'object', properties: {} };
const objectSchema: ObjectSchema = { type: 'object', properties: {} };
const ref: RefSchema = { $ref: '#/definitions/Foo' };
```

---

## Traversal Order Within a Node

For a given schema node, children are visited in this order:

1. `$defs` entries
2. `definitions` entries
3. `additionalProperties` (when it is a schema object)
4. `not`, `if`, `then`, `else`
5. `allOf`, `anyOf`, `oneOf` items (each sub-array in index order)
6. `prefixItems` items (in index order)
7. `items`
8. `properties` entries

This order is stable and deterministic across all runs.

---

## Circular Reference Behavior

When the same `$ref` path is encountered during traversal of the resolved schema's subtree, the scanner:
1. Sets `entry.hasReference = true` on the repeated node.
2. Skips `ChildEntries` — no infinite loop.
3. Calls `exit` normally.
4. Removes the path from the visited set when the original resolved node exits (allowing the same ref in a different branch).

You can detect circular refs in your `exit` visitor:
```typescript
exit: ({ hasReference, schema }) => {
  if (hasReference && schema.$ref) console.warn('Circular ref skipped:', schema.$ref);
}
```

---

## Compatibility

- Node.js 16.11.0+
- Modern browsers: Chrome 94+, Firefox 93+, Safari 15+
- ES2022 syntax; use Babel/SWC for legacy targets
- Both ESM (`import`) and CJS (`require`) builds provided
