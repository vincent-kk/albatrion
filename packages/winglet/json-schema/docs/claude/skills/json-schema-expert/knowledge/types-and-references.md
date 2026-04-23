# Types and References

## Type Hierarchy

```
UnknownSchema         (base: { type?: string | string[]; [key]: any })
└── JsonSchema        (union of all typed schemas)
    ├── NonNullableNumberSchema   { type: 'number' | 'integer' }
    ├── NullableNumberSchema      { type: ['number'|'integer', 'null'] }
    ├── NonNullableStringSchema   { type: 'string' }
    ├── NullableStringSchema      { type: ['string', 'null'] }
    ├── NonNullableBooleanSchema  { type: 'boolean' }
    ├── NullableBooleanSchema     { type: ['boolean', 'null'] }
    ├── NonNullableArraySchema    { type: 'array' }
    ├── NullableArraySchema       { type: ['array', 'null'] }
    ├── NonNullableObjectSchema   { type: 'object' }
    ├── NullableObjectSchema      { type: ['object', 'null'] }
    └── NullSchema                { type: 'null' }

RefSchema             { $ref: string; type?: undefined }
```

Union alias types (exported):
- `NumberSchema` = `NonNullableNumberSchema | NullableNumberSchema`
- `StringSchema` = `NonNullableStringSchema | NullableStringSchema`
- `BooleanSchema` = `NonNullableBooleanSchema | NullableBooleanSchema`
- `ArraySchema` = `NonNullableArraySchema | NullableArraySchema`
- `ObjectSchema` = `NonNullableObjectSchema | NullableObjectSchema`

---

## BasicSchema (common fields)

All typed schemas extend `BasicSchema<Type, Options, Schema>` which provides:

```typescript
interface BasicSchema<Type, Options, Schema> extends CustomOptions<Options> {
  $defs?:    Dictionary<Schema>;      // reusable sub-schemas (JSON Schema 2019+)
  if?:       Partial<Schema>;
  then?:     Partial<Schema>;
  else?:     Partial<Schema>;
  not?:      Partial<Schema>;
  allOf?:    Partial<Schema>[];
  anyOf?:    Partial<Schema>[];
  oneOf?:    Partial<Schema>[];
  nullable?: boolean;                  // OpenAPI 3.0 nullable flag (deprecated path)
  const?:    Nullable<Type>;
  default?:  Nullable<Type>;
  enum?:     Nullable<Type>[];
}
```

`CustomOptions<Options>` adds: `format`, `active`, `visible`, `readOnly`, `disabled`, `options`, and an index signature `[alt: string]: any`.

---

## Schema-specific fields

### NumberSchema

```typescript
minimum?: number;          // inclusive minimum
maximum?: number;          // inclusive maximum
exclusiveMinimum?: number; // exclusive minimum
exclusiveMaximum?: number; // exclusive maximum
multipleOf?: number;
format?: string;           // 'float' | 'double' | custom
```

### StringSchema

```typescript
minLength?: number;
maxLength?: number;
pattern?: string;          // regex
format?: string;           // 'email' | 'date' | 'uri' | 'uuid' | custom
```

### ArraySchema

```typescript
items?:           Schema | false;      // schema for all array items
prefixItems?:     Schema[];            // tuple item schemas (JSON Schema 2020+)
contains?:        Partial<Schema>;
minItems?:        number;
maxItems?:        number;
minContains?:     number;
maxContains?:     number;
uniqueItems?:     boolean;
additionalItems?: Partial<Schema> | boolean;
```

### ObjectSchema

```typescript
properties?:           Dictionary<Schema>;            // named property schemas
patternProperties?:    Dictionary<Schema>;            // regex-keyed property schemas
additionalProperties?: boolean | Partial<Schema>;     // schema for extra properties
unevaluatedProperties?: boolean | Partial<Schema>;
propertyNames?:        Partial<StringSchema>;
dependencies?:         Dictionary<Partial<Schema> | string[]>; // deprecated
dependentRequired?:    Dictionary<string[]>;
dependentSchemas?:     Dictionary<Partial<Schema>>;
minProperties?:        number;
maxProperties?:        number;
required?:             string[];
```

---

## RefSchema

```typescript
export interface RefSchema {
  type?: undefined;
  $ref: string;           // JSON Pointer, e.g. '#/definitions/Address' or remote URL
  [alt: string]: any;
}
```

`$ref` nodes are not a member of `JsonSchema`. They are identified inside the scanner by checking `typeof entry.schema.$ref === 'string'`.

---

## InferJsonSchema

Maps a TypeScript value type to its corresponding schema interface.

```typescript
type InferJsonSchema<
  Value extends AllowedValue | unknown = any,
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> = [Value] extends [null]
  ? NullSchema<Options, Schema>
  : IsNullable<Value> extends true
    ? InferNullableSchema<Exclude<Value, null>, Options, Schema>
    : InferNonNullableSchema<Value, Options, Schema>;
```

**Examples**

