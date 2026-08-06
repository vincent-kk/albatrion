# Type Inference — InferValueType and InferJsonSchema

`InferValueType<Schema>` maps a schema definition to the runtime value type it describes; `InferJsonSchema<Value>` goes the other way, from a value type to its schema interface. The rules below are the ones that surprise people — the rest follows from the declarations in `dist/*.d.ts`.

## Recursion requires `as const`

Inference into `properties` and `items` needs literal types. Without `as const` (or `satisfies`), `type: 'object'` widens to `string` and you get the unrefined fallback, not a narrowed shape. The same applies to `nullable: true`: widened to `boolean`, it infers **without** `| null`, because a static type cannot know a runtime value. That direction is deliberate — being stricter than the runtime never admits a value the consumer would reject.

## Object inference rules

**Every inferred key is optional, `required` included.** This is not an oversight. A consumer cannot rely on a required key being present at runtime — a form may drop it (an inactive `computed.active` branch, `options.omitEmpty`) — so marking it required would let `value.key` type-check and then be `undefined`. If you know the exact shape, declare it and pass it explicitly instead of inferring it.

**The result stays open.** It is intersected with `Record<string, any>` unless the schema sets `additionalProperties: false`. Open is the JSON Schema default, and the intersection is what keeps keys contributed by applicators this type does not model — `oneOf`/`anyOf` branches, `if`/`then`/`else`, `patternProperties`, `dependentSchemas`, `$ref` — from being rejected as excess properties. `additionalProperties: false` closes it, because that is what the schema asked for.

**`-readonly` is applied**, so an `as const` schema does not propagate `readonly` onto the inferred value: the schema is frozen, the value it describes is not.

## Unmodeled shapes fall back; they never narrow

| Schema                                                                  | Inferred                        |
| ----------------------------------------------------------------------- | ------------------------------- |
| `properties` keyed by plain `string` (`Dictionary<JsonSchema>`)         | `Record<string, any>`           |
| `items: false`                                                          | `any[]`                         |
| no `type` at all                                                        | `any`                           |
| `{ type: 'array' }` / `{ type: 'object' }` with no `items`/`properties` | `any[]` / `Record<string, any>` |

A multi-type array is the exception to "falls back": `{ type: ['string', 'number'] }` infers `string | number`, **not** `any`. Older documentation claimed `any` here; the primary type is now extracted from every `type` array, so the union survives. A single-member array is unwrapped the same way, matching the runtime, which normalizes `['string']` to `'string'`.

```typescript
type A = InferValueType<{ type: 'string' }>; // string
type B = InferValueType<{ type: 'integer' }>; // number
type C = InferValueType<{ type: ['string', 'null'] }>; // string | null
type D = InferValueType<{ type: ['string'] }>; // string
type E = InferValueType<{ type: ['string', 'number'] }>; // string | number
type F = InferValueType<{ type: 'string'; nullable: true }>; // string | null
type G = InferValueType<{ type: 'null' }>; // null

// Recursion — requires `as const`
type H = InferValueType<{ type: 'array'; items: { type: 'string' } }>; // string[]
type I = InferValueType<{
  type: 'object';
  properties: { id: { type: 'number' } };
  required: ['id'];
}>; // { id?: number } & Record<string, any>   ← still optional, still open

type J = InferValueType<{
  type: 'object';
  properties: { id: { type: 'number' } };
  additionalProperties: false;
}>; // { id?: number }                          ← closed
```

## The reverse direction — `InferJsonSchema`

`InferJsonSchema<Value>` maps a value type to the schema interface describing it, which is what you want when typing a schema constant against a known payload type. Nullability in the value selects the nullable schema variant; object and array values map to the generic object/array interfaces rather than a shape-specific one.

```typescript
type A = InferJsonSchema<string>; // NonNullableStringSchema
type B = InferJsonSchema<string | null>; // NullableStringSchema
type C = InferJsonSchema<number>; // NonNullableNumberSchema
type D = InferJsonSchema<boolean>; // NonNullableBooleanSchema
type E = InferJsonSchema<string[]>; // NonNullableArraySchema
type F = InferJsonSchema<{ id: string }>; // NonNullableObjectSchema
type G = InferJsonSchema<null>; // NullSchema
```

## `$ref` is structural, not a union member

`RefSchema` is **not** a member of the `JsonSchema` union, so no guard narrows to it and inference does not follow it. The scanner identifies a reference node structurally, by `typeof schema.$ref === 'string'`. Check `$ref` the same way in your own code rather than testing membership in a schema type.
