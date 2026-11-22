# @canard/schema-form-antd5-plugin: bug bounty round 4

This round confirmed 4 new findings in `@canard/schema-form-antd5-plugin`: 1 high, 1 medium and 2 low. Items in the earlier round documents ([round 1](../round-1/canard-schema-form-antd5-plugin.md), [round 2](../round-2/canard-schema-form-antd5-plugin.md), [round 3](../round-3/canard-schema-form-antd5-plugin.md)) were treated as fixed and excluded. The main session re-ran every probe through the probe-local config: 73 tests, of which 35 fail (19 in `rangePanelBrowse.test.tsx`, 9 in `derivedIdCollision.test.tsx`, 4 in `timeSpelling.test.tsx`, 2 in `enumSearchNormalization.test.tsx` and 1 diagnostic in `debugIds.test.tsx`).

Probes: [probes/canard-schema-form-antd5-plugin/](probes/canard-schema-form-antd5-plugin/)

- From `r4-ui-antd`:
  - Probe folder in the working tree: `packages/canard/schema-form-antd5-plugin/src/__bounty__/r4-ui-antd/`; the round copy is `bug-bounty/round-4/probes/canard-schema-form-antd5-plugin/r4-ui-antd/`.
  - To run the copy: copy it back to `packages/canard/schema-form-antd5-plugin/src/__bounty__/r4-ui-antd/` and run `yarn workspace @canard/schema-form-antd5-plugin test --run --config src/__bounty__/r4-ui-antd/vitest.source.config.ts src/__bounty__/r4-ui-antd/`.
  - Failing tests that are not findings:
    - `debugIds.test.tsx`, "diagnostic: prints ids and label targets": a diagnostic that fails on purpose to print the element ids and label targets of a form with the fields `q-1` and `q-1-1`.
  - Control tests that pass:
    - `sourceControl.test.tsx`: "control: the core and the winglet packages the plugin imports load from src" and "control: the round 3 Form-scoped id reaches the input and its label".
    - `rangePanelBrowse.test.tsx`: "control: opening the panel alone leaves the stored range unchanged", for the date, month and time ranges in UTC and in Asia/Seoul (6 tests).
    - `timeSpelling.test.tsx`: "time 12:30:00+00:00 shows the same time as 12:30:00Z" and "time 12:30:00.250Z shows the same time as 12:30:00Z", in UTC and in Asia/Seoul (4 tests).
    - `enumSearchNormalization.test.tsx`: "control: matching normalization forms find the label".
    - The tests of the hypotheses below: `readOnlyBoolean.test.tsx` (3 tests), `hydration.test.tsx` (20 tests), `consoleNoiseAll.test.tsx` and `activityInputs.test.tsx`.
  - Verification limits:
    - The shipped `dist` builds predate the fixes of rounds 1 to 3, and no package was rebuilt. `vitest.source.config.ts` extends the package's `vite.config.ts` and aliases every export subpath of `@canard/schema-form`, `@winglet/common-utils`, `@winglet/react-utils`, `@winglet/json-schema`, `@winglet/json` and `@winglet/style-utils` to the `source` file that its `package.json` declares, plus the internal `@/<name>` aliases. Every finding is verified at the level "source through a probe-local config".
    - A `source` resolve condition could not be used. Ant Design's CommonJS build requires `scroll-into-view-if-needed` 3.1.0 and `compute-scroll-into-view` 3.1.1, which also declare a `source` export that points at untranspiled TypeScript under `node_modules`. `vitest.conditions.config.ts` records that attempt and is not used.
    - React 18 was not run, so every result is for React 19.2.6 with antd 5.27.0 and rc-picker 4.11.3.
    - The probes stub `ResizeObserver`, which the pickers need and jsdom lacks. Tests that depend on the time zone set `process.env.TZ` inside the test file.

Root-cause files: `packages/canard/schema-form-antd5-plugin/src/fieldInputs/`

## 1. Browsing a range picker's panel stores the viewed date in the form value although the user picked nothing, and an empty range chosen across two months stores an end date before the user picks it.

