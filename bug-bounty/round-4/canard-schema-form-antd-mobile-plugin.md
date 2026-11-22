# @canard/schema-form-antd-mobile-plugin: bug bounty round 4

This round confirmed 5 new findings in `@canard/schema-form-antd-mobile-plugin`: 4 of medium severity and 1 of low severity. Items in the earlier round documents ([round 1](../round-1/canard-schema-form-antd-mobile-plugin.md), [round 2](../round-2/canard-schema-form-antd-mobile-plugin.md), [round 3](../round-3/canard-schema-form-antd-mobile-plugin.md)) were treated as fixed and excluded. The main session re-ran every probe: 16 tests, of which 8 fail and 8 pass.

Probes: [probes/canard-schema-form-antd-mobile-plugin/](probes/canard-schema-form-antd-mobile-plugin/)

- From `r4-ui-mui-mobile`:
  - Probe folder in the working tree: `packages/canard/schema-form-antd-mobile-plugin/src/__bounty__/r4-ui-mui-mobile/`; the round copy is `bug-bounty/round-4/probes/canard-schema-form-antd-mobile-plugin/r4-ui-mui-mobile/`.
  - To run the copy: copy it back to `packages/canard/schema-form-antd-mobile-plugin/src/__bounty__/r4-ui-mui-mobile/` and run `yarn workspace @canard/schema-form-antd-mobile-plugin test --run --config src/__bounty__/r4-ui-mui-mobile/vitest.config.ts src/__bounty__/r4-ui-mui-mobile/`.
  - The probe-local `vitest.config.ts` extends the package's `vite.config.ts`. It puts the `source` export condition first in `resolve.conditions` and `ssr.resolve.conditions`, ahead of Vite's default conditions, and adds the `@/<name>` aliases that the workspace sources use. Every workspace package, including `@canard/schema-form` and `@canard/schema-form-ajv8-plugin`, therefore loads from source. The dist builds in the main tree predate the round 1 to 3 fixes. The hunter scanned the dependency closure of the probes (70 packages) and found no third-party package that declares a `source` export.
  - Failing tests that are not findings: none.
  - Control tests that pass:
    - `coreBuildCheck.test.tsx`: "control: the core loaded from source passes the Form-scoped FieldInputProps.id to inputs". It fails against the stale dist, which passes no `id` to inputs.
    - `rangeSliderStrictWarning.test.tsx`: both rows. They show that the AJV8 plugin loaded from source, because the documented slider schemas validate without AJV strict-mode warnings, which only the stale AJV8 dist logs.
    - `branchErrors.test.tsx`: "control: the core fallback renderer shows the checkbox group error".
    - `checkboxUnknownValue.test.tsx`: "control: the core default checkbox group keeps the unknown value when another option is checked".
    - `optionIdentifiers.test.tsx`: "IN3: inserting an item at index 0 keeps every loaded radio selection natively checked".
    - `sliderValues.test.tsx`: "control: with minimum 0 an arrow key stores a multiple of 5", and the row "ArrowRight from the stored 50".
  - Verification limits:
    - React 18 was not run.
    - The pointer case of the slider probe stubs `offsetWidth` and `getBoundingClientRect`, so that a track click maps to a known value, as the round 3 probes did.
    - Activity, StrictMode and server rendering were checked by reading the code only.

Root-cause files: `packages/canard/schema-form-antd-mobile-plugin/src/`

## 1. Validation errors of array fields, checkbox groups included, never appear on screen.

- Severity: medium. An error that blocks submission, such as `minItems` or `maxItems` on a checkbox group, is invisible, so the user cannot see why the form does not submit.
- Affected public API: `plugin.FieldRenderer`.
- Contract violated:
  - `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/troubleshooting.md:70` states that validation reports both item limits.
  - `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/field-input.md:160` states that ErrorMessage has no default content, so the renderer must pass `errorMessage`.
  - The core fallback renderer shows the same error for a branch node (`packages/canard/schema-form/src/components/FallbackComponents/components/FieldRenderer.tsx:27-43`).
- Root cause: `packages/canard/schema-form-antd-mobile-plugin/src/components/FieldRenderer.tsx:61-77` renders a branch node without its `ErrorMessage`; only the terminal path at `FieldRenderer.tsx:93` renders it. A checkbox group is an array, which is a branch node, so its errors are dropped.
- Relation to earlier rounds: New class. The same defect in MUI is [canard-schema-form-mui-plugin item 1](canard-schema-form-mui-plugin.md).
- Reopens an earlier fix: No.
- Reproduction: `branchErrors.test.tsx`, "the antd-mobile renderer shows the checkbox group error that blocks submission". `getErrors()` contains `/topics`, but the screen text does not contain "must NOT have fewer than 2 items", which is the expected text.
- Confidence: high, public API, source through a probe-local config.

