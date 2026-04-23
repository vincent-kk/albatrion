
# FormTypeInput Skill

Expert skill for @canard/schema-form's FormTypeInput system.

## Skill Info

- **Name**: formtype-input
- **Purpose**: Guide for developing and customizing FormTypeInput components
- **Triggers**: FormTypeInput, formTypeInputDefinitions, formTypeInputMap, custom input component related questions


## FormTypeInputProps Interface

```typescript
interface FormTypeInputProps<
  Value extends AllowedValue = any,
  Context extends Dictionary = object,
  WatchValues extends Array<any> = Array<any>,
  Schema extends JsonSchemaWithVirtual = InferJsonSchema<Value>,
  Node extends SchemaNode = InferSchemaNode<Schema>,
> {
  // Schema information
  jsonSchema: Schema;
  type: Node['schemaType'];
  name: Node['name'];
  path: Node['path'];
  nullable: Node['nullable'];

  // State
  readOnly: boolean;
  disabled: boolean;
  required: boolean;
  errorVisible: boolean;
  errors: Node['errors'];

  // Node access
  node: Node;

  // Value management
  defaultValue: Value | undefined;
  value: Value | undefined;
  onChange: SetStateFnWithOptions<Value | undefined>;

  // File attachment
  onFileAttach: Fn<[file: File | File[] | undefined]>;

  // Child components
  ChildNodeComponents: ChildNodeComponent[];

  // watch values
  watchValues: WatchValues;

  // Styling
  placeholder: string | undefined;
  className: string | undefined;
  style: CSSProperties | undefined;

  // Context
  context: Context;

  // Allow additional properties
  [alt: string]: any;
}
```


## Test Object Properties

```typescript
interface FormTypeInputHint {
  type: SchemaType;           // 'string' | 'number' | 'boolean' | 'array' | 'object' | 'null'
  format?: string;            // 'email' | 'date' | 'password' | etc.
  formType?: string;          // Custom type identifier
  path: string;               // JSONPointer path
  nullable: boolean;          // Whether null is allowed
  jsonSchema: JsonSchema;     // Full schema object
}
```

### Test Function Examples

```typescript
const formTypeInputDefinitions: FormTypeInputDefinition[] = [
  // Complex condition
  {
    test: (hint) => {
      // String type with enum
      if (hint.type === 'string' && hint.jsonSchema.enum) {
        return true;
      }
      return false;
    },
    Component: SelectInput,
  },

  // Pattern-based
  {
    test: (hint) => {
      return hint.path.startsWith('/settings/');
    },
    Component: SettingsInput,
  },

  // Composite condition
  {
    test: (hint) => {
      return (
        hint.type === 'number' &&
        hint.jsonSchema.minimum !== undefined &&
        hint.jsonSchema.maximum !== undefined
      );
    },
    Component: RangeSliderInput,
  },
];
```


## Wildcard Patterns

### Array Index Matching

```typescript
const formTypeInputMap = {
  // name field of all array items
  '/items/*/name': ItemNameInput,

  // Nested arrays
  '/orders/*/items/*/price': PriceInput,
};

// Matching examples:
// /items/0/name ✓
// /items/1/name ✓
// /items/abc/name ✓ (string keys also match)
```

### Dynamic Object Key Matching

```typescript
const formTypeInputMap = {
  // All values in dynamic object
  '/metadata/*': MetadataValueInput,

  // Subfields within specific pattern
  '/config/*/enabled': ToggleInput,
};
```

### Composite Patterns

```typescript
const formTypeInputMap = {
  // Multiple wildcard levels
  '/users/*/addresses/*/city': CityInput,

  // Wildcard + fixed path
  '/products/*/variants/*/price': ProductPriceInput,
};
```


## Utilizing ChildNodeComponents

Use when rendering child nodes in object or array types.

```typescript
const CustomObjectLayout: FC<FormTypeInputProps<Record<string, any>>> = ({
  ChildNodeComponents,
}) => {
  return (
    <div className="custom-grid">
      {ChildNodeComponents.map((ChildNode, index) => (
        <div key={index} className="grid-item">
          <ChildNode />
        </div>
      ))}
    </div>
  );
};
```
