# @canard/schema-form-antd6-plugin: bug bounty round 5

3 new findings in `@canard/schema-form-antd6-plugin`: 2 medium and 1 low. Items in the documents of [round 1](../round-1/canard-schema-form-antd6-plugin.md), [round 2](../round-2/canard-schema-form-antd6-plugin.md), [round 3](../round-3/canard-schema-form-antd6-plugin.md) and [round 4](../round-4/canard-schema-form-antd6-plugin.md) were treated as fixed and excluded, together with the decisions and known limits of each round's `FIXES.md`. The main session re-ran every probe: the `r5-ui-rules` folder ran 43 tests, of which 8 fail, and the `r5-ids` folder ran 25 tests, of which 5 fail. No item is a regression or a watch-list repeat. Each item has the same mechanism as the antd5 item it cites, in this package's own lines.

Two items recorded in [canard-schema-form.md](canard-schema-form.md) also affect this package: item 5 (the site's install commands and compatibility table give `>=` peer ranges) and item 6 (its root declarations fail to type-check with `@types/react` 18.0.0 to 18.2.5).

Probes: [probes/canard-schema-form-antd6-plugin/](probes/canard-schema-form-antd6-plugin/)

- Copy a folder back to `packages/canard/schema-form-antd6-plugin/src/__bounty__/<hunter-id>/` and run `yarn workspace @canard/schema-form-antd6-plugin test --run src/__bounty__/<hunter-id>/`. The probes import the plugin from source and `@canard/schema-form` by name (its `dist`), on React 19 in jsdom with antd 6.2.2 (`@rc-component/slider` 1.0.1); pointer rows stub a track width of 100.
- Failing tests that are not findings: the `rangeCommit.test.tsx` diagnostic and the `sliderTable.test.tsx` row "huge range: End from unset stores Number.MAX_SAFE_INTEGER", with the roles stated in [canard-schema-form-antd5-plugin.md](canard-schema-form-antd5-plugin.md).
- `r5-rerun-plugins` holds the ports of earlier probes and two new diagnostics: `dateRangeMount` fails on purpose (antd 6's RangePicker needs `ResizeObserver` at mount in jsdom), and one `textareaHydration` row fails on purpose (jsdom gives the auto-sized textarea a `NaN` height; there is no hydration mismatch). The re-run of every earlier probe ran 112 tests from rounds 1 to 4, of which 14 fail, each on a recorded decision, an environment limit, the replaced identifier interface, a listed diagnostic or a listed limit; the ports pass. No earlier item regressed.

Root-cause files: `packages/canard/schema-form-antd6-plugin/src/fieldInputs/`

## 1. In a layout built with `Form.Label` and `Form.Input`, or with a custom FieldRenderer that renders the bound `Label`, the radio group, the checkbox group, the slider handle and the end input of the date, month and time ranges have no accessible name.

- Severity: medium; as [antd5 item 1](canard-schema-form-antd5-plugin.md).
- Affected public API: `Form.Label`, `Form.Input` and the bound `Label`, with the radio group, string checkbox, slider and range definitions of this plugin.
- Contract violated: as antd5 item 1, plus this package's `CLAUDE.md:51` and `README.md:276`.
- Root cause: the inputs read only the `aria-labelledby` prop that `src/components/FieldRenderer.tsx` passes, never `labelId` (`src/fieldInputs/FieldInputRadioGroup.tsx:49` and `:82`, `FieldInputStringCheckbox.tsx:51` and `:83`, and the slider and range inputs at nearly the antd5 lines).
- Relation to earlier rounds: round 4 class 32; round 3 core items 1 and 6 as this plugin adopted them.
- Reopens an earlier fix: `e501a288a` (round 3 core items 1 and 6 for this plugin), `6c98a7ac5` and `9ba0ef28c` (round 3 identifier review items 4 and 5).
- Regression of an earlier fix: no.
- Watch list: no.
- Reproduction: `r5-ids/customLayoutNames.test.tsx`, the same 5 of 9 tests as antd5 fail with the same actual values; the controls pass.
- Confidence: high; public API with jsdom and dom-accessibility-api 0.5.16.

## 2. The slider ignores `exclusiveMinimum` and `exclusiveMaximum`.

- Severity: medium; as [antd5 item 2](canard-schema-form-antd5-plugin.md).
- Affected public API: `FieldInputSliderDefinition`.
- Contract violated: JSON Schema Validation 2020-12 sections [6.2.3](https://json-schema.org/draft/2020-12/json-schema-validation#section-6.2.3) and [6.2.5](https://json-schema.org/draft/2020-12/json-schema-validation#section-6.2.5); `../round-4/FIXES.md:351`. `README.md:305` mentions only inclusive bounds.
- Root cause: this package's copy of `src/fieldInputs/utils/slider/getSliderBounds.ts:13-46` ignores the exclusive bounds, and `FieldInputSlider.tsx:39-50` passes only `minimum` and `maximum`.
- Relation to earlier rounds: round 4 grid fixes; round 3 class 21.
- Reopens an earlier fix: the round 4 grid fix siblings for this plugin (`e00f1ce99`, `2a476ff9c`).
- Regression of an earlier fix: no.
- Watch list: no.
- Reproduction: `r5-ui-rules/sliderTable.test.tsx`, describe "antd6 slider: exclusive bounds", stores 0, 100 and 0; expected 1, 9 and 0.1.
- Confidence: high for the behavior; medium for the exact expected value.

## 3. With `multipleOf` below 1e-6, a pointer press stores an endpoint or 0 instead of the pressed grid value.

- Severity: low; as [antd5 item 4](canard-schema-form-antd5-plugin.md).
- Affected public API: `FieldInputSliderDefinition`.
- Contract violated: `../round-4/FIXES.md:351` and `:443`; equivalence with the MUI plugin.
- Root cause: the step reaches `@rc-component/slider`, which counts decimals with `String(n).split('.')` (`useOffset.js:16-18`); the call site is `FieldInputSlider.tsx:121-137`.
- Relation to earlier rounds: round 4 grid fixes; round 4 class 42.
- Reopens an earlier fix: the round 4 grid fixes for this plugin.
- Regression of an earlier fix: no.
- Watch list: no.
- Reproduction: `r5-ui-rules/sliderTable.test.tsx`, describe "antd6 slider: pointer values are exact grid values": 9e-7, 1e-5 and 0, expected 5e-7, 5e-6 and 1e-6.
- Confidence: high; public API with a stubbed track width.

## Hypotheses checked and not bugs

- The antd5 document's list of checked hypotheses holds for this plugin too: string switch rows, slider commit timing, locks, commit order against external writes, keyboard snapping, date range Escape and blur, hydration and identifier checks.
- With a `ResizeObserver` stub, the date range follows same-length writes and `reset`; the textarea hydrates without a mismatch.
