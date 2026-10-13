# @canard/schema-form Specification

> JSON Schema based React form rendering library

## Overview

`@canard/schema-form` is a React-based form library that provides:

- **JSON Schema based rendering**: Automatic form generation from JSON Schema
- **Plugin-based validation**: Flexible validation system through AJV 6/7/8 plugins
- **FieldInput system**: Priority-based component selection
- **Controls**: Conditional fields, derived values, reactive logic
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
6. [FieldInput System](#fieldinput-system)
7. [Controls](#controls)
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
import { plugin as ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';

// Register once at app startup
registerPlugin(ajvValidatorPlugin);
```

### 2. Basic Usage

```tsx
import { useState } from 'react';

import { Form } from '@canard/schema-form';

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
    <Form jsonSchema={jsonSchema} defaultValue={value} onChange={setValue} />
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
│  └── Virtual Node (options.virtual field groups)             │
├─────────────────────────────────────────────────────────────┤
│  FieldInput System                                       │
│  └── Priority-based component selection                      │
├─────────────────────────────────────────────────────────────┤
│  Plugin System                                              │
│  ├── Validator Plugins (AJV 6/7/8)                          │
│  └── UI Plugins (Ant Design, MUI, etc.)                     │
└─────────────────────────────────────────────────────────────┘
```

### Design Patterns

| Pattern              | Purpose                                           |
| -------------------- | ------------------------------------------------- |
| **Strategy Pattern** | Branch/Terminal strategies for Array/Object nodes |
| **Factory Pattern**  | Node creation from JSON Schema                    |
| **Observer Pattern** | Node state change subscription                    |
| **Plugin Pattern**   | Validation and UI component extension             |

---

## Core API

### FormProps

```typescript
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
   * Validation mode (default: ValidationMode.OnChange | ValidationMode.OnRequest)
   *  - `ValidationMode.None`: Disable validation
   *  - `ValidationMode.OnChange`: Validate when value changes
   *  - `ValidationMode.OnRequest`: Validate on request
   */
  validationMode?: ValidationMode;
  /** Custom validator object (`compile` and `compileGuard`); Form prop > FormProvider > plugin */
  validatorFactory?: ValidatorFactory;
  /**
   * Render-level virtualization (deferred mount) for large forms (default: off)
   *  - `true`: enable with default options
   *  - `VirtualizationOptions`: enable with custom options
   *  - Off-screen fields render as placeholders and mount when they approach the
   *    viewport, on browser idle time, or on focus/select commands
   *  - The node tree is always fully built — values, validation and submit are unaffected
   *  - Client-side rendering only: requires IntersectionObserver; do NOT enable it in
   *    SSR/hydration apps (hydration mismatch)
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

### FormHandle

```typescript
interface FormHandle<
  Schema extends JSONSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  /** Root node */
  node?: InferFieldNode<Schema>;
  /** Focus input field at specific path */
  focus: Fn<[dataPath: FieldNode['path']]>;
  /** Select input field at specific path */
  select: Fn<[dataPath: FieldNode['path']]>;
  /** Reset form */
  reset: Fn;
  /** Find node by path */
  findNode: Fn<[path: FieldNode['path']], FieldNode | null>;
  /** Find multiple nodes by path */
  findNodes: Fn<[path: FieldNode['path']], FieldNode[]>;
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
  getErrors: Fn<[], readonly ValidationIssue[]>;
  /** Get attached files map */
  getAttachedFilesMap: Fn<[], AttachedFilesMap>;
  /** Run validation */
  validate: Fn<[], Promise<readonly ValidationIssue[]>>;
  /** Set error visibility */
  showError: Fn<[visible: boolean]>;
  /** Submit form */
  submit: TrackableHandlerFunction<[], void, { loading: boolean }>;
}
```

### FormChildrenProps

```typescript
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

### AttachedFilesMap

```typescript
// Stores File[] by JSONPointer path key (e.g., "/attachment" or "/items/0/file")
type AttachedFilesMap = Map<string, File[]>;
```

---

## Node System

### Node Types

**Terminal Nodes** (primitive values):

| Node          | Description                                                  |
| ------------- | ------------------------------------------------------------ |
| `StringNode`  | String values, format validation support (email, date, etc.) |
| `NumberNode`  | Numeric values, min/max constraints, integer enforcement     |
| `BooleanNode` | Boolean values                                               |
| `NullNode`    | Explicit null values                                         |

**Branch Nodes** (container structures):

| Node         | Description                                                             |
| ------------ | ----------------------------------------------------------------------- |
| `ObjectNode` | Key-value structures, `required`, `additionalProperties` support        |
| `ArrayNode`  | Ordered collections, `minItems`, `maxItems`, array manipulation methods |

**Special Nodes**:

| Node          | Description                                                              |
| ------------- | ------------------------------------------------------------------------ |
| `VirtualNode` | Non-schema node that groups sibling fields declared in `options.virtual` |

### Branch or Terminal (`options.terminal`)

An `object` or `array` node is a branch by default: it builds a child node for each property or item. With `options.terminal: true` it is a terminal instead: one input reads and writes the whole value, and no child nodes are built. The strategy is decided once, from the schema, in this order:

1. `options.terminal`, `true` or `false`, overrides everything below.
2. A `presentation.FieldInput` component on the schema makes the node a terminal.
3. Otherwise the node is a branch.

```typescript
{
  type: 'object',
  properties: { lat: { type: 'number' }, lng: { type: 'number' } },
  options: { terminal: true }, // one map picker writes { lat, lng }
}
```

- Every other kind has a fixed strategy: `string`, `number`, `integer`, `boolean`, `null` and a multi-kind `type` are terminals, and `virtual` is a branch. An `options.terminal` that contradicts the fixed strategy throws `TERMINAL_OPTION_UNSUPPORTED`; one that restates it is accepted.
- Ungated declarations are the node's own schema, its `$ref` target and its `allOf` parts, as long as they carry no `controls.active`. Among them the later `options.terminal` wins, and a `$ref` target counts as later than the schema that refers to it.
- The strategy cannot change at run time. When gated declarations (`then` / `else`, any part carrying `controls.active`, a parent's `controls.children` entry with `active` for the children it targets, or a `oneOf` / `anyOf` branch selected by `controls.active` or the host's `controls.discriminator`) would make the node a branch in one case and a terminal in another, the schema throws `TERMINAL_STRATEGY_MISMATCH`.
- A `oneOf` / `anyOf` branch without such a gate does not set its host's strategy; its `options.terminal` is ignored.

### Node Initialization

```typescript
const node = nodeFromJSONSchema({
  jsonSchema: { type: 'object', properties: { name: { type: 'string' } } },
  onChange: (value) => console.log('Form value changed:', value),
});

await delay(); // Wait for initialization to complete
```

### Node State Flags

```typescript
node.dirty; // Has value changed since initialization?
node.touched; // Has user interacted with this field?
node.validated; // Has validation been run?
node.errors; // Current validation errors
node.visible; // Is field visible?
node.active; // Is field active?
node.readOnly; // Is field read-only?
node.disabled; // Is field disabled?
node.initialized; // Has node completed initialization?
```

---

## FieldInput System

### FieldInputDefinition

```typescript
type FieldInputDefinition<T = unknown> = {
  test: FieldInputTestFn | FieldInputTestObject;
  Component: ComponentType<InferFieldInputProps<T>>;
};
```

### Test Conditions

```typescript
// Function form
type FieldInputTestFn = Fn<[hint: FieldInputHint], boolean>;

// Object form
type FieldInputTestObject = Partial<{
  type: Array<string>;
  jsonSchema: JSONSchema;
  format: Array<string>;
  inputType: Array<string>;
  nullable: boolean;
  [alt: string]: any;
}>;

// FieldInputHint object
type FieldInputHint = {
  jsonSchema: JSONSchema;
  type: string;
  format: string;
  inputType: string;
  path: string;
  nullable: boolean;
  [alt: string]: any;
};
```

inputType is a string hint that a definition's test interprets; it is not the HTML input type.

### FieldInputProps

```typescript
interface FieldInputProps<
  Value extends AllowedValue = any,
  Context extends Dictionary = object,
  WatchValues extends Array<any> = Array<any>,
  Schema extends JSONSchemaWithVirtual = InferJSONSchema<Value>,
  Node extends FieldNode = InferFieldNode<Schema>,
> {
  jsonSchema: Schema; // JSON Schema for FieldInput component
  readOnly: boolean; // Read-only state
  disabled: boolean; // Disabled state
  required: boolean; // Required field
  node: Node; // Field node
  type: Node['schemaType']; // JSON Schema type
  name: Node['name']; // Node name
  path: Node['path']; // Node path
  nullable: Node['nullable']; // Accepts null
  errors: Node['errors']; // Validation errors
  errorVisible: boolean; // Error visibility
  watchValues: WatchValues; // Values read from the controls.watch paths
  defaultValue: Value | undefined;
  value: Value | undefined;
  onChange: SetStateFnWithOptions<Value | undefined>;
  onFileAttach: Fn<[file: File | File[] | undefined]>;
  ChildFields: ChildField[];
  placeholder: string | undefined;
  className: string | undefined;
  style: CSSProperties | undefined;
  context: Context;
  [alt: string]: any;
}
```

### Selection Priority

FieldInput is selected with the following priority (highest first):

1. **Directly assigned presentation.FieldInput in JSON Schema**

   ```tsx
   { type: 'string', presentation: { FieldInput: CustomInput } }
   ```

2. **fieldInputMap** (path-based)

   ```tsx
   <Form fieldInputMap={{ '/email': EmailInput }} />
   ```

3. **Form's fieldInputDefinitions**

   ```tsx
   <Form fieldInputDefinitions={[...]} />
   ```

4. **FormProvider's fieldInputDefinitions**

   ```tsx
   <FormProvider fieldInputDefinitions={[...]} />
   ```

5. **Plugin's fieldInputDefinitions**
   ```tsx
   registerPlugin({ fieldInputDefinitions: [...] })
   ```

### FieldInputMap

```typescript
type FieldInputMap = {
  [path: string]: ComponentType<FieldInputProps>;
};

// Wildcard support
const formInputMap = {
  '/users/*/name': CustomNameInput, // Array index matching
  '/config/*/value': ConfigValueInput, // Dynamic key matching
};
```

---

## Controls

### Property Types

```typescript
{
  type: 'string',
  controls: {
    active: boolean | string;            // Activation (false removes value)
    visible: boolean | string;           // Visibility (false retains value)
    readOnly: boolean | string;          // Read-only
    disabled: boolean | string;          // Disabled
    default: any;                        // Fill value for an appearing node
    derived: string;                     // Derived value
    unsetValue: string;                  // Clears the value when it turns from false to true
    resetInteraction: string;            // Clears dirty/touched when it turns from false to true
    unsetOnInactive: boolean | string;   // Drops the retained value when the node leaves the shape
    children: { targets: string[]; controls: { /* first nine keys */ } }[];
    injectTo: (value, ctx) => ...;       // Pushes values to other nodes whenever this node's value changes
    discriminator: string;               // oneOf/anyOf host: branch tag property
    watch: string[];                     // Value subscription (array of paths)
  }
}
```

The key list is closed: an unknown key makes the blueprint build throw a schema error (recognized by `isJSONSchemaError`) with code `UNKNOWN_GROUP_KEY`. Inside `controls.children[].controls` and on the `controls` of a fragment (`oneOf`/`anyOf`/`allOf` branches, `then`, `else`), only the first nine keys (`active` through `unsetOnInactive`) are allowed; any of the other four throws.

### Nested Controls

```typescript
{
  type: 'string',
  controls: {
    active: '../toggle === true',
    visible: "@.userRole === 'admin'",
    derived: '(../price ?? 0) * (../quantity ?? 0)',
    watch: ['../category', '../price'],
  },
}
```

### Path References

| Syntax        | Meaning                   | Example                    |
| ------------- | ------------------------- | -------------------------- |
| `../field`    | Sibling field             | `'../category === "A"'`    |
| `../../field` | Parent's sibling          | `'../../parentField'`      |
| `./field`     | Current object's child    | `'./nestedChild'`          |
| `/field`      | Absolute path (from root) | `'/rootField'`             |
| `@.prop`      | Context object's property | `'@.userRole === "admin"'` |

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
      controls: {
        active: "../category === 'premium'",
        watch: ['../category'],
      },
      properties: {
        // premium-only fields
      },
    },
    total: {
      type: 'number',
      controls: { derived: '(../price ?? 0) * (../quantity ?? 1)' },
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
      controls: { active: "./type === 'A'" },
      properties: { fieldA: { type: 'string' } }
    },
    {
      controls: { active: "./type === 'B'" },
      properties: { fieldB: { type: 'string' } }
    }
  ]
}
```

A branch takes part only while its gate passes. Gate a branch with a `controls.active` expression on the branch object, or set `controls.discriminator: '<property>'` on the host and tag each branch with `const`/`enum` on that property; the tag is compared with `===` and AND-ed with the branch's own `controls.active`. Without a gate, every branch is on: all branches' fields are present, and only the validator decides which branch matches.

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
      controls: { active: './hasFeature1 === true' },
      properties: { config1: { type: 'string' } }
    },
    {
      controls: { active: './hasFeature2 === true' },
      properties: { config2: { type: 'string' } }
    }
  ]
}
```

