# Plugin System

Plugins supply the pieces the core does not ship: UI component sets and validators. Register once at app bootstrap, **before the first `<Form>` renders**, UI plugin before validator plugin — late or repeated registration makes input resolution nondeterministic.

```typescript
import { registerPlugin } from '@canard/schema-form';
import { ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';
import { antd5Plugin } from '@canard/schema-form-antd5-plugin';

registerPlugin(antd5Plugin); // 1. UI
registerPlugin(ajvValidatorPlugin); // 2. validator
```

Available plugins — validators: `@canard/schema-form-ajv8-plugin`, `-ajv7-`, `-ajv6-`; UI: `@canard/schema-form-antd5-plugin`, `-antd6-`, `-antd-mobile-`, `-mui-`.

## SchemaFormPlugin Shape

Every property is optional — a plugin customizes only what it needs:

```typescript
interface SchemaFormPlugin {
  FormGroup?: ComponentType<FormTypeRendererProps>;
  FormLabel?: ComponentType<FormTypeRendererProps>;
  FormInput?: ComponentType<FormTypeRendererProps>;
  FormError?: ComponentType<FormTypeRendererProps>;
  formTypeInputDefinitions?: FormTypeInputDefinition[];
  validator?: ValidatorPlugin;
  formatError?: FormatError;
}
```

- When multiple registered plugins define the same property, **the last one wins**.
- Plugin-provided `formTypeInputDefinitions` sit at the BOTTOM of the resolution priority — `Form`/`FormProvider` props always override them (see SKILL.md's priority list).
- Plugins can also be applied locally (per-subtree) via `ExternalFormContextProvider` instead of globally.

## Custom Validator

The validator contract is a factory that returns a validate function directly:

```typescript
import type { SchemaFormPlugin, ValidatorFactory } from '@canard/schema-form';

const factory: ValidatorFactory = (schema) => {
  // compile once per schema; return the validate function
  return async (data) => {
    const errors = collectErrors(schema, data);
    return errors.length > 0 ? errors : null; // null = valid
  };
};

const customValidatorPlugin: SchemaFormPlugin = {
  validator: { compile: factory },
};
```

- `ValidatorFactory` is `(schema: JsonSchema) => ValidateFunction` — the factory returns the function itself, not an object wrapping one.
- A `ValidateFunction` may be sync or async and returns `JsonSchemaError[] | null` (`null` when valid).
- `ValidatorPlugin.bind?(instance)` is a consumer-facing hook for supplying a custom validator instance (e.g. a preconfigured AJV) — call it on the plugin object before `registerPlugin()`; the core never calls it.
