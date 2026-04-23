# Plugin System

Register validators and UI component sets via `registerPlugin()` before the first render. Plugin-provided `formTypeInputDefinitions` have the lowest priority; `FormProvider` and `Form` props override them.

## Available Plugins

### Validator Plugins

| Package | Description |
|---------|-------------|
| `@canard/schema-form-ajv8-plugin` | AJV 8.x based validation |
| `@canard/schema-form-ajv7-plugin` | AJV 7.x based validation |
| `@canard/schema-form-ajv6-plugin` | AJV 6.x based validation |

### UI Plugins

| Package | Description |
|---------|-------------|
| `@canard/schema-form-antd5-plugin` | Ant Design 5 components |
| `@canard/schema-form-antd6-plugin` | Ant Design 6 components |
| `@canard/schema-form-antd-mobile-plugin` | Ant Design Mobile components |
| `@canard/schema-form-mui-plugin` | Material UI components |

## SchemaFormPlugin Interface

```typescript
interface SchemaFormPlugin {
  // Plugin identifier
  name: string;

  // FormTypeInput definition list
  formTypeInputDefinitions?: FormTypeInputDefinition[];

  // Form renderer component
  FormRenderer?: ComponentType<FormRendererProps>;

  // Form type renderer component
  FormTypeRenderer?: ComponentType<FormTypeRendererProps>;

  // Validator Factory
  validatorFactory?: ValidatorFactory;
}
```

## Validator Factory

You can implement custom validation logic.

```typescript
import type { ValidatorFactory, Validator } from '@canard/schema-form';

const createCustomValidator: ValidatorFactory = (schema) => {
  return {
    validate: async (value) => {
      const errors = [];

      // Custom validation logic
      if (schema.customValidation) {
        const result = schema.customValidation(value);
        if (!result.valid) {
          errors.push({
            path: '',
            keyword: 'customValidation',
            message: result.message,
          });
        }
      }

      return errors;
    },
  };
};

export const customValidatorPlugin: SchemaFormPlugin = {
  name: 'custom-validator',
  validatorFactory: createCustomValidator,
};
```

## Override via FormProvider

You can override definitions with higher priority than plugins.

```typescript
import { FormProvider } from '@canard/schema-form';

<FormProvider
  formTypeInputDefinitions={[
    // This definition takes precedence over plugins
    {
      test: { type: 'string' },
      Component: CustomStringInput,
    },
  ]}
  FormRenderer={CustomFormRenderer}
>
  <App />
</FormProvider>
```

## References

- Full specification: `docs/ko/SPECIFICATION.md`
- Plugin development guide: `.cursor/rules/create-canard-form-plugin-guidelines.mdc`
- Example plugins: `packages/canard/schema-form-antd5-plugin`, `packages/canard/schema-form-ajv8-plugin`
