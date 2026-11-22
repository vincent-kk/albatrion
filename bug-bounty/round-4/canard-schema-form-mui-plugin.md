# @canard/schema-form-mui-plugin: bug bounty round 4

This round confirmed 8 new findings in `@canard/schema-form-mui-plugin`: 5 of medium severity and 3 of low severity. Items in the earlier round documents ([round 1](../round-1/canard-schema-form-mui-plugin.md), [round 2](../round-2/canard-schema-form-mui-plugin.md), [round 3](../round-3/canard-schema-form-mui-plugin.md)) were treated as fixed and excluded. The main session re-ran every probe: 20 tests, of which 13 fail and 7 pass.

Probes: [probes/canard-schema-form-mui-plugin/](probes/canard-schema-form-mui-plugin/)

- From `r4-ui-mui-mobile`:
  - Probe folder in the working tree: `packages/canard/schema-form-mui-plugin/src/__bounty__/r4-ui-mui-mobile/`; the round copy is `bug-bounty/round-4/probes/canard-schema-form-mui-plugin/r4-ui-mui-mobile/`.
  - To run the copy: copy it back to `packages/canard/schema-form-mui-plugin/src/__bounty__/r4-ui-mui-mobile/` and run `yarn workspace @canard/schema-form-mui-plugin test --run --config src/__bounty__/r4-ui-mui-mobile/vitest.config.ts src/__bounty__/r4-ui-mui-mobile/`.
  - The probe-local `vitest.config.ts` extends the package's `vite.config.ts`. It puts the `source` export condition first in `resolve.conditions` and `ssr.resolve.conditions`, ahead of Vite's default conditions, and adds the `@/<name>` aliases that the workspace sources use. Every workspace package, including `@canard/schema-form` and `@canard/schema-form-ajv8-plugin`, therefore loads from source. The dist builds in the main tree predate the round 1 to 3 fixes. The hunter scanned the dependency closure of the probes (114 packages) and found no third-party package that declares a `source` export.
  - Failing tests that are not findings: none. `checkboxUnknownValue.test.tsx` names its test "diagnostic", but it is the reproduction of item 8.
  - Control tests that pass:
    - `coreBuildCheck.test.tsx`: "control: the core loaded from source passes the Form-scoped FieldInputProps.id to inputs". It fails against the stale dist, which passes no `id` to inputs.
    - `branchErrors.test.tsx`: "control: the core fallback renderer shows the checkbox group error".
    - `sliderMultipleOf.test.tsx`: "control: with minimum 0 an arrow key stores a multiple of 5", and the rows "ArrowRight from the stored 50" and "PageUp from the stored 50".
    - `enumSelectNoise.test.tsx`: "control: an enum select loaded as undefined mounts without out-of-range warnings".
    - `radioIdentifiers.test.tsx`: "IN3: inserting an item at index 0 keeps every loaded radio selection natively checked".
  - Verification limits:
    - React 18 was not run.
    - The pointer case of the slider probe stubs `getBoundingClientRect`, so that a press maps to a known value.
    - Activity, StrictMode and server rendering of the inputs other than the URI input were checked by reading the code only.

Root-cause files: `packages/canard/schema-form-mui-plugin/src/`

## 1. Validation errors of array fields, checkbox groups included, never appear on screen.

- Severity: medium. An error that blocks submission, such as `minItems` or `maxItems` on a checkbox group ("choose at most three"), is invisible, so the user cannot see why the form does not submit.
- Affected public API: `plugin.FieldRenderer`.
- Contract violated:
  - `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/troubleshooting.md:70` states that validation reports both item limits.
  - `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/field-input.md:160` states that ErrorMessage has no default content, so the renderer must pass `errorMessage`.
  - The core fallback renderer shows the same error for a branch node (`packages/canard/schema-form/src/components/FallbackComponents/components/FieldRenderer.tsx:27-43`).
- Root cause: `packages/canard/schema-form-mui-plugin/src/components/FieldRenderer.tsx:30-67` renders a branch node without its `ErrorMessage`; only the terminal path at `FieldRenderer.tsx:80` renders it. A checkbox group is an array, which is a branch node, so its errors are dropped.
- Relation to earlier rounds: New class. The same defect in antd-mobile is [canard-schema-form-antd-mobile-plugin item 1](canard-schema-form-antd-mobile-plugin.md).
- Reopens an earlier fix: No.
- Reproduction: `branchErrors.test.tsx`, "the MUI renderer shows the checkbox group error that blocks submission". `getErrors()` contains `/topics`, but the screen text does not contain "must NOT have fewer than 2 items", which is the expected text.
- Confidence: high, public API, source through a probe-local config.