### Branch Types in oneOf / anyOf

A branch usually omits `type` and takes its parent's. When it declares one, it must not say more than the parent allows:

| Parent `type`                                         | Branch `type` accepted                               |
| ----------------------------------------------------- | ---------------------------------------------------- |
| `'object'`                                            | omitted, `'object'`, `['object']`                    |
| `['object', 'null']` or `'object'` + `nullable: true` | omitted, the parent's own type, `'object'`, `'null'` |

A branch's own `nullable: true` flag is not compared with the parent's, so `'object'` + `nullable: true` is accepted under any object. Anything else — a `'null'` or `['object', 'null']` branch under a non-nullable object, `'string'`, `'array'` — throws `COMPOSITION_TYPE_REDEFINITION`.

This rule, and the two development warnings below, run only where the object builds child nodes. An object handled as a single input — `options.terminal: true`, or a `presentation.FieldInput` component set on the object's schema — builds no branches, so its branch types are not checked and neither warning is printed; the validator still sees the schema as written.

Inside a branch's `properties`, an entry **with** a `type` is a field; an entry **without** one, carrying only `const` or `enum`, is a tag that the host's `controls.discriminator` reads to select the branch. Giving such a discriminator a `type` turns it into a field that collides with the parent's property of the same name (`COMPOSITION_PROPERTY_REDEFINITION`).

