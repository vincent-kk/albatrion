# Accessibility Checklist

Required accessibility requirements when developing an @canard/schema-form plugin.

## Required ARIA Attributes

### Every Input Component

```typescript
<TextField
  // ✅ Required attributes
  id={path}                          // Unique ID
  name={name}                        // Used on form submit
  required={required}                // HTML required
  
  // ✅ ARIA attributes
  aria-required={required}           // For screen readers
  aria-invalid={hasError}            // Error state
  aria-describedby={hasError ? `${path}-error` : undefined}  // Links the error message
  
  // ✅ Label association
  // Connect FormLabel htmlFor={path} with id={path}
/>
```

### Error Message Association

```typescript
// Input
<TextField
  id={path}
  aria-describedby={`${path}-error`}
  aria-invalid={true}
/>

// Error
<FormHelperText
  id={`${path}-error`}  // ✅ Matching ID
  error
>
  {errorMessage}
</FormHelperText>
```

### Label Association

```typescript
// Label
<FormLabel
  htmlFor={path}  // ✅ Connected to the input ID
>
  {label}
</FormLabel>

// Input
<TextField
  id={path}  // ✅ Connected to the label htmlFor
/>
```

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
<FormLabel htmlFor="email">Email Address</FormLabel>

// ❌ Vague label
<FormLabel htmlFor="input1">Input</FormLabel>
```

### Clear Error Messages

```typescript
// ✅ Specific error
"Email address must be in format: user@example.com"

// ❌ Vague error
"Invalid input"
```

### Grouping

```typescript
// Group object types with fieldset
<fieldset>
  <legend>{jsonSchema.title || name}</legend>
  {/* children */}
</fieldset>

// Group array types as well
<div role="group" aria-labelledby={`label:${path}`}>
  <Typography id={`label:${path}`}>{name}</Typography>
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

## Accessibility Requirements by FormTypeInput

### String, Number, Textarea

```typescript
<TextField
  id={path}
  name={name}
  required={required}
  aria-required={required}
  aria-invalid={hasError}
  aria-describedby={hasError ? `${path}-error` : undefined}
  placeholder={placeholder}  // Additional hint
/>
```

### Boolean (Checkbox)

```typescript
<FormControlLabel
  control={
    <Checkbox
      id={path}
      name={name}
      required={required}
      aria-required={required}
      aria-invalid={hasError}
      aria-describedby={hasError ? `${path}-error` : undefined}
    />
  }
  label={label}  // ✅ Label is required
/>
```

### Select (Enum)

```typescript
<Select
  id={path}
  name={name}
  required={required}
  aria-required={required}
  aria-invalid={hasError}
  aria-describedby={hasError ? `${path}-error` : undefined}
  aria-label={label}  // ✅ When there is no label
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
  name={name}
  aria-labelledby={`label:${path}`}
  aria-describedby={hasError ? `${path}-error` : undefined}
  aria-required={required}
>
  <FormLabel id={`label:${path}`}>{label}</FormLabel>
  {options.map(option => (
    <FormControlLabel
      key={option.value}
      value={option.value}
      control={<Radio />}
      label={option.label}
    />
  ))}
</RadioGroup>
```

### Array (Dynamic Items)

```typescript
<Box role="group" aria-labelledby={`label:${path}`}>
  <Typography id={`label:${path}`}>{label}</Typography>
  
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

test('FormTypeInputString should have no accessibility violations', async () => {
  const { container } = render(<FormTypeInputString {...props} />);
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
- [ ] Required inputs have `aria-required`
- [ ] Error states have `aria-invalid` and `aria-describedby`
- [ ] Label and input are connected with `htmlFor`
- [ ] Error message id matches the input `aria-describedby`
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
