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
11. [Error Handling](#error-handling)
12. [Plugin System](#plugin-system)
13. [Advanced Features](#advanced-features)
14. [Type Definitions](#type-definitions)

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

### What the core does with a schema

The core follows the schema's **applicability** and never enforces its **constraints**. Applicability is which declarations are in effect — `properties`, `oneOf`/`anyOf` branches, `if`/`then`/`else`, `controls.active` and the exit policy — and the core shapes the value to it: a field whose declaration stops applying leaves the value. Constraint keywords — `type`, `minimum`, `minLength`, `minItems`, `maxItems`, `enum`, `pattern` and the like — are never enforced by rewriting or refusing a value: validation reports a violation and the input guides the user. An array with too many items is therefore a value of the right shape that breaks a constraint, the same kind of value as a string that is too long.

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
  onChange?: Fn<[value: Value]>;
  /** Function called with the form error list when a validation result or the external error list changes it */
  onValidate?: Fn<[errors: FieldNode['globalErrors']]>;
  /** Function called when the form is submitted */
  onSubmit?: Fn<[value: Value], Promise<void> | void>;
  /** Function called when the state of this SchemaForm changes */
  onStateChange?: Fn<[state: FieldNode['globalState']]>;
  /** Function called with each error record of this form instance, including construction and render failures */
  onError?: Fn<[record: FormErrorRecord]>;
  /** Function called when the root diagnostics change after preparation */
  onDiagnosticsChange?: Fn<[diagnostics: FieldNode['diagnostics']]>;
  /** Form default for `controls.unsetOnInactive`: drop a field's value when it leaves the shape (a node's own policy wins) */
  unsetOnInactive?: boolean;
  /** Form default that suppresses automatic writes without blocking imperative writes */
  disableAutomaticWrites?: boolean;
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
  errors?: FieldNode['globalErrors'];
  /** Custom format error function */
  formatError?: FieldRendererProps['formatError'];
  /**
   * Error display condition (default: ShowError.DirtyTouched)
   *   - `true`: Always show
   *   - `false`: Never show
   *   - `ShowError.Dirty`: Show when value has changed
   *   - `ShowError.Touched`: Show after the input has lost focus once
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
   *  - Requires IntersectionObserver for gating; SSR renders all fields and hydrates
   *    unchanged, then gates branches and children added after hydration
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

Every member except `getAttachedFilesMap` and `showError` addresses the form's current root node. When the form rebuilds its tree, the handle follows the new root.

```typescript
interface FormHandle<
  Schema extends JSONSchema = JSONSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  /** Current root node (undefined before the first mount) */
  node?: InferFieldNode<Schema>;
  /** Focus the input at `path` (root when omitted) */
  focus: Fn<[path?: FieldNode['path']]>;
  /** Select the value of the input at `path` (root when omitted) */
  select: Fn<[path?: FieldNode['path']]>;
  /** Ask the input at `path` to re-read its committed value (root when omitted) */
  refresh: Fn<[path?: FieldNode['path']]>;
  /** Remount the rendered subtree at `path` (root when omitted) */
  remount: Fn<[path?: FieldNode['path']]>;
  /** Reload the committed defaults; only the automatic-write options are accepted */
  reset: Fn<
    [
      option?:
        | typeof SetValueOption.DisableAutomaticWrites
        | typeof SetValueOption.EnableAutomaticWrites,
    ]
  >;
  /** Discard cached analysis and replace this form's tree with reset options. */
  rebuild: FormHandle<Schema, Value>['reset'];
  /** Find the node at a JSONPointer path */
  findNode: Fn<[path: FieldNode['path']], FieldNode | null>;
  /** Find every node matching a JSONPointer path */
  findNodes: Fn<[path: FieldNode['path']], readonly FieldNode[]>;
  /** Interaction flags that are true on at least one node */
  getState: Fn<[], FieldNode['globalState']>;
  /** Patch interaction flags on every node */
  setState: Fn<[state: FieldNode['state']]>;
  /** Clear interaction flags on every node */
  clearState: Fn;
  /** Current output value (array output filters applied) */
  getValue: Fn<[], Value>;
  /** Set the value */
  setValue: SetStateFnWithOptions<Value>;
  /** All current errors */
  getErrors: Fn<[], FieldNode['globalErrors']>;
  /** Attached files map */
  getAttachedFilesMap: Fn<[], AttachedFilesMap>;
  /** Run validation and return the errors */
  validate: Fn<[], Promise<FieldNode['globalErrors']>>;
  /** `true` (default) shows every error; `false` returns to the `showError` prop */
  showError: Fn<[visible?: boolean]>;
  /** Submit the form; `useFormSubmit` reads its pending state */
  submit: TrackableHandlerFunction;
}
```

- A `path` that matches no node makes `focus`, `select`, `refresh` and `remount` do nothing.
- Before the first mount, queries do not throw: `findNode` returns `null`, `findNodes`, `getErrors` and `validate` return an empty array, and `getState` returns an empty object.
- `showError(false)` does not hide errors; it hands control back to the Form's `showError` prop.
- `reset()` also empties the attached-files map and drops a `showError(true)` override, so error display follows the `showError` prop again.
- `rebuild(option?)` invalidates this schema object's cached blueprint and replaces this form's tree using the same options as `reset`. Other forms using the same schema object keep their existing tree during ordinary `reset`; their own `rebuild` or a new mount resolves fresh analysis.

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
  errors?: FieldNode['globalErrors'];
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

| Node         | Description                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------------ |
| `ObjectNode` | Key-value structures, `required`, `additionalProperties` support                                                   |
| `ArrayNode`  | Ordered collections and array manipulation methods; `minItems`/`maxItems` are reported by validation, not enforced |

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
- The strategy cannot change at run time. When gated declarations (`then` / `else`, any part carrying `controls.active`, a parent's `controls.fields` entry with `active` for the children it targets, or a `oneOf` / `anyOf` branch selected by `controls.active` or the host's `controls.discriminator`) would make the node a branch in one case and a terminal in another, the schema throws `TERMINAL_STRATEGY_MISMATCH`.
- A `oneOf` / `anyOf` branch without such a gate does not set its host's strategy; its `options.terminal` is ignored.

### Node Initialization

`<Form>` builds the node tree from `jsonSchema` and `defaultValue` and mounts it while it renders, so there is no initialization step to wait for. The package has no standalone node factory: reach nodes through the form.

```tsx
import { useEffect, useRef } from 'react';

import { Form, type FormHandle } from '@canard/schema-form';

const jsonSchema = {
  type: 'object',
  properties: { name: { type: 'string' } },
} as const;

function ProfileForm() {
  const formRef = useRef<FormHandle<typeof jsonSchema>>(null);

  useEffect(() => {
    const root = formRef.current?.node; // root node of the mounted tree
    formRef.current?.findNode('/name')?.setValue('Ada'); // node at a JSONPointer path
  }, []);

  return (
    <Form
      ref={formRef}
      jsonSchema={jsonSchema}
      onChange={(value) => console.log('Form value changed:', value)}
    />
  );
}
```

| Where you are               | How to get a node                                                                       |
| --------------------------- | --------------------------------------------------------------------------------------- |
| Outside the form, via a ref | `formRef.current.node`, `findNode(path)`, `findNodes(path)`                             |
| In a `children` function    | the `node` argument (see [Using children as a Function](#using-children-as-a-function)) |
| Inside a FieldInput         | the `node` prop (see [FieldInputProps](#fieldinputprops))                               |

Changing the `jsonSchema` or `defaultValue` prop alone keeps the current tree; `reset` reads both again. The form builds a new tree when the validator changes and when `reset` runs with a different `jsonSchema`, while a `reset` with the same schema reloads values into the existing tree. A node you stored before a rebuild belongs to the discarded tree, so read `formRef.current.node` or call `findNode` at the moment you need a node instead of keeping a reference.

### Node State Flags

A node's interaction flags live in `node.state`, keyed by the `FieldNodeState` enum. Other keys are allowed for your own flags.

```typescript
import { FieldNodeState } from '@canard/schema-form';

node.state[FieldNodeState.Dirty]; // true after the user changed this field's value
node.state[FieldNodeState.Touched]; // true after the user left (blurred) this field
node.state[FieldNodeState.ErrorVisible]; // explicit error display override, if set

node.setState({ [FieldNodeState.ErrorVisible]: true }); // patch this node's flags
node.rootNode.globalState; // flags that are true on at least one node
```

| Flag           | Set by                          | Effect                                                           |
| -------------- | ------------------------------- | ---------------------------------------------------------------- |
| `Dirty`        | every user input write          | used by `ShowError.Dirty` and `ShowError.DirtyTouched`           |
| `Touched`      | blur, one animation frame later | used by `ShowError.Touched` and `ShowError.DirtyTouched`         |
| `ErrorVisible` | you, through `setState`         | `true` or `false` overrides the `showError` policy for that node |

A `controls.resetInteraction` rule clears `Dirty` and `Touched` when its condition turns from false to true, or when the field loads or enters the form while the condition is true. `FormHandle.setState` patches every node, and `FormHandle.reset()` and `clearState()` remove every flag, including your own keys.

Other node properties report the field's current condition:

```typescript
node.errors; // errors displayed for this field (validation and external)
node.active; // false while a condition (`controls.active`, if/then/else, oneOf) excludes the field
node.visible; // visibility after every active declaration is combined
node.enabled; // active and visible
node.readOnly; // read-only, including schema `readOnly`
node.disabled; // disabled, independent of `enabled`
```

### Walking a Subtree

`node.visitSubtree(visitor)` calls `visitor` on the node itself and then on every node below it. Use it to read or update a whole section of the form in one pass.

```typescript
// Clear every string field under /profile, but leave /profile/locked and everything under it as is.
formRef.current?.findNode('/profile')?.visitSubtree((node) => {
  if (node.path === '/profile/locked') return false; // skip this node's descendants
  if (node.type === 'string') node.setValue('');
});
```

- **Order.** The node itself comes first, then its descendants in preorder, with siblings in `children` order. Terminal nodes are leaves.
- **Skipping.** Returning `false` skips that node's descendants only, and the walk goes on with the next sibling. Any other return value, `undefined` included, continues into the children.
- **Range.** From a node in the form, only the current shape is visited, so fields that a condition excludes are not. A node reachable twice is visited once, and a node created during the walk is not guaranteed to be visited. From a node that is no longer in the form (a reference kept after a condition or an array change took its field out), the walk covers the subtree that left the form with it.
- **Writes.** Value writes made during the walk are applied together when the walk ends, so value reads during the walk return the values from before it. State and external-error changes (`setState`, `setSubtreeState`, `clearSubtreeState`, `setExternalErrors`, `clearExternalErrors`) change the data at once, but their events, like those of `request`, are delivered once when the walk ends. Inside an enclosing `node.batch(fn)`, everything waits for the end of that batch instead. A form `reset` or a `resetSubtree()` inside the walk still takes effect at once.
- **Writes to a node that left the form.** Such a write never changes a field in the form, also during a walk or a batch. If a field of the same kind is at that path, the write does nothing; otherwise the value is kept for that path and loads when such a field comes back. Whether a field is at that path is judged by the last committed shape, not by changes made earlier in the same batch or walk, so such a write is still dropped when the same batch or walk has just removed that field. A reference to a field that the same batch or walk removes is still in the form when written, so its write is handled like any other write.
- **Errors.** If the visitor throws, the writes it already made are applied and the error is rethrown. If a walk inside a listener has made a value write, the error does not reach the code that called `visitSubtree`, as with `batch`.
- **Cost.** The walk opens nothing until something writes, so a read-only walk adds no cost and also works inside a listener. A write inside a listener follows the same rules as any other listener write.
- **FormHandle.** `FormHandle` has no `visitSubtree`. Call it on `formRef.current?.node` or on a node from `findNode`.

---

### Detached node references

A node that leaves the active tree keeps its last committed reads. Its subscriptions do not fire. Calling `setValue` or an array operation (`push`, `pop`, `insert`, `remove`, `update`, `clear`) through that reference has no effect on its frozen value, retained values, overlays, or a later active instance. Development mode reports `FormWarningCode.DetachedNodeWrite`; production bundles stay silent. `push` and `insert` return the frozen array length; the other array operations return `undefined`.

Write inactive values by including their paths in a live root or host's `setValue` JSON. These writes update retained overlays and `inactiveValues` without creating inactive nodes. Re-entry creates a fresh node and consumes that entry's retained slot and overlay.

Migration: obtain node references again with `find` after re-entry; write inactive values through a live host's `setValue` JSON. `find` keeps returning `null` for every path without an active node.

### Resolving a Node's Exit Value

`node.onInactive(listener): () => void` registers a synchronous resolver for that node instance and returns an unsubscribe function. It runs once immediately before a retained gate exit, with the preceding commit's value and `InactiveValueContext`. It does not run for form unmount/disposal, array item deletion, or an old instance consumed during re-entry. Register again on a new instance after re-entry.

Listeners run in registration order; the last non-`undefined` result wins. A defined listener result skips `controls.inactiveValue`; when all listeners return `undefined`, the declaration applies. A thrown listener cancels that node's entire override and records a settlement failure while preserving its original retained source. Exceptions do not prevent the exit from committing. The write that caused the exit then reports `FormErrorCode.ExpressionThrew` to `onError` and throws it, as a failed expression does. `setValue`, array operations, `batch` and `resetSubtree` inside a resolver are ignored; development builds report `FormWarningCode.WriteInInactiveResolver` and production bundles remain silent. Only these four write families are refused; state, external-error, request and validation commands keep their existing behavior.

Migration: move cleanup writes to the component's own node to `controls.inactiveValue` or `node.onInactive`; both take the same `(value, context) => next` resolver.

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

// Object form: each field narrows the hint it accepts; an omitted field matches anything.
// type, schemaType, path, format and inputType match one value or any value in a list.
type FieldInputTestObject = Partial<{
  type: FieldNodeType | FieldNodeType[];
  schemaType: FieldNode['schemaType'] | FieldNode['schemaType'][];
  path: string | string[];
  format: string | string[];
  inputType: string | string[];
  required: boolean;
  nullable: boolean;
}>;

// FieldInputHint object
type FieldInputHint = {
  type: FieldNodeType; // node kind: 'string', 'number', 'object', 'array', 'virtual', 'union', ...
  schemaType: FieldNode['schemaType']; // authored accepted kind(s), including 'integer'; undefined on a virtual node
  misfit: boolean; // the stored value mismatches the accepted kinds
  path: string;
  required: boolean;
  nullable: boolean;
  jsonSchema: JSONSchema | JSONSchemaWithVirtual;
  format?: string;
  inputType?: string;
};
```

inputType is a string hint that a definition's test interprets; it is not the HTML input type.

### FieldInputProps

```typescript
interface FieldInputProps<
  Value extends AllowedValue = any,
  Context extends Dictionary = object,
  WatchValues extends ReadonlyArray<any> = ReadonlyArray<any>,
  Schema extends JSONSchema | JSONSchemaWithVirtual = unknown extends Value
    ? JSONSchema
    : InferJSONSchema<Value>,
  Node extends FieldNode = unknown extends Value
    ? FieldNode
    : InferFieldNode<Schema>,
> {
  jsonSchema: Schema; // JSON Schema for FieldInput component
  readOnly: boolean; // Read-only state
  disabled: boolean; // Disabled state
  required: boolean; // Required field
  node: Node; // Field node
  type: Node['type']; // Node kind
  schemaType: Node['schemaType']; // Authored accepted kind(s), including 'integer'; undefined on a virtual node
  misfit: Node['misfit']; // Stored value mismatches the accepted kinds
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
    unsetValue: boolean | string;        // Clears the value when it turns from false to true
    resetInteraction: boolean | string;  // Clears dirty/touched when it turns from false to true
    unsetOnInactive: boolean | string;   // Drops the retained value when the node leaves the shape
    fields: { targets: string[]; controls: { /* first nine keys plus inactiveValue */ } }[];
    injectTo: (value, ctx) => ...;       // Pushes values to other nodes whenever this node's value changes
    inactiveValue: literal | ((value, ctx) => next); // Retained value when leaving the shape
    discriminator: string;               // oneOf/anyOf host: branch tag property
    watch: string[];                     // Value subscription (array of paths)
  }
}
```

The key list is closed: an unknown key makes the blueprint build throw a schema error (recognized by `isJSONSchemaError`) with code `UNKNOWN_GROUP_KEY`. Inside `controls.fields[].controls` and on the `controls` of a fragment (`oneOf`/`anyOf`/`allOf` branches, `then`, `else`), the first nine keys (`active` through `unsetOnInactive`) and `inactiveValue` are allowed; any of the other four throws.

The closed list applies inside `controls` and `options`. Outside the three groups, the top-level keys of 0.16 (`formType`, `FormTypeInput`, `FormTypeInputProps`, `FormTypeRendererProps`, `computed`, the `&`-prefixed keys, `injectTo`, `terminal`, `virtual`, `placeholder`, `errorMessages`, `propertyKeys`) are not read at all: 1.0.0 ignores them with no error or warning. There is no alias and no warning for them by design, so a schema migrated from 0.16 must move each key itself (see Migration (1.0.0) in the README).

### Retained Value at Exit

`controls.inactiveValue` accepts a literal (including strings, `false`, `0`, `null`, objects and arrays) or an `InactiveValueResolver<V>`. Strings are never compiled as expressions. The resolver has the same `(value, context) => next` signature as `node.onInactive(listener)` and the same context fields as `injectTo`: `dataPath`, `schemaPath`, `jsonSchema`, `parentValue`, `parentJSONSchema`, `rootValue`, `rootJSONSchema`, and form `context`. Every value and schema comes from the preceding commit; `undefined` leaves the retained source unchanged. No dependencies are tracked. If the closing write explicitly supplies this path in its JSON, that value takes precedence and neither resolver runs. Within the departing subtree, an explicitly supplied whole ancestor also covers omitted descendants; a merge covers only supplied keys. A merge from a form input follows the same rule. Inside a multi-write batch a merge is shallow, so a supplied key replaces its subtree whole. Explicit coverage is the union of the batch: a later empty or partial merge does not remove an earlier whole replacement. A later automatic write also preserves the earlier caller whole coverage. Omitting the departing subtree itself still permits its resolvers. After an array move, value reads and `dataPath` use the preceding committed address; the result is retained at the current address.

Only normal retained gate exits with automatic writes enabled run these resolvers. Automatic-write suppression, failed or budget-limited settlement, load/reset scope, throwing gates and instances entered only within the same settlement skip them. A true `unsetOnInactive` policy skips them, and declaring both on the same layer reports `FormWarningCode.InactiveValueWithUnsetOnInactive`. Node controls take precedence over fields controls, which take precedence over fragment controls. A descendant result overwrites its path inside an ancestor result. Results use the existing inactive JSON write rules: undeclared keys remain extras, wrong-kind values remain retained, and re-entry consumes the overlay.

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

A branch usually omits `type` and takes its parent's. The parent's own `type` decides the node's kind; a branch `type` never changes it.

- A branch whose `type` differs from the parent's is not rejected when the schema loads. The form keeps the parent's kind, and the validator still evaluates the branch with its own `type`, so the branch matches only values of that type.
- A property declared by the parent and again by an ungated branch (one without `controls.active` that `controls.discriminator` does not select) must stay within the parent property's `type`. A narrower `type` is accepted and the parent's wins; a `type` outside it throws `SHARED_NODE_KIND_CONFLICT`. When only ungated branches declare a property, they must agree on its kind, or the same error is thrown. A property in a gated branch is not compared: when the parent declares it, the parent's `type` wins; otherwise the gated branch's field keeps its own kind.
- Discriminator tags may carry a `type`, as in `kind: { type: 'string', const: 'cat' }`. Tags of different kinds across branches, or overlapping tag values, throw `DISCRIMINATOR_MISMATCH`; tag `const` / `enum` values with nothing in common throw `EMPTY_ENUM_INTERSECTION`; a tag value outside the tag's own `type` gives the warning `DISCRIMINATOR_BRANCH_UNREACHABLE`.

These errors are schema errors (recognized by `isJSONSchemaError`). An object handled as a single input — `options.terminal: true`, or a `presentation.FieldInput` component set on the object's schema — builds no child nodes, so the property check above does not run for its branches. `DISCRIMINATOR_MISMATCH`, `EMPTY_ENUM_INTERSECTION` and the `NULL_BRANCH_IGNORED_FOR_FORM` warning below still apply; `DISCRIMINATOR_BRANCH_UNREACHABLE` is not reported, because it is checked against a child field the object does not build, and the validator still sees the schema as written.

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
- Whether the object is `null` is decided by its value, and which object branch is shown by the branch conditions. While the value is `null`, the children of the selected branch are shown without their defaults (see [Nullable Objects and Arrays](#nullable-objects-and-arrays)). The same holds, for the same reason (the form display, the node data and the emitted value must not drift apart), while an object or array field holds a value of the wrong kind, for example a string loaded into an object: its children receive no defaults until a child is given a value.
- Where the null branch sits does not matter; errors of the branch in use reach their fields. When the object value fails its `oneOf`, the null branch reports its own mismatch ("must be null") on the object like any other branch that did not match, next to the `oneOf` error.
- A nullable object whose `oneOf` cannot validate `null` — no branch accepts it, or several do — fails validation whenever its value is `null`. The form does not warn about this, so check the branches when you write the schema. `anyOf` needs no such care: one null branch, or untyped branches, already satisfy it.

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
| `*`    | Wildcard          | node.find(), FieldInputMap        |
| `@`    | Context reference | controls expressions only         |

### Escape Rules

Segments are interpreted in this order:

1. A segment exactly equal to `*`, `..`, `.`, or `@` is an operator (wildcard, parent, current, or context).
2. A segment exactly equal to `%2A`, `%2E%2E`, `%2E`, or `%40` is the literal property name `*`, `..`, `.`, or `@`, respectively.
3. Every other segment decodes only `~1` → `/` and `~0` → `~`. Ordinary names containing `%`, such as `rate%20`, remain unchanged.

`#` is a fragment prefix only at the beginning of a path; an interior `#` segment is an ordinary name. Node paths, inactive-value paths, and reported error paths use the literal percent form for reserved names, so `node.find('/branch/%2A')` addresses the child named `*`, while `/branch/*` remains a wildcard.

The root pointer is the empty string or `#`; `/` and `#/` each address the root's empty-string key. Validator paths and fieldInputMap keys follow the same rule.

Known limit: property names exactly equal to `%2A`, `%2E`, `%2E%2E`, or `%40` are not supported. Their path would read back as the reserved operator name (`*`, `.`, `..`, `@`), which would misdirect value loading, inactive values, and validation routing, so building the form rejects the schema with `FormErrorCode.ReservedPropertyName`; the error names the property and this rule. Percent-containing names other than those exact four spellings follow rule 3.

Standard RFC 6901 pointers from validators and `$ref` are interpreted without these operators. An AJV path `/*` refers to the property named `*`; standard fragment pointers (`#/...`) percent-decode every segment.

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

## Error Handling

Errors from `@canard/schema-form` reach you in three places:

| Where | What arrives |
| --- | --- |
| `onError` prop of `<Form>` | Every error **and** warning record of that form instance: `level` (`'error'` or `'warning'`), `code`, `message`, and, when known, `path`, `schemaPath`, `details` and the `error` itself |
| `submit()` (`FormHandle.submit`, `useFormSubmit`) | Rejects with a `ValidationError` (`FormErrorCode.SchemaValidationFailed`) when validation fails, and with a `SchemaFormError` (`FormErrorCode.SubmitWhileDegraded`) when the form's diagnostics are degraded |
| `registerPlugin` | Throws an `UnhandledError` (`FormErrorCode.RegisterPlugin`) |

Four error classes, each with its own guard: `isJSONSchemaError` (the schema cannot become a form), `isSchemaFormError` (runtime failures of a form instance), `isValidationError` (submission rejected by validation), `isUnhandledError` (failures outside a form instance). The classes are siblings checked with `instanceof`, so at most one guard matches; an error thrown by your own code or a plugin matches none. Every error carries `code` (`'<GROUP>.<CODE>'`, for example `'SCHEMA_FORM_ERROR.RENDER_FAILED'`), `group`, `specific` and `details`.

**Compare `code` with the `FormErrorCode` and `FormWarningCode` constants, not with string literals.** The constants are the only supply path for these values: if a code is renamed inside the package, a handler that uses the constant follows the change or fails to compile, while a literal keeps compiling and silently never matches again. Both are object enums with a matching union type, so `FormErrorCode` also types a variable that holds any error code.

```tsx
import { useRef } from 'react';
import {
  Form,
  FormErrorCode,
  FormWarningCode,
  isValidationError,
  useFormSubmit,
  type FormHandle,
} from '@canard/schema-form';

const jsonSchema = {
  type: 'object',
  properties: { name: { type: 'string' } },
} as const;

declare function reportToMonitoring(error: unknown): void;

function ProfileForm() {
  const formRef = useRef<FormHandle<typeof jsonSchema>>(null);
  const { submit, pending } = useFormSubmit(formRef);

  const handleSubmit = async () => {
    try {
      await submit();
    } catch (error) {
      if (isValidationError(error) && error.code === FormErrorCode.SchemaValidationFailed)
        return; // field errors are already on the form; formRef.current?.getErrors() lists them
      throw error;
    }
  };

  return (
    <>
      <Form
        ref={formRef}
        jsonSchema={jsonSchema}
        onError={(record) => {
          if (record.code === FormErrorCode.RenderFailed) reportToMonitoring(record.error);
          else if (record.code === FormWarningCode.Misfit) console.info(record.path, record.message);
        }}
      />
      <button onClick={handleSubmit} disabled={pending}>Submit</button>
    </>
  );
}
```

### Code list

Values are the `error.code` / `record.code` strings exactly as emitted.

#### Schema errors — the schema cannot become a form (`isJSONSchemaError`)

| Constant | `error.code` value | When | Note |
| --- | --- | --- | --- |
| `FormErrorCode.UnknownJsonSchema` | `'JSON_SCHEMA_ERROR.UNKNOWN_JSON_SCHEMA'` | schema analysis cannot determine a supported shape |  |
| `FormErrorCode.ReservedPropertyName` | `'JSON_SCHEMA_ERROR.RESERVED_PROPERTY_NAME'` | a property name is exactly `%2A`, `%2E`, `%2E%2E`, or `%40` | `details.property` names the rejected property. |
| `FormErrorCode.UnexpectedArraySchema` | `'JSON_SCHEMA_ERROR.UNEXPECTED_ARRAY_SCHEMA'` | schema analysis finds an invalid array declaration |  |
| `FormErrorCode.AllOfTypeRedefinition` | `'JSON_SCHEMA_ERROR.ALL_OF_TYPE_REDEFINITION'` | static allOf types have an empty intersection |  |
| `FormErrorCode.ConflictingConstValues` | `'JSON_SCHEMA_ERROR.CONFLICTING_CONST_VALUES'` | static allOf constants conflict |  |
| `FormErrorCode.InvalidRange` | `'JSON_SCHEMA_ERROR.INVALID_RANGE'` | static allOf range intersection is empty |  |
| `FormErrorCode.EmptyEnumIntersection` | `'JSON_SCHEMA_ERROR.EMPTY_ENUM_INTERSECTION'` | static allOf enum intersection is empty |  |
| `FormErrorCode.VirtualFieldsNotValid` | `'JSON_SCHEMA_ERROR.VIRTUAL_FIELDS_NOT_VALID'` | virtual field references are invalid |  |
| `FormErrorCode.VirtualFieldsNotInProperties` | `'JSON_SCHEMA_ERROR.VIRTUAL_FIELDS_NOT_IN_PROPERTIES'` | virtual fields are absent from declared properties |  |
| `FormErrorCode.CreateDynamicFunction` | `'JSON_SCHEMA_ERROR.CREATE_DYNAMIC_FUNCTION'` | a controls expression cannot be compiled |  |
| `FormErrorCode.ObservedValues` | `'JSON_SCHEMA_ERROR.OBSERVED_VALUES'` | observed-value expression analysis fails |  |
| `FormErrorCode.UnknownGroupKey` | `'JSON_SCHEMA_ERROR.UNKNOWN_GROUP_KEY'` | a controls, options, or child controls key is outside its closed list |  |
| `FormErrorCode.DiscriminatorMismatch` | `'JSON_SCHEMA_ERROR.DISCRIMINATOR_MISMATCH'` | a discriminator key or branch value is inconsistent |  |
| `FormErrorCode.SharedNodeKindConflict` | `'JSON_SCHEMA_ERROR.SHARED_NODE_KIND_CONFLICT'` | static and ungated branch node kinds conflict |  |
| `FormErrorCode.TerminalStrategyMismatch` | `'JSON_SCHEMA_ERROR.TERMINAL_STRATEGY_MISMATCH'` | declarations disagree on a node's terminal strategy |  |
| `FormErrorCode.RecursiveShapeUnbounded` | `'JSON_SCHEMA_ERROR.RECURSIVE_SHAPE_UNBOUNDED'` | schema analysis finds an unbounded recursive shape |  |
| `FormErrorCode.VirtualFieldsMismatch` | `'JSON_SCHEMA_ERROR.VIRTUAL_FIELDS_MISMATCH'` | declarations disagree on virtual fields |  |
| `FormErrorCode.ChildrenTargetNotFound` | `'JSON_SCHEMA_ERROR.CHILDREN_TARGET_NOT_FOUND'` | a declared child name is absent from the schema |  |
| `FormErrorCode.TerminalOptionUnsupported` | `'JSON_SCHEMA_ERROR.TERMINAL_OPTION_UNSUPPORTED'` | a single-row kind declares a different terminal option |  |
| `FormErrorCode.InvalidControlShape` | `'JSON_SCHEMA_ERROR.INVALID_CONTROL_SHAPE'` | a known controls, options, or child controls key has the wrong shape |  |

#### Form errors — runtime failures of a form instance (`isSchemaFormError`)

| Constant | `error.code` value | When | Note |
| --- | --- | --- | --- |
| `FormErrorCode.SharedNodeConflict` | `'SCHEMA_FORM_ERROR.SHARED_NODE_CONFLICT'` | active declarations cannot share one node kind |  |
| `FormErrorCode.BudgetExceeded` | `'SCHEMA_FORM_ERROR.BUDGET_EXCEEDED'` | settlement exceeds its host, derive, or transition budget |  |
| `FormErrorCode.ExpressionThrew` | `'SCHEMA_FORM_ERROR.EXPRESSION_THREW'` | an active controls expression throws during settlement |  |
| `FormErrorCode.GuardFailed` | `'SCHEMA_FORM_ERROR.GUARD_FAILED'` | guard compilation or synchronous evaluation fails |  |
| `FormErrorCode.InjectTargetMissing` | `'SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING'` | a dynamic injection has no target |  |
| `FormErrorCode.FeedbackLimitExceeded` | `'SCHEMA_FORM_ERROR.FEEDBACK_LIMIT_EXCEEDED'` | listener feedback or onChange nesting exceeds its budget |  |
| `FormErrorCode.ListenerThrew` | `'SCHEMA_FORM_ERROR.LISTENER_THREW'` | a subscriber or form callback throws |  |
| `FormErrorCode.MultipleErrors` | `'SCHEMA_FORM_ERROR.MULTIPLE_ERRORS'` | a dispatch chain or observer produces multiple errors |  |
| `FormErrorCode.FormTypeInputMap` | `'SCHEMA_FORM_ERROR.FORM_TYPE_INPUT_MAP'` | render input-map normalization fails |  |
| `FormErrorCode.InvalidWriteOption` | `'SCHEMA_FORM_ERROR.INVALID_WRITE_OPTION'` | a public write combines incompatible options |  |
| `FormErrorCode.DisposedNodeWrite` | `'SCHEMA_FORM_ERROR.DISPOSED_NODE_WRITE'` | a caller writes through a disposed node reference |  |
| `FormErrorCode.WriteInObserver` | `'SCHEMA_FORM_ERROR.WRITE_IN_OBSERVER'` | onError tries to write to its own form |  |
| `FormErrorCode.SubmitWhileDegraded` | `'SCHEMA_FORM_ERROR.SUBMIT_WHILE_DEGRADED'` | submission is attempted while diagnostics are degraded |  |
| `FormErrorCode.ValidatorCompileFailed` | `'SCHEMA_FORM_ERROR.VALIDATOR_COMPILE_FAILED'` | whole-schema compilation fails on the first validation request |  |
| `FormErrorCode.ValidatorThrew` | `'SCHEMA_FORM_ERROR.VALIDATOR_THREW'` | a compiled validator throws during validation |  |
| `FormErrorCode.RenderFailed` | `'SCHEMA_FORM_ERROR.RENDER_FAILED'` | an injected renderer or root render throws |  |
| `FormErrorCode.InvalidVirtualNodeValues` | `'SCHEMA_FORM_ERROR.INVALID_VIRTUAL_NODE_VALUES'` | a virtual node receives values with the wrong shape |  |
| `FormErrorCode.ArrayMethodOnNonArray` | `'SCHEMA_FORM_ERROR.ARRAY_METHOD_ON_NON_ARRAY'` | an array-only command is called on another node kind |  |
| `FormErrorCode.RecursiveShapeDiverged` | `'SCHEMA_FORM_ERROR.RECURSIVE_SHAPE_DIVERGED'` | recursive shape expansion exceeds the settlement budget |  |

#### Validation errors — submission rejected by validation (`isValidationError`)

| Constant | `error.code` value | When | Note |
| --- | --- | --- | --- |
| `FormErrorCode.SchemaValidationFailed` | `'VALIDATION_ERROR.SCHEMA_VALIDATION_FAILED'` | schema validation fails on submit | emitted by `submit()` |

#### Unhandled errors — failures outside a form instance (`isUnhandledError`)

| Constant | `error.code` value | When | Note |
| --- | --- | --- | --- |
| `FormErrorCode.RegisterPlugin` | `'UNHANDLED_ERROR.REGISTER_PLUGIN'` | global plugin registration fails outside a form instance |  |
| `FormErrorCode.ValidatorBindRefused` | `'UNHANDLED_ERROR.VALIDATOR_BIND_REFUSED'` | a plugin refuses a bound validator instance outside a form | thrown by the AJV plugins as their own error carrying this `group` and `code`; `isUnhandledError` does not recognize it, so compare `error.code` |

#### Warnings — reported, never thrown

| Constant | `error.code` value | When | Note |
| --- | --- | --- | --- |
| `FormWarningCode.AllOfKeywordIgnoredForForm` | `'SCHEMA_FORM_WARNING.ALL_OF_KEYWORD_IGNORED_FOR_FORM'` | schema analysis ignores an allOf keyword for rendering |  |
| `FormWarningCode.NullBranchIgnoredForForm` | `'SCHEMA_FORM_WARNING.NULL_BRANCH_IGNORED_FOR_FORM'` | schema analysis ignores a null branch for rendering |  |
| `FormWarningCode.VirtualizationDisabledForForm` | `'SCHEMA_FORM_WARNING.VIRTUALIZATION_DISABLED_FOR_FORM'` | render virtualization lacks IntersectionObserver |  |
| `FormWarningCode.IfWithoutElseFalse` | `'SCHEMA_FORM_WARNING.IF_WITHOUT_ELSE_FALSE'` | a conditional branch has if without else false |  |
| `FormWarningCode.LockOnNonTerminalObject` | `'SCHEMA_FORM_WARNING.LOCK_ON_NON_TERMINAL_OBJECT'` | a nonterminal object declares a lock |  |
| `FormWarningCode.ConditionalSchemaWithoutValidator` | `'SCHEMA_FORM_WARNING.CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR'` | an if gate exists without a validator |  |
| `FormWarningCode.ValidatorMissing` | `'SCHEMA_FORM_WARNING.VALIDATOR_MISSING'` | a tree requests validation but no validator is selected |  |
| `FormWarningCode.MultipleGatedBranchesActive` | `'SCHEMA_FORM_WARNING.MULTIPLE_GATED_BRANCHES_ACTIVE'` | multiple gated oneOf branches become active |  |
| `FormWarningCode.ResetRebuiltByReference` | `'SCHEMA_FORM_WARNING.RESET_REBUILT_BY_REFERENCE'` | a reset rebuilds a tree because the schema reference changes |  |
| `FormWarningCode.DependentSchemasIgnoredForForm` | `'SCHEMA_FORM_WARNING.DEPENDENT_SCHEMAS_IGNORED_FOR_FORM'` | dependentSchemas is unsupported for form shape |  |
| `FormWarningCode.ChildNodeComponentsOnTerminal` | `'SCHEMA_FORM_WARNING.CHILD_NODE_COMPONENTS_ON_TERMINAL'` | a terminal input reads empty child-node components |  |
| `FormWarningCode.TerminalSubtreeKeyIgnoredForForm` | `'SCHEMA_FORM_WARNING.TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM'` | a terminal subtree declares a reserved key ignored by the form |  |
| `FormWarningCode.DiscriminatorBranchUnreachable` | `'SCHEMA_FORM_WARNING.DISCRIMINATOR_BRANCH_UNREACHABLE'` | a branch discriminator literal is outside the allowed list |  |
| `FormWarningCode.NonJsonWholeValue` | `'SCHEMA_FORM_WARNING.NON_JSON_WHOLE_VALUE'` | a development-mode whole value is not JSON-compatible |  |
| `FormWarningCode.FormTypeTestInvalid` | `'SCHEMA_FORM_WARNING.FORM_TYPE_TEST_INVALID'` | an input definition test object has an unknown key |  |
| `FormWarningCode.Misfit` | `'SCHEMA_FORM_WARNING.MISFIT'` | a value cannot be converted to the active type unambiguously |  |
| `FormWarningCode.DialectMismatch` | `'SCHEMA_FORM_WARNING.DIALECT_MISMATCH'` | a schema dialect differs from the selected validator dialect |  |

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
- **SSR and hydration**: every field renders on the server and hydrates unchanged. Gating applies to branches and children added after hydration and requires `IntersectionObserver`; browsers without it render eagerly with a development warning. The server does not warn.

#### Input responsiveness at scale

Enable `virtualization` for branches with at least `threshold` children when structural changes interrupt typing. In [IR-1](../../architecture/verification/input-responsiveness/ir-1-results.md#기본값-결정-자료), replace-200's longest frame with it off was 62.3 ms in the adopted build (every measured build exceeded 50 ms); with it on, no frame of 50 ms or more was detected. The adopted A lane's same-window mount medians (ms) show the trade-off:

| Form | Off: eager paint / all revealed | On: eager paint / all revealed |
| --- | ---: | ---: |
| flat-500 | 51.750 / 51.750 | 31.600 / 174.250 |
| nested-d5-f4 | 89.250 / 89.250 | 89.700 / 89.700 |
| array-1000 | 201.350 / 201.350 | 59.200 / 473.100 |

Deferred inputs are unavailable to find-in-page, screen readers, and browser autofill until reveal; Focus/Select commands force reveal. This applies while either backfill mode still has placeholders. Every server-rendered field hydrates unchanged and stays revealed across remounts; only branches and children added after hydration are gated. In React 18, a dehydrated Suspense boundary inside a custom branch input may still switch to client rendering. See [IR-5](../../architecture/verification/input-responsiveness/ir-5-results.md). The default remains off.

- **Validation:** cost grows with schema size. The desktop Chromium flat-2000 [IR-2 diagnosis](../../architecture/verification/input-responsiveness/ir-2-results.md#원인-분해-진단코디네이터-2026-10-31) attributed about a quarter of the p95 keystroke cost to validation execution/delivery and its second React commit. The cold, non-burst validation-on minus validation-off input-event dispatch difference was about 1.3 ms median / 2.9 ms p95. For very large forms, use `validationMode={ValidationMode.OnRequest}` and validate on demand or submit.
- **Custom input styling:** in that 2000-input diagnosis, `input { contain: strict; width: 153px; height: 21px; }` cut forced layout per keystroke from 2.5–3.8 ms median to 0.42–0.47 ms median; a plain block wrapper did not help. Give contained inputs an explicit size and check your layout.
- **Consumer state:** for expensive application rendering in `onChange`, wrap your own update, e.g. `onChange={(value) => startTransition(() => setValue(value))}`. Root `onChange` remains synchronous by design. [IR-0](../../architecture/verification/input-responsiveness/ir-0-results.md#type-onchange-state-plain) E lane event-processing median/p95 was 0.800/5.100 ms plain versus 0.800/4.600 ms with `startTransition`; handler median/p95 stayed 0.400/0.900 ms in both. These fixture results do not promise a speedup for arbitrary consumer work.

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
arrayNode.insert(index, 'custom'); // Insert at index in [0, length]; returns the new length (length appends like push; out of range does nothing)
arrayNode.clear(); // Remove all items

arrayNode.children?.length; // Current number of item nodes (null on an array rendered as a single input)
arrayNode.children; // Array of child nodes
```

### Array Limits (`minItems` / `maxItems`)

The core neither fills nor blocks: an array holds exactly the items that were loaded or written.

- `minItems` creates no items — not at mount, not on reset, not when a branch becomes active again. An array loaded as `[]` stays `[]`; a default or `defaultValue` with fewer items than `minItems` is kept as given.
- `maxItems` refuses no write. `push()` always appends and returns the new length; `setValue` with a longer array is applied; `items: false` after `prefixItems` does not stop a push either.
- Both limits stay on the effective schema (`node.jsonSchema`) and validation reports a violation on the emitted value (`outputValue`).
- The built-in array input draws empty slots up to `minItems` in the UI only and writes no value; typing into a slot writes that position at that moment. It hides its add button once `maxItems` is reached. It shows the remove button whatever `minItems` says, and it does not read `prefixItems`. A custom input that must enforce a range reads `node.jsonSchema` and `node.children` and disables its own controls.

### Array Output Filters (`omitTrailing` / `omitEmpty`)

Array schemas accept output filters under `options`. They refine what the array **emits** — parent propagation, root validation, and the external surfaces (`onChange`, `getValue()`, `submit`) — while child nodes and the raw `node.value` keep every item, so empty rows the user added stay rendered.

```tsx
const jsonSchema = {
  type: 'array',
  items: { type: 'string' },
  options: { omitTrailing: true },
};
// The user adds three rows and fills only the first one
// node.value: ['first', undefined, undefined]
// getValue() / onChange / validation see: ['first']
```

- `omitTrailing` (opt-in): removes **trailing** consecutive `undefined` items only. Leading and middle `undefined` items are preserved so error `dataPath`s and validation indices stay aligned — `[1, undefined, 2]` is emitted as-is.
- `omitEmpty` (on by default): converts an empty array to `undefined` on the parent-propagation path. Filter order is `omitTrailing → omitEmpty`, so an all-empty array collapses to `undefined` under its parent (a root-level form still emits `[]`).
- `null` is not an empty value: neither filter touches a nullable array that is `null` — see [Nullable Objects and Arrays](#nullable-objects-and-arrays).
- `node.value` stays raw; the refined output is exposed as `node.outputValue`. Validation runs against the refined value, so trailing empty items do not count toward `minItems`; leading and middle ones do.
- A reset restores the array's loaded value and creates no items for `minItems`. A plain `setValue(undefined)` clears every item — and so does a replace-style write on the parent that omits the array: `setValue({ other: 1 })` empties it, `SetValueOption.Merge` leaves it untouched. An array whose default is `null` resets to `null`.

### Object Options (`propertyOrder` / `virtual`)

Object schemas accept two more keys under `options`.

```typescript
{
  type: 'object',
  properties: {
    name: { type: 'string' },
    startDate: { type: 'string', format: 'date' },
    endDate: { type: 'string', format: 'date' },
  },
  options: {
    propertyOrder: ['endDate', 'startDate'], // emitted as { endDate, startDate, name }
    virtual: { period: { fields: ['startDate', 'endDate'] } },
  },
}
```

- `propertyOrder` is the key order of the emitted object value, not the on-screen order. Listed keys come first, then the other declared properties in declaration order, then undeclared keys in the order they arrived. Listed keys the value does not hold are skipped, and JavaScript always puts integer-like keys first.
- `virtual` names virtual field groups. Each entry lists in `fields` the sibling properties it gathers into one virtual node, and may carry that node's own keys such as `presentation` and `controls`. A virtual node is never authored as a schema with `type: 'virtual'`.

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
import { isValidationError, useFormSubmit } from '@canard/schema-form';

const { submit, pending } = useFormSubmit(formRef);

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
  { test: { type: 'string', nullable: true }, Component: NullableInput },
  { test: { type: 'string', nullable: false }, Component: RequiredInput },
];
```

`nullable: true` is the OpenAPI 3.0 compatible notation and is officially supported. It is equivalent to adding `'null'` to `type`: `{ type: 'string', nullable: true }` means `{ type: ['string', 'null'] }`. No warning or error is raised for this notation.

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
- It stays `null` for a write without a value: emptying a field, `pop()`/`remove()`/`update()`/`clear()` and `insert()` at an index other than 0 on a null array, and `setValue({}, SetValueOption.Merge)`. An emptied field is remembered and honored once the node is created.

A field is _emptied_ when its node emits `undefined`. Under the default `omitEmpty` an empty string is emptying; `false`, `0` and `null` are values. With `options: { omitEmpty: false }` an empty string is a value too. A write into an inactive field reaches nobody.

A reset restores the default, whatever the node holds: back to `null` when the default is `null`, to the default object otherwise.

**While it is `null`**, the emitted value is `null` whatever the schema holds — arrays, defaults, derived values, `oneOf`/`anyOf`, controls-gated or virtual fields. An object's child fields stay rendered, and no child default or object default appears in them while it is `null`; a value written by `controls.derived` or `injectTo` still shows in its field without creating the object. This is the same however the object became `null` (load, reset or write); data discarded by `null` does not come back. This rule, and the same rule for a loaded value of the wrong kind, exists so that what the form shows, the node data and the emitted value never drift apart. A nullable **array** that is itself `null` has no items.

**What it becomes:** typing into a child field promotes the object to an object holding that value. Only fields created by the promotion (for example a branch the new value opens) receive their defaults; fields that already existed stay empty until filled. For an array, the write acts on an empty array. An array has no merge semantics: `setValue([], SetValueOption.Merge)` is an assignment and creates `[]`.

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
// getValue()                     → { closed: null }   (the fields show no defaults)
// user types "done" into note    → { closed: { note: 'done' } }
// setValue({ closed: null })     → { closed: null }   (the fields show no defaults again)
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
