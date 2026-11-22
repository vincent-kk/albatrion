# @canard/schema-form-antd5-plugin: bug bounty round 3

This round confirmed 5 new findings in `@canard/schema-form-antd5-plugin`. Items in the earlier round documents ([round 1](../round-1/canard-schema-form-antd5-plugin.md), [round 2](../round-2/canard-schema-form-antd5-plugin.md)) were treated as fixed and excluded. The main session re-ran every probe. Verification limits are listed under the probes.

Probes: [probes/canard-schema-form-antd5-plugin/](probes/canard-schema-form-antd5-plugin/)

- From `r3-ui-plugins`:
  - Probe folder in the working tree: `packages/canard/schema-form-antd5-plugin/src/__bounty__/r3-ui-plugins/`; the round copy is `bug-bounty/round-3/probes/canard-schema-form-antd5-plugin/r3-ui-plugins/`.
  - To run the copy: copy it back to `packages/canard/schema-form-antd5-plugin/src/__bounty__/r3-ui-plugins/` and run `yarn workspace @canard/schema-form-antd5-plugin test --run src/__bounty__/r3-ui-plugins/`.
  - Failing tests that are not findings: none. Every failing test belongs to an item or symptom below.
  - Control tests that pass:
    - `activityUri.test.tsx`: "control: without the Activity toggle the chosen protocol survives a path edit".
    - `uriSingleColon.test.tsx`: "control: editing a listed single-colon scheme keeps it".
    - `enumSearchLabels.test.tsx`: "control: typing the raw enum value finds that option".
    - `textareaRows.test.tsx`: "diagnostic: minRows and maxRows on the schema itself".
    - `consoleNoise.test.tsx`: all three tests (empty form, empty form under StrictMode, filled form).
    - `numberBoundaries.test.tsx`: all four tests.
    - `radioGroupName.test.tsx`: "choosing a shipping radio keeps the billing radio checked" and "control: a single radio field keeps its loaded selection checked".
  - Verification limits:
    - The probes import `@canard/schema-form` through its stale `dist` build, while every line blamed below is in plugin source.
    - React 18 was not run, so every result is for React 19.2.6.
    - `textareaRows.test.tsx` replaces `antd`'s `Input.TextArea` with `vi.mock` to read the `autoSize` prop.
    - The textarea is left out of `consoleNoise.test.tsx`, because jsdom's selector engine (nwsapi) rejects the `:focus-visible` selector that antd builds for an element whose `id` contains `/`.
- From `r3-contracts`:
  - None. The checks below were static.

Root-cause files: `packages/canard/schema-form-antd5-plugin/src/fieldInputs/`

## 1. After an `<Activity>` boundary is hidden and shown again, the URI input's protocol dropdown returns to the scheme it had at mount, and the next path edit writes that old scheme into the form value.

- Severity: high. A user who chose `https` in a tabbed form that wraps its tabs in `<Activity>` sees the dropdown switch back to `http` after leaving and returning to the tab, and the next keystroke in the path silently stores `http://…`.
- Affected public API: `FieldInputUriDefinition`.
- Contract violated: Predictable behavior: the same user actions with only an Activity hide and show added give a different stored value. The README promise of a protocol selection dropdown (`packages/canard/schema-form-antd5-plugin/README.md:87`) breaks, because the dropdown no longer shows the protocol the form holds.
- Root cause: `packages/canard/schema-form-antd5-plugin/src/fieldInputs/FieldInputUri.tsx:127-129` runs `setProtocol(initialProtocol)` in an effect. The core does not remount an input for a value the input wrote itself, so `defaultValue` stays the mount-time value (`packages/canard/schema-form/src/helpers/fieldInputDefinition/utils/withFieldInputErrorBoundary.tsx:37-40`), and `initialProtocol` stays the mount-time scheme. React 19 runs effects again when an Activity boundary is shown, so the effect overwrites the protocol the user chose.
- Relation to earlier rounds: Same class as round 2 cross-package class 4, "work done only in effects" (`../round-2/README.md`), whose members include `../round-2/lerx-promise-modal.md` item 5 and `../round-2/winglet-react-utils.md` item 1. Also the same class as round 1 class 11 (cleanup or effects that Activity runs without a real unmount).
- Reopens an earlier fix: No. `git log -L` on the effect lines shows `43270c880` from `../round-1/canard-schema-form-antd5-plugin.md` item 4, but that commit changed the initial state, and the effect predates it.
- Reproduction: `activityUri.test.tsx`.
  - "keeps the protocol the user chose after the Activity is hidden and shown": the actual value is `{ link: 'http://example.com/x' }`, and the expected value is `{ link: 'https://example.com/x' }`.
  - "shows the protocol the form holds after the Activity is hidden and shown": the dropdown shows `http://` while the form value is `https://example.com`.