## 2. The string switch reads the enum in the opposite order from antd5, antd6 and antd-mobile, so the same schema and the same action store the opposite value.

- Severity: medium. With `enum: ['on', 'off']`, which is the schema of this package's own `StringSwitch` story (`packages/canard/schema-form-mui-plugin/stories/FieldInput.stories.tsx:178-193`), turning the switch on stores `'off'`, and a stored `'on'` is shown as off.
- Affected public API: `FieldInputStringSwitchDefinition`.
- Contract violated: Equivalence between the UI plugins for the same schema and user action. No document fixes the order, and the test suites pin opposite orders (`packages/canard/schema-form-mui-plugin/src/fieldInputs/__tests__/FieldInputSwitch.misfit.test.tsx:60` and `:73` against `packages/canard/schema-form-antd-mobile-plugin/src/fieldInputs/__tests__/FieldInputSwitch.keyboard.test.tsx:21-29`), so the order is the owner's decision.
- Root cause: `packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputStringSwitch.tsx:51-64` takes the first enum value as the off value and the second as the on value, and `FieldInputStringSwitch.tsx:91` shows the switch as checked for the second value. antd-mobile (`FieldInputStringSwitch.tsx:45-51`, `:74`) and antd5 (`FieldInputStringSwitch.tsx:42-48`, `:68`) treat the first value as checked.
- Relation to earlier rounds: New class.
- Reopens an earlier fix: No. `git log -L` shows only `d69fcb940`, which added the plugin.
- Reproduction: `stringSwitchOrder.test.tsx`.
  - "a stored enum[0] value shows the switch as checked, as in the antd plugins": the switch is not checked; the expected state is checked.
  - "switching on from an empty field stores enum[0], as in the antd plugins": the actual value is `{ mode: 'off' }`, and the expected value is `{ mode: 'on' }`.
- Confidence: high for the behavior, public API, source through a probe-local config.

## 3. With a `minimum` that is not a multiple of `multipleOf`, the slider writes only values that fail `multipleOf`.

- Severity: medium. With `minimum: 1`, `maximum: 100` and `multipleOf: 5`, a press at the middle of the track stores 51 and the field reports a validation error. The user cannot reach a valid value with the slider except at a few points such as the maximum.
- Affected public API: `FieldInputSliderDefinition`.
- Contract violated:
  - `packages/canard/schema-form-mui-plugin/README.md:118` promises support for `minimum`, `maximum` and `multipleOf`.
  - JSON Schema Validation, section 6.2.1 (`multipleOf`): https://json-schema.org/draft/2020-12/json-schema-validation#section-6.2.1
- Root cause: `packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputSlider.tsx:82-84` takes `min` from `minimum` and `step` from `multipleOf`, and `FieldInputSlider.tsx:124-126` passes them to the MUI Slider, which rounds every position to `min + k * step`. A press at 50.5 becomes 51, and the first keyboard step from the unset thumb at the minimum becomes 6.
- Relation to earlier rounds: New class. The same defect in antd-mobile is [canard-schema-form-antd-mobile-plugin item 2](canard-schema-form-antd-mobile-plugin.md).
- Reopens an earlier fix: No.
- Reproduction: `sliderMultipleOf.test.tsx`.
  - "with minimum 1, a press at the middle of the track stores a value that passes multipleOf 5": the actual result is `{ value: 51, errors: 1 }`.
  - "with minimum 1, ArrowRight from an unset field stores a value that passes multipleOf 5": the actual result is `{ value: 6, errors: 1 }`.
  - The expected result is a multiple of 5 with no errors.
- Confidence: high, public API with stubbed track geometry, source through a probe-local config.

## 4. A nullable checkbox loaded as `null` keeps the indeterminate icon after the user checks it.

