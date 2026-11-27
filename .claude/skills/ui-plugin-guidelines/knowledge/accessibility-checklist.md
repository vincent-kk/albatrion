# Accessibility Checklist

Accessibility requirements for an @canard/schema-form plugin. Label fragments use the bound Label from FieldRendererProps; options groups reference the title supplied by that bound Label.

## Required ARIA Attributes

### Every Input Component

```typescript
<TextField
  // ✅ Required attributes
  id={inputId}                          // Unique ID
  name={name}                        // Used on form submit
  required={required}                // MUI sets required on the <input>

  // ✅ Error state
  error={hasError}                   // MUI sets aria-invalid on the <input>

  // ✅ Label association
  // Connect LabelRenderer htmlFor={inputId} with id={inputId}
/>
```

On `TextField` and `Checkbox`, MUI places ARIA props written directly on the component's wrapper element, not on the control a screen reader announces. `Select` forwards `aria-describedby` to its combobox, but `aria-label` and `aria-labelledby` written directly on it do not reach the combobox, so those go in `SelectDisplayProps`. Pass control-level ARIA through `slotProps.htmlInput` (`TextField`), `SelectDisplayProps` (`Select`) or `slotProps.input` (`Checkbox`), as the MUI plugin's inputs do.

### Error Message Association

```typescript
// Input
<TextField
  id={inputId}
  error
  slotProps={{ htmlInput: { 'aria-describedby': getInputId('error') } }}
/>

// Error (rendered by the input itself)
<FormHelperText
  id={getInputId('error')}  // ✅ Matching ID
  error
>
  {errorMessage}
</FormHelperText>
```

### Label Association

```typescript
// Label
<Label
  htmlFor={inputId}  // ✅ Connected to the input ID
>
  {label}
</Label>

// Input
<TextField
  id={inputId}  // ✅ Connected to the label htmlFor
/>
```

The element with `labelId` exists only while a FieldRenderer or `Form.Label` renders it: the bound Label, or a branch legend as in the FieldRenderer template. Under a label-free FieldRenderer, such as the MUI plugin's, an input whose control references `labelId` has no accessible name; render the input's own caption at `getInputId('legend')` and reference that instead, as the MUI plugin's picker, choice, switch and slider inputs do when they show a label.

## Keyboard Navigation

### Tab Order

- Input elements follow the natural tab order (DOM order)
- Minimize use of `tabIndex`
- `tabIndex={-1}`: programmatic focus only
- `tabIndex={0}`: natural tab order

```typescript
// ✅ Natural tab order
<TextField id="name" />
<TextField id="email" />
<Button type="submit">Submit</Button>

// ❌ Overuse of tabIndex
<TextField id="name" tabIndex={2} />
<TextField id="email" tabIndex={1} />
```

### Keyboard Events

- **Enter**: submit the form (button type="submit")
- **Escape**: close a modal (when one is open)
- **Arrow keys**: move between options in Select, Radio, and similar controls
- **Space**: toggle Checkbox and Radio

## Screen Reader Support

### Meaningful Labels

```typescript
// ✅ Clear label
<Label>Email Address</Label>

// ❌ Vague label
<Label>Input</Label>
```

### Clear Error Messages

```typescript
// ✅ Specific error
"Email address must be in format: user@example.com"

// ❌ Vague error
"Invalid input"
```

### Grouping

Use the `labelId` supplied to `FieldRendererProps` for the title and group association. Option ids come from `getInputId(index)` (packages/canard/schema-form-mui-plugin/src/fieldInputs/utils/enum/getEnumOptions.ts); never concatenate onto `inputId`. Native radio names use `inputId`. `path` is only a data pointer.

```typescript
// In a FieldRenderer branch: renderers receive labelId, not getInputId
// Group object types with fieldset
<fieldset aria-labelledby={labelId}>
  <legend id={labelId}>{jsonSchema.title || name}</legend>
  {/* children */}
</fieldset>

// Group array types as well
<div role="group" aria-labelledby={labelId}>
  <Typography id={labelId}>{name}</Typography>
  {/* children */}
</div>
```

## Color and Contrast

### Do Not Rely on Color Alone

