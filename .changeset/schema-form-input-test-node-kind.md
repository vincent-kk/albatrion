---
"@canard/schema-form": major
---

Breaking change: an input definition's `test`, the hint a `test` function receives and the `type` prop of a FieldInput describe the node kind instead of the schema's JSON type, and the object form of `test` reads `inputType` instead of `formType`. An integer field now has `type: 'number'` and `schemaType: 'integer'`, so a `test: { type: 'integer' }` definition no longer matches any field, and an input that branches on `type === 'integer'` must read `schemaType`. An object `test` reads only `type`, `schemaType`, `path`, `required`, `nullable`, `format` and `inputType`; any other key, including the 0.x `formType`, is ignored apart from a development-only console warning, so a definition such as `{ type: 'string', formType: 'password' }` now matches every string field. A `test: { type: 'number' }` definition, which in 0.x matched only `number` fields, now also matches integer fields; add `schemaType: 'number'` to keep the 0.x match.

Before:

```ts
const definitions: FormTypeInputDefinition[] = [
  { test: { type: 'integer' }, Component: IntegerInput },
  { test: { type: 'string', formType: 'password' }, Component: PasswordInput },
];
```

After:

```ts
const definitions: FieldInputDefinition[] = [
  { test: { schemaType: 'integer' }, Component: IntegerInput },
  { test: { type: 'string', inputType: 'password' }, Component: PasswordInput },
];
```
