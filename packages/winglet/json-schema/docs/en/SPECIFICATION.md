# @winglet/json-schema — Specification

**Version:** 0.10.0
**License:** MIT

---

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Architecture — Visitor Pattern](#architecture--visitor-pattern)
5. [JsonSchemaScanner API](#jsonschemaScanner-api)
6. [JsonSchemaScannerAsync API](#jsonschemascannerasync-api)
7. [Schema Filters](#schema-filters)
8. [Type Definitions](#type-definitions)
9. [resolveReference Utility](#resolvereference-utility)
10. [Usage Patterns](#usage-patterns)
11. [Compatibility](#compatibility)

---

## Overview

`@winglet/json-schema` is a TypeScript library for JSON Schema manipulation. It provides:

- **Schema Traversal** — depth-first traversal of any JSON Schema tree with enter/exit callbacks
- **$ref Resolution** — synchronous and asynchronous resolution of JSON Schema `$ref` pointers
- **Schema Filtering** — runtime type guards for all JSON Schema types, including nullable variants
- **Schema Transformation** — mutate schema nodes during traversal with automatic result assembly
- **Circular Reference Detection** — stack-based cycle prevention for self-referential schemas

The library is tree-shakeable via four sub-path exports and ships both ESM and CJS builds.

---

## Installation

```bash
# yarn (recommended for this monorepo)
yarn add @winglet/json-schema

# npm
npm install @winglet/json-schema
```

### Sub-path Imports

```typescript
// All exports
import { JsonSchemaScanner, isObjectSchema, resolveReference } from '@winglet/json-schema';

// Sync scanner only
import { JsonSchemaScanner } from '@winglet/json-schema/scanner';

// Async scanner only
import { JsonSchemaScannerAsync } from '@winglet/json-schema/async-scanner';

// Type guard functions only
import { isObjectSchema, isStringSchema, isCompatibleSchemaType } from '@winglet/json-schema/filter';
```

Use sub-path imports to reduce bundle size when you only need part of the library.

---

## Quick Start

### Traverse a schema and collect field paths

```typescript
import { JsonSchemaScanner } from '@winglet/json-schema/scanner';

const schema = {
  type: 'object',
  properties: {
    name:    { type: 'string', minLength: 1 },
    age:     { type: 'number', minimum: 0 },
    address: {
      type: 'object',
      properties: {
        city:  { type: 'string' },
        zip:   { type: 'string' },
      },
    },
  },
  required: ['name'],
};

const fieldPaths: string[] = [];

new JsonSchemaScanner({
  visitor: {
    enter: ({ keyword, dataPath }) => {
      if (keyword === 'properties') fieldPaths.push(dataPath);
    },
  },
}).scan(schema);

console.log(fieldPaths);
// ['/name', '/age', '/address', '/address/city', '/address/zip']
```

### Check schema types at runtime

```typescript
import { isObjectSchema, isStringSchema, isArraySchema } from '@winglet/json-schema/filter';

const s = { type: ['string', 'null'], minLength: 1 };

if (isStringSchema(s)) {
  // s is narrowed to StringSchema
  console.log(s.minLength); // 1
}
```

---

## Architecture — Visitor Pattern

`JsonSchemaScanner` implements a **non-recursive, stack-based DFS** traversal engine. Instead of calling itself recursively, it maintains an explicit `Entry[]` stack and advances each entry through a state machine with four phases.

```
Schema tree node lifecycle:
  Push to stack
       │
  ┌────▼─────┐
  │  Enter   │  ← filter() check, mutate(), visitor.enter()
  └────┬─────┘
       │
  ┌────▼─────────┐
  │  Reference   │  ← detect $ref, call resolveReference(), circular check
  └────┬─────────┘
       │
  ┌────▼──────────────┐
  │  ChildEntries     │  ← maxDepth check, push children to stack
  └────┬──────────────┘
       │
  ┌────▼─────┐
  │   Exit   │  ← visitor.exit(), cleanup circular ref tracking
  └────┬─────┘
       │
  Pop from stack
```

**Key design properties:**

- **Stack-safe** — handles arbitrarily deep schemas without stack overflow
- **Lazy resolution** — `$ref` nodes are resolved only when encountered
- **Deferred mutations** — `mutate()` results are collected and applied by `getValue()` via a single deep clone
- **Copy-on-write** — the original schema is never modified during traversal
- **Per-scan isolation** — each `scan()` call resets all internal state

### Child discovery order

Within any schema node, children are discovered and visited in this fixed order:

`$defs` → `definitions` → `additionalProperties` → `not/if/then/else` → `allOf/anyOf/oneOf` → `prefixItems` → `items` → `properties`

---

## JsonSchemaScanner API

### Constructor

```typescript
new JsonSchemaScanner<Schema extends UnknownSchema = UnknownSchema, ContextType = void>(
  props?: {
    visitor?: SchemaVisitor<Schema, ContextType>;
    options?: JsonScannerOptions<Schema, ContextType>;
  }
)
```

### SchemaVisitor

```typescript
interface SchemaVisitor<Schema, ContextType> {
  enter?: (entry: SchemaEntry<Schema>, context?: ContextType) => void;
  exit?:  (entry: SchemaEntry<Schema>, context?: ContextType) => void;
}
```

- `enter` — called when first visiting a node, before its children are pushed
- `exit` — called after all descendants of the node have been processed

### JsonScannerOptions

| Option | Type | Description |
|--------|------|-------------|
| `filter` | `(entry, context?) => boolean` | Return `false` to skip node and all descendants |
| `mutate` | `(entry, context?) => Schema \| void` | Return new schema to replace node; applied by `getValue()` |
| `resolveReference` | `(ref, entry, context?) => Schema \| undefined` | Resolve a `$ref` pointer to a schema object |
| `maxDepth` | `number` | Maximum traversal depth (root = depth 0) |
| `context` | `ContextType` | Shared mutable context passed to all callbacks |

### scan(schema)

```typescript
scan(schema: Schema): this
```

Starts traversal from the root schema node. Resets all internal state before traversal. Returns `this` for method chaining.

### getValue()

```typescript
getValue<OutputSchema extends UnknownSchema = Schema>(): OutputSchema | undefined
```

Returns the processed schema after traversal:
- Returns `undefined` if called before `scan()`
- Returns original schema reference when no mutations or resolved references exist
- Returns a deep-cloned schema with all mutations and inlined references applied otherwise
- Caches the result; subsequent calls return the same object

### SchemaEntry

```typescript
type SchemaEntry<Schema> = {
  schema:             Schema;     // current schema node
  path:               string;     // JSON Pointer: "#/properties/name"
  dataPath:           string;     // data path: "/name"
  depth:              number;     // 0 at root
  hasReference?:      boolean;    // true: $ref found but not resolved
  referencePath?:     string;     // original $ref value when resolved
  referenceResolved?: boolean;    // true: resolveReference() succeeded
  keyword?:           string;     // structural keyword producing this entry
  variant?:           string | number; // property name or array index
}
```

**keyword values:** `'properties'`, `'$defs'`, `'definitions'`, `'items'`, `'prefixItems'`, `'additionalProperties'`, `'not'`, `'if'`, `'then'`, `'else'`, `'allOf'`, `'anyOf'`, `'oneOf'`

### Circular Reference Detection

The scanner tracks resolved `$ref` paths in a `Set<string>` per `scan()` call:

1. When a `$ref` is resolved, its path is added to the set.
2. If the same path is encountered again during traversal of the resolved schema's subtree, the node is marked `hasReference: true` and children are skipped.
3. When the original resolved node exits, the path is removed — allowing the same `$ref` in a different branch.

---

## JsonSchemaScannerAsync API

`JsonSchemaScannerAsync` is a parallel implementation of the scanner with full async/await support. It shares the same architecture but all callbacks can return `Promise<void>` and `resolveReference` can return `Promise<Schema | undefined>`.

### Constructor

```typescript
new JsonSchemaScannerAsync<Schema, ContextType>(
  props?: {
    visitor?: SchemaVisitor<Schema, ContextType>;  // callbacks may be async
    options?: JsonScannerOptionsAsync<Schema, ContextType>;
  }
)
```

`JsonScannerOptionsAsync` is identical to `JsonScannerOptions` except `resolveReference` may return a `Promise`.

### scan(schema)

```typescript
async scan(schema: Schema): Promise<this>
```

Returns a `Promise` that resolves to `this` after traversal completes. Must be awaited before calling `getValue()`.

### getValue()

Identical to the sync scanner. Synchronous. Call after awaiting `scan()`.

```typescript
const scanner = new JsonSchemaScannerAsync({ /* ... */ });
const result = await scanner.scan(schema).then(s => s.getValue());
```

### Async use cases

- **Remote $ref resolution** — `fetch()` schemas from external URLs
- **Database-backed schemas** — look up schema fragments from a database
- **Async validation** — call external APIs during traversal
- **Async logging** — write to databases or message queues in visitors
- **Service mesh schemas** — resolve microservice schemas via service discovery

---

## Schema Filters

All type guards are available from `@winglet/json-schema/filter`.

### Union Guards (recommended)

Handle both nullable and non-nullable schemas:

| Function | Matches |
|----------|---------|
| `isObjectSchema(s)` | `{ type: 'object' }` or `{ type: ['object', 'null'] }` |
| `isArraySchema(s)` | `{ type: 'array' }` or `{ type: ['array', 'null'] }` |
| `isStringSchema(s)` | `{ type: 'string' }` or `{ type: ['string', 'null'] }` |
| `isNumberSchema(s)` | `{ type: 'number'\|'integer' }` or nullable variants |
| `isBooleanSchema(s)` | `{ type: 'boolean' }` or `{ type: ['boolean', 'null'] }` |
| `isNullSchema(s)` | `{ type: 'null' }` (pure null, not nullable) |

All guards narrow the TypeScript type of the argument, giving access to type-specific fields (`properties`, `items`, `pattern`, etc.).

### Specific Variant Guards

For cases where nullable vs. non-nullable distinction matters:

```typescript
isNonNullableObjectSchema(s)  // only { type: 'object' }
isNullableObjectSchema(s)     // only { type: ['object', 'null'] }

isNonNullableStringSchema(s)  // only { type: 'string' }
isNullableStringSchema(s)     // only { type: ['string', 'null'] }

// Same pattern for array, number, boolean
```

### hasNullInType

```typescript
hasNullInType(schema: UnknownSchema): boolean
```

Returns `true` when `schema.type` is an array that contains `'null'`. Does not match `{ type: 'null' }`.

```typescript
hasNullInType({ type: ['string', 'null'] })  // true
hasNullInType({ type: 'null' })              // false
```

### Schema Comparison

#### isIdenticalSchemaType

```typescript
isIdenticalSchemaType(left: UnknownSchema, right: UnknownSchema): boolean
```

Strict equality with nullable-aware comparison. Supports both JSON Schema array format and OpenAPI 3.0 `nullable: true`.

```typescript
isIdenticalSchemaType({ type: 'string' }, { type: 'string' })                         // true
isIdenticalSchemaType({ type: ['string', 'null'] }, { type: 'string', nullable: true }) // true
isIdenticalSchemaType({ type: 'number' }, { type: 'integer' })                         // false
```

#### isCompatibleSchemaType

```typescript
isCompatibleSchemaType(left: UnknownSchema, right: UnknownSchema): boolean
```

Looser check. `number` and `integer` are treated as compatible. Nullable differences are ignored.

```typescript
isCompatibleSchemaType({ type: 'number' }, { type: 'integer' })           // true
isCompatibleSchemaType({ type: ['string', 'null'] }, { type: 'string' }) // true
isCompatibleSchemaType({ type: [] }, { type: [] })                        // false (empty array)
```

---

## Type Definitions

### Core Schema Types

```typescript
// Base type — any schema object
type UnknownSchema = { type?: string | Readonly<string[]>; [key: string]: any }

// Full JSON Schema union
type JsonSchema<Options = object> =
  | NonNullableNumberSchema | NullableNumberSchema
  | NonNullableStringSchema | NullableStringSchema
  | NonNullableBooleanSchema | NullableBooleanSchema
  | NonNullableArraySchema | NullableArraySchema
  | NonNullableObjectSchema | NullableObjectSchema
  | NullSchema

// $ref node
interface RefSchema {
  type?: undefined;
  $ref: string;
}
```

### Schema Generic Parameter

All schema types accept two generic parameters:

```typescript
ObjectSchema<Options extends Dictionary = object, Schema extends UnknownSchema = JsonSchema>
```

- `Options` — shape of the `schema.options` extension field
- `Schema` — recursive self-reference for nested schemas

### InferJsonSchema

Maps a TypeScript value type to the corresponding schema interface:

```typescript
type InferJsonSchema<Value, Options = object, Schema = JsonSchema>

// Examples
InferJsonSchema<string>          // NonNullableStringSchema
InferJsonSchema<string | null>   // NullableStringSchema
InferJsonSchema<null>            // NullSchema
InferJsonSchema<number[]>        // NonNullableArraySchema
```

### InferValueType

Maps a schema type definition to its runtime value type:

```typescript
type InferValueType<T extends { type?: string | readonly string[] }>

// Examples
InferValueType<{ type: 'string' }>             // string
InferValueType<{ type: ['string', 'null'] }>   // string | null
InferValueType<{ type: 'integer' }>            // number
InferValueType<{ type: 'array' }>              // any[]
InferValueType<{ type: 'object' }>             // Record<string, any>
```

### Common BasicSchema Fields

All typed schemas include these common fields inherited from `BasicSchema`:

| Field | Type | Description |
|-------|------|-------------|
| `$defs` | `Dictionary<Schema>` | Reusable schema definitions |
| `if/then/else` | `Partial<Schema>` | Conditional schemas |
| `not` | `Partial<Schema>` | Negation schema |
| `allOf/anyOf/oneOf` | `Partial<Schema>[]` | Composition schemas |
| `const` | `Nullable<Type>` | Constant value constraint |
| `default` | `Nullable<Type>` | Default value |
| `enum` | `Nullable<Type>[]` | Allowed values |
| `nullable` | `boolean` | OpenAPI 3.0 nullable flag |
| `readOnly` | `boolean` | Read-only hint |
| `disabled` | `boolean` | Disabled hint |
| `options` | `Options` | Custom extension options |

---

## resolveReference Utility

```typescript
import { resolveReference } from '@winglet/json-schema';

function resolveReference(jsonSchema: UnknownSchema): UnknownSchema | undefined
```

A convenience utility for resolving all internal `$ref` pointers in a self-contained schema (one that defines all its references in `$defs` or `definitions`).

**How it works (two passes):**

1. Scans the schema to find all unresolved `$ref` nodes. Uses `@winglet/json` JSON Pointer `getValue` to look up each ref inside the schema itself. Builds a `Map<refPath, resolvedSchema>`.
2. Re-scans with the map as the `resolveReference` option to inline all refs. Returns the processed schema via `getValue()`.

**When to use:**

- Schema is self-contained (all `$ref` values point to `#/definitions/...` or `#/$defs/...`)
- You want a fully inlined schema with no `$ref` remaining
- No custom resolution logic needed

**For custom resolution**, use `JsonSchemaScanner` directly:

```typescript
const scanner = new JsonSchemaScanner({
  options: {
    resolveReference: (ref, entry, context) => myCustomResolver(ref),
  },
});
const inlined = scanner.scan(schema).getValue();
```

---

## Usage Patterns

### Pattern 1: Schema Analysis

Walk the schema and build a report without modifying anything.

```typescript
interface Report {
  totalFields: number;
  requiredFields: string[];
  optionalFields: string[];
  nullable: string[];
}

const report: Report = { totalFields: 0, requiredFields: [], optionalFields: [], nullable: [] };

new JsonSchemaScanner<UnknownSchema, Report>({
  options: { context: report },
  visitor: {
    enter: ({ schema, keyword, dataPath, depth }, ctx) => {
      if (keyword !== 'properties' || depth === 0) return;
      ctx!.totalFields++;
      if (hasNullInType(schema)) ctx!.nullable.push(dataPath);

      const parent = /* track parent required array */ [];
      const fieldName = dataPath.split('/').pop()!;
      if (parent.includes(fieldName)) ctx!.requiredFields.push(dataPath);
      else ctx!.optionalFields.push(dataPath);
    },
  },
}).scan(schema);
```

### Pattern 2: Schema Transformation

Enrich schemas with additional metadata during traversal.

```typescript
import { isStringSchema, isNumberSchema } from '@winglet/json-schema/filter';

const enriched = new JsonSchemaScanner({
  options: {
    mutate: ({ schema, dataPath }) => {
      if (isStringSchema(schema) && !schema.title)
        return { ...schema, title: dataPath.split('/').pop() };
      if (isNumberSchema(schema) && schema.minimum === undefined)
        return { ...schema, minimum: 0 };
    },
  },
}).scan(schema).getValue();
```

### Pattern 3: $ref Inlining with Custom Resolver

Resolve references from an external registry.

```typescript
const registry: Record<string, UnknownSchema> = {
  '#/definitions/Address': { type: 'object', properties: { city: { type: 'string' } } },
};

const inlined = new JsonSchemaScanner({
  options: {
    resolveReference: (ref) => registry[ref],
  },
}).scan(schema).getValue();
```

### Pattern 4: Async Schema Composition

Build a composite schema by fetching remote schemas during traversal.

```typescript
import { JsonSchemaScannerAsync } from '@winglet/json-schema/async-scanner';

const schemaCache = new Map<string, UnknownSchema>();

const scanner = new JsonSchemaScannerAsync({
  options: {
    resolveReference: async (ref) => {
      if (schemaCache.has(ref)) return schemaCache.get(ref)!;
      const schema = await fetch(ref).then(r => r.json());
      schemaCache.set(ref, schema);
      return schema;
    },
  },
});

const composed = await scanner.scan(rootSchema).then(s => s.getValue());
```

### Pattern 5: Conditional Traversal

Use `filter` to skip entire subtrees based on schema properties.

```typescript
const scanner = new JsonSchemaScanner({
  options: {
    // Skip read-only fields and their descendants
    filter: ({ schema }) => !schema.readOnly,
  },
  visitor: {
    enter: ({ path }) => console.log('visiting', path),
  },
});
```

### Pattern 6: Type-Safe Schema Building

Use `InferJsonSchema` to write schemas with compile-time type checking.

```typescript
import type { InferJsonSchema } from '@winglet/json-schema';

interface UserFormOptions {
  placeholder?: string;
  autocomplete?: string;
}

type UserSchema = InferJsonSchema<{ name: string; age: number }, UserFormOptions>;

const userSchema: InferJsonSchema<string, UserFormOptions> = {
  type: 'string',
  minLength: 1,
  options: { placeholder: 'Enter name', autocomplete: 'name' },
};
```

---

## Compatibility

| Environment | Minimum Version |
|-------------|-----------------|
| Node.js | 16.11.0 |
| Chrome | 94 |
| Firefox | 93 |
| Safari | 15 |

Both ESM (`import`) and CommonJS (`require`) builds are included. For legacy environments, use Babel or SWC to transpile ES2022 syntax.

**Dependencies:**
- `@winglet/common-utils` — object cloning, utility functions
- `@winglet/json` — JSON Pointer operations (`getValue`, `setValue`, `escapeSegment`)
