# Schema Filters — Type Guards and Schema Comparison

## Overview

The `@winglet/json-schema/filter` sub-path exports a set of **runtime type guards** for JSON Schema nodes. Every guard narrows the TypeScript type of the argument and handles both non-nullable and nullable schema representations.

All filter functions accept `UnknownSchema` (i.e., any schema object) and return a `boolean`.

---

## Import

```typescript
// Granular (preferred for tree-shaking)
import {
  isObjectSchema, isNonNullableObjectSchema, isNullableObjectSchema,
  isArraySchema,  isNonNullableArraySchema,  isNullableArraySchema,
  isStringSchema, isNonNullableStringSchema, isNullableStringSchema,
  isNumberSchema, isNonNullableNumberSchema, isNullableNumberSchema,
  isBooleanSchema, isNonNullableBooleanSchema, isNullableBooleanSchema,
  isNullSchema,
  isCompatibleSchemaType,
  isIdenticalSchemaType,
  hasNullInType,
} from '@winglet/json-schema/filter';

// Or from main entry
import { isObjectSchema, /* ... */ } from '@winglet/json-schema';
```

---

## Nullable vs Non-Nullable Representation

JSON Schema 2019+ expresses nullable types as a type array:

```json
{ "type": ["string", "null"] }   // nullable string
{ "type": "string" }             // non-nullable string
```

Each base type has **three guards**:

| Guard | Matches |
|-------|---------|
| `isNonNullable<X>Schema` | `{ type: 'x' }` only |
| `isNullable<X>Schema` | `{ type: ['x', 'null'] }` or `{ type: ['null', 'x'] }` |
| `is<X>Schema` | Either — union of the two above |

In most application code, use the union variant (`isObjectSchema`, `isStringSchema`, etc.) unless you specifically need to distinguish nullable from non-nullable.

---

## Per-Type Reference

### Object Schema Guards

```typescript
isNonNullableObjectSchema(schema: UnknownSchema): schema is NonNullableObjectSchema
// true when: schema.type === 'object'

isNullableObjectSchema(schema: UnknownSchema): schema is NullableObjectSchema
// true when: schema.type is an array containing both 'object' and 'null'

isObjectSchema(schema: UnknownSchema): schema is ObjectSchema
// true when: either of the above
```

**Examples**
```typescript
isObjectSchema({ type: 'object', properties: {} })          // true
isObjectSchema({ type: ['object', 'null'] })                // true
isObjectSchema({ type: ['null', 'object'], required: [] })  // true
isObjectSchema({ type: 'array' })                           // false
```

---

### Array Schema Guards

```typescript
isNonNullableArraySchema(schema): schema is NonNullableArraySchema
// true when: schema.type === 'array'

isNullableArraySchema(schema): schema is NullableArraySchema
// true when: schema.type array contains 'array' and 'null'

isArraySchema(schema): schema is ArraySchema
```

**Examples**
```typescript
isArraySchema({ type: 'array', items: { type: 'string' } }) // true
isArraySchema({ type: ['array', 'null'] })                   // true
isArraySchema({ type: 'object' })                            // false
```

---

### String Schema Guards

```typescript
isNonNullableStringSchema(schema): schema is NonNullableStringSchema
// true when: schema.type === 'string'

isNullableStringSchema(schema): schema is NullableStringSchema
// true when: schema.type array contains 'string' and 'null'

isStringSchema(schema): schema is StringSchema
```

**Examples**
```typescript
isStringSchema({ type: 'string', minLength: 1 })  // true
isStringSchema({ type: ['string', 'null'] })       // true
isStringSchema({ type: 'number' })                 // false
```

---

### Number Schema Guards

```typescript
isNonNullableNumberSchema(schema): schema is NonNullableNumberSchema
// true when: schema.type === 'number' OR schema.type === 'integer'

isNullableNumberSchema(schema): schema is NullableNumberSchema
// true when: schema.type array contains ('number' or 'integer') and 'null'

isNumberSchema(schema): schema is NumberSchema
```

**Examples**
```typescript
isNumberSchema({ type: 'number' })                  // true
isNumberSchema({ type: 'integer', minimum: 0 })     // true
isNumberSchema({ type: ['number', 'null'] })        // true
isNumberSchema({ type: 'string' })                  // false
```

---

### Boolean Schema Guards

```typescript
isNonNullableBooleanSchema(schema): schema is NonNullableBooleanSchema
// true when: schema.type === 'boolean'

isNullableBooleanSchema(schema): schema is NullableBooleanSchema
// true when: schema.type array contains 'boolean' and 'null'

isBooleanSchema(schema): schema is BooleanSchema
```

---

### Null Schema Guard

```typescript
isNullSchema(schema: UnknownSchema): schema is NullSchema
// true when: schema.type === 'null'
```

