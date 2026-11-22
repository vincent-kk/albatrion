# Bug bounty round 5

Round 5 treated every item of [round 1](../round-1/README.md), [round 2](../round-2/README.md), [round 3](../round-3/README.md) and [round 4](../round-4/README.md) as fixed and excluded it, together with the decisions and known limits that the rounds' `FIXES.md` files record. It ran on branch `1.0.0/bugbounty` at base commit `3ca1fe831`, where the round 1 to round 4 fixes are merged and every package's `dist` was rebuilt at that commit; when the round started, no file under `packages/` was modified, and the only untracked path outside the round was an empty Vitest cache folder, `packages/canard/node_modules/`. The 16 package documents hold 69 items that come from 53 distinct defects: a defect in lines that several plugins each own, such as the slider bounds helper of the UI plugins or the alias registration of the AJV plugins, is recorded once in each package that owns its own lines, and a symptom whose cause another package owns cites that package's item. One item is high, and none is critical. Every finding rests on a probe that fails because of it, or on a static check that its document names; the main session re-ran every hunter's probe folders, including the re-runs of all earlier probes, and mapped each failing test to a finding, a diagnostic, a measurement, a rejected hypothesis, a recorded decision, a broken identifier interface or an environment limit.

## Areas and angles

Angle ids are defined in `.claude/skills/bug-bounty/references/angles.md`. This round added two angles to the catalog: `RG2` (re-run every probe earlier rounds kept, at the current commit, and give each failing test one role) and `RG3` (treat each recorded decision and known limit as a contract and test the cases it implies). An asterisk marks an angle used in that area for the first time. The round brief also asked every hunter to label each finding as a regression of an earlier fix or not, and as a repeat of a point on the fix session's watch list or not.

- `r5-rerun-core`, `@canard/schema-form`, every kept probe of rounds 1 to 4 on React 19 and 18: `RG2`*, `RG1`, `EQ5`.
- `r5-rerun-plugins`, the seven plugins, every kept probe of rounds 1 to 4: `RG2`*, `RG1`.
- `r5-rerun-others`, the utility packages, `@lerx/promise-modal` and `@slats/agents-assets-sync`, every kept probe of rounds 1 to 4: `RG2`*, `RG1`.
- `r5-core`, `@canard/schema-form` compile time, engine and React layer except identifiers: `RG3`*, `FP2`*, `IN1`*, `RG1`, `EQ10`, `EQ8`.
- `r5-ids`, the DOM identifier design across the core and the four UI plugins: `RG3`*, `EQ1`*, `IN2`*, `IN3`, `EQ5`, `EQ11`.
- `r5-ui-rules`, the shared value rules of the four UI plugins: `RG3`*, `LC1`*, `EQ10`*, `EQ11`, `RG1`, `BS2`.
- `r5-ajv-ownership`, schema registration ownership in the three AJV plugins with the core's validator wiring: `RG3`*, `EQ3`*, `LC3`*, `LC4`*, `IN3`, `RG1`, with `EQ11` and `FP4`.
- `r5-ajv-results`, what a validation call returns in the three AJV plugins: `RG3`*, `EQ10`*, `FP2`*, `EQ11`, `BS2`, `LC1`, with `RG1`.
- `r5-winglet-data`, `@winglet/common-utils`, `@winglet/json`, `@winglet/json-schema` and `@winglet/data-loader`: `RG3`*, `EQ11`*, `EQ3`*, `RG1`, `LC2`, `EQ10`.
- `r5-style-react-modal`, `@winglet/style-utils`, `@winglet/react-utils` and `@lerx/promise-modal`: `RG3`*, `EQ11`*, `IN1`*, `RG1`, `EQ5`, `BS4`, with `EQ4`, `EQ7` and `CA2`.
- `r5-agents-assets-sync`: `RG3`*, `EQ11`*, `CA2`*, `RG1`, `EQ9`, `FP2`, with `BS4`.
- `r5-release`, the 16 published packages as release artifacts from the fresh `dist`: `RG2`*, `RG3`*, `EQ5`*, `EQ11`*, `CA3`, `EQ3`, with `CA1`, `CA2` and `RG1`.

