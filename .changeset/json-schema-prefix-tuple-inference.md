---
"@winglet/json-schema": major
---

Breaking change: `InferValueType` infers finite literal `prefixItems` as optional-position tuples instead of an unrestricted array. Positions follow their schemas; `items: false` closes the tuple, a schema supplies a typed rest, and omitted or `true` items allow an unrestricted rest. `minItems` does not make positions required. Code that assigns arbitrary positions or extra elements may now fail to compile; use schema-compatible values or declare an explicit application value type when a wider shape is intentional.

Before:

```ts
import type { InferValueType } from '@winglet/json-schema';

const schema = {
  type: 'array',
  prefixItems: [{ type: 'string' }, { type: 'number' }],
  items: false,
} as const;
type Value = InferValueType<typeof schema>;
const value: Value = [123, 'text', true];
```

After:

```ts
import type { InferValueType } from '@winglet/json-schema';

const schema = {
  type: 'array',
  prefixItems: [{ type: 'string' }, { type: 'number' }],
  items: false,
} as const;
type Value = InferValueType<typeof schema>;
const value: Value = ['text', 123];
// Empty and shorter prefixes remain valid: [] and ['text'].
```

Widened prefix arrays and homogeneous `items` inference retain their existing behavior.
