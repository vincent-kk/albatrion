# UI Library Compatibility Matrix

How to map Schema Form requirements to UI library components and analyze compatibility.

## Compatibility Grades

- ✅ **Direct**: the component can be used as-is; only minimal props mapping is required
- ⚠️ **Custom**: value conversion, wrapping, or extra logic is required
- ❌ **Missing**: the UI library has no such component; a fallback or an external library is required

## Priority Guide

- **P1 (Priority 1)**: usable directly; implement immediately
- **P2 (Priority 2)**: custom work required; include in the initial version
- **P3 (Priority 3)**: an extra library is required; second version
- **P4 (Priority 4)**: optional; third version, or omit

## Schema Form Requirements

### Basic Inputs (required)

| Requirement | type | format | Notes |
|---------|------|--------|------|
| String input | string | - | Plain text |
| Number input | number, integer | - | Numeric input |
| Boolean | boolean | - | Checkbox |
| Textarea | string | textarea | Multiline text |

### Enum/Select (required)

| Requirement | type | Condition | Notes |
|---------|------|------|------|
| String Enum | string | enum exists | Single selection |
| Multi Select | array | items.enum | Multiple selection |

### Structural Types (required)

| Requirement | type | Notes |
|---------|------|------|
| Array | array | Add and remove items dynamically |
| Object | object | Nested structure |

### Date/Time (optional)

| Requirement | type | format | Notes |
|---------|------|--------|------|
| Date | string | date | ISO 8601 |
| Time | string | time | HH:mm:ss |
| DateTime | string | date-time | ISO 8601 |

### Special Inputs (optional)

| Requirement | type | format/formType | Notes |
|---------|------|-----------------|------|
| Password | string | password | Masked |
| Email | string | email | validation |
| URL | string | url | validation |
| Color | string | color | Color picker |
| Slider | number | slider (formType) | Range selection |
| Radio Group | string/number | radio (formType) + enum | Radio buttons |

## Mapping by UI Library

### MUI (Material-UI) v5+

| Schema Form | MUI component | Compatibility | Implementation | Priority |
|------------|--------------|--------|----------|---------|
| String | TextField | ✅ Direct | defaultValue, onChange | P1 |
| Number | TextField (type="number") | ✅ Direct | inputProps.type="number" | P1 |
| Boolean | Checkbox | ✅ Direct | defaultChecked | P1 |
| Textarea | TextField (multiline) | ✅ Direct | multiline, rows | P1 |
| String Enum | Select + MenuItem | ✅ Direct | defaultValue, map enum | P1 |
| Multi Select | Select (multiple) | ✅ Direct | multiple, defaultValue array | P1 |
| Array | - | ⚠️ Custom | ChildNodeComponents + IconButton | P2 |
| Date | DatePicker (@mui/x-date-pickers) | ⚠️ Custom | Value conversion (string ↔ Date) | P2 |
| Time | TimePicker (@mui/x-date-pickers) | ⚠️ Custom | Value conversion | P2 |
| DateTime | DateTimePicker | ⚠️ Custom | Value conversion | P2 |
| Password | TextField (type="password") | ✅ Direct | type="password" | P2 |
| Email | TextField (type="email") | ✅ Direct | type="email", pattern | P2 |
| Slider | Slider | ⚠️ Custom | defaultValue, min/max | P2 |
| Radio Group | RadioGroup + FormControlLabel | ✅ Direct | map enum | P2 |
| Color | TextField (type="color") | ⚠️ Custom | Native input or an external library | P3 |
| Rich Text | - | ❌ Missing | External library (react-quill) | P4 |

**Special notes**:
- `@mui/x-date-pickers` is a separate package
- A `LocalizationProvider` wrapper is required (DatePicker and similar)
- Pass nested props through `slotProps`

### Ant Design v5+

| Schema Form | Ant Design component | Compatibility | Implementation | Priority |
|------------|---------------------|--------|----------|---------|
| String | Input | ✅ Direct | defaultValue, onChange | P1 |
| Number | InputNumber | ✅ Direct | defaultValue, onChange | P1 |
| Boolean | Checkbox | ✅ Direct | defaultChecked | P1 |
| Textarea | Input.TextArea | ✅ Direct | defaultValue, rows | P1 |
| String Enum | Select + Option | ✅ Direct | defaultValue, map enum | P1 |
| Multi Select | Select (mode="multiple") | ✅ Direct | mode="multiple" | P1 |
| Array | - | ⚠️ Custom | ChildNodeComponents + Button | P2 |
| Date | DatePicker | ⚠️ Custom | Value conversion (string ↔ dayjs) | P2 |
| Time | TimePicker | ⚠️ Custom | Value conversion | P2 |
| DateTime | DatePicker (showTime) | ⚠️ Custom | Value conversion | P2 |
| Password | Input.Password | ✅ Direct | defaultValue | P2 |
| Email | Input (type="email") | ✅ Direct | type="email" | P2 |
| Slider | Slider | ⚠️ Custom | defaultValue, min/max | P2 |
| Radio Group | Radio.Group + Radio | ✅ Direct | map enum | P2 |
| Color | ColorPicker (v5.5+) | ✅ Direct | defaultValue | P3 |
| Rich Text | - | ❌ Missing | External library | P4 |