- Severity: medium. After the click the form holds `true`, but the checkbox still shows the indeterminate icon, and it keeps showing it on every later click, so the user cannot see the checked state. antd5, antd6 and antd-mobile clear the indeterminate state.
- Affected public API: `FieldInputBooleanDefinition`.
- Contract violated: Equivalence between the UI plugins and predictable display: the checkbox must show the value the form holds.
- Root cause: `packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputBoolean.tsx:40-44` derives `indeterminate` from the mount-time `defaultValue`, and the definition at `FieldInputBoolean.tsx:74-77` does not declare `controlled`. The core does not pass a new `defaultValue` after the input's own change (`packages/canard/schema-form/src/helpers/fieldInputDefinition/utils/withFieldInputErrorBoundary.tsx:37-40`). antd5 derives the state from `value` and declares `controlled: true` (`FieldInputBoolean.tsx:21-23`, `:46`).
- Relation to earlier rounds: Same class as round 1 class 13, uncontrolled widgets whose display diverges from the form value ([round 1 README](../round-1/README.md)). [Round 1 item 5](../round-1/canard-schema-form-mui-plugin.md) changed only the README for the `undefined` case.
- Reopens an earlier fix: No. `git log -L` shows only `d69fcb940`.
- Reproduction: `booleanIndeterminate.test.tsx`, "a nullable checkbox loaded as null leaves the mixed state once the user checks it": after the click `getValue()` is `{ agree: true }`, while `data-indeterminate` is `'true'`; the expected value is `'false'`.
- Confidence: high, public API, source through a probe-local config.

## 5. An option id is built as the field id plus `-<index>`, so it can equal the id of a sibling field named `<name>-<index>`, and a click on that sibling's label changes the option field.

- Severity: medium. With a radio field `contact` and a text field `contact-1`, a click on the label of `contact-1` changes `contact` from `'email'` to `'phone'`, and the text field has no label.
- Affected public API: `FieldInputRadioGroupDefinition`, `FieldInputStringCheckboxDefinition` and `FieldInputUriDefinition`.
- Contract violated:
  - `.changeset/mui-scoped-control-identifiers.md` states that options have distinct identifiers.
  - `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/field-input.md:233` states that each option has its own id.
  - HTML requires an id to be unique in its tree: https://html.spec.whatwg.org/multipage/dom.html#the-id-attribute
- Root cause: The core gives a field the id `formId + ':' + path`. `packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputRadioGroup.tsx:128` and `:134` and `packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputStringCheckbox.tsx:135` and `:139` append `-<index>`, and `packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputUri.tsx:119` appends `-protocol`, so option 1 of `/contact` has the id of the field `/contact-1`.
- Relation to earlier rounds: Same class as round 3 cross-package class 23 ([round 3 README](../round-3/README.md)). The core built-ins and the guide (`field-input.md:244-247`) have the same collision: [canard-schema-form item 8](canard-schema-form.md). The same defect in antd5 and antd6 is [canard-schema-form-antd5-plugin item 2](canard-schema-form-antd5-plugin.md) and [canard-schema-form-antd6-plugin item 2](canard-schema-form-antd6-plugin.md), and in antd-mobile it is [canard-schema-form-antd-mobile-plugin item 4](canard-schema-form-antd-mobile-plugin.md).
- Reopens an earlier fix: Yes. The option id derivation came with the plugin's consumption of [round 3 items 1 and 6](../round-3/canard-schema-form.md) in `cb6c7431b`, whose promise that options have distinct identifiers holds only inside one field.
- Reproduction: `radioIdentifiers.test.tsx`.
  - "IN3: an option id never equals the id of a sibling field whose name ends in -<index>": the duplicated ids are `['_r_8_:/contact-1']`, and the expected list is empty.
  - "IN3: clicking the label of the field "contact-1" does not change the radio field "contact"": the actual value is `{ contact: 'phone' }`, and the expected value is `{ contact: 'email' }`.
- Confidence: high, public API, source through a probe-local config.

## 6. The switch inputs do not show the custom state labels that the README promises.

- Severity: low. A reader who follows the README or the package's story gets no custom labels.
- Affected public API: `FieldInputStringSwitchDefinition` and `FieldInputBooleanSwitchDefinition`.
- Contract violated: `packages/canard/schema-form-mui-plugin/README.md:53` promises custom labels for the `checked` and `unchecked` states of the boolean switch, and `README.md:65` promises custom labels per state of the string switch.
- Root cause:
  - `packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputStringSwitch.tsx:53-56` reads only the schema-level array `switchLabels` and ignores `presentation.FieldInputProps.alias`, which the package's story (`stories/FieldInput.stories.tsx:182-190`) and the antd5, antd6 and antd-mobile switches use.
  - `packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputBooleanSwitch.tsx:28-73` has no label props at all.
- Relation to earlier rounds: Same class as round 3 cross-package class 27 ([round 3 README](../round-3/README.md)), documented examples that do not match the code.
- Reopens an earlier fix: No.
- Reproduction: `stringSwitchOrder.test.tsx`.
  - "the story alias labels the two switch states": the text is `'onoffmode'`, and the expected text contains `'alias on'` and `'alias off'`.
  - "the boolean switch shows custom checked and unchecked labels": the text is `'notify'`, and the expected text contains `On` or `Off`.
- Confidence: high, public API, source through a probe-local config.

