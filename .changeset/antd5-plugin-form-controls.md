---
"@canard/schema-form-antd5-plugin": major
---

Breaking change. Install `@canard/schema-form` 1.x with this plugin.

```sh
yarn add @canard/schema-form@^1.0.0 @canard/schema-form-antd5-plugin@^1.0.0
```

Control IDs and native radio group names now use Form-scoped identifiers. Change custom input IDs from `path` to `inputId` and use `getInputId(key)` for additional controls. Use `labelId` for the field title and keep `path` for form data. Distinct native range endpoint IDs require Ant Design 5.14 or newer. This release supports Ant Design 5.10 and later in the 5.x line and Day.js 1.x.

`form.focus(path)` reaches an editable slider thumb. Sliders respect exclusive schema bounds, disable when no stop is legal, and show an in-range stored decimal in a read-only `number` field without a required step. Read-only `integer` fields display a grid point and keep the stored value. The scoped Slider ID identifies the root. Ant Design does not expose a thumb ID prop. By default, Ant Design 5.10.x and 5.11.x save on movement key press. Ant Design 5.12 and later in the 5.x line save on key release. Pointer selection saves on release. Set `presentation.FieldInputProps.lazy` to `false` for updates during movement.

Like beta, an unset Slider exposes the library’s initial thumb position to assistive technology, such as `0` on the default range. The form value stays unset until interaction. Register a custom `FieldInput` through `fieldInputDefinitions` to omit that number.

For bounds `1e-7` to `9e-7` with `multipleOf: 1e-7`, Ant Design 5.27.0 can commit `9e-7` after a midpoint click, where the expected grid value is `5e-7`. Use a custom `FieldInput` through `fieldInputDefinitions` if you need an exact decimal grid.

Read-only selection fields lock the widget itself. Multiple Select searches translated labels and original enum values without regard to case or canonical Unicode spelling. Set textarea `minRows` and `maxRows` in `presentation.FieldInputProps` to override the schema's defaults.
