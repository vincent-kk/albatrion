---
"@canard/schema-form-mui-plugin": major
---

Breaking change. Install `@canard/schema-form` 1.x with this plugin.

```sh
yarn add @canard/schema-form@^1.0.0 @canard/schema-form-mui-plugin@^1.0.0
```

Sliders now save on movement keydown or pointer release by default. To keep the beta's immediate updates, set `presentation.FieldInputProps.lazy` to `false`.

```tsx
<Form jsonSchema={{ type: 'number', presentation: { inputType: 'slider', FieldInputProps: { lazy: false } } }} />
```

An unset slider announces `Not set` and hides its resting thumb until selection. Set `presentation.FieldInputProps.unsetValueText` to localize the announcement. The slider respects exclusive bounds and disables when there is no legal stop.

The first string enum value turns a Switch on and the second turns it off. Update beta enum and label tuples together when preserving their meaning. `MuiContext.switchLabels` and `MuiContext.checkboxLabels` supply default labels. String switches use the context map before a per-input `alias` map and fall back to the schema tuple when no map is supplied.

Control IDs and native radio group names now use Form-scoped identifiers. Use `inputId`, `getInputId(key)` for additional controls, and `labelId` for field titles. Keep `path` for form data. `form.focus(path)` reaches the visible enum Select, URI address, and editable date, month or time picker sections. Clicking a label focuses an enabled picker editor. The picker button opens the calendar or clock. External form writes and resets immediately replace a local Number draft. This release supports MUI 7.x and MUI X Date Pickers 8.x.
