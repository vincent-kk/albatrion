# CLAUDE.md

`@canard/schema-form-antd6-plugin` connects Ant Design 6.x UI components to `@canard/schema-form`. Use `schema-form-antd5-plugin` for v5.

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
