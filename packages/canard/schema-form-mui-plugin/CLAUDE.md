# CLAUDE.md

`@canard/schema-form-mui-plugin` connects Material-UI (MUI) components to `@canard/schema-form`, including MUI X DatePickers.

## Commands

```bash
yarn build             # ESM + CJS build + type declarations
yarn test              # Vitest tests
yarn lint              # ESLint
yarn storybook         # Storybook dev (port 6006)
```

## Architecture

The plugin exports a `SchemaFormPlugin` object:

- `FieldRenderer` composes bound input and error parts with scoped group titles; `LabelRenderer` serves standalone labels.
- `ErrorMessageRenderer` owns the error root. The plugin registers `LabelRenderer` and `ErrorMessageRenderer`, with no pass-through input frame.
- `fieldInputDefinitions` — 15 input component definitions (in priority order)

**FieldInput priority**: BooleanSwitch → StringCheckbox → StringSwitch → Uri → Month → Date → Time → RadioGroup → StringEnum → Array → Slider → Textarea → String → Number → Boolean

## Context

`MuiContext` applies consistent styling: `size` (`small`|`medium`), `variant` (`outlined`|`filled`|`standard`), `fullWidth`.

## Schema → Component Mapping Criteria

Components are selected automatically from the `type`, `format`, `inputType`, and `enum` JSON Schema properties.

## Peer Dependencies

`@canard/schema-form`, `@mui/material ^7`, `@mui/x-date-pickers ^8`, `@mui/icons-material ^7`, `@emotion/react`, `@emotion/styled`, `dayjs`, React

Date, month and time pickers receive both disabled and readOnly from the form binding, including later lock changes. MUI owns the read-only interaction behavior.

Radio group, checkbox group, boolean checkbox and slider receive `disabled={disabled || readOnly}`. They keep their own selection state and MUI gives them no read-only mode, so without it a read-only form displays a choice the core has already rejected.

Enum UI identities encode the raw JSON scalar, while labels and aliases use its display string. Initial selection and change payloads use the same identity mapping so null and the string "null" remain distinct.

## Control identifiers

Use `FieldInputProps.inputId` on the primary focusable control and `getInputId(key)` for additional elements; the key is required. Use `labelId` for the field title and `aria-labelledby` references. Input-owned labels use a keyed address. Treat every id as opaque: never concatenate or parse it. `path` remains a JSON Pointer, and `name` remains the leaf name except native radio groups use `inputId`. Renderers receive the same `inputId` and `labelId`; no plugin context or builder reconstructs them.
