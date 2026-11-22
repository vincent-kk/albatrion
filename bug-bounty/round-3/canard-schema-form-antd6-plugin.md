# @canard/schema-form-antd6-plugin: bug bounty round 3

This round confirmed 6 new findings in `@canard/schema-form-antd6-plugin`. Items in the earlier round documents ([round 1](../round-1/canard-schema-form-antd6-plugin.md), [round 2](../round-2/canard-schema-form-antd6-plugin.md)) were treated as fixed and excluded. The main session re-ran every probe. Verification limits are listed under the probes.

Probes: [probes/canard-schema-form-antd6-plugin/](probes/canard-schema-form-antd6-plugin/)

- From `r3-ui-plugins`:
  - Probe folder in the working tree: `packages/canard/schema-form-antd6-plugin/src/__bounty__/r3-ui-plugins/`; the round copy is `bug-bounty/round-3/probes/canard-schema-form-antd6-plugin/r3-ui-plugins/`.
  - To run the copy: copy it back to `packages/canard/schema-form-antd6-plugin/src/__bounty__/r3-ui-plugins/` and run `yarn workspace @canard/schema-form-antd6-plugin test --run src/__bounty__/r3-ui-plugins/`.
  - Failing tests that are not findings: none.
  - Control tests that pass:
    - `activityUri.test.tsx`: "control: without the Activity toggle the chosen protocol survives a path edit".
    - `uriSingleColon.test.tsx`: "control: editing a listed single-colon scheme keeps it".
    - `enumSearchLabels.test.tsx`: "control: typing the raw enum value finds that option".
    - `radioGroupName.test.tsx`: "control: a single radio field keeps its loaded selection checked".
  - Verification limits:
    - The probes import `@canard/schema-form` through its stale `dist` build, while every line blamed below is in plugin source.
    - React 18 was not run.
    - The probes stub `ResizeObserver`, which antd 6 needs and jsdom lacks.
    - Item 9-antd6 is a static check, without a probe of its own.

Root-cause files: `packages/canard/schema-form-antd6-plugin/src/fieldInputs/`

## 1. After an `<Activity>` boundary is hidden and shown again, the URI input's protocol dropdown returns to the scheme it had at mount, and the next path edit writes that old scheme into the form value.

- Severity: high. A user who chose `https` in a tabbed form that wraps its tabs in `<Activity>` sees the dropdown switch back to `http` after leaving and returning to the tab, and the next keystroke in the path silently stores `http://…`.
- Affected public API: `FieldInputUriDefinition`.
- Contract violated: Predictable behavior: the same user actions with only an Activity hide and show added give a different stored value. The protocol dropdown described in `packages/canard/schema-form-antd6-plugin/README.md:108` no longer shows the protocol the form holds.
- Root cause: `packages/canard/schema-form-antd6-plugin/src/fieldInputs/FieldInputUri.tsx:127-129` runs `setProtocol(initialProtocol)` in an effect, and `initialProtocol` comes from the mount-time `defaultValue`, because the core does not remount an input for a value the input wrote itself (`packages/canard/schema-form/src/helpers/fieldInputDefinition/utils/withFieldInputErrorBoundary.tsx:37-40`). React 19 runs the effect again when the Activity boundary is shown, which overwrites the protocol the user chose.
- Relation to earlier rounds: Same class as round 2 cross-package class 4, "work done only in effects" (`../round-2/README.md`), and round 1 class 11.
- Reopens an earlier fix: No. `git log -L` on the effect lines shows `f3316453a` from `../round-1/canard-schema-form-antd6-plugin.md` item 4, but that commit changed the initial state, and the effect predates it.
- Reproduction: `activityUri.test.tsx`.
  - "keeps the protocol the user chose after the Activity is hidden and shown": the actual value is `{ link: 'http://example.com/x' }`, and the expected value is `{ link: 'https://example.com/x' }`.
  - "shows the protocol the form holds after the Activity is hidden and shown": the dropdown shows `http://` while the value is `https://example.com`.
