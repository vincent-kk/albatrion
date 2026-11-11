---
name: react-plugin-implementation
description: "Expert on React-based @canard/schema-form plugin implementation patterns. Guides uncontrolled component patterns, writing test conditions, performance optimization (useMemo, useHandle), and plugin structure design."
---

# React Plugin Implementation Skill

## Role

You are an expert on React-based @canard/schema-form plugin implementation patterns.

## Core Responsibilities

1. **Component implementation patterns**: uncontrolled-component-first patterns, and how to use optimization hooks
2. **Writing test conditions**: a guide to writing FormTypeTestObject and FormTypeTestFn
3. **Performance optimization**: strategies for using useMemo, useHandle, and useCallback
4. **Plugin structure**: design a structure that satisfies the SchemaFormPlugin type
5. **formTypeInputDefinitions priority**: optimize the order of the component array

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
import { useMemo } from 'react';
import { useHandle } from '@winglet/react-utils';
import type { FormTypeInputPropsWithSchema } from '@canard/schema-form';

interface FormTypeInput[Name]Props
  extends FormTypeInputPropsWithSchema<ValueType, SchemaType, ContextType>,
          ContextType {
  // Additional props for this component
}

const FormTypeInput[Name] = ({
  // Schema/Node info
  jsonSchema,
  node,
  path,
  name,

  // State
  required,
  disabled,
  readOnly,
  errors,

  // Value
  defaultValue,
  onChange,

  // Context
  context,

  // Direct props (may also come from Context)
  size: sizeProp,
  variant: variantProp,

  // Additional props
  placeholder,
}: FormTypeInput[Name]Props) => {
  // 1. Apply prop priority with useMemo
  const [size, variant, label] = useMemo(() => {
    return [
      sizeProp || context.size || 'medium',
      variantProp || context.variant || 'standard',
      jsonSchema.label || jsonSchema.title || name,
    ];
  }, [sizeProp, context, jsonSchema, variantProp, name]);

  // 2. Optimize the event handler with useHandle
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  });

  // 3. Use the uncontrolled component pattern
  return (
    <[UILibraryComponent]
      id={path}
      name={name}
      required={required}
      disabled={disabled || readOnly}
      defaultValue={defaultValue}  // ✅ uncontrolled
      onChange={handleChange}
      size={size}
      variant={variant}
      placeholder={placeholder || jsonSchema.placeholder}
      error={errors.length > 0}
    />
  );
};

export const FormTypeInput[Name]Definition = {
  Component: FormTypeInput[Name],
  test: { type: 'string' },  // or the function form
} satisfies FormTypeInputDefinition;
```

### Plugin Structure

```typescript
// src/index.ts
import type { SchemaFormPlugin } from "@canard/schema-form";

import { FormError } from "./components/FormError";
import { FormGroup } from "./components/FormGroup";
import { FormInput } from "./components/FormInput";
import { FormLabel } from "./components/FormLabel";
import { formatError } from "./components/formatError";
import { formTypeInputDefinitions } from "./formTypeInputs";

export const plugin = {
  FormGroup,
  FormLabel,
  FormInput,
  FormError,
  formatError,
  formTypeInputDefinitions,
} satisfies SchemaFormPlugin;

export type * from "./type";
export * from "./formTypeInputs";
```

### formTypeInputDefinitions Priority

```typescript
// src/formTypeInputs/index.ts
import type { FormTypeInputDefinition } from "@canard/schema-form";

// ⚠️ Order is critical! More specific conditions must come first

