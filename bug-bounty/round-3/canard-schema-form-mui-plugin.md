# @canard/schema-form-mui-plugin: bug bounty round 3

This round confirmed 5 new findings in `@canard/schema-form-mui-plugin`. Items in the earlier round documents ([round 1](../round-1/canard-schema-form-mui-plugin.md), [round 2](../round-2/canard-schema-form-mui-plugin.md)) were treated as fixed and excluded. The main session re-ran every probe. Verification limits are listed under the probes.

Probes: [probes/canard-schema-form-mui-plugin/](probes/canard-schema-form-mui-plugin/)

- From `r3-ui-plugins`:
  - Probe folder in the working tree: `packages/canard/schema-form-mui-plugin/src/__bounty__/r3-ui-plugins/`; the round copy is `bug-bounty/round-3/probes/canard-schema-form-mui-plugin/r3-ui-plugins/`.
  - To run the copy: copy it back to `packages/canard/schema-form-mui-plugin/src/__bounty__/r3-ui-plugins/` and run `yarn workspace @canard/schema-form-mui-plugin test --run src/__bounty__/r3-ui-plugins/`.
  - Failing tests that are not findings: none.
  - Control tests that pass:
    - `activityUri.test.tsx`: "control: without the Activity toggle the chosen protocol survives a path edit" and "control: the first client render shows the stored scheme".
    - `uriSingleColon.test.tsx`: "control: editing a listed single-colon scheme keeps it".
    - `consoleNoise.test.tsx`: "a filled form mounts without console warnings or errors".
    - `popupUnmount.test.tsx`: both tests.
    - `radioGroupName.test.tsx`: "choosing a shipping radio keeps the billing radio checked" and "control: a single radio field keeps its loaded selection checked".
  - Verification limits:
    - The probes import `@canard/schema-form` through its stale `dist` build, while every line blamed below is in plugin source.
    - React 18 was not run.
    - The server render check uses `renderToString` and does not hydrate the markup.

Root-cause files: `packages/canard/schema-form-mui-plugin/src/fieldInputs/`

## 1. After an `<Activity>` boundary is hidden and shown again, the URI input's protocol dropdown returns to the scheme it had at mount, and the next path edit writes that old scheme into the form value.

- Severity: high. A user who chose `https` in a tabbed form that wraps its tabs in `<Activity>` sees the dropdown switch back to `http` after returning to the tab, and the next keystroke in the path silently stores `http://…`.
- Affected public API: `FieldInputUriDefinition`.
- Contract violated:
  - The rule in `packages/canard/schema-form-mui-plugin/src/INTENT.md` (Never do) against silently changing node values while rendering inputs.
  - The protocol dropdown described in `packages/canard/schema-form-mui-plugin/README.md:71`.
  - Predictable behavior across lifecycles.
- Root cause: `packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputUri.tsx:163-165` runs `setProtocol(initialProtocol)` in an effect, and `initialProtocol` comes from the mount-time `defaultValue` (`packages/canard/schema-form/src/helpers/fieldInputDefinition/utils/withFieldInputErrorBoundary.tsx:37-40`). React 19 runs the effect again when the Activity boundary is shown, which overwrites the protocol the user chose.
- Relation to earlier rounds: Same class as round 2 cross-package class 4 (`../round-2/README.md`) and round 1 class 11.
- Reopens an earlier fix: No. `git log -L` shows `36b9af67d` from `../round-1/canard-schema-form-mui-plugin.md` item 2 on these lines, but that fix addressed unlisted schemes, and the effect predates it.
- Reproduction: `activityUri.test.tsx`.
  - "keeps the protocol the user chose after the Activity is hidden and shown": the actual value is `{ link: 'http://example.com/x' }`, and the expected value is `{ link: 'https://example.com/x' }`.
  - "shows the protocol the form holds after the Activity is hidden and shown": the dropdown shows `http://`.
- Confidence: high, public API.

## 2. Editing a URI with a single-colon scheme other than `mailto` and `tel`, such as `sms:`, `urn:` or `geo:`, prepends `http://`, and a configured `sms` protocol writes `sms://`.

- Severity: medium. One keystroke in the path of a stored `sms:` or `urn:` value stores `http://sms:…`, which corrupts the value.
- Affected public API: `FieldInputUriDefinition` and `presentation.FieldInputProps.protocols`.
- Contract violated: `packages/canard/schema-form-mui-plugin/README.md:71` promises support for single-colon protocols like `mailto` and `tel`, and says that a scheme outside the list is kept.
- Root cause: `parseUri` recognizes a single-colon scheme only for `mailto` and `tel` (`packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputUri.tsx:58-64`), so other single-colon URIs reach the fallback at `FieldInputUri.tsx:155-159`. `getProtocolSeparator` (`FieldInputUri.tsx:42-46`) writes `://` for every other scheme.
- Relation to earlier rounds: Sibling of `../round-1/canard-schema-form-mui-plugin.md` item 2.
- Reopens an earlier fix: Yes. The fix for `../round-1/canard-schema-form-mui-plugin.md` item 2 (`36b9af67d`) records that an unlisted scheme is kept, which still fails for single-colon schemes. The contract stands and the fix is incomplete.
- Reproduction: `uriSingleColon.test.tsx`.
  - "editing %s keeps its scheme", three rows: the actual value is `http://` followed by the edited text.
  - "a configured single-colon protocol writes a single colon": the actual value is `sms://+15551234`.