## 7. An enum select loaded with `null` logs MUI's "out-of-range value" warning on every mount.

- Severity: low. A nullable enum without `null` among its values, loaded with `null` as a database often returns it, adds two development console warnings per mount.
- Affected public API: `FieldInputStringEnumDefinition`.
- Contract violated: `.changeset/mui-empty-select.md`, which promises no out-of-range warnings when an enum select has no value.
- Root cause: `packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputStringEnum.tsx:95-99` passes the token `'null'` for a `null` value whether or not an option encodes `null`, and uses the empty display value only for `undefined`.
- Relation to earlier rounds: Same class as round 3 cross-package class 21 ([round 3 README](../round-3/README.md)), a fix that left a case out. Sibling of [round 3 item 5](../round-3/canard-schema-form-mui-plugin.md).
- Reopens an earlier fix: Yes. [Round 3 item 5](../round-3/canard-schema-form-mui-plugin.md) was fixed in `7352a746f` for `undefined` only; `null` is a new input the fix left out.
- Reproduction: `enumSelectNoise.test.tsx`, "a nullable enum select loaded as null mounts without out-of-range warnings (%s)", rows `nullable: true` and `type with null`: each logs two warnings "MUI: You have provided an out-of-range value `null` for the select", and none is expected.
- Confidence: high, public API, source through a probe-local config.

## 8. The checkbox group drops a stored value outside the enum when the user toggles another option.

- Severity: low. With a stored `['legacy']`, checking `news` stores `['news']`, so a value the user neither saw nor touched disappears. The core's default checkbox group stores `['legacy', 'news']` for the same schema and action.
- Affected public API: `FieldInputStringCheckboxDefinition`.
- Contract violated: Equivalence with the core's default checkbox group (`packages/canard/schema-form/src/fieldInputs/fieldInputDefinitions/FieldInputStringCheckbox/FieldInputStringCheckbox.tsx:48`, whose change handler keeps the existing values).
- Root cause: `packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputStringCheckbox.tsx:98-104` maps each selected token to its option and filters out the tokens that have no option.
- Relation to earlier rounds: New class. antd-mobile corrupts the same input instead of dropping it: [canard-schema-form-antd-mobile-plugin item 3](canard-schema-form-antd-mobile-plugin.md).
- Reopens an earlier fix: No.
- Reproduction: `checkboxUnknownValue.test.tsx`, "diagnostic: checking another option keeps the unknown stored value, as the core default does": the actual value is `{ topics: ['news'] }`, and the expected value is `{ topics: ['legacy', 'news'] }`.
- Confidence: high for the behavior, public API, source through a probe-local config. Medium for the expected result, because a value outside the enum is already invalid under the schema.

## Hypotheses checked and not bugs

- From `r4-ui-mui-mobile`:
  - Inserting an item at index 0 of an array of radio fields keeps every loaded radio selection natively checked.
  - A keyboard step from a stored valid slider value keeps `multipleOf`: ArrowRight and PageUp from 50 store multiples of 5.
  - The URI input, which is on the watch list, showed no new failure: the preserved letter case, the `:` delimiter for an unlisted bare scheme such as `wss`, and the split of `localhost:3000` into a scheme are documented decisions or known limits.
  - The difference in the default `lazy` behavior from the antd sliders is a recorded intended difference from round 1.
  - The AJV strict-mode warnings that a `format: 'slider'` schema logged came from the stale AJV8 dist and disappear when the plugin loads from source.
  - Activity, StrictMode and server rendering: the inputs other than the URI input keep their state in `useState` and have no mount effect that writes a value. This was checked by reading the code, without a probe.

## Open leads

- From `r4-ui-mui-mobile`:
  - antd5 and antd6 appear to share the structures of items 1, 3 and 8: their `FieldRenderer` branch paths render no `ErrorMessage`, their sliders pass `minimum` and `multipleOf` as `min` and `step`, and their checkbox groups filter out tokens without an option. These were read but not probed.
  - The date and time pickers ignore a change whose value is invalid (`FieldInputDate.tsx:105`, `FieldInputTime.tsx:88`), so a partly cleared date may stay on screen while the form keeps and submits the previous value. Driving MUI X sectioned fields in jsdom was not attempted.
  - The time picker anchors the stored time to today's date (`FieldInputTime.tsx:79-80`), so on a daylight saving transition day a stored `02:30:00` may display as 03:30.
  - The number input passes `min` and `step` from `minimum` and `multipleOf` (`FieldInputNumber.tsx:133-135`), so the native spinner steps from the minimum, as in item 3. This was checked statically.
