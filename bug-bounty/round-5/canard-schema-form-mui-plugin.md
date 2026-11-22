# @canard/schema-form-mui-plugin: bug bounty round 5

7 new findings in `@canard/schema-form-mui-plugin`: 3 medium and 4 low. Items in the documents of [round 1](../round-1/canard-schema-form-mui-plugin.md), [round 2](../round-2/canard-schema-form-mui-plugin.md), [round 3](../round-3/canard-schema-form-mui-plugin.md) and [round 4](../round-4/canard-schema-form-mui-plugin.md) were treated as fixed and excluded, together with the decisions and known limits of each round's `FIXES.md`. The main session re-ran every probe: the `r5-ui-rules` folder ran 41 tests, of which 16 fail; the `r5-ids` folder ran 27 tests, of which 13 fail; the `r5-release` folder ran 2 tests, of which 1 fails. Item 4 is a regression of a round 4 fix and repeats the watch-list point on DOM identifiers.

Two items recorded in [canard-schema-form.md](canard-schema-form.md) also affect this package: item 5 (the site's install commands and compatibility table give `>=` peer ranges) and item 6 (its root declarations fail to type-check with `@types/react` 18.0.0 to 18.2.5).

Probes: [probes/canard-schema-form-mui-plugin/](probes/canard-schema-form-mui-plugin/)

- Copy a folder back to `packages/canard/schema-form-mui-plugin/src/__bounty__/<hunter-id>/` and run `yarn workspace @canard/schema-form-mui-plugin test --run src/__bounty__/<hunter-id>/`. The probes import the plugin from source and `@canard/schema-form` by name (its `dist`), on React 19 in jsdom with `@mui/material` 7.3.1; pointer rows stub a track width of 100.
- Failing tests that are not findings: `r5-ui-rules/sliderTable.test.tsx`, "huge range: End from unset stores Number.MAX_SAFE_INTEGER", excluded under the quality bar (see [canard-schema-form-antd5-plugin.md](canard-schema-form-antd5-plugin.md)); `r5-ids/formLabelTargets.test.tsx`, the "multiple enum select" row, a rejected hypothesis, because that array schema renders a composite array input, not a single control.
- `r5-rerun-plugins` holds the ports of earlier probes and a new passing probe, `monthLimitsFieldInputProps`. The re-run of every earlier probe ran 58 tests from rounds 1 to 4, of which 23 fail, each on a recorded decision (among them the round 4 breaking change that commits the slider on key release, which the old probe did not send), an environment limit (read-only drawing sets `pointer-events: none`) or the replaced identifier interface; the 24 port tests pass. No earlier item regressed.

Root-cause files: `packages/canard/schema-form-mui-plugin/src/fieldInputs/`

## 1. The slider stores values off the `multipleOf` grid on PageUp, PageDown and Shift+Arrow when `multipleOf` does not divide 10.

- Severity: medium. Keyboard users write values the schema rejects with standard keys on ordinary schemas such as `multipleOf: 3`; the other three plugins stay on the grid.
- Affected public API: `FieldInputSliderDefinition`.
- Contract violated: `.changeset/mui-valid-slider-grid.md:5` ("pointer and keyboard selections use the same valid grid"); `README.md:244`; the round 4 grid decision (`../round-4/FIXES.md:351` and `:443`); JSON Schema Validation 2020-12 section [6.2.1](https://json-schema.org/draft/2020-12/json-schema-validation#section-6.2.1).
- Root cause: `FieldInputSlider.tsx:155-163` passes `step` but no `shiftStep` (the main session confirmed the file has no `shiftStep`), so MUI's default `shiftStep = 10` (`node_modules/@mui/material/Slider/useSlider.js:186`) is added for PageUp, PageDown and Shift+Arrow (`:305`, `:319-323`), and `changeValue` only clamps (`:263`).
- Relation to earlier rounds: round 4 item 3; round 3 class 21 (a fix that left a case out).
- Reopens an earlier fix: round 4 item 3 (`791ec1d0a`, `b3d8afe08`), whose grid table used only steps 5, 0.1 and 1e-7, all of which divide 10.
- Regression of an earlier fix: no; `step` without `shiftStep` dates from `d69fcb940`.
- Watch list: no.
- Reproduction: `r5-ui-rules/sliderTable.test.tsx`, describe "mui slider: large keyboard steps from a stored valid grid value keep the grid": `multipleOf 3`, stored 30, PageUp, PageDown and Shift+ArrowRight store 40, 20 and 40 (antd stores 36, 24 and 33); `multipleOf 4`, stored 40, PageDown stores 30; `multipleOf 0.3`, stored 0.3, PageUp stores 10.3; `multipleOf 25`, stored 25, PageUp stores 35.
- Confidence: high; public API.

## 2. `Form.Label` never names the enum select or the date, time and month pickers, and with `hideLabel` the select, the pickers and the radio and checkbox groups have no field title at all.

- Severity: medium; the same class as [antd5 item 1](canard-schema-form-antd5-plugin.md), in this plugin's own lines.
- Affected public API: `Form.Label`, `Form.Input`, the `hideLabel` prop, and the StringEnum, Date, Time, Month, RadioGroup and StringCheckbox definitions.
- Contract violated: `packages/canard/schema-form/src/components/Form/components/FormLabel/DETAIL.md:5` and `:11`; this package's `CLAUDE.md:44` ("inputId on the primary focusable control… labelId for the field title") and `README.md:214`.
- Root cause: `FieldInputStringEnum.tsx:112` puts `inputId` on MUI's native input, which is `aria-hidden` with `tabIndex=-1`, while the combobox's `aria-labelledby` names only the input's own `InputLabel` (`:94`, `:107`); the pickers put `inputId` on the MUI X hidden input (`FieldInputDate.tsx:132`, `FieldInputTime.tsx:103`, `FieldInputMonth.tsx:128`); the radio and checkbox groups drop the title reference under `hideLabel` with `aria-labelledby={label ? labelId : undefined}` (`FieldInputRadioGroup.tsx:119`, `FieldInputStringCheckbox.tsx:106`).
- Relation to earlier rounds: round 4 class 32; [antd5 item 1](canard-schema-form-antd5-plugin.md), [antd6 item 1](canard-schema-form-antd6-plugin.md) and [antd-mobile item 1](canard-schema-form-antd-mobile-plugin.md).
- Reopens an earlier fix: the `hideLabel` lines come from `cb6c7431b` (round 3 core items 1 and 6 for this plugin), the enum select line from `3c303a958` (a round 4 item 5 sibling).
- Regression of an earlier fix: no; before `3c303a958` the id went to the `div` combobox, which a `label for` cannot name either.
- Watch list: no; the class is a missing title association.
- Reproduction: `r5-ids/customLayoutNames.test.tsx`, under `hideLabel`: the enum combobox and the date field are named `''`, and the radio and checkbox groups `[]`; the control "the plugin renderer names the date field and the enum combobox" passes. `r5-ids/formLabelTargets.test.tsx`: the enum select, date, time and month rows give `{ tag: 'input', focusable: false, named: false }`, while the antd5 and antd6 copies pass every row.
- Confidence: high for the DOM facts; medium for how common `hideLabel` with `Form.Label` is (`hideLabel` is documented only in `documents/docs/canard/schema-form/schema-reference.mdx:239`).

## 3. The slider ignores `exclusiveMinimum` and `exclusiveMaximum`.

- Severity: medium; as [antd5 item 2](canard-schema-form-antd5-plugin.md).
- Affected public API: `FieldInputSliderDefinition`.
- Contract violated: JSON Schema Validation 2020-12 sections [6.2.3](https://json-schema.org/draft/2020-12/json-schema-validation#section-6.2.3) and [6.2.5](https://json-schema.org/draft/2020-12/json-schema-validation#section-6.2.5); `../round-4/FIXES.md:351`; `README.md:244` mentions only inclusive bounds.
- Root cause: this package's copy of `utils/slider/getSliderBounds.ts:13-46`; `FieldInputSlider.tsx:89-100` passes only `minimum` and `maximum`.
- Reopens an earlier fix: round 4 item 3 (`791ec1d0a`, `b3d8afe08`), which wrote the helper.
- Regression of an earlier fix: no.
- Watch list: no.
- Reproduction: `r5-ui-rules/sliderTable.test.tsx`, describe "mui slider: exclusive bounds", stores 0, 100 and 0; expected 1, 9 and 0.1.
- Confidence: high for the behavior; medium for the exact expected value.

## 4. The radio and checkbox groups render their own legend with the core `labelId`, so `Form.Label`, or the composite group renderer the core guide teaches, puts a second element with the same id in the form.

- Severity: low. Two elements share an id, and `aria-labelledby` resolves to the first in tree order; no value or click changes. It also happens under `hideLabel`, with an empty legend.
- Affected public API: `FieldInputRadioGroupDefinition` and `FieldInputStringCheckboxDefinition` with `Form.Label` or a custom FieldRenderer.
- Contract violated: the HTML rule that an id is unique in its tree ([HTML standard, the id attribute](https://html.spec.whatwg.org/multipage/dom.html#the-id-attribute)); `packages/canard/schema-form/src/types/field/fieldInput.ts:58` and `:137` (`labelId` is the DOM id of the title rendered by the field renderer) and `fieldRenderer.ts:40`; this package's `CLAUDE.md:44`, `src/DETAIL.md:33` and `README.md:214` (an input-owned label uses a distinct keyed address); `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/field-input.md:236-238` teaches a renderer with `<legend id={labelId}>`. `src/DETAIL.md:35` decides that the input owns the title, but only for this plugin's own renderer.
- Root cause: `FieldInputRadioGroup.tsx:45` and `:114` and `FieldInputStringCheckbox.tsx:46` and `:120` always render `<FormLabel component="legend" id={labelId}>`; `Form.Label` (`packages/canard/schema-form/src/components/Form/components/FormLabel/components/LabelPartRenderer.tsx:26`) uses the same id.
- Relation to earlier rounds: round 4 item 5 and core item 8 (round 4 class 31); round 3 class 23.
- Reopens an earlier fix: round 4 item 5, commit `49b3d26af`.
- Regression of an earlier fix: yes, case (b): round 4 `@canard/schema-form-mui-plugin` item 5, commit `49b3d26af` ("consume core identifier resolver"). At the round 4 fix base `a2624baaf` the legend id was `useContext(FieldLabelContext) ?? \`input-label:${id}\``, and the context was provided only inside this plugin's renderer, so under `Form.Input` or a custom renderer the legend id differed from `Form.Label`'s `label:<id>`. The main session read that version; the old code cannot run against the current core, so the comparison is static.
- Watch list: yes, DOM ids, option ids and radio names in the core and the UI plugins.
- Reproduction: `r5-ids/customLayoutNames.test.tsx`: "Form.Label + Form.Input of a radio group keep every id unique" finds duplicates `['_r_2_:/plan~label']`, expected `[]`; the checkbox row `['_r_4_:/tags~label']`; "the documented composite group renderer…" `['_r_5_:/plan~label']`; the `hideLabel` row `['_r_7_:/plan~label']`. The controls pass: this plugin's renderer keeps ids unique, the core radio with `Form.Label` keeps them unique, and antd5 and antd6 show no duplicate.
- Confidence: high; public API.

## 5. A keyboard step from a stored off-grid value is stored without snapping back to the grid.

- Severity: low. It needs a stored value that is already off the grid or out of bounds; the arrow keys never repair it, while antd5 and antd6 snap.
- Affected public API: `FieldInputSliderDefinition`.
- Contract violated: `../round-4/FIXES.md:443`; `.changeset/mui-valid-slider-grid.md:5`; equivalence with antd5 and antd6.
- Root cause: `FieldInputSlider.tsx:107-140` stores MUI's keyboard value, which is `value ± step` without rounding (`useSlider.js:24-26`, `:305-318`).
- Relation to earlier rounds: round 4 item 3; the antd-mobile case is [antd-mobile item 3](canard-schema-form-antd-mobile-plugin.md).
- Reopens an earlier fix: round 4 item 3.
- Regression of an earlier fix: no.
- Watch list: no.
- Reproduction: `r5-ui-rules/sliderTable.test.tsx`, describe "mui slider: a user step from a stored off-grid value stores a valid grid value": with `multipleOf 5`, stored 52, ArrowRight, ArrowLeft and PageUp store 57, 47 and 62 (antd stores 55, 45 and 60); "integer schema without multipleOf: stored 2.5, ArrowRight stores an integer" stores 3.5.
- Confidence: high for the behavior; medium for the expected value.

## 6. The single enum select logs two "out-of-range value" warnings on every mount when the stored value is outside the enum.

- Severity: low. Development console noise; the value is preserved as decided. It also happens for the string `"null"` when no option has it.
- Affected public API: `FieldInputStringEnumDefinition`.
- Contract violated: `.changeset/mui-empty-select.md` and `.changeset/mui-null-enum-display.md`; the round 4 decision (`../round-4/FIXES.md:353`).
- Root cause: `FieldInputStringEnum.tsx:96-103` passes every string's JSON token as `defaultValue`, whether or not an option has it.
- Relation to earlier rounds: round 3 item 5 and round 4 item 7; round 3 class 21.
- Reopens an earlier fix: round 3 item 5 (`7352a746f`) and round 4 item 7 (`dcba8a214`).
- Regression of an earlier fix: no.
- Watch list: no.
- Reproduction: `r5-ui-rules/enumUnknown.test.tsx`, "single enum select stored as 'a value outside the enum' mounts without out-of-range warnings" and the `"null"` row each log two warnings.
- Confidence: high.

## 7. The README states the React requirement as "18.0.0 or later (below 19.0.0)", while the peer range admits React 19.

- Severity: low (misleading documentation). A React 19 application reading the README concludes that the plugin is unsupported.
- Affected public API: the installation documentation.
- Contract violated: `package.json:99` (`react: >=18 <20`).
- Root cause: `README.md:198` and `README-ko_kr.md:198`, unchanged since the plugin was added in `d69fcb940`.
- Relation to earlier rounds: round 3 react-utils item 6 (a stale peer range in shipped documentation); round 4 class 39.
- Reopens an earlier fix: no.
- Regression of an earlier fix: no.
- Watch list: no.
- Reproduction: `r5-release/readmeReactRange.test.ts`, "the README admits React 19, which peerDependencies.react admits": `react19: false` for the line "- React 18.0.0 or later (below 19.0.0)". The control passes.
- Confidence: high; static.

## Hypotheses checked and not bugs

- Empty and null enum selects mount without warnings; an unknown stored value is preserved until the user picks an option.
- String switches, slider commit timing (`lazy` omitted stores once on key release), locks and the commit order against external writes behave as in the antd5 document.
- After `insert(0)`, radio items keep their checked option and distinct native names; a keyboard commit stores grid values for steps that divide 10; the checkbox group follows same-length writes; a toggle after an unseen external write keeps the external value; the month picker reads `FieldInputProps` limits.
- Library ids: MUI's `menu-<name>` and `mui-component-select-<name>` are overridden, and the URI `Select` passes no name. The MUI FieldRenderer renders no label for leaves, as `README.md:15` documents.
- MUI 7.0.0 supports the `slotProps` this plugin uses on Switch, Checkbox, Radio, Slider and TextField.
- Style slips not counted: `README.md:21` mentions "Ant Design Mobile", and the Korean README has English lines.