- Confidence: high, public API.

## 2. Editing a URI with a single-colon scheme other than `mailto` and `tel`, such as `sms:`, `urn:` or `geo:`, prepends `http://`, and a configured `sms` protocol writes `sms://`.

- Severity: medium. One keystroke in the path of a stored `sms:+15551234` or `urn:isbn:0451450523` value stores `http://sms:+155512345`, which corrupts the value.
- Affected public API: `FieldInputUriDefinition` and `presentation.FieldInputProps.protocols`.
- Contract violated: `packages/canard/schema-form-antd5-plugin/README.md:87` says that a value whose scheme is not in the protocol list keeps that scheme. The known limit in `../round-1/FIXES.md` for this package covers only the uppercase `MAILTO:` scheme, and these lower-case schemes go past it.
- Root cause: `parseUri` recognizes a single-colon scheme only for `mailto` and `tel` (`packages/canard/schema-form-antd5-plugin/src/fieldInputs/FieldInputUri.tsx:49-55`), so any other single-colon URI reaches the fallback at `FieldInputUri.tsx:118-121`. The fallback selects the first listed protocol and puts the whole stored text in the path box. `getProtocolSeparator` (`FieldInputUri.tsx:33-37`) joins only `mailto` and `tel` with `:`, so a configured `sms` protocol is written with `://`.
- Relation to earlier rounds: Sibling of `../round-1/canard-schema-form-antd5-plugin.md` item 4.
- Reopens an earlier fix: Yes. The fix for `../round-1/canard-schema-form-antd5-plugin.md` item 4 (`311394c8b`, which `git log -L` shows on the fallback lines 102-122) records that an unlisted scheme is kept. That still fails for single-colon schemes, so the contract stands and the fix is incomplete.
- Reproduction: `uriSingleColon.test.tsx`.
  - "editing %s keeps its scheme", rows `sms:+15551234`, `urn:isbn:0451450523` and `geo:37.78,-122.4`: the actual value is `http://` followed by the edited text, such as `http://sms:+155512345`, and the expected value is the edited text alone, such as `sms:+155512345`.
  - "a configured single-colon protocol writes a single colon": the actual value is `sms://+15551234`, and the expected value is `sms:+15551234`.
- Confidence: high, public API.

## 3. An enum value named like an `Object.prototype` member gets an empty label (`constructor`, `toString`, `valueOf`), or makes the field fail to render (`__proto__`).

