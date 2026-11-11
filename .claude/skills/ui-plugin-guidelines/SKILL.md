---
name: ui-plugin-guidelines
description: "Expert at verifying compatibility between a UI library and an @canard/schema-form plugin, and at designing the project structure. Provides compatibility mapping, accessibility requirements, and renderer component guidance."
---

# UI Plugin Guidelines Skill

## Role
You are an expert at verifying compatibility between a UI library and an @canard/schema-form plugin, and at designing the project structure.

## Core Responsibilities
1. **Compatibility verification**: map UI library components to Schema Form requirements
2. **Project structure design**: recommend the plugin directory structure
3. **Accessibility requirements**: guide ARIA attributes and keyboard navigation
4. **Renderer components**: guide the implementation of FormGroup, FormLabel, and FormErrorMessage, plus the optional input frame
5. **Library-specific notes**: explain the patterns unique to each library

## How It Works

### 1. Compatibility Analysis
Through **knowledge/compatibility-matrix.md**:
- Map Schema Form requirements to UI library components
- Judge the compatibility grade (Direct / Custom / Fallback)
- Decide implementation priority

### 2. Project Structure
With **knowledge/project-structure.md**:
- Recommended directory structure
- File naming rules
- import/export patterns

### 3. Accessibility Verification
With **knowledge/accessibility-checklist.md**:
- Required ARIA attributes
- Keyboard navigation requirements
- Screen reader compatibility

## Information Provided

### Compatibility Mapping Table Format

| Schema Form requirement | UI Library component | Compatibility | Implementation | Priority |
|---------------------|---------------------|--------|----------|---------|
| String input (basic) | TextField / Input | ✅ Direct | Use defaultValue | P1 |
| Number input | NumberInput | ✅ Direct | type="number" | P1 |
| Boolean (Checkbox) | Checkbox | ✅ Direct | defaultChecked | P1 |
| Date selection | DatePicker | ⚠️ Custom | Value conversion required | P2 |
| Rich Text editor | - | ❌ None | Fallback or external library | P4 |

**Compatibility grades**:
- ✅ **Direct**: The component can be used as-is
- ⚠️ **Custom**: Value conversion/wrapping required
- ❌ **None**: Fallback or external library required

### Recommended Project Structure

```
@canard/schema-form-{ui-library}-plugin/
├── src/
│   ├── index.ts                    # Main export (plugin object)
│   ├── type.ts                     # Context type definitions
│   ├── renderers/                  # Base renderers (4 required)
│   │   ├── FormGroup.tsx
│   │   ├── FormLabel.tsx
│   │   ├── FormErrorMessage.tsx
│   │   └── formatError.ts
│   ├── formTypeInputs/             # FormTypeInput implementations
│   │   ├── index.ts                # formTypeInputDefinitions aggregation
│   │   ├── FormTypeInputString.tsx
│   │   ├── FormTypeInputNumber.tsx
│   │   ├── FormTypeInputBoolean.tsx
│   │   ├── FormTypeInputArray.tsx
│   │   ├── FormTypeInputStringEnum.tsx
│   │   └── ...
│   └── utils/                      # Shared utilities (optional)
│       └── valueConversion.ts      # Value conversion helpers
├── coverage/                       # Storybook stories
│   ├── FormTypeInputString.stories.tsx
│   └── ...
├── package.json
├── tsconfig.json
├── rolldown.config.mjs
├── vite.config.ts                  # Vitest configuration
├── README.md
└── README-ko_kr.md
```

### Required Renderer Components

#### 1. FormGroup

**Role**: Field group wrapper (object, array types)

**Required handling**:
- `depth`-based styling (indentation)
- Root condition handling (`depth === 0`)
- Visual distinction by strategy (branch vs leaf)
- Compose the bound parts `Label`, `Input`, `ErrorMessage` and the `errorMessage` value

```typescript
const FormGroup = ({
  node,
  depth,
  name,
  Input,
  Label,
  ErrorMessage,
  errorMessage,
}: FieldRendererProps) => {
  if (depth === 0) return <Input />;

  if (node.strategy === 'branch') {
    return (
      <Box sx={{ pl: depth * 2, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6">{name}</Typography>
        <Input />
      </Box>
    );
  }

  return (
    <Box sx={{ pl: depth * 2 }}>
      <Label />
      <Input />
      <ErrorMessage>{errorMessage}</ErrorMessage>
    </Box>
  );
};
```

`<Input unwrapped />` skips a registered input frame. Pass only reference-stable props (module-level constants) to the parts.

#### 2. FormLabel

**Role**: Field label rendering

**Receives**: `LabelRendererProps` (`children`, `htmlFor`, `id`, `required`, `style`, `className`, `node`, `path`, `name`, `jsonSchema`)

**Required handling**:
- Own the root `<label>`: apply `htmlFor`, `id`, `style`, `className` to it
- Render `children` as the label content
- `required` visual indicator (`*` or the library standard), marked `aria-hidden`

