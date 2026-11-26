---
"@canard/schema-form-ajv6-plugin": major
"@canard/schema-form-ajv7-plugin": major
"@canard/schema-form-ajv8-plugin": major
---

Breaking change: compiling a form root no longer registers the root's `$id` or other schema addresses on the AJV instance you pass to `plugin.validator.bind` or `createValidatorFactory`. The plugin compiles each root on a private copy of that instance, so neither `getSchema` on your instance nor another schema's `$ref` finds a form root by its address. Register any address that application code or another root needs on your AJV instance. In AJV 7, refer to a location in an unnamed application schema with its registration key plus a JSON Pointer fragment, such as `key#/definitions/name`.

Before:

```typescript
plugin.validator.bind(appAjv);
// A form renders with `schema`.
appAjv.getSchema(schema.$id);
```

After:

```typescript
appAjv.addSchema(schema);
plugin.validator.bind(appAjv);
// A form renders with `schema`.
appAjv.getSchema(schema.$id);
```
