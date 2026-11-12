---
name: react-plugin-implementation
description: "Expert on React-based @canard/schema-form plugin implementation patterns. Guides uncontrolled component patterns, writing test conditions, performance optimization (useMemo, useHandle), and plugin structure design."
---

# React Plugin Implementation Skill

## Role

You are an expert on React-based @canard/schema-form plugin implementation patterns.

## Core Responsibilities

1. **Component implementation patterns**: uncontrolled-component-first patterns, and how to use optimization hooks
2. **Writing test conditions**: a guide to writing FieldInputTestObject and FieldInputTestFn
3. **Performance optimization**: strategies for using useMemo, useHandle, and useCallback
4. **Plugin structure**: design a structure that satisfies the SchemaFormPlugin type
5. **fieldInputDefinitions priority**: optimize the order of the component array

## How It Works

### 1. Implementation Pattern Reference

**knowledge/component-patterns.md** provides these patterns:

- Uncontrolled component pattern (`defaultValue` + `onChange`)
- Controlled component pattern (when real-time validation is required)
- Special handling for Array/Object structure components
- Value-passing priority (direct props > context > jsonSchema)

### 2. Optimization Strategy

Using **knowledge/optimization-strategies.md**:

- Optimize event handlers with the `useHandle` hook
- Cache prop computation with `useMemo`
- Strategies for preventing unnecessary re-renders
- Optimize Context subscriptions

### 3. How to Write Test Conditions

With **knowledge/test-mapping-conditions.md**:

- Simple conditions: use the object form
- Compound conditions: use the function form
- Decide the priority order (specific conditions → general conditions)

## Patterns Provided

### Basic Component Structure

```typescript
import { useMemo, type ChangeEvent } from 'react';
import { TextField } from '@mui/material';
import { useHandle } from '@winglet/react-utils';
import { useFieldErrors } from '@canard/schema-form';
import type { FieldInputDefinition, FieldInputPropsWithSchema, StringSchema } from '@canard/schema-form';

interface InputContext { size?: 'small' | 'medium' }
interface FieldInputTextProps
  extends FieldInputPropsWithSchema<string, StringSchema, InputContext> {
  size?: InputContext['size'];
}

const FieldInputText = ({
  node, path, name, required, disabled, readOnly, defaultValue, onChange,
  context, size: sizeProp, placeholder,
}: FieldInputTextProps) => {
  const { errorMessage } = useFieldErrors(node);
  const size = useMemo(() => sizeProp ?? context.size ?? 'medium', [sizeProp, context.size]);
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value === '' ? undefined : event.target.value);
  });

  return (
    <TextField
      id={path}
      name={name}
      required={required}
      disabled={disabled || readOnly}
      defaultValue={defaultValue ?? ''}
      onChange={handleChange}
      size={size}
      placeholder={placeholder}
      error={errorMessage != null}
      helperText={errorMessage}
    />
  );
};

export const FieldInputTextDefinition = {
  Component: FieldInputText,
  test: { type: 'string' },
} satisfies FieldInputDefinition;
```

### Plugin Structure

Paths in scaffolds are new-plugin destinations. Example-only input names follow the FieldInput pattern; inspect an existing plugin before reusing a concrete module.

```typescript
// src/index.ts
import type { SchemaFormPlugin } from "@canard/schema-form";

import { ErrorMessageRenderer } from "./components/ErrorMessageRenderer";
import { FieldRenderer } from "./components/FieldRenderer";
import { LabelRenderer } from "./components/LabelRenderer";
import { fieldInputDefinitions } from "./fieldInputs";

export const plugin = {
  FieldRenderer,
  LabelRenderer,
  ErrorMessageRenderer,
  fieldInputDefinitions,
} satisfies SchemaFormPlugin;
```

### Optional input frame (`InputRenderer`)

`InputRenderer` is an optional frame registered under the `InputRenderer` key. It must render `children` exactly once, unconditionally, at an unchanging position. The plugin has no pass-through input renderer file.

```tsx
const FormInputFrame = ({ children, node, required, readOnly, disabled, context }: InputRendererProps) => <Wrapper>{children}</Wrapper>;
```

### Renderer Components

- `LabelRenderer` receives `LabelRendererProps` and owns its root `<label>`: it applies `htmlFor`, `id`, `style`, `className` to the root, renders `children`, and marks the required sign `aria-hidden`.
- `ErrorMessageRenderer` receives `ErrorMessageRendererProps` and renders `children` in its root.
- `FieldRenderer` receives `FieldRendererProps` with the bound parts `Label`, `Input`, `ErrorMessage` and `errorMessage`. It titles a terminal with `<Label />` and draws a branch title directly in `<legend>{name}</legend>`; the registered LabelRenderer does not apply to branch titles. It composes `<Input />` and `<ErrorMessage>{errorMessage}</ErrorMessage>`. `<Input unwrapped />` skips a registered frame. Pass only reference-stable props (module-level constants) to the parts.

### fieldInputDefinitions Priority

