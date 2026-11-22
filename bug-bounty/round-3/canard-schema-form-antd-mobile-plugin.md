# @canard/schema-form-antd-mobile-plugin: bug bounty round 3

This round confirmed 6 new findings in `@canard/schema-form-antd-mobile-plugin`. Items in the earlier round documents ([round 1](../round-1/canard-schema-form-antd-mobile-plugin.md), [round 2](../round-2/canard-schema-form-antd-mobile-plugin.md)) were treated as fixed and excluded. The main session re-ran every probe. Verification limits are listed under the probes.

Probes: [probes/canard-schema-form-antd-mobile-plugin/](probes/canard-schema-form-antd-mobile-plugin/)

- From `r3-ui-plugins`:
  - Probe folder in the working tree: `packages/canard/schema-form-antd-mobile-plugin/src/__bounty__/r3-ui-plugins/`; the round copy is `bug-bounty/round-3/probes/canard-schema-form-antd-mobile-plugin/r3-ui-plugins/`.
  - To run the copy: copy it back to `packages/canard/schema-form-antd-mobile-plugin/src/__bounty__/r3-ui-plugins/` and run `yarn workspace @canard/schema-form-antd-mobile-plugin test --run src/__bounty__/r3-ui-plugins/`.
  - Failing tests that are not findings: none.
  - Control tests that pass:
    - `enumPrototypeLabels.test.tsx`: "a string switch with enum ["constructor", "owner"] labels its states", which passes because antd-mobile draws only the current state's text.
    - `rangeSliderItemBounds.test.tsx`: "control: a number slider takes its bounds from minimum and maximum" and "diagnostic: bounds written on the array schema itself".
    - `sliderFocus.test.tsx`: "control: focus(path) reaches a text input in the same plugin".
    - `labelAssociation.test.tsx`: the `/name` row.
    - `readmeExample.test.tsx`: the two "%s publishes the clicked value" diagnostics, which use no `marks`.
    - `numberBoundaries.test.tsx`: all four tests.
    - `radioGroupName.test.tsx`: all four tests, because this plugin passes no `name` to its radios. These serve as the control for [@canard/schema-form item 6](canard-schema-form.md).
  - Verification limits:
    - The probes import `@canard/schema-form` through its stale `dist` build, while every line blamed below is in plugin source.
    - React 18 was not run.
    - The slider probes stub `offsetWidth` and `getBoundingClientRect` so that a track click maps to a known value.
    - Item 9-antd-mobile is a static check, without a probe of its own.

Root-cause files: `packages/canard/schema-form-antd-mobile-plugin/src/fieldInputs/`

## 1. An enum value named like an `Object.prototype` member gets an empty label (`constructor`, `toString`), or makes the field fail to render (`__proto__`).

- Severity: medium. An option named `constructor` shows no label and logs a React child error, and `__proto__` removes the field with `SCHEMA_FORM_ERROR.RENDER_FAILED`.
- Affected public API: `FieldInputRadioGroupDefinition`, `FieldInputStringCheckboxDefinition` and `FieldInputStringSwitchDefinition`.
- Contract violated: `packages/canard/schema-form-antd-mobile-plugin/CLAUDE.md:44` and the README promise of custom labels (`README.md:59`, `README.md:65`, `README.md:71`). A crash is also a failure of basic correctness.
- Root cause: The lookups `labels['' + rawValue]` and `labels['' + checked]` read inherited keys of the plain-object map `context.… || alias || {}` at `FieldInputRadioGroup.tsx:47`, `FieldInputStringCheckbox.tsx:49` and `FieldInputStringSwitch.tsx:51-52`, all under `packages/canard/schema-form-antd-mobile-plugin/src/fieldInputs/`.
- Relation to earlier rounds: New class.
- Reopens an earlier fix: No.
- Reproduction: `enumPrototypeLabels.test.tsx`.
  - Radio "constructor": the actual labels are `['owner', '', 'inspector']`.
  - Radio "__proto__": no radio renders, and the field reports `RENDER_FAILED`.
  - Checkbox "toString": the actual labels are `['', 'map']`.
