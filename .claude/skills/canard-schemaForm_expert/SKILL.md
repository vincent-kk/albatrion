---
name: schema-form-expert
description: "@canard/schema-form library expert. Provides Q&A, usage examples, and troubleshooting by referencing all knowledge files."
user-invocable: false
---

# Schema Form Expert Skill

This is an expert skill for @canard/schema-form. This skill answers questions about the schema-form library, provides usage examples, and assists with troubleshooting.

## Skill Info

- **Name**: schema-form-expert
- **Purpose**: @canard/schema-form library Q&A and guidance
- **Triggers**: `/schema-form` command or schema-form related questions

---

## Knowledge Files Reference

Refer to the following knowledge files for detailed guides by feature:

| File | Topics | Load When |
|------|--------|-----------|
| `knowledge/computed-properties.md` | watch, active, visible, readOnly, disabled, pristine, derived | Computed property questions |
| `knowledge/conditional-schema.md` | oneOf, anyOf, allOf, if-then-else, &if | Conditional schema questions |
| `knowledge/formtype-input.md` | FormTypeInput, FormTypeInputProps, formTypeInputDefinitions | Custom input component questions |
| `knowledge/validation.md` | validate, ValidationMode, errorMessages, formatError | Validation questions |
| `knowledge/inject-to.md` | injectTo, field value injection, circular references | Value injection questions |
| `knowledge/array-operations.md` | ArrayNode, push, remove, clear, prefixItems | Array manipulation questions |
| `knowledge/form-handle.md` | FormHandle, useRef, getValue, setValue, validate, reset | Programmatic control questions |
| `knowledge/jsonpointer.md` | JSONPointer, paths, .., ., *, @ | Path reference questions |
| `knowledge/plugin-system.md` | registerPlugin, plugin development, UI plugins | Plugin questions |
| `knowledge/form-render.md` | Form.Render, Form.Input, Form.Label, custom layouts | Custom layout questions |
| `knowledge/virtual-schema.md` | virtual, VirtualNode, field grouping | Virtual field questions |
| `knowledge/state-management.md` | NodeState, dirty, touched, globalState, onStateChange | State management questions |
| `knowledge/context-usage.md` | context, @, userRole, permissions, mode | External data integration questions |
| `knowledge/event-system.md` | event, subscribe, events, UpdateValue, subscription, batching | Event system questions |
| `knowledge/troubleshooting.md` | errors, issues, not working, bugs, debugging | Troubleshooting questions |
| `knowledge/performance-optimization.md` | performance, optimization, slow, Strategy, memory, bulk | Performance optimization questions |
| `knowledge/testing-guide.md` | testing, test, unit testing, component testing | Test writing questions |

---

## Knowledge Base

### Core Architecture

1. **Node System**
   - Terminal Nodes: StringNode, NumberNode, BooleanNode, NullNode
   - Branch Nodes: ObjectNode, ArrayNode (BranchStrategy/TerminalStrategy)
   - VirtualNode: Conditional/computed fields

2. **FormTypeInput Priority** (highest to lowest)
   1. `FormTypeInput` property in JSON Schema
   2. `formTypeInputMap` path mapping
   3. Form's `formTypeInputDefinitions`
   4. FormProvider's `formTypeInputDefinitions`
   5. Plugin's `formTypeInputDefinitions`

3. **JSONPointer Extensions**
   - `..` : Parent navigation (computed, node.find() only)
   - `.` : Current node (computed, node.find() only)
   - `*` : Wildcard (FormTypeInputMap only)
   - `@` : Context reference (computed only)

### Key Interfaces