```typescript
// src/fieldInputs/index.ts
import type { FieldInputDefinition } from "@canard/schema-form";

// ⚠️ Order is critical! More specific conditions must come first

export const fieldInputDefinitions: FieldInputDefinition[] = [
  // === Phase 1: Most specific (format + inputType, etc.) ===
  FieldInputPasswordDefinition, // type: string, format: password
  FieldInputTextareaDefinition, // type: string, format: textarea
  FieldInputSliderDefinition, // type: number, inputType: slider
  FieldInputRadioGroupDefinition, // type: string, inputType: radio

  // === Phase 2: Intermediate (format or inputType) ===
  FieldInputDateDefinition, // type: string, format: date
  FieldInputTimeDefinition, // type: string, format: time

  // === Phase 3: Enum conditions (function form) ===
  FieldInputStringEnumDefinition, // type: string, enum exists
  FieldInputNumberEnumDefinition, // type: number, enum exists

  // === Phase 4: Structural types ===
  FieldInputArrayDefinition, // type: array
  // Object branches can use the core fallback, which renders ChildFields.

  // === Phase 5: General types (last) ===
  FieldInputNumberDefinition, // type: number | integer
  FieldInputBooleanDefinition, // type: boolean
  FieldInputStringDefinition, // type: string (most general - last!)
];
```

**Priority principles**:

1. Specific conditions (format + inputType) first
2. Intermediate conditions (format or inputType)
3. Enum conditions (compound function)
4. Structural types (array, object)
5. General types (type only) last

## Special Patterns

### Array Component (Using ChildFields)

```typescript
const FieldInputArray = ({
  jsonSchema,
  node,
  readOnly,
  disabled,
  ChildFields,  // ✅ provided by canard-form
  context,
}: FieldInputArrayProps) => {
  return (
    <Box>
      {ChildFields.map((ChildComponent, index) => (
        <Box key={ChildComponent.key} sx={{ mb: 2 }}>
          <ChildComponent />  {/* ✅ props are passed automatically */}
        </Box>
      ))}
      {/* Style only the add/remove buttons */}
      <Button onClick={() => node.push()} disabled={readOnly || disabled}>Add</Button>
    </Box>
  );
};
```

### Wrapper Component Pattern (DatePicker, etc.)

```typescript
const FieldInputDate = ({
  defaultValue,
  onChange,
  ...props
}: FieldInputDateProps) => {
  // Value conversion logic
  const dateValue = useMemo(() => {
    return defaultValue ? dayjs(defaultValue) : null;
  }, [defaultValue]);

  const handleChange = useHandle((newDate: Dayjs | null) => {
    onChange(newDate?.isValid() ? newDate.format('YYYY-MM-DD') : undefined);
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        defaultValue={dateValue}
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

## Performance Optimization Checklist

- [ ] Apply the uncontrolled component pattern (use `defaultValue`)
- [ ] An input that draws from `value` alone and keeps no copy of it (checkbox, switch, stepper) declares `controlled: true` on its definition, so outside writes (`setValue`, reset, `derived`, `injectTo`) stop remounting it. Never declare it on a `defaultValue` input or one with a draft in state
- [ ] Optimize prop computation with `useMemo`
- [ ] Memoize event handlers with `useHandle`
- [ ] Minimize Context subscriptions
- [ ] Optimize conditional rendering
- [ ] Render ChildFields directly; pass a Child onChange only for the hybrid-parent pattern

## Constraints

- Use controlled components **only when strictly necessary** (real-time validation, conditional rendering, etc.)
- Import the `useHandle` hook from `@winglet/react-utils`
- Type-check with `satisfies FieldInputDefinition`
- Whenever the fieldInputDefinitions array order changes, review the priority

## Output Format

### When Providing Implementation Code

```markdown
## FieldInput[Name] Implementation

**Mapping condition**: [condition description]

**Implementation code**:
[TypeScript code]

**Optimization points**:

- [optimization 1]
- [optimization 2]

**Caveats**:

- [caveat 1]
```

## Usage Scenarios

### Scenario 1: Basic FieldInputString Implementation

**Situation**: Implement the most basic string input component, using MUI TextField

**Steps**:

#### Step 1: Type Definition and Basic Structure

```typescript
// src/fieldInputs/FieldInputString.tsx
import { useMemo } from 'react';
import { useHandle } from '@winglet/react-utils';
import { useFieldErrors } from '@canard/schema-form';
import type { FieldInputDefinition, FieldInputPropsWithSchema, StringSchema } from '@canard/schema-form';
import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';

// 1️⃣ Define the Context type (the plugin's shared context)
interface MuiContext {
  size?: 'small' | 'medium';
  variant?: 'standard' | 'outlined' | 'filled';
}

// 2️⃣ Component Props = FieldInputPropsWithSchema + Context + additional props
interface FieldInputStringProps
  extends FieldInputPropsWithSchema<string, StringSchema, MuiContext>,
          MuiContext {
  multiline?: boolean;
  rows?: number;
}

