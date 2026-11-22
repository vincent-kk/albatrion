---
"@canard/schema-form-mui-plugin": major
---

Breaking change. Install `@canard/schema-form` 1.x with this plugin.

```sh
yarn add @canard/schema-form@^1.0.0 @canard/schema-form-mui-plugin@^1.0.0
```

Sliders now save on pointer release by default. Keyboard movement still saves on keydown. To keep beta's updates during pointer movement, set `presentation.FieldInputProps.lazy` to `false`.

```tsx
<Form jsonSchema={{ type: 'number', presentation: { inputType: 'slider', FieldInputProps: { lazy: false } } }} />
```

An unset slider announces `Not set` and hides its resting thumb until selection. Set `presentation.FieldInputProps.unsetValueText` to localize the announcement. A first selection at the initial stop stores its value, including with `lazy: false`. The slider respects exclusive bounds and disables when there is no legal stop. Page Up, Page Down, and Shift with an arrow use a jump of ten slider steps.

Decimal keyboard commits can include floating-point error. In MUI Material 7.3.1, ArrowUp at `0.2` with `multipleOf: 0.1` can commit `0.30000000000000004` instead of `0.3`, as in beta. It can also commit `0.0000012999999999999998` after ArrowUp at `1.2e-6` with `multipleOf: 1e-7`. The expected grid value is `1.3e-6`. If your form needs exact decimal values from keyboard selection, register a custom `FieldInput` through `fieldInputDefinitions`.

The first string enum value turns a Switch on and the second turns it off. Update beta enum and label tuples together when preserving their meaning. `MuiContext.switchLabels` and `MuiContext.checkboxLabels` supply default labels. String switches use the context map before a per-input `alias` map and fall back to the schema tuple when no map is supplied.

Control IDs and native radio group names now use Form-scoped identifiers. Use `inputId`, `getInputId(key)` for additional controls, and `labelId` for field titles. Keep `path` for form data. An enum Select uses distinct scoped IDs for the trigger, hidden native input and popup menu, even when multiple Forms share the same field name. `form.focus(path)` reaches the visible enum Select, URI address, and editable date, month or time picker sections. Clicking a label focuses an enabled picker editor. The picker button opens the calendar or clock. External form writes and resets immediately replace a local Number draft. This release supports MUI 7.x and MUI X Date Pickers 8.x.