- Confidence: high, public API.

## 2. Editing a URI with a single-colon scheme other than `mailto` and `tel`, such as `sms:`, `urn:` or `geo:`, prepends `http://`, and a configured `sms` protocol writes `sms://`.

- Severity: medium. One keystroke in the path of a stored `sms:` or `urn:` value stores `http://sms:…`, which corrupts the value.
- Affected public API: `FieldInputUriDefinition` and `presentation.FieldInputProps.protocols`.
- Contract violated: `packages/canard/schema-form-antd6-plugin/README.md:108` says that a value whose scheme is not in the protocol list keeps that scheme.
- Root cause: `parseUri` recognizes a single-colon scheme only for `mailto` and `tel` (`packages/canard/schema-form-antd6-plugin/src/fieldInputs/FieldInputUri.tsx:49-55`), so other single-colon URIs reach the fallback at `FieldInputUri.tsx:118-121`. The fallback selects the first listed protocol and keeps the whole text as the path. `getProtocolSeparator` (`FieldInputUri.tsx:33-37`) writes `://` for every scheme except `mailto` and `tel`.
- Relation to earlier rounds: Sibling of `../round-1/canard-schema-form-antd6-plugin.md` item 4.
- Reopens an earlier fix: Yes. The fix for `../round-1/canard-schema-form-antd6-plugin.md` item 4 (`8fac0d7a4`) records that an unlisted scheme is kept. That still fails for single-colon schemes, so the contract stands and the fix is incomplete.
- Reproduction: `uriSingleColon.test.tsx`.
  - "editing %s keeps its scheme", rows `sms:`, `urn:` and `geo:`: the actual value is `http://` followed by the edited text, and the expected value is the edited text alone.
  - "a configured single-colon protocol writes a single colon": the actual value is `sms://+15551234`, and the expected value is `sms:+15551234`.
- Confidence: high, public API.

## 3. An enum value named like an `Object.prototype` member gets an empty label (`constructor`, `toString`, `valueOf`), or makes the field fail to render (`__proto__`).

- Severity: medium. An option named `constructor` shows no label and logs "Functions are not valid as a React child". The value `__proto__` removes the field with `SCHEMA_FORM_ERROR.RENDER_FAILED`.
- Affected public API: `FieldInputRadioGroupDefinition`, `FieldInputStringCheckboxDefinition`, `FieldInputStringEnumDefinition` and `FieldInputStringSwitchDefinition`.
- Contract violated: `packages/canard/schema-form-antd6-plugin/CLAUDE.md:41` says that labels use the value's display string. The README promises custom labels for each option (`README.md:96`, `README.md:150`, `README.md:158`). A crash is also a failure of basic correctness.
- Root cause: The plain-object label maps are read with inherited keys at `FieldInputRadioGroup.tsx:55`, `FieldInputStringCheckbox.tsx:55`, `FieldInputStringEnum.tsx:56` and `FieldInputStringSwitch.tsx:51-52`, all under `packages/canard/schema-form-antd6-plugin/src/fieldInputs/`. The inherited function or object is then rendered as a label.
- Relation to earlier rounds: New class.
- Reopens an earlier fix: No.
- Reproduction: `enumPrototypeLabels.test.tsx`.
  - Radio "constructor": the actual labels are `['owner', '', 'inspector']`.
  - Radio "__proto__": no radio renders.
  - Checkbox "toString": the actual labels are `['', '', 'map']`.
  - Select with alias: the actual options are `['Owner', '']`.
  - String switch: the `constructor` label is missing.
- Confidence: high, public API.

## 4. Searching a multiple-choice enum select matches only the JSON-encoded raw values, so typing a displayed alias label finds no option.

