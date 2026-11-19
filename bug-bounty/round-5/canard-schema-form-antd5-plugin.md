# @canard/schema-form-antd5-plugin: bug bounty round 5

4 new findings in `@canard/schema-form-antd5-plugin`: 3 medium and 1 low. Items in the documents of [round 1](../round-1/canard-schema-form-antd5-plugin.md), [round 2](../round-2/canard-schema-form-antd5-plugin.md), [round 3](../round-3/canard-schema-form-antd5-plugin.md) and [round 4](../round-4/canard-schema-form-antd5-plugin.md) were treated as fixed and excluded, together with the decisions and known limits of each round's `FIXES.md`. The main session re-ran every probe: the `r5-ui-rules` folder ran 43 tests, of which 8 fail, the `r5-ids` folder ran 25 tests, of which 5 fail; and the `r5-release` folder ran 5 tests, of which 3 fail. No item is a regression or a watch-list repeat.

Two items recorded in [canard-schema-form.md](canard-schema-form.md) also affect this package: item 5 (the site's install commands and compatibility table give `>=` peer ranges) and item 6 (its root declarations fail to type-check with `@types/react` 18.0.0 to 18.2.5).

Probes: [probes/canard-schema-form-antd5-plugin/](probes/canard-schema-form-antd5-plugin/)

- Copy a folder back to `packages/canard/schema-form-antd5-plugin/src/__bounty__/<hunter-id>/` and run `yarn workspace @canard/schema-form-antd5-plugin test --run src/__bounty__/<hunter-id>/`. The probes import the plugin from source and `@canard/schema-form` by name, which resolves to its `dist`; they run on React 19 in jsdom with antd 5.27.0 (rc-slider 11.1.8, rc-picker 4.11.3). Pointer rows stub `getBoundingClientRect` with a width of 100; `sliderTable.test.tsx` writes its measured table to `<os.tmpdir()>/r5-ui-rules/antd5-slider.json`.
- Failing tests that are not findings: `r5-ui-rules/rangeCommit.test.tsx`, "diagnostic: stored range, new start picked, dismissed by Escape: what is shown is what is stored", records a transitional state while focus stays in the picker (rc-picker confirms the start part and submits on blur); the blur row passes. `r5-ui-rules/sliderTable.test.tsx`, "huge range: End from unset stores Number.MAX_SAFE_INTEGER", stores 2^53 for `maximum: Number.MAX_SAFE_INTEGER`; it was excluded under the quality bar, because no realistic slider has a `maximum` near 2^52 times its step.
- `r5-rerun-plugins` holds the ports of earlier probes. The re-run of every earlier probe (see [canard-schema-form.md](canard-schema-form.md) for the method) ran 130 tests from rounds 1 to 4, of which 20 fail, each on a recorded decision, an environment limit (read-only drawing sets `pointer-events: none`), the replaced identifier interface, a diagnostic, or the round 2 peer-range narrowing that the host's antd 6 no longer satisfies; the ports pass (16 tests). No earlier item regressed.

Root-cause files: `packages/canard/schema-form-antd5-plugin/src/fieldInputs/`

## 1. In a layout built with `Form.Label` and `Form.Input`, or with a custom FieldRenderer that renders the bound `Label`, the radio group, the checkbox group, the slider handle and the end input of the date, month and time ranges have no accessible name.

- Severity: medium. Assistive technology cannot name these controls in a documented layout, while the core's own inputs in the same layout are named. No value is wrong.
- Affected public API: `Form.Label`, `Form.Input` and the bound `Label` of `FieldRendererProps`, with `FieldInputRadioGroupDefinition`, `FieldInputStringCheckboxDefinition`, `FieldInputSliderDefinition` and the date, month and time range definitions.
- Contract violated: `packages/canard/schema-form/src/components/Form/components/FormLabel/DETAIL.md:5` (`Form.Label` connects an accessible title without knowing which input is selected) and `:11` (grouped inputs use the same title through `aria-labelledby`); `FormLabel.tsx:14-15`; `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/field-input.md:160` and `:219`; this package's `CLAUDE.md:51` ("Use `labelId` for the field title and `aria-labelledby` references") and `README.md:242`.
- Root cause: these inputs never read their `labelId` prop; they read only an `aria-labelledby` prop, which only this plugin's `src/components/FieldRenderer.tsx:82` and `:99-103` pass (`src/fieldInputs/FieldInputRadioGroup.tsx:49` and `:83`, `FieldInputStringCheckbox.tsx:51` and `:84`, `FieldInputSlider.tsx:37`, `:63` and `:122`, `FieldInputDateRange.tsx:58` and `:92`, and the month and time ranges alike). `Form.Input` renders a bare `<Input />`, whose `label for` points at a `div`, which cannot be labeled, and for a range reaches only the start input. The core's radio and checkbox groups always use `labelId` as `aria-labelledby`, so the same layout names them.
- Relation to earlier rounds: same class as round 4 class 32 (sibling implementations of one contract disagree); round 3 core items 1 and 6 as this plugin adopted them. The same defect is recorded for [antd6 item 1](canard-schema-form-antd6-plugin.md), [antd-mobile item 1](canard-schema-form-antd-mobile-plugin.md) and [MUI item 2](canard-schema-form-mui-plugin.md).
- Reopens an earlier fix: round 3 core items 1 and 6 as adopted here (`a24f82691`), round 3 identifier review items 4 (`6c98a7ac5`, ranges) and 5 (`9ba0ef28c`, slider handle); custom layouts are an input those fixes never covered.
- Regression of an earlier fix: no; before `a24f82691` the radio group had no title reference at all.
- Watch list: no; the class is a missing title association, not a shared or colliding identifier.
- Reproduction: `r5-ids/customLayoutNames.test.tsx`, 5 of 9 tests fail: "Form.Label + Form.Input: the radio group is named "plan"" gives group names `[]`, and the checkbox row also `[]`; "…the slider handle is named "level"" gives `''`; "custom FieldRenderer with the bound Label: the radio group is named "plan"" gives `[]`; "…both date range inputs are named "period"" gives `['period', '']`. The controls pass: this plugin's FieldRenderer names all of them, and the core radio group in the same `Form.Label` layout is named `plan`.
- Confidence: high; public API with jsdom and dom-accessibility-api 0.5.16.

## 2. The slider ignores `exclusiveMinimum` and `exclusiveMaximum`.

- Severity: medium. A strictly positive quantity stores 0 on Home, and a schema bounded only by `exclusiveMaximum: 10` gets a 0 to 100 track whose End stores 100; both values fail the schema.
- Affected public API: `FieldInputSliderDefinition`.
- Contract violated: JSON Schema Validation 2020-12 sections [6.2.3](https://json-schema.org/draft/2020-12/json-schema-validation#section-6.2.3) and [6.2.5](https://json-schema.org/draft/2020-12/json-schema-validation#section-6.2.5), which the public `NumberSchema` accepts; the round 4 grid decision that pointer and keyboard selections stay valid (`../round-4/FIXES.md:351`). `README.md:273` mentions only inclusive bounds.
- Root cause: `src/fieldInputs/utils/slider/getSliderBounds.ts:13-46` takes only `minimum`, `maximum`, `multipleOf` and the integer flag and defaults absent bounds to 0 and 100 (`:14-15`); `FieldInputSlider.tsx:39-50` passes only `minimum` and `maximum`.
- Relation to earlier rounds: round 4 MUI item 3 and antd-mobile item 2 (the grid fixes); round 3 class 21 (a fix that left a case out). The helper is identical in the four UI plugins, and each copy has its own item: [antd6 item 2](canard-schema-form-antd6-plugin.md), [MUI item 3](canard-schema-form-mui-plugin.md), [antd-mobile item 2](canard-schema-form-antd-mobile-plugin.md).
- Reopens an earlier fix: the round 4 grid fix siblings for this plugin (`20ceb3e03`, `959d15e46`) wrote these lines.
- Regression of an earlier fix: no; before them, `minimum ?? 0` and `maximum ?? 100` also ignored exclusive bounds.
- Watch list: no.
- Reproduction: `r5-ui-rules/sliderTable.test.tsx`, describe "antd5 slider: exclusive bounds": "'exclusiveMinimum 0, Home from unset'", "'exclusiveMaximum 10, End from unset'" and "'exclusiveMinimum 0 with minimum 0, Home…'" store 0, 100 and 0; each expects the nearest grid value inside the exclusive bound (1, 9 and 0.1).
- Confidence: high for the behavior; medium for the exact expected value, because the schema does not say which inner value an endpoint key should pick.

## 3. With `antd` 5.10.0 to 5.11.x, which the peer range `^5.10.0` admits, a slider with `lazy` omitted never stores a value: dragging or using the keyboard moves the handle, and the form value stays unchanged.

- Severity: medium. Data is silently not stored, but only for hosts on antd 5.10.x or 5.11.x. Those releases satisfy both the peer range and the plugin's own dependency range, so a package manager dedupes the plugin onto them.
- Affected public API: `plugin` (the slider for `inputType: 'slider'`) with `presentation.FieldInputProps.lazy` omitted or `true`.
- Contract violated: `package.json:89` (`peerDependencies.antd: ^5.10.0`) and `:72` (dependency `^5.10.0`); `README.md:155` (omitting `lazy` "stores the value on commit (key up, pointer up, or the library change-complete event)").
- Root cause: `FieldInputSlider.tsx:93-99` passes only `onChangeComplete` to `Slider` when `lazy` is not `false`, and antd added that prop in 5.12.0. In 5.10.0 to 5.11.x, `es/slider/index.d.ts` declares only `onAfterChange`, and `es/slider/index.js` forwards the remaining props to rc-slider `~10.3.0` or `~10.4.0`, which calls only `onAfterChange`; the plugin's callback is never called. Evidence: the hunter read antd 5.10.0, 5.10.3, 5.11.0, 5.11.5 and 5.12.0 and rc-slider 10.3.0, 10.3.1, 10.4.0, 10.4.1 and 10.5.0 on unpkg on 2026-11-20. The handler has been `onChangeComplete` since the plugin was created (`33c13b60e`, `c5c7c453b`).
- Relation to earlier rounds: round 4 class 40 (run-time APIs newer than the documented consumer configuration) and round 2 class 5 (peer ranges against dependency ranges); this time the input is the floor of the range, not its width. The antd-mobile case is [antd-mobile item 3](canard-schema-form-antd-mobile-plugin.md).
- Reopens an earlier fix: round 2 item 2 (`91ff738f9`), which narrowed the range to `^5.10.0` and kept the 5.10.0 floor; its decision that the peer range equals the bundled range stands.
- Regression of an earlier fix: no; the floor and the handler predate the fix.
- Watch list: no.
- Reproduction: `r5-release/sliderPeerFloor.test.tsx`, where `vi.mock('antd')` reproduces the 5.10 and 5.11 Slider surface on the installed antd 5.27 by dropping the prop those versions do not know: "a pointer drag with lazy omitted stores the value (antd 5.10/5.11 Slider surface)" and "an arrow key with lazy omitted stores the value" give `{ level: 15 }`, expected `{ level: 20 }`; "the declared antd floor provides the commit event the default slider relies on" gives `hasCommitEvent: false` for the floor 5.10.0. The controls pass (the same drag and key on the real antd 5.27, and `lazy: false` on the emulation). Run it with `--testTimeout=120000`.
- Confidence: high for the mechanism; public API with an internal fixture that emulates the library surface, plus registry reads. No real antd 5.10 was installed.

## 4. With `multipleOf` below 1e-6, a pointer press stores an endpoint or 0 instead of the pressed grid value.

- Severity: low. Such steps are rare, but the round 4 grid table itself pins `1e-7`. MUI stores the pressed value.
- Affected public API: `FieldInputSliderDefinition`.
- Contract violated: the round 4 grid decision (`../round-4/FIXES.md:351` and `:443`); equivalence with the MUI plugin.
- Root cause: the plugin passes the step unchanged to rc-slider, which counts decimals with `String(n).split('.')`, and that gives 0 for an exponent spelling such as `1e-7` (`node_modules/rc-slider/es/hooks/useOffset.js:19-23`); the call site is `FieldInputSlider.tsx:121-137`.
- Relation to earlier rounds: round 4 antd-mobile item 2 and its grid siblings, whose table pinned `1e-7` for the keyboard only; round 4 class 42. The same defect is recorded for [antd6 item 3](canard-schema-form-antd6-plugin.md) and [antd-mobile item 5](canard-schema-form-antd-mobile-plugin.md).
- Reopens an earlier fix: the round 4 grid fixes for this plugin.
- Regression of an earlier fix: no.
- Watch list: no.
- Reproduction: `r5-ui-rules/sliderTable.test.tsx`, describe "antd5 slider: pointer values are exact grid values": "'multipleOf 1e-7 at x=50'" stores 9e-7 (expected 5e-7), "'multipleOf 5e-7 at x=50'" stores 1e-5 (expected 5e-6), and "'multipleOf 5e-7 at x=10'" stores 0 (expected 1e-6).
- Confidence: high; public API with a stubbed track width.

## Hypotheses checked and not bugs

- String switches: an outside stored value shows unchecked and a click stores `enum[0]`; null enums toggle; read-only keeps value and display; disabled stores nothing; an alias keyed `null` labels the null state.
- Slider commit timing: with `lazy` omitted the slider stores once on key release, with `lazy: false` on every key press; unset sliders agree across plugins. Read-only and disabled sliders store nothing. A commit that races an external `setValue` or `reset` keeps the external value (the core's generation check, `packages/canard/schema-form/src/components/FieldProxy/components/FieldInputBridge/FieldInputBridge.tsx:137-166`). Keyboard steps from an off-grid stored value snap back to the grid; decimal pointer values are exact; PageUp sizes differ between plugins but stay on the grid.
- Date range: Escape or blur with only a start stores nothing, both ends store the pair, and external writes win.
- Identifiers: `renderToString` followed by `hydrateRoot` keeps every id, `for`, `aria-labelledby` and radio name with no recoverable error; array moves keep ids unique; `Form.Label` targets the focusable control of every single-control input; no plugin builds a library id from a leaf name; no code looks elements up by id.
- From the re-run ports: a click on a read-only checkbox group, radio group or boolean checkbox changes neither value nor display; the URI protocol survives an `<Activity>` hide and show; `sms:`, `urn:` and `geo:` keep a single colon; `setValue`, `reset` and `controls.derived` reach every input.
