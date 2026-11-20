---
"@canard/schema-form-ajv8-plugin": major
---

Breaking change: form roots are private to the plugin. Compile form roots and guards on plugin-owned AJV compilers so application schemas, aliases, caches, errors and generated code remain untouched. New compilations read current registered schemas and extensions, and removed or replaced references cannot be reused from an older compiler. Compilation reflects the current contents of the root object, including in-place changes, while earlier functions keep their own snapshots.

Form roots are no longer exposed by `ajv.getSchema(formRoot.$id)` on the application instance. For native lookup, register an application-owned schema explicitly and compile a form root that references it; keep the application id off the form root. Previously returned form validators and guards keep their compiled snapshot after release or application schema changes.

Before:

```ts
validator.compile(formRoot);
const native = ajv.getSchema(formRoot.$id);
```

After:

```ts
const applicationSchema = formRoot;
ajv.addSchema(applicationSchema);
const validate = validator.compile({ $ref: applicationSchema.$id });
const native = ajv.getSchema(applicationSchema.$id);
```

Application schemas shared with form roots or their descendants do not keep those caller objects alive after application removal. Observation records use weak identity tokens, and private resource claims retain detached snapshots.
