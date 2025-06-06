# @canard/schema-form-antd-mobile-plugin

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()
[![Ant Design Mobile](https://img.shields.io/badge/antd-mobile-blue.svg)]()
[![Json Schema Form Plugin](https://img.shields.io/badge/JsonSchemaForm-plugin-pink.svg)]()

---

## Overview

`@canard/schema-form-antd-mobile-plugin` is a plugin for `@canard/schema-form` that provides Ant Design Mobile components.

---

## Notice

⚠️ This plugin provides pre-implemented core components commonly needed when using `@canard/schema-form` in Ant Design Mobile environments.

📌 As the plugin's purpose is to enhance development convenience, it does not include every possible component.

💡 If you need FormTypeInput components not included in this plugin, you can freely implement them following the official `@canard/schema-form` guidelines.

---

## How to use

```bash
yarn add @canard/schema-form @canard/schema-form-antd-mobile-plugin
```

```tsx
import { SchemaForm, registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd-mobile-plugin';

// Plugin will be registered globally
registerPlugin(plugin);
```

---

## Supported Components

This plugin provides the following Ant Design Mobile components:

### **[`FormTypeInputBooleanSwitch.tsx`](./src/formTypeInputs/FormTypeInputBooleanSwitch.tsx)**

- **Role**: Display boolean type data as a Switch component
- **Applied when**: `type` is `"boolean"` and `formType` is `"switch"`
- **Additional features**: Support for custom labels for `checked`/`unchecked` states

### **[`FormTypeInputStringCheckbox.tsx`](./src/formTypeInputs/FormTypeInputStringCheckbox.tsx)**

- **Role**: Display string arrays as checkbox groups
- **Applied when**: `type` is `"array"`, `formType` is `"checkbox"`, `items.type` is `"string"`, and `enum` values exist
- **Additional features**: Support for custom labels for each checkbox option

### **[`FormTypeInputStringSwitch.tsx`](./src/formTypeInputs/FormTypeInputStringSwitch.tsx)**

- **Role**: Toggle between two string values using a Switch
- **Applied when**: `type` is `"string"`, `formType` is `"switch"`, and the `enum` array has exactly 2 values
- **Additional features**: Support for custom labels per switch state

### **[`FormTypeInputRadioGroup.tsx`](./src/formTypeInputs/FormTypeInputRadioGroup.tsx)**

- **Role**: Display single selection of string or number as radio group
- **Applied when**: `type` is `"string"`, `"number"`, or `"integer"`, `formType` is `"radio"` or `"radiogroup"`, and `enum` values exist
- **Additional features**: Support for custom labels for radio options

### **[`FormTypeInputArray.tsx`](./src/formTypeInputs/FormTypeInputArray.tsx)**

- **Role**: Display array data as a list with dynamic add/remove capabilities
- **Applied when**: `type` is `"array"`
- **Additional features**: Add/remove buttons hidden in read-only mode

### **[`FormTypeInputSlider.tsx`](./src/formTypeInputs/FormTypeInputSlider.tsx)**

- **Role**: Input numeric values using a slider
- **Applied when**:
  - `type` is `"number"` or `"integer"` and `format` is `"slider"`
  - or `type` is `"array"`, `items.type` is `"number"` or `"integer"`, and `format` is `"slider"` (range slider)
- **Additional features**: Lazy update option, mark display, range slider support

### **[`FormTypeInputTextarea.tsx`](./src/formTypeInputs/FormTypeInputTextarea.tsx)**

- **Role**: Text area for multiline text input
- **Applied when**: `type` is `"string"` and `format` or `formType` is `"textarea"`
- **Additional features**: Support for automatic resizing via `minRows`, `maxRows`

### **[`FormTypeInputString.tsx`](./src/formTypeInputs/FormTypeInputString.tsx)**

- **Role**: Default string input field
- **Applied when**: `type` is `"string"` (fallback when other conditions don't match)
- **Additional features**: Operates as password input field when `format` is `"password"`

### **[`FormTypeInputNumber.tsx`](./src/formTypeInputs/FormTypeInputNumber.tsx)**

- **Role**: Stepper component for numeric input
- **Applied when**: `type` is `"number"` or `"integer"` (fallback when other conditions don't match)
- **Additional features**: Support for `minimum`, `maximum`, `multipleOf` schema properties

### **[`FormTypeInputBoolean.tsx`](./src/formTypeInputs/FormTypeInputBoolean.tsx)**

- **Role**: Display boolean values as checkboxes
- **Applied when**: `type` is `"boolean"` (fallback when other conditions don't match)
- **Additional features**: Support for `indeterminate` state for `undefined` values

---

## Component Priority

Component selection is determined by the following priority order:

1. **In-line component**: Component specified as `FormType` property in the schema
2. **FormTypeInputMap**: Component explicitly mapped to a path
3. **FormTypeInputDefinition**: Automatic selection through each component's `test` condition
4. **Provider FormTypeInputDefinition**: Component definitions provided by parent Provider
5. **Plugin**: Components from registered plugins (including this plugin)
6. **Fallback**: Default fallback components

Within the same priority level, earlier items in the array take precedence. Components in this plugin are defined in the following order:
`FormTypeInputBooleanSwitch` → `FormTypeInputStringCheckbox` → `FormTypeInputStringSwitch` → `FormTypeInputRadioGroup` → `FormTypeInputArray` → `FormTypeInputSlider` → `FormTypeInputTextarea` → `FormTypeInputString` → `FormTypeInputNumber` → `FormTypeInputBoolean`

---

## Compatibility

`@canard/schema-form-antd-mobile-plugin` is built with ECMAScript 2020 (ES2020) syntax.

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
