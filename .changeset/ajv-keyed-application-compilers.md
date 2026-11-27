---
"@canard/schema-form-ajv6-plugin": minor
"@canard/schema-form-ajv7-plugin": minor
---

`createValidatorFactory(ajv, key)` accepts an optional registration key. With a key, each validator it creates uses the schema registered on `ajv` under that key, such as with `addSchema(schema, key)`, and ignores the schema passed to the returned function. The plugin compiles that registration privately on every call: your instance stays unchanged, the compile uses the current schema, keyword and format definitions, and validators created earlier keep their verdicts and issue details. An empty string is a key, not the absence of one. Compiling throws when no schema is registered under the key.

```typescript
const ajv = new Ajv();
ajv.addSchema(schema, 'order');
const compile = createValidatorFactory(ajv, 'order');
```