**Special notes**:
- Do not use `Form.Item` (canard-form owns layout)
- Dates use the `dayjs` library

### Ant Design Mobile v5+

| Schema Form | Ant Design Mobile | Compatibility | Implementation | Priority |
|------------|-------------------|--------|----------|---------|
| String | Input | ✅ Direct | defaultValue, onChange | P1 |
| Number | Input (type="number") | ✅ Direct | type="number" | P1 |
| Boolean | Checkbox | ✅ Direct | defaultChecked | P1 |
| Textarea | TextArea | ✅ Direct | defaultValue, rows | P1 |
| String Enum | Picker | ⚠️ Custom | Mobile Picker pattern | P1 |
| Multi Select | CheckList | ✅ Direct | defaultValue array | P1 |
| Array | - | ⚠️ Custom | ChildNodeComponents | P2 |
| Date | DatePicker | ⚠️ Custom | Value conversion, mobile UX | P2 |
| Time | DatePicker (precision="minute") | ⚠️ Custom | Value conversion | P2 |
| Password | Input (type="password") | ✅ Direct | type="password" | P2 |
| Slider | Slider | ⚠️ Custom | defaultValue | P2 |
| Radio Group | Radio.Group | ✅ Direct | map enum | P2 |
| Color | - | ❌ Missing | Fallback Input | P4 |

**Special notes**:
- Mobile UX patterns (Popup Picker and similar)
- Touch optimization

### Chakra UI v2+

| Schema Form | Chakra UI component | Compatibility | Implementation | Priority |
|------------|-------------------|--------|----------|---------|
| String | Input | ✅ Direct | defaultValue, onChange | P1 |
| Number | NumberInput | ✅ Direct | defaultValue, onChange | P1 |
| Boolean | Checkbox | ✅ Direct | defaultIsChecked | P1 |
| Textarea | Textarea | ✅ Direct | defaultValue | P1 |
| String Enum | Select + option | ✅ Direct | defaultValue, map enum | P1 |
| Multi Select | - | ⚠️ Custom | Checkbox Group or an external library | P2 |
| Array | - | ⚠️ Custom | ChildNodeComponents + IconButton | P2 |
| Date | - | ❌ Missing | Input (type="date") fallback | P3 |
| Time | - | ❌ Missing | Input (type="time") fallback | P3 |
| Password | Input (type="password") | ✅ Direct | type="password" | P2 |
| Slider | Slider | ✅ Direct | defaultValue | P2 |
| Radio Group | RadioGroup + Radio | ✅ Direct | defaultValue, map enum | P2 |
| Color | - | ❌ Missing | Input (type="color") fallback | P3 |

**Special notes**:
- Wrapping with `FormControl` is recommended
- No date/time components (an external library is required)

## Compatibility Analysis Checklist

When evaluating a new UI library:

### Step 1: Confirm required components
- [ ] String input component
- [ ] Number input component
- [ ] Boolean (Checkbox) component
- [ ] Select/Dropdown component

### Step 2: Uncontrolled component support
- [ ] Supports `defaultValue`
- [ ] Supports `defaultChecked` (Boolean)
- [ ] Can switch between controlled and uncontrolled modes

### Step 3: Accessibility
- [ ] Supports `id` and `name`
- [ ] Supports `required` and `disabled`
- [ ] Supports ARIA attributes
- [ ] Keyboard navigation

### Step 4: Extensibility
- [ ] Date/time picker component (or a fallback is possible)
- [ ] Customizable styles
- [ ] TypeScript type definitions

---

**Evaluation criteria**:
- Step 1 fully met: plugin development is **possible**
- Step 2 partially met: plugin development is **possible** (substitute a controlled component)
- Step 3 partially met: plugin development is **possible** (add accessibility manually)
- Step 4 not met: plugin development is **possible** (use a fallback)