- Confidence: high, public API.

## 3. With `alias` labels, an enum value named like an `Object.prototype` member gets an empty label (`constructor`, `toString`), or makes the field fail to render (`__proto__`).

- Severity: medium. With any `alias` object, an option named `constructor` shows no label and logs a React child error, and `__proto__` removes the field with `SCHEMA_FORM_ERROR.RENDER_FAILED`.
- Affected public API: `FieldInputRadioGroupDefinition`, `FieldInputStringCheckboxDefinition` and `FieldInputStringEnumDefinition` with `presentation.FieldInputProps.alias`.
- Contract violated: `packages/canard/schema-form-mui-plugin/CLAUDE.md:39` and the README promise of custom labels (`README.md:59`, `README.md:95`, `README.md:101`). A crash is also a failure of basic correctness.
- Root cause: `alias?.['' + rawValue]` reads inherited keys at `FieldInputRadioGroup.tsx:67`, `FieldInputStringCheckbox.tsx:65` and `FieldInputStringEnum.tsx:78`, all under `packages/canard/schema-form-mui-plugin/src/fieldInputs/`. Without `alias`, the lookup returns `undefined` and the label is correct.
- Relation to earlier rounds: New class.
- Reopens an earlier fix: No.
- Reproduction: `enumPrototypeLabels.test.tsx`.
  - Radio "constructor": the actual labels are `['Owner', '']`.
  - Radio "__proto__": no radio renders.
  - Checkbox "toString": the actual labels are `['Owner', '']`.
  - Select "constructor": the actual options are `['Owner', '']`.
- Confidence: high, public API.

## 4. The server render and the first client paint of the URI input show the first listed protocol instead of the stored scheme.

- Severity: low. A server-rendered page shows `http://` for a stored `https://example.com` until the client effect runs, and the first client paint flashes the wrong scheme.
- Affected public API: `FieldInputUriDefinition`.
- Contract violated: `packages/canard/schema-form-mui-plugin/README.md:71` and predictable behavior: the server and the client give different results for the same value.
- Root cause: `packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputUri.tsx:130` starts the protocol state at `normalizedProtocols[0]` and corrects it only in the effect at `FieldInputUri.tsx:163`. The antd plugins start from the parsed scheme after `43270c880` and `f3316453a`, but that change was not ported here.
- Relation to earlier rounds: Same class as round 2 cross-package class 4 (state missing from the server render) in `../round-2/README.md`, and a sibling of the antd change `43270c880` recorded under `../round-1/canard-schema-form-antd5-plugin.md` item 4.
- Reopens an earlier fix: No.
- Reproduction: `activityUri.test.tsx`, "server markup shows the stored scheme, not the first protocol": the actual protocol text is `http://`, and the expected text is `https://`.
- Confidence: high, public API through `renderToString`.

## 5. An enum select with no value logs MUI's "out-of-range value `undefined`" warning on every mount.

- Severity: low. Every empty enum select adds two or three development console warnings, and three under StrictMode.
- Affected public API: `FieldInputStringEnumDefinition`.
- Contract violated: The quality criterion for console noise.
- Root cause: `packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputStringEnum.tsx:110` passes `defaultValue={undefined}` for an empty field, and MUI's `SelectInput` (`node_modules/@mui/material/esm/Select/SelectInput.js:392`) warns for any value that is not an option or `''`.
- Relation to earlier rounds: New class.
- Reopens an earlier fix: No.
- Reproduction: `consoleNoise.test.tsx`.
  - "an empty form mounts without console warnings or errors": two out-of-range warnings.
  - "an empty form mounts under StrictMode without console warnings or errors": three warnings.
- Confidence: high, public API.

## Symptoms of root causes in other packages

### Radio fields that share a leaf name lose a native checked state

This package shows the symptom of [@canard/schema-form item 6](canard-schema-form.md). `packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputRadioGroup.tsx:102` forwards the core's `name` prop, which is `node.name`, to MUI's `RadioGroup`, so radio fields with the same leaf name share one native group.

The visible selection follows the `Mui-checked` class and stays correct, but the native `checked` state loses one field's selection.

Reproduction: `radioGroupName.test.tsx`.
- "two radio fields with the same leaf name keep both loaded selections checked": `/shipping/method` is `[false, false]`.
- "radio fields inside two array items keep both loaded selections checked": the second item is `[false, false]`, and both items share the name `kind`.

## Hypotheses checked and not bugs

- From `r3-ui-plugins`:
  - Unmounting a form while a select menu is open leaves no menu, no `body` scroll lock and no `aria-hidden` sibling.
  - Hiding the field through `controls.visible` while its select menu is open leaves no menu, no `body` scroll lock and no `aria-hidden` sibling.
  - A filled form mounts without console warnings.

## Open leads

- From `r3-ui-plugins`:
  - Arrow-key navigation between radios that share a native group was not checked, because jsdom does not implement it.