## Package documents

| Package | Items | High, medium, low | Document |
| --- | --- | --- | --- |
| `@canard/schema-form` | 6 | 0, 1, 5 | [canard-schema-form.md](canard-schema-form.md) |
| `@canard/schema-form-ajv6-plugin` | 6 | 1, 3, 2 | [canard-schema-form-ajv6-plugin.md](canard-schema-form-ajv6-plugin.md) |
| `@canard/schema-form-ajv7-plugin` | 5 | 0, 5, 0 | [canard-schema-form-ajv7-plugin.md](canard-schema-form-ajv7-plugin.md) |
| `@canard/schema-form-ajv8-plugin` | 5 | 0, 4, 1 | [canard-schema-form-ajv8-plugin.md](canard-schema-form-ajv8-plugin.md) |
| `@canard/schema-form-antd5-plugin` | 4 | 0, 3, 1 | [canard-schema-form-antd5-plugin.md](canard-schema-form-antd5-plugin.md) |
| `@canard/schema-form-antd6-plugin` | 3 | 0, 2, 1 | [canard-schema-form-antd6-plugin.md](canard-schema-form-antd6-plugin.md) |
| `@canard/schema-form-mui-plugin` | 7 | 0, 3, 4 | [canard-schema-form-mui-plugin.md](canard-schema-form-mui-plugin.md) |
| `@canard/schema-form-antd-mobile-plugin` | 5 | 0, 3, 2 | [canard-schema-form-antd-mobile-plugin.md](canard-schema-form-antd-mobile-plugin.md) |
| `@lerx/promise-modal` | 1 | 0, 0, 1 | [lerx-promise-modal.md](lerx-promise-modal.md) |
| `@slats/agents-assets-sync` | 11 | 0, 2, 9 | [slats-agents-assets-sync.md](slats-agents-assets-sync.md) |
| `@winglet/common-utils` | 7 | 0, 0, 7 | [winglet-common-utils.md](winglet-common-utils.md) |
| `@winglet/data-loader` | 0 | 0, 0, 0 | [winglet-data-loader.md](winglet-data-loader.md) |
| `@winglet/json` | 2 | 0, 0, 2 | [winglet-json.md](winglet-json.md) |
| `@winglet/json-schema` | 1 | 0, 0, 1 | [winglet-json-schema.md](winglet-json-schema.md) |
| `@winglet/react-utils` | 2 | 0, 0, 2 | [winglet-react-utils.md](winglet-react-utils.md) |
| `@winglet/style-utils` | 4 | 0, 1, 3 | [winglet-style-utils.md](winglet-style-utils.md) |

## Regressions and watch-list repeats

Twelve items are regressions of an earlier fix, all of case (b), a defect that a listed fix commit introduced while the input had behaved correctly before it: [ajv6](canard-schema-form-ajv6-plugin.md) items 1 (high), 4, 5 and 6; [MUI](canard-schema-form-mui-plugin.md) item 4; [`@winglet/common-utils`](winglet-common-utils.md) item 1; [`@winglet/style-utils`](winglet-style-utils.md) item 1 (medium); [`@lerx/promise-modal`](lerx-promise-modal.md) item 1, with a contract caveat; and [`@slats/agents-assets-sync`](slats-agents-assets-sync.md) items 2 (medium), 3, 4 and 5. No behavior that a `FIXES.md` records as fixed fails again: the three re-run hunters found no regression of that kind among the earlier probes. Two claimed regressions were reclassified as reopened inputs, because the input never had a correct result before the fix: `@winglet/common-utils` item 2 (before `a925ee17e` a foreign Error was returned by reference) and the antd-mobile part of `r5-ui-rules`' off-grid stepping, antd-mobile item 4 (before `7087cf111` there was no keyboard stepping at all).

