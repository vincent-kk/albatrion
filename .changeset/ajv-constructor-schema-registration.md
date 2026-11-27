---
"@canard/schema-form-ajv6-plugin": major
"@canard/schema-form-ajv7-plugin": major
"@canard/schema-form-ajv8-plugin": major
---

Breaking change: an AJV instance whose constructor registers schemas or meta-schemas can no longer validate forms. The plugins build private compilers with the constructor of the instance you pass to `plugin.validator.bind`, `createValidatorFactory` or `createValidator`, and the next validation or guard compile throws `AJV isolation compiler creation failed: constructor registers bootstrap schemas` when that constructor registers any. Register application schemas with `addSchema` or `addMetaSchema` after constructing the instance.

Before:

```typescript
class AppAjv extends Ajv {
  constructor(...args: ConstructorParameters<typeof Ajv>) {
    super(...args);
    this.addSchema(schema, key);
  }
}
plugin.validator.bind(new AppAjv());
```

After:

```typescript
const ajv = new Ajv();
ajv.addSchema(schema, key);
plugin.validator.bind(ajv);
```
