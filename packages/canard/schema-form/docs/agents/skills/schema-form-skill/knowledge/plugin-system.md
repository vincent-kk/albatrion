# Plugin System

Plugins supply the pieces the core does not ship: UI component sets and validators. Register at app bootstrap using the [registration and conflict rules](https://vincent-kk.github.io/albatrion/docs/canard/schema-form/quick-start#registration-rules).

Each plugin package exports its plugin as `plugin`; import it under a name of your choice:

```typescript
import { plugin as ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';
import { plugin as antd5Plugin } from '@canard/schema-form-antd5-plugin';
```

Import `registerPlugin` from `@canard/schema-form`, then register the chosen plugins as described in the registration rules:

```typescript
registerPlugin(antd5Plugin);
registerPlugin(ajvValidatorPlugin);
```

Available plugins — validators: `@canard/schema-form-ajv8-plugin`, `-ajv7-`, `-ajv6-`; UI: `@canard/schema-form-antd5-plugin`, `-antd6-`, `-antd-mobile-`, `-mui-`.

## SchemaFormPlugin Shape

Every property of the exported `SchemaFormPlugin` type is optional, so a plugin customizes only what it needs.

- For overlapping slots and repeated registrations, follow the [registration rules](https://vincent-kk.github.io/albatrion/docs/canard/schema-form/quick-start#registration-rules).
- Plugin-provided `fieldInputDefinitions` sit at the BOTTOM of the resolution priority — `Form`/`FormProvider` props always override them (see SKILL.md's priority list).
- A subtree can override plugin pieces locally with `FormProvider` instead of globally. It accepts `fieldInputDefinitions`, `FieldRenderer`, `FormLabelRenderer`, `FormInputRenderer`, `FormErrorRenderer`, `formatError` and `validatorFactory`, which correspond to plugin members, plus `errorVisibility`, `validationMode` and `context`, which do not.

`FormProvider` has no `plugin` prop. Pass the members explicitly, mapping `validator` to `validatorFactory`. Reuse the exported `ajvValidatorPlugin.validator` as below. Import `Form`, `FormProvider`, `FormHandle` and `SchemaFormPlugin` from `@canard/schema-form`, and `createRef` from `react`:

```tsx
const plugin: SchemaFormPlugin = {
  ...antd5Plugin,
  validator: ajvValidatorPlugin.validator,
};
const ref = createRef<FormHandle>();
const form = (
  <FormProvider
    FieldRenderer={plugin.FieldRenderer}
    FormLabelRenderer={plugin.FormLabelRenderer}
    FormInputRenderer={plugin.FormInputRenderer}
    FormErrorRenderer={plugin.FormErrorRenderer}
    fieldInputDefinitions={plugin.fieldInputDefinitions}
    formatError={plugin.formatError}
    validatorFactory={plugin.validator}
  >
    <Form
      ref={ref}
      jsonSchema={{ type: 'string', minLength: 3 }}
      defaultValue="a"
    />
  </FormProvider>
);
```

## Custom Validator

The plugin `validator` member is an object with a schema compiler and a synchronous guard compiler. Declare this object once at module scope, outside components:

```typescript
const customValidatorPlugin: SchemaFormPlugin = {
  validator: {
    // compile once per schema; return the validate function
    compile:
      (schema): ValidateFunction =>
      async (data) => {
        const issues: ValidationIssue[] = collectIssues(schema, data);
        return issues.length > 0 ? issues : null; // null = valid
      },
    // Required: a synchronous predicate for an authored `if` schema at `pointer`.
    compileGuard: (root, pointer) => (value) =>
      checkGuard(root, pointer, value),
  },
};
```

- `ValidatorPlugin` has a required `compile(jsonSchema) => ValidateFunction` and a required `compileGuard(root, pointer)`, plus optional `bind?`, `release?(root)` and `readonly dialect?`.
- A `ValidateFunction` may be sync or async, returns `readonly ValidationIssue[] | null` (`null` when valid), and must not throw.
- The `validatorFactory` prop of `Form` and `FormProvider` takes the same object shape (`ValidatorFactory`). Selection order is Form prop, then FormProvider, then plugin. `createValidatorFactory(ajv)` from the AJV plugin returns only a compile function, so it is not a valid `validatorFactory` by itself.
- Never create a validator object during render, including inline `validatorFactory={createValidator(new Ajv(...))}` or an unmemoized object in a component body: each parent render would reset the form and discard user input. Use module scope as above, memoize with stable inputs, or reuse `plugin.validator`. Swapping after mount is unsupported; see the [validator lifetime contract](https://vincent-kk.github.io/albatrion/docs/canard/schema-form/api-reference#configuration-lifetime) for all reset effects and the FormProvider selection rule.
- To use a custom AJV instance, call `plugin.validator.bind(customAjv)` on the AJV plugin before `registerPlugin(plugin)`; an instance with `coerceTypes`, `useDefaults` or `removeAdditional` is refused.