Twenty-four items repeat a point on the fix session's watch list; ten of them are at medium or above, the threshold the fix session and this session agreed for a repeat to count toward another round: `@canard/schema-form` item 1 (virtual paths as storage addresses), ajv6 items 1, 2 and 3, ajv7 items 1 and 2 and ajv8 items 1 and 2 (registration and compile cache of the AJV plugins), `@winglet/style-utils` item 1 (`compressCss` and the scoper) and `@slats/agents-assets-sync` item 1 (the redesigned run plan).

## Priorities

The high item:

- [`@canard/schema-form-ajv6-plugin` item 1](canard-schema-form-ajv6-plugin.md): after the plugin releases a form root equal to a schema the application compiled with `ajv.compile(schema)` or `ajv.validate(schema, data)`, the application's next `ajv.validate(schema, data)` throws `already exists`, and every later form root with that schema fails to compile. The core releases a root whenever a route rebuilds a same-`$id` schema object, so ordinary AJV 6 usage triggers it. It is a regression of the round 4 ownership fix `2e4061359`.

Medium items: `@canard/schema-form` item 1 makes a virtual group with an inactive earlier constituent report a shortened tuple, so a grouped widget deletes the following stored field. The AJV plugins add an embedded resource whose shared `$id` the plugin overwrites and then leaves dangling (ajv6 item 2, ajv7 item 1, ajv8 item 1), adapters memoized per route whose last roots are never released, so the next visit after garbage collection fails to compile in AJV 7 and 8 (ajv6 item 3, ajv7 item 2, ajv8 item 2), asynchronous keywords and formats that fail to compile in common schema shapes (ajv6 item 4, ajv7 items 3 and 4, ajv8 item 3), and keyword exceptions that carry an `errors` array returned as validation issues (ajv7 item 5, ajv8 item 4). The UI plugins add controls with no accessible name in `Form.Label` layouts (antd5 and antd6 item 1, antd-mobile item 1, MUI item 2), sliders that ignore `exclusiveMinimum` and `exclusiveMaximum` (antd5 and antd6 item 2, MUI item 3, antd-mobile item 2), the MUI slider's off-grid PageUp, PageDown and Shift+Arrow steps (MUI item 1), and peer-range floors whose library versions break the default slider or the empty number field (antd5 item 3, antd-mobile item 3). `@winglet/style-utils` item 1 silently drops another identifier's first rule after a nested statement at-rule, and `@slats/agents-assets-sync` items 1 and 2 delete a failed participant's files under `--force` and append duplicate managed blocks on every run after an END line is lost.

Items that need the owner's decision rather than a direct fix: `@lerx/promise-modal` item 1 (whether suspended content counts as displayed when focus is returned), `@winglet/style-utils` item 3 (the documents conflict on whether `+` outside parentheses is a combinator or a sign), `@winglet/common-utils` item 5 (whether to copy own fields of built-in subclass instances or only document the limit), the expected values of the exclusive-bound slider items (which inner grid value an endpoint key picks), and the contracts named under the wave decision below.

## Cross-package classes

Next round's hunters look for siblings of these classes. The numbering continues round 4's list, which ended at 42.