// 3️⃣ Implement the component
const FieldInputString = ({
  // Schema/Node info
  jsonSchema,
  node,
  path,
  name,

  // State
  required,
  disabled,
  readOnly,

  // Value (uncontrolled component)
  defaultValue,
  onChange,

  // Context
  context,

  // Direct props (higher priority)
  size: sizeProp,
  variant: variantProp,

  // Additional props
  placeholder,
  multiline,
  rows,
}: FieldInputStringProps) => {
  // 4️⃣ Apply prop priority with useMemo (direct props > context > default)
  const [size, variant, label] = useMemo(() => {
    return [
      sizeProp ?? context.size ?? 'medium',
      variantProp ?? context.variant ?? 'outlined',
      jsonSchema.title ?? name,
    ];
  }, [sizeProp, context.size, variantProp, context.variant, jsonSchema.title, name]);

  // 5️⃣ Error handling (the hook re-renders this input on its field's error changes)
  const { errorMessage } = useFieldErrors(node);
  const hasError = errorMessage != null;

  // 6️⃣ Optimize the event handler with useHandle
  const handleChange = useHandle((event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value === '' ? undefined : event.target.value);
  });

  // 7️⃣ Render the uncontrolled component
  return (
    <TextField
      id={path}
      name={name}
      label={label}
      required={required}
      disabled={disabled || readOnly}
      defaultValue={defaultValue ?? ''}  // ✅ uncontrolled component
      onChange={handleChange}
      size={size}
      variant={variant}
      placeholder={placeholder ?? jsonSchema.presentation?.FieldInputProps?.placeholder}
      error={hasError}
      helperText={errorMessage ?? jsonSchema.description}
      multiline={multiline}
      rows={rows}
      fullWidth
    />
  );
};

// 8️⃣ Definition object (includes the test condition)
export const FieldInputStringDefinition = {
  Component: FieldInputString,
  test: { type: 'string' },  // matches when type is 'string'
} satisfies FieldInputDefinition;
```

#### Step 2: Optimization Points

```typescript
// ✅ GOOD: Cache prop computation with useMemo
const [size, variant, label] = useMemo(() => {
  return [
    sizeProp ?? context.size ?? "medium",
    variantProp ?? context.variant ?? "outlined",
    jsonSchema.title ?? name,
  ];
}, [
  sizeProp,
  context.size,
  variantProp,
  context.variant,
  jsonSchema.title,
  name,
]);

// ❌ BAD: Recompute on every render
const size = sizeProp ?? context.size ?? "medium";
const variant = variantProp ?? context.variant ?? "outlined";

// ✅ GOOD: Memoize the event handler with useHandle
const handleChange = useHandle((event: React.ChangeEvent<HTMLInputElement>) => {
  onChange(event.target.value === '' ? undefined : event.target.value);
});

// ❌ BAD: Create a new function on every render
const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  onChange(event.target.value === '' ? undefined : event.target.value);
};
```

#### Step 3: Writing the Test

```typescript
// src/fieldInputs/__tests__/FieldInputString.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { Form } from '@canard/schema-form';
import { FieldInputStringDefinition } from '../FieldInputString';

const definitions = [FieldInputStringDefinition];
const schema = { type: 'string' } as const;

describe('FieldInputString', () => {
  it('renders with defaultValue', () => {
    render(<Form jsonSchema={schema} defaultValue="initial value" fieldInputDefinitions={definitions} />);
    expect(screen.getByDisplayValue('initial value')).toBeInTheDocument();
  });

  it('calls onChange when user types', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Form jsonSchema={schema} fieldInputDefinitions={definitions} onChange={onChange} />);
    await user.type(screen.getByRole('textbox'), 'hello');
    expect(onChange).toHaveBeenCalled();
  });
});
```

**Result**: A complete basic string input component, with performance optimized through the uncontrolled pattern

---

### Scenario 2: FieldInputDate (Value Conversion Pattern)

**Situation**: A date input component using MUI DatePicker that needs ISO date string ↔ Dayjs value conversion

**Steps**:

#### Step 1: Implement the Date Conversion Logic

```typescript
// src/fieldInputs/FieldInputDate.tsx
import { useMemo } from 'react';
import { useHandle } from '@winglet/react-utils';
import { useFieldErrors } from '@canard/schema-form';
import type { FieldInputDefinition, FieldInputPropsWithSchema, StringSchema } from '@canard/schema-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { type Dayjs } from 'dayjs';
import type { MuiContext } from '../type';

interface FieldInputDateProps
  extends FieldInputPropsWithSchema<string, StringSchema, MuiContext>,
          MuiContext {
  minDate?: string;
  maxDate?: string;
}

