
# Form Handle Skill

Expert skill for @canard/schema-form's FormHandle API.

## Skill Info

- **Name**: form-handle
- **Purpose**: Guide for programmatic form control through FormHandle
- **Triggers**: FormHandle, useRef, formRef, getValue, setValue, validate, reset, submit related questions


## FormHandle Interface

```typescript
interface FormHandle<
  Schema extends JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  // Node access
  node?: InferSchemaNode<Schema>;

  // Node traversal
  findNode: Fn<[path: SchemaNode['path']], SchemaNode | null>;
  findNodes: Fn<[path: SchemaNode['path']], SchemaNode[]>;

  // Focus/Selection
  focus: Fn<[dataPath: SchemaNode['path']]>;
  select: Fn<[dataPath: SchemaNode['path']]>;

  // Value management
  getValue: Fn<[], Value>;
  setValue: SetStateFnWithOptions<Value>;
  reset: Fn;

  // State management
  getState: Fn<[], NodeStateFlags>;
  setState: Fn<[state: NodeStateFlags]>;
  clearState: Fn;

  // Validation
  getErrors: Fn<[], JsonSchemaError[]>;
  validate: Fn<[], Promise<JsonSchemaError[]>>;
  showError: Fn<[visible: boolean]>;

  // File attachment
  getAttachedFilesMap: Fn<[], AttachedFilesMap>;

  // Submission
  submit: TrackableHandlerFunction<[], void, { loading: boolean }>;
}
```


## Value Management

### getValue()

Get current form value.

```typescript
const handleGetValue = () => {
  const value = formRef.current?.getValue();
  console.log('Current value:', value);
  // { name: 'John Doe', email: 'john@example.com' }
};
```

### setValue()

Set form value.

```typescript
// Set entire value
formRef.current?.setValue({
  name: 'John Doe',
  email: 'john@example.com',
});

// Functional update
formRef.current?.setValue((prev) => ({
  ...prev,
  name: 'New Name',
}));

// Set with options
import { SetValueOption } from '@canard/schema-form';

formRef.current?.setValue(
  { name: 'John Doe' },
  SetValueOption.Merge  // Merge with existing value
);
```

### reset()

Reset form to initial state.

```typescript
const handleReset = () => {
  formRef.current?.reset();
  // Restore to defaultValue
  // Reset state (dirty, touched)
};
```


## Focus Control

### focus()

Set focus on a specific field.

```typescript
const handleFocus = () => {
  formRef.current?.focus('/email');
};
```

### select()

Select a specific field.

```typescript
const handleSelect = () => {
  formRef.current?.select('/name');
};
```


## Validation

### validate()

Validate form and return error array.

```typescript
const handleValidate = async () => {
  const errors = await formRef.current?.validate();

  if (errors && errors.length === 0) {
    console.log('Validation passed!');
  } else {
    console.log('Validation failed:', errors);
  }
};
```

### getErrors()

Get current error list (without validation).

```typescript
const errors = formRef.current?.getErrors();
console.log('Current errors:', errors);
```

### showError()

Control error visibility.

```typescript
// Show errors
formRef.current?.showError(true);

// Hide errors
formRef.current?.showError(false);
```


## File Attachment

### getAttachedFilesMap()

Get map of attached files.

```typescript
const filesMap = formRef.current?.getAttachedFilesMap();
// { '/document': File, '/images': [File, File] }
```


## Type Safety

```typescript
// Leverage schema type inference
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' },
  },
} as const;

const formRef = useRef<FormHandle<typeof schema>>(null);

// getValue() return type is inferred
const value = formRef.current?.getValue();
// value: { name?: string; age?: number }

// setValue() type checking
formRef.current?.setValue({
  name: 'John Doe',
  age: 25,
});
```
