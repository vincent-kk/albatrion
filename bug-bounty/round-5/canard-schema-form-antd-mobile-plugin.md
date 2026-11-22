# @canard/schema-form-antd-mobile-plugin: bug bounty round 5

5 new findings in `@canard/schema-form-antd-mobile-plugin`: 3 medium and 2 low. Items in the documents of [round 1](../round-1/canard-schema-form-antd-mobile-plugin.md), [round 2](../round-2/canard-schema-form-antd-mobile-plugin.md), [round 3](../round-3/canard-schema-form-antd-mobile-plugin.md) and [round 4](../round-4/canard-schema-form-antd-mobile-plugin.md) were treated as fixed and excluded, together with the decisions and known limits of each round's `FIXES.md`. The main session re-ran every probe: the `r5-ui-rules` folder ran 36 tests, of which 10 fail; the `r5-ids` folder ran 25 tests, of which 7 fail; the `r5-release` folder ran 4 tests, of which 2 fail. No item is a regression or a watch-list repeat.

Two items recorded in [canard-schema-form.md](canard-schema-form.md) also affect this package: item 5 (the site's install commands and compatibility table give `>=` peer ranges) and item 6 (its root declarations fail to type-check with `@types/react` 18.0.0 to 18.2.5).

Probes: [probes/canard-schema-form-antd-mobile-plugin/](probes/canard-schema-form-antd-mobile-plugin/)

- Copy a folder back to `packages/canard/schema-form-antd-mobile-plugin/src/__bounty__/<hunter-id>/` and run `yarn workspace @canard/schema-form-antd-mobile-plugin test --run src/__bounty__/<hunter-id>/`; add `--testTimeout=120000` for `r5-release`, the per-test timeout the CI runner uses. The probes import the plugin from source and `@canard/schema-form` by name (its `dist`), on React 19 in jsdom with antd-mobile 5.40.0; pointer rows stub a track width of 100.
- Failing tests that are not findings: `r5-ui-rules/sliderTable.test.tsx`, "huge range: End from unset stores Number.MAX_SAFE_INTEGER", excluded under the quality bar (see [canard-schema-form-antd5-plugin.md](canard-schema-form-antd5-plugin.md)); `r5-ids/formLabelTargets.test.tsx`, the "multiple enum select" row, a rejected hypothesis (the array schema renders a composite array input).
- `r5-rerun-plugins` holds the ports of earlier probes. The re-run of every earlier probe ran 49 tests from rounds 1 to 4, of which 7 fail, each on a recorded decision (among them the slider commit on key release, which the old probe did not send) or the replaced identifier interface; the ports pass. No earlier item regressed.

Root-cause files: `packages/canard/schema-form-antd-mobile-plugin/src/fieldInputs/`

## 1. In a layout built with `Form.Label` and `Form.Input`, or with a custom FieldRenderer that renders the bound `Label`, the radio and checkbox groups have no accessible name, and the boolean and string switches are named with the library default "开关".

- Severity: medium; the same class as [antd5 item 1](canard-schema-form-antd5-plugin.md), in this plugin's own lines. Screen readers announce the switches as "开关" (Chinese for "switch").
- Affected public API: `Form.Label`, `Form.Input` and the bound `Label`, with the RadioGroup, StringCheckbox, BooleanSwitch and StringSwitch definitions.
- Contract violated: `packages/canard/schema-form/src/components/Form/components/FormLabel/DETAIL.md:5` and `:11`; this package's `CLAUDE.md:53` and `README.md:184`.
- Root cause: these inputs read only the `aria-labelledby` prop that `src/components/FieldRenderer.tsx:81` and `:98-102` pass, never `labelId` (`FieldInputRadioGroup.tsx:44` and `:82`, `FieldInputStringCheckbox.tsx:47` and `:85`, `FieldInputBooleanSwitch.tsx:39` and `:51`, `FieldInputStringSwitch.tsx:42` and `:67`); `inputId` lands on a `div` or on a `role=switch` element, which a `label for` cannot name.
- Relation to earlier rounds: round 4 class 32; round 3 item 4 (the same library-default name symptom on the slider).
- Reopens an earlier fix: `d678aad84` (round 3 item 4 with core items 1 and 6).
- Regression of an earlier fix: no.
- Watch list: no.
- Reproduction: `r5-ids/customLayoutNames.test.tsx`, 4 of 9 tests fail: the radio, checkbox and custom-renderer rows give group names `[]`, and "Form.Label + Form.Input: the boolean switch is named "agree"" gives `'开关'`; the plugin-renderer controls pass. `r5-ids/formLabelTargets.test.tsx`: the string and boolean switch rows give `{ tag: 'div', focusable: true, named: false }`.
- Confidence: high; public API with jsdom and dom-accessibility-api 0.5.16.

## 2. The slider ignores `exclusiveMinimum` and `exclusiveMaximum`.

- Severity: medium; as [antd5 item 2](canard-schema-form-antd5-plugin.md). The range slider shares the helper.
- Affected public API: `FieldInputSliderDefinition` and the range slider.
- Contract violated: JSON Schema Validation 2020-12 sections [6.2.3](https://json-schema.org/draft/2020-12/json-schema-validation#section-6.2.3) and [6.2.5](https://json-schema.org/draft/2020-12/json-schema-validation#section-6.2.5); `../round-4/FIXES.md:351`; `README.md:213` mentions only inclusive bounds.
- Root cause: this package's copy of `utils/slider/getSliderBounds.ts:13-46`; `FieldInputSlider.tsx:72-81` passes only `minimum` and `maximum`.
- Reopens an earlier fix: round 4 item 2 (`c44dcaff5`, `7cb6c7ca9`), which wrote the helper.
- Regression of an earlier fix: no.
- Watch list: no.
- Reproduction: `r5-ui-rules/sliderTable.test.tsx`, describe "antd-mobile slider: exclusive bounds", stores 0, 100 and 0; expected 1, 9 and 0.1.
- Confidence: high for the behavior; medium for the exact expected value.

## 3. With `antd-mobile` 5.0.x or 5.1.x, which the peer range `^5.0.0` admits, an empty number field crashes on render, so the user cannot enter a value.

- Severity: medium. A render crash in plausible but less common usage (an application pinned to antd-mobile 5.0 or 5.1); the core's input boundary contains it, but every number or integer field that starts empty, or is cleared, shows no stepper.
- Affected public API: `plugin` (the number input for `type: 'number' | 'integer'`).
- Contract violated: `package.json:89` (`peerDependencies['antd-mobile']: ^5.0.0`) and `:72` (dependency); basic correctness.
- Root cause: `FieldInputNumber.tsx:62-64` passes `parser`, `allowEmpty` and `value={typeof value === 'number' ? value : null}` to `Stepper`. antd-mobile added `allowEmpty` and null handling in 5.2.0; in 5.1.0, `es/components/stepper/stepper.js:25-26` runs `useState(() => value.toString())`, and `es/utils/use-props-value.js` treats `null` as a controlled value, so `null.toString()` throws. `parser` and `formatter` exist only from 5.26.0. The null value dates from `5528e4026`. Evidence: the hunter read the 5.0.0, 5.1.0 and 5.2.0 sources on unpkg on 2026-11-20.
- Relation to earlier rounds: round 4 class 40 (run-time APIs newer than the documented consumer configuration) and round 2 class 5 (peer ranges against dependency ranges); the antd5 case is [antd5 item 3](canard-schema-form-antd5-plugin.md).
- Reopens an earlier fix: round 2 item 3 (`5dc256c08`), which kept the 5.0.0 floor; its decision that the peer range equals the bundled range stands.
- Regression of an earlier fix: no.
- Watch list: no.
- Reproduction: `r5-release/stepperPeerFloor.test.tsx`, where `vi.mock('antd-mobile')` runs the 5.1.0 initializer in front of the installed 5.40 Stepper and drops the props 5.1 does not know: "an empty number field renders its stepper (antd-mobile 5.0/5.1 Stepper behavior)" renders 0 stepper inputs, expected 1; "the declared antd-mobile floor accepts the null value the plugin passes" gives `acceptsNull: false` for the floor 5.0.0. The controls pass (a field with a value on the emulation, and an empty field on the real 5.40).
- Confidence: high for the mechanism; public API with an internal fixture that emulates the library surface, plus registry reads. No real antd-mobile 5.1 was installed.

## 4. A keyboard step from a stored off-grid or out-of-bounds value is stored without snapping back to the grid.

- Severity: low. It needs a stored value that is already off the grid or outside the bounds; the arrow keys never repair it, while antd5 and antd6 snap.
- Affected public API: `FieldInputSliderDefinition` and the range slider, which shares the keyboard helper.
- Contract violated: `../round-4/FIXES.md:443`; `.changeset/antd-mobile-valid-slider-grid.md:5`; equivalence with antd5 and antd6.
- Root cause: `SliderKeyboardControl.tsx:93-104` passes the stored draft to `utils/slider/getKeyboardValue.ts:42-44`, which adds one step and clamps without rounding to the grid.
- Relation to earlier rounds: round 4 item 2 and round 3 item 3; the MUI case is [MUI item 5](canard-schema-form-mui-plugin.md).
- Reopens an earlier fix: round 3 item 3 (`7087cf111`, which created `getKeyboardValue`) and round 4 item 2 (`c2e3db010`).
- Regression of an earlier fix: no. `7087cf111` created keyboard stepping without rounding, but before it the slider had no keyboard stepping at all, so no correct behavior was lost; this is a neighboring input that the fix never covered.
- Watch list: no.
- Reproduction: `r5-ui-rules/sliderTable.test.tsx`, describe "antd-mobile slider: a user step from a stored off-grid value stores a valid grid value": with `multipleOf 5`, stored 52, ArrowRight and ArrowLeft store 57 and 47; stored -3 (below the minimum), ArrowRight stores 2; stored 103 (above the maximum), ArrowLeft stores 98; "integer schema without multipleOf: stored 2.5, ArrowRight stores an integer" stores 3.5.
- Confidence: high for the behavior; medium for the expected value.

## 5. With `multipleOf` below 1e-6, a pointer press stores 0, below the minimum, instead of the pressed grid value.

- Severity: low; the same mechanism as [antd5 item 4](canard-schema-form-antd5-plugin.md). Here the stored value falls below the authored minimum.
- Affected public API: `FieldInputSliderDefinition`.
- Contract violated: `../round-4/FIXES.md:351` and `:443`; equivalence with the MUI plugin.
- Root cause: the step reaches antd-mobile's slider, which counts decimals with `String(n).split('.')` (`node_modules/antd-mobile/es/components/slider/slider.js:41-52`); the call site is `FieldInputSlider.tsx:154-166`.
- Relation to earlier rounds: round 4 item 2, whose table pinned `1e-7` for the keyboard only; round 4 class 42.
- Reopens an earlier fix: round 4 item 2.
- Regression of an earlier fix: no.
- Watch list: no.
- Reproduction: `r5-ui-rules/sliderTable.test.tsx`, describe "antd-mobile slider: pointer values are exact grid values": "'multipleOf 1e-7 at x=50'" with minimum 1e-8 stores 0, expected 5e-7. The `5e-7` rows pass in this plugin.
- Confidence: high; public API with a stubbed track width.

## Hypotheses checked and not bugs

- String switches, slider commit timing (`lazy` omitted stores once on key release), locks and the commit order against external writes behave as in the antd5 document.
- After `insert(0)`, radio items keep their checked option and distinct native names; a keyboard commit from a stored grid value stores grid values.
- Hydration under React 19 keeps every id and reference, and array moves keep ids unique.
- The plugin cannot load in plain Node in either module mode, because `antd-mobile` itself requires a CSS file; that is the dependency's design and needs a bundler.
- The `Stepper` props `parser` and `formatter`, which exist only from antd-mobile 5.26, are forwarded but are not a documented plugin option.