```typescript
// ❌ Color alone
<TextField sx={{ borderColor: 'red' }} />

// ✅ Color plus icon or text
<TextField
  error
  helperText="This field is required"
  InputProps={{
    endAdornment: <ErrorIcon />
  }}
/>
```

### Contrast Ratios

- **Normal text**: at least 4.5:1
- **Large text**: at least 3:1
- **UI components**: at least 3:1

## Accessibility Requirements by FieldInput

### String, Number, Textarea

```typescript
<TextField
  id={inputId}
  name={name}
  required={required}
  error={hasError}
  placeholder={placeholder}  // Additional hint
/>
```

### Boolean (Checkbox)

```typescript
<FormControlLabel
  control={
    <Checkbox
      id={inputId}
      name={name}
      required={required}
      slotProps={{ input: { 'aria-invalid': hasError || undefined } }}
    />
  }
  label={label}  // ✅ Label is required
/>
```

### Select (Enum)

```typescript
<Select
  inputProps={{ id: getInputId('native') }}
  SelectDisplayProps={{ id: inputId, 'aria-labelledby': labelId }}  // ✅ id and accessible name on the combobox
  name={name}
  required={required}  // MUI sets aria-required on the combobox
  error={hasError}     // MUI sets aria-invalid on the combobox
>
  {options.map(option => (
    <MenuItem key={option.value} value={option.value}>
      {option.label}
    </MenuItem>
  ))}
</Select>
```

### Radio Group

```typescript
<RadioGroup
  id={inputId}
  name={inputId}
  aria-labelledby={labelId}
  aria-required={required}
>
  {options.map((option, index) => (
    <FormControlLabel
      key={option.value}
      value={option.value}
      control={<Radio id={getInputId(index)} />}
      label={option.label}
    />
  ))}
</RadioGroup>
```

### Array (Dynamic Items)

```typescript
<Box role="group" aria-labelledby={getInputId('legend')}>
  <Typography id={getInputId('legend')}>{label}</Typography>

  {items.map((item, index) => (
    <Box key={index} role="listitem">
      {/* Child component */}

      <IconButton
        aria-label={`Remove item ${index + 1}`}  // ✅ Clear label
        onClick={() => removeItem(index)}
      >
        <DeleteIcon />
      </IconButton>
    </Box>
  ))}

  <Button
    aria-label="Add new item"  // ✅ Clear label
    onClick={addItem}
  >
    Add
  </Button>
</Box>
```

## Accessibility Testing Tools

### Automated Tests
- **axe-core**: automated accessibility checks
- **jest-axe**: Jest integration
- **@storybook/addon-a11y**: Storybook accessibility checks

```typescript
// Example: jest-axe
import { axe } from 'jest-axe';

test('FieldInputString should have no accessibility violations', async () => {
  const { container } = render(<FieldInputString {...props} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Manual Tests
- **Keyboard-only navigation** (do not use a mouse)
- **Screen readers** (NVDA, JAWS, VoiceOver)
- **Browser developer tools** (Lighthouse Accessibility)

## Accessibility Checklist (Summary)

Confirm before publishing the plugin:

### Required
- [ ] Every input has `id` and `name`
- [ ] Required inputs have `required` or `aria-required` on the control itself
- [ ] Error states have `aria-invalid` on the control itself
- [ ] Label and input are connected with `htmlFor`
- [ ] An `aria-describedby` points only at an element the input itself renders with `getInputId(key)`
- [ ] ARIA props reach the announced control, checked in a render, not assumed from where they were written (for MUI: `TextField`, `Select` and `Checkbox` take them through `slotProps.htmlInput`, `SelectDisplayProps` and `slotProps.input`; `RadioGroup` and `FormGroup` are themselves the announced group, so theirs go on the root)
- [ ] Every feature is reachable by keyboard
- [ ] Tab order is logical

### Recommended
- [ ] Screen reader testing is complete
- [ ] Color contrast ratio is at least 4.5:1
- [ ] Information is not conveyed by color alone
- [ ] Grouping is applied (fieldset, role="group")
- [ ] A clear `aria-label` or label text is present
- [ ] axe-core tests pass

---

**Core principles**:
1. Required ARIA attributes on every input
2. A clear connection between label and input
3. Every feature is reachable by keyboard
4. Screen-reader-friendly text
5. Automated tests plus manual tests