```typescript
// FormProps
interface FormProps<
  Schema extends JsonSchema = JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  jsonSchema: Schema;
  defaultValue?: Value;
  readOnly?: boolean;
  disabled?: boolean;
  onChange?: SetStateFn<Value>;
  onValidate?: Fn<[jsonSchemaError: JsonSchemaError[]]>;
  onSubmit?: Fn<[value: Value], Promise<void> | void>;
  onStateChange?: Fn<[state: NodeStateFlags]>;
  formTypeInputDefinitions?: FormTypeInputDefinition[];
  formTypeInputMap?: FormTypeInputMap;
  CustomFormTypeRenderer?: ComponentType<FormTypeRendererProps>;
  errors?: JsonSchemaError[];
  formatError?: FormTypeRendererProps['formatError'];
  showError?: boolean | ShowError;
  validationMode?: ValidationMode;
  validatorFactory?: ValidatorFactory;
  context?: Dictionary;
  children?: ReactNode | Fn<[props: FormChildrenProps<Schema, Value>], ReactNode>;
}

// FormHandle
interface FormHandle<
  Schema extends JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  node?: InferSchemaNode<Schema>;
  focus: Fn<[dataPath: SchemaNode['path']]>;
  select: Fn<[dataPath: SchemaNode['path']]>;
  reset: Fn;
  findNode: Fn<[path: SchemaNode['path']], SchemaNode | null>;
  findNodes: Fn<[path: SchemaNode['path']], SchemaNode[]>;
  getState: Fn<[], NodeStateFlags>;
  setState: Fn<[state: NodeStateFlags]>;
  clearState: Fn;
  getValue: Fn<[], Value>;
  setValue: SetStateFnWithOptions<Value>;
  getErrors: Fn<[], JsonSchemaError[]>;
  getAttachedFilesMap: Fn<[], AttachedFilesMap>;
  validate: Fn<[], Promise<JsonSchemaError[]>>;
  showError: Fn<[visible: boolean]>;
  submit: TrackableHandlerFunction<[], void, { loading: boolean }>;
}

// FormTypeInputProps
interface FormTypeInputProps<
  Value extends AllowedValue = any,
  Context extends Dictionary = object,
  WatchValues extends Array<any> = Array<any>,
  Schema extends JsonSchemaWithVirtual = InferJsonSchema<Value>,
  Node extends SchemaNode = InferSchemaNode<Schema>,
> {
  jsonSchema: Schema;
  readOnly: boolean;
  disabled: boolean;
  required: boolean;
  node: Node;
  type: Node['schemaType'];
  name: Node['name'];
  path: Node['path'];
  nullable: Node['nullable'];
  errors: Node['errors'];
  errorVisible: boolean;
  watchValues: WatchValues;
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

### Computed Properties

```typescript
computed: {
  watch: string | string[];     // Value subscription
  active: boolean | string;     // Active state (false removes value)
  visible: boolean | string;    // Visibility (false retains value)
  readOnly: boolean | string;   // Read-only state
  disabled: boolean | string;   // Disabled state
  pristine: boolean | string;   // State reset
  derived: string;              // Derived value
}

// Shorthand syntax
'&active': '../toggle === true'
'&visible': "@.userRole === 'admin'"
'&derived': '(../price ?? 0) * (../quantity ?? 0)'
```

**Choosing active vs visible:**
- `active`: **Removes value** when hidden → Conditional fields, payment method fields
- `visible`: **Retains value** when hidden → Collapsible UI, step-by-step forms

### Conditional Schemas

```typescript
// oneOf (exclusive choice)
oneOf: [
  { '&if': "./type === 'A'", properties: { fieldA: {...} } },
  { '&if': "./type === 'B'", properties: { fieldB: {...} } },
]

// anyOf (non-exclusive choice)
anyOf: [
  { '&if': './hasFeature1', properties: { config1: {...} } },
  { '&if': './hasFeature2', properties: { config2: {...} } },
]

// if-then-else
if: { properties: { country: { const: 'KR' } } },
then: { properties: { phone: { pattern: '^010-' } } },
else: { properties: { phone: { pattern: '^\\+' } } }
```

### ValidationMode

```typescript
enum ValidationMode {
  None = 0,      // Validation disabled
  OnChange = 1,  // Validate on value change
  OnRequest = 2, // Validate on validate() call
}

// Combination
ValidationMode.OnChange | ValidationMode.OnRequest
```

### Plugins

```typescript
// Available plugins
@canard/schema-form-ajv8-plugin  // AJV 8.x validation
@canard/schema-form-ajv7-plugin  // AJV 7.x validation
@canard/schema-form-ajv6-plugin  // AJV 6.x validation
@canard/schema-form-antd5-plugin // Ant Design 5 UI
@canard/schema-form-antd6-plugin // Ant Design 6 UI
@canard/schema-form-antd-mobile-plugin // Ant Design Mobile UI
@canard/schema-form-mui-plugin   // Material UI