const FieldInputDate = ({
  jsonSchema,
  node,
  path,
  name,
  required,
  disabled,
  readOnly,
  defaultValue,  // ⚠️ ISO 8601 date string (e.g. "2024-01-15")
  onChange,      // ⚠️ must be passed as an ISO 8601 string
  context,
  size: sizeProp,
  variant: variantProp,
  minDate,
  maxDate,
}: FieldInputDateProps) => {
  // 1️⃣ Convert an ISO string → a Dayjs value
  const dateValue = useMemo(() => {
    if (!defaultValue) return null;
    try {
      return dayjs(defaultValue);
    } catch {
      return null;
    }
  }, [defaultValue]);

  // 2️⃣ Convert minDate and maxDate as well
  const [minDateObj, maxDateObj] = useMemo(() => {
    return [
      minDate ? dayjs(minDate) : undefined,
      maxDate ? dayjs(maxDate) : undefined,
    ];
  }, [minDate, maxDate]);

  // 3️⃣ Handler that converts a Dayjs value → an ISO string
  const handleChange = useHandle((newDate: Dayjs | null) => {
    if (newDate === null) {
      onChange(undefined);
      return;
    }

    try {
      if (!newDate.isValid()) return;
      const isoString = newDate.format('YYYY-MM-DD');
      onChange(isoString);
    } catch {
      onChange(undefined);
    }
  });

  const [size, variant, label] = useMemo(() => {
    return [
      sizeProp ?? context.size ?? 'medium',
      variantProp ?? context.variant ?? 'outlined',
      jsonSchema.title ?? name,
    ];
  }, [sizeProp, context.size, variantProp, context.variant, jsonSchema.title, name]);

  const { errorMessage } = useFieldErrors(node);
  const hasError = errorMessage != null;

  // 4️⃣ Render the DatePicker
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        defaultValue={dateValue}  // ✅ Dayjs value
        onChange={handleChange}  // ✅ takes a Dayjs value and converts it to an ISO string
        minDate={minDateObj}
        maxDate={maxDateObj}
        disabled={disabled || readOnly}
        slotProps={{
          textField: {
            id: path,
            name: name,
            required: required,
            size: size,
            variant: variant,
            error: hasError,
            helperText: errorMessage ?? jsonSchema.description,
            fullWidth: true,
          },
        }}
      />
    </LocalizationProvider>
  );
};

// 5️⃣ Definition object (format: 'date' condition)
export const FieldInputDateDefinition = {
  Component: FieldInputDate,
  test: { type: 'string', format: 'date' },  // type: string + format: date
} satisfies FieldInputDefinition;
```

#### Step 2: Error Handling and Validation

```typescript
const handleChange = useHandle((newDate: Dayjs | null) => {
  if (newDate === null) {
    onChange(undefined);
    return;
  }
  if (!newDate.isValid()) return;
  onChange(newDate.format('YYYY-MM-DD'));
});
```

#### Step 3: Timezone Handling (Optional)

```typescript
// A date-time input publishes an instant; a date-only input keeps YYYY-MM-DD.
const handleDateTimeChange = useHandle((newDate: Dayjs | null) => {
  if (newDate === null) {
    onChange(undefined);
    return;
  }
  if (!newDate.isValid()) return;
  onChange(newDate.toISOString());
});
```

**Result**: A DatePicker component that fully handles ISO date string ↔ Dayjs value conversion

**Caveats**:

- These date inputs exchange ISO 8601 strings; other inputs use their schema value types
- Use the Dayjs value only inside the component, and always pass a string to onChange
- Use AdapterDayjs with Dayjs values; calendar dates keep YYYY-MM-DD, while date-time inputs publish ISO instants

---

### Scenario 3: FieldInputStringEnum (test Condition in Function Form)

**Situation**: Display a string that has enum values as a Select or a RadioGroup

An input draws its own title only when the plugin's FieldRenderer does not draw Label for that field.

**Steps**:

#### Step 1: Write a test Function for a Compound Condition

```typescript
// src/fieldInputs/FieldInputStringEnum.tsx
import { useMemo } from 'react';
import { useHandle } from '@winglet/react-utils';
import { useFieldErrors } from '@canard/schema-form';
import type { FieldInputDefinition, FieldInputPropsWithSchema, FieldInputTestFn, StringSchema } from '@canard/schema-form';
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, FormHelperText } from '@mui/material';
import type { MuiContext } from '../type';

interface FieldInputStringEnumProps
  extends FieldInputPropsWithSchema<string, StringSchema, MuiContext>,
          MuiContext {
  alias?: Record<string, string>;
}

const FieldInputStringEnum = ({
  jsonSchema,
  alias,
  node,
  path,
  name,
  required,
  disabled,
  readOnly,
  defaultValue,
  onChange,
  context,
  size: sizeProp,
}: FieldInputStringEnumProps) => {
  // 1️⃣ Extract the enum values (jsonSchema.enum is an array)
  const enumValues = useMemo(() => {
    return (jsonSchema.enum ?? []).filter((value): value is string => typeof value === 'string');
  }, [jsonSchema.enum]);

  // 2️⃣ Map labels from the alias prop
  const enumLabels = useMemo(() => {
    if (alias) return alias;
    // Without aliases, use the enum values as labels
    return Object.fromEntries(enumValues.map(value => [value, value]));
  }, [alias, enumValues]);

  const handleChange = useHandle((event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value === '' ? undefined : event.target.value);
  });

  const [size, label] = useMemo(() => {
    return [
      sizeProp ?? context.size ?? 'medium',
      jsonSchema.title ?? name,
    ];
  }, [sizeProp, context.size, jsonSchema.title, name]);

  const { errorMessage } = useFieldErrors(node);
  const hasError = errorMessage != null;

  // 3️⃣ Render the RadioGroup
  return (
    <FormControl error={hasError} required={required} disabled={disabled || readOnly} size={size}>
      <FormLabel id={`label-${path}`}>{label}</FormLabel>
      <RadioGroup
        aria-labelledby={`label-${path}`}
        name={name}
        defaultValue={defaultValue ?? ''}
        onChange={handleChange}
      >
        {enumValues.map((value, index) => (
          <FormControlLabel
            key={value}
            value={value}
            control={<Radio />}
            label={enumLabels[value] ?? value}
          />
        ))}
      </RadioGroup>
      {(hasError || jsonSchema.description) && (
        <FormHelperText>{errorMessage ?? jsonSchema.description}</FormHelperText>
      )}
    </FormControl>
  );
};