Note: this matches `{ type: 'null' }` (pure null schema), not nullable variants. To check if a schema _may_ be null, use `hasNullInType`.

---

### hasNullInType Utility

```typescript
hasNullInType(schema: UnknownSchema): boolean
```

Returns `true` when `schema.type` is an array containing `'null'`. Does NOT return `true` for `{ type: 'null' }`.

```typescript
hasNullInType({ type: ['string', 'null'] })  // true
hasNullInType({ type: ['null', 'number'] })  // true
hasNullInType({ type: 'null' })              // false — single string, not array
hasNullInType({ type: 'string' })            // false
```

---

## Schema Comparison Functions

### isIdenticalSchemaType

```typescript
isIdenticalSchemaType(left: UnknownSchema, right: UnknownSchema): boolean
```

Returns `true` when both schemas represent **exactly the same type**, with nullable equivalence across representations.

Supports:
- JSON Schema `type: ['string', 'null']` array format
- OpenAPI 3.0 `nullable: true` property

Rules:
- `{ type: 'string' }` === `{ type: 'string' }` → `true`
- `{ type: ['string', 'null'] }` === `{ type: 'string', nullable: true }` → `true`
- `{ type: ['string'] }` === `{ type: 'string' }` → `true` (single-element array)
- `{ type: 'number' }` === `{ type: 'integer' }` → `false` (number ≠ integer here)
- Either schema missing `type` → `false`

```typescript
isIdenticalSchemaType({ type: 'string' }, { type: 'string' })              // true
isIdenticalSchemaType({ type: ['string', 'null'] }, { type: 'string', nullable: true }) // true
isIdenticalSchemaType({ type: ['string'] }, { type: 'string' })            // true
isIdenticalSchemaType({ type: 'number' }, { type: 'integer' })             // false
```

---

### isCompatibleSchemaType

```typescript
isCompatibleSchemaType(left: UnknownSchema, right: UnknownSchema): boolean
```

Returns `true` when both schemas have **compatible types** — a looser check than `isIdenticalSchemaType`.

Additional compatibility rules beyond identical:
- `number` and `integer` are **compatible** with each other
- Nullable differences are ignored: `['string', 'null']` is compatible with `'string'`
- Array element order does not affect compatibility
- Empty type arrays (`[]`) are **not** compatible with anything including themselves
- `['null']` is compatible with `['null']` only

```typescript
isCompatibleSchemaType({ type: 'number' }, { type: 'integer' })               // true
isCompatibleSchemaType({ type: ['string', 'null'] }, { type: 'string' })      // true
isCompatibleSchemaType({ type: ['string'] }, { type: 'string' })              // true
isCompatibleSchemaType({ type: ['null'] }, { type: ['null'] })                // true

isCompatibleSchemaType({ type: [] }, { type: [] })                            // false
isCompatibleSchemaType({ type: ['string', 'number'] }, { type: 'string' })   // false
isCompatibleSchemaType({ type: 'string' }, { type: 'boolean' })              // false
```

The function is **symmetric**: `isCompatibleSchemaType(a, b) === isCompatibleSchemaType(b, a)`.

---

## Decision Guide

| Goal | Use |
|------|-----|
| Check type at runtime, handle nullable automatically | `isObjectSchema`, `isStringSchema`, etc. |
| Distinguish `{ type: 'object' }` from `{ type: ['object', 'null'] }` | `isNonNullableObjectSchema` / `isNullableObjectSchema` |
| Check if schema's type array contains 'null' | `hasNullInType` |
| Strict type equality, nullable-aware | `isIdenticalSchemaType` |
| Loose type compatibility (number/integer, nullable ignored) | `isCompatibleSchemaType` |

---

## Usage Inside Scanner Visitors

Type guards integrate naturally with scanner callbacks:

```typescript
import { JsonSchemaScanner } from '@winglet/json-schema/scanner';
import { isStringSchema, isObjectSchema, isArraySchema } from '@winglet/json-schema/filter';

const scanner = new JsonSchemaScanner({
  visitor: {
    enter: ({ schema, path }) => {
      if (isObjectSchema(schema)) {
        // schema is narrowed to ObjectSchema — .properties is typed
        console.log('object at', path, 'required:', schema.required);
      } else if (isArraySchema(schema)) {
        // schema is narrowed to ArraySchema — .items is typed
        console.log('array at', path, 'minItems:', schema.minItems);
      } else if (isStringSchema(schema)) {
        // schema is narrowed to StringSchema — .pattern is typed
        console.log('string at', path, 'pattern:', schema.pattern);
      }
    },
  },
});
```

After narrowing with a type guard, TypeScript knows the exact schema interface including all constraint properties (`minimum`, `maxLength`, `properties`, `items`, etc.).
