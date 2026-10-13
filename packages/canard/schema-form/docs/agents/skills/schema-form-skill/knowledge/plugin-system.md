# Plugin System

Plugins supply the pieces the core does not ship: UI component sets and validators. Register once at app bootstrap, **before the first `<Form>` renders**, UI plugin before validator plugin — late or repeated registration makes input resolution nondeterministic.

```typescript
import { registerPlugin } from '@canard/schema-form';
import { plugin as ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';
import { antd5Plugin } from '@canard/schema-form-antd5-plugin';

registerPlugin(antd5Plugin); // 1. UI
registerPlugin(ajvValidatorPlugin); // 2. validator
```

Available plugins — validators: `@canard/schema-form-ajv8-plugin`, `-ajv7-`, `-ajv6-`; UI: `@canard/schema-form-antd5-plugin`, `-antd6-`, `-antd-mobile-`, `-mui-`.

## SchemaFormPlugin Shape

Every property is optional — a plugin customizes only what it needs:

```typescript
interface SchemaFormPlugin {
  FieldRenderer?: ComponentType<FieldRendererProps>;
  FormLabelRenderer?: ComponentType<FieldRendererProps>;
  FormInputRenderer?: ComponentType<FieldRendererProps>;
  FormErrorRenderer?: ComponentType<FieldRendererProps>;
  fieldInputDefinitions?: FieldInputDefinition[];
  validator?: ValidatorPlugin;
  formatError?: FormatError;
}
```

- When multiple registered plugins define the same property, **the last one wins**.
- Plugin-provided `fieldInputDefinitions` sit at the BOTTOM of the resolution priority — `Form`/`FormProvider` props always override them (see SKILL.md's priority list).
- Plugins can also be applied locally (per-subtree) via `ExternalFormContextProvider` instead of globally.

## Custom Validator

The plugin `validator` member is an object with a schema compiler and a synchronous guard compiler:

```typescript
import {
  type SchemaFormPlugin,
  type ValidateFunction,
  type ValidationIssue,
} from '@canard/schema-form';

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
- The `validatorFactory` prop of `Form` and `FormProvider` takes the same object shape (`ValidatorFactory`). Selection order is Form prop, then FormProvider, then plugin; keep the reference stable, because changing it rebuilds the tree. `createValidatorFactory(ajv)` from the AJV plugin returns only a compile function, so it is not a valid `validatorFactory` by itself.
- To use a custom AJV instance, call `plugin.validator.bind(customAjv)` on the AJV plugin before `registerPlugin(plugin)`; an instance with `coerceTypes`, `useDefaults` or `removeAdditional` is refused.
