---
"@canard/schema-form-antd5-plugin": major
---

Breaking change. Install `@canard/schema-form` 1.x with this plugin.

```sh
yarn add @canard/schema-form@^1.0.0 @canard/schema-form-antd5-plugin@^1.0.0
```

Control IDs and native radio group names now use Form-scoped identifiers. Change custom input IDs from `path` to `inputId` and use `getInputId(key)` for additional controls. Use `labelId` for the field title and keep `path` for form data. Distinct native range endpoint IDs require Ant Design 5.14 or newer. This release supports Ant Design 5.10 and later in the 5.x line and Day.js 1.x.

`form.focus(path)` reaches an editable slider thumb. Sliders respect exclusive schema bounds, disable when no stop is legal, and show the stored decimal in a read-only field without a required step. By default, Ant Design 5.10.x and 5.11.x save on movement key press. Ant Design 5.12 and later in the 5.x line save on key release. Pointer selection saves on release. Set `presentation.FieldInputProps.lazy` to `false` for updates during movement.

For bounds `1e-7` to `9e-7` with `multipleOf: 1e-7`, Ant Design 5.27.0 can commit `9e-7` after a midpoint click, where the expected grid value is `5e-7`. Use a custom `FieldInput` through `fieldInputDefinitions` if you need an exact decimal grid.

Read-only selection fields lock the widget itself. Enum search uses displayed labels, including translations. Set textarea `minRows` and `maxRows` in `presentation.FieldInputProps` to override the schema's defaults.
