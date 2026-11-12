# Component Implementation Patterns

Recommended patterns when implementing React-based @canard/schema-form plugin components.

## Uncontrolled vs Controlled Components

### Uncontrolled Components (recommended)

**When to use**: always prefer this as the default pattern

**Benefits**:

- The DOM owns the input draft
- No React state copy of the draft is required
- Strong compatibility with React Hook Form

**Pattern**:

```typescript
const FieldInputString = ({
  defaultValue,  // ✅ Use defaultValue
  onChange,
  ...props
}: FieldInputStringProps) => {
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value === '' ? undefined : event.target.value);
  });
  return (
    <TextField
      defaultValue={defaultValue}  // ✅ Uncontrolled
      onChange={handleChange}
      id={props.path} name={props.name}
      disabled={props.disabled || props.readOnly}
      required={props.required}
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
const FieldInputEmail = ({
  value,  // ✅ Use value
  onChange,
  ...props
}: FieldInputEmailProps) => {
  const isValid = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value ?? '');
  }, [value]);
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value === '' ? undefined : event.target.value);
  });
  return (
    <TextField
      value={value ?? ''}  // ✅ Controlled
      onChange={handleChange}
      error={!isValid && (value?.length ?? 0) > 0}
      helperText={!isValid ? 'Invalid email' : ''}
      id={props.path} name={props.name}
      disabled={props.disabled || props.readOnly}
      required={props.required}
    />
  );
};
```

## Value Precedence Pattern

Props can come from several places: direct props, context, jsonSchema

**Precedence**: `direct props` > `context` > `jsonSchema` > `default`

