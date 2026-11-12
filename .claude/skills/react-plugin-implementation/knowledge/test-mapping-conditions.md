# Test Condition Guide

How to write `test` conditions on FieldInputDefinition, and how to set their priority.

## Two Ways to Write a Test Condition

### 1. Object Form (FieldInputTestObject)

**When to use**: simple conditions, a clear match

**Benefits**:
- Concise and easy to read
- Type safety
- Autocomplete support

**Shape**:

```typescript
import type { FieldInputTestObject } from '@canard/schema-form';

const textareaTest = {
  type: 'string',
  inputType: 'textarea', // Authored as presentation.inputType on the schema
} satisfies FieldInputTestObject;
```

**Examples**:

```typescript
// Single type
export const FieldInputStringDefinition = {
  Component: FieldInputString,
  test: { type: 'string' },
} satisfies FieldInputDefinition;

// Several types
export const FieldInputNumberDefinition = {
  Component: FieldInputNumber,
  test: { schemaType: ['number', 'integer'] },
} satisfies FieldInputDefinition;

// type + format
export const FieldInputPasswordDefinition = {
  Component: FieldInputPassword,
  test: { type: 'string', format: 'password' },
} satisfies FieldInputDefinition;

// type + inputType
export const FieldInputTextareaDefinition = {
  Component: FieldInputTextarea,
  test: { type: 'string', inputType: 'textarea' },
} satisfies FieldInputDefinition;

// Several formats
export const FieldInputDateTimeDefinition = {
  Component: FieldInputDateTime,
  test: { type: 'string', format: ['date', 'date-time'] },
} satisfies FieldInputDefinition;

// path condition
export const FieldInputUserNameDefinition = {
  Component: FieldInputUserName,
  test: { type: 'string', path: '/user/name' },
} satisfies FieldInputDefinition;
```

### 2. Function Form (FieldInputTestFn)

**When to use**: compound conditions, dynamic decisions

**Benefits**:
- Can express complex logic
- Can read many jsonSchema properties
- Can decide conditions dynamically

**Shape**:

```typescript
import type { FieldInputHint, FieldInputTestFn, StringSchema, NumberSchema, ArraySchema } from '@canard/schema-form';
import { isStringSchema } from '@winglet/json-schema/filter';

const isString: FieldInputTestFn = (hint: FieldInputHint) => hint.type === 'string';
```

**Examples**:

```typescript
// Enum condition
export const FieldInputStringEnumDefinition = {
  Component: FieldInputStringEnum,
  test: ({ type, jsonSchema }: FieldInputHint) =>
    type === 'string' &&
    jsonSchema.enum !== undefined &&
    jsonSchema.enum.length > 0,
} satisfies FieldInputDefinition;

// Array + Enum condition
export const FieldInputMultiSelectDefinition = {
  Component: FieldInputMultiSelect,
  test: ({ type, jsonSchema }: FieldInputHint) =>
    type === 'array' &&
    isStringSchema(jsonSchema.items) &&
    !!jsonSchema.items.enum?.length,
} satisfies FieldInputDefinition;

// Compound format condition
export const FieldInputRichTextDefinition = {
  Component: FieldInputRichText,
  test: ({ type, format, jsonSchema }: FieldInputHint) =>
    type === 'string' &&
    (format === 'html' || format === 'markdown' || jsonSchema.richText === true),
} satisfies FieldInputDefinition;

// Range condition
export const FieldInputSliderDefinition = {
  Component: FieldInputSlider,
  test: ({ type, inputType, jsonSchema }: FieldInputHint) =>
    type === 'number' &&
    inputType === 'slider' &&
    jsonSchema.minimum !== undefined &&
    jsonSchema.maximum !== undefined,
} satisfies FieldInputDefinition;

// Path-based condition
export const FieldInputCustomDefinition = {
  Component: FieldInputCustom,
  test: ({ path, jsonSchema }: FieldInputHint) =>
    path.startsWith('/settings/') &&
    jsonSchema.customComponent === true,
} satisfies FieldInputDefinition;
```

## Condition Priority and Order

**Important**: the order of the fieldInputDefinitions array is the mapping priority.

### Priority Principles

1. **Most specific conditions first** (format + inputType + other)
2. **Medium specificity** (format or inputType)
3. **Enum conditions** (function form, compound conditions)
4. **Structural types** (array, object)
5. **General types** (type only)

### Recommended Order

```typescript
export const fieldInputDefinitions: FieldInputDefinition[] = [
  // === Priority 1: most specific (format + inputType, and similar) ===

  // type + format + extra conditions
  FieldInputRichTextDefinition,     // string + format: html/markdown + richText
  FieldInputPhoneDefinition,        // string + format: tel + pattern

  // type + inputType + extra conditions
  FieldInputSliderDefinition,       // number + inputType: slider + min/max
  FieldInputColorPickerDefinition,  // string + inputType: color + pattern

  // === Priority 2: medium (format or inputType) ===

  // type + format
  FieldInputPasswordDefinition,     // string + format: password
  FieldInputTextareaDefinition,     // string + format: textarea
  FieldInputEmailDefinition,        // string + format: email
  FieldInputUrlDefinition,          // string + format: url
  FieldInputDateDefinition,         // string + format: date
  FieldInputTimeDefinition,         // string + format: time
  FieldInputDateTimeDefinition,     // string + format: date-time

  // type + inputType
  FieldInputRadioGroupDefinition,   // string + inputType: radio
  FieldInputSwitchDefinition,       // boolean + inputType: switch

  // === Priority 3: enum conditions (function form, compound) ===

  FieldInputStringEnumDefinition,   // string + enum exists (function)
  FieldInputNumberEnumDefinition,   // number + enum exists (function)
  FieldInputMultiSelectDefinition,  // array + items.enum exists (function)

  // === Priority 4: structural types ===

  FieldInputArrayDefinition,        // type: array
  // Object branches use the core fallback unless the plugin defines a custom input.

  // === Priority 5: general types (last!) ===

  FieldInputNumberDefinition,       // type: number | integer
  FieldInputBooleanDefinition,      // type: boolean
  FieldInputStringDefinition,       // type: string (very last!)
];
```