- Severity: high. Data changes silently in common usage, and the inputs keep showing the old range. A stored `['2024-01-10', '2024-01-12']` becomes `['2024-02-10', '2024-01-12']`, a reversed range, after one click on the next-month arrow. Picking a start day and moving to the next month to pick the end, which is the usual way to choose a range across two months, already stores a complete range.
- Affected public API: `FieldInputDateRangeDefinition`, `FieldInputMonthRangeDefinition` and `FieldInputTimeRangeDefinition`.
- Contract violated:
  - `packages/canard/schema-form-antd5-plugin/README.md:116`, `README.md:122` and `README.md:128` say that the inputs return the chosen `[start, end]` pair.
  - Basic correctness: a value is written without a user selection, and the displayed range differs from the stored one.
- Root cause: `FieldInputDateRange.tsx:98`, `FieldInputMonthRange.tsx:97` and `FieldInputTimeRange.tsx:147` pass `onPanelChange={handleChange}`. rc-picker 4.11.3 calls `onPanelChange` on every header navigation and view switch, with the calendar values whose active slot is replaced by the viewed date (`node_modules/rc-picker/es/PickerInput/RangePicker.js:213-226`, triggered from `node_modules/rc-picker/es/PickerPanel/index.js:166-176` and `:282-283`). `handleChange` (for example `FieldInputDateRange.tsx:59-64`) calls `onChange` whenever both slots hold a date, so the viewed date becomes the stored value.
- Relation to earlier rounds: New class (a panel navigation callback wired as a value change handler).
- Reopens an earlier fix: No. `git log -L` on `FieldInputDateRange.tsx:95-100` shows `33c13b60e`, `f89a68267` and `5528e4026`, none of which is a bug bounty fix.
- Reproduction: `rangePanelBrowse.test.tsx` (25 tests, 19 fail).
  - "an empty date range stays empty after choosing a start day and browsing to the next month": the actual value is `{ stay: ['2026-11-01', '2026-12-01'] }`, and the expected value is `{}`.
  - "time zone UTC > date-range > browsing to the next page of the panel leaves the stored range unchanged": the actual value is `['2024-02-10', '2024-01-12']`, and the expected value is `['2024-01-10', '2024-01-12']`. The previous page gives `['2023-12-10', '2024-01-12']`.
  - "month-range > browsing to the next page of the panel leaves the stored range unchanged": the actual value is `['2025-01', '2024-03']`, and the expected value is `['2024-01', '2024-03']`.
  - "time-range > browsing to the next page of the panel leaves the stored range unchanged": the actual value is `['00:00:00+00:00', '18:00:00+00:00']` in UTC and `['00:00:00+09:00', '03:00:00+09:00']` in Asia/Seoul, and the expected value is `['09:00:00Z', '18:00:00Z']`.
  - "date-range > browsing then dismissing with Escape shows the value the form stores": the inputs show `['2024-01-10', '2024-01-12']` while the form stores `['2024-02-10', '2024-01-12']`.
- Confidence: high, public API (`Form` with `plugin.fieldInputDefinitions`), source through a probe-local config. The defect is in plugin source, and the probe also fails without `--config`.

## 2. The ids the plugin builds for options, the range end input and the URI protocol select (`${id}-<suffix>`) equal the scoped id of a sibling field named `<name>-<suffix>`, so the form holds duplicate ids and clicking one field's label changes another field.

- Severity: medium. A label click writes the wrong field and the label association breaks, but only when a sibling is named like `q-1` and `q-1-1`, `period` and `period-end`, or `site` and `site-protocol`. Hierarchical survey numbering such as `q-1` and `q-1-1` is realistic. In a form with a radio field `q-1` and a text field `q-1-1`, clicking the label "q-1-1" selects the second option of `q-1` and stores it.
- Affected public API: `FieldInputRadioGroupDefinition`, `FieldInputStringCheckboxDefinition`, `FieldInputDateRangeDefinition`, `FieldInputMonthRangeDefinition`, `FieldInputTimeRangeDefinition` and `FieldInputUriDefinition`.
- Contract violated:
  - The HTML standard requires an `id` to be unique among all ids in the element's tree ([HTML Living Standard, the id attribute](https://html.spec.whatwg.org/multipage/dom.html#the-id-attribute)).
  - The round 3 decision that every control address and association is unique (`../round-3/FIXES.md:367`), pinned by the plugin test "preserves the pre-id schema table while keeping every address and association unique (round-3 id review 4)".
  - `packages/canard/schema-form-antd5-plugin/CLAUDE.md:49`: single-control labels target the control's id, and options have their own ids.