// 4️⃣ test condition in function form (compound condition)
const testStringEnum: FieldInputTestFn = ({ type, jsonSchema }) => {
  // true only when type is 'string' and an enum is present
  return (
    type === 'string' &&
    Array.isArray(jsonSchema.enum) &&
    jsonSchema.enum.length > 0
  );
};

export const FieldInputStringEnumDefinition = {
  Component: FieldInputStringEnum,
  test: testStringEnum,  // ✅ function form
} satisfies FieldInputDefinition;
```

#### Step 2: Select Version (Alternative)

```typescript
// A version that uses Select (a better fit when there are many options)
import { FormControl, InputLabel, Select, MenuItem, FormHelperText, type SelectChangeEvent } from '@mui/material';

const FieldInputStringEnumSelect = ({
  jsonSchema,
  alias,
  node,
  path,
  name,
  required,
  disabled,
  readOnly,
  defaultValue,
  onChange,
  context,
  size: sizeProp,
  variant: variantProp,
}: FieldInputStringEnumProps) => {
  const enumValues = useMemo(() => {
    return (jsonSchema.enum ?? []).filter((value): value is string => typeof value === 'string');
  }, [jsonSchema.enum]);

  const enumLabels = useMemo(() => {
    if (alias) return alias;
    return Object.fromEntries(enumValues.map(value => [value, value]));
  }, [alias, enumValues]);

  const handleChange = useHandle((event: SelectChangeEvent<string>) => {
    onChange(event.target.value === '' ? undefined : event.target.value);
  });

  const [size, variant, label] = useMemo(() => {
    return [
      sizeProp ?? context.size ?? 'medium',
      variantProp ?? context.variant ?? 'outlined',
      jsonSchema.title ?? name,
    ];
  }, [sizeProp, context.size, variantProp, context.variant, jsonSchema.title, name]);

  const { errorMessage } = useFieldErrors(node);
  const hasError = errorMessage != null;

  return (
    <FormControl error={hasError} required={required} disabled={disabled || readOnly} size={size} fullWidth>
      <InputLabel id={`label-${path}`}>{label}</InputLabel>
      <Select
        labelId={`label-${path}`}
        id={path}
        name={name}
        label={label}
        defaultValue={defaultValue ?? ''}
        onChange={handleChange}
        variant={variant}
      >
        {enumValues.map((value, index) => (
          <MenuItem key={value} value={value}>
            {enumLabels[value] ?? value}
          </MenuItem>
        ))}
      </Select>
      {(hasError || jsonSchema.description) && (
        <FormHelperText>{errorMessage ?? jsonSchema.description}</FormHelperText>
      )}
    </FormControl>
  );
};
```

#### Step 3: Selection Criteria

```typescript
// Select by condition in the fieldInputDefinitions array
export const fieldInputDefinitions: FieldInputDefinition[] = [
  // === Phase 1: Most specific ===
  FieldInputPasswordDefinition, // type: string, format: password

  // === Phase 3: Enum conditions (function form) ===
  // ⚠️ Watch the order: more specific conditions must come first

  // 4 or fewer enum values → RadioGroup
  {
    Component: FieldInputStringEnum,
    test: ({ type, jsonSchema }) =>
      type === "string" &&
      Array.isArray(jsonSchema.enum) &&
      jsonSchema.enum.length > 0 &&
      jsonSchema.enum.length <= 4,
  },

  // 5 or more enum values → Select
  {
    Component: FieldInputStringEnumSelect,
    test: ({ type, jsonSchema }) =>
      type === "string" &&
      Array.isArray(jsonSchema.enum) &&
      jsonSchema.enum.length > 4,
  },

  // === Phase 5: General types (last) ===
  FieldInputStringDefinition, // type: string (most general - last!)
];
```

**Result**: A component that automatically chooses RadioGroup or Select from the number of enum values

**Caveats**:

- Use a test function when checking a compound condition
- More specific conditions must come first (RadioGroup → Select → String order)
- `presentation.FieldInputProps.alias` can provide user-friendly labels

---

### Scenario 4: FieldInputArray (ChildFields Pattern)

**Situation**: An array-type input, rendered dynamically with ChildFields

**Steps**:

#### Step 1: Pattern for Using ChildFields

```typescript
// src/fieldInputs/FieldInputArray.tsx
import { useMemo, useState } from 'react';
import { useHandle } from '@winglet/react-utils';
import { useFieldErrors } from '@canard/schema-form';
import type { FieldInputDefinition, FieldInputPropsWithSchema, ArraySchema } from '@canard/schema-form';
import { Box, Button, IconButton, Paper, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type { MuiContext } from '../type';

interface FieldInputArrayProps
  extends FieldInputPropsWithSchema<any[], ArraySchema, MuiContext>,
          MuiContext {
  // ⚠️ ChildFields is provided by FieldInputPropsWithSchema
}

const FieldInputArray = ({
  jsonSchema,
  node,
  path,
  name,
  required,
  disabled,
  readOnly,
  defaultValue,
  onChange,
  context,
  ChildFields,  // ✅ array of child components provided by @canard/schema-form
  size: sizeProp,
}: FieldInputArrayProps) => {
  // 1️⃣ ChildFields is created automatically from the current array value
  // Each ChildComponent already has every prop

  const [size, label] = useMemo(() => {
    return [
      sizeProp ?? context.size ?? 'medium',
      jsonSchema.title ?? name,
    ];
  }, [sizeProp, context.size, jsonSchema.title, name]);

  // 2️⃣ Handler that adds an item
  const handleAdd = useHandle(() => {
    node.push();
  });

  // 3️⃣ Handler that removes an item
  const handleRemove = useHandle((index: number) => {
    node.remove(index);
  });

  const { errorMessage } = useFieldErrors(node);
  const hasError = errorMessage != null;

  // 4️⃣ Rendering: render ChildFields directly
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {label}
        {required && <span style={{ color: 'red' }}> *</span>}
      </Typography>

      {jsonSchema.description && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {jsonSchema.description}
        </Typography>
      )}

      {/* ✅ Render ChildFields */}
      {ChildFields && ChildFields.length > 0 ? (
        ChildFields.map((ChildComponent, index) => (
          <Paper key={ChildComponent.key} sx={{ p: 2, mb: 2, position: 'relative' }}>
            <Box sx={{ pr: 6 }}>
              {/* ✅ ChildComponent already has every prop */}
              <ChildComponent />
            </Box>

            {/* Delete button */}
            {!disabled && !readOnly && (
              <IconButton
                aria-label="delete"
                onClick={() => handleRemove(index)}
                sx={{ position: 'absolute', top: 8, right: 8 }}
                size={size}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Paper>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary">
          No items. Press the "Add" button to add an item.
        </Typography>
      )}

      {/* Add button */}
      {!disabled && !readOnly && (
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          size={size}
        >
          Add
        </Button>
      )}

      {/* Error message */}
      {hasError && (
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
          {errorMessage}
        </Typography>
      )}
    </Box>
  );
};

// 5️⃣ Definition object
export const FieldInputArrayDefinition = {
  Component: FieldInputArray,
  test: { type: 'array' },
} satisfies FieldInputDefinition;
```

#### Step 2: ChildFields Caveats

```typescript
// ❌ WRONG: Trying to replace a Child value
{ChildFields.map((ChildComponent, index) => (
  <ChildComponent
    key={ChildComponent.key}
    // ❌ value is typed never on a Child; write values through onChange
    value={someValue}
  />
))}

// ✅ CORRECT: Render ChildComponent as it is
{ChildFields.map((ChildComponent, index) => (
  <Box key={ChildComponent.key}>
    {/* ✅ ChildComponent already has every prop */}
    <ChildComponent />
  </Box>
))}
```

**Key concepts**:

- `ChildFields` is the component array that `@canard/schema-form` creates automatically
- Each `ChildComponent` already has every prop, including `path`, `jsonSchema`, `value`, and `onChange`
- FieldInputArray **handles only the UI layout**, and canard-form manages the values

#### Step 3: Example of a Complex Array Item

```typescript
// JSON Schema example
const schema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      name: { type: "string", title: "Name" },
      age: { type: "number", title: "Age" },
      email: { type: "string", format: "email", title: "Email" },
    },
  },
};