- Severity: medium. A schema such as `enum: ['owner', 'constructor', 'inspector']` shows an unlabeled option and logs "Functions are not valid as a React child". The value `__proto__` removes the whole field with `SCHEMA_FORM_ERROR.RENDER_FAILED`.
- Affected public API: `FieldInputRadioGroupDefinition`, `FieldInputStringCheckboxDefinition`, `FieldInputStringEnumDefinition` and `FieldInputStringSwitchDefinition`.
- Contract violated: `packages/canard/schema-form-antd5-plugin/CLAUDE.md:41` says that labels and aliases use the value's display string. The README promises custom labels for each option (`README.md:75`, `README.md:129`, `README.md:137`). A crash is also a failure of basic correctness.
- Root cause: The label maps are plain objects (`alias || {}` or the caller's `alias`), and the lookups read inherited keys. The inherited `Object` function or the `Object.prototype` object then becomes a React child. The lookups are at `FieldInputRadioGroup.tsx:55`, `FieldInputStringCheckbox.tsx:55`, `FieldInputStringEnum.tsx:56` and `FieldInputStringSwitch.tsx:51-52`, all under `packages/canard/schema-form-antd5-plugin/src/fieldInputs/`.
- Relation to earlier rounds: New class (an inherited-key lookup on a plain label map).
- Reopens an earlier fix: No. `git log -L` shows that the last change to these lines was `af0562d47`, which is not a bug bounty fix.
- Reproduction: `enumPrototypeLabels.test.tsx`.
  - "a radio option "constructor" shows its own value as the label": the actual labels are `['owner', '', 'inspector']`.
  - "a radio option "__proto__" renders instead of crashing the field": no radio renders, and the field reports `RENDER_FAILED`.
  - "a checkbox group option "toString" shows its own value as the label": the actual labels are `['', '', 'map']`.
  - "a select with alias labels shows "constructor" for the unlabeled option": the actual options are `['Owner', '']`.
  - "a string switch with enum ["constructor", "owner"] labels its states": the `constructor` label is missing.
- Confidence: high, public API.

## 4. Searching a multiple-choice enum select matches only the JSON-encoded raw values, so typing a displayed alias label finds no option.

- Severity: medium. In a multiple select that shows `kr` as "대한민국" through `alias`, typing "대한" or "United" leaves the list empty, so labels in another script cannot be found by typing.
- Affected public API: `FieldInputStringEnumDefinition` for an array schema, whose Select has search enabled by default.
- Contract violated: `packages/canard/schema-form-antd5-plugin/README.md:137` promises custom labels for each option. The search then works on text the user cannot see, which is not predictable.
- Root cause: `packages/canard/schema-form-antd5-plugin/src/fieldInputs/FieldInputStringEnum.tsx:64` passes the label as the child of `Select.Option`, and the Select at `FieldInputStringEnum.tsx:101-114` sets no `optionFilterProp`. rc-select therefore filters on `value`, which holds `JSON.stringify(rawValue)`, such as `"\"kr\""`.
- Relation to earlier rounds: New class.
- Reopens an earlier fix: No.
- Reproduction: `enumSearchLabels.test.tsx`.
  - "typing a displayed non-Latin label finds that option": the actual options are `[]`, and the expected options are `['대한민국']`.
  - "typing a displayed Latin label finds that option": the actual options are `[]`.
- Confidence: high, public API.

## 5. The textarea ignores `minRows` and `maxRows` placed in `presentation.FieldInputProps`, which is where the README tells readers to put per-input settings.

- Severity: low. This is a mismatch between the document and the code: a reader who follows the README gets no row limits for auto-sizing.
- Affected public API: `FieldInputTextareaDefinition`.
- Contract violated: `packages/canard/schema-form-antd5-plugin/README.md:155` lists `minRows` and `maxRows`, and `README.md:179` says that per-input settings go in `presentation.FieldInputProps`. The MUI plugin reads the same settings from either place.
- Root cause: `packages/canard/schema-form-antd5-plugin/src/fieldInputs/FieldInputTextarea.tsx:45-50` builds `autoSize` only from `jsonSchema.minRows` and `jsonSchema.maxRows`, which are keys on the schema root.
- Relation to earlier rounds: Same class as round 1 class 19, "documented examples or configurations that do not work" (`../round-1/README.md`).
- Reopens an earlier fix: No.
- Reproduction: `textareaRows.test.tsx`, "minRows and maxRows in presentation.FieldInputProps reach autoSize, as the README Input Settings section directs": the actual `autoSize` is `{ minRows: undefined, maxRows: undefined }`, and the expected `autoSize` is `{ minRows: 3, maxRows: 6 }`.
- Confidence: high, public API, with `antd`'s `TextArea` replaced to read its props.

## Symptoms of root causes in other packages

### Radio fields that share a leaf name lose a native checked state

This package shows the symptom of [@canard/schema-form item 6](canard-schema-form.md). The core passes `name` = `node.name`, which is the last key of the path, and `packages/canard/schema-form-antd5-plugin/src/fieldInputs/FieldInputRadioGroup.tsx:75` forwards it to the native radio inputs as their group name. Two radio fields with the same leaf name, such as `/billing/method` and `/shipping/method`, or the same field in two array items, therefore form one native radio group.

The visible selection stays correct, because antd draws it from the `ant-radio-wrapper-checked` class that comes from React state. The native `checked` state, which screen readers announce and `:checked` styles follow, loses one field's selection. A fix that changes only the core's built-in radio input leaves this package affected; a fix that makes the core's `name` prop unique fixes it too.

Reproduction: `radioGroupName.test.tsx`.
- "two radio fields with the same leaf name keep both loaded selections checked": the native `checked` state of `/shipping/method` is `[false, false]`, and the expected state is `[false, true]`.
- "radio fields inside two array items keep both loaded selections checked": the second item is `[false, false]`, and both items use the name `kind`.

## Hypotheses checked and not bugs

- From `r3-ui-plugins`:
  - Typing `1e21` into the number input stores `1e21`.
  - Typing `-0` into the number input stores a zero.
  - Stepping from 0.2 with `multipleOf: 0.1` stores exactly 0.3 and displays `0.3`.
  - After two steps above `Number.MAX_SAFE_INTEGER`, the displayed number equals the stored value.
  - An empty form and a filled form mount without console warnings, with or without StrictMode.
  - The "registering a cleanup function after unmount" warnings that appear under `<Activity>` come from `@ant-design/cssinjs`, not from this plugin.
  - The built `dist` contains no syntax newer than ES2020, which matches the README compatibility claim.
- From `r3-contracts`:
  - The peer and dependency majors of `antd`, `dayjs` and `@ant-design/icons` agree, and the same holds for the antd6, MUI and antd-mobile plugins after the round 2 fix.
  - The published declarations import `antd/es/config-provider/SizeContext` and `antd/es/switch`, which exist in antd 5.27.0 and 6.2.2, neither of which restricts deep imports with an `exports` field.

## Open leads

- From `r3-ui-plugins`:
  - Arrow-key navigation in a real browser probably moves between the radios of two fields that share a native group, because they share a name. jsdom does not implement arrow-key navigation between radios, so this was not confirmed.