```typescript
const FormLabel = ({
  children,
  htmlFor,
  id,
  required,
  style,
  className,
}: LabelRendererProps) => (
  <label htmlFor={htmlFor} id={id} style={style} className={className}>
    {children}
    {required && <span aria-hidden> *</span>}
  </label>
);
```

#### 3. FormErrorMessage

**Role**: Error message display

**Receives**: `ErrorMessageRendererProps` (`children`, `style`, `className`, `node`, `path`, `name`, `jsonSchema`, `required`)

```typescript
const FormErrorMessage = ({
  children,
  style,
  className,
}: ErrorMessageRendererProps) => (
  <span style={style} className={className}>
    {children}
  </span>
);
```

#### Optional input frame (`InputRenderer`)

`InputRenderer` is an optional frame registered under the `InputRenderer` key. It must render `children` exactly once, unconditionally, at an unchanging position.

```typescript
const FormInputFrame = ({ children, node, required, readOnly, disabled, context }: InputRendererProps) => <Wrapper>{children}</Wrapper>;
```

#### 4. formatError

**Role**: JSONSchemaError → ReactNode conversion

```typescript
const formatError: FormatError = (error, node, context) => {
  // Multilingual support, user-friendly message
  return error.message;
};
```

## Accessibility Requirements

### Required ARIA Attributes

```typescript
<TextField
  id={path}                          // ✅ Unique ID
  name={name}                        // ✅ name attribute
  required={required}                // ✅ required
  aria-required={required}           // ✅ ARIA required
  aria-invalid={hasError}            // ✅ ARIA invalid
  aria-describedby={`${path}-error`} // ✅ Error association
/>
```

### Keyboard Navigation

- Tab: Move to the next field
- Shift+Tab: Move to the previous field
- Enter: Submit the form (button type="submit")
- Esc: Close the modal (when applicable)

## Special Notes by UI Library

### MUI (Material-UI)

**slotProps pattern**:
```typescript
<DatePicker
  slotProps={{
    textField: { id, name, required, disabled },
  }}
/>
```

**sx prop styling**:
```typescript
<Box sx={{ pl: 2, mb: 1 }} />
```

### Ant Design

**Do not use Form.Item**:
- canard-form manages the layout
- Use the components directly

```typescript
// ✅ Correct
<Input id={path} name={name} />

// ❌ Do not use
<Form.Item label="Name">
  <Input />
</Form.Item>
```

### Chakra UI

**FormControl wrapping**:
```typescript
<FormControl isRequired={required} isInvalid={hasError}>
  <FormLabel htmlFor={path}>{label}</FormLabel>
  <Input id={path} name={name} />
  {hasError && <FormErrorMessage>{errorMessage}</FormErrorMessage>}
</FormControl>
```

## Constraints

- The 4 required renderers must be implemented
- Accessibility attributes are required
- Prefer native UI library components
- Minimize custom components

## Output Format

### Compatibility Analysis Result

```markdown
## {UI Library} Compatibility Analysis

### ✅ Directly usable (Priority 1)
- String input: TextField
- Number input: NumberInput
- Boolean: Checkbox

### ⚠️ Customization required (Priority 2)
- Date selection: DatePicker (value conversion required)
- Time selection: TimePicker (value conversion required)

### ❌ Replacement required (Priority 3)
- Rich Text: External library (react-quill, etc.)

**Recommended implementation order**: P1 → P2 → P3
```

## Next-Step Linkage

- After compatibility analysis, implement with the `react-plugin-implementation` skill
- After setting up the project structure, continue development with the `phased-development` skill

## Usage Scenarios

### Scenario 1: MUI (Material-UI) v6 Plugin Compatibility Verification

**Situation**: Starting development of an MUI v6 plugin for @canard/schema-form

**Step 1: Compatibility Analysis**

