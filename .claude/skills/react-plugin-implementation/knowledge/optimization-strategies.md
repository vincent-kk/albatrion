# Performance Optimization Strategies

Strategies for performance optimization when developing an @canard/schema-form plugin.

## Using the useHandle Hook

**Source**: `@winglet/react-utils`

**Purpose**: memoize event handlers so unnecessary re-renders are avoided

### Basic Usage

```typescript
import { useHandle } from '@winglet/react-utils';

const FormTypeInputString = ({ onChange, ...props }: Props) => {
  // ✅ useHandle - the same reference is kept even when the component re-renders
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  });
  
  return <TextField onChange={handleChange} {...props} />;
};
```

### Difference from useCallback

```typescript
// ❌ useCallback - the dependency array must be managed, and it gets complicated
const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
  onChange(event.target.value);
}, [onChange]);  // when onChange changes, handleChange is recreated too

// ✅ useHandle - no dependency array, and it always reads the latest value
const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
  onChange(event.target.value);
});
```

### Use It in Complex Logic Too

```typescript
const FormTypeInputNumber = ({
  onChange,
  jsonSchema,
  context,
}: Props) => {
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    let numValue = parseFloat(rawValue);
    
    // Complex validation logic
    if (isNaN(numValue)) numValue = 0;
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
const FormTypeInputString = ({
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
      labelProp || jsonSchema.label || jsonSchema.title || name,
    ];
  }, [sizeProp, context, jsonSchema, variantProp, labelProp, name]);
  
  return <TextField size={size} variant={variant} label={label} />;
};
```

### When useMemo Is Unnecessary

```typescript
// ✅ Simple computation does not need useMemo
const FormTypeInputString = ({
  disabled,
  readOnly,
}: Props) => {
  // A simple logical operation - just use it
  const isDisabled = disabled || readOnly;
  
  return <TextField disabled={isDisabled} />;
};

// ✅ Primitive values do not need useMemo
const FormTypeInputString = ({
  jsonSchema,
}: Props) => {
  const placeholder = jsonSchema.placeholder || '';  // useMemo is unnecessary
  
  return <TextField placeholder={placeholder} />;
};
```

### When Creating a Complex Object

```typescript
const FormTypeInputDate = ({
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

## Prevent Re-renders with Uncontrolled Components

**The most important optimization**: use `defaultValue`

### Uncontrolled vs Controlled Performance

```typescript
// ❌ Controlled component - re-renders on every keystroke
const ControlledInput = ({ value, onChange }: Props) => {
  console.log('Render');  // Prints on every keystroke
  
  return (
    <TextField
      value={value}  // Controlled
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

// ✅ Uncontrolled component - no re-render after the initial render
const UncontrolledInput = ({ defaultValue, onChange }: Props) => {
  console.log('Render');  // Prints only once, on the initial render
  
  return (
    <TextField
      defaultValue={defaultValue}  // Uncontrolled
      onChange={(e) => onChange(e.target.value)}
    />
  );
};
```

### When a Controlled Component Is Needed

```typescript
// ✅ Use a controlled component only when real-time validation is required
const FormTypeInputEmail = ({ value, onChange }: Props) => {
  const isValid = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }, [value]);
  
  return (
    <TextField
      value={value}  // Controlled component (because of real-time validation)
      onChange={(e) => onChange(e.target.value)}
      error={!isValid && value.length > 0}
      helperText={!isValid ? 'Invalid email format' : ''}
    />
  );
};
```

## Minimize Context Subscriptions

**Problem**: when context changes, every subscribed component re-renders

### Subscribe Only to the Values You Need

```typescript
// ❌ Subscribe to the whole context
const FormTypeInputString = ({ context, ...props }: Props) => {
  // Re-renders when any context value changes
  return <TextField size={context.size} />;
};

