---
"@canard/schema-form-ajv8-plugin": major
---

Breaking change: form roots are private to the plugin. Compile form roots and guards on plugin-owned AJV compilers so application schemas, aliases, caches, errors and generated code remain untouched. New compilations read current registered schemas and extensions, and removed or replaced references cannot be reused from an older compiler. Compilation reflects the current contents of the root object, including in-place changes, while earlier functions keep their own snapshots.

Form roots are no longer exposed by `ajv.getSchema(formRoot.$id)` on the application instance. Register an application-owned schema explicitly with `ajv.addSchema` when it must be available through that API. Previously returned form validators and guards keep their compiled snapshot after release or application schema changes.

Before:

```ts
validator.compile(formRoot);
const native = ajv.getSchema(formRoot.$id);
```

After:

```ts
const validate = validator.compile(formRoot);
// Register an application-owned copy only when native lookup is required.
ajv.addSchema(JSON.parse(JSON.stringify(formRoot)));
const native = ajv.getSchema(formRoot.$id);
```
