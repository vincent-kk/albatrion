# CLAUDE.md

`@canard/schema-form-antd5-plugin` connects Ant Design 5.x UI components to `@canard/schema-form`.

## Commands

```bash
yarn build             # ESM + CJS build + type declarations
yarn test              # Vitest tests
yarn lint              # ESLint
yarn storybook         # Storybook dev (port 6006)
```

## Architecture

The plugin exports a `SchemaFormPlugin` object:

- `FieldRenderer` composes bound input and error parts; `LabelRenderer` owns the label root.
- `ErrorMessageRenderer` owns the error root. The plugin registers `LabelRenderer` and `ErrorMessageRenderer`, with no pass-through input frame.
- `fieldInputDefinitions` — 18 input component definitions (in priority order)

**Input component categories**:

- String: text, password, textarea, URI
- Number: input, slider
- Boolean: checkbox, switch
- Date/Time: date, time, month, range
- Array: dynamic list
- Selection: radio, checkbox group, dropdown

## Schema → Component Mapping Criteria

Components are selected automatically from the `type`, `format`, `inputType`, and `enum` JSON Schema properties.

## Peer Dependencies

`@canard/schema-form`, `antd`, `dayjs`, React

Every picker (date, month, time and the three ranges) and every uncontrolled selection widget (radio group, checkbox group, select, slider) receives `disabled={disabled || readOnly}`. These widgets keep their own selection state: Ant Design's readOnly only blocks text entry and Select, Radio, Checkbox and Slider have none, so the widget would show a selection the core has already rejected. Lock updates must reach the widget.

Time and time-range parsing (`dayjs(value, 'HH:mm:00Z')`) relies on the `customParseFormat` plugin that importing antd's pickers registers on dayjs at module load, so keep the picker imports in those inputs; without them dayjs ignores the format argument and these values parse as invalid dates.

Enum UI identities encode the raw JSON scalar, while labels and aliases use its display string. Initial selection and change payloads use the same identity mapping so null and the string "null" remain distinct.

## Control identifiers

Use `FieldInputProps.inputId` on the primary focusable control and `getInputId(key)` for additional elements; the key is required. Use `labelId` for the field title and `aria-labelledby` references. Input-owned labels use a keyed address. Treat every id as opaque: never concatenate or parse it. `path` remains a JSON Pointer, and `name` remains the leaf name except native radio groups use `inputId`. Renderers receive the same `inputId` and `labelId`; no plugin context or builder reconstructs them.
