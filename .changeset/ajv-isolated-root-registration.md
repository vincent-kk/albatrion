---
"@canard/schema-form-ajv6-plugin": major
"@canard/schema-form-ajv7-plugin": major
"@canard/schema-form-ajv8-plugin": major
---

Breaking change: compiling a form root keeps its schema addresses private to the form. Register any address that application code or another root needs on the application's AJV instance.

Before:

```typescript
validator.compile(schema);
appAjv.getSchema(schema.$id);
```

After:

```typescript
appAjv.addSchema(schema);
validator.compile(schema);
appAjv.getSchema(schema.$id);
```
