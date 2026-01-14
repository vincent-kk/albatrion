# @canard/schema-form

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()
[![Json Schema](https://img.shields.io/badge/JsonSchema-{}-blue.svg)]()
[![Json Schema Form](https://img.shields.io/badge/JsonSchemaForm-form-red.svg)]()

---

## Overview

`@canard/schema-form` is a React-based component library that renders forms based on a provided [JSON Schema](https://json-schema.org/).

JSON Schema validation is supported through a plugin system, allowing the use of various validator plugins.

By defining various `FormTypeInput` components, it offers the flexibility to accommodate complex requirements with ease.

---

## How to use

```bash
yarn add @canard/schema-form
# Also install a validator plugin
yarn add @canard/schema-form-ajv8-plugin
# Or for AJV 7.x
yarn add @canard/schema-form-ajv7-plugin
# Or for AJV 6.x
yarn add @canard/schema-form-ajv6-plugin
```

---

## Compatibility

`@canard/schema-form` is built with ECMAScript 2022 (ES2022) syntax.

If you're using a JavaScript environment that doesn't support ES2022, you'll need to include this package in your transpilation process.

**Supported environments:**

- Node.js 16.11.0 or later
- Modern browsers (Chrome 94+, Firefox 93+, Safari 15+)

**For legacy environment support:**
Please use a transpiler like Babel to transform the code for your target environment.

**Target packages**

- `@canard/schema-form`
- `@winglet/json-schema`

---

### Interfaces

#### FormProps

```ts
interface FormProps<
  Schema extends JsonSchema = JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  /** JSON Schema to use in this SchemaForm */
  jsonSchema: Schema;
  /** Default value for this SchemaForm */
  defaultValue?: Value;
  /** Apply readOnly property to all FormTypeInput components */
  readOnly?: boolean;
  /** Apply disabled property to all FormTypeInput components */
  disabled?: boolean;
  /** Function called when the value of this SchemaForm changes */
  onChange?: SetStateFn<Value>;
  /** Function called when this SchemaForm is validated */
  onValidate?: Fn<[jsonSchemaError: JsonSchemaError[]]>;
  /** Function called when the form is submitted */
  onSubmit?: Fn<[value: Value], Promise<void> | void>;
  /** FormTypeInput definition list */
  formTypeInputDefinitions?: FormTypeInputDefinition[];
  /** FormTypeInput path mapping */
  formTypeInputMap?: FormTypeInputMap;
  /** Custom form type renderer component */
  CustomFormTypeRenderer?: ComponentType<FormTypeRendererProps>;
  /** Initial validation errors, default is undefined */
  errors?: JsonSchemaError[];
  /** Custom format error function */
  formatError?: FormTypeRendererProps['formatError'];
  /**
   * Error display condition (default: ShowError.DirtyTouched)
   *   - `true`: Always show
   *   - `false`: Never show
   *   - `ShowError.Dirty`: Show when value has changed
   *   - `ShowError.Touched`: Show when input has been focused
   *   - `ShowError.DirtyTouched`: Show when both Dirty and Touched conditions are met
   */
  showError?: boolean | ShowError;
  /**
   * Execute Validation Mode (default: ValidationMode.OnChange)
   *  - `ValidationMode.None`: Disable validation
   *  - `ValidationMode.OnChange`: Validate when value changes
   *  - `ValidationMode.OnRequest`: Validate only when requested
   */
  validationMode?: ValidationMode;
  /** Custom ValidatorFactory function */
  validatorFactory?: ValidatorFactory;
  /** User-defined context */
  context?: Dictionary;
  /** Child components */
  children?:
    | ReactNode
    | Fn<[props: FormChildrenProps<Schema, Value>], ReactNode>;
}
```

#### FormHandle

```ts
interface FormHandle<
  Schema extends JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  node?: InferSchemaNode<Schema>;
  focus: Fn<[dataPath: SchemaNode['path']]>;
  select: Fn<[dataPath: SchemaNode['path']]>;
  reset: Fn;
  getValue: Fn<[], Value>;
  setValue: SetStateFnWithOptions<Value>;
  getErrors: Fn<[], JsonSchemaError[]>;
  getAttachedFilesMap: Fn<[], AttachedFilesMap>;
  validate: Fn<[], Promise<JsonSchemaError[]>>;
  submit: TrackableHandlerFunction<[], void, { loading: boolean }>;
}
```

#### AttachedFilesMap

```ts
// Stores File[] by JSONPointer path key (e.g., "/attachment" or "/items/0/file").
type AttachedFilesMap = Map<string, File[]>;
```

#### FormChildrenProps

```ts
interface FormChildrenProps<
  Schema extends JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  node?: InferSchemaNode<Schema>;
  jsonSchema: Schema;
  defaultValue?: Value;
  value?: Value;
  errors?: JsonSchemaError[];
}
```

### Basic Usage

```tsx
import { Form, registerPlugin } from '@canard/schema-form';
import { ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';

// Register validator plugin (once at app startup)
registerPlugin(ajvValidatorPlugin);

export const App = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      age: {
        type: 'number',
      },
    },
  };

  const defaultValues = {
    name: 'Woody',
    age: 30,
  };

  const [value, setValue] = useState<{
    name: string;
    age: number;
  }>(defaultValues);

  return (
    <Form
      jsonSchema={jsonSchema}
      defaultValues={defaultValues}
      onChange={setValue}
    />
  );
};
```

---

## Validator System

`@canard/schema-form` provides a plugin-based validation system. Various validator plugins can be used for JSON Schema validation.

### ValidatorFactory

ValidatorFactory is a function that takes a JSON Schema and returns a validation function:

```ts
interface ValidatorFactory {
  (schema: JsonSchema): ValidateFunction<any>;
}

type ValidateFunction<Value = unknown> = Fn<
  [data: Value],
  Promise<JsonSchemaError[] | null> | JsonSchemaError[] | null
>;
```

### Validator Plugin Usage

#### 1. Basic Plugin Registration

```tsx
import { registerPlugin } from '@canard/schema-form';
import { ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';

// Register plugin at app startup
registerPlugin(ajvValidatorPlugin);
```

#### 2. Custom ValidatorFactory Usage

When you want to use different validation logic for specific Forms:

```tsx
import { Form } from '@canard/schema-form';
// The version of ajv must be 8.x because the plugin is based on ajv8.x
// If you want to use ajv7.x, you can use @canard/schema-form-ajv7-plugin
// Or if you want to use ajv6.x, you can use @canard/schema-form-ajv6-plugin
import { createValidatorFactory } from '@canard/schema-form-ajv8-plugin';
import Ajv from 'ajv';

export const CustomValidationForm = () => {
  const validatorFactory = useMemo(() => {
    // Create custom AJV instance
    const customAjv = new Ajv({
      allErrors: true,
      strictSchema: false,
      validateFormats: false,
    });

    // Add custom keywords
    customAjv.addKeyword({
      keyword: 'isEven',
      type: 'number',
      validate: (schema: boolean, data: number) => {
        if (schema === false) return true;
        return data % 2 === 0;
      },
      errors: false,
    });

    // Create ValidatorFactory
    return createValidatorFactory(customAjv);
  }, []);

  const jsonSchema = {
    type: 'object',
    properties: {
      name: { type: 'string', maxLength: 10 },
      evenNumber: { type: 'number', isEven: true, maximum: 100 },
    },
  };

  return <Form jsonSchema={jsonSchema} validatorFactory={validatorFactory} />;
};
```

#### 3. Global ValidatorFactory Setup via FormProvider

When using the same validation logic across multiple Forms:

```tsx
import { FormProvider } from '@canard/schema-form';
// The version of ajv must be 8.x because the plugin is based on ajv8.x
// If you want to use ajv7.x, you can use @canard/schema-form-ajv7-plugin
// Or if you want to use ajv6.x, you can use @canard/schema-form-ajv6-plugin
import { createValidatorFactory } from '@canard/schema-form-ajv8-plugin';
import Ajv from 'ajv';

export const App = () => {
  const validatorFactory = useMemo(() => {
    const customAjv = new Ajv({
      allErrors: true,
      strictSchema: false,
    });

    return createValidatorFactory(customAjv);
  }, []);

  return (
    <FormProvider validatorFactory={validatorFactory}>
      <MyForms />
    </FormProvider>
  );
};
```

### Available Validator Plugins

- [**@canard/schema-form-ajv8-plugin**](../schema-form-ajv8-plugin/README.md): AJV 8.x based (latest JSON Schema support)
- [**@canard/schema-form-ajv7-plugin**](../schema-form-ajv7-plugin/README.md): AJV 7.x based (legacy environment support)
- [**@canard/schema-form-ajv6-plugin**](../schema-form-ajv6-plugin/README.md): AJV 6.x based (legacy environment support)

Please refer to each plugin's README for detailed usage instructions.

### Error Message Formatting

📌 `@canard/schema-form` provides a feature to customize validation messages.

📌 This feature does not include validation functionality. To use validation features, you must use one of the following plugins or implement your own validator:

- [@canard/schema-form-ajv6-plugin](../schema-form-ajv6-plugin/README.md)
- [@canard/schema-form-ajv7-plugin](../schema-form-ajv7-plugin/README.md)
- [@canard/schema-form-ajv8-plugin](../schema-form-ajv8-plugin/README.md)

📌 If you need additional message formats, you can write a `formatError` function directly and apply it.

📌 Validation messages must follow the following rules:

- Validation messages must be defined in the `errorMessages` property of the jsonSchema.
- Validation messages must be defined in the `{[keyword]:errorMessage}` format.
- If you define the `default` key, it will be used as the default value when the keyword does not match.
- Each validation message (errorMessage) can be replaced with dynamic values using the following expressions:
  - `{key}`: key is replaced with the value corresponding to the key in `error.details`.
  - `{value}`: value is replaced with the value currently entered in the input.

#### Basic Usage

```ts
const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 3,
      maxLength: 10,
      errorMessages: {
        minLength:
          'Name must be at least {limit} characters long. Current value: {value}',
        maxLength:
          'Name must be no more than {limit} characters long. Current value: {value}',
        required: 'Name is a required field.',
      },
    },
  },
  required: ['name'],
};

// AJV8 error example
const error = {
  dataPath: '/name',
  keyword: 'minLength',
  message: 'must NOT have fewer than 3 characters',
  details: {
    limit: 3,
  },
};

// Current value
const value = 'AB';

// Replacement error message
// "Name must be at least 3 characters long. Current value: AB"
```

#### Multilingual Support

```ts
const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 3,
      maxLength: 10,
      errorMessages: {
        minLength: {
          ko_KR: '이름은 최소 {limit} 글자 이상이어야 합니다. 현재 값: {value}',
          en_US:
            'Name must be at least {limit} characters long. Current value: {value}',
        },
        maxLength: {
          ko_KR: '이름은 최대 {limit} 글자 이하여야 합니다. 현재 값: {value}',
          en_US:
            'Name must be at most {limit} characters long. Current value: {value}',
        },
        required: {
          ko_KR: '이름은 필수 입력 항목입니다.',
          en_US: 'Name is a required field.',
        },
      },
    },
  },
  required: ['name'],
};

// AJV8 error example
const error = {
  dataPath: '/name',
  keyword: 'minLength',
  message: 'must NOT have fewer than 3 characters',
  details: {
    limit: 3,
  },
};

// Form context
const context = {
  locale: 'en_US',
};

// Current value
const value = 'AB';

// Replacement error message
// "Name must be at least 3 characters long. Current value: AB"
```

---

## FormTypeInput System

`@canard/schema-form` provides a powerful and flexible FormTypeInput system. This system allows users to precisely control which input component should be used for each JSON Schema node.

### FormTypeInputDefinition

FormTypeInputDefinition defines an input component to be used for JSON Schema nodes that match specific conditions:

```ts
type FormTypeInputDefinition<T = unknown> = {
  test: FormTypeTestFn | FormTypeTestObject;
  Component: ComponentType<InferFormTypeInputProps<T>>;
};
```

Each definition consists of two key parts:

- **test**: Defines the conditions for which JSON Schema nodes this input component should apply
- **Component**: The React component to be used when conditions are met

#### Test Function or Test Object

The conditions for a FormTypeInput can be defined using a function or an object:

```ts
type Hint = {
  jsonSchema: JsonSchema;
  type: string;
  format: string;
  formType: string;
  path: string;
  [alt: string]: any;
};
type FormTypeTestFn = Fn<[hint: Hint], boolean>;

type FormTypeTestObject = Partial<{
  type: Array<string>;
  jsonSchema: JsonSchema;
  format: Array<string>;
  formType: Array<string>;
  [alt: string]: any;
}>;
```

- **FormTypeTestFn**: A function that receives a Hint object and returns a boolean. Useful for implementing more complex conditions.
- **FormTypeTestObject**: Allows conditions to be defined simply as an object. For example, `{ type: ['string'], format: ['email'] }` matches nodes that are both string type and email format.

#### FormTypeInput Props

The selected component will receive the following props:

```ts
interface FormTypeInputProps<
  Value extends AllowedValue = any,
  Context extends Dictionary = object,
  WatchValues extends Array<any> = Array<any>,
  Schema extends JsonSchemaWithVirtual = InferJsonSchema<Value>,
  Node extends SchemaNode = InferSchemaNode<Schema>,
> {
  /** JSON Schema for the FormTypeInput Component */
  jsonSchema: Schema;
  /** readOnly state for the FormTypeInput Component */
  readOnly: boolean;
  /** disabled state for the FormTypeInput Component */
  disabled: boolean;
  /** Whether the schema node assigned to the FormTypeInput Component is required */
  required: boolean;
  /** Schema node assigned to the FormTypeInput Component */
  node: Node;
  /** JSON Schema type of this field (e.g., 'string', 'number', 'object', 'array') */
  type: Node['schemaType'];
  /** Name of the schema node assigned to the FormTypeInput Component */
  name: Node['name'];
  /** Path of the schema node assigned to the FormTypeInput Component */
  path: Node['path'];
  /** Whether this field accepts null as a valid value (derived from schema type array including 'null') */
  nullable: Node['nullable'];
  /** Errors of the schema node assigned to the FormTypeInput Component */
  errors: Node['errors'];
  /** Values being watched according to the `computed.watch`(=`&watch`) property defined in JsonSchema */
  watchValues: WatchValues;
  /** Default value for the FormTypeInput Component */
  defaultValue: Value | undefined;
  /** Value for the FormTypeInput Component */
  value: Value | undefined;
  /** onChange handler for the FormTypeInput Component */
  onChange: SetStateFnWithOptions<Value | undefined>;
  /** Attach or detach file(s) to the form's file store */
  onFileAttach: Fn<[file: File | File[] | undefined]>;
  /** Child FormTypeInput Components for this FormTypeInput Component */
  ChildNodeComponents: ChildNodeComponent[];
  /** Style for the FormTypeInput Component */
  style: CSSProperties | undefined;
  /** UserDefinedContext passed to the Form */
  context: Context;
  /** Additional properties can be freely defined */
  [alt: string]: any;
}
```

### File Management (onFileAttach)

`@canard/schema-form` keeps the actual File objects in a dedicated store and writes only file metadata (name, size, type, lastModified) into the schema value. Use `onFileAttach` in your `FormTypeInput` to attach files, and then call `FormHandle.getAttachedFilesMap()` on submit to send files to your API.

- **Storage**: `getAttachedFilesMap()` returns `Map<string, File[]>` where the key is the input's standard JSONPointer path (`node.path`). Keys must be standard RFC 6901 JSONPointer only; extended syntax (`..`, `.`, `*`) is not used for keys.
- **Automatic cleanup**:
  - When the form is re-initialized or a node is removed (including unmount), files at that path are deleted.
  - Conditional schemas (e.g., `if/then/else`, `oneOf`) that remove fields also trigger file cleanup.

#### Single/Multiple File FormTypeInput example

```tsx
const FileFormTypeInput = ({
  onFileAttach,
  onChange,
  readOnly,
  disabled,
  value,
  jsonSchema,
}: FormTypeInputProps<any>) => {
  const multiple: boolean = jsonSchema?.FormTypeInputProps?.multiple ?? false;
  const accept: string | undefined = jsonSchema?.FormTypeInputProps?.accept;

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const fileList = Array.from(e.target.files || []);
    if (fileList.length === 0) {
      onFileAttach(undefined);
      onChange(undefined);
      return;
    }
    if (multiple) {
      onFileAttach(fileList);
      onChange(
        fileList.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
          lastModified: f.lastModified,
        })),
      );
    } else {
      const file = fileList[0];
      onFileAttach(file);
      onChange({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      });
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple={multiple}
        accept={accept}
        disabled={readOnly || disabled}
        onChange={handleChange}
      />
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </div>
  );
};
```

#### Sending files to API (FormData)

```tsx
import React, { useRef } from 'react';

import { Form, type FormHandle, ValidationMode } from '@canard/schema-form';

const schema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    attachment: {
      type: 'object',
      FormTypeInput: FileFormTypeInput,
      FormTypeInputProps: { multiple: false, accept: '*/*' },
      properties: {
        name: { type: 'string' },
        size: { type: 'number' },
        type: { type: 'string' },
        lastModified: { type: 'number' },
      },
    },
  },
} as const;

export const UploadForm = () => {
  const ref = useRef<FormHandle<typeof schema>>(null);

  const handleSubmit = async () => {
    const form = ref.current;
    if (!form) return;

    // Send schema value (JSON) together with attached files
    const values = form.getValue();
    const files = form.getAttachedFilesMap(); // AttachedFilesMap

    const body = new FormData();
    body.append(
      'json',
      new Blob([JSON.stringify(values)], { type: 'application/json' }),
    );

    for (const [path, fileList] of files.entries()) {
      if (fileList.length === 1) {
        // Single file: use path directly
        body.append(path, fileList[0]);
      } else {
        // Multiple files: use standard JSONPointer for array keys: "/0", "/1" (do not use brackets [])
        fileList.forEach((file, idx) => body.append(`${path}/${idx}`, file));
      }
    }

    await fetch('/api/upload', { method: 'POST', body });
  };

  return (
    <Form
      ref={ref}
      jsonSchema={schema}
      validationMode={ValidationMode.OnRequest}
      onSubmit={handleSubmit}
    />
  );
};
```

Recommendations:

- Use standard JSONPointer-style keys (e.g., "/0", "/1") for array files; do not use bracket notation `[]`.
- For large files, consider progress/abort handling and chunked uploads.

### FormTypeInputMap

You can also directly map components to specific fields based on their path:

```ts
type FormTypeInputMap = {
  [path: string]: ComponentType<FormTypeInputProps>;
};
```

This allows explicit assignment of components to specific paths in your JSON Schema.

### FormTypeInput Selection Process and Priority

When a form is rendered, the input component for each JSON Schema node is determined with the following priority:

1. **Directly assigned FormTypeInput**: When a component is directly assigned via the `FormTypeInput` property in the JSON Schema object

   ```js
   const jsonSchema = {
     type: 'string',
     FormTypeInput: CustomTextInput, // Highest priority
   };
   ```

2. **FormTypeInputMap**: When there's a matching path in the `formTypeInputMap` passed to the `Form` component

   ```jsx
   <Form
     jsonSchema={jsonSchema}
     formTypeInputMap={{
       '/user/email': EmailInput,
       '/user/profile/avatar': AvatarUploader,
     }}
   />
   ```

3. **Form's FormTypeInputDefinitions**: The first definition in the `formTypeInputDefinitions` array passed to the `Form` component that satisfies the test conditions

   ```jsx
   <Form
     jsonSchema={jsonSchema}
     formTypeInputDefinitions={[
       { test: { type: ['string'], format: ['email'] }, Component: EmailInput },
       { test: { type: ['string'], format: ['date'] }, Component: DatePicker },
     ]}
   />
   ```

4. **FormProvider's FormTypeInputDefinitions**: The `formTypeInputDefinitions` provided globally through `FormProvider`

5. **Plugin's FormTypeInputDefinitions**: The `formTypeInputDefinitions` provided by registered plugins

**Important**: If multiple FormTypeInputs satisfy the same conditions, the one found first according to the priority above will be used. When provided as an array, definitions are evaluated in the order they appear in the array.

This powerful mechanism enables **high levels of customization**:

- Override default input components globally
- Define custom input components specific to certain forms
- Explicitly specify components for specific fields based on their path
- Assign components directly to JSON Schema properties for the most specific level of control

### Example: Utilizing Different Priorities

```tsx
import { Form, FormProvider, registerPlugin } from '@canard/schema-form';
import { AntdPlugin } from '@canard/schema-form-antd-plugin';

// Register plugin (lowest priority)
registerPlugin(AntdPlugin);

export const CustomizedForm = () => {
  // Global FormTypeInput definitions (medium priority)
  const globalDefinitions = [
    {
      test: { type: ['string'] },
      Component: GlobalTextInput,
    },
  ];

  // Form-specific FormTypeInput definitions (higher priority)
  const formDefinitions = [
    {
      test: { type: ['string'], format: ['email'] },
      Component: EmailInput,
    },
  ];

  // Path-based mapping (even higher priority)
  const formInputMap = {
    '/user/address/postalCode': PostalCodeInput,
  };

  // Direct component assignment in JSON Schema (highest priority)
  const jsonSchema = {
    type: 'object',
    properties: {
      user: {
        type: 'object',
        properties: {
          name: { type: 'string' }, // Will use GlobalTextInput
          email: { type: 'string', format: 'email' }, // Will use EmailInput
          address: {
            type: 'object',
            properties: {
              street: { type: 'string' }, // Will use GlobalTextInput
              postalCode: { type: 'string' }, // Will use PostalCodeInput (path mapping)
              country: {
                type: 'string',
                FormTypeInput: CountrySelector, // Will use directly assigned component (top priority)
              },
            },
          },
        },
      },
    },
  };

  return (
    <FormProvider formTypeInputDefinitions={globalDefinitions}>
      <Form
        jsonSchema={jsonSchema}
        formTypeInputDefinitions={formDefinitions}
        formTypeInputMap={formInputMap}
      />
    </FormProvider>
  );
};
```

This powerful system allows developers to have fine-grained control over every aspect of their forms while minimizing code duplication.

---

## Plugin System

`@canard/schema-form` provides a plugin system that allows developers to extend the library and add custom functionality.

### Plugin Registration

```tsx
import { registerPlugin } from '@canard/schema-form';
import { plugin as AjvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';
import { plugin as AntdPlugin } from '@canard/schema-form-antd-plugin';

registerPlugin(AntdPlugin);
registerPlugin(AjvValidatorPlugin);
```

### Available Plugins

#### UI Plugins

- [**@canard/schema-form-antd-plugin**](../schema-form-antd-plugin/README.md): Ant Design based basic components
- [**@canard/schema-form-antd-mobile-plugin**](../schema-form-antd-mobile-plugin/README.md): Ant Design Mobile based basic components
- [**@canard/schema-form-mui-plugin**](../schema-form-mui-plugin/README.md): MUI based basic components

#### Validator Plugins

- [**@canard/schema-form-ajv8-plugin**](../schema-form-ajv8-plugin/README.md): AJV 8.x based (latest JSON Schema support)
- [**@canard/schema-form-ajv7-plugin**](../schema-form-ajv7-plugin/README.md): AJV 7.x based (legacy environment support)
- [**@canard/schema-form-ajv6-plugin**](../schema-form-ajv6-plugin/README.md): AJV 6.x based (legacy environment support)

## Custom Plugin System

`@canard/schema-form` provides a plugin system that allows developers to write and register custom plugins.

### Plugin Type Structure

```ts
export interface SchemaFormPlugin {
  /** Form.Group Component */
  FormGroup?: ComponentType<FormTypeRendererProps>;
  /** Form.Label Component */
  FormLabel?: ComponentType<FormTypeRendererProps>;
  /** Form.Input Component */
  FormInput?: ComponentType<FormTypeRendererProps>;
  /** Form.Error Component */
  FormError?: ComponentType<FormTypeRendererProps>;
  /** FormTypeInputDefinition */
  formTypeInputDefinitions?: FormTypeInputDefinition[];
  /** Validator Plugin */
  validator?: ValidatorPlugin;
  /** Formatting Error Function */
  formatError?: FormatError;
}

export interface ValidatorPlugin {
  /** Inject Custom Validator Instance */
  bind: Fn<[instance: any]>;
  /** Validator Factory Function */
  compile: ValidatorFactory;
}

export interface ValidatorFactory {
  (schema: JsonSchema): ValidateFunction<any>;
}
```

### Plugin Registration Rules

If multiple plugins are registered for the same property, the following priority rules apply:

| Property                                           | Allowed Count      | Priority Rule                                    |
| -------------------------------------------------- | ------------------ | ------------------------------------------------ |
| `FormGroup`, `FormLabel`, `FormInput`, `FormError` | One only           | The last registered component is applied.        |
| `formTypeInputDefinitions`                         | Multiple mergeable | Merged, and the last registered item is applied. |
| `validator`, `formatError`                         | One only           | The last registered item is applied.             |

This structure provides consistent priority and extensibility even when using multiple plugins.

---

## JSONPointer Path System

`@canard/schema-form` uses JSONPointer (RFC 6901) for referencing fields within the form schema. This provides a standardized way to address specific nodes in the JSON Schema structure.

### Standard JSONPointer

JSONPointer follows the RFC 6901 specification:

- `/` - Path separator
- `#` - URI fragment identifier prefix
- `''` (empty string) - Root pointer representing the entire document

#### Path Conventions

`@canard/schema-form` distinguishes between two path types:

| Path Type    | Root Value          | Example                      | Description                                                                       |
| ------------ | ------------------- | ---------------------------- | --------------------------------------------------------------------------------- |
| `dataPath`   | `''` (empty string) | `''`, `'/user/name'`         | JSON Pointer string without URI fragment prefix. Used for data value references.  |
| `schemaPath` | `'#'`               | `'#'`, `'#/properties/user'` | JSON Pointer URI fragment with `#` prefix. Used for schema definition references. |

```tsx
// Examples of standard JSONPointer usage
<Form.Render path="/user/name" />        // Access user.name (dataPath style)
<Form.Render path="/user/address/0" />   // Access first item in user.address array
```

**Note**: `<Form.Render path="..." />` uses `dataPath` style paths (without `#` prefix).

### Extended JSONPointer

**Important Notice**: To better support complex form scenarios, `@canard/schema-form` implements **extended JSONPointer syntax** that goes beyond the official RFC 6901 specification. These extensions are necessary to provide enhanced functionality for form navigation and manipulation.

**Usage Context**: Extended JSONPointer syntax is available in specific contexts:

- `FormTypeInputMap` keys (with wildcard `*`)
- `computed`(`&`) properties (with relative paths `..`, `.`)
- Programmatic node navigation with `node.find()` method

**Note**: Extended syntax is **NOT** supported in `<Form.Render path="..." />` components and `node.find()` method, which only accept standard JSONPointer paths.

The following extensions are supported:

#### Parent Navigation (`..`)

Navigate to the parent node, primarily used in computed properties:

```tsx
const jsonSchema = {
  type: 'object',
  properties: {
    user: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['admin', 'user'] },
        permissions: {
          type: 'array',
          computed: {
            watch: '../type', // Watch parent's type field
            active: "../type === 'admin'", // Show only for admin
          },
        },
      },
    },
  },
};

// Programmatic navigation
const userNode = node.find('user');
const typeNode = userNode.find('../type'); // Navigate to sibling
```

#### Current Node (`.`)

Reference the current node:

```tsx
const jsonSchema = {
  type: 'object',
  properties: {
    settings: {
      type: 'object',
      computed: {
        watch: '.', // Watch current node
        // Other computed logic
      },
    },
  },
};

// Programmatic navigation
const currentNode = node.find('.'); // Reference current node
```

#### Array Index Wildcard (`*`)

Operate on all items in an array, primarily used in FormTypeInputMap:

```tsx
const formInputMap = {
  '/users/*/name': CustomNameInput, // All user names
  '/settings/*/enabled': ToggleInput, // All enabled settings
  '/data/*/status': StatusBadge, // All status fields
};
```

#### Context Reference (`@`)

Reference external context data passed to the Form, primarily used in computed properties.

**Important:** The `@` symbol directly references the context object itself, not a JSON Pointer path. Therefore, you must use **JavaScript property accessor syntax** (dot notation or bracket notation) instead of JSON Pointer format:

```tsx
// ✅ Correct - Property accessor syntax
'@.mode'; // context.mode
'@.user.role'; // context.user.role
'@.permissions?.edit'; // context.permissions?.edit (optional chaining)

// ❌ Wrong - JSON Pointer format
'@/mode'; // This will NOT work
'@/user/role'; // This will NOT work
```

**Usage in computed properties:**

```tsx
const jsonSchema = {
  type: 'object',
  properties: {
    secretField: {
      type: 'string',
      computed: {
        visible: '@.userRole === "admin"', // Show only for admin users
        readOnly: '@.mode === "view"', // Read-only in view mode
        disabled: '@.permissions?.canEdit === false', // Disabled based on permissions
      },
    },
    combinedCondition: {
      type: 'string',
      computed: {
        // Combine context (@) with form field references (..)
        active: '@.featureEnabled && ../category === "premium"',
      },
    },
  },
};

// Pass context to Form
<Form
  jsonSchema={jsonSchema}
  context={{
    mode: 'edit',
    userRole: 'admin',
    featureEnabled: true,
    permissions: { canEdit: true },
  }}
/>;
```

**Key characteristics:**

- Context values update reactively - when context changes, computed properties re-evaluate
- Supports optional chaining (`?.`) for safe nested access
- Available only in `computed` properties, not in `FormTypeInputMap` or `Form.Render`

> ⚠️ **Recommendation:** Since `@` references the context object which may change dynamically at runtime, we recommend using **optional chaining (`?.`)** for safe access to nested properties. This prevents runtime errors when context properties are undefined or null.
>
> ```tsx
> // ✅ Safe access with optional chaining
> '@.user?.profile?.name';
> '@.settings?.theme ?? "light"';
>
> // ⚠️ May cause errors if context structure changes
> '@.user.profile.name';
> ```

### Practical Usage Examples

```tsx
const jsonSchema = {
  type: 'object',
  properties: {
    user: {
      type: 'object',
      properties: {
        role: { type: 'string', enum: ['admin', 'user', 'guest'] },
        profile: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            adminSettings: {
              type: 'object',
              computed: {
                watch: '../role',  // Watch sibling field
                active: "../role === 'admin'"  // Show only for admin
              },
              properties: {
                permissions: { type: 'array' }
              }
            }
          }
        },
        addresses: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['home', 'work'] },
              street: { type: 'string' },
              city: { type: 'string' },
              isDefault: {
                type: 'boolean',
                computed: {
                  watch: '../type',  // Watch sibling type
                  active: "../type === 'home'"  // Show only for home addresses
                }
              }
            }
          }
        }
      }
    }
  }
};

// FormTypeInputMap with wildcard
const formInputMap = {
  '/user/profile/name': CustomNameInput,
  '/user/addresses/*/street': AddressInput,      // All address streets
  '/user/addresses/*/isDefault': ToggleInput,    // All isDefault fields
};

// Standard Form.Render (no extended syntax)
<Form.Render path="/user/profile/name" />           // ✅ Standard path
<Form.Render path="/user/addresses/0/street" />     // ✅ Standard path

// ❌ These would NOT work in Form.Render:
// <Form.Render path="/user/profile/.." />           // Extended syntax not supported
// <Form.Render path="/user/addresses/*/city" />     // Extended syntax not supported
```

### Escape and Unescape

JSONPointer requires special characters to be escaped according to RFC 6901:

- `~0` represents `~`
- `~1` represents `/`

**Implementation Note**: `@canard/schema-form` supports any escape/unescape implementation that follows the official RFC 6901 specification. You can use any compliant library or implementation for handling special characters in field names.

```tsx
// Field name with special characters: "field/with~special"
<Form.Render path="/field~1with~0special" />
```

### FormTypeInputMap with Extended Paths

When using `FormTypeInputMap`, you can use wildcard syntax for array elements:

```tsx
const formInputMap = {
  '/user/email': EmailInput, // Standard path
  '/user/profile/avatar': AvatarUploader, // Nested path
  '/settings/*/enabled': ToggleInput, // ✅ Wildcard for arrays
  '/users/*/permissions': PermissionSelector, // ✅ All user permissions
  '/data/*/status': StatusBadge, // ✅ All status fields
};

<Form jsonSchema={jsonSchema} formTypeInputMap={formInputMap} />;
```

### Programmatic Node Navigation

```tsx
export const AdvancedForm = () => {
  return (
    <Form jsonSchema={jsonSchema}>
      {({ node }) => {
        // Using extended syntax in node.find()
        const userRole = node?.find('/user/role');
        const parentNode = node?.find('../'); // ✅ Parent navigation

        return (
          <div>
            <Form.Render path="/user/role" /> {/* Standard path */}
            <Form.Render path="/user/profile" />
          </div>
        );
      }}
    </Form>
  );
};
```

**Note**: The extended JSONPointer syntax (`..`, `.`, `*`) is a deliberate extension to the RFC 6901 specification, implemented to provide enhanced form manipulation capabilities. While these extensions deviate from the standard, they are essential for supporting complex form interactions and navigation patterns commonly required in real-world applications.

---

## Advanced Usage

### Custom Form Layout

`@canard/schema-form` allows for custom layouts using the `Form.Render` component:

```tsx
import { Form } from '@canard/schema-form';

export const CustomLayoutForm = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      personalInfo: {
        type: 'object',
        properties: {
          name: { type: 'string', title: 'Name' },
          age: { type: 'number', title: 'Age' },
        },
      },
      contactInfo: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email', title: 'Email' },
          phone: { type: 'string', title: 'Phone' },
        },
      },
    },
  };

  return (
    <Form jsonSchema={jsonSchema}>
      <div className="custom-form-layout">
        <div className="section">
          <h3>Personal Information</h3>
          <Form.Render path="/personalInfo/name">
            {({ Input, path, node }) => (
              <div className="form-field">
                <label htmlFor={path}>{node.jsonSchema.title}</label>
                <Input />
              </div>
            )}
          </Form.Render>

          <Form.Render path="/personalInfo/age">
            {({ Input, path, node }) => (
              <div className="form-field">
                <label htmlFor={path}>{node.jsonSchema.title}</label>
                <Input />
              </div>
            )}
          </Form.Render>
        </div>

        <div className="section">
          <h3>Contact Information</h3>
          <Form.Render path="/contactInfo/email">
            {({ Input, path, node }) => (
              <div className="form-field">
                <label htmlFor={path}>{node.jsonSchema.title}</label>
                <Input />
              </div>
            )}
          </Form.Render>

          <Form.Render path="/contactInfo/phone">
            {({ Input, path, node }) => (
              <div className="form-field">
                <label htmlFor={path}>{node.jsonSchema.title}</label>
                <Input />
              </div>
            )}
          </Form.Render>
        </div>
      </div>
    </Form>
  );
};
```

### Working with Arrays

The library provides powerful features for handling array data:

```tsx
import { Form } from '@canard/schema-form';
import { isArrayNode } from '@canard/schema-form';

export const ArrayForm = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      users: {
        type: 'array',
        title: 'User List',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', title: 'Name' },
            email: { type: 'string', format: 'email', title: 'Email' },
          },
        },
      },
    },
  };

  return (
    <Form jsonSchema={jsonSchema}>
      {({ node }) => (
        <div className="array-form">
          <h3>Users</h3>

          {node && isArrayNode(node.find('/users')) && (
            <button onClick={() => node.find('/users').push()} type="button">
              Add User
            </button>
          )}

          <Form.Render path="/users">{({ Input }) => <Input />}</Form.Render>
        </div>
      )}
    </Form>
  );
};
```

#### Array minItems Auto-fill Behavior

When using `minItems` with arrays, the auto-fill behavior depends on whether a default value is provided:

**Rule**: When `defaultValue` or `schema.default` is provided, minItems auto-fill is **disabled**. The provided default value is used as-is, even if it has fewer items than `minItems`.

```tsx
const jsonSchema = {
  type: 'object',
  properties: {
    // Case 1: No default → minItems auto-fill enabled
    autoFillArray: {
      type: 'array',
      items: { type: 'string', default: 'item' },
      minItems: 3,
    },
    // Result: ['item', 'item', 'item'] (auto-filled to minItems)

    // Case 2: schema.default provided → minItems auto-fill disabled
    schemaDefaultArray: {
      type: 'array',
      items: { type: 'string', default: 'item' },
      minItems: 3,
      default: ['one'],
    },
    // Result: ['one'] (uses default, ignores minItems)

    // Case 3: Empty schema.default → minItems auto-fill disabled
    emptyDefaultArray: {
      type: 'array',
      items: { type: 'string', default: 'item' },
      minItems: 3,
      default: [],
    },
    // Result: [] (uses empty default, ignores minItems)
  },
};

// Using Form's defaultValue prop also controls minItems auto-fill
<Form
  jsonSchema={jsonSchema}
  defaultValue={{
    partialArray: ['a', 'b'], // Only 2 items even if minItems=5
  }}
/>;
```

#### Array prefixItems Support (JSON Schema 2020-12)

The library supports `prefixItems` from JSON Schema Draft 2020-12 for position-based tuple validation:

```tsx
const jsonSchema = {
  type: 'object',
  properties: {
    // Tuple with specific types for each position
    coordinates: {
      type: 'array',
      prefixItems: [
        { type: 'number', title: 'X' },
        { type: 'number', title: 'Y' },
        { type: 'number', title: 'Z' },
      ],
      items: false, // No additional items allowed
    },

    // Mixed tuple: fixed prefix + flexible tail
    person: {
      type: 'array',
      prefixItems: [
        { type: 'string', title: 'First Name' },
        { type: 'string', title: 'Last Name' },
      ],
      items: { type: 'string', title: 'Middle Name' }, // Additional items allowed
    },
  },
};
```

**Key behaviors:**

- **Position-based schemas**: Each array index uses its corresponding `prefixItems` schema
- **Fallback to items**: Indices beyond `prefixItems.length` use the `items` schema
- **items: false**: Prevents adding items beyond `prefixItems.length`
- **Auto maxItems**: When `items` is undefined or `false`, `maxItems` is automatically set to `prefixItems.length`

**Validation requirements:**

> To use `prefixItems` validation, import the AJV8 plugin with Draft 2020-12 support:
>
> ```tsx
> import { plugin } from '@canard/schema-form-ajv8-plugin/2020';
> ```

### Form with Imperative Handle

Using the `FormHandle` to programmatically control the form:

```tsx
import React, { useRef } from 'react';

import { Form, FormHandle, ValidationMode } from '@canard/schema-form';

export const ImperativeForm = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      username: {
        type: 'string',
        minLength: 3,
        title: 'Username',
      },
      password: {
        type: 'string',
        format: 'password',
        minLength: 8,
        title: 'Password',
      },
    },
    required: ['username', 'password'],
  };

  const formRef = useRef<FormHandle<typeof jsonSchema>>(null);

  const handleSubmit = () => {
    formRef.current?.validate();
    const values = formRef.current?.getValue();

    // Process valid form values
    console.log('Form values:', values);
  };

  const handleReset = () => {
    formRef.current?.reset();
  };

  return (
    <div className="login-form">
      <Form
        ref={formRef}
        jsonSchema={jsonSchema}
        validationMode={ValidationMode.OnRequest}
      />

      <div className="form-actions">
        <button onClick={handleSubmit} type="button">
          Submit
        </button>
        <button onClick={handleReset} type="button">
          Reset
        </button>
      </div>
    </div>
  );
};
```

### Custom Form Type Input Components

You can extend the form capabilities by creating custom input components:

```tsx
import React from 'react';

import { Form, FormTypeInputDefinition } from '@canard/schema-form';

// Custom date picker component
const DatePickerInput = (props) => {
  const { value, onChange, disabled, readOnly } = props;

  return (
    <div className="custom-date-picker">
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        readOnly={readOnly}
      />
    </div>
  );
};

// FormTypeInput definition
const datePickerDefinition: FormTypeInputDefinition = {
  test: { format: ['date'] },
  Component: DatePickerInput,
};

export const FormWithCustomInput = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      birthDate: {
        type: 'string',
        format: 'date',
        title: 'Birth Date',
      },
    },
  };

  return (
    <Form
      jsonSchema={jsonSchema}
      formTypeInputDefinitions={[datePickerDefinition]}
    />
  );
};
```

### Conditional Fields with Watch

#### Types of Conditional Properties

- `watch`: Subscribe to another node's value changes (passed as watchValues prop)
- `derived`: Automatically calculate values based on other field references using JSONPointer expressions. Use `&derived` or `computed.derived` property
- `active`: Determines if a node should be activated. Inactive nodes are not displayed and their values are removed from the form data
- `visible`: Determines if a node should be displayed. Hidden inputs retain their values but are not visible
- `pristine`: Determines if a node's state should be reset. If the expression evaluates to `true`, the node's state will be reset.
- `readOnly`: Determines if a node should be read-only. Read-only inputs cannot be modified
- `disabled`: Determines if a node should be disabled. Disabled inputs cannot be modified
- `if` + `oneOf`: Display the schema definition that satisfies the if condition among oneOf definitions (ObjectNode only)

#### Priority System

The `active`, `visible`, `readOnly`, and `disabled` properties follow this priority order:

1. Root jsonSchema property (boolean)
2. Shortcut property (`jsonSchema[{fieldName}]`, boolean)
3. Computed property (`jsonSchema.computed[{fieldName}]`, boolean | string)
4. Alias computed property (`jsonSchema['&{fieldName}']`, boolean | string)

Higher priority values override lower priority values when multiple are defined.

#### Basic Example

```tsx
import React from 'react';

import { Form } from '@canard/schema-form';

export const ConditionalForm = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      employmentType: {
        type: 'string',
        enum: ['fulltime', 'parttime', 'contractor'],
        title: 'Employment Type',
        default: 'fulltime',
      },
      commonField: {
        type: 'string',
        title: 'Common Field',
        computed: {
          watch: '../employmentType',
          active: '../employmentType !== null',
          visible: '../employmentType !== null',
        },
      },
    },
    oneOf: [
      {
        computed: {
          if: "./employmentType === 'fulltime'",
        },
        properties: {
          salary: {
            type: 'number',
            title: 'Annual Salary',
          },
          bonus: {
            type: 'number',
            title: 'Bonus',
          },
          benefits: {
            type: 'object',
            title: 'Benefits',
            properties: {
              healthInsurance: {
                type: 'boolean',
                title: 'Health Insurance',
              },
              pension: {
                type: 'boolean',
                title: 'Pension',
              },
            },
          },
          probationPeriod: {
            type: 'number',
            title: 'Probation Period (months)',
            minimum: 0,
            maximum: 12,
          },
        },
      },
      {
        computed: {
          if: "./employmentType === 'parttime'",
        },
        properties: {
          hourlyRate: {
            type: 'number',
            title: 'Hourly Rate',
          },
          workingHours: {
            type: 'number',
            title: 'Weekly Working Hours',
            minimum: 1,
            maximum: 40,
          },
        },
      },
      {
        computed: {
          if: "./employmentType === 'contractor'",
        },
        properties: {
          hourlyRate: {
            type: 'number',
            title: 'Hourly Rate',
          },
          contractType: {
            type: 'string',
            enum: ['hourly', 'project', 'temporary'],
            title: 'Contract Type',
          },
          workingHours: {
            type: 'number',
            title: 'Weekly Working Hours',
            minimum: 1,
            maximum: 168,
            computed: {
              active: '../contractType === "hourly"',
            },
          },
        },
      },
    ],
  };

  return <Form jsonSchema={jsonSchema} />;
};
```

### Form Submission Management

`@canard/schema-form` provides various methods to effectively manage form submission state.

#### Using onSubmit

You can define form submission logic using the `onSubmit` prop:

```tsx
import React, { useState } from 'react';

import { Form, JsonSchemaError, isValidationError } from '@canard/schema-form';

export const FormWithSubmit = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: { type: 'string', title: 'Name' },
      email: { type: 'string', format: 'email', title: 'Email' },
    },
    required: ['name', 'email'],
  };

  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  const handleSubmit = async (value: any) => {
    try {
      // API call or other async operation
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value),
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      console.log('Submission successful!');
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  return (
    <Form
      jsonSchema={jsonSchema}
      onSubmit={handleSubmit}
      onValidate={setErrors}
      errors={errors}
    />
  );
};
```

#### Using useFormSubmit Hook

For more complex submission state management, you can use the `useFormSubmit` hook:

```tsx
import React, { useRef, useState } from 'react';

import {
  Form,
  FormHandle,
  JsonSchemaError,
  isValidationError,
  useFormSubmit,
} from '@canard/schema-form';

export const AdvancedSubmitForm = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: { type: 'string', title: 'Name' },
      email: { type: 'string', format: 'email', title: 'Email' },
      message: { type: 'string', title: 'Message' },
    },
    required: ['name', 'email'],
  };

  const formRef = useRef<FormHandle<typeof jsonSchema>>(null);
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  // Async submission handler
  const handleSubmit = async (value: any) => {
    // Simulate server request
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log('Submitted data:', value);
  };

  // Submission state management
  const { submit, loading } = useFormSubmit(formRef);

  const onSubmitClick = async () => {
    setErrors([]); // Clear previous errors

    try {
      await submit();
      alert('Submission completed!');
    } catch (error) {
      if (isValidationError(error)) {
        console.log('Validation error:', error.details);
      } else {
        console.error('Submission error:', error);
      }
    }
  };

  return (
    <div>
      <Form
        ref={formRef}
        jsonSchema={jsonSchema}
        onSubmit={handleSubmit}
        onValidate={setErrors}
        errors={errors}
      />

      <button
        onClick={onSubmitClick}
        disabled={loading}
        style={{
          marginTop: '16px',
          padding: '8px 16px',
          backgroundColor: loading ? '#ccc' : '#1890ff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Submitting...' : 'Submit'}
      </button>

      {loading && (
        <div style={{ marginTop: '8px', color: '#666' }}>
          Processing... Please wait.
        </div>
      )}
    </div>
  );
};
```

#### Submit with Enter Key

You can submit forms by pressing Enter in string input fields:

```tsx
import React from 'react';

import { Form } from '@canard/schema-form';

export const EnterSubmitForm = () => {
  const jsonSchema = {
    type: 'string',
    title: 'Search Term',
  };

  const handleSubmit = (value: string) => {
    console.log('Search term:', value);
    // Execute search logic
  };

  return (
    <Form
      jsonSchema={jsonSchema}
      onSubmit={handleSubmit}
      placeholder="Enter search term and press Enter"
    />
  );
};
```

#### Handling Submission Errors

How to handle various errors that can occur during submission:

```tsx
import React, { useRef, useState } from 'react';

import {
  Form,
  FormHandle,
  ValidationMode,
  isValidationError,
  useFormSubmit,
} from '@canard/schema-form';

export const ErrorHandlingForm = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      username: { type: 'string', minLength: 3, title: 'Username' },
      password: { type: 'string', minLength: 8, title: 'Password' },
    },
    required: ['username', 'password'],
  };

  const formRef = useRef<FormHandle<typeof jsonSchema>>(null);
  const [submitError, setSubmitError] = useState<string>('');

  const handleSubmit = async (value: any) => {
    // Simulate server request
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(value),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed.');
    }

    return response.json();
  };

  const { submit, loading } = useFormSubmit(formRef);

  const onSubmitClick = async () => {
    setSubmitError(''); // Clear previous errors

    try {
      await submit();
      alert('Login successful!');
    } catch (error) {
      if (isValidationError(error)) {
        // Validation errors are automatically displayed in the form
        console.log('Validation failed');
      } else {
        // Server errors or network errors
        setSubmitError(error.message || 'An unexpected error occurred.');
      }
    }
  };

  return (
    <div>
      <Form
        ref={formRef}
        jsonSchema={jsonSchema}
        onSubmit={handleSubmit}
        validationMode={ValidationMode.OnRequest}
      />

      {submitError && (
        <div
          style={{
            color: 'red',
            marginTop: '8px',
            padding: '8px',
            backgroundColor: '#fff2f2',
            border: '1px solid #ffcccc',
            borderRadius: '4px',
          }}
        >
          {submitError}
        </div>
      )}

      <button
        onClick={onSubmitClick}
        disabled={loading}
        style={{ marginTop: '16px' }}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </div>
  );
};
```

---

## Performance Optimization

The library is optimized for performance with features like:

- Lazy rendering for complex forms
- Memoization of components to prevent unnecessary re-renders
- Plugin-based efficient validation system
- Configurable validation modes to optimize validation timing

### Optimization Tips

1. **ValidationMode Settings**:
   Configure the `validationMode` property to prevent unnecessary validations.

   ```jsx
   // Only validate when the user clicks the submit button
   <Form jsonSchema={jsonSchema} validationMode={ValidationMode.OnRequest} />
   ```

2. **Caching FormTypeInputs**:
   Define frequently used custom FormTypeInputs outside components to prevent unnecessary recreation.

   ```jsx
   // Define once globally
   const CUSTOM_INPUTS = [
     { test: { type: ['string'], format: ['email'] }, Component: EmailInput },
   ];

   // Reuse within component
   <Form jsonSchema={jsonSchema} formTypeInputDefinitions={CUSTOM_INPUTS} />;
   ```

---

## TypeScript Support

`@canard/schema-form` is built with TypeScript and provides comprehensive type definitions. Key type utilities include:

- `InferValueType<Schema>`: Infers the value type from a JSON Schema
- `InferSchemaNode<Schema>`: Infers the schema node type from a JSON Schema
- `FormHandle<Schema>`: Type for form ref handle with schema-specific methods

---

## Acknowledgements

`@canard/schema-form` was developed with significant inspiration from the ideas and architecture of [bluewings/react-genie-form](https://github.com/bluewings/react-genie-form).

Special thanks to [bluewings](https://github.com/bluewings) for sharing such a thoughtful and well-crafted open source project.

---

## License

This repository is licensed under the MIT License. Please refer to the [`LICENSE`](./LICENSE) file for details.

---

## Contact

For inquiries or suggestions related to the project, please create an issue.

### Using Form with TypeScript

Leveraging TypeScript for type-safe form development:

```tsx
import React, { useState } from 'react';

import { Form, InferValueType } from '@canard/schema-form';

export const TypeSafeForm = () => {
  // Define schema with const assertion for better type inference
  const jsonSchema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      age: { type: 'number' },
      isActive: { type: 'boolean' },
    },
    required: ['name', 'email'],
  } as const;

  // Infer value type from schema
  type FormValues = InferValueType<typeof jsonSchema>;

  const [values, setValues] = useState<FormValues>({
    name: '',
    email: '',
  });

  return (
    <Form jsonSchema={jsonSchema} defaultValue={values} onChange={setValues} />
  );
};
```

### Integration with UI Libraries

`@canard/schema-form` can be easily integrated with popular UI libraries using plugins:

```tsx
import React from 'react';

import { Form, registerPlugin } from '@canard/schema-form';
import { AntdPlugin } from '@canard/schema-form-antd-plugin';

// Register Ant Design plugin
registerPlugin(AntdPlugin);

export const AntdForm = () => {
  const jsonSchema = {
    // ...
  };

  // It will automatically select the appropriate component based on the plugin's matching conditions.
  return <Form jsonSchema={jsonSchema} />;
};
```