// Each object child uses a branch input that renders its bound ChildFields
// The core fallback supports objects without a plugin-specific object input
// → fully automated nested rendering
```

**Result**: A simple Array component where you only implement the UI for adding and removing items

**Caveats**:

- Never pass value or defaultValue to a Child; override its onChange only for the hybrid-parent pattern (packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/field-input.md)
- Use node.push() and node.remove(index) for structural edits
- Keep each ChildComponent.key as its React key to preserve surviving inputs

---

### Scenario 5: FieldInputFileUpload (uploadFile Integration)

**Situation**: A custom context.uploadFile service stores URLs; the core onFileAttach prop only attaches File objects

**Steps**:

#### Step 1: Define the uploadFile Type

```typescript
// src/type.ts
export interface MuiContext {
  size?: "small" | "medium";
  variant?: "standard" | "outlined" | "filled";

  // ✅ Define the uploadFile callback
  uploadFile?: (file: File) => Promise<string>; // returns a URL after the file is uploaded
}
```

#### Step 2: Implement the FileUpload Component

```typescript
// src/fieldInputs/FieldInputFileUpload.tsx
import { useState, useRef } from 'react';
import { useHandle } from '@winglet/react-utils';
import { useFieldErrors } from '@canard/schema-form';
import type { FieldInputDefinition, FieldInputPropsWithSchema, StringSchema, ArraySchema } from '@canard/schema-form';
import { Box, Button, Typography, LinearProgress, IconButton, Chip } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import type { MuiContext } from '../type';