```typescript
const FieldInputString = ({
  jsonSchema,
  context,
  name,
  // Direct props
  size: sizeProp,
  variant: variantProp,
  placeholder: placeholderProp,
  label: labelProp,
}: FieldInputStringProps) => {
  const [size, variant, placeholder, label] = useMemo(() => {
    return [
      sizeProp || context.size || 'medium',  // 1st: sizeProp
      variantProp || context.variant || 'outlined',
      placeholderProp || jsonSchema.presentation?.FieldInputProps?.placeholder || '',
      labelProp || jsonSchema.title || name,
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

## ChildFields Pattern (Array/Object)

Array and Object types render child nodes with `ChildFields`.

### Array Component

```typescript
const FieldInputArray = ({
  jsonSchema,
  name,
  ChildFields,  // ✅ Provided automatically by canard-form
  node,
  readOnly,
  disabled,
  context,
}: FieldInputArrayProps) => {
  return (
    <Box>
      <Typography variant="h6">{jsonSchema.title || name}</Typography>
      {ChildFields.map((ChildComponent, index) => (
        <Paper key={ChildComponent.key} sx={{ p: 2, mb: 2 }}>
          <ChildComponent />
          <IconButton
            size="small"
            onClick={() => node.remove(index)}
            disabled={readOnly || disabled}
          >
            <DeleteIcon />
          </IconButton>
        </Paper>
      ))}
      <Button
        startIcon={<AddIcon />}
        onClick={() => node.push()}
        disabled={
          readOnly || disabled ||
          (jsonSchema.maxItems !== undefined &&
           (node.children?.length ?? 0) >= jsonSchema.maxItems)
        }
      >
        Add Item
      </Button>
    </Box>
  );
};
```

**Cautions**:

- Do **not** pass value or defaultValue to a Child; override onChange only for the hybrid-parent pattern
- Implement only the add and remove buttons in the UI library's style
- Call node.push() and node.remove(index) so structural edits preserve surviving child identities

## Value Conversion Pattern (DatePicker, TimePicker, and similar)

When the UI library component and the JSONSchema value format differ:

```typescript
const FieldInputDate = ({
  defaultValue,  // ISO 8601 string: "2025-01-16"
  onChange,
  ...props
}: FieldInputDateProps) => {
  const dateValue = useMemo(() => {
    if (!defaultValue) return null;
    try {
      return dayjs(defaultValue);
    } catch {
      return null;
    }
  }, [defaultValue]);
  const handleChange = useHandle((newDate: Dayjs | null) => {
    if (!newDate) {
      onChange(undefined);
      return;
    }
    if (!newDate.isValid()) return;
    try {
      onChange(newDate.format('YYYY-MM-DD'));
    } catch {
      onChange(undefined);
    }
  });
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        defaultValue={dateValue}  // Dayjs value
        onChange={handleChange}
        slotProps={{
          textField: {
            id: props.path, name: props.name,
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
const FieldInputDate = ({ ...props }: FieldInputDateProps) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        defaultValue={props.defaultValue ? dayjs(props.defaultValue) : null}
        onChange={(date: Dayjs | null) => {
          if (date === null) props.onChange(undefined);
          else if (date.isValid()) props.onChange(date.format('YYYY-MM-DD'));
        }}
        slotProps={{ textField: { id: props.path, name: props.name, required: props.required } }}
      />
    </LocalizationProvider>
  );
};
// RichTextEditor - an editor Provider is required
const FieldInputRichText = ({ ...props }: FieldInputRichTextProps) => {
  return (
    <EditorProvider>
      <RichTextEditor value={props.value ?? ''} onChange={props.onChange} />
    </EditorProvider>
  );
};
```

## Conditional Props Pattern

When a UI library component uses a nested props structure:

### MUI slotProps Pattern

```typescript
const FieldInputDate = ({
  path,
  name,
  required,
  disabled,
  size,
  defaultValue,
  onChange,
}: FieldInputDateProps) => {
  return (
    <DatePicker
      defaultValue={defaultValue ? dayjs(defaultValue) : null}
      onChange={(date: Dayjs | null) => {
        if (date === null) onChange(undefined);
        else if (date.isValid()) onChange(date.format('YYYY-MM-DD'));
      }}
      slotProps={{
        textField: {
          id: path,
          name,
          required,
          disabled,
          size,
        },
        day: {
          sx: { /* custom styles */ },
        },
      }}
    />
  );
};
```

### Ant Design Nested Props Pattern

```typescript
import { Upload, Button as UploadButton } from 'antd';
const FieldInputUpload = ({
  path,
  name,
  onChange,
  onFileAttach,
  ...props
}: FieldInputUploadProps) => {
  return (
    <Upload
      id={path}
      name={name}
      maxCount={1}
      customRequest={({ file, onSuccess }) => {
        onFileAttach(file as File);
        onChange((file as File).name);
        onSuccess?.('ok');
      }}
      disabled={props.disabled || props.readOnly}
    >
      <UploadButton icon={<UploadOutlined />}>Upload</UploadButton>
    </Upload>
  );
};
```

## Enum/Select Pattern

Render enum values as Select or Radio:

```typescript
const FieldInputStringEnum = ({
  jsonSchema,
  alias,
  defaultValue,
  onChange,
  ...props
}: FieldInputStringEnumProps) => {
  const enumValues = (jsonSchema.enum ?? []).filter((value): value is string => typeof value === 'string');
  const enumLabels: Record<string, string> = alias ?? {};
  const handleChange = useHandle((event: SelectChangeEvent<string>) => {
    onChange(event.target.value === '' ? undefined : event.target.value);
  });
  return (
    <Select
      defaultValue={defaultValue ?? ''}
      onChange={handleChange}
      id={props.path} name={props.name}
      disabled={props.disabled || props.readOnly}
      required={props.required}
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
const FieldInputString = ({
  node,
  defaultValue,
  onChange,
  ...props
}: FieldInputStringProps) => {
  const { errorMessage } = useFieldErrors(node);
  const hasError = errorMessage != null;
  return (
    <TextField
      defaultValue={defaultValue ?? ''}
      onChange={(event) => onChange(event.target.value === '' ? undefined : event.target.value)}
      error={hasError}
      helperText={errorMessage}
      id={props.path} name={props.name}
      disabled={props.disabled || props.readOnly}
      required={props.required}
    />
  );
};
```

`useFieldErrors(node)` returns `{ errors, errorVisible, errorMessage, formatError }`.

**Caution**: calling the hook makes the input re-render on its field's error changes, so call it only in inputs that display error state themselves. The field group renders the message through `ErrorMessageRenderer`.

## Hidden Label Pattern

The value-driven checkbox declares controlled: true on its FieldInputDefinition.

```typescript
const FieldInputBoolean = ({
  jsonSchema,
  value,
  onChange,
  name,
  label: labelProp,
  hideLabel,
  ...props
}: FieldInputBooleanProps) => {
  const label = useMemo(() => {
    if (hideLabel) return undefined;
    return labelProp || jsonSchema.title || name;
  }, [hideLabel, labelProp, jsonSchema, name]);
  return (
    <FormControlLabel
      control={<Checkbox id={props.path} name={name} checked={value ?? false} disabled={props.disabled || props.readOnly} onChange={(event) => onChange(event.target.checked)} />}
      label={label}
    />
  );
};
```

## Accessibility Pattern

```typescript
import { useFieldErrors } from '@canard/schema-form';

const FieldInputString = ({
  node,
  path,
  name,
  required,
  defaultValue,
  onChange,
  ...props
}: FieldInputStringProps) => {
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
        defaultValue={defaultValue ?? ''}
        onChange={(event) => onChange(event.target.value === '' ? undefined : event.target.value)}
        disabled={props.disabled || props.readOnly}
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
5. Do not pass value or defaultValue to ChildFields
6. Make value conversion explicit
7. Accessibility attributes are required
