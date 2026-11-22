---
"@canard/schema-form-antd-mobile-plugin": major
---

Breaking change. The beta's built-in Switch responded to Tab, `form.focus(path)`, Space, and Enter. The built-in Switch now uses the library's pointer interaction. Register a keyboard-accessible Switch or a native checkbox if your form needs those actions.

Before, the beta applied its built-in keyboard-enabled Switch.

```tsx
<Form jsonSchema={switchSchema} />
```

After, supply a custom definition that renders a keyboard-accessible control and forwards the bound value, change handler and lock state.

```tsx
<Form jsonSchema={switchSchema} fieldInputDefinitions={[keyboardSwitch]} />
```

The built-in Slider uses pointer interaction, as it did in beta. During development the integration branch added Tab, `form.focus(path)`, key movement, and keyboard commits. That behavior was never released. If you tested that integration version, register a keyboard-accessible custom Slider to keep those actions.

```tsx
// Before, on the unreleased integration branch.
<Form jsonSchema={sliderSchema} />
// After, to retain keyboard interaction.
<Form jsonSchema={sliderSchema} fieldInputDefinitions={[keyboardSlider]} />
```

Sliders use numeric or array-item schema bounds and disable when no stop is legal. Array schemas select the range slider. Custom input IDs now use `inputId` or `getInputId(key)`; use `labelId` for the title and keep `path` for form data. Ant Design Mobile's native radio inputs do not expose a `name` prop. A custom radio input can supply a native group name. Set textarea `minRows` and `maxRows` in `presentation.FieldInputProps` to override the schema's defaults.

This release supports Ant Design Mobile 5.2 and later in the 5.x line. Stepper `formatter` and `parser` require Ant Design Mobile 5.26 or later. Install the supported version of `@canard/schema-form` alongside this plugin.

```sh
yarn add @canard/schema-form@^1.0.0 @canard/schema-form-antd-mobile-plugin@^1.0.0
```
