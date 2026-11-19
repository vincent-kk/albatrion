# @canard/schema-form-antd-mobile-plugin

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()
[![Ant Design Mobile](https://img.shields.io/badge/antd-mobile-blue.svg)]()
[![JSON Schema Form Plugin](https://img.shields.io/badge/JSONSchemaForm-plugin-pink.svg)]()

---

## Overview

`@canard/schema-form-antd-mobile-plugin` is a plugin for `@canard/schema-form` that provides Ant Design Mobile components.

FieldRenderer composes the bound Label, Input, and ErrorMessage parts. LabelRenderer and ErrorMessageRenderer own their root elements and register as LabelRenderer and ErrorMessageRenderer. The plugin does not register an input frame.

---

## Notice

⚠️ This plugin provides pre-implemented core components commonly needed when using `@canard/schema-form` in Ant Design Mobile environments.

📌 As the plugin's purpose is to enhance development convenience, it does not include every possible component.

💡 If you need FieldInput components not included in this plugin, you can freely implement them following the official `@canard/schema-form` guidelines.

---

## How to use

```bash
yarn add @canard/schema-form @canard/schema-form-antd-mobile-plugin
```

```tsx
import { registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd-mobile-plugin';

// Plugin will be registered globally
registerPlugin(plugin);
```

---

## Supported Components

This plugin provides the following Ant Design Mobile components:

### **[`FieldInputBooleanSwitch.tsx`](./src/fieldInputs/FieldInputBooleanSwitch.tsx)**

- **Role**: Display boolean type data as a Switch component
- **Applied when**: `type` is `"boolean"` and `inputType` is `"switch"`
- **Additional features**: Support for custom labels for `checked`/`unchecked` states

### **[`FieldInputStringCheckbox.tsx`](./src/fieldInputs/FieldInputStringCheckbox.tsx)**

- **Role**: Display string arrays as checkbox groups
- **Applied when**: `type` is `"array"`, `inputType` is `"checkbox"`, `items.type` is `"string"`, and `enum` values exist
- **Additional features**: Support for custom labels for each checkbox option

### **[`FieldInputStringSwitch.tsx`](./src/fieldInputs/FieldInputStringSwitch.tsx)**

- **Role**: Toggle between two string values using a Switch
- **Applied when**: `type` is `"string"`, `inputType` is `"switch"`, and the `enum` array has exactly 2 values
- **Additional features**: Support for custom labels per switch state

### **[`FieldInputRadioGroup.tsx`](./src/fieldInputs/FieldInputRadioGroup.tsx)**

- **Role**: Display single selection of string or number as radio group
- **Applied when**: `type` is `"string"`, `"number"`, or `"integer"`, `inputType` is `"radio"` or `"radiogroup"`, and `enum` values exist
- **Additional features**: Support for custom labels for radio options

### **[`FieldInputArray.tsx`](./src/fieldInputs/FieldInputArray.tsx)**

- **Role**: Display array data as a list with dynamic add/remove capabilities
- **Applied when**: `type` is `"array"`
- **Additional features**: Add/remove buttons hidden in read-only mode

### **[`FieldInputSlider.tsx`](./src/fieldInputs/FieldInputSlider.tsx)**

- **Role**: Input numeric values using a slider
- **Applied when**:
  - `type` is `"number"` or `"integer"` and `format` is `"slider"`
  - or `type` is `"array"`, `items.type` is `"number"` or `"integer"`, and `format` is `"slider"` (range slider)
- **Additional features**: `presentation.FieldInputProps.lazy` (`false` publishes on every move) and `marks` (restricts selectable values to the marked stops). For range sliders, put numeric bounds and `multipleOf` on `items`. The schema type decides the shape: an array schema gets a range slider that only writes a two-number array, and a number schema gets a single thumb that only writes a number. `presentation.FieldInputProps.range` is ignored

### **[`FieldInputTextarea.tsx`](./src/fieldInputs/FieldInputTextarea.tsx)**

- **Role**: Text area for multiline text input
- **Applied when**: `type` is `"string"` and `format` or `inputType` is `"textarea"`
- **Additional features**: Automatic resizing uses the schema-level extensions `minRows` and `maxRows`, alongside `type` and `format`; these two settings are not read from `presentation.FieldInputProps`

### **[`FieldInputString.tsx`](./src/fieldInputs/FieldInputString.tsx)**

- **Role**: Default string input field
- **Applied when**: `type` is `"string"` (fallback when other conditions don't match)
- **Additional features**: Operates as password input field when `format` is `"password"`

### **[`FieldInputNumber.tsx`](./src/fieldInputs/FieldInputNumber.tsx)**

- **Role**: Stepper component for numeric input
- **Applied when**: `type` is `"number"` or `"integer"` (fallback when other conditions don't match)
- **Additional features**: Support for `minimum`, `maximum`, `multipleOf` schema properties

### **[`FieldInputBoolean.tsx`](./src/fieldInputs/FieldInputBoolean.tsx)**

- **Role**: Display boolean values as checkboxes
- **Applied when**: `type` is `"boolean"` (fallback when other conditions don't match)
- **Additional features**: `null` and any other non-boolean value show the `indeterminate` state; an unset (`undefined`) value shows an unchecked box

---

## Switch keyboard access

`formRef.current.focus(path)` reaches the switch’s `data-focus-target` element.

Boolean and string switch inputs receive focus when clicked and participate in the natural Tab order. Space and Enter toggle the focused switch once per press through the same value mapping as a click; holding a key does not toggle repeatedly, and Space does not scroll the page. Disabled switches cannot receive focus by click or Tab and ignore activation keys.

---

## Input Settings

Per-input settings such as `lazy` and `marks` above go in `presentation.FieldInputProps`; the form spreads that object into the input's props.

```ts
const jsonSchema = {
  type: 'object',
  properties: {
    volume: {
      type: 'number',
      format: 'slider',
      presentation: {
        FieldInputProps: { lazy: false },
      },
    },
  },
};
```

Input settings other than textarea row limits belong in `presentation.FieldInputProps`, which is forwarded to the input. Custom `options` keys are accepted without errors or warnings, but these built-in inputs do not read their settings from that group.

## Component Priority

Component selection is determined by the following priority order:

1. **In-line component**: Component specified as `FieldInput` property in the schema
2. **FieldInputMap**: Component explicitly mapped to a path
3. **FieldInputDefinition**: Automatic selection through each component's `test` condition
4. **Provider FieldInputDefinition**: Component definitions provided by parent Provider
5. **Plugin**: Components from registered plugins (including this plugin)
6. **Fallback**: Default fallback components

Within the same priority level, earlier items in the array take precedence. Components in this plugin are defined in the following order:
`FieldInputBooleanSwitch` → `FieldInputStringCheckbox` → `FieldInputStringSwitch` → `FieldInputRadioGroup` → `FieldInputSlider` → `FieldInputArray` → `FieldInputTextarea` → `FieldInputString` → `FieldInputNumber` → `FieldInputBoolean`

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

## Scoped control identifiers

Element ids are scoped to each Form. `path` remains the JSON Pointer and is never the DOM id. Custom inputs use the supplied `FieldInputProps.id`, and single-control labels use the same value for `htmlFor`. A custom `FieldRenderer` uses `labelId` on a group title or legend and `aria-labelledby` on the group; each option has its own id. `FieldInputProps.name` is always the leaf name. Radio groups use `id` as the native `name` of their radios.

```tsx
const Input = ({ id, name }: FieldInputProps<string>) => <input id={id} name={name} />;
```

Scope selectors to the intended Form, such as `formElement.querySelector('[data-path="/email"] input')`, or connect labels using the control's supplied id. Form API values retain the schema shape.

Known server-rendering limit: Stepper native input ids/names, Switch DOM ids, radio native names, and Slider thumb ids and `aria-labelledby` complete at hydration because the library exposes no prop for those native attributes. Radio option ids and Switch `aria-labelledby` are present in server HTML. Native names remain bound after option and library state updates.

## Contact

For inquiries or suggestions related to the project, please create an issue.

### Switch values and state labels

For a string switch, `enum[0]` is the checked (on) value and `enum[1]` is the unchecked (off) value.

A boolean switch accepts `presentation.FieldInputProps.alias` with optional `checked` and `unchecked` ReactNode labels. Labels use `context.checkboxLabels`, then `alias`, then no state labels. The current state label does not replace the field name.

### Unset slider values

An unset slider exposes no current value to assistive technology and stores nothing until the user acts.