43. Ownership inferred from incomplete evidence about state that another path created: ajv6 item 1 (an environment the application cached through `compile` is not found in `_schemas`, so it is classed as plugin-owned), ajv6 item 2, ajv7 item 1 and ajv8 item 1 (an overwritten application alias is not recorded because only absent keys are), and ajv6 item 5 (a private compiler copies the application's schemas once and keeps them after the application removes them). Round 4 class 33 is the neighbor.
44. Cleanup and bookkeeping scoped to an owner that can disappear or fail first: ajv6 item 3, ajv7 item 2 and ajv8 item 2 (a collected adapter takes its `FinalizationRegistry` with it), ajv8 item 5 (the 64-root cap counted per adapter), and `@slats/agents-assets-sync` item 1 (a failed participant's plan is dropped from the run-wide set of managed files).
45. Accessible names that only the plugin's own renderer supplies: antd5 and antd6 item 1, antd-mobile item 1 and MUI item 2, with MUI item 4 as the duplicate-id variant. The core's own inputs read `labelId` directly, so this is also an instance of round 4 class 32.
46. Numeric schema constraints that a UI value picker does not fully honor: the exclusive bounds (antd5 and antd6 item 2, MUI item 3, antd-mobile item 2), steps written with an exponent (antd5 and antd6 item 4, antd-mobile item 5), the MUI shift step (MUI item 1), and keyboard steps from an off-grid stored value (MUI item 5, antd-mobile item 4).
47. Fallbacks keyed to one error message or one input shape that the fix tested: ajv6 item 4 and ajv7 item 4 (the asynchronous retry recognizes only the keyword message, not the format message), ajv7 item 3 and ajv8 item 3 (the `$async` wrapper works only when AJV inlines the root, which it does only without `$ref`), and ajv7 item 5 and ajv8 item 4 (any `Error` with an `errors` array is taken for AJV's ValidationError).

Earlier classes that recurred: round 4 class 34 (a virtual path as a storage address: `@canard/schema-form` items 1 and 4), class 37 (inherited prototype members read as data: `@winglet/common-utils` item 4, `@winglet/json` item 1), class 38 (scanners that ignore lexical context: `@winglet/style-utils` items 1 to 3, `@slats/agents-assets-sync` items 2 and 3), class 39 (documents and translations a fix did not update: `@canard/schema-form` item 5, MUI item 7, `@winglet/common-utils` items 5 and 6, `@winglet/react-utils` item 2, `@winglet/style-utils` item 4, `@slats/agents-assets-sync` items 9 to 11), class 40 (run-time APIs and type requirements newer than the documented range, now at the floor of a peer or type range: antd5 item 3, antd-mobile item 3, `@winglet/react-utils` item 1, `@canard/schema-form` item 6, `@winglet/common-utils` item 7), class 41 (results that depend on the output mode: `@slats/agents-assets-sync` items 6 and 8), class 42 (spelling variants of one value: `@winglet/json` item 2, `@winglet/json-schema` item 1), class 36 (walks that never finish: `@canard/schema-form` item 3), and round 2 class 7 (recursion depth: `@winglet/common-utils` item 3).

## Areas to revisit

No hunter reached the cap of 20; the largest list had 11 items in one package. One area produced a high finding from angles new to it and is revisited if another round runs:

- `r5-ajv-ownership`: ajv6 item 1, from `RG3` (the round 4 ownership decision tested as a contract) with `EQ3` and `LC4`.

The areas whose new angles produced medium findings, `r5-core`, `r5-ids`, `r5-ui-rules`, `r5-ajv-results`, `r5-style-react-modal`, `r5-agents-assets-sync` and `r5-release`, keep their priority. The three re-run areas produced no regression; their method is cheap and should run again in every round, because it is the only check that a recorded fix still holds.

## Areas to lower

- `@winglet/data-loader`: no finding at medium or above in round 4 (three low items) or in round 5 (no finding).
- `@winglet/json-schema`: one low item in round 4 and one low item in round 5.

Each keeps a share of a neighboring area and the `RG2` re-run.

## Wave decision

Round 6 runs. The owner's rule in [`bug-bounty/FIX-PROCEDURE.md`](../FIX-PROCEDURE.md) (round cycle, step 6) decides from round 5 on: hunting ends only when a round has no high finding, no regression of an earlier fix and no watch-list repeat; otherwise the next round starts without asking, up to round 7. The rule also says that a proposal from the hunting session to end is considered but does not decide. Round 5 has all three: one high item, twelve regressions and ten watch-list repeats at medium or above.

The signals the skill's "Ending the wave" section names, for the owner's information:

- Clean: absent. The round confirmed 1 distinct high defect and 14 distinct medium defects.
- Trivial: absent. The high item arises in common AJV 6 usage, and several medium items need only ordinary inputs (an `active` gate on a virtual group's constituent, `multipleOf: 3` on a slider, an asynchronous format, a `Form.Label` layout).
- Oscillating: present. Four contracts produced findings of the same class again after their fixes: the AJV 6 registration ownership (round 4 item 2, now items 1, 2 and 5, item 1 a high regression of that fix); `getTrackableHandler`'s shared hook state (round 2 item 5, round 3 items 2 and 15, round 4 item 3, now `@winglet/common-utils` item 1, a regression); the CSS fragment closure and `compressCss` (round 1 item 3, round 3 item 2, round 4 items 1 to 3, now `@winglet/style-utils` items 1 to 3, item 1 a regression); and the marker-block scanner and run plan of `@slats/agents-assets-sync` (round 4 items 1 and 5, now items 1 to 3). Under the skill alone this would end the hunting until the owner decides these contracts; under the owner's rule it is advice, so this session recommends that the fix session ask the owner to settle these four contracts before round 6's fixes, and that round 6 test the settled contracts first.
- Round limit: not reached. The owner's rule allows rounds up to 7.

## Probes and verification limits

Probe copies sit in [probes/](probes/) as `probes/<package-slug>/<hunter-id>/`. They do not run in place, because path aliases and relative imports do not resolve there; copy a folder back to `<package path>/src/__bounty__/<hunter-id>/` and run the command its package document gives. The copies of earlier probes that the re-run hunters ran are not kept again; only their ports and new diagnostics are (`r5-rerun-core`, `r5-rerun-plugins`, `r5-rerun-others`).

- Every package's `dist` was built at the base commit, after the last change to `packages/`, so probes that import a package by name test current code; the release hunter confirmed that every `dist` is newer than the last commit to its package.
- Emulated environments, not real installations: antd5 item 3 and antd-mobile item 3 emulate the library surface of antd 5.10 and 5.11 and of antd-mobile 5.1 with `vi.mock`, backed by reads of those versions' published sources on 2026-11-20; `@canard/schema-form` item 6 replaces two declaration files of `@types/react` 18.3.23 with their 18.2.5 text; `@winglet/common-utils` item 7 removes the `AbortController` global instead of running Node 14; `@winglet/react-utils` item 1 uses a React manifest with the 17.0.2 shape.
- Regressions established by reading rather than by running both versions: MUI item 4, ajv6 items 1 and 5, `@lerx/promise-modal` item 1, `@winglet/style-utils` item 1 and `@slats/agents-assets-sync` items 2 to 5. ajv6 items 4 and 6 were run at the introducing commit and its parent (`git archive` extractions under `probes/canard-schema-form-ajv6-plugin/r5-ajv-results/bisect/`), and `@winglet/common-utils` item 1 runs a transcription of the handler before `020ebd94c`.
- Static only: `@canard/schema-form` item 5, MUI item 7, the Korean README items (`@winglet/common-utils` item 6, `@winglet/style-utils` item 4, `@slats/agents-assets-sync` items 10 and 11) and the guide text of `@winglet/react-utils` item 2, whose behavior is also run.
- Browser behavior rests on jsdom: accessible names are computed by dom-accessibility-api 0.5.16, slider pointer rows stub a track width of 100, and the CSS items use a CSS Syntax Level 3 reader instead of a browser. Garbage collection in the dropped-adapter items is forced in Node with `--expose_gc`; how soon a browser collects a dropped adapter is unknown.
- React versions: the core and `@lerx/promise-modal` render probes ran on React 19 and 18; the UI plugin probes ran on React 19 only, because no plugin defines a React 18 project. On the core's React 18 project, probes that load a built CommonJS or reset module copy of the core fail with React 19 errors, an environment limit of the test setup.
- Excluded under the quality bar: in all four UI plugins, a slider with `maximum: Number.MAX_SAFE_INTEGER` stores 2^53 on End, because the bounds tolerance reaches 1 at 2^52; no realistic slider has that range, and the failing row stays in each `sliderTable.test.tsx` as a recorded non-finding.
- Open lead: two separately bundled applications on one page, each with its own `react-dom`, may share an identifier scope; see [canard-schema-form.md](canard-schema-form.md).
