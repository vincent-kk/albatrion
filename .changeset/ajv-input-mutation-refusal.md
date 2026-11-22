---
"@canard/schema-form-ajv6-plugin": major
"@canard/schema-form-ajv7-plugin": major
"@canard/schema-form-ajv8-plugin": major
---

Breaking change: `createValidatorFactory` immediately throws `ValidatorBindRefusedError` when AJV has `coerceTypes`, `useDefaults`, or `removeAdditional` enabled. Enabling one after binding or creating a factory also makes the next validation or guard compile throw, including keyed validation in AJV 6 and 7. Use a separate native AJV instance when you intend to modify data.

Before:

```typescript
const compile = createValidatorFactory(new Ajv({ coerceTypes: true }));
```

After:

```typescript
const compile = createValidatorFactory(new Ajv({ coerceTypes: false }));
```
