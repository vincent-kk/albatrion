---
"@canard/schema-form": major
---

Breaking change: a validator is an object instead of a function. The `validatorFactory` prop and the `ValidatorFactory` type take `{ compile, compileGuard, release?, dialect? }`, and a plugin's `validator` must provide `compileGuard`. The form uses guards to decide conditional branches synchronously, so a validator without `compileGuard` is incomplete.

- `compile(jsonSchema)` returns the validate function, as the 0.x factory function did.
- `compileGuard(root, pointer)` returns a synchronous predicate `(value) => boolean` for the schema at `pointer` inside `root`.
- `release(root)` is optional and frees what the validator holds for a root schema the form no longer uses.
- `dialect` is optional and names the JSON Schema dialect the validator implements.

Before:

```ts
const validatorFactory: ValidatorFactory = (jsonSchema) =>
  createValidateFunction(jsonSchema);
```

After:

```ts
const validatorFactory: ValidatorFactory = {
  compile: (jsonSchema) => createValidateFunction(jsonSchema),
  compileGuard: (root, pointer) => createGuard(root, pointer),
};
```

The AJV plugins already provide the complete object. Create the validator once and keep its reference stable: replacing `validatorFactory` after mount rebuilds the form's nodes and inputs.
