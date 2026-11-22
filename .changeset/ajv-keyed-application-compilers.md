---
"@canard/schema-form-ajv6-plugin": major
"@canard/schema-form-ajv7-plugin": major
---

Breaking change: `createValidatorFactory(ajv, key)` compiles the application registration privately. It leaves the application's cache untouched, applies current schema and keyword definitions on each compile, and keeps the verdicts and issue details of existing validators. An empty string selects an explicit registration key.

A custom constructor must leave the private compiler free of bootstrap schemas. Move application schema registration out of the constructor.

Before:

```typescript
class AppAjv extends Ajv {
  constructor(options) {
    super(options);
    this.addSchema(schema, key);
  }
}
const compile = createValidatorFactory(new AppAjv(), key);
```

After:

```typescript
const ajv = new Ajv();
ajv.addSchema(schema, key);
const compile = createValidatorFactory(ajv, key);
```