interface FieldInputFileUploadProps
  extends FieldInputPropsWithSchema<string, StringSchema, MuiContext>,
          MuiContext {
  accept?: string;  // e.g. "image/*", ".pdf,.doc"
  maxSize?: number;  // in bytes
}

const FieldInputFileUpload = ({
  jsonSchema,
  node,
  path,
  name,
  required,
  disabled,
  readOnly,
  value,  // ⚠️ file URL string
  onChange,      // ⚠️ pass a file URL string
  context,
  size: sizeProp,
  accept,
  maxSize = 10 * 1024 * 1024,  // default 10MB
}: FieldInputFileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const label = jsonSchema.title ?? name;
  const { errorMessage } = useFieldErrors(node);
  const hasError = errorMessage != null;

  // 1️⃣ File selection handler
  const handleFileSelect = useHandle(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 2️⃣ Check the file size
    if (file.size > maxSize) {
      alert(`File size cannot exceed ${maxSize / 1024 / 1024}MB.`);
      return;
    }

    // 3️⃣ Call the uploadFile callback (supplied by context)
    if (!context.uploadFile) {
      console.error('uploadFile callback is not provided in context');
      alert('File upload is not configured.');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Simulate upload progress (in practice this is handled inside uploadFile)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // 4️⃣ Upload the file (returns a URL)
      const fileUrl = await context.uploadFile(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // 5️⃣ Pass the URL through onChange
      onChange(fileUrl);

      // Reset
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (error) {
      console.error('File upload error:', error);
      alert('An error occurred while uploading the file.');
      setUploading(false);
      setUploadProgress(0);
    }

    // Reset the input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  });

  // 6️⃣ File deletion handler
  const handleDelete = useHandle(() => {
    onChange(undefined);
  });

  // 7️⃣ Upload button click
  const handleButtonClick = useHandle(() => {
    inputRef.current?.click();
  });

  return (
    <Box>
      <Typography variant="body1" gutterBottom>
        {label}
        {required && <span style={{ color: 'red' }}> *</span>}
      </Typography>

      {jsonSchema.description && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {jsonSchema.description}
        </Typography>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept ?? jsonSchema.accept}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={disabled || readOnly || uploading}
      />

      {/* Upload button or file info */}
      {value ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={value.split('/').pop() ?? 'Uploaded file'}
            onDelete={!disabled && !readOnly ? handleDelete : undefined}
            deleteIcon={<DeleteIcon />}
            color="primary"
            variant="outlined"
          />
          <Button
            variant="text"
            size="small"
            onClick={() => window.open(value, '_blank')}
          >
            View
          </Button>
        </Box>
      ) : (
        <Button
          variant="outlined"
          startIcon={<CloudUploadIcon />}
          onClick={handleButtonClick}
          disabled={disabled || readOnly || uploading}
          size={sizeProp ?? context.size ?? 'medium'}
        >
          {uploading ? 'Uploading...' : 'Select file'}
        </Button>
      )}

      {/* Upload progress */}
      {uploading && (
        <Box sx={{ mt: 1 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}

      {/* Error message */}
      {hasError && (
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
          {errorMessage}
        </Typography>
      )}
    </Box>
  );
};

// 8️⃣ Definition object
export const FieldInputFileUploadDefinition = {
  Component: FieldInputFileUpload,
  controlled: true,
  test: { type: 'string', format: 'file' },  // format: 'file'
} satisfies FieldInputDefinition;
```

#### Step 3: Example uploadFile Implementation (App Side)

```typescript
// App.tsx: FieldInputFileUploadDefinition is the custom definition above
import { Form, registerPlugin } from '@canard/schema-form';
import type { JSONSchema } from '@canard/schema-form';
import { plugin as muiPlugin } from '@canard/schema-form-mui-plugin';

registerPlugin(muiPlugin);
const schema = { type: 'string', format: 'file' } satisfies JSONSchema;
const definitions = [FieldInputFileUploadDefinition];

const App = () => {
  // Implement uploadFile (e.g. an AWS S3 upload)
  const handleFileAttach = async (file: File): Promise<string> => {
    // 1. Create FormData
    const formData = new FormData();
    formData.append('file', file);

    // 2. Upload to the server
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    // 3. File URL returned by the server
    const data = await response.json();
    return data.fileUrl;  // e.g. "https://s3.amazonaws.com/bucket/file.jpg"
  };

  return (
    <Form
      jsonSchema={schema}
      fieldInputDefinitions={definitions}
      context={{
        size: 'medium',
        variant: 'outlined',
        uploadFile: handleFileAttach,  // ✅ passed through context
      }}
    />
  );
};
```

#### Step 4: Multiple File Upload (Extension)

```typescript
// Multiple-file upload version
interface FieldInputMultiFileUploadProps
  extends FieldInputPropsWithSchema<string[], ArraySchema, MuiContext>,
    MuiContext {
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
}

const FieldInputMultiFileUpload = ({
  value, // string[] (array of URLs)
  onChange, // (urls: string[]) => void
  context,
  maxFiles = 5,
  // ... other props
}: FieldInputMultiFileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const handleFileSelect = useHandle(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);

      // Check the file count
      if ((value?.length ?? 0) + files.length > maxFiles) {
        alert(`You can upload at most ${maxFiles} files.`);
        return;
      }

      if (!context.uploadFile) {
        alert("File upload is not configured.");
        return;
      }

      try {
        setUploading(true);

        // Upload in parallel
        const uploadPromises = files.map((file) => context.uploadFile!(file));
        const newUrls = await Promise.all(uploadPromises);

        // Existing URLs + new URLs
        const allUrls = [...(value ?? []), ...newUrls];
        onChange(allUrls);

        setUploading(false);
      } catch (error) {
        console.error("Multi-file upload error:", error);
        alert("An error occurred while uploading the file.");
        setUploading(false);
      }
    },
  );

  // ... rendering (shown as an array of Chips)
};
```

**Result**: A component with file upload fully integrated, injecting the callback through context

**Caveats**:

- `uploadFile` must be provided through context
- File upload is asynchronous, so the loading state must be managed
- Pass the file URL to onChange as a string
- Use the string[] type for multiple files

---

## Next-Step Connections

- After the implementation is done, configure package.json using `packages/canard/schema-form-antd5-plugin/package.json` as the repository reference
- For a UI library compatibility check, see the `ui-plugin-guidelines` skill

---

## Error Handling

```yaml
error_handling:
  severity_high:
    conditions:
      - Type definition file missing (packages/canard/schema-form/src/types/field/fieldInput.ts)
      - React not installed
      - @canard/schema-form package not installed
      - UI library not installed (MUI, Ant Design, etc.)
      - Component build failure (severe syntax error)
    action: |
      ❌ Fatal error - stop the component implementation
      → Check the type file: ls packages/canard/schema-form/src/types/field/fieldInput.ts
      → Install React: yarn add react react-dom
      → Install @canard/schema-form: yarn add @canard/schema-form
      → Install the UI library: yarn add @mui/material (example)
      → Verify the build: yarn build
      → Run again: after installing the required packages, retry the implementation
    examples:
      - condition: "Type file missing"
        message: "❌ Error: cannot find packages/canard/schema-form/src/types/field/fieldInput.ts"
        recovery: "Read packages/canard/schema-form/src/index.ts and packages/canard/schema-form/src/types/field/fieldInput.ts"
      - condition: "UI library not installed"
        message: "❌ Error: cannot find the @mui/material package"
        recovery: "Install: yarn add @mui/material @emotion/react @emotion/styled"

  severity_medium:
    conditions:
      - Component type inference failed
      - Props validation missing
      - UI library component mapping is unclear
      - Failed to apply performance optimization automatically (memo, useMemo)
      - Failed to generate Storybook args
    action: |
      ⚠️  Warning - continue with the default implementation
      1. Type: fall back to any (a manual fix is recommended)
      2. Props validation: skip PropTypes
      3. UI component: use a plain HTML element
      4. Performance optimization: a manual application is recommended
      5. Storybook: generate only the default args
      6. Add a warning to the implementation file:
         // ⚠️  WARNING: {warning_description}
         // → {action_required}
    fallback_values:
      component_type: "any"
      ui_component: "input" # plain HTML
      optimization: "none (apply manually)"
    examples:
      - condition: "Type inference failed"
        message: "⚠️  Warning: cannot infer the FieldInput Props type"
        fallback: "Substitute any → set FieldInputProps<string> manually"
      - condition: "UI component mapping is unclear"
        message: "⚠️  Warning: cannot map MUI TextField automatically"
        fallback: "Use a plain <input> → change it to <TextField> manually"

  severity_low:
    conditions:
      - Failed to generate accessibility attributes automatically
      - Styling guide violation (minor)
      - JSDoc comment missing
      - Import order is nonstandard
    action: |
      ℹ️  Info: optimization suggestion - improve automatically or manually
      → Accessibility: suggest adding aria-* attributes
      → Style: Prettier auto-fix
      → JSDoc: suggest adding a comment
      → import: ESLint auto-fix
    examples:
      - condition: "No accessibility attributes"
        auto_handling: "Suggest adding aria-label and aria-describedby"
      - condition: "import order"
        auto_handling: "Sort automatically with ESLint --fix"
```

---

> **Best Practice**: Prefer uncontrolled components, and always keep performance in mind
> **Integration**: Build on the type system, and follow the guidelines
