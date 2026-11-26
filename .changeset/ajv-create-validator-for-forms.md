---
"@canard/schema-form-ajv6-plugin": major
"@canard/schema-form-ajv7-plugin": major
"@canard/schema-form-ajv8-plugin": major
---

Breaking change: the function that `createValidatorFactory(ajv)` returns can no longer be passed to the `validatorFactory` prop of `Form` or `FormProvider`, because `@canard/schema-form` 1.x takes a validator object there. Pass `createValidator(ajv)`, which returns that object.

Before:

```tsx
const validatorFactory = useMemo(() => createValidatorFactory(customAjv), []);
<Form jsonSchema={jsonSchema} validatorFactory={validatorFactory} />;
```

After:

```tsx
const validator = useMemo(() => createValidator(customAjv), []);
<Form jsonSchema={jsonSchema} validatorFactory={validator} />;
```
