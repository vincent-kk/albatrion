# CLAUDE.md

`@canard/schema-form-antd-mobile-plugin` connects Ant Design Mobile UI components to `@canard/schema-form` with mobile optimization.

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
- `fieldInputDefinitions` — 10 mobile input component definitions (in priority order)

**FieldInput priority**: BooleanSwitch → StringCheckbox → StringSwitch → RadioGroup → Slider → Array → Textarea → String → Number → Boolean

## Schema → Component Mapping

| Condition | Component |
|------|---------|
| `type: boolean`, `inputType: switch` | Switch |
| `type: string`, `inputType: checkbox` | Checkbox Group |
| `type: string`, `inputType: switch` | String Switch |
| `type: string/integer`, `inputType: radiogroup` | Radio Group |
| `type: array` | Dynamic List |
| `format: slider` | Slider |
| `format: textarea` | Textarea |
| `format: password` | Password Input |
| `type: number/integer` | Stepper |
| `type: boolean` | Checkbox |

## Peer Dependencies

`@canard/schema-form`, `antd-mobile`, `dayjs`, React

Enum UI identities encode the raw JSON scalar, while labels and aliases use its display string. Initial selection and change payloads use the same identity mapping so null and the string "null" remain distinct.

## Verification tables

Keep local parameter tables as static array literals at the Vitest each call so the case count can be audited without executing tests. Preserve case names, row order and assertions when relocating tables or splitting files by behavior. Shared scenario runners keep their canonical imported data rather than copying it into each runner.
