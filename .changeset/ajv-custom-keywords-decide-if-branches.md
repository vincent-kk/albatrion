---
"@canard/schema-form-ajv6-plugin": minor
"@canard/schema-form-ajv7-plugin": minor
"@canard/schema-form-ajv8-plugin": minor
---

Custom keywords and formats on the AJV instance you pass to `createValidator(ajv)` or bind with `plugin.validator.bind(ajv)` now also decide `if`/`then`/`else` conditions and choose a `oneOf` or `anyOf` branch written with `if` and `else: false`. In 0.x a condition only compared `const` and `enum` values, so a custom keyword inside `if` did not change which fields the form showed.

```tsx
const ajv = new Ajv({ strict: false });
ajv.addKeyword({
  keyword: 'isEven',
  schemaType: 'boolean',
  validate: (schema: boolean, data: unknown) =>
    typeof data === 'number' && (data % 2 === 0) === schema,
});
const validator = createValidator(ajv); // once, at module scope

const schema = {
  type: 'object',
  properties: { n: { type: 'number' } },
  if: { type: 'object', properties: { n: { isEven: true } }, required: ['n'] },
  then: { properties: { evenField: { type: 'string' } } },
  else: { properties: { oddField: { type: 'string' } } },
};

// evenField while n is even, oddField while n is odd
<Form jsonSchema={schema} validatorFactory={validator} />;
```

With AJV 6, register the keyword as `ajv.addKeyword('isEven', { validate })`. A `oneOf` or `anyOf` branch without `if`, `controls.active` or `controls.discriminator` is not chosen by its content: all its fields stay in the form. When the instance cannot compile a condition, for example a strict instance that lacks a keyword the condition uses, neither `then` nor `else` applies and `onError` receives a `GUARD_FAILED` record.