## 2. With a `minimum` that is not a multiple of `multipleOf`, the slider writes only values that fail `multipleOf`.

- Severity: medium. With `minimum: 1`, `maximum: 100` and `multipleOf: 5`, a click at the middle of the track stores 51 and the field reports a validation error. The user cannot reach a valid value by pointer except at a few points such as the maximum.
- Affected public API: `FieldInputSliderDefinition`, for a number schema and for a numeric array schema with `format: 'slider'`.
- Contract violated:
  - `packages/canard/schema-form-antd-mobile-plugin/README.md:85` tells readers to put the numeric bounds and `multipleOf` of a range slider on `items`, which states that the slider applies `multipleOf`.
  - JSON Schema Validation, section 6.2.1 (`multipleOf`): https://json-schema.org/draft/2020-12/json-schema-validation#section-6.2.1
- Root cause: `packages/canard/schema-form-antd-mobile-plugin/src/fieldInputs/FieldInputSlider.tsx:78-82` takes `min` from `minimum` and `step` from `multipleOf` and starts an unset draft at `min`. The antd-mobile Slider computes every pointer position as `min + k * step`, and `packages/canard/schema-form-antd-mobile-plugin/src/fieldInputs/utils/slider/getKeyboardValue.ts:42-44` adds one step to the current draft, so the first keyboard step from an unset field stores 6.
- Relation to earlier rounds: New class. The same defect in MUI is [canard-schema-form-mui-plugin item 3](canard-schema-form-mui-plugin.md).
- Reopens an earlier fix: No. `git log -L` shows `0bdbd5add` from [round 3 item 2](../round-3/canard-schema-form-antd-mobile-plugin.md) on these lines, but that fix made the range slider read the `items` constraints and did not touch the step base.
- Reproduction: `sliderValues.test.tsx`.
  - "pointer input with minimum 1 and multipleOf 5 > a click at the middle of the track stores a value that passes multipleOf 5": the actual result is `{ value: 51, errors: 1 }`.
  - "with minimum 1, ArrowRight from an unset field stores a value that passes multipleOf 5": the actual result is `{ value: 6, errors: 1 }`.
  - The expected result is a multiple of 5 with no errors.
- Confidence: high, public API with stubbed track geometry, source through a probe-local config.

## 3. The checkbox group rewrites a stored value outside the enum as its JSON spelling when the user checks another option.

- Severity: medium. With a stored `['legacy']`, for example an option that a later schema removed, checking `news` stores `['"legacy"', 'news']`, a value the user never entered. For the same schema and action the core's default checkbox group stores `['legacy', 'news']`, and MUI stores `['news']`.
- Affected public API: `FieldInputStringCheckboxDefinition`.
- Contract violated: `packages/canard/schema-form-antd-mobile-plugin/CLAUDE.md:44` states that initial selection and change payloads use the same identity mapping. The change payload does not decode the token it encoded, which also breaks basic correctness.
- Root cause: `packages/canard/schema-form-antd-mobile-plugin/src/fieldInputs/FieldInputStringCheckbox.tsx:61-66` encodes every stored value as a JSON token, and `FieldInputStringCheckbox.tsx:70-72` returns `v.toString()`, the quoted token itself, for a token that has no option.
- Relation to earlier rounds: New class. MUI drops the same input instead: [canard-schema-form-mui-plugin item 8](canard-schema-form-mui-plugin.md).
- Reopens an earlier fix: No.
- Reproduction: `checkboxUnknownValue.test.tsx`, "checking another option never stores a JSON-quoted spelling of the unknown value": the actual value is `['"legacy"', 'news']`, and the expected value does not contain `'"legacy"'`.
- Confidence: high, public API, source through a probe-local config.

## 4. An option id is built as the field id plus `-<index>`, so it can equal the id of a sibling field named `<name>-<index>`, and a click on that sibling's label changes the option field.

- Severity: medium. With a radio field `contact` and a text field `contact-1`, a click on the label of `contact-1` changes `contact` from `'email'` to `'phone'`, and the text field has no label.
- Affected public API: `FieldInputRadioGroupDefinition` and `FieldInputStringCheckboxDefinition`.
- Contract violated:
  - `.changeset/antd-mobile-scoped-control-identifiers.md` states that options have distinct identifiers.
  - `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/field-input.md:233` states that each option has its own id.
  - HTML requires an id to be unique in its tree: https://html.spec.whatwg.org/multipage/dom.html#the-id-attribute
