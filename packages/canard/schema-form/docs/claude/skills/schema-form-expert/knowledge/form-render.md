
# Form.Render Skill

Expert skill for @canard/schema-form's custom layout feature.

## Skill Info

- **Name**: form-render
- **Purpose**: Guide for custom layouts using Form.Render, Form.Input, Form.Label
- **Triggers**: Form.Render, Form.Input, Form.Label, custom layout, path-based rendering related questions


## Basic Usage

### Form.Input

Render only the input component for a specific path.

```typescript
import { Form } from '@canard/schema-form';

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    age: { type: 'number' },
  },
};

<Form jsonSchema={schema}>
  <div className="row">
    <Form.Input path="/name" />
    <Form.Input path="/email" />
  </div>
  <div className="row">
    <Form.Input path="/age" />
  </div>
</Form>
```

### Form.Label

Render only the label for a specific path.

```typescript
<Form jsonSchema={schema}>
  <div className="field">
    <Form.Label path="/name" />
    <Form.Input path="/name" />
  </div>
  <div className="field">
    <Form.Label path="/email" />
    <Form.Input path="/email" />
  </div>
</Form>
```

### Form.Render

Custom render a field at a specific path using the render props pattern.

```typescript
// Based on stories/12.RenderTest.stories.tsx
<Form jsonSchema={schema}>
  <Form.Render path="/password">
    {({ path, Input, value, errorMessage }: FormTypeRendererProps) => (
      <div
        style={{
          border: `1px solid ${value ? 'red' : 'blue'}`,
        }}
      >
        {path}
        <Input /> {value as string}
        <div>{errorMessage}</div>
      </div>
    )}
  </Form.Render>
</Form>
```


## Form.Render Props

```typescript
interface FormRenderProps {
  // Required: JSONPointer path
  path: string;

  // Required: render function
  children: (props: FormTypeRendererProps) => ReactNode;
}
```

### FormTypeRendererProps (render function argument)

```typescript
interface FormTypeRendererProps {
  // Node information
  node: SchemaNode;
  name: string;
  path: string;
  depth: number;

  // Schema
  jsonSchema: JsonSchema;

  // Value
  value: any;
  defaultValue: any;

  // State
  readOnly: boolean;
  disabled: boolean;
  required: boolean;

  // Errors
  errors: JsonSchemaError[];
  errorMessage: string;
  errorVisible: boolean;

  // Components
  Input: ComponentType;
  FormTypeInput: ComponentType<FormTypeInputProps>;
  ChildNodeComponents: ChildNodeComponent[];

  // Utilities
  formatError?: FormatErrorFunction;
}
```

### Usage Examples

```typescript
<Form.Render path="/name">
  {({ Input, node }) => (
    <div>
      {node.name}
      <Input />
    </div>
  )}
</Form.Render>

// Custom error message display
<Form.Render path="/email">
  {({ Input, errors, errorVisible }) => (
    <div>
      <Input />
      {errorVisible && errors.length > 0 && (
        <span className="error">{errors[0].message}</span>
      )}
    </div>
  )}
</Form.Render>

// Conditional styling
<Form.Render path="/password">
  {({ Input, value, errorMessage }) => (
    <div style={{ border: `1px solid ${value ? 'green' : 'gray'}` }}>
      <Input />
      {errorMessage && <div className="error">{errorMessage}</div>}
    </div>
  )}
</Form.Render>
```


## Nested Layouts

Custom layout for complex nested structures:

```typescript
const schema = {
  type: 'object',
  properties: {
    user: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        contacts: {
          type: 'object',
          properties: {
            email: { type: 'string' },
            phone: { type: 'string' },
          },
        },
      },
    },
  },
};

<Form jsonSchema={schema}>
  <div className="card">
    <h3>User Info</h3>
    <Form.Input path="/user/name" />
  </div>
  <div className="card">
    <h3>Contact Info</h3>
    <div className="row">
      <Form.Input path="/user/contacts/email" />
      <Form.Input path="/user/contacts/phone" />
    </div>
  </div>
</Form>
```


## Array Item Rendering

Custom rendering of array items:

```typescript
const schema = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          quantity: { type: 'number' },
        },
      },
    },
  },
};

// Direct access to first item
<Form.Input path="/items/0/name" />
<Form.Input path="/items/0/quantity" />

// Custom render array item with Form.Render
<Form.Render path="/items/0">
  {({ Input, ChildNodeComponents }) => (
    <div className="item-row">
      {ChildNodeComponents.map((Child, i) => (
        <Child key={i} />
      ))}
    </div>
  )}
</Form.Render>
```


## Caveats

### 1. Path Accuracy

```typescript
// ✅ Correct path
<Form.Input path="/user/name" />

// ❌ Non-existent path (error or ignored)
<Form.Input path="/nonexistent" />
```

### 2. Duplicate Rendering

```typescript
// ⚠️ Rendering same path multiple times duplicates UI
<Form.Input path="/name" />
<Form.Input path="/name" /> {/* Rendered twice */}
```

### 3. Mixing with Auto-Rendering

Using Form.Input/Form.Render does not exclude fields from automatic rendering. For complete custom layout, all fields must be explicitly rendered.