```typescript
type A = InferJsonSchema<string>;         // NonNullableStringSchema
type B = InferJsonSchema<string | null>;  // NullableStringSchema
type C = InferJsonSchema<number>;         // NonNullableNumberSchema
type D = InferJsonSchema<null>;           // NullSchema
type E = InferJsonSchema<{ id: string }>; // NonNullableObjectSchema
```

---

## InferValueType

Maps a schema definition back to its runtime value type.

```typescript
export type InferValueType<
  T extends { type?: string | readonly string[] | string[] },
> = T extends { type: infer Type }
  ? HasNull<Type> extends true
    ? InferNonNullableValueType<ExtractPrimaryType<Type>> | null
    : InferNonNullableValueType<Type>
  : any;
```

**Examples**

```typescript
type A = InferValueType<{ type: 'string' }>;               // string
type B = InferValueType<{ type: ['string', 'null'] }>;     // string | null
type C = InferValueType<{ type: 'number' }>;               // number
type D = InferValueType<{ type: 'integer' }>;              // number
type E = InferValueType<{ type: 'boolean' }>;              // boolean
type F = InferValueType<{ type: 'array' }>;                // any[]
type G = InferValueType<{ type: 'object' }>;               // Record<string, any>
type H = InferValueType<{ type: 'null' }>;                 // null
type I = InferValueType<{ type: ['number', 'null'] }>;     // number | null
```

---

## SchemaEntry (traversal node)

```typescript
type SchemaEntry<Schema extends UnknownSchema = UnknownSchema> = {
  schema:             Schema;
  path:               string;    // JSON Pointer fragment — starts with '#'
  dataPath:           string;    // Data JSON Pointer — starts with '/'  or ''
  depth:              number;    // 0 at root
  hasReference?:      boolean;   // $ref found but not resolved (or circular)
  referencePath?:     string;    // original $ref value when resolved
  referenceResolved?: boolean;   // true when resolveReference succeeded
} & KeywordVariant;
```

`KeywordVariant` is a discriminated union covering all possible `keyword` / `variant` combinations:
- `{ keyword: 'allOf' | 'anyOf' | 'oneOf'; variant: number }`
- `{ keyword: 'items' | 'prefixItems'; variant?: number }`
- `{ keyword: '$defs' | 'definitions' | 'properties'; variant: string }`
- `{ keyword: 'not' | 'if' | 'then' | 'else' | 'additionalProperties' }`
- `{ keyword?: never }` (root node)

---

## resolveReference Utility

```typescript
import { resolveReference } from '@winglet/json-schema';

function resolveReference(jsonSchema: UnknownSchema): UnknownSchema | undefined
```

A **two-pass** convenience function for resolving all internal `$ref` pointers in a self-contained schema.

**Pass 1** — Collect unresolvable refs:
- Scans the schema with a visitor that records `$ref` values found in definition nodes (`hasReference: true`).
- Uses `@winglet/json/pointer` `getValue` to look up each ref inside the schema.
- Builds a `Map<refPath, resolvedSchema>`.

**Pass 2** — Inline all refs:
- Re-scans with `resolveReference` option pointing to the map from Pass 1.
- Returns the inlined schema via `getValue()`.

**When to use**
- You have a standalone schema with internal `#/definitions/...` or `#/$defs/...` refs.
- You want a fully inlined schema with no `$ref` nodes remaining.
- You do not need custom resolution logic.

For remote or custom resolution, use `JsonSchemaScanner` directly with a custom `resolveReference` option.

---

## Value Type Primitives

```typescript
export type BooleanValue   = boolean;
export type NumberValue    = number;
export type StringValue    = string;
export type ArrayValue     = any[];
export type ObjectValue    = Record<string, any>;
export type NullValue      = null;
export type UndefinedValue = undefined;
export type AnyValue       = any;

export type AllowedValue =
  | BooleanValue | NumberValue | StringValue
  | ObjectValue | ArrayValue | NullValue | UndefinedValue;
```

These primitives are used as the generic `Type` parameter in `BasicSchema<Type, ...>` to constrain `const`, `default`, and `enum` fields.

---

## OperationPhase Enum

Used internally by the scanner's state machine. Exposed as a named export for advanced use cases (e.g., custom phase assertions in tests).

```typescript
export enum OperationPhase {
  Enter        = 1 << 0,  // 1
  ChildEntries = 1 << 1,  // 2
  Reference    = 1 << 2,  // 4
  Exit         = 1 << 3,  // 8
}
```

---

## Keyword Constants

```typescript
export const $DEFS                = '$defs';
export const DEFINITIONS          = 'definitions';
export const PROPERTIES           = 'properties';
export const ADDITIONAL_PROPERTIES = 'additionalProperties';
export const ITEMS                = 'items';
export const PREFIX_ITEMS         = 'prefixItems';

export const CONDITIONAL_KEYWORDS  = ['not', 'if', 'then', 'else'] as const;
export const COMPOSITION_KEYWORDS  = ['allOf', 'anyOf', 'oneOf'] as const;
```

These constants are used internally and can be imported when building custom traversal logic that needs to match specific keywords.
