# @canard/schema-form-mui-plugin

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()
[![Material-UI](https://img.shields.io/badge/MUI-✔-007FFF.svg)]()
[![JSON Schema Form Plugin](https://img.shields.io/badge/JSONSchemaForm-plugin-pink.svg)]()

---

## Overview

`@canard/schema-form-mui-plugin` is a plugin for `@canard/schema-form` that provides Material-UI (MUI) components.

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
import { SchemaForm, registerPlugin } from '@canard/schema-form';
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
- **Additional features**: Protocol selection dropdown, default protocol list support (http, https), custom protocol list via `presentation.FieldInputProps.protocols`, support for single-colon protocols like mailto/tel

### **[`FieldInputMonth.tsx`](./src/fieldInputs/FieldInputMonth.tsx)**

- **Role**: DatePicker for month selection (month mode)
- **Applied when**: `type` is `"string"` and `format` is `"month"`
- **Additional features**: Uses MUI X DatePickers, support for `minimum`, `maximum` range limits, YYYY-MM format

### **[`FieldInputDate.tsx`](./src/fieldInputs/FieldInputDate.tsx)**

- **Role**: DatePicker for date selection
- **Applied when**: `type` is `"string"` and `format` is `"date"`
- **Additional features**: Uses MUI X DatePickers with Dayjs, support for `minimum`, `maximum` date range limits, YYYY-MM-DD format

### **[`FieldInputTime.tsx`](./src/fieldInputs/FieldInputTime.tsx)**

- **Role**: TimePicker for time selection
- **Applied when**: `type` is `"string"` and `format` is `"time"`
- **Additional features**: Uses MUI X DatePickers, time stored in HH:mm:00Z format

### **[`FieldInputRadioGroup.tsx`](./src/fieldInputs/FieldInputRadioGroup.tsx)**

- **Role**: Display single selection of string or number as radio group
- **Applied when**: `type` is `"string"`, `"number"`, or `"integer"`, `inputType` is `"radio"` or `"radiogroup"`, and `enum` values exist
- **Additional features**: Support for custom labels for radio options

### **[`FieldInputStringEnum.tsx`](./src/fieldInputs/FieldInputStringEnum.tsx)**

- **Role**: Display string or string array selection as Select dropdown
- **Applied when**: `type` is `"string"` and `enum` values exist
- **Additional features**: Material Design styling with FormControl and InputLabel, support for custom labels per option (alias)

### **[`FieldInputArray.tsx`](./src/fieldInputs/FieldInputArray.tsx)**

- **Role**: Display array data as a list with dynamic add/remove capabilities
- **Applied when**: `type` is `"array"`
- **Additional features**: Add/Remove buttons with Material-UI icons, add/remove buttons hidden in read-only mode

### **[`FieldInputSlider.tsx`](./src/fieldInputs/FieldInputSlider.tsx)**

- **Role**: Input numeric values using a slider
- **Applied when**: `type` is `"number"` or `"integer"` and `inputType` is `"slider"`
- **Additional features**: Support for `minimum`, `maximum`, `multipleOf` schema properties, lazy update option (`presentation.FieldInputProps.lazy`), mark display option, automatic value label display

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
- **Additional features**: Support for `indeterminate` state for `undefined` values, uses FormControlLabel

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

Up to 0.16.0 the Uri input fell back to `options.protocols` when the `protocols` prop was absent. From 1.0.0-beta `options` is a closed list, so this key belongs in `presentation.FieldInputProps`; under `options` it fails the schema with the blueprint error `UNKNOWN_GROUP_KEY`.

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

## Contact

For inquiries or suggestions related to the project, please create an issue.
