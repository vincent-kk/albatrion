# Test Condition Guide

How to write `test` conditions on FormTypeInputDefinition, and how to set their priority.

## Two Ways to Write a Test Condition

### 1. Object Form (FormTypeTestObject)

**When to use**: simple conditions, a clear match

**Benefits**:
- Concise and easy to read
- Type safety
- Autocomplete support

**Shape**:

```typescript
type OptionalString = string | undefined;

type FormTypeTestObject = Partial<{
  type: JSONSchemaType | JSONSchemaType[];  // 'string', 'number', and similar
  path: string | string[];  // JSONPointer path
  format: OptionalString | OptionalString[];  // 'email', 'date', and similar
  formType: OptionalString | OptionalString[];  // 'textarea', 'slider', and similar
}>;
```

**Examples**:

```typescript
// Single type
export const FormTypeInputStringDefinition = {
  Component: FormTypeInputString,
  test: { type: 'string' },
} satisfies FormTypeInputDefinition;

// Several types
export const FormTypeInputNumberDefinition = {
  Component: FormTypeInputNumber,
  test: { type: ['number', 'integer'] },
} satisfies FormTypeInputDefinition;

// type + format
export const FormTypeInputPasswordDefinition = {
  Component: FormTypeInputPassword,
  test: { type: 'string', format: 'password' },
} satisfies FormTypeInputDefinition;

// type + formType
export const FormTypeInputTextareaDefinition = {
  Component: FormTypeInputTextarea,
  test: { type: 'string', formType: 'textarea' },
} satisfies FormTypeInputDefinition;

// Several formats
export const FormTypeInputDateTimeDefinition = {
  Component: FormTypeInputDateTime,
  test: { type: 'string', format: ['date', 'date-time'] },
} satisfies FormTypeInputDefinition;

// path condition
export const FormTypeInputUserNameDefinition = {
  Component: FormTypeInputUserName,
  test: { type: 'string', path: '/user/name' },
} satisfies FormTypeInputDefinition;
```

### 2. Function Form (FormTypeTestFn)

**When to use**: compound conditions, dynamic decisions

**Benefits**:
- Can express complex logic
- Can read many jsonSchema properties
- Can decide conditions dynamically

**Shape**:

```typescript
type Hint = {
  type: JSONSchemaType;
  path: string;
  jsonSchema: JSONSchemaWithVirtual;
  format?: string;
  formType?: string;
};

type FormTypeTestFn = (hint: Hint) => boolean;
```

**Examples**:

```typescript
// Enum condition
export const FormTypeInputStringEnumDefinition = {
  Component: FormTypeInputStringEnum,
  test: ({ type, jsonSchema }: Hint) =>
    type === 'string' &&
    jsonSchema.enum !== undefined &&
    jsonSchema.enum.length > 0,
} satisfies FormTypeInputDefinition;

// Array + Enum condition
export const FormTypeInputMultiSelectDefinition = {
  Component: FormTypeInputMultiSelect,
  test: ({ type, jsonSchema }: Hint) =>
    type === 'array' &&
    jsonSchema.items?.type === 'string' &&
    jsonSchema.items?.enum !== undefined &&
    jsonSchema.items.enum.length > 0,
} satisfies FormTypeInputDefinition;

// Compound format condition
export const FormTypeInputRichTextDefinition = {
  Component: FormTypeInputRichText,
  test: ({ type, format, jsonSchema }: Hint) =>
    type === 'string' &&
    (format === 'html' || format === 'markdown' || jsonSchema.richText === true),
} satisfies FormTypeInputDefinition;

// Range condition
export const FormTypeInputSliderDefinition = {
  Component: FormTypeInputSlider,
  test: ({ type, formType, jsonSchema }: Hint) =>
    (type === 'number' || type === 'integer') &&
    formType === 'slider' &&
    jsonSchema.minimum !== undefined &&
    jsonSchema.maximum !== undefined,
} satisfies FormTypeInputDefinition;

// Path-based condition
export const FormTypeInputCustomDefinition = {
  Component: FormTypeInputCustom,
  test: ({ path, jsonSchema }: Hint) =>
    path.startsWith('/settings/') &&
    jsonSchema.customComponent === true,
} satisfies FormTypeInputDefinition;
```

## Condition Priority and Order

**Important**: the order of the formTypeInputDefinitions array is the mapping priority.

### Priority Principles

1. **Most specific conditions first** (format + formType + other)
2. **Medium specificity** (format or formType)
3. **Enum conditions** (function form, compound conditions)
4. **Structural types** (array, object)
5. **General types** (type only)

### Recommended Order

