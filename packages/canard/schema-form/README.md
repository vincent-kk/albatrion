# @canard/schema-form

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()
[![Json Schema](https://img.shields.io/badge/JsonSchema-{}-blue.svg)]()
[![Json Schema Form](https://img.shields.io/badge/JsonSchemaForm-form-red.svg)]()

---

## Overview

`@canard/schema-form` is a React-based component library that renders forms based on a provided [JSON Schema](https://json-schema.org/).

It utilizes JSON Schema for validation, leveraging [ajv@8](https://ajv.js.org/) for this purpose.

By defining various `FormTypeInput` components, it offers the flexibility to accommodate complex requirements with ease.

---

## How to use

```bash
yarn add @canard/schema-form
```

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
  /** External Ajv instance, created internally if not provided */
  ajv?: Ajv;
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
  validate: Fn;
}
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
  isArrayItem?: boolean;
}
```

### Basic Usage

```tsx
import { Form } from '@canard/schema-form';

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
  Context extends Dictionary = Dictionary,
  WatchValues extends Array<any> = Array<any>,
  Schema extends JsonSchemaWithVirtual = InferJsonSchema<Value>,
  Node extends SchemaNode = InferSchemaNode<Schema>,
> {
  /** JSON Schema for the FormType Component */
  jsonSchema: Schema;
  /** readOnly state for the FormType Component */
  readOnly: boolean;
  /** disabled state for the FormType Component */
  disabled: boolean;
  /** Schema node assigned to the FormType Component */
  node: Node;
  /** Child FormType Components for this FormType Component */
  childNodes: WithKey<ComponentType<ChildFormTypeInputProps>>[];
  /** Name of the schema node assigned to the FormType Component */
  name: Node['name'];
  /** Path of the schema node assigned to the FormType Component */
  path: Node['path'];
  /** Errors of the schema node assigned to the FormType Component */
  errors: Node['errors'];
  /** Values being watched according to the watch property defined in JsonSchema */
  watchValues: WatchValues;
  /** Default value for the FormType Component */
  defaultValue: Value | undefined;
  /** Value for the FormType Component */
  value: Value | undefined;
  /** onChange handler for the FormType Component */
  onChange: SetStateFnWithOptions<Value | undefined>;
  /** Style for the FormType Component */
  style: CSSProperties | undefined;
  /** UserDefinedContext passed to the Form */
  context: Context;
  /** Additional properties can be freely defined */
  [alt: string]: any;
}
```

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

1. **Directly assigned FormType**: When a component is directly assigned via the `FormType` property in the JSON Schema object

   ```js
   const jsonSchema = {
     type: 'string',
     FormType: CustomTextInput, // Highest priority
   };
   ```

2. **FormTypeInputMap**: When there's a matching path in the `formTypeInputMap` passed to the `Form` component

   ```jsx
   <Form
     jsonSchema={jsonSchema}
     formTypeInputMap={{
       'user.email': EmailInput,
       'user.profile.avatar': AvatarUploader,
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
    'user.address.postalCode': PostalCodeInput,
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
                FormType: CountrySelector, // Will use directly assigned component (top priority)
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
          <Form.Render path=".personalInfo.name">
            {({ Input, path, node }) => (
              <div className="form-field">
                <label htmlFor={path}>{node.jsonSchema.title}</label>
                <Input />
              </div>
            )}
          </Form.Render>

          <Form.Render path=".personalInfo.age">
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
          <Form.Render path=".contactInfo.email">
            {({ Input, path, node }) => (
              <div className="form-field">
                <label htmlFor={path}>{node.jsonSchema.title}</label>
                <Input />
              </div>
            )}
          </Form.Render>

          <Form.Render path=".contactInfo.phone">
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

          {node && isArrayNode(node.find('users')) && (
            <button onClick={() => node.find('users').push()} type="button">
              Add User
            </button>
          )}

          <Form.Render path=".users">{({ Input }) => <Input />}</Form.Render>
        </div>
      )}
    </Form>
  );
};
```

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

Using the `watch` property to create dynamic form logic:

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
      },
      salary: {
        type: 'number',
        title: 'Annual Salary',
        options: {
          watch: 'employmentType',
        },
        renderOptions: {
          visible: "employmentType === 'fulltime'",
        },
      },
      hourlyRate: {
        type: 'number',
        title: 'Hourly Rate',
        options: {
          watch: 'employmentType',
        },
        renderOptions: {
          visible:
            "employmentType === 'parttime' || employmentType === 'contractor'",
        },
      },
    },
  };

  return <Form jsonSchema={jsonSchema} />;
};
```

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
    type: 'object',
    properties: {
      name: {
        type: 'string',
        title: 'Name',
        renderOptions: {
          // Ant Design specific options
          size: 'large',
          placeholder: 'Enter your name',
        },
      },
      tags: {
        type: 'array',
        title: 'Tags',
        items: {
          type: 'string',
        },
        // Use Ant Design Select component
        FormType: 'antd.select',
        renderOptions: {
          mode: 'tags',
          placeholder: 'Enter tags',
        },
      },
    },
  };

  return <Form jsonSchema={jsonSchema} />;
};
```

## Performance Optimization

The library is optimized for performance with features like:

- Lazy rendering for complex forms
- Memoization of components to prevent unnecessary re-renders
- Efficient validation using ajv
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

## TypeScript Support

`@canard/schema-form` is built with TypeScript and provides comprehensive type definitions. Key type utilities include:

- `InferValueType<Schema>`: Infers the value type from a JSON Schema
- `InferSchemaNode<Schema>`: Infers the schema node type from a JSON Schema
- `FormHandle<Schema>`: Type for form ref handle with schema-specific methods

## Browser Support

`@canard/schema-form` supports all modern browsers (Chrome, Firefox, Safari, Edge) and IE11 with appropriate polyfills.

---

## License

This repository is licensed under the MIT License. Please refer to the [`LICENSE`](./LICENSE) file for details.

---

## Contact

For inquiries or suggestions related to the project, please create an issue.
