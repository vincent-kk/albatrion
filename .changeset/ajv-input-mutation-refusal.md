---
"@canard/schema-form-ajv6-plugin": major
"@canard/schema-form-ajv7-plugin": major
"@canard/schema-form-ajv8-plugin": major
---

Breaking change: the plugins refuse an AJV instance that modifies validated data. `plugin.validator.bind`, `createValidatorFactory` and `createValidator` throw immediately when the instance has `coerceTypes`, `useDefaults` or `removeAdditional` enabled; previously such an instance was accepted. The error has the name `ValidatorBindRefusedError` and the code `FormErrorCode.ValidatorBindRefused`, and `details.options` lists the enabled options. Enabling one of these options after binding or creating a factory makes the next validation or guard compile throw the same error, including keyed validation in AJV 6 and 7. Use a separate AJV instance for code that is meant to modify data.

Before:

```typescript
const ajv = new Ajv({ coerceTypes: true });
plugin.validator.bind(ajv);
const compile = createValidatorFactory(ajv);
```

After:

```typescript
const ajv = new Ajv();
plugin.validator.bind(ajv);
const compile = createValidatorFactory(ajv);
```