- Confidence: high, public API.

## 2. The range slider ignores `items.minimum`, `items.maximum` and `items.multipleOf`, and stays fixed at 0 to 100.

- Severity: medium. A price range declared with the standard schema `items: { type: 'number', minimum: 0, maximum: 1000 }` gets a 0 to 100 slider, and a click at the middle of the track stores 50 instead of 500.
- Affected public API: `FieldInputSliderDefinition` for an array schema with `format: 'slider'`.
- Contract violated:
  - JSON Schema makes `minimum` and `maximum` numeric keywords, so the validated bounds of an array's numbers live on `items` ([JSON Schema Validation, section 6.2](https://json-schema.org/draft/2020-12/json-schema-validation#section-6.2)).
  - `packages/canard/schema-form-antd-mobile-plugin/README.md:84` and `.changeset/mobile-slider-shape-from-schema.md` describe this array shape.
- Root cause: `packages/canard/schema-form-antd-mobile-plugin/src/fieldInputs/FieldInputSlider.tsx:67-76` reads `jsonSchema.minimum`, `jsonSchema.maximum` and `jsonSchema.multipleOf` on the array schema itself, so the bounds on `items` never reach the Slider. The existing test `src/fieldInputs/__tests__/FieldInputSlider.range.test.tsx:45-46` and the stories place the bounds on the array level, where validators do not apply them.
- Relation to earlier rounds: New class (a decision read from the wrong schema level), close to round 2 cross-package class 1 in `../round-2/README.md`.
- Reopens an earlier fix: No. `git log -L` shows `00bf6493b` from `../round-1/canard-schema-form-antd-mobile-plugin.md` item 2 on these lines, but that commit added the read-only lock and is unrelated.
- Reproduction: `rangeSliderItemBounds.test.tsx`.
  - "a numeric array slider takes its bounds from items.minimum and items.maximum": `aria-valuemax` is `100`, and the expected value is `1000`.
  - "a click at the middle of the track writes the middle of the item range": the actual value is `[50, 800]`, and the expected value is `[500, 800]`.
- Confidence: high, public API with stubbed track geometry.

## 3. `focus(path)` on a slider field does nothing, because the slider has no focusable or marked target.

- Severity: medium. The core interaction is not accessible: focusing the first invalid field after a failed submit, and keyboard users in general, cannot reach the slider.
- Affected public API: `FieldInputSliderDefinition` and `FormHandle.focus`.
- Contract violated: `.changeset/schema-form-focus-target-marker.md` and `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/field-input.md:79`, which require a non-native focus target to carry `data-focus-target` and provide keyboard behavior.
- Root cause: `packages/canard/schema-form-antd-mobile-plugin/src/fieldInputs/FieldInputSlider.tsx:79-90` wraps the antd-mobile Slider without a marker. The library's thumb is a `div` with `role="slider"`, no `tabIndex` and no key handling. This package already solved the same problem for switches with `SwitchKeyboardControl`.
- Relation to earlier rounds: Sibling of `../round-1/canard-schema-form-antd5-plugin.md` item 5. This confirms the open lead in `../round-1/canard-schema-form-antd-mobile-plugin.md`, which `../round-1/FIXES.md` also lists as unconfirmed.
- Reopens an earlier fix: No.
- Reproduction: `sliderFocus.test.tsx`, "focus(path) reaches the slider thumb": `document.activeElement` is `body`, and the expected element is the thumb.
- Confidence: high, public API.

## 4. The field label is not associated with the number stepper or the slider, so those controls have no accessible name from the label.