- Severity: medium. Labels supplied through `alias`, including labels in another script, cannot be found by typing in the multiple select.
- Affected public API: `FieldInputStringEnumDefinition` for an array schema.
- Contract violated: `packages/canard/schema-form-antd6-plugin/README.md:158` promises custom labels for each option, while the search works on text the user cannot see.
- Root cause: `packages/canard/schema-form-antd6-plugin/src/fieldInputs/FieldInputStringEnum.tsx:64` passes the label as the child of `Select.Option`, and the Select at `FieldInputStringEnum.tsx:100-113` sets no `optionFilterProp`, so filtering uses the JSON-encoded `value`.
- Relation to earlier rounds: New class.
- Reopens an earlier fix: No.
- Reproduction: `enumSearchLabels.test.tsx`.
  - "typing a displayed non-Latin label finds that option": the actual options are `[]`, and the expected options are `['대한민국']`.
  - "typing a displayed Latin label finds that option": the actual options are `[]`.
- Confidence: high, public API.

## 5. The textarea ignores `minRows` and `maxRows` placed in `presentation.FieldInputProps`, which is where the README tells readers to put per-input settings.

- Severity: low. A reader who follows the README gets no row limits for auto-sizing.
- Affected public API: `FieldInputTextareaDefinition`.
- Contract violated: `packages/canard/schema-form-antd6-plugin/README.md:176` and `README.md:200`.
- Root cause: `packages/canard/schema-form-antd6-plugin/src/fieldInputs/FieldInputTextarea.tsx:47-48` reads only `jsonSchema.minRows` and `jsonSchema.maxRows`. The code is the same as in the antd5 plugin, where the probe fails.
- Relation to earlier rounds: Same class as round 1 class 19 (`../round-1/README.md`).
- Reopens an earlier fix: No.
- Reproduction: No probe in this package. The code matches `packages/canard/schema-form-antd5-plugin/src/fieldInputs/FieldInputTextarea.tsx:45-50`, and the antd5 probe `textareaRows.test.tsx` fails.
- Confidence: high, static check.

## 6. Every render of the URI input logs the antd 6 warning that `addonBefore` is deprecated.

- Severity: low. Each URI field adds development console noise, and the warning repeats under StrictMode.
- Affected public API: `FieldInputUriDefinition`.
- Contract violated: The quality criterion for console noise. The same empty and filled forms in the antd5 plugin log nothing.
- Root cause: `packages/canard/schema-form-antd6-plugin/src/fieldInputs/FieldInputUri.tsx:189` passes `addonBefore` to `Input`, which antd 6 deprecates in favor of `Space.Compact`.
- Relation to earlier rounds: New class.
- Reopens an earlier fix: No.
- Reproduction: `consoleNoise.test.tsx`. "an empty form mounts without console warnings or errors" and "a filled form mounts without console warnings or errors" each log one `addonBefore` warning, and the StrictMode test logs two.
- Confidence: high, public API.

## Symptoms of root causes in other packages

### Radio fields that share a leaf name lose a native checked state

This package shows the symptom of [@canard/schema-form item 6](canard-schema-form.md). `packages/canard/schema-form-antd6-plugin/src/fieldInputs/FieldInputRadioGroup.tsx:74` forwards the core's `name` prop, which is `node.name`, as the native radio group name. Radio fields with the same leaf name therefore share one native group.

The visible selection follows the `ant-radio-wrapper-checked` class and stays correct, but the native `checked` state loses one field's selection. In this package the native state is also lost after a click on the other field.

Reproduction: `radioGroupName.test.tsx`.
- "two radio fields with the same leaf name keep both loaded selections checked": `/shipping/method` is `[false, false]`.
- "choosing a shipping radio keeps the billing radio checked": `/billing/method` is `[false, false]` after the shipping click.
- "radio fields inside two array items keep both loaded selections checked": the second item is `[false, false]`, and both items share the name `kind`.

## Hypotheses checked and not bugs

- From `r3-ui-plugins`:
  - The URI, enum and radio code in this package is the same as in the antd5 plugin, and every probe ported from antd5 gave the same result here.

## Open leads

- From `r3-ui-plugins`:
  - Arrow-key navigation between radios that share a native group was not checked, because jsdom does not implement it.