- Root cause: `FieldInputRadioGroup.tsx:58` and `FieldInputStringCheckbox.tsx:57` build option ids as `${id}-${index}`, `FieldInputDateRange.tsx:90`, `FieldInputMonthRange.tsx:89` and `FieldInputTimeRange.tsx:138` build the end input id as `${id}-end`, and `FieldInputUri.tsx:101` builds the protocol select id as `${id}-protocol`. The core's id is `formId + ':' + node.path` (`packages/canard/schema-form/src/components/FieldProxy/components/FieldInputBridge/FieldInputBridge.tsx:265`), and a JSON Pointer segment may contain `-`, so a suffixed id can equal another field's real id. A label's `for` and `document.getElementById` resolve to the first element with that id in tree order.
- Relation to earlier rounds: Same class as round 3 cross-package class 23, one identifier shared by more than one control (`../round-3/README.md`), and a case the round 3 identifier fix left out. The core built-in inputs and the guide that teaches this suffix have the same defect, recorded as [canard-schema-form item 8](canard-schema-form.md). The MUI and antd-mobile plugins have it in their own lines ([canard-schema-form-mui-plugin item 5](canard-schema-form-mui-plugin.md), [canard-schema-form-antd-mobile-plugin item 4](canard-schema-form-antd-mobile-plugin.md)).
- Reopens an earlier fix: Yes. `git log -L` shows that `a24f82691` ("scope controls and group titles per Form (round-3 antd5 core 1,6)"), this plugin's adoption of the fixes for [round 3 canard-schema-form items 1 and 6](../round-3/canard-schema-form.md), added the option and protocol suffixes, and `6c98a7ac5` ("complete table control addresses and names (round-3 schema-form-plugins id review 4)") added the range end suffixes. Before these commits, the options and the range end input had no ids. The round 3 contract that every address is unique stands, so the fix is incomplete.
- Reproduction: `derivedIdCollision.test.tsx` (9 tests, 9 fail).
  - "clicking the label of q-1-1 leaves the q-1 radio value unchanged": the actual value is `{ 'q-1': 'no' }`, and the expected value is `{ 'q-1': 'yes' }`.
  - "radio option ids > every element id in the form is unique": the actual duplicates are `['<scope>:/q-1-1']`, and the expected list is empty. The checkbox, date range end and URI protocol rows report `/q-2-1`, `/period-end` and `/site-protocol` in the same way.
  - "the label of "<sibling>" targets that field's own control": in all four rows, the label's target is a control of the other field.
- Confidence: high, public API, source through a probe-local config. The `--config` is required, because the stale `dist` core has no scoped ids.

## 3. A time stored with a lowercase `z` offset, such as `12:30:00z`, shows "Invalid Date" in the time and time range inputs, while `12:30:00Z` shows the time.