- Root cause: The core gives a field the id `formId + ':' + path`. `packages/canard/schema-form-antd-mobile-plugin/src/fieldInputs/utils/controls/useControlIdentifiers.ts:26`, `packages/canard/schema-form-antd-mobile-plugin/src/fieldInputs/FieldInputRadioGroup.tsx:88` and `packages/canard/schema-form-antd-mobile-plugin/src/fieldInputs/FieldInputStringCheckbox.tsx:94` append `-<index>`, so option 1 of `/contact` has the id of the field `/contact-1`.
- Relation to earlier rounds: Same class as round 3 cross-package class 23 ([round 3 README](../round-3/README.md)). The core built-ins and the guide (`field-input.md:244-247`) have the same collision: [canard-schema-form item 8](canard-schema-form.md). The same defect in MUI is [canard-schema-form-mui-plugin item 5](canard-schema-form-mui-plugin.md), and in antd5 and antd6 it is [canard-schema-form-antd5-plugin item 2](canard-schema-form-antd5-plugin.md) and [canard-schema-form-antd6-plugin item 2](canard-schema-form-antd6-plugin.md).
- Reopens an earlier fix: Yes. The option id derivation came with [round 3 item 4](../round-3/canard-schema-form-antd-mobile-plugin.md) and the plugin's consumption of [round 3 items 1 and 6](../round-3/canard-schema-form.md) in `d678aad84` and `9ba0ef28c`, whose promise that options have distinct identifiers holds only inside one field.
- Reproduction: `optionIdentifiers.test.tsx`.
  - "IN3: an option id never equals the id of a sibling field whose name ends in -<index>": the duplicated ids are `['_r_0_:/contact-1']`, and the expected list is empty.
  - "IN3: clicking the label of the field "contact-1" does not change the radio field "contact"": the actual value is `{ contact: 'phone' }`, and the expected value is `{ contact: 'email' }`.
- Confidence: high, public API, source through a probe-local config.

## 5. A slider without a value announces the minimum as its value.

- Severity: low. A slider whose form value is `undefined` exposes `aria-valuenow` equal to the minimum, and a range slider exposes `[minimum, minimum]`, so the screen and assistive technology show a value the form does not hold.
- Affected public API: `FieldInputSliderDefinition`.
- Contract violated: The decision recorded for [round 1 item 4](../round-1/canard-schema-form-mui-plugin.md) in [round 1 FIXES](../round-1/FIXES.md), that a slider must not show an unsaved value as if it were stored. MUI follows it since that fix.
- Root cause: `packages/canard/schema-form-antd-mobile-plugin/src/fieldInputs/FieldInputSlider.tsx:81-82` starts the draft at the minimum (`[min, min]` for a range) and passes it to the Slider as its value.
- Relation to earlier rounds: Sibling of [round 1 item 4](../round-1/canard-schema-form-mui-plugin.md) and the same class as round 1 class 13 ([round 1 README](../round-1/README.md)).
- Reopens an earlier fix: No.
- Reproduction: `sliderValues.test.tsx`.
  - "an unset slider does not announce the minimum as its value (MUI round-1 item 4 decision)": `aria-valuenow` is `'10'`, and the expected value is no attribute.
  - "an unset range slider does not announce [minimum, minimum] as its value": the values are `['10', '10']`, and the expected values are `[null, null]`.
- Confidence: high, public API, source through a probe-local config.

## Hypotheses checked and not bugs

- From `r4-ui-mui-mobile`:
  - Inserting an item at index 0 of an array of radio fields keeps every loaded radio selection natively checked.
  - A keyboard step from a stored valid slider value keeps `multipleOf`: ArrowRight from 50 stores 55.
  - The string input ignores `presentation.inputType: 'password'`, but the core's default string input and this README document only `format: 'password'`, so this is not a contract violation.
  - The AJV strict-mode warnings that the documented `format: 'slider'` schemas logged came from the stale AJV8 dist and disappear when the plugin loads from source.
  - Activity, StrictMode and server rendering: the inputs keep their state in `useState`, and the effects in `useControlIdentifiers` and `SliderKeyboardControl` only set identifiers and focus attributes, so none writes a value on mount. This was checked by reading the code, without a probe.
