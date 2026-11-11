# Component Implementation Patterns

Recommended patterns when implementing React-based @canard/schema-form plugin components.

## Uncontrolled vs Controlled Components

### Uncontrolled Components (recommended)

**When to use**: always prefer this as the default pattern

**Benefits**:

- Avoids unnecessary re-renders
- Better performance
- Strong compatibility with React Hook Form

**Pattern**:

```typescript
const FormTypeInputString = ({
  defaultValue,  // ✅ Use defaultValue
  onChange,
  ...props
}: FormTypeInputStringProps) => {
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  });

  return (
    <TextField
      defaultValue={defaultValue}  // ✅ Uncontrolled
      onChange={handleChange}
      {...props}
    />
  );
};
```

### Controlled Components (only when needed)

**When to use**:

- Real-time validation is required
- Conditional rendering is required
- Value formatting or conversion is required

**Pattern**:

```typescript
const FormTypeInputEmail = ({
  value,  // ✅ Use value
  onChange,
  ...props
}: FormTypeInputEmailProps) => {
  // Real-time validation
  const isValid = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }, [value]);

  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  });

  return (
    <TextField
      value={value}  // ✅ Controlled
      onChange={handleChange}
      error={!isValid && value.length > 0}
      helperText={!isValid ? 'Invalid email' : ''}
      {...props}
    />
  );
};
```

## Value Precedence Pattern

Props can come from several places: direct props, context, jsonSchema

**Precedence**: `direct props` > `context` > `jsonSchema` > `default`

```typescript
const FormTypeInputString = ({
  jsonSchema,
  context,
  name,
  // Direct props
  size: sizeProp,
  variant: variantProp,
  placeholder: placeholderProp,
  label: labelProp,
}: FormTypeInputStringProps) => {
  // Apply precedence with useMemo
  const [size, variant, placeholder, label] = useMemo(() => {
    return [
      sizeProp || context.size || 'medium',  // 1st: sizeProp
      variantProp || context.variant || 'outlined',
      placeholderProp || jsonSchema.placeholder || '',
      labelProp || jsonSchema.label || jsonSchema.title || name,
    ];
  }, [sizeProp, context, jsonSchema, variantProp, placeholderProp, labelProp, name]);

  return (
    <TextField
      size={size}
      variant={variant}
      placeholder={placeholder}
      label={label}
    />
  );
};
```

## ChildNodeComponents Pattern (Array/Object)

Array and Object types render child nodes with `ChildNodeComponents`.

### Array Component

```typescript
const FormTypeInputArray = ({
  jsonSchema,
  path,
  name,
  ChildNodeComponents,  // ✅ Provided automatically by canard-form
  onChange,
  value,
  context,
}: FormTypeInputArrayProps) => {
  // ChildNodeComponents is an array of function components that already received the props they need

  return (
    <Box>
      <Typography variant="h6">{jsonSchema.title || name}</Typography>

      {ChildNodeComponents.map((ChildComponent, index) => (
        <Paper key={index} sx={{ p: 2, mb: 2 }}>
          {/* ✅ ChildComponent already has its props */}
          <ChildComponent />

          {/* Apply the UI library's styles */}
          <IconButton
            size="small"
            onClick={() => {
              // Removal is handled inside canard-form
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Paper>
      ))}

      {/* Add button */}
      <Button
        startIcon={<AddIcon />}
        onClick={() => {
          // Addition is handled inside canard-form
        }}
        disabled={
          jsonSchema.maxItems !== undefined &&
          value.length >= jsonSchema.maxItems
        }
      >
        Add Item
      </Button>
    </Box>
  );
};
```

**Cautions**:

- Do **not** pass props directly to `ChildNodeComponents`
- Implement only the add and remove buttons in the UI library's style
- The actual add and remove logic is handled inside canard-form

## Value Conversion Pattern (DatePicker, TimePicker, and similar)

When the UI library component and the JSONSchema value format differ:

```typescript
const FormTypeInputDate = ({
  defaultValue,  // ISO 8601 string: "2025-01-16"
  onChange,
  ...props
}: FormTypeInputDateProps) => {
  // 1. Convert defaultValue (string → Date)
  const dateValue = useMemo(() => {
    if (!defaultValue) return null;
    try {
      return parseISO(defaultValue);
    } catch {
      return null;
    }
  }, [defaultValue]);

  // 2. Convert onChange (Date → string)
  const handleChange = useHandle((newDate: Date | null) => {
    if (!newDate) {
      onChange('');
      return;
    }
    try {
      onChange(formatISO(newDate, { representation: 'date' }));
    } catch {
      onChange('');
    }
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        value={dateValue}  // Date object
        onChange={handleChange}
        slotProps={{
          textField: {
            id: props.path,
            name: props.name,
            required: props.required,
            disabled: props.disabled,
          },
        }}
      />
    </LocalizationProvider>
  );
};
```

## Wrapper Component Pattern