- Severity: medium. The core interaction is not accessible: the label's `for="/count"` points at no element, so a screen reader reads the stepper input without a name and reads the slider with the library default "滑动输入条", and a click on the label does not focus the control.
- Affected public API: `FieldInputNumberDefinition` and `FieldInputSliderDefinition`. Both switch inputs also lack an `id`, which was checked only by reading the code.
- Contract violated: The renderer-parts contract, under which `LabelRenderer` names its input through `htmlFor` (`.changeset/schema-form-antd-mobile-plugin-renderer-parts.md`). The string, textarea and boolean inputs of this package pass `id={path}`.
- Root cause: The `Stepper` at `packages/canard/schema-form-antd-mobile-plugin/src/fieldInputs/FieldInputNumber.tsx:43` and the `Slider` at `packages/canard/schema-form-antd-mobile-plugin/src/fieldInputs/FieldInputSlider.tsx:80` receive neither `id={path}` nor an `aria-label`.
- Relation to earlier rounds: New instance. The slider label target in the antd5 plugin is a known limit in `../round-1/FIXES.md` and is not reported again.
- Reopens an earlier fix: No.
- Reproduction:
  - `labelAssociation.test.tsx`, "the label of %s points at its control", the `/count` row: the actual label target is `null`, and the expected target is `input`.
  - `sliderFocus.test.tsx`, "the field label names the slider thumb": the thumb's `aria-label` is `滑动输入条`, and it is not named by the field.
- Confidence: high, public API.

## 5. The README "Input Settings" example produces a volume slider that stops only at 0 and 100.

- Severity: low. The documentation misleads: a reader who copies the example gets a slider with two positions instead of a volume control.
- Affected public API: `FieldInputSliderDefinition` with `presentation.FieldInputProps.marks`.
- Contract violated: `packages/canard/schema-form-antd-mobile-plugin/README.md:85` describes `marks` as "(mark display)", and the example at `README.md:126-137` passes `marks: { 0: '0', 100: '100' }`.
- Root cause: The antd-mobile Slider limits values to the mark points whenever `marks` is set, and `packages/canard/schema-form-antd-mobile-plugin/src/fieldInputs/FieldInputSlider.tsx:86` forwards `marks` unchanged. The README does not state that behavior.
- Relation to earlier rounds: Same class as round 1 class 19, "documented examples or configurations that do not work" (`../round-1/README.md`).
- Reopens an earlier fix: No.
- Reproduction: `readmeExample.test.tsx`, "the documented volume slider stops at the clicked values, not only at its two marks": clicks at 70 and 40 store `[{ volume: 100 }, { volume: 0 }]`, and the expected values are `[{ volume: 70 }, { volume: 40 }]`.
- Confidence: high, public API with `registerPlugin` and the README schema used as written.

## 6. The textarea ignores `minRows` and `maxRows` placed in `presentation.FieldInputProps`, which is where the README tells readers to put per-input settings.

- Severity: low. A reader who follows the README gets no row limits for auto-sizing.
- Affected public API: `FieldInputTextareaDefinition`.
- Contract violated: `packages/canard/schema-form-antd-mobile-plugin/README.md:91` and `README.md:123`.
- Root cause: `packages/canard/schema-form-antd-mobile-plugin/src/fieldInputs/FieldInputTextarea.tsx:34-35` reads only `jsonSchema.minRows` and `jsonSchema.maxRows`.
- Relation to earlier rounds: Same class as round 1 class 19 (`../round-1/README.md`).
- Reopens an earlier fix: No.
- Reproduction: No probe in this package. The same read fails in the antd5 probe `textareaRows.test.tsx`.
- Confidence: high, static check.

## Hypotheses checked and not bugs

- From `r3-ui-plugins`:
  - Typing `1e21` into the stepper stores `1e21`.
  - Typing `-0` into the stepper stores a zero.
  - Pressing plus from 0.2 with `multipleOf: 0.1` stores exactly 0.3 and displays `0.3`.
  - Typing the grouped number "1,000" leaves the partial value 1. After blur the stepper displays 1, so the loss is visible to the user and is not counted as silent data loss.
  - Radios in this plugin receive no `name`, so two radio fields with the same leaf name keep both native selections.

## Open leads

- From `r3-ui-plugins`:
  - `packages/canard/schema-form-antd-mobile-plugin/src/fieldInputs/components/SwitchKeyboardControl.tsx` checks `target instanceof HTMLElement`, which would reject switches rendered into another realm, such as an iframe. That angle was outside this area, so it was not reproduced.
