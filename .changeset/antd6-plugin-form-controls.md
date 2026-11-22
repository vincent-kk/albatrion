---
"@canard/schema-form-antd6-plugin": major
---

Breaking change. Install `@canard/schema-form` 1.x with this plugin.

```sh
yarn add @canard/schema-form@^1.0.0 @canard/schema-form-antd6-plugin@^1.0.0
```

Control IDs and native radio group names now use Form-scoped identifiers. Change custom input IDs from `path` to `inputId`, use `getInputId(key)` for additional controls, and use `labelId` for the field title. Keep `path` for form data. This release supports Ant Design 6.x and Day.js 1.x.

`form.focus(path)` reaches an editable slider thumb. Sliders respect exclusive schema bounds, disable when no stop is legal, and show an in-range stored decimal in a read-only `number` field without a required step. Read-only `integer` fields display a grid point and keep the stored value. The scoped Slider ID identifies the root. By default, Ant Design 6 saves on movement key release or pointer release. Set `presentation.FieldInputProps.lazy` to `false` for updates during movement.

Like beta, an unset Slider exposes the library’s initial thumb position to assistive technology, such as `0` on the default range. The form value stays unset until interaction. Register a custom `FieldInput` through `fieldInputDefinitions` to omit that number.

For bounds `1e-7` to `9e-7` with `multipleOf: 1e-7`, Ant Design 6.2.2 can commit `9e-7` after a midpoint click, where the expected grid value is `5e-7`. Use a custom `FieldInput` through `fieldInputDefinitions` if you need an exact decimal grid.

Read-only selection fields lock the widget itself. Multiple Select searches translated labels and original enum values without regard to case or canonical Unicode spelling. Set textarea `minRows` and `maxRows` in `presentation.FieldInputProps` to override the schema's defaults.