```typescript
export const formTypeInputDefinitions: FormTypeInputDefinition[] = [
  // === Priority 1: most specific (format + formType, and similar) ===
  
  // type + format + extra conditions
  FormTypeInputRichTextDefinition,     // string + format: html/markdown + richText
  FormTypeInputPhoneDefinition,        // string + format: tel + pattern
  
  // type + formType + extra conditions  
  FormTypeInputSliderDefinition,       // number + formType: slider + min/max
  FormTypeInputColorPickerDefinition,  // string + formType: color + pattern
  
  // === Priority 2: medium (format or formType) ===
  
  // type + format
  FormTypeInputPasswordDefinition,     // string + format: password
  FormTypeInputTextareaDefinition,     // string + format: textarea
  FormTypeInputEmailDefinition,        // string + format: email
  FormTypeInputUrlDefinition,          // string + format: url
  FormTypeInputDateDefinition,         // string + format: date
  FormTypeInputTimeDefinition,         // string + format: time
  FormTypeInputDateTimeDefinition,     // string + format: date-time
  
  // type + formType
  FormTypeInputRadioGroupDefinition,   // string + formType: radio
  FormTypeInputSwitchDefinition,       // boolean + formType: switch
  
  // === Priority 3: enum conditions (function form, compound) ===
  
  FormTypeInputStringEnumDefinition,   // string + enum exists (function)
  FormTypeInputNumberEnumDefinition,   // number + enum exists (function)
  FormTypeInputMultiSelectDefinition,  // array + items.enum exists (function)
  
  // === Priority 4: structural types ===
  
  FormTypeInputArrayDefinition,        // type: array
  FormTypeInputObjectDefinition,       // type: object
  
  // === Priority 5: general types (last!) ===
  
  FormTypeInputNumberDefinition,       // type: number | integer
  FormTypeInputBooleanDefinition,      // type: boolean
  FormTypeInputStringDefinition,       // type: string (very last!)
];
```

### Why Order Matters

```typescript
// ❌ Wrong order - the general condition comes first
const badOrder = [
  FormTypeInputStringDefinition,     // type: string (too general!)
  FormTypeInputPasswordDefinition,   // type: string, format: password
  // ↑ Password never matches! String matches first
];

// ✅ Correct order - the specific condition comes first
const goodOrder = [
  FormTypeInputPasswordDefinition,   // type: string, format: password
  FormTypeInputStringDefinition,     // type: string
  // ✅ Password is checked first, so it matches correctly
];
```

## Practical Examples

### Example 1: Email Input

```typescript
interface EmailSchema extends JSONSchema {
  type: 'string';
  format: 'email';
}

// Use the object form (simple condition)
export const FormTypeInputEmailDefinition = {
  Component: FormTypeInputEmail,
  test: { type: 'string', format: 'email' },
} satisfies FormTypeInputDefinition;
```

**Placement**: Priority 2 (type + format)

### Example 2: Slider (Range Input)

```typescript
interface SliderSchema extends JSONSchema {
  type: 'number' | 'integer';
  formType: 'slider';
  minimum: number;
  maximum: number;
  step?: number;
}

// Use the function form (compound condition)
export const FormTypeInputSliderDefinition = {
  Component: FormTypeInputSlider,
  test: ({ type, formType, jsonSchema }: Hint) =>
    (type === 'number' || type === 'integer') &&
    formType === 'slider' &&
    jsonSchema.minimum !== undefined &&
    jsonSchema.maximum !== undefined,
} satisfies FormTypeInputDefinition;
```

**Placement**: Priority 1 (type + formType + extra conditions)

### Example 3: Multi-Select (Array + Enum)

```typescript
interface MultiSelectSchema extends JSONSchema {
  type: 'array';
  items: {
    type: 'string';
    enum: string[];
  };
}

// Use the function form (checks nested properties)
export const FormTypeInputMultiSelectDefinition = {
  Component: FormTypeInputMultiSelect,
  test: ({ type, jsonSchema }: Hint) =>
    type === 'array' &&
    jsonSchema.items?.type === 'string' &&
    jsonSchema.items?.enum !== undefined &&
    jsonSchema.items.enum.length > 0,
} satisfies FormTypeInputDefinition;
```

**Placement**: Priority 3 (enum condition, function form)

### Example 4: Radio Group

```typescript
interface RadioGroupSchema extends JSONSchema {
  type: 'string' | 'number';
  formType: 'radio';
  enum: any[];
}

// Use the function form (several types + conditions)
export const FormTypeInputRadioGroupDefinition = {
  Component: FormTypeInputRadioGroup,
  test: ({ type, formType, jsonSchema }: Hint) =>
    (type === 'string' || type === 'number' || type === 'integer') &&
    formType === 'radio' &&
    jsonSchema.enum !== undefined &&
    jsonSchema.enum.length > 0,
} satisfies FormTypeInputDefinition;
```

**Placement**: Priority 2 (type + formType), or Priority 3 (because of the enum check)

## Decision Flow

```
Is the condition simple? (type, format, and formType only)
├─ Yes → use the object form
│         { type: 'string', format: 'email' }
│
└─ No → use the function form
          ({ type, jsonSchema }) => 
            type === 'string' && jsonSchema.enum?.length > 0
```

```
How specific is the condition?
├─ Very specific (format + formType + extra properties)
│  → place in Priority 1
│
├─ Medium (format or formType)
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
import { Hint } from '@canard/schema-form';

// Build a test hint
const testHint: Hint = {
  type: 'string',
  path: '/email',
  jsonSchema: {
    type: 'string',
    format: 'email',
  },
  format: 'email',
};

// Test the condition
const shouldMatch = FormTypeInputEmailDefinition.test(testHint);
console.log(shouldMatch);  // true
```

## Debugging Tips

### Match Logging

```typescript
// Enable in development only
if (process.env.NODE_ENV === 'development') {
  export const FormTypeInputStringDefinition = {
    Component: FormTypeInputString,
    test: (hint: Hint) => {
      const matches = hint.type === 'string';
      console.log('FormTypeInputString test:', { hint, matches });
      return matches;
    },
  };
}
```

---

**Core principles**:
1. Simple condition → object form
2. Compound condition → function form
3. Specific condition → toward the front of the array
4. General condition → toward the back of the array
5. Order decides mapping priority
