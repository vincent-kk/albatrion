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
- `FieldRenderer` composes bound input and error parts without a group label; `LabelRenderer` serves standalone labels.
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