// ✅ Extract and use only the values you need
const FormTypeInputString = ({
  context,
  size: sizeProp,
  ...props
}: Props) => {
  const size = useMemo(() => {
    return sizeProp || context.size || 'medium';
  }, [sizeProp, context.size]);  // Subscribe to context.size only
  
  return <TextField size={size} />;
};
```

## Optimize Conditional Rendering

### Early Return Pattern

```typescript
const FormTypeInputArray = ({
  ChildNodeComponents,
  jsonSchema,
}: Props) => {
  // ✅ Check the condition first so unnecessary work is skipped
  if (!ChildNodeComponents || ChildNodeComponents.length === 0) {
    return <EmptyState />;
  }
  
  // Complex rendering logic follows
  return (
    <Box>
      {ChildNodeComponents.map((Child, index) => (
        <Child key={index} />
      ))}
    </Box>
  );
};
```

### Split Conditional Components

```typescript
// ❌ Handle the condition in one component - it gets complicated
const FormTypeInputString = ({ isPassword, ...props }: Props) => {
  if (isPassword) {
    return <PasswordField {...props} />;
  }
  return <TextField {...props} />;
};

// ✅ Split into separate components - it stays clear
const FormTypeInputString = (props: Props) => {
  return <TextField {...props} />;
};

const FormTypeInputPassword = (props: Props) => {
  return <PasswordField {...props} />;
};

// Split at the definition stage
export const FormTypeInputStringDefinition = {
  Component: FormTypeInputString,
  test: { type: 'string' },
};

export const FormTypeInputPasswordDefinition = {
  Component: FormTypeInputPassword,
  test: { type: 'string', format: 'password' },
};
```

## ChildNodeComponents Optimization

**Important**: ChildNodeComponents are already memoized components

### Correct Usage

```typescript
const FormTypeInputArray = ({ ChildNodeComponents }: Props) => {
  // ✅ Render them as they are - do not pass props
  return (
    <Box>
      {ChildNodeComponents.map((Child, index) => (
        <Box key={index}>
          <Child />  {/* ✅ No props */}
        </Box>
      ))}
    </Box>
  );
};
```

### Incorrect Usage

```typescript
const FormTypeInputArray = ({ ChildNodeComponents, context }: Props) => {
  // ❌ Passing props invalidates memoization
  return (
    <Box>
      {ChildNodeComponents.map((Child, index) => (
        <Box key={index}>
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
const FormTypeInputDate = ({ defaultValue, onChange }: Props) => {
  // ✅ Memoize the defaultValue conversion
  const dateValue = useMemo(() => {
    if (!defaultValue) return null;
    try {
      return parseISO(defaultValue);
    } catch {
      return null;
    }
  }, [defaultValue]);
  
  // ✅ The onChange callback uses useHandle
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
    <DatePicker
      value={dateValue}
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
  const FormTypeInputString = ({ ...props }: Props) => {
    const renderCount = useRef(0);
    renderCount.current += 1;
    
    console.log(`FormTypeInputString rendered ${renderCount.current} times`);
    
    return <TextField {...props} />;
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
- [ ] **ChildNodeComponents**: do not pass props
- [ ] **Memoize value conversion**: use useMemo
- [ ] **Early return**: check conditions first
- [ ] **React DevTools Profiler**: measure performance

## Anti-Patterns

### Patterns to Avoid

```typescript
// ❌ Recreate the function on every render
const handleChange = (event) => {
  onChange(event.target.value);
};

// ❌ Recreate the object on every render
const slotProps = {
  textField: { id: path, name },
};

// ❌ Inline function
<TextField onChange={(e) => onChange(e.target.value)} />

// ❌ Subscribe to the whole context
const { size, variant, color, theme } = context;  // Subscribes to all of it

// ❌ Pass props to ChildNodeComponents
<Child context={context} />
```

---

**Core principles**:
1. Prefer uncontrolled components (defaultValue)
2. Memoize every handler with useHandle
3. Cache complex computation with useMemo
4. Subscribe only to the context values you need
5. Render ChildNodeComponents as they are
6. Measure performance with React DevTools