When a UI library needs an extra Provider:

```typescript
// DatePicker - LocalizationProvider is required
const FormTypeInputDate = ({ ...props }: FormTypeInputDateProps) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker {...props} />
    </LocalizationProvider>
  );
};

// RichTextEditor - an editor Provider is required
const FormTypeInputRichText = ({ ...props }: FormTypeInputRichTextProps) => {
  return (
    <EditorProvider>
      <RichTextEditor {...props} />
    </EditorProvider>
  );
};
```

## Conditional Props Pattern

When a UI library component uses a nested props structure:

### MUI slotProps Pattern

```typescript
const FormTypeInputDate = ({
  path,
  name,
  required,
  disabled,
  size,
  ...props
}: FormTypeInputDateProps) => {
  return (
    <DatePicker
      slotProps={{
        // TextField props
        textField: {
          id: path,
          name,
          required,
          disabled,
          size,
        },
        // Other slot props
        day: {
          sx: { /* custom styles */ },
        },
      }}
      {...props}
    />
  );
};
```

### Ant Design Nested Props Pattern

```typescript
const FormTypeInputUpload = ({
  path,
  name,
  onChange,
  ...props
}: FormTypeInputUploadProps) => {
  return (
    <Upload
      id={path}
      name={name}
      customRequest={(options) => {
        // File upload logic
      }}
      onChange={(info) => {
        onChange(info.fileList);
      }}
      {...props}
    >
      <Button icon={<UploadOutlined />}>Upload</Button>
    </Upload>
  );
};
```

## Enum/Select Pattern

Render enum values as Select or Radio:

```typescript
const FormTypeInputStringEnum = ({
  jsonSchema,
  defaultValue,
  onChange,
  ...props
}: FormTypeInputStringEnumProps) => {
  const isMultiple = type === 'array';
  const enumValues = jsonSchema.enum || [];
  const enumLabels = jsonSchema.enumLabels || {};

  const handleChange = useHandle((event: SelectChangeEvent<string | string[]>) => {
    onChange(event.target.value);
  });

  return (
    <Select
      defaultValue={defaultValue}
      onChange={handleChange}
      multiple={isMultiple}
      {...props}
    >
      {enumValues.map((value) => (
        <MenuItem key={value} value={value}>
          {enumLabels[value] || value}
        </MenuItem>
      ))}
    </Select>
  );
};
```

## Error Handling Pattern

```typescript
import { useFieldErrors } from '@canard/schema-form';

const FormTypeInputString = ({
  node,
  ...props
}: FormTypeInputStringProps) => {
  // An input does not receive `errors` or `errorVisible` props.
  // errorMessage is already null while errors must not be shown.
  const { errorMessage } = useFieldErrors(node);
  const hasError = errorMessage != null;

  return (
    <TextField
      error={hasError}
      helperText={errorMessage}
      {...props}
    />
  );
};
```

`useFieldErrors(node)` returns `{ errors, errorVisible, errorMessage, formatError }`.

**Caution**: calling the hook makes the input re-render on its field's error changes, so call it only in inputs that display error state themselves. The field group renders the message through `FormErrorMessage`.

## Hidden Label Pattern

```typescript
const FormTypeInputBoolean = ({
  jsonSchema,
  name,
  label: labelProp,
  hideLabel,
  ...props
}: FormTypeInputBooleanProps) => {
  const label = useMemo(() => {
    if (hideLabel) return undefined;
    return labelProp || jsonSchema.label || jsonSchema.title || name;
  }, [hideLabel, labelProp, jsonSchema, name]);

  return (
    <FormControlLabel
      control={<Checkbox {...props} />}
      label={label}
    />
  );
};
```

## Accessibility Pattern

```typescript
import { useFieldErrors } from '@canard/schema-form';

const FormTypeInputString = ({
  node,
  path,
  name,
  jsonSchema,
  required,
  ...props
}: FormTypeInputStringProps) => {
  const { errorMessage } = useFieldErrors(node);
  const hasError = errorMessage != null;
  const describedBy = hasError ? `${path}-error` : undefined;

  return (
    <>
      <TextField
        id={path}
        name={name}
        required={required}
        aria-invalid={hasError}
        aria-describedby={describedBy}
        aria-required={required}
        {...props}
      />
      {hasError && (
        <FormHelperText id={`${path}-error`} error>
          {errorMessage}
        </FormHelperText>
      )}
    </>
  );
};
```

---

**Core principles**:

1. Prefer uncontrolled components. An uncontrolled definition declares nothing. A component that draws from `value` alone and keeps no copy of it declares `controlled: true` (`{ Component, test, controlled: true }`) as an optimization: outside writes then reach it through `value` without a remount.
2. Value precedence: direct props > context > jsonSchema
3. Optimize computation with useMemo
4. Memoize handlers with useHandle
5. Do not pass props to ChildNodeComponents
6. Make value conversion explicit
7. Accessibility attributes are required
