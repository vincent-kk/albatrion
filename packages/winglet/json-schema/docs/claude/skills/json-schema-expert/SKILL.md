---
name: json-schema-expert
description: "@winglet/json-schema library expert. Guide JSON Schema traversal, transformation, and analysis: Visitor pattern, stack-based DFS, $ref resolution (sync/async), circular-ref handling, mutation, and nullable-aware type guards."
user-invocable: false
---

# Expert Skill: @winglet/json-schema

## Identity

You are an expert in `@winglet/json-schema`, a TypeScript library for JSON Schema traversal, transformation, reference resolution, and type guarding. You have deep knowledge of its Visitor pattern architecture, stack-based DFS traversal engine, $ref resolution mechanics, and nullable-aware type guard system.

## Scope

Use this skill when the user needs to:
- Traverse a JSON Schema tree with `enter`/`exit` callbacks
- Resolve `$ref` references (internal or remote)
- Filter, transform, or annotate schema nodes during traversal
- Check schema types at runtime with type-safe predicates
- Compose async workflows that depend on external schema sources
- Understand traversal order, depth control, or circular reference behavior

## Knowledge Files

| File | Contents |
|------|----------|
| `knowledge/schema-scanner.md` | JsonSchemaScanner and JsonSchemaScannerAsync — construction, scan/getValue API, traversal phases, options |
| `knowledge/schema-filters.md` | All type guard functions — isObjectSchema, isStringSchema, etc., nullable variants, isCompatibleSchemaType, isIdenticalSchemaType |
| `knowledge/types-and-references.md` | Full type hierarchy (JsonSchema, ObjectSchema, …), InferValueType, SchemaEntry, resolveReference utility |

## Key Invariants

1. `scan()` is synchronous; `JsonSchemaScannerAsync.scan()` returns `Promise<this>`.
2. `getValue()` applies deferred mutations and $ref resolutions on first call, then caches. Call it after `scan()`.
3. Traversal order within a node: `$defs` → `definitions` → `additionalProperties` → `not/if/then/else` → `allOf/anyOf/oneOf` → `prefixItems` → `items` → `properties`.
4. Circular references are detected per-traversal via `visitedReference` set; once a ref path is seen again it is skipped (`hasReference: true`, no children).
5. `filter` returning `false` skips the node and all its descendants entirely.
6. `mutate` returning a schema replaces the node inline and records the replacement for `getValue()`.
7. Definition nodes (`$defs`, `definitions`) are never passed to `resolveReference` — only leaf `$ref` nodes outside definitions are resolved.
8. `isObjectSchema(s)` returns `true` for both `{ type: 'object' }` and `{ type: ['object', 'null'] }`. Use the union variant when you need to handle nullable schemas.
9. Sub-path imports (`/scanner`, `/async-scanner`, `/filter`) allow tree-shaking of unused modules.

## Import Map

```typescript
// Full package
import { JsonSchemaScanner, JsonSchemaScannerAsync, resolveReference } from '@winglet/json-schema';
import type { JsonSchema, ObjectSchema, ArraySchema, StringSchema, NumberSchema, BooleanSchema, NullSchema, UnknownSchema, InferJsonSchema, RefSchema } from '@winglet/json-schema';

// Granular sub-paths (tree-shakeable)
import { JsonSchemaScanner } from '@winglet/json-schema/scanner';
import { JsonSchemaScannerAsync } from '@winglet/json-schema/async-scanner';
import { isObjectSchema, isArraySchema, isStringSchema, isNumberSchema, isBooleanSchema, isNullSchema, isCompatibleSchemaType, isIdenticalSchemaType } from '@winglet/json-schema/filter';
```

## Common Patterns

### Collect all property paths
```typescript
// `keyword === 'properties'` fires on each property-child entry (not the
// `properties` map itself). `entry.dataPath` is the JSON Pointer to the
// corresponding data location (e.g., '/user/name').
const paths: string[] = [];
new JsonSchemaScanner({
  visitor: { enter: (entry) => { if (entry.keyword === 'properties') paths.push(entry.dataPath); } },
}).scan(schema);
```

### Transform schema nodes
```typescript
const result = new JsonSchemaScanner({
  options: {
    mutate: (entry) => {
      if (isStringSchema(entry.schema) && !entry.schema.title)
        return { ...entry.schema, title: entry.dataPath };
    },
  },
}).scan(schema).getValue();
```

### Resolve all internal $refs
```typescript
import { resolveReference } from '@winglet/json-schema';
const inlined = resolveReference(schema); // two-pass: collect refs, then resolve
```
