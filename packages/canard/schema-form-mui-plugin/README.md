# @canard/schema-form-mui-plugin

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()
[![Material-UI](https://img.shields.io/badge/MUI-✔-007FFF.svg)]()
[![JSON Schema Form Plugin](https://img.shields.io/badge/JSONSchemaForm-plugin-pink.svg)]()

---

## Overview

`@canard/schema-form-mui-plugin` is a plugin for `@canard/schema-form` that provides Material-UI (MUI) components.

FieldRenderer composes the bound Input and ErrorMessage parts without a group label; standalone labels use LabelRenderer. LabelRenderer and ErrorMessageRenderer own their root elements and register as LabelRenderer and ErrorMessageRenderer. The plugin does not register an input frame.

---

## Notice

⚠️ This plugin provides pre-implemented core components commonly needed when using `@canard/schema-form` in Ant Design Mobile environments.

📌 As the plugin's purpose is to enhance development convenience, it does not include every possible component.

💡 If you need FieldInput components not included in this plugin, you can freely implement them following the official `@canard/schema-form` guidelines.

---

## How to use

```bash
yarn add @canard/schema-form @canard/schema-form-mui-plugin
```

```tsx
import { registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-mui-plugin';

// Plugin will be registered globally
registerPlugin(plugin);
```

---

## Supported Components

This plugin provides the following Material-UI components:

### **[`FieldInputBooleanSwitch.tsx`](./src/fieldInputs/FieldInputBooleanSwitch.tsx)**

- **Role**: Display boolean type data as a Switch component
- **Applied when**: `type` is `"boolean"` and `inputType` is `"switch"`
- **Additional features**: Support for custom labels for `checked`/`unchecked` states, adjustable switch size (small, medium)

### **[`FieldInputStringCheckbox.tsx`](./src/fieldInputs/FieldInputStringCheckbox.tsx)**

- **Role**: Display string arrays as checkbox groups
- **Applied when**: `type` is `"array"`, `inputType` is `"checkbox"`, `items.type` is `"string"`, and `enum` values exist
- **Additional features**: Support for custom labels for each checkbox option

### **[`FieldInputStringSwitch.tsx`](./src/fieldInputs/FieldInputStringSwitch.tsx)**

- **Role**: Toggle between two string values using a Switch
- **Applied when**: `type` is `"string"`, `inputType` is `"switch"`, and the `enum` array has exactly 2 values
- **Additional features**: Support for custom labels per switch state

### **[`FieldInputUri.tsx`](./src/fieldInputs/FieldInputUri.tsx)**

- **Role**: Special input field for URI entry (with protocol dropdown)
- **Applied when**: `type` is `"string"` and `format` or `inputType` is `"uri"`
- **Additional features**: Protocol selection dropdown, default protocol list support (http, https), custom protocol list via `presentation.FieldInputProps.protocols`, support for single-colon protocols like mailto/tel; a value whose scheme is not in the list keeps that scheme, which the dropdown adds as an extra option

#### URI scheme preservation

URI scheme parsing follows RFC 3986 section 3.1: every syntactically valid scheme prefix is preserved with its original case and delimiter (`:` or `://`), including unlisted schemes, `localhost:3000`, and `a:b`. Values without a scheme keep no scheme. Mounting, external writes, reset, and Activity visibility changes never rewrite stored values, including stored scheme-only strings. While the address is non-empty, changing either displayed part preserves the other. Clearing the address or choosing only a scheme with an empty address publishes `undefined`; the chosen scheme stays local so typing resumes with that choice. External writes and reset display the stored scheme, or retain the last user choice when the value is undefined. Bare configured `http`, `https`, and `ftp` use `://`; other bare schemes use `:`. An explicitly configured delimiter is preserved.

### **[`FieldInputMonth.tsx`](./src/fieldInputs/FieldInputMonth.tsx)**

- **Role**: DatePicker for month selection (month mode)
- **Applied when**: `type` is `"string"` and `format` is `"month"`
- **Additional features**: Uses MUI X DatePickers, range limits through `presentation.FieldInputProps.minimum` and `maximum` (YYYY-MM; an invalid limit such as `2024-13` is ignored), YYYY-MM format

### **[`FieldInputDate.tsx`](./src/fieldInputs/FieldInputDate.tsx)**

- **Role**: DatePicker for date selection
- **Applied when**: `type` is `"string"` and `format` is `"date"`
- **Additional features**: Uses MUI X DatePickers with Dayjs, date range limits through `presentation.FieldInputProps.minimum` and `maximum` (YYYY-MM-DD; an invalid limit such as `2024-02-31` is ignored), YYYY-MM-DD format

### **[`FieldInputTime.tsx`](./src/fieldInputs/FieldInputTime.tsx)**

- **Role**: TimePicker for time selection
- **Applied when**: `type` is `"string"` and `format` is `"time"`
- **Additional features**: Uses MUI X DatePickers, time stored in HH:mm:ss format, without a time-zone offset

### **[`FieldInputRadioGroup.tsx`](./src/fieldInputs/FieldInputRadioGroup.tsx)**

- **Role**: Display single selection of string or number as radio group
- **Applied when**: `type` is `"string"`, `"number"`, or `"integer"`, `inputType` is `"radio"` or `"radiogroup"`, and `enum` values exist
- **Additional features**: Support for custom labels for radio options

### **[`FieldInputStringEnum.tsx`](./src/fieldInputs/FieldInputStringEnum.tsx)**

- **Role**: Display a string selection as Select dropdown
- **Applied when**: `type` is `"string"` and `enum` values exist
- **Additional features**: Material Design styling with FormControl and InputLabel, support for custom labels per option (alias)

### **[`FieldInputArray.tsx`](./src/fieldInputs/FieldInputArray.tsx)**

- **Role**: Display array data as a list with dynamic add/remove capabilities
- **Applied when**: `type` is `"array"`
- **Additional features**: Add/Remove buttons with Material-UI icons, add/remove buttons hidden in read-only mode

### **[`FieldInputSlider.tsx`](./src/fieldInputs/FieldInputSlider.tsx)**

- **Role**: Input numeric values using a slider
- **Applied when**: `type` is `"number"` or `"integer"` and `inputType` is `"slider"`
- **Additional features**: Support for `minimum`, `maximum`, `multipleOf` schema properties, lazy update option (`presentation.FieldInputProps.lazy`), mark display option, automatic value label display; while the form holds no value, the thumb and value label stay hidden (the thumb shows while it has keyboard focus) until the first change, and assistive technology hears `Not set` instead of the minimum (`presentation.FieldInputProps.unsetValueText` changes the phrase)

Omitting `presentation.FieldInputProps.lazy` (or setting it to `true`) stores the value on commit (key up, pointer up, or the library change-complete event); `false` stores on every move.

### **[`FieldInputTextarea.tsx`](./src/fieldInputs/FieldInputTextarea.tsx)**

- **Role**: Text area for multiline text input
- **Applied when**: `type` is `"string"` and `format` or `inputType` is `"textarea"`
- **Additional features**: Support for automatic resizing via `minRows`, `maxRows`

### **[`FieldInputString.tsx`](./src/fieldInputs/FieldInputString.tsx)**

- **Role**: Default string input field
- **Applied when**: `type` is `"string"` (fallback when other conditions don't match)
- **Additional features**: Operates as password input field when `format` is `"password"`, uses Material-UI TextField

### **[`FieldInputNumber.tsx`](./src/fieldInputs/FieldInputNumber.tsx)**

- **Role**: TextField component for numeric input (number type)
- **Applied when**: `type` is `"number"` or `"integer"` (fallback when other conditions don't match)
- **Additional features**: Support for `minimum`, `maximum`, `multipleOf` schema properties

### **[`FieldInputBoolean.tsx`](./src/fieldInputs/FieldInputBoolean.tsx)**

- **Role**: Display boolean values as checkboxes
- **Applied when**: `type` is `"boolean"` (fallback when other conditions don't match)
- **Additional features**: `null` and any other non-boolean value show the `indeterminate` state; an unset (`undefined`) value shows an unchecked box; uses FormControlLabel

---

## Input Settings

Per-input settings such as `protocols` above go in `presentation.FieldInputProps`; the form spreads that object into the input's props.

```ts
const jsonSchema = {
  type: 'object',
  properties: {
    homepage: {
      type: 'string',
      format: 'uri',
      presentation: { FieldInputProps: { protocols: ['https'] } },
    },
  },
};
```

Input settings belong in `presentation.FieldInputProps`, which is forwarded to the input. Custom `options` keys are accepted without errors or warnings, but these built-in inputs do not read their settings from that group.

## Component Priority

Component selection is determined by the following priority order:

1. **In-line component**: Component specified as `FieldInput` property in the schema
2. **FieldInputMap**: Component explicitly mapped to a path
3. **FieldInputDefinition**: Automatic selection through each component's `test` condition
4. **Provider FieldInputDefinition**: Component definitions provided by parent Provider
5. **Plugin**: Components from registered plugins (including this plugin)
6. **Fallback**: Default fallback components

Within the same priority level, earlier items in the array take precedence. Components in this plugin are defined in the following order:
`FieldInputBooleanSwitch` → `FieldInputStringCheckbox` → `FieldInputStringSwitch` → `FieldInputUri` → `FieldInputMonth` → `FieldInputDate` → `FieldInputTime` → `FieldInputRadioGroup` → `FieldInputStringEnum` → `FieldInputArray` → `FieldInputSlider` → `FieldInputTextarea` → `FieldInputString` → `FieldInputNumber` → `FieldInputBoolean`

---

## Compatibility

`@canard/schema-form-mui-plugin` is built with ECMAScript 2020 (ES2020) syntax.

If you're using a JavaScript environment that doesn't support ES2020, you'll need to include this package in your transpilation process.

**Supported environments:**

- Node.js 14.17.0 or later
- Modern browsers (Chrome 91+, Firefox 90+, Safari 14+)

**For legacy environment support:**
Please use a transpiler like Babel to transform the code for your target environment.

**Dependency requirements:**

- React 18.0.0 or later (below 19.0.0)
- @mui/material 7.0.0 or later
- @mui/x-date-pickers 8.0.0 or later (for date/time related components)
- @emotion/react, @emotion/styled (MUI styling engine)
- dayjs 1.0.0 or later (for date processing)

---

## License

This repository is licensed under the MIT License. Please refer to the [`LICENSE`](./LICENSE) file for details.

---

## Scoped control identifiers

Element ids are scoped to each Form and unique across Forms and contain no whitespace. Treat their spelling as opaque: never append to, decode, or parse an id. `path` remains the JSON Pointer used for form data. Custom inputs put `inputId` on their primary control and use `getInputId(key)` for additional elements; the key is required, and numeric and string keys with the same spelling identify the same element. Use a distinct key for each option, range endpoint, thumb, protocol selector, or input-owned label. A field title uses `labelId`, referenced through `aria-labelledby`. Custom renderers receive `inputId` and `labelId` for the same field. Single-control labels target `inputId`. `name` retains the leaf name; native radio names use `inputId` so fields and Forms remain independent.

```tsx
const Input = ({ inputId, name }: FieldInputProps<string>) => (
  <input id={inputId} name={name} />
);
```

For a composite custom input, consume `labelId` and `getInputId` explicitly rather than spreading them into DOM props. A getter is stable until the field scope or path changes. Never derive ids from the leaf name or from `path`.

Scope selectors to the intended Form, such as `formElement.querySelector('[data-path="/email"] input')`, or connect labels using the control's supplied id. Form API values retain the schema shape.

## Contact

For inquiries or suggestions related to the project, please create an issue.

### Switch values and state labels

For a string switch, `enum[0]` is the checked (on) value and `enum[1]` is the unchecked (off) value.

A boolean switch accepts `presentation.FieldInputProps.alias` with optional `checked` and `unchecked` ReactNode labels. Labels use `context.checkboxLabels`, then `alias`, then no state labels. The current state label does not replace the field name.

For string switches, use the schema-level `switchLabels: [checkedLabel, uncheckedLabel]` tuple for custom state labels.

### Unset slider values

An unset slider exposes no current value to assistive technology and stores nothing until the user acts.

### Slider constraints

With `multipleOf`, selectable values are multiples of that number within the inclusive bounds. Integer sliders select only integer multiples. Without `multipleOf`, number sliders retain their authored bounds. A range with no selectable value is disabled and stores nothing.
