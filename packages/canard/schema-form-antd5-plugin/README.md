# @canard/schema-form-antd5-plugin

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()
[![Ant Design](https://img.shields.io/badge/antd-✔-blue.svg)]()
[![JSON Schema Form Plugin](https://img.shields.io/badge/JSONSchemaForm-plugin-pink.svg)]()

---

## Package Renamed

> **Note**: This package was previously published as `@canard/schema-form-antd-plugin`.
> The old package name is no longer maintained. Please use `@canard/schema-form-antd5-plugin` instead.
>
> To migrate, simply update your imports:
>
> ```bash
> # Remove old package
> yarn remove @canard/schema-form-antd-plugin
> # Install new package
> yarn add @canard/schema-form-antd5-plugin
> ```

---

## Overview

`@canard/schema-form-antd5-plugin` is a plugin for `@canard/schema-form` that provides Ant Design components.

---

## Notice

⚠️ This plugin provides pre-implemented core components commonly needed when using `@canard/schema-form` in Ant Design Mobile environments.

📌 As the plugin's purpose is to enhance development convenience, it does not include every possible component.

💡 If you need FieldInput components not included in this plugin, you can freely implement them following the official `@canard/schema-form` guidelines.

---

## How to use

```bash
yarn add @canard/schema-form @canard/schema-form-antd5-plugin
```

```tsx
import { SchemaForm, registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd5-plugin';

// Plugin will be registered globally
registerPlugin(plugin);
```

---

## Supported Components

This plugin provides the following Ant Design components:

### **[`FieldInputBooleanSwitch.tsx`](./src/fieldInputs/FieldInputBooleanSwitch.tsx)**

- **Role**: Display boolean type data as a Switch component
- **Applied when**: `type` is `"boolean"` and `inputType` is `"switch"`
- **Additional features**: Support for custom labels for `checked`/`unchecked` states, adjustable switch size

### **[`FieldInputStringCheckbox.tsx`](./src/fieldInputs/FieldInputStringCheckbox.tsx)**

- **Role**: Display string arrays as checkbox groups
- **Applied when**: `type` is `"array"`, `inputType` is `"checkbox"`, `items.type` is `"string"`, and `enum` values exist
- **Additional features**: Support for custom labels for each checkbox option

### **[`FieldInputStringSwitch.tsx`](./src/fieldInputs/FieldInputStringSwitch.tsx)**

- **Role**: Toggle between two string values using a Switch
- **Applied when**: `type` is `"string"`, `inputType` is `"switch"`, and the `enum` array has exactly 2 values
- **Additional features**: Support for custom labels per switch state, adjustable switch size

### **[`FieldInputUri.tsx`](./src/fieldInputs/FieldInputUri.tsx)**

- **Role**: Special input field for URI entry (with protocol dropdown)
- **Applied when**: `type` is `"string"` and `format` or `inputType` is `"uri"`
- **Additional features**: Protocol selection dropdown, default protocol list support (http, https, ftp, mailto, tel), custom protocol list via `presentation.FieldInputProps.protocols`

### **[`FieldInputMonth.tsx`](./src/fieldInputs/FieldInputMonth.tsx)**

- **Role**: DatePicker for month selection (month mode)
- **Applied when**: `type` is `"string"` and `format` is `"month"`
- **Additional features**: `presentation.FieldInputProps.minimum` and `maximum` (YYYY-MM) limit the selectable months, YYYY-MM format

### **[`FieldInputDate.tsx`](./src/fieldInputs/FieldInputDate.tsx)**

- **Role**: DatePicker for date selection
- **Applied when**: `type` is `"string"` and `format` is `"date"`
- **Additional features**: `presentation.FieldInputProps.minimum` and `maximum` (YYYY-MM-DD) limit the selectable dates, YYYY-MM-DD format

### **[`FieldInputTime.tsx`](./src/fieldInputs/FieldInputTime.tsx)**

- **Role**: TimePicker for time selection
- **Applied when**: `type` is `"string"` and `format` is `"time"`
- **Additional features**: Time stored in HH:mm:00Z format

### **[`FieldInputMonthRange.tsx`](./src/fieldInputs/FieldInputMonthRange.tsx)**

- **Role**: DatePicker RangePicker for month range selection (month mode)
- **Applied when**: `type` is `"array"`, `format` is `"month-range"` or `inputType` is `"monthRange"`, and `items.type` is `"string"`
- **Additional features**: `presentation.FieldInputProps.minimum` and `maximum` (YYYY-MM) limit the selectable months, returns array in [start month, end month] format

### **[`FieldInputDateRange.tsx`](./src/fieldInputs/FieldInputDateRange.tsx)**

- **Role**: DatePicker RangePicker for date range selection
- **Applied when**: `type` is `"array"`, `format` is `"date-range"` or `inputType` is `"dateRange"`, and `items.type` is `"string"`
- **Additional features**: `presentation.FieldInputProps.minimum` and `maximum` (YYYY-MM-DD) limit the selectable dates, returns array in [start date, end date] format

### **[`FieldInputTimeRange.tsx`](./src/fieldInputs/FieldInputTimeRange.tsx)**

- **Role**: DatePicker RangePicker for time range selection (time mode)
- **Applied when**: `type` is `"array"`, `format` is `"time-range"` or `inputType` is `"timeRange"`, and `items.type` is `"string"`
- **Additional features**: `presentation.FieldInputProps.minimum` and `maximum` (HH:mm:00Z) limit the selectable times, returns array in [start time, end time] format

### **[`FieldInputRadioGroup.tsx`](./src/fieldInputs/FieldInputRadioGroup.tsx)**

- **Role**: Display single selection of string or number as radio group
- **Applied when**: `type` is `"string"`, `"number"`, or `"integer"`, `inputType` is `"radio"` or `"radiogroup"`, and `enum` values exist
- **Additional features**: Support for custom labels for radio options, adjustable radio group size

### **[`FieldInputStringEnum.tsx`](./src/fieldInputs/FieldInputStringEnum.tsx)**

- **Role**: Display string or string array selection as Select dropdown
- **Applied when**:
  - `type` is `"string"` and `enum` values exist
  - or `type` is `"array"`, `items.type` is `"string"`, and `items.enum` values exist
- **Additional features**: Automatic single/multiple selection detection, support for custom labels per option

### **[`FieldInputArray.tsx`](./src/fieldInputs/FieldInputArray.tsx)**

- **Role**: Display array data as a list with dynamic add/remove capabilities
- **Applied when**: `type` is `"array"`
- **Additional features**: Add/Remove buttons with Ant Design icons, add/remove buttons hidden in read-only mode

### **[`FieldInputSlider.tsx`](./src/fieldInputs/FieldInputSlider.tsx)**

- **Role**: Input numeric values using a slider
- **Applied when**: `type` is `"number"` or `"integer"` and `inputType` is `"slider"`
- **Additional features**: Support for `minimum`, `maximum`, `multipleOf` schema properties; `presentation.FieldInputProps.lazy: false` publishes on every move instead of on release

### **[`FieldInputTextarea.tsx`](./src/fieldInputs/FieldInputTextarea.tsx)**

- **Role**: Text area for multiline text input
- **Applied when**: `type` is `"string"` and `format` or `inputType` is `"textarea"`
- **Additional features**: Support for automatic resizing via `minRows`, `maxRows`

### **[`FieldInputUnion.tsx`](./src/fieldInputs/FieldInputUnion.tsx)**

- **Role**: Text input for multi-type (`union`) schemas interpreted against effective union types
- **Applied when**: `type` is `"union"`
- **Additional features**: Holds uninterpretable drafts locally until blur, displays object/array values read-only

### **[`FieldInputString.tsx`](./src/fieldInputs/FieldInputString.tsx)**

- **Role**: Default string input field
- **Applied when**: `type` is `"string"` (fallback when other conditions don't match)
- **Additional features**: Operates as password input field when `format` is `"password"`, adjustable input field size

### **[`FieldInputNumber.tsx`](./src/fieldInputs/FieldInputNumber.tsx)**

- **Role**: InputNumber component for numeric input
- **Applied when**: `type` is `"number"` or `"integer"` (fallback when other conditions don't match)
- **Additional features**: Support for `minimum`, `maximum`, `multipleOf` schema properties, support for custom formatter/parser

### **[`FieldInputBoolean.tsx`](./src/fieldInputs/FieldInputBoolean.tsx)**

- **Role**: Display boolean values as checkboxes
- **Applied when**: `type` is `"boolean"` (fallback when other conditions don't match)
- **Additional features**: Support for `indeterminate` state for `undefined` values

---

## Input Settings

Per-input settings such as `protocols`, `lazy`, `minimum` and `maximum` above go in `presentation.FieldInputProps`; the form spreads that object into the input's props.

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

Up to 0.16.0 the built-in inputs read `options.minimum`, `maximum`, `lazy` and `protocols`. From 1.0.0-beta `options` is a closed list, so these keys belong in `presentation.FieldInputProps`; under `options` they fail the schema with the blueprint error `UNKNOWN_GROUP_KEY`.

## Component Priority

Component selection is determined by the following priority order:

1. **In-line component**: Component specified as `FieldInput` property in the schema
2. **FieldInputMap**: Component explicitly mapped to a path
3. **FieldInputDefinition**: Automatic selection through each component's `test` condition
4. **Provider FieldInputDefinition**: Component definitions provided by parent Provider
5. **Plugin**: Components from registered plugins (including this plugin)
6. **Fallback**: Default fallback components

Within the same priority level, earlier items in the array take precedence. Components in this plugin are defined in the following order:
`FieldInputBooleanSwitch` → `FieldInputStringCheckbox` → `FieldInputStringSwitch` → `FieldInputUri` → `FieldInputMonth` → `FieldInputDate` → `FieldInputTime` → `FieldInputMonthRange` → `FieldInputDateRange` → `FieldInputTimeRange` → `FieldInputRadioGroup` → `FieldInputStringEnum` → `FieldInputArray` → `FieldInputSlider` → `FieldInputTextarea` → `FieldInputUnion` → `FieldInputString` → `FieldInputNumber` → `FieldInputBoolean`

## Union input contract

- A union input reads the following when `type === 'union'`. `schemaType`: the authored list of types; core assigns no meaning to its order. `nullable`, `value`, `misfit`, `required`. `jsonSchema`: `jsonSchema.type` is the intersection of active declarations and may be absent on typeless fields. The gate-narrowed effective list is the intersection of `schemaType` and `jsonSchema.type`.
- Emitted values are either a value whose JSON type is in the effective list or `undefined`. `null` is emitted only by an explicit clear action when `nullable` is true, and an empty input emits `undefined`. Because `value` may be a mismatched value, its type is wider than `onChange`.
- Uninterpretable drafts and text undergoing IME composition are held locally by the input and revert to the node value on blur.
- Emitting a value outside the list is neither an error nor discarded. Core Rule A accepts it: if exactly one type in the list can accept the value, it converts it to that type; otherwise it keeps the value as-is and turns on the warning indicator. While a gate narrows the list, interpretation uses the narrowed list. The input observes this outcome through `misfit` on the next render. `misfit === false` does not mean validation passed.
- Treat object and array values as immutable. Emit a new reference when updating and never mutate the received value in place. Do not place non-JSON values (`undefined` keys, `Date`, etc.) inside the value.
- Do not rely on the order of the type list. Do not assume core selects the type the user intended.
- This plugin's union input does not emit `null` through a clear action (an empty input always emits `undefined`).
- This plugin's union input does not create or edit objects or arrays; received object and array values are displayed read-only.

---

## Compatibility

`@canard/schema-form-antd5-plugin` is built with ECMAScript 2020 (ES2020) syntax.

If you're using a JavaScript environment that doesn't support ES2020, you'll need to include this package in your transpilation process.

**Supported environments:**

- Node.js 14.17.0 or later
- Modern browsers (Chrome 91+, Firefox 90+, Safari 14+)

**For legacy environment support:**
Please use a transpiler like Babel to transform the code for your target environment.

---

## License

This repository is licensed under the MIT License. Please refer to the [`LICENSE`](./LICENSE) file for details.

---

## Contact

For inquiries or suggestions related to the project, please create an issue.