- Severity: low. The spelling is rare and only the display is affected; the stored value stays unchanged until the user edits it. An application whose backend writes RFC 3339 times with a lowercase `z` shows its users "Invalid Date" for valid stored times.
- Affected public API: `FieldInputTimeDefinition` and `FieldInputTimeRangeDefinition`.
- Contract violated: [RFC 3339 section 5.6](https://www.rfc-editor.org/rfc/rfc3339#section-5.6) lets the `Z` be lower case, and the installed `ajv-formats` 2.1.1 `time` format accepts the value. `README.md:110` documents the `HH:mm:00Z` format. The known limit in `../round-3/FIXES.md:488` covers times without an offset; this value has one.
- Root cause: `FieldInputTime.tsx:36` and `FieldInputTimeRange.tsx:100-101` parse with `dayjs(value, 'HH:mm:00Z')`. The `Z` token of dayjs's `customParseFormat` matches only a numeric offset or an upper-case `Z`, so the parse fails and yields an invalid date.
- Relation to earlier rounds: Same class as round 2 cross-package class 3, spelling variants (`../round-2/README.md`).
- Reopens an earlier fix: No. `git log -L` on `FieldInputTime.tsx:36` shows only `33c13b60e`.
- Reproduction: `timeSpelling.test.tsx` (8 tests, 4 fail).
  - "time 12:30:00z shows the same time as 12:30:00Z": the actual display is `['Invalid Date']`, and the expected display is `['12:30']` in UTC and `['21:30']` in Asia/Seoul.
  - "time-range start 09:00:00z shows the same time as 09:00:00Z": the actual display is `['Invalid Date', '18:00:00+00:00']`, and the expected display is `['09:00:00+00:00', '18:00:00+00:00']` in UTC.
- Confidence: high, public API, source through a probe-local config.

## 4. Searching a multiple enum select finds nothing when the option label and the typed text differ only in Unicode normalization form.

- Severity: low. The input is rare: labels from NFD sources, such as macOS file names or decomposed Hangul. Users then cannot find options such as "대한민국" or "Café" by typing them.
- Affected public API: `FieldInputStringEnumDefinition` for an array schema.
- Contract violated: NFC and NFD spellings of the same text are canonically equivalent ([Unicode Standard Annex #15](https://www.unicode.org/reports/tr15/)), so equivalent queries give different results. The round 3 fix decided that the search finds the displayed label (`../round-3/FIXES.md:178`), and `README.md:142` promises custom labels for each option.
- Root cause: `utils/enum/filterEnumOption.ts:11-18` compares lower-cased strings with `includes` and normalizes neither the query nor the label.
- Relation to earlier rounds: Sibling of [round 3 item 4](../round-3/canard-schema-form-antd5-plugin.md), and same class as round 2 cross-package class 3, spelling variants (`../round-2/README.md`).
- Reopens an earlier fix: No. `git log` shows that the fix for [round 3 item 4](../round-3/canard-schema-form-antd5-plugin.md) (`07b6d0da2`) created `filterEnumOption.ts`, but that fix made the search use the displayed label, its cases still pass, and normalization was outside it.
- Reproduction: `enumSearchNormalization.test.tsx` (3 tests, 2 fail). "NFD labels, NFC query: typing a displayed label finds it": the actual options are `{ korean: [], french: [] }`, and the expected options are `{ korean: ['대한민국'], french: ['Café'] }`. "NFC labels, NFD query" gives the same result.
- Confidence: high, public API, source through a probe-local config.

## Hypotheses checked and not bugs

- In a read-only form, clicking a boolean checkbox whose value is unset or `null` leaves the box showing the stored value, and a stored `false` stays unchecked.
- All 20 input kinds (text, password, textarea, number, boolean, both switches, radio, checkbox group, slider, single and multiple select, URI, date, month, time, the three ranges and array) hydrate from `renderToString` without a mismatch, a recoverable error or console output.
- The pickers, the multiple select, the password input and the array input mount under StrictMode and open their popups without console warnings.
- After an `<Activity>` hide and show, edited text, number, radio, checkbox group and slider values, their display and the slider handle id are unchanged.
- Opening a range panel without browsing writes nothing.
- The values that the date input (`YYYY-MM-DD`), the time input (`HH:mm:00Z` with an offset) and the URI input write pass the AJV `date`, `time` and `uri` formats. The default ajv8 plugin sets `validateFormats: false`, so the plugin's own format names (`month`, `date-range`, `time-range`, `password`) produce no unknown-format warnings.
- The month range compares its limits by day correctly, because the picker disables a month only when both its first and its last day are disabled (`node_modules/rc-picker/es/PickerPanel/MonthPanel/index.js:45-50`).
- A bare configured `wss` protocol becoming `wss:` rather than `wss://` is documented in the README section on URI scheme preservation.
- `12:30:00+00:00` and `12:30:00.250Z` show the same time as `12:30:00Z`.
- `InputNumber` ignores its step buttons and keys while read-only (`rc-input-number` 9.5.0, `InputNumber.js:259`).

## Open leads

- The README describes the time range input as a "time range selection (time mode)" (`README.md:126`), but the input is a date and time range panel whose dates are discarded when the value is stored. Whether this changes what a consumer does was not probed.
