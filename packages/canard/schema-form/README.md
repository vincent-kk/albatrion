# @canard/schema-form

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()
[![JSON Schema](https://img.shields.io/badge/JSONSchema-{}-blue.svg)]()
[![JSON Schema Form](https://img.shields.io/badge/JSONSchemaForm-form-red.svg)]()

---

## Overview

`@canard/schema-form` is a React-based component library that renders forms based on a provided [JSON Schema](https://json-schema.org/).

JSON Schema validation is supported through a plugin system, allowing the use of various validator plugins.

By defining various `FieldInput` components, it offers the flexibility to accommodate complex requirements with ease.

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
  Schema extends JSONSchema = JSONSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  /** JSON Schema to use in this SchemaForm */
  jsonSchema: Schema;
  /** Default value for this SchemaForm */
  defaultValue?: Value;
  /** Apply readOnly property to all FieldInput components */
  readOnly?: boolean;
  /** Apply disabled property to all FieldInput components */
  disabled?: boolean;
  /** Function called when the value of this SchemaForm changes */
  onChange?: SetStateFn<Value>;
  /** Function called when this SchemaForm is validated */
  onValidate?: Fn<[errors: readonly ValidationIssue[]]>;
  /** Function called when the form is submitted */
  onSubmit?: Fn<[value: Value], Promise<void> | void>;
  /** Function called when the state of this SchemaForm changes */
  onStateChange?: Fn<[state: NodeStateFlags]>;
  /** FieldInput definition list */
  fieldInputDefinitions?: FieldInputDefinition[];
  /** FieldInput path mapping */
  fieldInputMap?: FieldInputMap;
  /** Group renderer component */
  FieldRenderer?: ComponentType<FieldRendererProps>;
  /** Label renderer component */
  FormLabelRenderer?: ComponentType<FieldRendererProps>;
  /** Input renderer component */
  FormInputRenderer?: ComponentType<FieldRendererProps>;
  /** Error renderer component */
  FormErrorRenderer?: ComponentType<FieldRendererProps>;
  /** Initial validation errors, default is undefined */
  errors?: readonly ValidationIssue[];
  /** Custom format error function */
  formatError?: FieldRendererProps['formatError'];
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
   * Execute Validation Mode (default: ValidationMode.OnChange | ValidationMode.OnRequest)
   *  - `ValidationMode.None`: Disable validation
   *  - `ValidationMode.OnChange`: Validate when value changes
   *  - `ValidationMode.OnRequest`: Validate on request
   */
  validationMode?: ValidationMode;
  /** Custom validator object (`compile` and `compileGuard`); Form prop > FormProvider > plugin */
  validatorFactory?: ValidatorFactory;
  /**
   * Render-level virtualization (deferred mount) for large forms (default: off)
   *  - `true`: Enable with default options
   *  - `VirtualizationOptions`: Enable with custom options
   *  - Requires IntersectionObserver; silently disabled when unavailable (e.g. SSR)
   */
  virtualization?: boolean | VirtualizationOptions;
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
  Schema extends JSONSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  node?: InferFieldNode<Schema>;
  focus: Fn<[dataPath: FieldNode['path']]>;
  select: Fn<[dataPath: FieldNode['path']]>;
  reset: Fn;
  findNode: Fn<[path: FieldNode['path']], FieldNode | null>;
  findNodes: Fn<[path: FieldNode['path']], FieldNode[]>;
  getState: Fn<[], NodeStateFlags>;
  setState: Fn<[state: NodeStateFlags]>;
  clearState: Fn;
  getValue: Fn<[], Value>;
  setValue: SetStateFnWithOptions<Value>;
  getErrors: Fn<[], readonly ValidationIssue[]>;
  getAttachedFilesMap: Fn<[], AttachedFilesMap>;
  validate: Fn<[], Promise<readonly ValidationIssue[]>>;
  showError: Fn<[visible: boolean]>;
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
  Schema extends JSONSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  node?: InferFieldNode<Schema>;
  jsonSchema: Schema;
  defaultValue?: Value;
  value?: Value;
  errors?: readonly ValidationIssue[];
}
```

### Basic Usage

```tsx
import { Form, registerPlugin } from '@canard/schema-form';
import { plugin as ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';

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

ValidatorFactory is an object with two required methods, `compile` for the schema and `compileGuard` for the synchronous guard behind `if/then/else`, plus optional `release` and `dialect`:

```ts
// The engine passes its own copy of the schema; it is typed as JSONSchema here.
interface ValidatorFactory {
  compile(copy: JSONSchema): ValidateFunction;
  compileGuard(root: JSONSchema, pointer: string): (value: unknown) => boolean;
  release?(root: JSONSchema): void;
  readonly dialect?: string;
}

type ValidateFunction<Value = unknown> = (
  data: Value,
) =>
  | Promise<readonly ValidationIssue[] | null>
  | readonly ValidationIssue[]
  | null;
```

A `ValidateFunction` returns the ordered `ValidationIssue`s, or `null` when the value is valid, and must not throw. The `validatorFactory` prop of `Form` and `FormProvider` takes this object. The selection order is the Form prop, then FormProvider, then the plugin's `validator`. Keep the reference stable, because changing it rebuilds the tree.

### Validator Plugin Usage

#### 1. Basic Plugin Registration

```tsx
import { registerPlugin } from '@canard/schema-form';
import { plugin as ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';

// Register plugin at app startup
registerPlugin(ajvValidatorPlugin);
```

#### 2. Custom AJV Instance

When you want to use your own AJV instance, supply it to the plugin before registering it:

```tsx
import { Form, registerPlugin } from '@canard/schema-form';
// The version of ajv must be 8.x because the plugin is based on ajv8.x
// If you want to use ajv7.x, you can use @canard/schema-form-ajv7-plugin
// Or if you want to use ajv6.x, you can use @canard/schema-form-ajv6-plugin
import { plugin } from '@canard/schema-form-ajv8-plugin';
import Ajv from 'ajv';

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

// Supply the instance before registering the plugin
plugin.validator.bind(customAjv);
registerPlugin(plugin);

export const CustomValidationForm = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: { type: 'string', maxLength: 10 },
      evenNumber: { type: 'number', isEven: true, maximum: 100 },
    },
  } as const;

  return <Form jsonSchema={jsonSchema} />;
};
```

An instance configured with `coerceTypes`, `useDefaults`, or `removeAdditional` is refused, because validation must not modify the value.

#### 3. Custom ValidatorFactory for a Form or a FormProvider

To replace the validator for one Form, or for every Form under a FormProvider, pass an object that declares both `compile` and `compileGuard`:

```tsx
import { Form, FormProvider, type ValidatorFactory } from '@canard/schema-form';

// Declared once, outside components: changing the reference rebuilds the tree.
const validatorFactory: ValidatorFactory = {
  compile: (copy) => compileWithMyEngine(copy),
  compileGuard: (root, pointer) => compileGuardWithMyEngine(root, pointer),
};

export const CustomValidationForm = () => (
  <Form jsonSchema={jsonSchema} validatorFactory={validatorFactory} />
);

export const App = () => (
  <FormProvider validatorFactory={validatorFactory}>
    <MyForms />
  </FormProvider>
);
```

`createValidatorFactory(ajv)` from the AJV plugin returns only a compile function, so it is not a valid `validatorFactory` by itself.

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

- Validation messages must be defined in the `presentation.errorMessages` property of the jsonSchema.
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
      presentation: {
        errorMessages: {
          minLength:
            'Name must be at least {limit} characters long. Current value: {value}',
          maxLength:
            'Name must be no more than {limit} characters long. Current value: {value}',
          required: 'Name is a required field.',
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
      presentation: {
        errorMessages: {
          minLength: {
            ko_KR:
              '이름은 최소 {limit} 글자 이상이어야 합니다. 현재 값: {value}',
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

## FieldInput System

`@canard/schema-form` provides a powerful and flexible FieldInput system. This system allows users to precisely control which input component should be used for each JSON Schema node.

### FieldInputDefinition

FieldInputDefinition defines an input component to be used for JSON Schema nodes that match specific conditions:

```ts
type FieldInputDefinition<T = unknown> = {
  test: FieldInputTestFn | FieldInputTestObject;
  Component: ComponentType<InferFieldInputProps<T>>;
};
```

Each definition consists of two key parts:

- **test**: Defines the conditions for which JSON Schema nodes this input component should apply
- **Component**: The React component to be used when conditions are met

#### Test Function or Test Object

The conditions for a FieldInput can be defined using a function or an object:

```ts
type FieldInputHint = {
  jsonSchema: JSONSchema;
  type: string;
  format: string;
  inputType: string;
  path: string;
  [alt: string]: any;
};
type FieldInputTestFn = Fn<[hint: FieldInputHint], boolean>;

type FieldInputTestObject = Partial<{
  type: Array<string>;
  jsonSchema: JSONSchema;
  format: Array<string>;
  inputType: Array<string>;
  [alt: string]: any;
}>;
```

inputType is a string hint that a definition's test interprets; it is not the HTML input type.

- **FieldInputTestFn**: A function that receives a FieldInputHint object and returns a boolean. Useful for implementing more complex conditions.
- **FieldInputTestObject**: Allows conditions to be defined simply as an object. For example, `{ type: ['string'], format: ['email'] }` matches nodes that are both string type and email format.

#### FieldInput Props

The selected component will receive the following props:

```ts
interface FieldInputProps<
  Value extends AllowedValue = any,
  Context extends Dictionary = object,
  WatchValues extends Array<any> = Array<any>,
  Schema extends JSONSchemaWithVirtual = InferJSONSchema<Value>,
  Node extends FieldNode = InferFieldNode<Schema>,
> {
  /** JSON Schema for the FieldInput Component */
  jsonSchema: Schema;
  /** readOnly state for the FieldInput Component */
  readOnly: boolean;
  /** disabled state for the FieldInput Component */
  disabled: boolean;
  /** Whether the field node assigned to the FieldInput Component is required */
  required: boolean;
  /** Field node assigned to the FieldInput Component */
  node: Node;
  /** JSON Schema type of this field (e.g., 'string', 'number', 'object', 'array') */
  type: Node['schemaType'];
  /** Name of the field node assigned to the FieldInput Component */
  name: Node['name'];
  /** Path of the field node assigned to the FieldInput Component */
  path: Node['path'];
  /** Whether this field accepts null as a valid value (derived from schema type array including 'null') */
  nullable: Node['nullable'];
  /** Errors of the field node assigned to the FieldInput Component */
  errors: Node['errors'];
  /** Whether to show errors for this field */
  errorVisible: boolean;
  /** Values being watched according to the `controls.watch` paths defined in JSONSchema */
  watchValues: WatchValues;
  /** Default value for the FieldInput Component */
  defaultValue: Value | undefined;
  /** Value for the FieldInput Component */
  value: Value | undefined;
  /** onChange handler for the FieldInput Component */
  onChange: SetStateFnWithOptions<Value | undefined>;
  /** Attach or detach file(s) to the form's file store */
  onFileAttach: Fn<[file: File | File[] | undefined]>;
  /** Child FieldInput Components for this FieldInput Component */
  ChildFields: ChildField[];
  /** Placeholder text for input fields */
  placeholder: string | undefined;
  /** CSS class name for styling */
  className: string | undefined;
  /** Style for the FieldInput Component */
  style: CSSProperties | undefined;
  /** UserDefinedContext passed to the Form */
  context: Context;
  /** Additional properties can be freely defined */
  [alt: string]: any;
}
```

### File Management (onFileAttach)

`@canard/schema-form` keeps the actual File objects in a dedicated store and writes only file metadata (name, size, type, lastModified) into the schema value. Use `onFileAttach` in your `FieldInput` to attach files, and then call `FormHandle.getAttachedFilesMap()` on submit to send files to your API.

- **Storage**: `getAttachedFilesMap()` returns `Map<string, File[]>` where the key is the input's standard JSONPointer path (`node.path`). Keys must be standard RFC 6901 JSONPointer only; extended syntax (`..`, `.`, `*`) is not used for keys.
- **Automatic cleanup**:
  - When the form is re-initialized or a node is removed (including unmount), files at that path are deleted.
  - Conditional schemas (e.g., `if/then/else`, `oneOf`) that remove fields also trigger file cleanup.

#### Single/Multiple File FieldInput example

```tsx
const FileFieldInput = ({
  onFileAttach,
  onChange,
  readOnly,
  disabled,
  value,
  jsonSchema,
}: FieldInputProps<any>) => {
  const multiple: boolean =
    jsonSchema?.presentation?.FieldInputProps?.multiple ?? false;
  const accept: string | undefined =
    jsonSchema?.presentation?.FieldInputProps?.accept;

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
      presentation: {
        FieldInput: FileFieldInput,
        FieldInputProps: { multiple: false, accept: '*/*' },
      },
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

### FieldInputMap

You can also directly map components to specific fields based on their path:

```ts
type FieldInputMap = {
  [path: string]: ComponentType<FieldInputProps>;
};
```

This allows explicit assignment of components to specific paths in your JSON Schema.

### FieldInput Selection Process and Priority

When a form is rendered, the input component for each JSON Schema node is determined with the following priority:

1. **Directly assigned FieldInput**: When a component is directly assigned via the `presentation.FieldInput` property in the JSON Schema object

   ```js
   const jsonSchema = {
     type: 'string',
     presentation: {
       FieldInput: CustomTextInput, // Highest priority
     },
   };
   ```

2. **FieldInputMap**: When there's a matching path in the `fieldInputMap` passed to the `Form` component

   ```jsx
   <Form
     jsonSchema={jsonSchema}
     fieldInputMap={{
       '/user/email': EmailInput,
       '/user/profile/avatar': AvatarUploader,
     }}
   />
   ```

3. **Form's FieldInputDefinitions**: The first definition in the `fieldInputDefinitions` array passed to the `Form` component that satisfies the test conditions

   ```jsx
   <Form
     jsonSchema={jsonSchema}
     fieldInputDefinitions={[
       { test: { type: ['string'], format: ['email'] }, Component: EmailInput },
       { test: { type: ['string'], format: ['date'] }, Component: DatePicker },
     ]}
   />
   ```

4. **FormProvider's FieldInputDefinitions**: The `fieldInputDefinitions` provided globally through `FormProvider`

5. **Plugin's FieldInputDefinitions**: The `fieldInputDefinitions` provided by registered plugins

**Important**: If multiple FieldInputs satisfy the same conditions, the one found first according to the priority above will be used. When provided as an array, definitions are evaluated in the order they appear in the array.

This powerful mechanism enables **high levels of customization**:

- Override default input components globally
- Define custom input components specific to certain forms
- Explicitly specify components for specific fields based on their path
- Assign components directly to JSON Schema properties for the most specific level of control

### Example: Utilizing Different Priorities

```tsx
import { Form, FormProvider, registerPlugin } from '@canard/schema-form';
import { plugin as antd5Plugin } from '@canard/schema-form-antd5-plugin';

// Register plugin (lowest priority)
registerPlugin(antd5Plugin);

export const CustomizedForm = () => {
  // Global FieldInput definitions (medium priority)
  const globalDefinitions = [
    {
      test: { type: ['string'] },
      Component: GlobalTextInput,
    },
  ];

  // Form-specific FieldInput definitions (higher priority)
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
                presentation: {
                  FieldInput: CountrySelector, // Will use directly assigned component (top priority)
                },
              },
            },
          },
        },
      },
    },
  };

  return (
    <FormProvider fieldInputDefinitions={globalDefinitions}>
      <Form
        jsonSchema={jsonSchema}
        fieldInputDefinitions={formDefinitions}
        fieldInputMap={formInputMap}
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
import { plugin as ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';
import { plugin as antd5Plugin } from '@canard/schema-form-antd5-plugin';

registerPlugin(antd5Plugin);
registerPlugin(ajvValidatorPlugin);
```

### Available Plugins

#### UI Plugins

- [**@canard/schema-form-antd5-plugin**](../schema-form-antd5-plugin/README.md): Ant Design based basic components
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
  /** Form.Field Component */
  FieldRenderer?: ComponentType<FieldRendererProps>;
  /** Form.Label Component */
  FormLabelRenderer?: ComponentType<FieldRendererProps>;
  /** Form.Input Component */
  FormInputRenderer?: ComponentType<FieldRendererProps>;
  /** Form.Error Component */
  FormErrorRenderer?: ComponentType<FieldRendererProps>;
  /** FieldInputDefinition */
  fieldInputDefinitions?: FieldInputDefinition[];
  /** Validator Plugin */
  validator?: ValidatorPlugin;
  /** Formatting Error Function */
  formatError?: FormatError;
}

export interface ValidatorPlugin {
  /** Inject Custom Validator Instance */
  bind?: Fn<[instance: any]>;
  /** Validator Factory Function */
  compile(jsonSchema: JSONSchema): ValidateFunction;
  /** Synchronous guard compiler for an authored schema pointer */
  compileGuard(root: JSONSchema, pointer: string): (value: unknown) => boolean;
  /** Release a root's validator resources */
  release?(root: JSONSchema): void;
  /** Declared JSON Schema dialect */
  readonly dialect?: string;
}
```

### Plugin Registration Rules

If multiple plugins are registered for the same property, the following priority rules apply:

| Property                                                                       | Allowed Count      | Priority Rule                                    |
| ------------------------------------------------------------------------------ | ------------------ | ------------------------------------------------ |
| `FieldRenderer`, `FormLabelRenderer`, `FormInputRenderer`, `FormErrorRenderer` | One only           | The last registered component is applied.        |
| `fieldInputDefinitions`                                                        | Multiple mergeable | Merged, and the last registered item is applied. |
| `validator`, `formatError`                                                     | One only           | The last registered item is applied.             |

This structure provides consistent priority and extensibility even when using multiple plugins.

The default group renderer draws its own label and messages, so `FormLabelRenderer` and `FormErrorRenderer` appear only through the composition API (`Form.Label`, `Form.Error`) or a user group renderer that calls them.

Renderer props are read once when the form mounts; replacing a renderer after mount is not guaranteed to take effect.

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

- `FieldInputMap` keys (with wildcard `*`)
- `controls` expressions (with relative paths `..`, `.`)
- Programmatic node navigation with `node.find()` method

**Note**: Extended syntax is **NOT** supported in `<Form.Render path="..." />` components, which only accept standard JSONPointer paths. `node.find()` accepts relative navigation (`..`, `.`) but not wildcards — use `findNodes()` for wildcard matching.

The following extensions are supported:

#### Parent Navigation (`..`)

Navigate to the parent node, primarily used in `controls` expressions:

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
          controls: {
            watch: ['../type'], // Watch parent's type field
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
      controls: {
        watch: ['.'], // Watch current node
        // Other controls logic
      },
    },
  },
};

// Programmatic navigation
const currentNode = node.find('.'); // Reference current node
```

#### Wildcard (`*`)

Match any segment in a path, primarily used in FieldInputMap. The wildcard matches both array indices and dynamic object keys (e.g., `additionalProperties`):

```tsx
const formInputMap = {
  // Array index matching
  '/users/*/name': CustomNameInput, // Matches /users/0/name, /users/1/name, etc.
  '/settings/*/enabled': ToggleInput, // Matches all array item's enabled field

  // Dynamic key matching (additionalProperties)
  '/config/*/value': ConfigValueInput, // Matches /config/theme/value, /config/lang/value, etc.
  '/permissions/*/granted': PermissionToggle, // Matches any permission key
};

// Example schema with additionalProperties
const jsonSchema = {
  type: 'object',
  properties: {
    config: {
      type: 'object',
      additionalProperties: {
        type: 'object',
        properties: {
          value: { type: 'string' },
          enabled: { type: 'boolean' },
        },
      },
    },
  },
};
// '/config/*/value' matches: /config/theme/value, /config/language/value, etc.
```

**Note**: Wildcard `*` is available in `FieldInputMap` keys and in the plural `findNodes()` method. It is NOT supported in `<Form.Render path="..." />` or the singular `node.find()` method.

#### Context Reference (`@`)

Reference external context data passed to the Form, primarily used in `controls` expressions.

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

**Usage in `controls` expressions:**

```tsx
const jsonSchema = {
  type: 'object',
  properties: {
    secretField: {
      type: 'string',
      controls: {
        visible: '@.userRole === "admin"', // Show only for admin users
        readOnly: '@.mode === "view"', // Read-only in view mode
        disabled: '@.permissions?.canEdit === false', // Disabled based on permissions
      },
    },
    combinedCondition: {
      type: 'string',
      controls: {
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

- Context values update reactively - when context changes, `controls` expressions re-evaluate
- Supports optional chaining (`?.`) for safe nested access
- Available only in `controls` expressions, not in `FieldInputMap` or `Form.Render`

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
              controls: {
                watch: ['../role'],  // Watch sibling field
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
                controls: {
                  watch: ['../type'],  // Watch sibling type
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

// FieldInputMap with wildcard
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

### FieldInputMap with Extended Paths

When using `FieldInputMap`, you can use wildcard syntax to match any path segment (array indices or dynamic object keys):

```tsx
const formInputMap = {
  '/user/email': EmailInput, // Standard path
  '/user/profile/avatar': AvatarUploader, // Nested path

  // Array index wildcard
  '/settings/*/enabled': ToggleInput, // ✅ All array items' enabled field
  '/users/*/permissions': PermissionSelector, // ✅ All user permissions

  // Dynamic key wildcard (additionalProperties)
  '/metadata/*/value': MetadataInput, // ✅ Any metadata key's value
  '/features/*/*': FeatureInput, // ✅ Nested wildcards supported
};

<Form jsonSchema={jsonSchema} fieldInputMap={formInputMap} />;
```

**Wildcard matching examples:**

- `/users/*/name` matches `/users/0/name`, `/users/1/name` (array indices)
- `/config/*/enabled` matches `/config/theme/enabled`, `/config/lang/enabled` (object keys)
- `/data/*/*/status` matches any deeply nested status field

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

**Note**: When two inputs (for example two `Form.Input` components or two `Input` slots) are bound to the same path, they do not mirror each other while typing. Typing does not issue a Refresh and each input owns its draft, so the other input keeps showing its own text until a Refresh reaches it, for example from a `setValue` that changes the value, a `reset`, or `refresh(path)` on the form handle.

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

#### Array Output Filters (omitTrailing / omitEmpty)

Array schemas accept output filters under `options`. They refine only what the array **emits** — parent propagation, root validation, and the external surfaces (`onChange`, `getValue()`, `submit`) — while child nodes and the raw `node.value` keep every item, so pre-exposed empty inputs stay rendered:

```tsx
const jsonSchema = {
  type: 'object',
  properties: {
    tags: {
      type: 'array',
      title: 'Tags',
      minItems: 3, // three empty inputs render up front
      items: { type: 'string' },
      options: { omitTrailing: true },
    },
  },
};

// The UI renders 3 inputs; the user fills only the first one.
// onChange / getValue() / validation see: { tags: ['first'] }
// node.find('/tags').value stays ['first', undefined, undefined]
```

**Key behaviors:**

- **`omitTrailing` (opt-in)**: removes **trailing** consecutive `undefined` items only. Leading and middle `undefined` items are preserved so error `dataPath`s and validation indices stay aligned — `[1, undefined, 2]` is emitted as-is.
- **`omitEmpty` (on by default)**: converts an empty array to `undefined` on the parent-propagation path. Filter order is `omitTrailing → omitEmpty`, so an all-empty array collapses to `undefined` under its parent (a root-level form still emits `[]`).
- **Two value channels**: `node.value` stays raw; the refined output is exposed as `node.outputValue`. Validation runs against the refined value, so `minItems` counts only the filled prefix.
- **Reset semantics**: a Reset-flagged clear (form reset, oneOf/anyOf branch reactivation) refills `minItems` empty items; a plain `setValue(undefined)` clears every item.
- **Custom inputs**: derive row count from `node.children` (or `ChildFields`), never from `value.length` — the emitted value is shorter than the rendered rows by design.

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

### Custom FieldInput Components

You can extend the form capabilities by creating custom input components:

```tsx
import React from 'react';

import { FieldInputDefinition, Form } from '@canard/schema-form';

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

// FieldInput definition
const datePickerDefinition: FieldInputDefinition = {
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
      fieldInputDefinitions={[datePickerDefinition]}
    />
  );
};
```

### Conditional Fields with Watch

#### Types of Conditional Properties

Each property below is a key of the `controls` object.

- `watch`: Subscribe to another node's value changes (passed as watchValues prop)
- `derived`: Automatically calculate values based on other field references using JSONPointer expressions. Use the `controls.derived` property
- `active`: Determines if a node should be activated. Inactive nodes are not displayed and their values are removed from the form data
- `visible`: Determines if a node should be displayed. Hidden inputs retain their values but are not visible
- `resetInteraction`: Resets a node's interaction state. When the expression turns from `false` to `true`, the node's `dirty` and `touched` states are cleared.
- `readOnly`: Determines if a node should be read-only. Read-only inputs cannot be modified
- `disabled`: Determines if a node should be disabled. Disabled inputs cannot be modified
- `active` on a `oneOf`/`anyOf` branch, or `discriminator` on the host: Select the branch to display. Give each branch a `controls.active` expression, or set `controls.discriminator` to a property name and tag each branch with `const`/`enum` on that property (ObjectNode only). Without either gate, every branch is on: all branches' fields are present, and only the validator decides which branch matches.

#### Layering Rules

`controls` can be declared on the node itself, on a parent's `controls.fields` entry that targets the node, and on a fragment (such as an `allOf` entry) that declares the node. The layers combine instead of overriding each other: the standard `readOnly` and the `readOnly` / `disabled` controls combine by OR, and `visible` combines by AND.

For `default`, the node's own `controls.default` wins, then the parent's `fields` entry, then the fragment's `controls.default`, then the standard `default`.

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
        controls: {
          watch: ['../employmentType'],
          active: '../employmentType !== null',
          visible: '../employmentType !== null',
        },
      },
    },
    oneOf: [
      {
        controls: {
          active: "./employmentType === 'fulltime'",
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
        controls: {
          active: "./employmentType === 'parttime'",
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
        controls: {
          active: "./employmentType === 'contractor'",
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
            controls: {
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

### Value Injection with injectTo

The `injectTo` feature enables automatic value propagation between form fields. When a source field's value changes, you can automatically inject derived values into other fields in the form.

#### Basic Usage

Define an `injectTo` handler function inside `controls` in your JSON Schema that returns an object mapping target paths to values:

```tsx
const jsonSchema = {
  type: 'object',
  properties: {
    source: {
      type: 'string',
      title: 'Source',
      controls: {
        injectTo: (value: string) => ({
          '../target': `injected: ${value}`,
        }),
      },
    },
    target: {
      type: 'string',
      title: 'Target (auto-injected)',
    },
  },
};

// When user types "hello" in source field,
// target field automatically becomes "injected: hello"
```

#### Path Types

`injectTo` supports both relative and absolute JSON Pointer paths:

**Relative paths** (from current node):

```tsx
controls: {
  injectTo: (value) => ({
    '../sibling': value, // Sibling field
    '../nested/child': value, // Nested sibling's child
    '../../uncle': value, // Parent's sibling
  }),
},
```

**Absolute paths** (from root):

```tsx
controls: {
  injectTo: (value) => ({
    '/rootField': value, // Root level field
    '/user/profile/name': value, // Deeply nested field
  }),
},
```

#### Multiple Targets

Inject to multiple fields simultaneously:

```tsx
const jsonSchema = {
  type: 'object',
  properties: {
    fullName: {
      type: 'string',
      controls: {
        injectTo: (value: string) => ({
          '../displayName': value,
          '../searchName': value.toLowerCase(),
          '../initials': value
            .split(' ')
            .map((n) => n[0])
            .join(''),
        }),
      },
    },
    displayName: { type: 'string' },
    searchName: { type: 'string' },
    initials: { type: 'string' },
  },
};
```

#### Array Format

For dynamic paths or when order matters, use array format:

```tsx
controls: {
  injectTo: (value: number) => [
    ['/calculations/doubled', value * 2],
    ['/calculations/squared', value * value],
  ],
},
```

#### Accessing Context

The handler receives a context object with access to parent values, root form value, and user-defined context:

```tsx
import type { InjectToHandler } from '@canard/schema-form';

const handler: InjectToHandler<string> = (value, ctx) => {
  // ctx.dataPath - Current node's JSON Pointer path
  // ctx.schemaPath - Current node's schema path
  // ctx.jsonSchema - Current node's JSON Schema
  // ctx.parentValue - Parent node's value (null if root)
  // ctx.parentJSONSchema - Parent's JSON Schema (null if root)
  // ctx.rootValue - Entire form value
  // ctx.rootJSONSchema - Root JSON Schema
  // ctx.context - User-defined context passed to Form

  // Conditional injection based on parent
  if (ctx.parentValue?.locked) {
    return null; // Skip injection
  }

  // Use root form value for calculations
  return {
    '/total': ctx.rootValue.baseAmount + parseFloat(value),
  };
};
```

#### Using Form Context

Access form-wide context data for conditional injection:

```tsx
const jsonSchema = {
  type: 'object',
  properties: {
    secretField: {
      type: 'string',
      controls: {
        injectTo: (value, ctx) => {
          // Only inject for admin users
          if (ctx.context.userRole === 'admin') {
            return { '/adminCopy': value };
          }
          return null;
        },
      },
    },
  },
};

// Pass context to Form
<Form jsonSchema={jsonSchema} context={{ userRole: 'admin' }} />;
```

#### Circular References

Injection cycles are not detected. Each settlement re-runs the rules until no source value changes, up to 25 rounds:

```tsx
const jsonSchema = {
  type: 'object',
  properties: {
    fieldA: {
      type: 'string',
      controls: {
        injectTo: (value) => ({ '../fieldB': `from A: ${value}` }),
      },
    },
    fieldB: {
      type: 'string',
      controls: {
        injectTo: (value) => ({ '../fieldA': `from B: ${value}` }),
      },
    },
  },
};

// User types in fieldA:
// 1. fieldA → fieldB, then fieldB → fieldA, and every hop produces a new value
// 2. After 25 rounds the settlement exceeds its budget
```

A cycle that converges (the same value comes back) stops on its own. One that keeps producing new values, like the example above, exceeds the budget: the caller's write is kept, every automatic write from that settlement is reverted, `diagnostics` becomes `degraded` with `exceededBudget: 'derive'`, and the write throws. Design injection chains as acyclic graphs.

#### Error Handling

When an `injectTo` handler throws, that rule is skipped for the round, the settlement becomes `degraded` with `cause: 'expression'`, and the write ends by throwing a `SchemaFormError` with code `EXPRESSION_THREW`:

```tsx
controls: {
  injectTo: (value) => {
    if (!value) {
      throw new Error('Value is required');
    }
    return { '../target': value };
  },
},

// The rule is skipped for that round, the settlement is degraded,
// and the write throws a SchemaFormError (EXPRESSION_THREW)
```

#### TypeScript Support

Full type safety with generics:

```tsx
import type { InjectToHandler } from '@canard/schema-form';

interface FormContext {
  userId: string;
  permissions: string[];
}

const typedHandler: InjectToHandler<
  string, // Value type
  ParentType, // Parent value type
  RootType, // Root form value type
  FormContext // Context type
> = (value, ctx) => {
  // ctx.context is typed as FormContext
  if (ctx.context.permissions.includes('write')) {
    return { '/audit/lastModifiedBy': ctx.context.userId };
  }
  return null;
};
```

---

### Form Submission Management

`@canard/schema-form` provides various methods to effectively manage form submission state.

#### Using onSubmit

You can define form submission logic using the `onSubmit` prop:

```tsx
import React, { useState } from 'react';

import {
  Form,
  type ValidationIssue,
  isValidationError,
} from '@canard/schema-form';

export const FormWithSubmit = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: { type: 'string', title: 'Name' },
      email: { type: 'string', format: 'email', title: 'Email' },
    },
    required: ['name', 'email'],
  };

  const [errors, setErrors] = useState<readonly ValidationIssue[]>([]);

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
  type ValidationIssue,
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
  const [errors, setErrors] = useState<readonly ValidationIssue[]>([]);

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

Enter submits through the Form's `form` element. With more than one text-like field, the browser submits on Enter only when the form has a submit button (implicit submission counts the fields that block it; one text field plus a checkbox still submits).

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

2. **Caching FieldInputs**:
   Define frequently used custom FieldInputs outside components to prevent unnecessary recreation.

   ```jsx
   // Define once globally
   const CUSTOM_INPUTS = [
     { test: { type: ['string'], format: ['email'] }, Component: EmailInput },
   ];

   // Reuse within component
   <Form jsonSchema={jsonSchema} fieldInputDefinitions={CUSTOM_INPUTS} />;
   ```

### Virtualization for Very Large Forms

For forms with hundreds of fields, the initial React mount is the dominant cost — the node tree itself is cheap. The `virtualization` prop defers mounting of off-screen fields: they render as lightweight placeholders and are replaced by the real components when they approach the viewport, during browser idle time (backfill), or when focused programmatically. Once mounted, a field never returns to a placeholder.

The node tree is always fully built, so values, validation, `getValue()`/`setValue()` and submit behave identically whether a field is mounted or still deferred. Works with every FieldInput plugin — the gate sits below the layout, so custom layouts need no changes.

```tsx
// Defaults: threshold 30, eagerCount 20, rootMargin '100%',
//           backfill VirtualizationBackfill.Idle, estimateHeight 40
<Form jsonSchema={largeSchema} virtualization />

// Tuned
<Form
  jsonSchema={largeSchema}
  virtualization={{
    threshold: 30, // gate a branch only when it has ≥ N children
    eagerCount: 20, // leading fields mounted immediately (no first-frame blank)
    rootMargin: '100%', // pre-mount fields within one extra viewport
    backfill: VirtualizationBackfill.Idle, // or .None: reveal only on scroll/commands
    estimateHeight: 40, // placeholder height px, or (node) => number
    Placeholder: FieldSkeleton, // optional component rendered inside placeholders
  }}
/>
```

Placeholders are unstyled by default (an empty box carrying `data-path` and a `data-deferred` state marker). To render skeletons, either style the marker with a CSS attribute selector (`[data-deferred] { … }`) or pass `virtualization.Placeholder` — a React component (Suspense-fallback style) rendered inside each deferred box with `{ node, height }` props. Space reservation always stays with `estimateHeight`, and the component mounts once per deferred field, so keep it light.

Measured with `compare-frameworks` (production React, 500 flat fields): mount drops from ~55ms/500 field-renders to ~19ms/20 field-renders; keystroke/setValue stay at exactly 1 render.

> **Caveats**
>
> - Requires `IntersectionObserver`; when unavailable the option is silently ignored and everything mounts eagerly. Do not enable it in SSR/hydration apps — the server renders all fields while the client would gate them, causing a hydration mismatch.
> - Placeholders occupy `estimateHeight` until revealed, so scrollbar length is approximate for unmounted regions. Fields hidden by `controls.visible` render no placeholder.
> - With `backfill: VirtualizationBackfill.None`, screen readers, tab order past the mounted range, and browser autofill only see fields once they are scrolled into view; the default `Idle` backfill restores the full DOM within a few idle frames.

---

## TypeScript Support

`@canard/schema-form` is built with TypeScript and provides comprehensive type definitions. Key type utilities include:

- `InferValueType<Schema>`: Infers the value type from a JSON Schema
- `InferFieldNode<Schema>`: Infers the field node type from a JSON Schema
- `FormHandle<Schema, Value>`: Type for form ref handle with schema-specific methods

### What `InferValueType` guarantees

Apply `as const` to the schema — without it, `type: 'object'` widens to `string` and inference falls back to `any`.

With `as const`, `InferValueType` walks `properties` and `items`, so declared fields get real types:

```typescript
const jsonSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
  },
  required: ['name'],
} as const;

type Value = InferValueType<typeof jsonSchema>;
// { name?: string; tags?: string[] } & Record<string, any>
```

Two properties of that result are deliberate:

- **Every field is optional, including `required` ones.** A form may drop a field from its value at runtime — an inactive `controls.active` branch, or `options.omitEmpty`. Marking it required would let `value.name.trim()` compile and then throw.
- **The object stays open** unless the schema sets `additionalProperties: false`, which is the JSON Schema default. This is what keeps keys contributed by `oneOf`/`anyOf` branches, `if`/`then`/`else`, and `patternProperties` from being rejected as excess properties. Set `additionalProperties: false` and the inferred type closes, so typos are caught.
- **Nullable schemas add `| null`.** Both the type array (`type: ['string', 'null']`) and the `nullable: true` keyword yield `T | null`, since the runtime accepts `null` for a nullable node. A type that rejected `null` would fail to compile a `setValue({ field: null })` the form accepts.

`nullable: true` is the OpenAPI 3.0 compatible notation and is officially supported. It is equivalent to adding `'null'` to `type`: `{ type: 'string', nullable: true }` means `{ type: ['string', 'null'] }`. No warning or error is raised for this notation.

### Declaring the value type yourself

`InferValueType` is only the default. When you know the exact shape, declare it and pass it as the second type argument — inference cannot know which fields your form actually keeps, but you can:

```typescript
interface SignUpValue {
  name: string;
  tags?: string[];
}

<Form<typeof jsonSchema, SignUpValue>
  jsonSchema={jsonSchema}
  onChange={(value) => value.name.trim()} // value: SignUpValue
/>;

const formRef = useRef<FormHandle<typeof jsonSchema, SignUpValue>>(null);
```

Passing `defaultValue` infers `Value` from it as well, so an explicit type argument is not always necessary.

---

## Migration (1.0.0)

1.0.0 moves every schema setting into three groups (`presentation`, `controls`, `options`), renames the public API around "field", and replaces the node engine. No old name is kept as an alias. Update in this order: schemas, then component and type imports, then any code that reads node state or validation errors.

> **Old schema keys fail silently.** The removed top-level keys (`formType`, `FormTypeInput`, `FormTypeInputProps`, `FormTypeRendererProps`, `computed`, the `&`-prefixed keys, `terminal`, `virtual`, `propertyKeys`, `injectTo`, `errorMessages`, `placeholder`) are ignored with no error or warning. A schema that still uses them renders, but its conditions, derived values and input choices do nothing, so search your schemas for each key in the table below. Inside the new groups the rule differs: an unknown key in `controls` or `options` throws `UNKNOWN_GROUP_KEY` when the form builds, while `presentation` is open and accepts any key.

### Schema keys

| 0.16                                                                   | 1.0.0                                                                                |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `formType`                                                             | `presentation.inputType`                                                             |
| `FormTypeInput`                                                        | `presentation.FieldInput`                                                            |
| `FormTypeInputProps` (`placeholder`, `alias`, `className`, `style`, …) | `presentation.FieldInputProps`                                                       |
| `FormTypeRendererProps` (`label`, `className`, `style`, …)             | `presentation.FieldRendererProps`                                                    |
| `errorMessages`                                                        | `presentation.errorMessages`                                                         |
| `computed.active` / `&active`                                          | `controls.active`                                                                    |
| `computed.visible` / `&visible`                                        | `controls.visible`                                                                   |
| `computed.readOnly` / `&readOnly`                                      | `controls.readOnly`                                                                  |
| `computed.disabled` / `&disabled`                                      | `controls.disabled`                                                                  |
| `computed.derived` / `&derived`                                        | `controls.derived`                                                                   |
| `computed.watch` / `&watch` (string or array)                          | `controls.watch` (array only)                                                        |
| `computed.pristine` / `&pristine`                                      | `controls.resetInteraction` (resets dirty and touched when the condition turns true) |
| `computed.if` / `&if` on a `oneOf` / `anyOf` branch                    | `controls.active` on that branch                                                     |
| `injectTo`                                                             | `controls.injectTo` (same handler shape)                                             |
| `terminal`                                                             | `options.terminal` (object and array schemas)                                        |
| `propertyKeys` (object)                                                | `options.propertyOrder` (order of keys in the emitted value)                         |
| `virtual` (object) and `type: 'virtual'`                               | `options.virtual: { <name>: { fields: [...] } }` (object schemas)                    |

```ts
// 0.16
{
  type: 'object',
  properties: {
    kind: { type: 'string', enum: ['a', 'b'], formType: 'radio' },
    note: {
      type: 'string',
      FormTypeInputProps: { placeholder: 'Note' },
      computed: { visible: '../kind === "b"' },
    },
  },
}

// 1.0.0
{
  type: 'object',
  properties: {
    kind: { type: 'string', enum: ['a', 'b'], presentation: { inputType: 'radio' } },
    note: {
      type: 'string',
      presentation: { FieldInputProps: { placeholder: 'Note' } },
      controls: { visible: '../kind === "b"' },
    },
  },
}
```

- `controls` also adds keys that had no 0.16 form: `default`, `unsetValue`, `unsetOnInactive`, `fields` (controls for named descendants) and `discriminator`.
- `options` accepts only `omitEmpty`, `trim` (string), `omitTrailing` (array), `terminal` (object and array), `propertyOrder` and `virtual` (object). Keep input settings such as `min` and `max` in `presentation.FieldInputProps`.

### Renamed API

| 0.16                                                                                                                                                                      | 1.0.0                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Form prop `formTypeInputDefinitions`                                                                                                                                      | `fieldInputDefinitions`                                                                                                                                        |
| Form prop `formTypeInputMap`                                                                                                                                              | `fieldInputMap`                                                                                                                                                |
| Form prop `CustomFormTypeRenderer`                                                                                                                                        | `FieldRenderer` (Form also takes `FormLabelRenderer`, `FormInputRenderer`, `FormErrorRenderer`)                                                                |
| Plugin keys `FormGroup`, `FormLabel`, `FormInput`, `FormError`                                                                                                            | `FieldRenderer`, `FormLabelRenderer`, `FormInputRenderer`, `FormErrorRenderer`                                                                                 |
| Plugin key `formTypeInputDefinitions`                                                                                                                                     | `fieldInputDefinitions`                                                                                                                                        |
| `Form.Group`, `FormGroupProps`                                                                                                                                            | `Form.Field`, `FormFieldProps`                                                                                                                                 |
| `FormTypeInputDefinition`, `FormTypeInputMap`, `FormTypeInputProps`, `FormTypeInputPropsWithNode`, `FormTypeInputPropsWithSchema`, `FormTypeTestFn`, `FormTypeTestObject` | `FieldInputDefinition`, `FieldInputMap`, `FieldInputProps`, `FieldInputPropsWithNode`, `FieldInputPropsWithSchema`, `FieldInputTestFn`, `FieldInputTestObject` |
| `FormTypeRendererProps`                                                                                                                                                   | `FieldRendererProps`                                                                                                                                           |
| `Hint`                                                                                                                                                                    | `FieldInputHint` (its key is `inputType`)                                                                                                                      |
| `FormTypeInputProps.FormTypeRenderer`                                                                                                                                     | `FieldInputProps.FieldRenderer`                                                                                                                                |
| `FormTypeInputProps.ChildNodeComponents`                                                                                                                                  | `FieldInputProps.ChildFields` (each item is a `ChildField`)                                                                                                    |
| `ChildNodeComponentProps`, `useChildNodeComponentMap`, `useChildNodeErrors`                                                                                               | `ChildFieldProps`, `useChildFieldMap`, `useChildFieldErrors`                                                                                                   |
| `SchemaNode`, `InferSchemaNode`, `isSchemaNode`                                                                                                                           | `FieldNode`, `InferFieldNode`, `isFieldNode`                                                                                                                   |
| `NodeState`                                                                                                                                                               | `FieldNodeState`                                                                                                                                               |
| `NodeState.ShowError`                                                                                                                                                     | `FieldNodeState.ErrorVisible` (same bit)                                                                                                                       |
| `NodeEventType`                                                                                                                                                           | `FieldNodeEventType` (keeps `UpdateValue`, `UpdateState`, `UpdateError`, `RequestFocus`, `RequestSelect`, `RequestRemount`, and exposes more events)           |
| `useSchemaNodeTracker`, `useSchemaNodeSubscribe`, `SchemaNodeSubscribeOptions`                                                                                            | `useFieldNodeTracker`, `useFieldNodeSubscribe`, `FieldNodeSubscribeOptions`                                                                                    |
| type `JSONSchemaError` (the `errors` prop and `onValidate` payload)                                                                                                       | `ValidationIssue` (same fields, plus optional `rejectedKey`; `isJSONSchemaError` stays)                                                                        |

- Only the node-state bit was renamed. The `ShowError` policy enum (`Dirty`, `Touched`, `DirtyTouched`, …), the Form `showError` prop and `FormHandle.showError()` keep their names.

### Behavior changes

- **A loaded `null` or wrong-kind value leaves child fields unfilled.** When an object or array field receives `null`, or a value of the wrong kind (for example a string for an object), from `defaultValue`, a load, `reset` or `resetSubtree`, its child fields get no defaults, exactly as when you write `null`. Typing into a child promotes the parent to an object, and only the fields that the promotion creates receive their defaults. `derived` and `injectTo` values still show. To keep defaults, load the object with values instead of `null`, or give the object its own `default`. The same applies to `<Form defaultValue={null}>` on an object schema.
- **Enum select shows `undefined` as no selection.** The built-in string enum select shows a leading, selected, empty and disabled option when the value is `undefined`, also when the enum contains `''`. A value outside the enum keeps its leading disabled option.
- **Checkbox and radio option ids include the index.** Each option's `id` is now `${path}-${index}`, with a matching `htmlFor` on its label. Selectors that targeted `#<path>` on these inputs must change.
- **`oneOf` / `anyOf` branches are no longer chosen from `const` tags.** When branches differ only by a `const` tag, declare `controls.discriminator: '<property>'` on the host, or `controls.active` on each branch. Without either, every branch stays active.
- **Custom validator plugins must implement `compileGuard`.** A `ValidatorPlugin` now needs `compileGuard(root, pointer)` next to `compile`; `release(root)` is optional. The official ajv6, ajv7 and ajv8 plugins already implement it.

`onValidate` behaves as in 0.16: it fires when the reported error list or the `errors` prop changes, and a re-validation with the same result does not fire it.

### `nullable: true`

`nullable: true` is officially supported. It is the OpenAPI 3.0 notation and is equivalent to adding `'null'` to `type` (`type: ['string', 'null']`). It raises no warning.

---

## Migration (0.16.0)

0.16.0 removes the deprecated aliases that 0.15.0 kept for the previous mixed-case names. Use `JSONSchemaError`, `isJSONSchemaError`, `JSONSchema` and `InferJSONSchema`. `injectTo` handlers receive the schemas only as `parentJSONSchema` and `rootJSONSchema`.

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
import { plugin as antd5Plugin } from '@canard/schema-form-antd5-plugin';

// Register Ant Design plugin
registerPlugin(antd5Plugin);

export const AntdForm = () => {
  const jsonSchema = {
    // ...
  };

  // It will automatically select the appropriate component based on the plugin's matching conditions.
  return <Form jsonSchema={jsonSchema} />;
};
```