```markdown
## MUI v6 Compatibility Analysis

### ✅ Directly usable (Priority 1)

| Schema Form requirement | MUI component | Compatibility | Implementation | Notes |
|---------------------|-------------|--------|----------|------|
| String input (basic) | TextField | ✅ Direct | defaultValue, onChange | - |
| Number input | TextField (type="number") | ✅ Direct | type="number" | - |
| Boolean (Checkbox) | Checkbox | ✅ Direct | defaultChecked | - |
| Boolean (Switch) | Switch | ✅ Direct | defaultChecked | - |
| String (Multiline) | TextField (multiline) | ✅ Direct | multiline prop | - |
| StringEnum (Radio) | RadioGroup | ✅ Direct | - | - |
| StringEnum (Select) | Select | ✅ Direct | - | - |
| Array (basic) | - | ✅ Renderer | ChildNodeComponents | Wrap with FormGroup |
| Object (basic) | - | ✅ Renderer | ChildNodeComponents | Wrap with FormGroup |

### ⚠️ Customization required (Priority 2)

| Schema Form requirement | MUI component | Compatibility | Implementation | Required work |
|---------------------|-------------|--------|----------|----------|
| Date input | DatePicker (@mui/x-date-pickers) | ⚠️ Custom | Use slotProps | ISO string ↔ Date conversion |
| Time input | TimePicker (@mui/x-date-pickers) | ⚠️ Custom | Use slotProps | ISO string ↔ Date conversion |
| DateTime input | DateTimePicker (@mui/x-date-pickers) | ⚠️ Custom | Use slotProps | ISO string ↔ Date conversion |
| StringEnum (Autocomplete) | Autocomplete | ⚠️ Custom | value/onChange mapping | Value structure conversion |
| File Upload | - | ⚠️ Custom | Button + hidden input | onFileAttach integration |

### ❌ Replacement required (Priority 3)

| Schema Form requirement | MUI component | Compatibility | Replacement | Notes |
|---------------------|-------------|--------|----------|------|
| Rich Text Editor | - | ❌ None | react-quill, tiptap | External library |
| Color Picker | - | ❌ None | react-color, mui-color | External library |
| Slider (Range) | Slider | ⚠️ Custom | value/onChange mapping | Single-value/range handling |

**Recommended implementation order**:
1. P1 (9 basic FormTypes) - 1-2 days
2. P2 (DatePicker, Autocomplete, etc.) - 2-3 days
3. P3 (Rich Text, etc.) - Optional

**Total estimated development time**: 5-7 days (including tests)
```

**Step 2: Confirm Special Notes**

```markdown
## MUI v6 Special Notes

### 1. DatePicker slotProps pattern
MUI DatePicker uses TextField internally, so pass accessibility attributes through slotProps:

```typescript
<DatePicker
  value={value ? new Date(value) : null}
  onChange={(newDate) => onChange(newDate?.toISOString())}
  slotProps={{
    textField: {
      id: path,
      name: name,
      required: required,
      disabled: disabled,
      error: hasError,
      helperText: errorMessage,
    },
  }}