// Registration
import { registerPlugin } from '@canard/schema-form';
registerPlugin(plugin);
```

---

## Response Guidelines

### Response by Question Type

1. **Concept questions**: Explain with reference to knowledge files
2. **Usage questions**: Explain with code examples
3. **Troubleshooting**: Analyze cause → Suggest solution
4. **Comparison questions**: Organize differences in tables or lists

### Question-Skill Mapping

| Question Type | Knowledge File to Reference |
|----------|----------------|
| "What is computed visible?" | `knowledge/computed-properties.md` |
| "How to set oneOf conditions?" | `knowledge/conditional-schema.md` |
| "Create custom input component" | `knowledge/formtype-input.md` |
| "How to customize error messages?" | `knowledge/validation.md` |
| "Update field B when field A changes" | `knowledge/inject-to.md` |
| "How to add array items?" | `knowledge/array-operations.md` |
| "Get form value from outside?" | `knowledge/form-handle.md` |
| "What is the path syntax?" | `knowledge/jsonpointer.md` |
| "Develop custom plugin" | `knowledge/plugin-system.md` |
| "Build custom form layout?" | `knowledge/form-render.md` |
| "Group multiple fields?" | `knowledge/virtual-schema.md` |
| "Manage dirty, touched state" | `knowledge/state-management.md` |
| "Control fields with external data" | `knowledge/context-usage.md` |
| "How event system works" | `knowledge/event-system.md` |
| "It's not working" | `knowledge/troubleshooting.md` |
| "How to improve performance?" | `knowledge/performance-optimization.md` |
| "How to write tests?" | `knowledge/testing-guide.md` |

### Response Format

```markdown
## [Question Summary]

### Answer
[Core explanation]

### Example Code
```tsx
// Related example
```

### References
- Related knowledge: [File name] (`knowledge/filename.md`)
- Related story: [Story filename]
- Notes: [If any]
```

---

## Reference Documents

Specification document location: `packages/canard/schema-form/docs/`

| File | Content |
|------|------|
| `ko/SPECIFICATION.md` | Full specification (Korean) |
| `en/SPECIFICATION.md` | Full specification (English) |
| `claude/skills/schema-form-expert/knowledge/*.md` | Detailed guides by feature (17 knowledge files) |

---

## Example Responses

### Question: What is the FormTypeInput priority?

```markdown
## FormTypeInput Priority

FormTypeInput selection follows this priority order (highest to lowest):

1. **Direct assignment in JSON Schema**
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

### References
- Related knowledge: FormTypeInput (`knowledge/formtype-input.md`)
- When conditions match, the first defined takes priority
```

### Question: How to reference sibling fields in computed

```markdown
## Referencing Sibling Fields in Computed

Use `..` (parent navigation) to reference sibling fields.

### Example
```tsx
const schema = {
  type: 'object',
  properties: {
    category: {
      type: 'string',
      enum: ['A', 'B'],
    },
    details: {
      type: 'string',
      computed: {
        // ../category = navigate to parent then reference category
        active: "../category === 'A'",
        watch: '../category',
      },
    },
  },
};
```

### Path Reference Rules
- `../field` : Sibling field
- `../../field` : Parent's sibling
- `./field` : Current object's child (in array items)
- `/field` : Absolute path (from root)
- `@.prop` : Context object property

### References
- Related knowledge: Computed Properties (`knowledge/computed-properties.md`), JSONPointer (`knowledge/jsonpointer.md`)
```

---

## Implementation Guide

This skill uses a directory-based structure:

```
schema-form-expert/
├── SKILL.md                          # This file (main skill definition)
└── knowledge/                        # Knowledge files directory
    ├── array-operations.md           # Array manipulation
    ├── computed-properties.md        # Computed Properties
    ├── conditional-schema.md         # Conditional schemas
    ├── context-usage.md              # Context usage
    ├── event-system.md               # Event system
    ├── form-handle.md                # FormHandle API
    ├── form-render.md                # Custom layouts
    ├── formtype-input.md             # FormTypeInput system
    ├── inject-to.md                  # InjectTo feature
    ├── jsonpointer.md                # JSONPointer extensions
    ├── performance-optimization.md   # Performance optimization
    ├── plugin-system.md              # Plugin system
    ├── state-management.md           # State management
    ├── testing-guide.md              # Test writing
    ├── troubleshooting.md            # Troubleshooting
    └── virtual-schema.md             # Virtual Schema
```

All knowledge files are written in pure markdown format without frontmatter.