#### The null-branch pattern

`oneOf` needs exactly one matching branch, and a branch without `type` matches `null` — `properties` and `required` only apply to objects. So a nullable object validates as `null` under `oneOf` only with this null-branch pattern: one `{ type: 'null' }` branch, and `type: 'object'` on the object branches.

```typescript
{
  type: ['object', 'null'],
  properties: {
    kind: { type: 'string', enum: ['a', 'b'], default: 'a' }
  },
  oneOf: [
    { type: 'null' },
    {
      type: 'object',
      controls: { active: "./kind === 'a'" },
      properties: { aValue: { type: 'string' } }
    },
    {
      type: 'object',
      controls: { active: "./kind === 'b'" },
      properties: { bValue: { type: 'string' } }
    }
  ]
}
```

- The null branch is for the validator only. It has no fields and is never the active branch; a condition or `properties` on it is ignored with the development warning `NULL_BRANCH_IGNORED_FOR_FORM`.
- Whether the object is `null` is decided by its value, and which object branch is shown by the branch conditions. While the value is `null` the children show the blank form of the branch the conditions select (see [Nullable Objects and Arrays](#nullable-objects-and-arrays)).
- Where the null branch sits does not matter; errors of the branch in use reach their fields. When the object value fails its `oneOf`, the null branch reports its own mismatch ("must be null") on the object like any other branch that did not match, next to the `oneOf` error.
- A nullable object whose `oneOf` cannot validate `null` — no branch accepts it, or several do — prints the development warning `NULLABLE_ONE_OF_NULL_UNREACHABLE`. `anyOf` needs no such care: one null branch, or untyped branches, already satisfy it.

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

The `then` properties belong to the shape only while the `if` guard passes, and the `else` properties only while it fails. The guard is evaluated synchronously through the validator's guard entry point; with no validator selected (no `validatorFactory` on the Form or a FormProvider, and no validator plugin), both `then` and `else` stay off.

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
node.find('/path/to/field'); // Absolute path from root
node.find('./childField'); // Relative path from current node
```

### Extended Syntax

| Syntax | Meaning           | Available Context                 |
| ------ | ----------------- | --------------------------------- |
| `..`   | Parent navigation | controls expressions, node.find() |
| `.`    | Current node      | controls expressions, node.find() |
| `*`    | Wildcard          | FieldInputMap only                |
| `@`    | Context reference | controls expressions only         |

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
  None = 0, // Disable validation
  OnChange = 1, // Validate on value change
  OnRequest = 2, // Validate on request (validate() call)
}

// Can be combined
ValidationMode.OnChange | ValidationMode.OnRequest;
```

### Error Message Formatting

```typescript
const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 3,
      presentation: {
        errorMessages: {
          minLength:
            'Name must be at least {limit} characters. Current: {value}',
          required: 'Name is required.',
        },
      },
    },
  },
  required: ['name'],
};
```

### Multilingual Support

```typescript
presentation: {
  errorMessages: {
    minLength: {
      ko_KR: '이름은 최소 {limit}자 이상이어야 합니다.',
      en_US: 'Name must be at least {limit} characters.',
    },
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
  FieldRenderer?: ComponentType<FieldRendererProps>;
  FormLabelRenderer?: ComponentType<FieldRendererProps>;
  FormInputRenderer?: ComponentType<FieldRendererProps>;
  FormErrorRenderer?: ComponentType<FieldRendererProps>;
  fieldInputDefinitions?: FieldInputDefinition[];
  validator?: ValidatorPlugin;
  formatError?: FormatError;
}

interface ValidatorPlugin {
  bind?: Fn<[instance: any]>;
  compile(jsonSchema: JSONSchema): ValidateFunction;
  compileGuard(root: JSONSchema, pointer: string): (value: unknown) => boolean;
  release?(root: JSONSchema): void;
  readonly dialect?: string;
}
```

The default group renderer draws its own label and messages, so `FormLabelRenderer` and `FormErrorRenderer` appear only through the composition API (`Form.Label`, `Form.Error`) or a user group renderer that calls them.

Renderer props are read once when the form mounts; replacing a renderer after mount is not guaranteed to take effect.

---

## Advanced Features

### Render-Level Virtualization

For forms with hundreds of fields the initial React mount is the dominant cost (the node tree itself is cheap). The `virtualization` prop defers mounting of off-screen fields — they render as lightweight placeholders and are replaced by the real components when they approach the viewport, during browser idle time, or on focus/select commands (once revealed, a field never returns to a placeholder — defer-once). The node tree is always fully built, so `value`, validation, `getValue()`/`setValue()` and submit behave identically regardless of mount state. Works with every FieldInput plugin (the gate sits below the layout).

```tsx
import { Form, VirtualizationBackfill } from '@canard/schema-form';

<Form
  jsonSchema={largeSchema}
  virtualization={{
    threshold: 30, // gate a branch only when it has >= 30 children
    eagerCount: 20, // mount the leading 20 fields immediately
    rootMargin: '100%', // IntersectionObserver margin (px or % only)
    backfill: VirtualizationBackfill.Idle, // or .None: reveal only on scroll/commands
    estimateHeight: 40, // placeholder height (px) or (node) => number
    Placeholder: FieldSkeleton, // optional component rendered inside each placeholder
  }}
/>;
// Enable with defaults: <Form jsonSchema={largeSchema} virtualization />
```

**VirtualizationOptions**

| Option           | Type                                      | Default  | Description                                                                                |
| ---------------- | ----------------------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `threshold`      | `number`                                  | `30`     | Gate a branch only when it has at least this many children                                 |
| `eagerCount`     | `number`                                  | `20`     | Number of leading fields mounted immediately in a gated branch                             |
| `rootMargin`     | `` `${number}px` `` \| `` `${number}%` `` | `'100%'` | IntersectionObserver rootMargin (px/% only)                                                |
| `backfill`       | `VirtualizationBackfill`                  | `Idle`   | `Idle` = progressively mount the rest during idle; `None` = reveal only on scroll/commands |
| `estimateHeight` | `number \| ((node) => number)`            | `40`     | Placeholder space-reservation height (px)                                                  |
| `Placeholder`    | `ComponentType<{ node, height }>`         | `null`   | Component rendered inside each placeholder                                                 |

- **Placeholder styling**: placeholders are boxes carrying `[data-path]` and a `[data-deferred]` marker. Style them with a CSS attribute selector (`[data-deferred] { … }`) or pass a `Placeholder` component; space reservation always stays with `estimateHeight`.
- **⚠️ Client-side rendering only**: requires `IntersectionObserver`. Do NOT enable it in SSR/hydration apps — the server renders all fields while the client gates them, causing a hydration mismatch. When `IntersectionObserver` is unavailable it is silently disabled (with a development warning).

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

Two inputs (for example two `Form.Input` components or two `Input` slots) bound to the same path do not mirror each other while typing. Typing does not issue a Refresh and each input owns its draft, so the other input keeps showing its own text until a Refresh reaches it, for example from a `setValue` that changes the value, a `reset`, or `refresh(path)` on the form handle.

### Array Manipulation

```tsx
const arrayNode = node.find('/items') as ArrayNode;

arrayNode.push(); // Add item with default value
arrayNode.push('custom'); // Add item with custom value
arrayNode.remove(index); // Remove item at index
arrayNode.clear(); // Remove all items

arrayNode.length; // Current number of items
arrayNode.children; // Array of child nodes
```

### Array Output Filters (`omitTrailing` / `omitEmpty`)

Array schemas accept output filters under `options`. They refine what the array **emits** — parent propagation, root validation, and the external surfaces (`onChange`, `getValue()`, `submit`) — while child nodes and the raw `node.value` keep every item, so pre-exposed empty inputs stay rendered.

```tsx
const jsonSchema = {
  type: 'array',
  minItems: 3, // three empty inputs are rendered up front
  items: { type: 'string' },
  options: { omitTrailing: true },
};
// UI renders 3 inputs; the user fills only the first one
// getValue() / onChange / validation see: ['first']
```

- `omitTrailing` (opt-in): removes **trailing** consecutive `undefined` items only. Leading and middle `undefined` items are preserved so error `dataPath`s and validation indices stay aligned — `[1, undefined, 2]` is emitted as-is.
- `omitEmpty` (on by default): converts an empty array to `undefined` on the parent-propagation path. Filter order is `omitTrailing → omitEmpty`, so an all-empty array collapses to `undefined` under its parent (a root-level form still emits `[]`).
- `null` is not an empty value: neither filter touches a nullable array that is `null` — see [Nullable Objects and Arrays](#nullable-objects-and-arrays).
- `node.value` stays raw; the refined output is exposed as `node.outputValue`. Validation runs against the refined value, so `minItems` counts only the filled prefix.
- A Reset-flagged clear (form reset, branch reactivation) refills `minItems` empty items; a plain `setValue(undefined)` clears every item — and so does a replace-style write on the parent that omits the array: `setValue({ other: 1 })` empties it, `SetValueOption.Merge` leaves it untouched. An array whose default is `null` resets to `null`, with no fill.

### Value Injection (injectTo)

```tsx
const jsonSchema = {
  type: 'object',
  properties: {
    source: {
      type: 'string',
      controls: {
        injectTo: (value: string) => ({
          '../target': `injected: ${value}`,
        }),
      },
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

Enter submits through the Form's `form` element. With more than one text-like field, the browser submits on Enter only when the form has a submit button (implicit submission counts the fields that block it; one text field plus a checkbox still submits).

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

| prop     | Type                         | Description                         |
| -------- | ---------------------------- | ----------------------------------- |
| `value`  | `InferValueType<Schema>`     | Current form value                  |
| `errors` | `readonly ValidationIssue[]` | List of all validation errors       |
| `node`   | `InferFieldNode<Schema>`     | Root node (for programmatic access) |

---

## Type Definitions

### Type Utilities

```typescript
import {
  FormHandle,
  InferFieldNode,
  InferValueType,
} from '@canard/schema-form';

// Infer value type from schema
type FormValue = InferValueType<typeof jsonSchema>;

// Infer node type from schema
type RootNode = InferFieldNode<typeof jsonSchema>;

// Type-safe form handle
const formRef = useRef<FormHandle<typeof jsonSchema>>(null);
```

`InferValueType` requires `as const` on the schema; without it `type` widens to `string` and the result falls back to `any`. With `as const` it walks `properties` and `items`, and produces every field as **optional**, intersected with `Record<string, any>`:

```typescript
const jsonSchema = {
  type: 'object',
  properties: { name: { type: 'string' } },
  required: ['name'],
} as const;

type FormValue = InferValueType<typeof jsonSchema>;
// { name?: string } & Record<string, any>
```

- Fields stay optional even when listed in `required`, because a form may drop them at runtime (`controls.active` false, `options.omitEmpty`).
- The object stays open — the JSON Schema default — so keys contributed by `oneOf`/`anyOf`, `if`/`then`/`else`, or `patternProperties` are not rejected. Setting `additionalProperties: false` closes the inferred type.

When the exact shape is known, declare it and pass it as the second type argument:

```typescript
interface SignUpValue {
  name: string;
}

<Form<typeof jsonSchema, SignUpValue> jsonSchema={jsonSchema} onChange={(v) => v.name} />;
const formRef = useRef<FormHandle<typeof jsonSchema, SignUpValue>>(null);
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

// Nullable condition in FieldInput
const definitions = [
  { test: { type: 'string', nullable: true }, component: NullableInput },
  { test: { type: 'string', nullable: false }, component: RequiredInput },
];
```

### Nullable Objects and Arrays

A nullable object or array (`type: ['object', 'null']`, `type: ['array', 'null']`) has three distinct states, and the form never turns one into another by itself.

| Value       | Meaning                         | What the parent receives                                                    |
| ----------- | ------------------------------- | --------------------------------------------------------------------------- |
| `null`      | the object/array does not exist | `null` — never touched by `omitEmpty`                                       |
| `{}` / `[]` | it exists and is empty          | omitted by `omitEmpty` (default); kept with `options: { omitEmpty: false }` |
| `undefined` | unset                           | the key is omitted                                                          |

**Only intent changes `null`.**

- It becomes `null` through `defaultValue` / schema `default: null`, or `setValue(null)` on the node or through an ancestor.
- It becomes an object/array when one is assigned to the node itself — `setValue({})`, `setValue([])`, or `setValue({ ... }, SetValueOption.Merge)` with keys — or when a write **that carries a value** reaches an active descendant: user input, `setValue`, array `push`, or an `injectTo` the user caused. Confirming the value a field already shows counts.
- It stays `null` for values the form produces by itself: a child's `default`, `controls.derived`, `oneOf`/`anyOf` branch restore, reactivation by `controls.active`, the restore of a child during a reset, and an `injectTo` triggered only by such values (a source that merely has a `default` or a derived value).
- It stays `null` for a write without a value: emptying a field, `pop()`/`remove()`/`update()`/`clear()` on a null array, and `setValue({}, SetValueOption.Merge)`. An emptied field is remembered and honored once the node is created.

A field is _emptied_ when its node emits `undefined`. Under the default `omitEmpty` an empty string is emptying; `false`, `0` and `null` are values. With `options: { omitEmpty: false }` an empty string is a value too. A write into an inactive field reaches nobody.

A reset restores the default, whatever the node holds: back to `null` when the default is `null`, to the default object otherwise.

**While it is `null`**, the emitted value is `null` whatever the schema holds — arrays, defaults, derived values, `oneOf`/`anyOf`, controls-gated or virtual fields. An object's child fields stay rendered and show a blank form: what the form builds for them when it is given no `defaultValue` for this node — the node's own object `default` if it has one, otherwise each child's own `default`, with derived values applied and array children filled up to their `minItems`. It is identical whichever way the object became `null`, and data discarded by `null` does not come back. One thing is not part of the blank form: a value that reached a field through `injectTo`. A node that becomes `null` after mount loses it until its source changes again. A nullable **array** that is itself `null` has no items and no `minItems` fill.

**What it becomes** is exactly what the same write produces on a form given no `defaultValue` for this node (for an array: on an empty array), so the value always matches what the fields show. An array has no merge semantics: `setValue([], SetValueOption.Merge)` is an assignment and creates `[]`.

```tsx
const jsonSchema = {
  type: 'object',
  properties: {
    closed: {
      type: ['object', 'null'],
      properties: {
        reason: { type: 'string', default: 'completed' },
        note: { type: 'string' },
      },
    },
  },
};
// <Form jsonSchema={jsonSchema} defaultValue={{ closed: null }} />
// getValue()                     → { closed: null }   ('completed' is shown, not emitted)
// user types "done" into note    → { closed: { reason: 'completed', note: 'done' } }
// setValue({ closed: null })     → { closed: null }   (the fields show the blank form again)
```

- A **non-nullable** object assigned `null` becomes `{}`.
- `setValue(undefined)` is not `null`: it clears the subtree — every field, every array item — and does not restore child defaults.
- The form never alters a value to make it validate. Whether `null` is valid is the schema's decision. `oneOf` branches that declare no `type` all match `null`, so `null` fails such a `oneOf` in any validator; write the [null-branch pattern](#the-null-branch-pattern) — a `{ type: 'null' }` branch plus `type: 'object'` on the object branches — or use `anyOf`.

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
2. **Cache FieldInputDefinitions** - Define outside components
3. **Optimize ValidationMode** - Choose OnChange or OnRequest based on needs
4. **Use TypeScript as const** - For schema type inference
5. **Leverage controls.watch** - Implement reactive form logic
6. **Use Form.Render for custom layouts** - Meet complex UI requirements

---

## License

MIT License

---

## Version

Current: See package.json