/>
```

### 2. sx prop styling
Use MUI's sx prop for consistent styling:

```typescript
<Box sx={{ pl: depth * 2, mb: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
  {children}
</Box>
```

### 3. Theme integration
Respect the user's MUI Theme:

```typescript
import { useTheme } from '@mui/material/styles';

const FormGroup = ({ depth, Input }: FieldRendererProps) => {
  const theme = useTheme();

  return (
    <Box sx={{
      pl: depth * theme.spacing(2),  // Use theme spacing
      borderColor: theme.palette.divider,
    }}>
      <Input />
    </Box>
  );
};
```

### 4. Dependency versions
```json
{
  "peerDependencies": {
    "@mui/material": ">=6.0.0 <7.0.0",
    "@mui/x-date-pickers": ">=7.0.0 <8.0.0",  // When using DatePicker
    "react": ">=18.0.0",
    "@canard/schema-form": "*"
  }
}
```
```

**Step 3: Accessibility Verification**

```markdown
## MUI Accessibility Checklist

### ✅ Required ARIA Attributes

**TextField**:
```typescript
<TextField
  id={path}                          // ✅ Unique ID (WCAG 4.1.1)
  name={name}                        // ✅ name attribute
  label={label}                      // ✅ Label (WCAG 1.3.1)
  required={required}                // ✅ required (WCAG 3.3.2)
  error={hasError}                   // ✅ error state
  helperText={errorMessage}          // ✅ Error message (WCAG 3.3.1)
  aria-describedby={`${path}-helper`} // ✅ Helper text association
/>
```

**Checkbox**:
```typescript
<FormControlLabel
  control={
    <Checkbox
      id={path}
      name={name}
      checked={value ?? false}
      required={required}
      aria-required={required}
    />
  }
  label={label}  // ✅ Checkbox label (WCAG 1.3.1)
/>
```

**RadioGroup**:
```typescript
<FormControl component="fieldset" required={required}>
  <FormLabel component="legend">{label}</FormLabel>  {/* ✅ Group label */}
  <RadioGroup
    name={name}
    value={value ?? ''}
    onChange={(e) => onChange(e.target.value)}
  >
    {options.map(option => (
      <FormControlLabel
        key={option.value}
        value={option.value}
        control={<Radio />}
        label={option.label}  {/* ✅ Each radio label */}
      />
    ))}
  </RadioGroup>
</FormControl>
```

### 🎹 Keyboard Navigation

**Default behavior** (supported by MUI by default):
- Tab: Move to the next field ✅
- Shift+Tab: Move to the previous field ✅
- Enter: Submit the form (type="submit" button) ✅
- Space: Toggle checkbox/radio ✅
- Arrow keys: Move within a radio group ✅

**DatePicker special behavior**:
- Enter: Open the date picker
- Esc: Close the date picker
- Arrow keys: Date navigation

### 🖥️ Screen Reader Testing

**Recommended testing tools**:
- NVDA (Windows) - Free
- JAWS (Windows) - Paid
- VoiceOver (macOS) - Built in

**Test scenarios**:
1. Whether form field labels are read correctly
2. Whether error messages are read in association with the field
3. Whether a required field is announced as "required"
4. Whether checkbox/radio state is read correctly
```

**Result summary**:
```markdown
## MUI v6 plugin development ready

### ✅ Verified items
- 9 basic FormTypes can be supported directly
- 5 additional FormTypes such as DatePicker can be supported with customization
- All accessibility requirements can be met
- MUI Theme integration is possible

### 📋 Next steps
1. Set up the project structure (use the recommended structure)
2. Implement the 9 P1 FormTypes (react-plugin-implementation skill)
3. Implement custom FormTypes such as the P2 DatePicker
4. Write Storybook stories
5. Accessibility testing

### ⚠️ Cautions
- @mui/x-date-pickers is a separate peer dependency
- Use the slotProps pattern consistently
- Use Theme spacing for consistent styling
```

### Scenario 2: Ant Design v5 Plugin Compatibility Verification

**Situation**: Developing a plugin based on Ant Design v5

**Step 1: Compatibility Analysis**

```markdown
## Ant Design v5 Compatibility Analysis

### ✅ Directly usable (Priority 1)

| Schema Form requirement | Ant Design component | Compatibility | Implementation | Special notes |
|---------------------|-------------------|--------|----------|---------|
| String input (basic) | Input | ✅ Direct | defaultValue | - |
| Number input | InputNumber | ✅ Direct | defaultValue | - |
| Boolean (Checkbox) | Checkbox | ✅ Direct | defaultChecked | - |
| Boolean (Switch) | Switch | ✅ Direct | defaultChecked | - |
| String (Multiline) | Input.TextArea | ✅ Direct | defaultValue | - |
| StringEnum (Radio) | Radio.Group | ✅ Direct | defaultValue | - |
| StringEnum (Select) | Select | ✅ Direct | defaultValue | - |
| Date input | DatePicker | ⚠️ Custom | dayjs conversion | dayjs required |
| Time input | TimePicker | ⚠️ Custom | dayjs conversion | dayjs required |

### ⚠️ Customization required (Priority 2)

| Schema Form requirement | Ant Design component | Compatibility | Implementation | Required work |
|---------------------|-------------------|--------|----------|----------|
| StringEnum (Autocomplete) | AutoComplete | ⚠️ Custom | options mapping | Value structure conversion |
| Number (Slider) | Slider | ⚠️ Custom | - | Single-value/range handling |
| File Upload | Upload | ⚠️ Custom | customRequest | onFileAttach integration |
| Color Picker | ColorPicker | ✅ Direct | - | Built-in support in v5.5+ |

### 🚨 Important: Do not use Form.Item

Do **not use** Ant Design's Form.Item. @canard/schema-form manages form layout and validation.

```typescript
// ❌ Incorrect approach (using Form.Item)
<Form.Item label="Name" name="name" rules={[{ required: true }]}>
  <Input />
</Form.Item>

// ✅ Correct approach (use the component only)
<Input
  id={path}
  name={name}
  defaultValue={defaultValue}
  onChange={(e) => onChange(e.target.value)}
  status={hasError ? 'error' : undefined}
/>
```

**Reason**:
1. @canard/schema-form manages validation based on JSON Schema
2. Form.Item's name and rules cause duplication/conflicts
3. The FormGroup, FormLabel, and FormErrorMessage renderers handle the layout
```

**Step 2: Ant Design Special Notes**

```markdown
## Ant Design v5 Special Notes

### 1. Required dayjs dependency

Ant Design v5 uses dayjs for date handling (moment.js removed):

```json
{
  "dependencies": {
    "dayjs": "^1.11.10"
  },
  "peerDependencies": {
    "antd": ">=5.0.0 <6.0.0",
    "react": ">=18.0.0",
    "@canard/schema-form": "*"
  }
}
```

**DatePicker implementation**:
```typescript
import dayjs, { Dayjs } from 'dayjs';
import { DatePicker } from 'antd';

function FormTypeInputDate(props: FormTypeInputProps<string>) {
  const { value, defaultValue, onChange, ...rest } = props;

  return (
    <DatePicker
      {...rest}
      defaultValue={defaultValue ? dayjs(defaultValue) : undefined}
      value={value ? dayjs(value) : null}
      onChange={(date: Dayjs | null) => {
        onChange(date ? date.toISOString() : undefined);
      }}
    />
  );
}
```

### 2. Showing errors with the status prop

Ant Design uses the `status` prop instead of an `error` prop:

```typescript
<Input
  status={hasError ? 'error' : undefined}  // ✅ status prop
/>

// ❌ there is no error prop
<Input error={hasError} />  // does not work
```

### 3. Theme through ConfigProvider

Respect the user's Ant Design theme:

```typescript
import { ConfigProvider, theme } from 'antd';

// Use the theme configured by the user
const { token } = theme.useToken();

<div style={{ padding: token.padding }}>
  {children}
</div>
```

### 4. Special handling for the Upload component

Upload wires onFileAttach through customRequest:

```typescript
import { Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

function FormTypeInputFile(props: FormTypeInputProps<string>) {
  const { onChange, onFileAttach, value } = props;

  return (
    <Upload
      maxCount={1}
      customRequest={({ file, onSuccess }) => {
        // Attach the File object to schema-form
        onFileAttach(file as File);

        // Store the file name as the value
        onChange((file as File).name);

        onSuccess?.('ok');
      }}
      fileList={value ? [{ uid: '-1', name: value, status: 'done' }] : []}
    >
      <Button icon={<UploadOutlined />}>Click to Upload</Button>
    </Upload>
  );
}
```
```

**Step 3: Accessibility Verification**

```markdown
## Ant Design Accessibility Verification

### ✅ Built-in accessibility support

Ant Design v5 handles most accessibility attributes automatically, but some must be added manually:

**Input**:
```typescript
<Input
  id={path}                    // ✅ Unique ID
  name={name}                  // ✅ name attribute
  aria-required={required}     // ⚠️ Manual addition required
  aria-invalid={hasError}      // ⚠️ Manual addition required
  aria-describedby={hasError ? `${path}-error` : undefined}  // ⚠️ Manual
  status={hasError ? 'error' : undefined}
/>
```

**Checkbox**:
```typescript
<Checkbox
  id={path}
  name={name}
  checked={value ?? false}
  aria-required={required}     // ⚠️ Manual addition required
>
  {label}
</Checkbox>
```

**Select**:
```typescript
<Select
  id={path}
  defaultValue={defaultValue}
  onChange={onChange}
  aria-required={required}     // ⚠️ Manual addition required
  aria-invalid={hasError}      // ⚠️ Manual addition required
  status={hasError ? 'error' : undefined}
>
  {options.map(opt => (
    <Select.Option key={opt.value} value={opt.value}>
      {opt.label}
    </Select.Option>
  ))}
</Select>
```

### ⚠️ Caution: FormLabel must be implemented directly

Because Ant Design's Form.Item is not used, handle the label in the FormLabel renderer:

```typescript
const FormLabel = ({
  children,
  htmlFor,
  id,
  required,
  style,
  className,
}: LabelRendererProps) => (
  <label
    htmlFor={htmlFor}
    id={id}
    style={{ display: 'block', marginBottom: '8px', fontWeight: 500, ...style }}
    className={className}
  >
    {children}
    {required && (
      <span aria-hidden style={{ color: 'red', marginLeft: '4px' }}>
        *
      </span>
    )}
  </label>
);
```

### 🎹 Keyboard Navigation

Ant Design supports keyboard navigation by default:
- Tab/Shift+Tab: Move between fields ✅
- Enter: Submit the form ✅
- Space: Toggle checkbox/switch ✅
- Arrow keys: Move between Select/Radio options ✅

### 📝 Accessibility Test Checklist

- [ ] Confirm id, name, and aria-required on every Input
- [ ] When an error occurs, add aria-invalid and aria-describedby
- [ ] Confirm FormLabel is associated with Input via htmlFor
- [ ] Test that every field is reachable by keyboard alone
- [ ] Test that a screen reader reads labels and error messages
```

**Result summary**:
```markdown
## Ant Design v5 plugin development ready

### ✅ Verified items
- 9 basic FormTypes supported (DatePicker uses dayjs conversion)
- ColorPicker supported by default (v5.5+)
- Upload component can be supported with customization

### ⚠️ Cautions
- Never use Form.Item
- dayjs peer dependency is required
- Use the status prop (there is no error prop)
- Some ARIA attributes must be added manually

### 📋 Next steps
1. Add the dayjs dependency
2. Implement the FormLabel and FormErrorMessage renderers directly
3. Manually add ARIA attributes to every component
4. Accessibility testing (screen reader, keyboard)
```

### Scenario 3: Chakra UI v2 Plugin Compatibility Verification

**Situation**: Developing a plugin based on Chakra UI v2

**Step 1: Compatibility Analysis**

```markdown
## Chakra UI v2 Compatibility Analysis

### ✅ Directly usable (Priority 1)

| Schema Form requirement | Chakra UI component | Compatibility | Implementation | Special notes |
|---------------------|------------------|--------|----------|---------|
| String input (basic) | Input | ✅ Direct | defaultValue | FormControl wrapping |
| Number input | NumberInput | ✅ Direct | defaultValue | - |
| Boolean (Checkbox) | Checkbox | ✅ Direct | defaultChecked | - |
| Boolean (Switch) | Switch | ✅ Direct | defaultChecked | - |
| String (Multiline) | Textarea | ✅ Direct | defaultValue | - |
| StringEnum (Radio) | RadioGroup | ✅ Direct | defaultValue | - |
| StringEnum (Select) | Select | ✅ Direct | defaultValue | - |

### ⚠️ Customization required (Priority 2)

| Schema Form requirement | Chakra UI component | Compatibility | Implementation | Required work |
|---------------------|------------------|--------|----------|----------|
| Number (Slider) | Slider | ⚠️ Custom | - | Single-value/range handling |
| File Upload | - | ❌ None | Input (type="file") | Custom styling |
| Color Picker | - | ❌ None | react-colorful | External library |

### ❌ Replacement required (Priority 3)

| Schema Form requirement | Chakra UI component | Compatibility | Replacement | Notes |
|---------------------|------------------|--------|----------|------|
| Date Picker | - | ❌ None | react-datepicker + Chakra style | Chakra has no DatePicker |
| Rich Text Editor | - | ❌ None | tiptap + Chakra style | External library |

**Key difference**: Chakra UI has no DatePicker/TimePicker, so an external library is required
```

**Step 2: Chakra UI Special Notes**

```markdown
## Chakra UI v2 Special Notes

### 1. FormControl wrapping pattern (required)

Chakra UI wraps fields with FormControl so accessibility is handled automatically:

```typescript
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
} from '@chakra-ui/react';
import { useFieldErrors } from '@canard/schema-form';

function FormTypeInputString(props: FormTypeInputProps<string>) {
  const { node, path, name, jsonSchema, required, value, defaultValue, onChange } = props;

  const label = jsonSchema.label || jsonSchema.title || name;
  const { errorMessage } = useFieldErrors(node);
  const hasError = errorMessage != null;

  return (
    <FormControl isRequired={required} isInvalid={hasError}>
      <FormLabel htmlFor={path}>{label}</FormLabel>
      <Input
        id={path}
        name={name}
        defaultValue={defaultValue}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
      {hasError && <FormErrorMessage>{errorMessage}</FormErrorMessage>}
      {jsonSchema.description && (
        <FormHelperText>{jsonSchema.description}</FormHelperText>
      )}
    </FormControl>
  );
}
```

An input reads error state with `useFieldErrors(node)` instead of props. The hook makes that input re-render on its field's error changes, so call it only in inputs that display error state themselves.

**Advantages of FormControl**:
- `isRequired` → automatically shows `*` on the label
- `isInvalid` → automatically applies the error style to Input
- `htmlFor` → automatically associates FormLabel with Input
- ARIA attributes are added automatically

### 2. NumberInput's special structure

NumberInput is a compound component:

```typescript
import { NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper } from '@chakra-ui/react';

<NumberInput
  defaultValue={defaultValue}
  value={value ?? undefined}
  onChange={(valueString, valueNumber) => onChange(valueNumber)}
  min={jsonSchema.minimum}
  max={jsonSchema.maximum}
>
  <NumberInputField id={path} name={name} />
  <NumberInputStepper>
    <NumberIncrementStepper />
    <NumberDecrementStepper />
  </NumberInputStepper>
</NumberInput>
```

### 3. DatePicker integration (react-datepicker)

Chakra UI has no DatePicker, so wrap react-datepicker in a Chakra style:

```typescript
import ReactDatePicker from 'react-datepicker';
import { Input, useColorMode } from '@chakra-ui/react';
import 'react-datepicker/dist/react-datepicker.css';

function ChakraDatePicker({ value, onChange, ...props }: any) {
  const { colorMode } = useColorMode();

  return (
    <ReactDatePicker
      selected={value ? new Date(value) : null}
      onChange={(date: Date | null) => {
        onChange(date ? date.toISOString() : undefined);
      }}
      customInput={
        <Input
          {...props}
          bg={colorMode === 'dark' ? 'gray.700' : 'white'}
        />
      }
    />
  );
}
```

**Add dependencies**:
```json
{
  "dependencies": {
    "react-datepicker": "^4.21.0",
    "@types/react-datepicker": "^4.19.0"
  }
}
```

### 4. useColorMode integration

Chakra UI dark mode support:

```typescript
import { useColorMode } from '@chakra-ui/react';

const FormGroup = ({ depth, Input }: FieldRendererProps) => {
  const { colorMode } = useColorMode();

  return (
    <Box
      pl={depth * 4}
      borderLeft="2px solid"
      borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
      bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'}
    >
      <Input />
    </Box>
  );
};
```
```

**Step 3: Accessibility Verification**

```markdown
## Chakra UI Accessibility Verification

### ✅ FormControl automatic accessibility handling

Chakra UI's FormControl automatically adds most accessibility attributes:

**Attributes added automatically**:
```typescript
<FormControl isRequired={true} isInvalid={true}>
  <FormLabel htmlFor="name">Name</FormLabel>
  <Input id="name" name="name" />
  <FormErrorMessage>Name is required</FormErrorMessage>
</FormControl>
```

**Rendered HTML** (generated automatically):
```html
<div role="group">
  <label for="name" class="chakra-form__label">
    Name
    <span role="presentation" aria-hidden="true" class="chakra-form__required-indicator">*</span>
  </label>
  <input
    id="name"
    name="name"
    aria-required="true"
    aria-invalid="true"
    aria-describedby="name-feedback"
    class="chakra-input"
  />
  <div id="name-feedback" class="chakra-form__error-message">
    Name is required
  </div>
</div>
```

**Automatically handled items**:
- ✅ `aria-required` (from the isRequired prop)
- ✅ `aria-invalid` (from the isInvalid prop)
- ✅ `aria-describedby` (FormErrorMessage association)
- ✅ `htmlFor` association (FormLabel)
- ✅ `*` indicator (when required)

### 🎹 Keyboard Navigation

Chakra UI supports complete keyboard navigation:
- Tab/Shift+Tab: Move between fields ✅
- Enter: Submit the form ✅
- Space: Toggle checkbox/switch ✅
- Arrow keys: Operate Radio, Select, and NumberInput ✅

### 🌗 Dark mode accessibility

Chakra UI's dark mode automatically guarantees WCAG contrast ratios:

```typescript
import { useColorModeValue } from '@chakra-ui/react';

const FormGroup = ({ Input }: FieldRendererProps) => {
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box bg={bgColor} borderColor={borderColor}>
      <Input />
    </Box>
  );
};
```

### 📝 Accessibility Test Checklist

- [x] Wrap every field with FormControl
- [x] Use the isRequired and isInvalid props
- [x] Use FormLabel and FormErrorMessage
- [x] Keyboard navigation testing
- [x] Screen reader testing
- [x] Check dark mode contrast ratios
```

**Result summary**:
```markdown
## Chakra UI v2 plugin development ready

### ✅ Strengths
- FormControl's automatic accessibility handling (best in class)
- Complete dark mode support
- Concise API (isRequired, isInvalid)
- Complete keyboard navigation

### ⚠️ Weaknesses
- No DatePicker (react-datepicker integration required)
- No TimePicker
- No ColorPicker
- Additional dependencies required

### 📋 Next steps
1. Integrate react-datepicker and apply Chakra styles
2. Apply the FormControl pattern consistently
3. Support dark mode with useColorMode
4. Verify automatic accessibility handling
```

### Scenario 4: Headless UI + Tailwind CSS Plugin Compatibility Verification

**Situation**: Developing a plugin that combines Headless UI and Tailwind CSS

**Compatibility Analysis**:

```markdown
## Headless UI + Tailwind CSS Compatibility Analysis

### ⚠️ Special case: unstyled components

Headless UI components are fully headless and have no styles at all, so:
- Every style must be written directly in Tailwind CSS
- Accessibility is handled automatically (a strength of Headless UI)
- There is no wrapper like FormControl → implement it directly

### ✅ Headless UI can be used

| Purpose | Headless UI component | Implementation |
|------|---------------------|----------|
| StringEnum (Select) | Listbox | Full accessibility support |
| StringEnum (Autocomplete) | Combobox | Search plus accessibility |
| Boolean (Toggle) | Switch | Automatic accessibility handling |
| Radio Group | RadioGroup | Automatic accessibility handling |

### 🔧 Direct implementation required

| Purpose | Implementation | Notes |
|------|----------|------|
| String input | `<input>` + Tailwind | Add styles only |
| Number input | `<input type="number">` + Tailwind | Add styles only |
| Textarea | `<textarea>` + Tailwind | Add styles only |
| Checkbox | `<input type="checkbox">` + Tailwind | Custom styling |
| DatePicker | react-datepicker + Tailwind | External library |

**Conclusion**: Headless UI + Tailwind is **for advanced users**
- Advantages: complete style freedom, small bundle size
- Disadvantages: write every style yourself, longer development time
```

**Recommendations**:
```markdown
## Recommendations

### ✅ Headless UI + Tailwind is recommended for
- Teams familiar with Tailwind CSS
- Complete design customization is required
- Minimizing bundle size comes first

### ⚠️ Not recommended for
- Rapid prototyping is required
- There is no design system
- Insufficient Tailwind CSS experience

### 💡 Alternative
If the conditions above apply, MUI, Ant Design, or Chakra UI is recommended
```

### Scenario 5: Multiple UI Library Comparison and Selection Guide

**Situation**: Choosing the UI library best suited to the project

**Comparison table**:

```markdown
## Comprehensive UI Library Comparison

| Criterion | MUI v6 | Ant Design v5 | Chakra UI v2 | Headless UI + TW |
|------|--------|---------------|--------------|------------------|
| **Basic components** | ✅ Complete (9/9) | ✅ Complete (9/9) | ✅ Complete (9/9) | ⚠️ Manual (5/9) |
| **DatePicker** | ✅ Available (@mui/x) | ✅ Available (dayjs) | ❌ None | ❌ None |
| **Accessibility** | ✅ Excellent | ⚠️ Manual addition | ✅ Best (automatic) | ✅ Excellent (headless) |
| **Dark mode** | ✅ Theme | ✅ ConfigProvider | ✅ Complete (built in) | 🔧 Manual (TW) |
| **Bundle size** | 🟡 Medium (300KB+) | 🟡 Medium (400KB+) | 🟢 Small (200KB+) | 🟢 Smallest (50KB+) |
| **TypeScript** | ✅ Complete | ✅ Excellent | ✅ Excellent | ✅ Excellent |
| **Learning curve** | 🟡 Medium | 🟡 Medium | 🟢 Easy | 🔴 Difficult |
| **Community** | ✅ Largest | ✅ Large | 🟡 Medium | 🟢 Growing |
| **Design freedom** | 🟡 Limited (sx) | 🟡 Limited (style) | 🟢 High (props) | ✅ Maximum (TW) |
| **Development speed** | ✅ Fast | ✅ Fast | ✅ Fast | 🟡 Slow |

**Recommendation ranking**:

1. **MUI v6** - the safest choice
   - 👍 Complete component set
   - 👍 DatePicker supported by default
   - 👍 Largest community
   - 👎 Large bundle size
   - 👎 Limited design customization

2. **Chakra UI v2** - the best accessibility
   - 👍 FormControl automatic accessibility
   - 👍 Complete dark mode
   - 👍 Concise API
   - 👍 Small bundle
   - 👎 No DatePicker

3. **Ant Design v5** - enterprise grade
   - 👍 Rich component set
   - 👍 DatePicker supported by default
   - 👍 Strong in the Chinese market
   - 👎 Form.Item cannot be used (caution)
   - 👎 ARIA must be added manually

4. **Headless UI + Tailwind** - for advanced users
   - 👍 Complete design freedom
   - 👍 Smallest bundle size
   - 👍 Headless accessibility
   - 👎 Every style is manual
   - 👎 Longer development time
```

**Decision tree**:

```markdown
## UI Library Selection Guide

```
Does the project need a DatePicker?
├─ Yes
│  ├─ MUI v6 ✅ (the most complete component set)
│  └─ Ant Design v5 ✅ (rich enterprise features)
│
└─ No
   ├─ Accessibility first?
   │  └─ Chakra UI v2 ✅ (best automatic accessibility)
   │
   ├─ Minimize bundle size?
   │  └─ Headless UI + Tailwind ✅ (complete freedom)
   │
   └─ Fast development?
      └─ MUI v6 ✅ (the fastest prototyping)
```
```

---

> **Best Practice**: Accessibility is required, native UI library components first
> **Integration**: Compatibility verification → implementation → testing

---

## Error Handling

```yaml
error_handling:
  severity_high:
    conditions:
      - UI library not installed (peer dependency missing)
      - Compatibility matrix missing (knowledge/ file missing)
      - Required renderer cannot be implemented (FormGroup, FormLabel, etc.)
      - Project structure setup failed
      - Accessibility requirements cannot be met
    action: |
      ❌ Fatal error - stop plugin development
      → Confirm the UI library is installed: npm list {ui-library}
      → Check the compatibility matrix: ls knowledge/compatibility-matrix.md
      → Re-review the required renderer requirements
      → Use the project structure template
      → Re-run: retry after the required conditions are met
    examples:
      - condition: "UI library missing"
        message: "❌ Error: @mui/material is not installed"
        recovery: "Install the peer dependency: npm install @mui/material @mui/x-date-pickers"
      - condition: "Required renderer unavailable"
        message: "❌ Error: FormGroup component cannot be implemented (depth prop unsupported)"
        recovery: "Replace the UI library or implement a custom wrapper"

  severity_medium:
    conditions:
      - Some FormTypes are incompatible (DatePicker, RichText, etc.)
      - Some accessibility attributes are missing (ARIA)
      - UI library version compatibility warning
      - Storybook setup failed
      - Test coverage is low
    action: |
      ⚠️  Warning - partial plugin implementation
      1. Replace incompatible FormTypes with a Fallback or an external library
      2. Manually add the missing ARIA attributes
      3. Updating the UI library version is recommended
      4. Proceed without Storybook (manual testing)
      5. Add a warning to the plugin:
         > ⚠️  WARNING: some FormTypes are unsupported
         > → {unsupported_types}
    fallback_values:
      unsupported_formtype: "Fallback or external library"
      missing_aria: "Manual addition required"
      storybook_enabled: false
    examples:
      - condition: "FormType incompatible"
        message: "⚠️  Warning: RichText FormType is unsupported (no component)"
        fallback: "Using the react-quill external library is recommended"
      - condition: "ARIA attribute missing"
        message: "⚠️  Warning: aria-required is missing on the Select component"
        fallback: "Add aria-required manually"

  severity_low:
    conditions:
      - Optional FormTypes not implemented (ColorPicker, Slider, etc.)
      - UI library Theme integration warning
      - Some Storybook stories are missing
      - Documentation is insufficient
    action: |
      ℹ️  Info: optional items omitted - implement the core plugin
      → Optional FormTypes: defer to Priority 3
      → Theme integration: use the default styles
      → Storybook: write only the required stories
      → Documentation: provide a minimal README
    examples:
      - condition: "ColorPicker not implemented"
        auto_handling: "Priority 3 FormType → optional implementation (not required)"
      - condition: "Theme integration warning"
        auto_handling: "Theme not integrated → use default styles (some inconsistency possible)"
```