export const formTypeInputDefinitions: FormTypeInputDefinition[] = [
  // === Phase 1: Most specific (format + formType, etc.) ===
  FormTypeInputPasswordDefinition, // type: string, format: password
  FormTypeInputTextareaDefinition, // type: string, format: textarea
  FormTypeInputSliderDefinition, // type: number, formType: slider
  FormTypeInputRadioGroupDefinition, // type: string, formType: radio

  // === Phase 2: Intermediate (format or formType) ===
  FormTypeInputDateDefinition, // type: string, format: date
  FormTypeInputTimeDefinition, // type: string, format: time

  // === Phase 3: Enum conditions (function form) ===
  FormTypeInputStringEnumDefinition, // type: string, enum exists
  FormTypeInputNumberEnumDefinition, // type: number, enum exists

  // === Phase 4: Structural types ===
  FormTypeInputArrayDefinition, // type: array
  FormTypeInputObjectDefinition, // type: object

  // === Phase 5: General types (last) ===
  FormTypeInputNumberDefinition, // type: number | integer
  FormTypeInputBooleanDefinition, // type: boolean
  FormTypeInputStringDefinition, // type: string (most general - last!)
];
```

**Priority principles**:

1. Specific conditions (format + formType) first
2. Intermediate conditions (format or formType)
3. Enum conditions (compound function)
4. Structural types (array, object)
5. General types (type only) last

## Special Patterns

### Array Component (Using ChildNodeComponents)

```typescript
const FormTypeInputArray = ({
  jsonSchema,
  path,
  ChildNodeComponents,  // ✅ provided by canard-form
  context,
}: FormTypeInputArrayProps) => {
  return (
    <Box>
      {ChildNodeComponents.map((ChildComponent, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <ChildComponent />  {/* ✅ props are passed automatically */}
        </Box>
      ))}
      {/* Style only the add/remove buttons */}
      <Button onClick={/* add item */}>Add</Button>
    </Box>
  );
};
```

### Wrapper Component Pattern (DatePicker, etc.)

```typescript
const FormTypeInputDate = ({
  defaultValue,
  onChange,
  ...props
}: FormTypeInputDateProps) => {
  // Value conversion logic
  const dateValue = useMemo(() => {
    return defaultValue ? parseISO(defaultValue) : null;
  }, [defaultValue]);

  const handleChange = useHandle((newDate: Date | null) => {
    onChange(newDate ? formatISO(newDate) : '');
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        value={dateValue}
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
- [ ] Render ChildNodeComponents directly (do not forward props)

## Constraints

- Use controlled components **only when strictly necessary** (real-time validation, conditional rendering, etc.)
- Import the `useHandle` hook from `@winglet/react-utils`
- Type-check with `satisfies FormTypeInputDefinition`
- Whenever the formTypeInputDefinitions array order changes, review the priority

## Output Format

### When Providing Implementation Code

```markdown
## FormTypeInput[Name] Implementation

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

### Scenario 1: Basic FormTypeInputString Implementation

**Situation**: Implement the most basic string input component, using MUI TextField

**Steps**:

#### Step 1: Type Definition and Basic Structure

```typescript
// src/formTypeInputs/FormTypeInputString.tsx
import { useMemo } from 'react';
import { useHandle } from '@winglet/react-utils';
import type { FormTypeInputPropsWithSchema } from '@canard/schema-form';
import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';

// 1️⃣ Define the Context type (the plugin's shared context)
interface MuiFormContext {
  size?: 'small' | 'medium' | 'large';
  variant?: 'standard' | 'outlined' | 'filled';
}

// 2️⃣ Component Props = FormTypeInputPropsWithSchema + Context + additional props
interface FormTypeInputStringProps
  extends FormTypeInputPropsWithSchema<string, never, MuiFormContext>,
          MuiFormContext {
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}

// 3️⃣ Implement the component
const FormTypeInputString = ({
  // Schema/Node info
  jsonSchema,
  node,
  path,
  name,

  // State
  required,
  disabled,
  readOnly,
  errors,

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
}: FormTypeInputStringProps) => {
  // 4️⃣ Apply prop priority with useMemo (direct props > context > default)
  const [size, variant, label] = useMemo(() => {
    return [
      sizeProp ?? context.size ?? 'medium',
      variantProp ?? context.variant ?? 'outlined',
      jsonSchema.label ?? jsonSchema.title ?? name,
    ];
  }, [sizeProp, context.size, variantProp, context.variant, jsonSchema.label, jsonSchema.title, name]);

  // 5️⃣ Error handling
  const hasError = errors.length > 0;
  const errorMessage = hasError ? errors[0].message : undefined;

  // 6️⃣ Optimize the event handler with useHandle
  const handleChange = useHandle((event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
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
      placeholder={placeholder ?? jsonSchema.placeholder}
      error={hasError}
      helperText={errorMessage ?? jsonSchema.description}
      multiline={multiline}
      rows={rows}
      fullWidth
    />
  );
};

// 8️⃣ Definition object (includes the test condition)
export const FormTypeInputStringDefinition = {
  Component: FormTypeInputString,
  test: { type: 'string' },  // matches when type is 'string'
} satisfies FormTypeInputDefinition;
```

#### Step 2: Optimization Points

```typescript
// ✅ GOOD: Cache prop computation with useMemo
const [size, variant, label] = useMemo(() => {
  return [
    sizeProp ?? context.size ?? "medium",
    variantProp ?? context.variant ?? "outlined",
    jsonSchema.label ?? jsonSchema.title ?? name,
  ];
}, [
  sizeProp,
  context.size,
  variantProp,
  context.variant,
  jsonSchema.label,
  jsonSchema.title,
  name,
]);

// ❌ BAD: Recompute on every render
const size = sizeProp ?? context.size ?? "medium";
const variant = variantProp ?? context.variant ?? "outlined";

// ✅ GOOD: Memoize the event handler with useHandle
const handleChange = useHandle((event: React.ChangeEvent<HTMLInputElement>) => {
  onChange(event.target.value);
});

// ❌ BAD: Create a new function on every render
const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  onChange(event.target.value);
};
```

#### Step 3: Writing the Test

```typescript
// src/formTypeInputs/__tests__/FormTypeInputString.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormTypeInputString } from '../FormTypeInputString';

describe('FormTypeInputString', () => {
  it('renders with defaultValue', () => {
    render(
      <FormTypeInputString
        jsonSchema={{ type: 'string' }}
        path="test"
        name="test"
        defaultValue="initial value"
        onChange={jest.fn()}
        required={false}
        disabled={false}
        readOnly={false}
        errors={[]}
        context={{}}
      />
    );

    expect(screen.getByDisplayValue('initial value')).toBeInTheDocument();
  });

  it('calls onChange when user types', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();

    render(
      <FormTypeInputString
        jsonSchema={{ type: 'string' }}
        path="test"
        name="test"
        onChange={onChange}
        required={false}
        disabled={false}
        readOnly={false}
        errors={[]}
        context={{}}
      />
    );

    await user.type(screen.getByRole('textbox'), 'hello');

    expect(onChange).toHaveBeenCalled();
  });
});
```

**Result**: A complete basic string input component, with performance optimized through the uncontrolled pattern

---

### Scenario 2: FormTypeInputDate (Value Conversion Pattern)

**Situation**: A date input component using MUI DatePicker that needs ISO 8601 string ↔ Date object conversion

**Steps**:

#### Step 1: Implement the Date Conversion Logic

```typescript
// src/formTypeInputs/FormTypeInputDate.tsx
import { useMemo } from 'react';
import { useHandle } from '@winglet/react-utils';
import type { FormTypeInputPropsWithSchema } from '@canard/schema-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { parseISO, formatISO } from 'date-fns';
import type { MuiFormContext } from '../type';

interface FormTypeInputDateProps
  extends FormTypeInputPropsWithSchema<string, never, MuiFormContext>,
          MuiFormContext {
  minDate?: string;
  maxDate?: string;
}

const FormTypeInputDate = ({
  jsonSchema,
  path,
  name,
  required,
  disabled,
  readOnly,
  errors,
  defaultValue,  // ⚠️ ISO 8601 string (e.g. "2024-01-15T00:00:00.000Z")
  onChange,      // ⚠️ must be passed as an ISO 8601 string
  context,
  size: sizeProp,
  variant: variantProp,
  minDate,
  maxDate,
}: FormTypeInputDateProps) => {
  // 1️⃣ Convert an ISO string → a Date object
  const dateValue = useMemo(() => {
    if (!defaultValue) return null;
    try {
      return parseISO(defaultValue);
    } catch {
      return null;
    }
  }, [defaultValue]);

  // 2️⃣ Convert minDate and maxDate as well
  const [minDateObj, maxDateObj] = useMemo(() => {
    return [
      minDate ? parseISO(minDate) : undefined,
      maxDate ? parseISO(maxDate) : undefined,
    ];
  }, [minDate, maxDate]);

  // 3️⃣ Handler that converts a Date object → an ISO string
  const handleChange = useHandle((newDate: Date | null) => {
    if (newDate === null) {
      onChange('');
      return;
    }

    try {
      const isoString = formatISO(newDate);
      onChange(isoString);
    } catch {
      onChange('');
    }
  });

  const [size, variant, label] = useMemo(() => {
    return [
      sizeProp ?? context.size ?? 'medium',
      variantProp ?? context.variant ?? 'outlined',
      jsonSchema.label ?? jsonSchema.title ?? name,
    ];
  }, [sizeProp, context.size, variantProp, context.variant, jsonSchema.label, jsonSchema.title, name]);

  const hasError = errors.length > 0;
  const errorMessage = hasError ? errors[0].message : undefined;

  // 4️⃣ Render the DatePicker
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        label={label}
        value={dateValue}  // ✅ Date object
        onChange={handleChange}  // ✅ takes a Date object and converts it to an ISO string
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
export const FormTypeInputDateDefinition = {
  Component: FormTypeInputDate,
  test: { type: 'string', format: 'date' },  // type: string + format: date
} satisfies FormTypeInputDefinition;
```

#### Step 2: Error Handling and Validation

```typescript
// Use isValid from date-fns
import { parseISO, formatISO, isValid } from "date-fns";

const handleChange = useHandle((newDate: Date | null) => {
  if (newDate === null) {
    onChange("");
    return;
  }

  // ✅ Validate the Date
  if (!isValid(newDate)) {
    console.warn("Invalid date:", newDate);
    onChange("");
    return;
  }

  try {
    const isoString = formatISO(newDate);
    onChange(isoString);
  } catch (error) {
    console.error("Date conversion error:", error);
    onChange("");
  }
});
```

#### Step 3: Timezone Handling (Optional)

```typescript
// When the conversion must be fixed to UTC
import { parseISO, formatISO } from "date-fns";
import { zonedTimeToUtc, utcToZonedTime } from "date-fns-tz";

const handleChange = useHandle((newDate: Date | null) => {
  if (newDate === null) {
    onChange("");
    return;
  }

  // Convert the user's local time → UTC
  const utcDate = zonedTimeToUtc(
    newDate,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  const isoString = formatISO(utcDate);
  onChange(isoString);
});
```

**Result**: A DatePicker component that fully handles ISO 8601 string ↔ Date object conversion

**Caveats**:

- `@canard/schema-form` always exchanges values as ISO 8601 strings
- Use the Date object only inside the component, and always pass a string to onChange
- Prefer `parseISO` and `formatISO` from `date-fns` (timezone-safe)

---

### Scenario 3: FormTypeInputStringEnum (test Condition in Function Form)

**Situation**: Display a string that has enum values as a Select or a RadioGroup

**Steps**:

#### Step 1: Write a test Function for a Compound Condition

```typescript
// src/formTypeInputs/FormTypeInputStringEnum.tsx
import { useMemo } from 'react';
import { useHandle } from '@winglet/react-utils';
import type { FormTypeInputPropsWithSchema, FormTypeTestFn } from '@canard/schema-form';
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, FormHelperText } from '@mui/material';
import type { MuiFormContext } from '../type';

interface FormTypeInputStringEnumProps
  extends FormTypeInputPropsWithSchema<string, never, MuiFormContext>,
          MuiFormContext {}

const FormTypeInputStringEnum = ({
  jsonSchema,
  path,
  name,
  required,
  disabled,
  readOnly,
  errors,
  defaultValue,
  onChange,
  context,
  size: sizeProp,
}: FormTypeInputStringEnumProps) => {
  // 1️⃣ Extract the enum values (jsonSchema.enum is an array)
  const enumValues = useMemo(() => {
    return jsonSchema.enum as string[] ?? [];
  }, [jsonSchema.enum]);

  // 2️⃣ Map enum labels (use enumLabels when present)
  const enumLabels = useMemo(() => {
    if (jsonSchema.enumLabels) {
      return jsonSchema.enumLabels as string[];
    }
    // If enumLabels is absent, use the enum values as they are
    return enumValues;
  }, [jsonSchema.enumLabels, enumValues]);

  const handleChange = useHandle((event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  });

  const [size, label] = useMemo(() => {
    return [
      sizeProp ?? context.size ?? 'medium',
      jsonSchema.label ?? jsonSchema.title ?? name,
    ];
  }, [sizeProp, context.size, jsonSchema.label, jsonSchema.title, name]);

  const hasError = errors.length > 0;
  const errorMessage = hasError ? errors[0].message : undefined;

  // 3️⃣ Render the RadioGroup
  return (
    <FormControl error={hasError} required={required} disabled={disabled || readOnly} size={size}>
      <FormLabel id={`label:${path}`}>{label}</FormLabel>
      <RadioGroup
        aria-labelledby={`label:${path}`}
        name={name}
        defaultValue={defaultValue ?? ''}
        onChange={handleChange}
      >
        {enumValues.map((value, index) => (
          <FormControlLabel
            key={value}
            value={value}
            control={<Radio />}
            label={enumLabels[index] ?? value}
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
const testStringEnum: FormTypeTestFn = ({ type, jsonSchema }) => {
  // true only when type is 'string' and an enum is present
  return (
    type === 'string' &&
    Array.isArray(jsonSchema.enum) &&
    jsonSchema.enum.length > 0
  );
};

export const FormTypeInputStringEnumDefinition = {
  Component: FormTypeInputStringEnum,
  test: testStringEnum,  // ✅ function form
} satisfies FormTypeInputDefinition;
```

#### Step 2: Select Version (Alternative)

```typescript
// A version that uses Select (a better fit when there are many options)
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';

const FormTypeInputStringEnumSelect = ({
  jsonSchema,
  path,
  name,
  required,
  disabled,
  readOnly,
  errors,
  defaultValue,
  onChange,
  context,
  size: sizeProp,
  variant: variantProp,
}: FormTypeInputStringEnumProps) => {
  const enumValues = useMemo(() => {
    return jsonSchema.enum as string[] ?? [];
  }, [jsonSchema.enum]);

  const enumLabels = useMemo(() => {
    if (jsonSchema.enumLabels) {
      return jsonSchema.enumLabels as string[];
    }
    return enumValues;
  }, [jsonSchema.enumLabels, enumValues]);

  const handleChange = useHandle((event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  });

  const [size, variant, label] = useMemo(() => {
    return [
      sizeProp ?? context.size ?? 'medium',
      variantProp ?? context.variant ?? 'outlined',
      jsonSchema.label ?? jsonSchema.title ?? name,
    ];
  }, [sizeProp, context.size, variantProp, context.variant, jsonSchema.label, jsonSchema.title, name]);

  const hasError = errors.length > 0;
  const errorMessage = hasError ? errors[0].message : undefined;

  return (
    <FormControl error={hasError} required={required} disabled={disabled || readOnly} size={size} fullWidth>
      <InputLabel id={`label:${path}`}>{label}</InputLabel>
      <Select
        labelId={`label:${path}`}
        id={path}
        name={name}
        label={label}
        defaultValue={defaultValue ?? ''}
        onChange={handleChange}
        variant={variant}
      >
        {enumValues.map((value, index) => (
          <MenuItem key={value} value={value}>
            {enumLabels[index] ?? value}
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
// Select by condition in the formTypeInputDefinitions array
export const formTypeInputDefinitions: FormTypeInputDefinition[] = [
  // === Phase 1: Most specific ===
  FormTypeInputPasswordDefinition, // type: string, format: password

  // === Phase 3: Enum conditions (function form) ===
  // ⚠️ Watch the order: more specific conditions must come first

  // 4 or fewer enum values → RadioGroup
  {
    Component: FormTypeInputStringEnum,
    test: ({ type, jsonSchema }) =>
      type === "string" &&
      Array.isArray(jsonSchema.enum) &&
      jsonSchema.enum.length > 0 &&
      jsonSchema.enum.length <= 4,
  },

  // 5 or more enum values → Select
  {
    Component: FormTypeInputStringEnumSelect,
    test: ({ type, jsonSchema }) =>
      jsonSchematype === "string" &&
      Array.isArray(jsonSchema.enum) &&
      jsonSchema.enum.length > 4,
  },

  // === Phase 5: General types (last) ===
  FormTypeInputStringDefinition, // type: string (most general - last!)
];
```

**Result**: A component that automatically chooses RadioGroup or Select from the number of enum values

**Caveats**:

- Use a test function when checking a compound condition
- More specific conditions must come first (RadioGroup → Select → String order)
- `enumLabels` can provide user-friendly labels

---

### Scenario 4: FormTypeInputArray (ChildNodeComponents Pattern)

**Situation**: An array-type input, rendered dynamically with ChildNodeComponents

**Steps**:

#### Step 1: Pattern for Using ChildNodeComponents

```typescript
// src/formTypeInputs/FormTypeInputArray.tsx
import { useMemo, useState } from 'react';
import { useHandle } from '@winglet/react-utils';
import type { FormTypeInputPropsWithSchema } from '@canard/schema-form';
import { Box, Button, IconButton, Paper, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type { MuiFormContext } from '../type';

interface FormTypeInputArrayProps
  extends FormTypeInputPropsWithSchema<any[], never, MuiFormContext>,
          MuiFormContext {
  // ⚠️ ChildNodeComponents is provided by FormTypeInputPropsWithSchema
}

const FormTypeInputArray = ({
  jsonSchema,
  node,
  path,
  name,
  required,
  disabled,
  readOnly,
  errors,
  defaultValue,
  onChange,
  context,
  ChildNodeComponents,  // ✅ array of child components provided by @canard/schema-form
  size: sizeProp,
}: FormTypeInputArrayProps) => {
  // 1️⃣ ChildNodeComponents is created automatically from the current array value
  // Each ChildComponent already has every prop

  const [size, label] = useMemo(() => {
    return [
      sizeProp ?? context.size ?? 'medium',
      jsonSchema.label ?? jsonSchema.title ?? name,
    ];
  }, [sizeProp, context.size, jsonSchema.label, jsonSchema.title, name]);

  // 2️⃣ Handler that adds an item
  const handleAdd = useHandle(() => {
    const currentValue = node.value ?? [];
    const newValue = [...currentValue, undefined];  // initialize with undefined
    onChange(newValue);
  });

  // 3️⃣ Handler that removes an item
  const handleRemove = useHandle((index: number) => {
    const currentValue = node.value ?? [];
    const newValue = currentValue.filter((_, i) => i !== index);
    onChange(newValue);
  });

  const hasError = errors.length > 0;
  const errorMessage = hasError ? errors[0].message : undefined;

  // 4️⃣ Rendering: render ChildNodeComponents directly
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

      {/* ✅ Render ChildNodeComponents */}
      {ChildNodeComponents && ChildNodeComponents.length > 0 ? (
        ChildNodeComponents.map((ChildComponent, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2, position: 'relative' }}>
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
export const FormTypeInputArrayDefinition = {
  Component: FormTypeInputArray,
  test: { type: 'array' },
} satisfies FormTypeInputDefinition;
```

#### Step 2: ChildNodeComponents Caveats

```typescript
// ❌ WRONG: Trying to pass props to ChildComponent
{ChildNodeComponents.map((ChildComponent, index) => (
  <ChildComponent
    key={index}
    // ❌ Do not pass props this way!
    value={someValue}
    onChange={someHandler}
  />
))}

// ✅ CORRECT: Render ChildComponent as it is
{ChildNodeComponents.map((ChildComponent, index) => (
  <Box key={index}>
    {/* ✅ ChildComponent already has every prop */}
    <ChildComponent />
  </Box>
))}
```

**Key concepts**:

- `ChildNodeComponents` is the component array that `@canard/schema-form` creates automatically
- Each `ChildComponent` already has every prop, including `path`, `jsonSchema`, `value`, and `onChange`
- FormTypeInputArray **handles only the UI layout**, and canard-form manages the values

#### Step 3: Example of a Complex Array Item

```typescript
// JSON Schema example
const schema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      name: { type: "string", label: "Name" },
      age: { type: "number", label: "Age" },
      email: { type: "string", format: "email", label: "Email" },
    },
  },
};

// ChildNodeComponents automatically creates a FormTypeInputObject for each object
// FormTypeInputObject in turn renders the FormTypeInputs for name, age, and email
// → fully automated nested rendering
```

**Result**: A simple Array component where you only implement the UI for adding and removing items

**Caveats**:

- Never pass props to ChildNodeComponents
- Manage the value by updating the whole array through onChange
- Use filter to delete, and spread to add

---

### Scenario 5: FormTypeInputFileUpload (onFileAttach Integration)

**Situation**: File upload, with the `onFileAttach` callback integrated

**Steps**:

#### Step 1: Define the onFileAttach Type

```typescript
// src/type.ts
export interface MuiFormContext {
  size?: "small" | "medium" | "large";
  variant?: "standard" | "outlined" | "filled";

  // ✅ Define the onFileAttach callback
  onFileAttach?: (file: File) => Promise<string>; // returns a URL after the file is uploaded
}
```

#### Step 2: Implement the FileUpload Component

```typescript
// src/formTypeInputs/FormTypeInputFileUpload.tsx
import { useState, useRef } from 'react';
import { useHandle } from '@winglet/react-utils';
import type { FormTypeInputPropsWithSchema } from '@canard/schema-form';
import { Box, Button, Typography, LinearProgress, IconButton, Chip } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import type { MuiFormContext } from '../type';

interface FormTypeInputFileUploadProps
  extends FormTypeInputPropsWithSchema<string, never, MuiFormContext>,
          MuiFormContext {
  accept?: string;  // e.g. "image/*", ".pdf,.doc"
  maxSize?: number;  // in bytes
}

const FormTypeInputFileUpload = ({
  jsonSchema,
  path,
  name,
  required,
  disabled,
  readOnly,
  errors,
  defaultValue,  // ⚠️ file URL string
  onChange,      // ⚠️ pass a file URL string
  context,
  size: sizeProp,
  accept,
  maxSize = 10 * 1024 * 1024,  // default 10MB
}: FormTypeInputFileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const label = jsonSchema.label ?? jsonSchema.title ?? name;
  const hasError = errors.length > 0;
  const errorMessage = hasError ? errors[0].message : undefined;

  // 1️⃣ File selection handler
  const handleFileSelect = useHandle(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 2️⃣ Check the file size
    if (file.size > maxSize) {
      alert(`File size cannot exceed ${maxSize / 1024 / 1024}MB.`);
      return;
    }

    // 3️⃣ Call the onFileAttach callback (supplied by context)
    if (!context.onFileAttach) {
      console.error('onFileAttach callback is not provided in context');
      alert('File upload is not configured.');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Simulate upload progress (in practice this is handled inside onFileAttach)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // 4️⃣ Upload the file (returns a URL)
      const fileUrl = await context.onFileAttach(file);

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
    onChange('');
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
      {defaultValue ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={defaultValue.split('/').pop() ?? 'Uploaded file'}
            onDelete={!disabled && !readOnly ? handleDelete : undefined}
            deleteIcon={<DeleteIcon />}
            color="primary"
            variant="outlined"
          />
          <Button
            variant="text"
            size="small"
            onClick={() => window.open(defaultValue, '_blank')}
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
export const FormTypeInputFileUploadDefinition = {
  Component: FormTypeInputFileUpload,
  test: { type: 'string', format: 'file' },  // format: 'file'
} satisfies FormTypeInputDefinition;
```

#### Step 3: Example onFileAttach Implementation (App Side)

```typescript
// Using SchemaForm in App.tsx
import { SchemaForm } from '@canard/schema-form';
import { plugin as muiPlugin } from '@canard/schema-form-mui-plugin';

const App = () => {
  // Implement onFileAttach (e.g. an AWS S3 upload)
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
    <SchemaForm
      schema={schema}
      plugin={muiPlugin}
      context={{
        size: 'medium',
        variant: 'outlined',
        onFileAttach: handleFileAttach,  // ✅ passed through context
      }}
    />
  );
};
```

#### Step 4: Multiple File Upload (Extension)

```typescript
// Multiple-file upload version
interface FormTypeInputMultiFileUploadProps
  extends FormTypeInputPropsWithSchema<string[], never, MuiFormContext>,
    MuiFormContext {
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
}

const FormTypeInputMultiFileUpload = ({
  defaultValue, // string[] (array of URLs)
  onChange, // (urls: string[]) => void
  context,
  maxFiles = 5,
  // ... other props
}: FormTypeInputMultiFileUploadProps) => {
  const handleFileSelect = useHandle(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);

      // Check the file count
      if ((defaultValue?.length ?? 0) + files.length > maxFiles) {
        alert(`You can upload at most ${maxFiles} files.`);
        return;
      }

      if (!context.onFileAttach) {
        alert("File upload is not configured.");
        return;
      }

      try {
        setUploading(true);

        // Upload in parallel
        const uploadPromises = files.map((file) => context.onFileAttach!(file));
        const newUrls = await Promise.all(uploadPromises);

        // Existing URLs + new URLs
        const allUrls = [...(defaultValue ?? []), ...newUrls];
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

- `onFileAttach` must be provided through context
- File upload is asynchronous, so the loading state must be managed
- Pass the file URL to onChange as a string
- Use the string[] type for multiple files

---

## Next-Step Connections

- After the implementation is done, configure package.json with the `dependency-management` skill
- For a UI library compatibility check, see the `ui-plugin-guidelines` skill

---

## Error Handling

```yaml
error_handling:
  severity_high:
    conditions:
      - Type definition file missing (types/index.d.ts)
      - React not installed
      - @canard/schema-form package not installed
      - UI library not installed (MUI, Ant Design, etc.)
      - Component build failure (severe syntax error)
    action: |
      ❌ Fatal error - stop the component implementation
      → Check the type file: ls types/index.d.ts
      → Install React: yarn add react react-dom
      → Install @canard/schema-form: yarn add @canard/schema-form
      → Install the UI library: yarn add @mui/material (example)
      → Verify the build: yarn build
      → Run again: after installing the required packages, retry the implementation
    examples:
      - condition: "Type file missing"
        message: "❌ Error: cannot find types/index.d.ts"
        recovery: "Run canard-type-system first to generate the type definitions"
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
        message: "⚠️  Warning: cannot infer the FormTypeInput Props type"
        fallback: "Substitute any → set FormTypeInputProps<string> manually"
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
