---
"@canard/schema-form": major
---

Breaking change: `null` written to an object or array field whose schema does not accept `null` now stays `null` and fails validation. In 0.16.1 an object field turned that `null` into `{}` and left the field out of `getValue()`, so validation passed; an array field turned a `null` written with `setValue` into `[]` and also left it out, while an array loaded with `null` through `defaultValue` or `reset` already kept `null`. Now, whether the `null` comes from `defaultValue`, `reset`, the field's own `setValue` or a parent's `setValue`, `node.value`, the field input's `value` prop and `getValue()` all read `null`, a registered validator reports a `type` error at the field, and the form reports a `SCHEMA_FORM_WARNING.MISFIT` warning. A custom input for such a field must handle a `null` `value` before calling `value.map(…)` or `Object.keys(value)`.

If `null` is a value your data may hold, declare it in the schema; if it means "no value", clear the field with `undefined` instead.

Before:

```ts
const schema = {
  type: 'object',
  properties: {
    address: { type: 'object', properties: { city: { type: 'string' } } },
  },
};
form.setValue({ address: null }); // 0.16.1: getValue() → {}, valid
```

After:

```ts
const schema = {
  type: 'object',
  properties: {
    address: { type: ['object', 'null'], properties: { city: { type: 'string' } } },
  },
};
form.setValue({ address: null }); // getValue() → { address: null }, valid

// or keep the schema and clear the field
form.setValue({ address: undefined }); // getValue() → {}, valid
```