### Why Order Matters

```typescript
// ❌ Wrong order - the general condition comes first
const badOrder = [
  FieldInputStringDefinition,     // type: string (too general!)
  FieldInputPasswordDefinition,   // type: string, format: password
  // ↑ Password never matches! String matches first
];

// ✅ Correct order - the specific condition comes first
const goodOrder = [
  FieldInputPasswordDefinition,   // type: string, format: password
  FieldInputStringDefinition,     // type: string
  // ✅ Password is checked first, so it matches correctly
];
```

## Practical Examples

### Example 1: Email Input

```typescript
type EmailSchema = StringSchema & { format: 'email' };

// Use the object form (simple condition)
export const FieldInputEmailDefinition = {
  Component: FieldInputEmail,
  test: { type: 'string', format: 'email' },
} satisfies FieldInputDefinition;
```

**Placement**: Priority 2 (type + format)

### Example 2: Slider (Range Input)

```typescript
type SliderSchema = NumberSchema & {
  presentation: { inputType: 'slider' };
  minimum: number;
  maximum: number;
};

// Use the function form (compound condition)
export const FieldInputSliderDefinition = {
  Component: FieldInputSlider,
  test: ({ type, inputType, jsonSchema }: FieldInputHint) =>
    type === 'number' &&
    inputType === 'slider' &&
    jsonSchema.minimum !== undefined &&
    jsonSchema.maximum !== undefined,
} satisfies FieldInputDefinition;
```

**Placement**: Priority 1 (type + inputType + extra conditions)

### Example 3: Multi-Select (Array + Enum)

```typescript
type MultiSelectSchema = ArraySchema & {
  type: 'array';
  items: {
    type: 'string';
    enum: string[];
  };
};

// Use the function form (checks nested properties)
export const FieldInputMultiSelectDefinition = {
  Component: FieldInputMultiSelect,
  test: ({ type, jsonSchema }: FieldInputHint) =>
    type === 'array' &&
    isStringSchema(jsonSchema.items) &&
    !!jsonSchema.items.enum?.length,
} satisfies FieldInputDefinition;
```

**Placement**: Priority 3 (enum condition, function form)

### Example 4: Radio Group

```typescript
type RadioGroupSchema = (StringSchema | NumberSchema) & {
  presentation: { inputType: 'radio' };
  enum: Array<string | number>;
};

// Use the function form (several types + conditions)
export const FieldInputRadioGroupDefinition = {
  Component: FieldInputRadioGroup,
  test: ({ type, inputType, jsonSchema }: FieldInputHint) =>
    (type === 'string' || type === 'number') &&
    inputType === 'radio' &&
    jsonSchema.enum !== undefined &&
    jsonSchema.enum.length > 0,
} satisfies FieldInputDefinition;
```

**Placement**: Priority 2 (type + inputType), or Priority 3 (because of the enum check)

## Decision Flow

```
Is the condition simple? (type, format, and inputType only)
├─ Yes → use the object form
│         { type: 'string', format: 'email' }
│
└─ No → use the function form
          ({ type, jsonSchema }) =>
            type === 'string' && jsonSchema.enum?.length > 0
```

```
How specific is the condition?
├─ Very specific (format + inputType + extra properties)
│  → place in Priority 1
│
├─ Medium (format or inputType)
│  → place in Priority 2
│
├─ Enum condition (function form)
│  → place in Priority 3
│
├─ Structural type (array, object)
│  → place in Priority 4
│
└─ General type (type only)
   → place in Priority 5 (last)
```

## Verifying Test Conditions

### Manual Verification

```typescript
import type { FieldInputHint, FieldInputTestFn } from '@canard/schema-form';

// Build a test hint
const testHint: FieldInputHint = {
  type: 'string',
  schemaType: 'string',
  misfit: false,
  required: false,
  nullable: false,
  path: '/email',
  jsonSchema: {
    type: 'string',
    format: 'email',
  },
  format: 'email',
};

// Test the condition
const testEmail: FieldInputTestFn = ({ type, format }) => type === 'string' && format === 'email';
const shouldMatch = testEmail(testHint);
console.log(shouldMatch);  // true
```

## Debugging Tips

### Match Logging

```typescript
export const FieldInputStringDefinition = {
  Component: FieldInputString,
  test: (hint: FieldInputHint) => {
    const matches = hint.type === 'string';
    if (process.env.NODE_ENV === 'development') {
      console.log('FieldInputString test:', { hint, matches });
    }
    return matches;
  },
} satisfies FieldInputDefinition;
```

---

**Core principles**:
1. Simple condition → object form
2. Compound condition → function form
3. Specific condition → toward the front of the array
4. General condition → toward the back of the array
5. Order decides mapping priority
