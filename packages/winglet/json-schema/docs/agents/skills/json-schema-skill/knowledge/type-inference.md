# Type decisions

Use the installed declarations for the type hierarchy and the package's `docs/en/SPECIFICATION.md` for inference and guard policy. Inference describes partial values; it does not prove that data passed JSON Schema validation.

## Keep literal information

Use as const for schema constants when you want properties, prefixes and nullable literals to participate in inference. Widened declarations retain broad fallbacks. A readonly schema declaration still infers mutable values.

## Choose partial inference or an explicit validated shape

InferValueType keeps every object property optional, even if required lists it, because it models partial values. Objects remain open unless additionalProperties:false; composition and reference constraints are not a complete static validator. If a consumer needs a required validated payload, define that payload and validate it instead of relying on inference to certify it. InferJSONSchema chooses a schema family from a value type and does not generate a properties map.

<!-- example: types -->

```typescript
import type { InferJSONSchema, InferValueType } from '@winglet/json-schema';

const schema = {
  type: 'object',
  properties: { id: { type: 'number' } },
  required: ['id'],
  additionalProperties: false,
} as const;
type Value = InferValueType<typeof schema>;
const partial: Value = {};
partial.id = 1;
const nameSchema: InferJSONSchema<string> = { type: 'string', minLength: 1 };
console.assert(nameSchema.type === 'string');
```

## Respect tuple scope

A finite prefixItems yields optional positions; items:false closes the tuple, omitted/true items adds an any[] rest, and a schema-valued items types the tail. `minItems` is not part of inference. Widened prefixes and legacy items arrays retain broad items inference. TypeScript's own recursive instantiation limits still apply.

<!-- example: tuple -->

```typescript
import type { InferValueType } from '@winglet/json-schema';

const schema = {
  type: 'array',
  prefixItems: [{ type: 'string' }, { type: 'number' }],
  items: false,
} as const;
type Pair = InferValueType<typeof schema>;
const empty: Pair = [];
const pair: Pair = ['name', 1];
pair[0] = 'changed';
console.assert(empty.length === 0 && pair[0] === 'changed');
```

## Choose guards deliberately

Use union guards unless the task distinguishes nullable-array spelling. Number guards include integer, but strict type identity does not equate those labels; compatibility does. Nullable guards and hasNullInType inspect null inside a type array, so hasNullInType does not identify a pure null schema. Comparison functions additionally normalize OpenAPI nullable:true; guards inspect type. Boolean schema nodes need a typeof check before object guards. A structural reference object need not belong to the JSONSchema union, and inference does not follow reference targets.
