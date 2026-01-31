# @canard/schema-form Specification

> JSON Schema based React form rendering library

## Overview

`@canard/schema-form` is a React-based form library that provides:

- **JSON Schema based rendering**: Automatic form generation from JSON Schema
- **Plugin-based validation**: Flexible validation system through AJV 6/7/8 plugins
- **FormTypeInput system**: Priority-based component selection
- **Computed Properties**: Conditional fields, derived values, reactive logic
- **Conditional schemas**: oneOf, anyOf, allOf, if-then-else support
- **TypeScript support**: Full type inference and type safety

---

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Core API](#core-api)
   - [FormProps](#formprops)
   - [FormHandle](#formhandle)
5. [Node System](#node-system)
6. [FormTypeInput System](#formtypeinput-system)
7. [Computed Properties](#computed-properties)
8. [Conditional Schemas](#conditional-schemas)
9. [JSONPointer System](#jsonpointer-system)
10. [Validation System](#validation-system)
11. [Plugin System](#plugin-system)
12. [Advanced Features](#advanced-features)
13. [Type Definitions](#type-definitions)

---

## Installation

```bash
# Using yarn
yarn add @canard/schema-form

# Install validator plugin (required)
yarn add @canard/schema-form-ajv8-plugin
# Or for AJV 7.x
yarn add @canard/schema-form-ajv7-plugin
# Or for AJV 6.x
yarn add @canard/schema-form-ajv6-plugin
```

### Peer Dependencies

- React 18-19
- React DOM 18-19

### Compatibility

- Node.js 16.11.0 or later
- Modern browsers (Chrome 94+, Firefox 93+, Safari 15+)

---

## Quick Start

### 1. Register Plugin

```tsx
import { registerPlugin } from '@canard/schema-form';
import { ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';

// Register once at app startup
registerPlugin(ajvValidatorPlugin);
```

### 2. Basic Usage

```tsx
import { Form } from '@canard/schema-form';
import { useState } from 'react';

export const App = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      age: { type: 'number' },
    },
  };

  const [value, setValue] = useState({ name: '', age: 0 });

  return (
    <Form
      jsonSchema={jsonSchema}
      defaultValue={value}
      onChange={setValue}
    />
  );
};
```

---

## Architecture

### Layer Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     Application                              │
├─────────────────────────────────────────────────────────────┤
│  Form Component                                             │
│  └── JSON Schema based form rendering                        │
├─────────────────────────────────────────────────────────────┤
│  Node System                                                │
│  ├── Terminal Nodes (String, Number, Boolean, Null)         │
│  ├── Branch Nodes (Object, Array)                           │
│  └── Virtual Node (conditional/computed fields)              │
├─────────────────────────────────────────────────────────────┤
│  FormTypeInput System                                       │
│  └── Priority-based component selection                      │
├─────────────────────────────────────────────────────────────┤
│  Plugin System                                              │
│  ├── Validator Plugins (AJV 6/7/8)                          │
│  └── UI Plugins (Ant Design, MUI, etc.)                     │
└─────────────────────────────────────────────────────────────┘
```

### Design Patterns

| Pattern | Purpose |
|---------|---------|
| **Strategy Pattern** | Branch/Terminal strategies for Array/Object nodes |
| **Factory Pattern** | Node creation from JSON Schema |
| **Observer Pattern** | Node state change subscription |
| **Plugin Pattern** | Validation and UI component extension |

---

## Core API

### FormProps

```typescript
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
  /** Function called when the state of this SchemaForm changes */
  onStateChange?: Fn<[state: NodeStateFlags]>;
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
   * Validation mode (default: ValidationMode.OnChange | ValidationMode.OnRequest)
   *  - `ValidationMode.None`: Disable validation
   *  - `ValidationMode.OnChange`: Validate when value changes
   *  - `ValidationMode.OnRequest`: Validate on request
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

### FormHandle

```typescript
interface FormHandle<
  Schema extends JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  /** Root node */
  node?: InferSchemaNode<Schema>;
  /** Focus input field at specific path */
  focus: Fn<[dataPath: SchemaNode['path']]>;
  /** Select input field at specific path */
  select: Fn<[dataPath: SchemaNode['path']]>;
  /** Reset form */
  reset: Fn;
  /** Find node by path */
  findNode: Fn<[path: SchemaNode['path']], SchemaNode | null>;
  /** Find multiple nodes by path */
  findNodes: Fn<[path: SchemaNode['path']], SchemaNode[]>;
  /** Get current state */
  getState: Fn<[], NodeStateFlags>;
  /** Set state */
  setState: Fn<[state: NodeStateFlags]>;
  /** Clear state */
  clearState: Fn;
  /** Get current value */
  getValue: Fn<[], Value>;
  /** Set value */
  setValue: SetStateFnWithOptions<Value>;
  /** Get current errors */
  getErrors: Fn<[], JsonSchemaError[]>;
  /** Get attached files map */
  getAttachedFilesMap: Fn<[], AttachedFilesMap>;
  /** Run validation */
  validate: Fn<[], Promise<JsonSchemaError[]>>;
  /** Set error visibility */
  showError: Fn<[visible: boolean]>;
  /** Submit form */
  submit: TrackableHandlerFunction<[], void, { loading: boolean }>;
}
```

### FormChildrenProps

```typescript
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

### AttachedFilesMap

```typescript
// Stores File[] by JSONPointer path key (e.g., "/attachment" or "/items/0/file")
type AttachedFilesMap = Map<string, File[]>;
```

---

## Node System

### Node Types

**Terminal Nodes** (primitive values):

| Node | Description |
|------|-------------|
| `StringNode` | String values, format validation support (email, date, etc.) |
| `NumberNode` | Numeric values, min/max constraints, integer enforcement |
| `BooleanNode` | Boolean values |
| `NullNode` | Explicit null values |

**Branch Nodes** (container structures):

| Node | Description |
|------|-------------|
| `ObjectNode` | Key-value structures, `required`, `additionalProperties` support |
| `ArrayNode` | Ordered collections, `minItems`, `maxItems`, array manipulation methods |

**Special Nodes**:

| Node | Description |
|------|-------------|
| `VirtualNode` | Non-schema nodes for conditional fields and computed values |

### Node Initialization

```typescript
const node = nodeFromJsonSchema({
  jsonSchema: { type: 'object', properties: { name: { type: 'string' } } },
  onChange: (value) => console.log('Form value changed:', value)
});

await delay(); // Wait for initialization to complete
```

### Node State Flags

```typescript
node.dirty;        // Has value changed since initialization?
node.touched;      // Has user interacted with this field?
node.validated;    // Has validation been run?
node.errors;       // Current validation errors
node.visible;      // Is field visible? (computed property)
node.active;       // Is field active? (computed property)
node.readOnly;     // Is field read-only? (computed property)
node.disabled;     // Is field disabled? (computed property)
node.initialized;  // Has node completed initialization?
```

---

## FormTypeInput System

### FormTypeInputDefinition

```typescript
type FormTypeInputDefinition<T = unknown> = {
  test: FormTypeTestFn | FormTypeTestObject;
  Component: ComponentType<InferFormTypeInputProps<T>>;
};
```

### Test Conditions

```typescript
// Function form
type FormTypeTestFn = Fn<[hint: Hint], boolean>;

// Object form
type FormTypeTestObject = Partial<{
  type: Array<string>;
  jsonSchema: JsonSchema;
  format: Array<string>;
  formType: Array<string>;
  nullable: boolean;
  [alt: string]: any;
}>;

// Hint object
type Hint = {
  jsonSchema: JsonSchema;
  type: string;
  format: string;
  formType: string;
  path: string;
  nullable: boolean;
  [alt: string]: any;
};
```

### FormTypeInputProps

```typescript
interface FormTypeInputProps<
  Value extends AllowedValue = any,
  Context extends Dictionary = object,
  WatchValues extends Array<any> = Array<any>,
  Schema extends JsonSchemaWithVirtual = InferJsonSchema<Value>,
  Node extends SchemaNode = InferSchemaNode<Schema>,
> {
  jsonSchema: Schema;           // JSON Schema for FormTypeInput component
  readOnly: boolean;            // Read-only state
  disabled: boolean;            // Disabled state
  required: boolean;            // Required field
  node: Node;                   // Schema node
  type: Node['schemaType'];     // JSON Schema type
  name: Node['name'];           // Node name
  path: Node['path'];           // Node path
  nullable: Node['nullable'];   // Accepts null
  errors: Node['errors'];       // Validation errors
  errorVisible: boolean;        // Error visibility
  watchValues: WatchValues;     // Values subscribed via computed.watch
  defaultValue: Value | undefined;
  value: Value | undefined;
  onChange: SetStateFnWithOptions<Value | undefined>;
  onFileAttach: Fn<[file: File | File[] | undefined]>;
  ChildNodeComponents: ChildNodeComponent[];
  placeholder: string | undefined;
  className: string | undefined;
  style: CSSProperties | undefined;
  context: Context;
  [alt: string]: any;
}
```

### Selection Priority

FormTypeInput is selected with the following priority (highest first):

1. **Directly assigned FormTypeInput in JSON Schema**
   ```tsx
   { type: 'string', FormTypeInput: CustomInput }
   ```

2. **formTypeInputMap** (path-based)
   ```tsx
   <Form formTypeInputMap={{ '/email': EmailInput }} />
   ```

3. **Form's formTypeInputDefinitions**
   ```tsx
   <Form formTypeInputDefinitions={[...]} />
   ```

4. **FormProvider's formTypeInputDefinitions**
   ```tsx
   <FormProvider formTypeInputDefinitions={[...]} />
   ```

5. **Plugin's formTypeInputDefinitions**
   ```tsx
   registerPlugin({ formTypeInputDefinitions: [...] })
   ```

### FormTypeInputMap

```typescript
type FormTypeInputMap = {
  [path: string]: ComponentType<FormTypeInputProps>;
};

// Wildcard support
const formInputMap = {
  '/users/*/name': CustomNameInput,      // Array index matching
  '/config/*/value': ConfigValueInput,   // Dynamic key matching
};
```

---

## Computed Properties

### Property Types

```typescript
{
  type: 'string',
  computed: {
    watch: string | string[];     // Value subscription
    active: boolean | string;     // Activation (false removes value)
    visible: boolean | string;    // Visibility (false retains value)
    readOnly: boolean | string;   // Read-only
    disabled: boolean | string;   // Disabled
    pristine: boolean | string;   // State reset
    derived: string;              // Derived value
  }
}
```

### Shortcut Syntax

```typescript
{
  type: 'string',
  '&active': '../toggle === true',
  '&visible': "@.userRole === 'admin'",
  '&derived': '(../price ?? 0) * (../quantity ?? 0)',
  '&watch': ['../category', '../price'],
}
```

### Path References

| Syntax | Meaning | Example |
|--------|---------|---------|
| `../field` | Sibling field | `'../category === "A"'` |
| `../../field` | Parent's sibling | `'../../parentField'` |
| `./field` | Current object's child | `'./nestedChild'` |
| `/field` | Absolute path (from root) | `'/rootField'` |
| `@.prop` | Context object's property | `'@.userRole === "admin"'` |

### Example

```tsx
const jsonSchema = {
  type: 'object',
  properties: {
    category: {
      type: 'string',
      enum: ['standard', 'premium'],
    },
    premiumFeatures: {
      type: 'object',
      computed: {
        active: "../category === 'premium'",
        watch: '../category',
      },
      properties: {
        // premium-only fields
      },
    },
    total: {
      type: 'number',
      '&derived': '(../price ?? 0) * (../quantity ?? 1)',
    },
  },
};
```

---

## Conditional Schemas

### oneOf (Exclusive Choice)

```typescript
{
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['A', 'B'] }
  },
  oneOf: [
    {
      '&if': "./type === 'A'",
      properties: { fieldA: { type: 'string' } }
    },
    {
      '&if': "./type === 'B'",
      properties: { fieldB: { type: 'string' } }
    }
  ]
}
```

### anyOf (Non-exclusive Choice)

```typescript
{
  type: 'object',
  properties: {
    hasFeature1: { type: 'boolean' },
    hasFeature2: { type: 'boolean' }
  },
  anyOf: [
    {
      '&if': './hasFeature1 === true',
      properties: { config1: { type: 'string' } }
    },
    {
      '&if': './hasFeature2 === true',
      properties: { config2: { type: 'string' } }
    }
  ]
}
```

### if-then-else

```typescript
{
  type: 'object',
  properties: {
    country: { type: 'string' }
  },
  if: { properties: { country: { const: 'KR' } } },
  then: { properties: { phone: { pattern: '^010-' } } },
  else: { properties: { phone: { pattern: '^\\+' } } }
}
```

### allOf (Composition)

```typescript
{
  type: 'object',
  allOf: [
    { properties: { firstName: { type: 'string' } } },
    { properties: { lastName: { type: 'string' } } },
    { required: ['firstName', 'lastName'] }
  ]
}
```

---

## JSONPointer System

### Standard JSONPointer (RFC 6901)

```typescript
node.find('/path/to/field');     // Absolute path from root
node.find('./childField');       // Relative path from current node
```

### Extended Syntax

| Syntax | Meaning | Available Context |
|--------|---------|-------------------|
| `..` | Parent navigation | computed properties, node.find() |
| `.` | Current node | computed properties, node.find() |
| `*` | Wildcard | FormTypeInputMap only |
| `@` | Context reference | computed properties only |

### Escape Rules

- `~0` → `~`
- `~1` → `/`

```typescript
// Field name with special characters: "field/with~special"
node.find('/field~1with~0special');
```

---

## Validation System

### ValidationMode

```typescript
enum ValidationMode {
  None = 0,      // Disable validation
  OnChange = 1,  // Validate on value change
  OnRequest = 2, // Validate on request (validate() call)
}

// Can be combined
ValidationMode.OnChange | ValidationMode.OnRequest
```

### Error Message Formatting

```typescript
const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 3,
      errorMessages: {
        minLength: 'Name must be at least {limit} characters. Current: {value}',
        required: 'Name is required.',
      },
    },
  },
  required: ['name'],
};
```

### Multilingual Support

```typescript
errorMessages: {
  minLength: {
    ko_KR: '이름은 최소 {limit}자 이상이어야 합니다.',
    en_US: 'Name must be at least {limit} characters.',
  },
}

// Set context.locale in Form
<Form jsonSchema={schema} context={{ locale: 'en_US' }} />
```

---

## Plugin System

### Plugin Registration

```tsx
import { registerPlugin } from '@canard/schema-form';
import { plugin as ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';
import { plugin as antd5Plugin } from '@canard/schema-form-antd5-plugin';

registerPlugin(antd5Plugin);
registerPlugin(ajvValidatorPlugin);
```

### Available Plugins

**Validator Plugins:**
- `@canard/schema-form-ajv8-plugin`: AJV 8.x (latest JSON Schema support)
- `@canard/schema-form-ajv7-plugin`: AJV 7.x
- `@canard/schema-form-ajv6-plugin`: AJV 6.x

**UI Plugins:**
- `@canard/schema-form-antd5-plugin`: Ant Design 5
- `@canard/schema-form-antd6-plugin`: Ant Design 6
- `@canard/schema-form-antd-mobile-plugin`: Ant Design Mobile
- `@canard/schema-form-mui-plugin`: Material UI

### Plugin Interface

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

interface ValidatorPlugin {
  bind: Fn<[instance: any]>;
  compile: ValidatorFactory;
}
```

---

## Advanced Features

### Custom Layout (Form.Render)

```tsx
<Form jsonSchema={jsonSchema}>
  <div className="custom-layout">
    <Form.Render path="/personalInfo/name">
      {({ Input, node }) => (
        <div className="form-field">
          <label>{node.jsonSchema.title}</label>
          <Input />
        </div>
      )}
    </Form.Render>
  </div>
</Form>
```

### Array Manipulation

```tsx
const arrayNode = node.find('/items') as ArrayNode;

arrayNode.push();              // Add item with default value
arrayNode.push('custom');      // Add item with custom value
arrayNode.remove(index);       // Remove item at index
arrayNode.clear();             // Remove all items

arrayNode.length;              // Current number of items
arrayNode.children;            // Array of child nodes
```

### Value Injection (injectTo)

```tsx
const jsonSchema = {
  type: 'object',
  properties: {
    source: {
      type: 'string',
      injectTo: (value: string) => ({
        '../target': `injected: ${value}`,
      }),
    },
    target: { type: 'string' },
  },
};
```

### File Attachment

```tsx
const FileInput = ({ onFileAttach, onChange }) => {
  const handleChange = (e) => {
    const file = e.target.files[0];
    onFileAttach(file);
    onChange({
      name: file.name,
      size: file.size,
      type: file.type,
    });
  };

  return <input type="file" onChange={handleChange} />;
};

// Get files on submit
const files = formRef.current.getAttachedFilesMap();
```

### Form Submission

```tsx
import { useFormSubmit } from '@canard/schema-form';

const { submit, loading } = useFormSubmit(formRef);

const handleClick = async () => {
  try {
    await submit();
    alert('Submission complete!');
  } catch (error) {
    if (isValidationError(error)) {
      console.log('Validation failed:', error.details);
    }
  }
};
```

### Using children as a Function

Pass `children` as a function to `Form` component to access form state and node.

```tsx
<Form jsonSchema={jsonSchema} defaultValue={{ name: '', email: '' }}>
  {({ value, errors, node }) => (
    <div className="form-container">
      {/* Auto-generated form fields */}
      <Form.Render />

      {/* Preview current form values */}
      <div className="preview">
        <h3>Current Values:</h3>
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </div>

      {/* Display error summary */}
      {errors.length > 0 && (
        <div className="error-summary">
          <h3>Validation Errors:</h3>
          <ul>
            {errors.map((error, i) => (
              <li key={i}>{error.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Programmatic control via node */}
      <button onClick={() => node?.find('/name')?.setValue('Default Name')}>
        Reset Name
      </button>
    </div>
  )}
</Form>
```

**children function props:**

| prop | Type | Description |
|------|------|-------------|
| `value` | `InferValueType<Schema>` | Current form value |
| `errors` | `JsonSchemaError[]` | List of all validation errors |
| `node` | `InferSchemaNode<Schema>` | Root node (for programmatic access) |

---

## Type Definitions

### Type Utilities

```typescript
import { InferValueType, InferSchemaNode, FormHandle } from '@canard/schema-form';

// Infer value type from schema
type FormValue = InferValueType<typeof jsonSchema>;

// Infer node type from schema
type RootNode = InferSchemaNode<typeof jsonSchema>;

// Type-safe form handle
const formRef = useRef<FormHandle<typeof jsonSchema>>(null);
```

### Nullable Schema

```typescript
const schema = {
  type: 'object',
  properties: {
    // Required field (non-nullable)
    name: { type: 'string' },
    // Optional field (nullable) - use as const
    nickname: { type: ['string', 'null'] as const },
  },
};

// Nullable condition in FormTypeInput
const definitions = [
  { test: { type: 'string', nullable: true }, component: NullableInput },
  { test: { type: 'string', nullable: false }, component: RequiredInput },
];
```

### Node Type Guards

```typescript
import { isArrayNode, isObjectNode, isVirtualNode } from '@canard/schema-form';

if (isArrayNode(node)) {
  node.push(); // ArrayNode methods available
}
```

---

## Best Practices

1. **Register plugins at app startup** - Once at the top level
2. **Cache FormTypeInputDefinitions** - Define outside components
3. **Optimize ValidationMode** - Choose OnChange or OnRequest based on needs
4. **Use TypeScript as const** - For schema type inference
5. **Leverage computed.watch** - Implement reactive form logic
6. **Use Form.Render for custom layouts** - Meet complex UI requirements

---

## License

MIT License

---

## Version

Current: See package.json
