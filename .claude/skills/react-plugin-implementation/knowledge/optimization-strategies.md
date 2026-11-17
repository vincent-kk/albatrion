# Performance Optimization Strategies

Strategies for performance optimization when developing an @canard/schema-form plugin.

## Using the useHandle Hook

**Source**: `@winglet/react-utils`

**Purpose**: memoize event handlers so unnecessary re-renders are avoided

### Basic Usage

```typescript
import { useHandle } from '@winglet/react-utils';
const FieldInputString = ({ onChange, ...props }: Props) => {
  // ✅ useHandle - the same reference is kept even when the component re-renders
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value === '' ? undefined : event.target.value);
  });
  return <TextField onChange={handleChange} id={props.path} name={props.name} disabled={props.disabled || props.readOnly} />;
};
```

### Difference from useCallback

```typescript
// ❌ useCallback - the dependency array must be managed, and it gets complicated
const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
  onChange(event.target.value === '' ? undefined : event.target.value);
}, [onChange]);  // when onChange changes, handleChange is recreated too
// ✅ useHandle - no dependency array, and it always reads the latest value
const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
  onChange(event.target.value === '' ? undefined : event.target.value);
});
```

### Use It in Complex Logic Too

```typescript
const FieldInputNumber = ({
  onChange,
  jsonSchema,
  context,
}: Props) => {
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    if (event.target.validity.badInput) return;
    if (rawValue === '') {
      onChange(undefined);
      return;
    }
    let numValue = Number(rawValue);
    if (!Number.isFinite(numValue)) return;
    if (jsonSchema.minimum !== undefined) {
      numValue = Math.max(numValue, jsonSchema.minimum);
    }
    if (jsonSchema.maximum !== undefined) {
      numValue = Math.min(numValue, jsonSchema.maximum);
    }

    onChange(numValue);
  });

  return <TextField type="number" onChange={handleChange} />;
};
```

## Optimize Prop Computation with useMemo

**Purpose**: cache complex prop computation so it is not recalculated on every render

### Basic Pattern

```typescript
const FieldInputString = ({
  jsonSchema,
  context,
  name,
  size: sizeProp,
  variant: variantProp,
  label: labelProp,
}: Props) => {
  // ✅ Compute several props at once
  const [size, variant, label] = useMemo(() => {
    return [
      sizeProp || context.size || 'medium',
      variantProp || context.variant || 'outlined',
      labelProp || jsonSchema.title || name,
    ];
  }, [sizeProp, context, jsonSchema, variantProp, labelProp, name]);

  return <TextField size={size} variant={variant} label={label} />;
};
```

### When useMemo Is Unnecessary

```typescript
// ✅ Simple computation does not need useMemo
const FieldInputString = ({
  disabled,
  readOnly,
}: Props) => {
  // A simple logical operation - just use it
  const isDisabled = disabled || readOnly;

  return <TextField disabled={isDisabled} />;
};

// ✅ Primitive values do not need useMemo
const FieldInputString = ({
  jsonSchema,
}: Props) => {
  const placeholder = jsonSchema.presentation?.FieldInputProps?.placeholder || '';  // useMemo is unnecessary

  return <TextField placeholder={placeholder} />;
};
```

### When Creating a Complex Object

```typescript
const FieldInputDate = ({
  jsonSchema,
  path,
  name,
  required,
  disabled,
  size,
}: Props) => {
  // ✅ Memoize nested objects with useMemo
  const slotProps = useMemo(() => ({
    textField: {
      id: path,
      name,
      required,
      disabled,
      size,
    },
    day: {
      sx: {
        '&.Mui-selected': {
          backgroundColor: jsonSchema.highlightColor || 'primary.main',
        },
      },
    },
  }), [path, name, required, disabled, size, jsonSchema.highlightColor]);

  return <DatePicker slotProps={slotProps} />;
};
```

## Prefer Uncontrolled Components

**Default pattern**: use defaultValue for a component that owns its draft; controlled: true is for definitions that draw from value alone

### Uncontrolled vs Controlled Performance

```typescript
// Controlled component - the DOM value follows the value prop
const ControlledInput = ({ value, onChange }: Props) => {
  console.log('Render');  // Prints on every keystroke

  return (
    <TextField
      value={value ?? ''}  // Controlled
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

// ✅ Uncontrolled component - the DOM owns the draft
const UncontrolledInput = ({ defaultValue, onChange }: Props) => {
  console.log('Render');  // Also prints on every value change: the binding passes the new value

  return (
    <TextField
      defaultValue={defaultValue}  // Uncontrolled
      onChange={(e) => onChange(e.target.value)}
    />
  );
};
```

### When a Controlled Component Is Needed

This value-driven email input declares controlled: true on its definition.

```typescript
// ✅ Use a controlled component only when real-time validation is required
const FieldInputEmail = ({ value, onChange }: Props) => {
  const isValid = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value ?? '');
  }, [value]);

  return (
    <TextField
      value={value ?? ''}  // Controlled component (because of real-time validation)
      onChange={(e) => onChange(e.target.value)}
      error={!isValid && (value?.length ?? 0) > 0}
      helperText={!isValid ? 'Invalid email format' : ''}
    />
  );
};
```

## Minimize Context Subscriptions

**Problem**: a changed context prop can re-render the input; useMemo only avoids recomputing derived props

### Depend Only on the Values You Read

```typescript
// ❌ Subscribe to the whole context
const FieldInputString = ({ context, ...props }: Props) => {
  // Re-renders when any context value changes
  return <TextField size={context.size} />;
};

// ✅ Extract and use only the values you need
const FieldInputString = ({
  context,
  size: sizeProp,
  ...props
}: Props) => {
  const size = useMemo(() => {
    return sizeProp || context.size || 'medium';
  }, [sizeProp, context.size]);  // Recompute only when these values change

  return <TextField size={size} />;
};
```

## Optimize Conditional Rendering

### Early Return Pattern

```typescript
const FieldInputArray = ({
  ChildFields,
  jsonSchema,
}: Props) => {
  // ✅ Check the condition first so unnecessary work is skipped
  if (!ChildFields || ChildFields.length === 0) {
    return <EmptyState />;
  }

  // Complex rendering logic follows
  return (
    <Box>
      {ChildFields.map((Child, index) => (
        <Child key={Child.key} />
      ))}
    </Box>
  );
};
```

### Split Conditional Components

```typescript
// ❌ Handle the condition in one component - it gets complicated
const FieldInputString = ({ isPassword, ...props }: Props) => {
  if (isPassword) {
    return <PasswordField id={props.path} name={props.name} disabled={props.disabled || props.readOnly} />;
  }
  return <TextField id={props.path} name={props.name} disabled={props.disabled || props.readOnly} />;
};

// ✅ Split into separate components - it stays clear
const FieldInputString = (props: Props) => {
  return <TextField id={props.path} name={props.name} disabled={props.disabled || props.readOnly} />;
};

const FieldInputPassword = (props: Props) => {
  return <PasswordField id={props.path} name={props.name} disabled={props.disabled || props.readOnly} />;
};

// Split at the definition stage
export const FieldInputStringDefinition = {
  Component: FieldInputString,
  test: { type: 'string' },
};

export const FieldInputPasswordDefinition = {
  Component: FieldInputPassword,
  test: { type: 'string', format: 'password' },
};
```

## ChildFields Optimization

**Important**: ChildFields are already memoized components

### Correct Usage

```typescript
const FieldInputArray = ({ ChildFields }: Props) => {
  // ✅ Render them as they are - do not pass props
  return (
    <Box>
      {ChildFields.map((Child, index) => (
        <Box key={Child.key}>
          <Child />  {/* ✅ No props */}
        </Box>
      ))}
    </Box>
  );
};
```

### Incorrect Usage

```typescript
const FieldInputArray = ({ ChildFields, context }: Props) => {
  // ❌ Passing props invalidates memoization
  return (
    <Box>
      {ChildFields.map((Child, index) => (
        <Box key={Child.key}>
          <Child context={context} />  {/* ❌ Do not pass props */}
        </Box>
      ))}
    </Box>
  );
};
```

## Optimize Value Conversion

### Convert Values with useMemo

```typescript
const FieldInputDate = ({ defaultValue, onChange }: Props) => {
  // ✅ Memoize the defaultValue conversion
  const dateValue = useMemo(() => {
    if (!defaultValue) return null;
    try {
      return dayjs(defaultValue);
    } catch {
      return null;
    }
  }, [defaultValue]);

  // ✅ The onChange callback uses useHandle
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
    <DatePicker
      defaultValue={dateValue}
      onChange={handleChange}
    />
  );
};
```

## Measuring Performance

### Using the React DevTools Profiler

```typescript
// Enable in development only
if (process.env.NODE_ENV === 'development') {
  const FieldInputString = ({ ...props }: Props) => {
    const renderCount = useRef(0);
    renderCount.current += 1;

    console.log(`FieldInputString rendered ${renderCount.current} times`);

    return <TextField id={props.path} name={props.name} disabled={props.disabled || props.readOnly} />;
  };
}
```

## Optimization Checklist

Confirm the following before release:

- [ ] **Use uncontrolled components**: prefer `defaultValue`
- [ ] **Use useHandle**: apply it to every event handler
- [ ] **Use useMemo**: complex prop computation and object creation
- [ ] **Minimize context subscriptions**: extract only the values you need
- [ ] **Split conditional rendering**: split a component when the condition is complex
- [ ] **ChildFields**: do not pass props
- [ ] **Memoize value conversion**: use useMemo
- [ ] **Early return**: check conditions first
- [ ] **React DevTools Profiler**: measure performance

## Anti-Patterns

### Patterns to Avoid

```typescript
// ❌ Recreate the function on every render
const handleChange = (event) => {
  onChange(event.target.value === '' ? undefined : event.target.value);
};

// ❌ Recreate the object on every render
const slotProps = {
  textField: { id: path, name },
};

// ❌ Inline function
<TextField onChange={(e) => onChange(e.target.value)} />

// ❌ Subscribe to the whole context
const { size, variant, color, theme } = context;  // Destructuring does not create selective subscriptions

// ❌ Pass props to ChildFields
<Child context={context} />
```

---

**Core principles**:
1. Prefer uncontrolled components (defaultValue)
2. Memoize every handler with useHandle
3. Cache complex computation with useMemo
4. Keep memo dependencies limited to the values the computation reads
5. Render ChildFields as they are
6. Measure performance with React DevTools
