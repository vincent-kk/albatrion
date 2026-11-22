# Bug bounty round 6

Round 6 treated every item of [round 1](../round-1/README.md), [round 2](../round-2/README.md), [round 3](../round-3/README.md), [round 4](../round-4/README.md) and [round 5](../round-5/README.md) as fixed and excluded it, together with the decisions, known limits and behavior tables ("스펙표") that the rounds' `FIXES.md` files record. It ran on branch `1.0.0/bugbounty` at base commit `2a7251acb`, whose code range ends at `1932bb74f`, where the round 5 fixes (pull requests 656 to 667) are merged; when the round started, no file under `packages/` was modified, and the only untracked path was an empty Vitest cache folder, `packages/canard/node_modules/`. The 16 package documents hold 34 items that come from 21 distinct defects: a defect in lines that several plugins each own, such as the compile-fact walk of the AJV plugins or the slider hook of the UI plugins, is recorded once in each package that owns its own lines. No item is critical or high. Every finding rests on a probe that fails because of it; the main session re-ran every hunter's probe folders, including the re-runs of all earlier probes, and mapped each failing test to a finding, a diagnostic, a measurement, a rejected hypothesis, a recorded decision or limit, a renamed interface or an environment limit.

## How this round ran

On Vincent's instruction, to save Claude usage, the hunters ran as Orca workers of Codex (model `gpt-6.1-sol`, default effort) instead of Claude subagents, and Codex workers also confirmed three regression claims and drafted the package documents; the main session (Claude) planned the areas, wrote the brief, re-ran every probe, decided every verdict, reviewed the drafts and wrote this README. The provider's safety check ("flagged for possible cybersecurity risk") stopped five Codex workers, three of them twice. Two areas resumed in fresh Codex chats (`r6-retention`, `r6-release`); three areas ran as Claude subagents on Opus at medium effort, as Vincent approved (`r6-ajv-ownership`, `r6-ajv-compile`, `r6-core-react`). The skill file was not changed for this; the verdicts are the main session's in every area.

## Areas and angles

Angle ids are defined in `.claude/skills/bug-bounty/references/angles.md`. This round added five angles to the catalog, derived from round 5 classes 43, 44 and 46 and from the fix session's request on bounded test profiles: `EQ12` (state another path created against state the package created), `BS5` (constraint combinations), `LC5` (state sequences against their end state), `FP5` (an owner that disappears or fails first) and `RG4` (generated and bounded verification against its claims). An asterisk marks an angle used in that area for the first time. Every hunter also labeled each finding as a regression of an earlier fix or not, and as a watch-list repeat or not.

- `r6-rerun-core`, `@canard/schema-form`, every kept probe of rounds 1 to 5 on unit, React 19 and React 18, plus the round 5 schema-form behavior table: `RG2`, `RG1`, `RG3`, `EQ5`.
- `r6-rerun-packages`, the other 15 packages, every kept probe of rounds 1 to 5, plus their behavior table rows: `RG2`, `RG1`, `RG3`.
- `r6-retention`, schema-form retained values decided per storage address at write time: `LC5`*, `EQ12`*, `FP5`*, `RG3`, `EQ2`, `FP4`, with `EQ10`.
- `r6-batch`, schema-form two-layer batch contract, declarative value placement and the bounded test profiles: `EQ6`*, `LC5`*, `RG4`*, `RG3`, `EQ10`, `LC2`.
- `r6-core-react`, schema-form compile time, React layer and DOM identifiers: `EQ12`*, `FP5`*, `RG3`, `IN3`, `EQ5` (`BS5` assigned, not used).
- `r6-ajv-ownership`, registration ownership and lifetime in the three AJV plugins: `EQ12`*, `FP5`*, `LC5`*, `RG3`, `LC4` (`EQ3` considered, not probed).
- `r6-ajv-compile`, compile facts, references, macros and asynchronous keywords and formats in the three AJV plugins: `EQ1`*, `BS4`*, `EQ6`*, `RG3`, `EQ11`, `FP1`.
- `r6-ui-sliders`, sliders, labels and value pickers of the four UI plugins: `BS5`*, `LC2`*, `EQ6`*, `LC5`*, `EQ11`, `RG3`.
- `r6-winglet-data`, `@winglet/common-utils`, `@winglet/json`, `@winglet/json-schema` and `@winglet/data-loader`: `EQ12`*, `FP5`*, `LC5`*, `RG3`, `RG1`, `EQ10`.
- `r6-style-react-modal`, `@winglet/style-utils`, `@winglet/react-utils` and `@lerx/promise-modal`: `EQ12`*, `LC5`*, `FP5`*, `RG3`, `BS4`, `EQ4`.
- `r6-agents-assets-sync`: `EQ12`*, `FP5`*, `LC5`*, `RG3`, `BS4`, `EQ9`.
- `r6-release`, the 16 published packages as release artifacts from the current `dist`: `EQ8`*, `EQ12`*, `EQ9`*, `CA3`, `EQ3`, `RG3`.

## Package documents

| Package | Items | High, medium, low | Document |
| --- | --- | --- | --- |
| `@canard/schema-form` | 5 | 0, 3, 2 | [canard-schema-form.md](canard-schema-form.md) |
| `@canard/schema-form-ajv6-plugin` | 4 | 0, 1, 3 | [canard-schema-form-ajv6-plugin.md](canard-schema-form-ajv6-plugin.md) |
| `@canard/schema-form-ajv7-plugin` | 5 | 0, 1, 4 | [canard-schema-form-ajv7-plugin.md](canard-schema-form-ajv7-plugin.md) |
| `@canard/schema-form-ajv8-plugin` | 5 | 0, 1, 4 | [canard-schema-form-ajv8-plugin.md](canard-schema-form-ajv8-plugin.md) |
| `@canard/schema-form-antd5-plugin` | 2 | 0, 0, 2 | [canard-schema-form-antd5-plugin.md](canard-schema-form-antd5-plugin.md) |
| `@canard/schema-form-antd6-plugin` | 2 | 0, 0, 2 | [canard-schema-form-antd6-plugin.md](canard-schema-form-antd6-plugin.md) |
| `@canard/schema-form-mui-plugin` | 2 | 0, 1, 1 | [canard-schema-form-mui-plugin.md](canard-schema-form-mui-plugin.md) |
| `@canard/schema-form-antd-mobile-plugin` | 1 | 0, 0, 1 | [canard-schema-form-antd-mobile-plugin.md](canard-schema-form-antd-mobile-plugin.md) |
| `@lerx/promise-modal` | 1 | 0, 0, 1 | [lerx-promise-modal.md](lerx-promise-modal.md) |
| `@slats/agents-assets-sync` | 1 | 0, 1, 0 | [slats-agents-assets-sync.md](slats-agents-assets-sync.md) |
| `@winglet/common-utils` | 3 | 0, 0, 3 | [winglet-common-utils.md](winglet-common-utils.md) |
| `@winglet/data-loader` | 1 | 0, 0, 1 | [winglet-data-loader.md](winglet-data-loader.md) |
| `@winglet/json` | 0 | 0, 0, 0 | [winglet-json.md](winglet-json.md) |
| `@winglet/json-schema` | 0 | 0, 0, 0 | [winglet-json-schema.md](winglet-json-schema.md) |
| `@winglet/react-utils` | 1 | 0, 0, 1 | [winglet-react-utils.md](winglet-react-utils.md) |
| `@winglet/style-utils` | 1 | 0, 1, 0 | [winglet-style-utils.md](winglet-style-utils.md) |

In total 9 items are medium (7 distinct defects) and 25 are low. Five hunter ratings were lowered by the main session, each with its reason in the item: two schema-form batch items from high to medium, the `@winglet/data-loader` item from high to low, and the two `@winglet/common-utils` items and the `@lerx/promise-modal` item from medium to low.

## Regressions and watch-list repeats

Nine items are regressions of an earlier fix; they come from five distinct defects:

- Case (a), a recorded behavior that fails again: [`@canard/schema-form` item 2](canard-schema-form.md) breaks the round 5 behavior table row on the batch caller layer (`../round-5/FIXES.md:393`); the code predates the row.
- Case (b), introduced by a listed fix commit, shown by running the archived plugin source at the commit and at its parent: the MUI custom visible label (`0ce02213a`, [MUI item 1](canard-schema-form-mui-plugin.md)); the read-only slider transition (`16f3ba679`, item 1 of [antd5](canard-schema-form-antd5-plugin.md) and [antd6](canard-schema-form-antd6-plugin.md) and [MUI item 2](canard-schema-form-mui-plugin.md); [antd-mobile item 1](canard-schema-form-antd-mobile-plugin.md) by reading only); the exponent-step slider tooltip (`cafc784f1`, item 2 of antd5 and antd6); and bounded `clone` alias ownership past depth 256 (`90f2cdcd2`, [`@winglet/common-utils` item 1](winglet-common-utils.md), shown by running both archived revisions).

No behavior that a `FIXES.md` records as fixed fails again for its original reason: the two re-run hunters assigned every failing earlier probe a role, and the main session's re-runs matched their counts.

Twenty-eight items repeat a point on the watch list; eight of them, from six distinct defects, are at medium or above, the threshold agreed with the fix session: `@canard/schema-form` items 1, 2 and 3 (retained values at inactive addresses, the batch contract, DOM identifiers), item 1 of each AJV plugin (compile facts), [MUI item 1](canard-schema-form-mui-plugin.md) (labels) and [`@slats/agents-assets-sync` item 1](slats-agents-assets-sync.md) (the planning stage).

## Priorities

No item is critical or high.

Medium items: two batch compositions in `@canard/schema-form` lose stored data (a batched Merge into a hidden gated object drops keys an earlier write in the batch supplied, item 1; a batch with an emptying or identity write under a null object deletes the object, item 2). Separately bundled client applications on one page share Form DOM ids, so a label click writes into the other application (item 3). In all three AJV plugins, an anchor reference into a non-standard container escapes compile facts, so an asynchronous format there fails to compile and a replaced format keeps its old verdict (item 1 of each). MUI announces the schema key instead of a custom visible label on five controls (item 1). `@winglet/style-utils` fails to style a ShadowRoot in a same-origin iframe (item 1), and `@slats/agents-assets-sync` overwrites a skipped skill through a shared hard link under `--force` (item 1).

Items that need the owner's decision rather than a direct fix: `@canard/schema-form` item 3 (whether separately bundled client applications must set `identifierPrefix`, which React documents, or the code must tell renderer copies apart; the package documents currently ask for a prefix only for server rendering) and item 4 (whether `formatError` must be stable, as `context` is documented to be). The [`@lerx/promise-modal` item](lerx-promise-modal.md) touches the round 5 behavior table row on suspended modals (`../round-5/FIXES.md:388`), which decides single requests; its nested case needs the same decision.

## Cross-package classes

Next round's hunters look for siblings of these classes. The numbering continues round 5's list, which ended at 47.

48. Batch composition that rebuilds or merges a stored value without consulting the address's own state: `@canard/schema-form` items 1 (recursion only into live children, so a hidden branch is replaced) and 2 (any non-object ancestor rebuilt as an object before knowing whether the child emits a value).
49. Walks and identities that cover only the common spelling of a target: the AJV plugins' compile-fact walk (anchor fragments, keyword subschemas, percent-decoding before splitting a pointer, array elements under non-standard keys; items 1 and 3 to 5 of ajv7 and ajv8, items 1, 3 and 4 of ajv6), `@slats/agents-assets-sync` item 1 (`realpath` instead of the file's inode), and `@winglet/react-utils` item 1 (`Object.keys` instead of every own enumerable key).
50. Display state that a fix converted on one surface or at mount only: the read-only slider transition (all four UI plugins), the antd tooltip that still shows library coordinates (antd5 and antd6 item 2), and the MUI label reference that overrides the visible label (MUI item 1).
51. Identity scoped to one module copy or realm that the code assumes is the only one: `@canard/schema-form` item 3 (`useId` counters per `react-dom` copy) and `@winglet/style-utils` item 1 (a stylesheet built with the importing realm's constructor for another document).
52. Retry or reset keyed to a callback's identity, which a reporting callback then changes: `@canard/schema-form` item 4.
53. Verification profiles whose class labels are not tied to the inputs they construct: `@canard/schema-form` item 5.

Earlier classes that recurred: round 3 class 22 (composed writes against sequential writes: `@canard/schema-form` items 1 and 2), round 3 class 29 (values from another realm: `@winglet/data-loader` item 1, `@winglet/style-utils` item 1, the local-against-foreign `clone` paths in `@winglet/common-utils` item 2), round 4 class 35 (modal focus across lifecycles: `@lerx/promise-modal` item 1), round 5 class 44 (cleanup scoped to an owner that disappears first: item 2 of each AJV plugin, `@winglet/common-utils` item 3), round 5 class 45 (accessible names: MUI item 1) and round 5 class 46 (numeric constraints in value pickers: antd5 and antd6 item 2).

## Areas to revisit

No hunter reached the cap of 20; the largest list had 5 items in one package. No area produced a confirmed high or critical finding. Two hunters reported high findings that the main session lowered to medium (`r6-retention` and `r6-batch`, both on batch composition in `@canard/schema-form`); they keep their priority, and class 48 should be tested first if round 7 runs.

## Areas to lower

- `@winglet/data-loader`: nothing at medium or above in rounds 4, 5 and 6.
- `@winglet/json-schema`: nothing at medium or above in rounds 4, 5 and 6.
- `@winglet/json`: nothing at medium or above in rounds 5 and 6.
- `@winglet/common-utils`: nothing at medium or above in rounds 5 and 6, after the main session lowered two round 6 ratings.
- `@winglet/react-utils`: nothing at medium or above in rounds 5 and 6.
- `@lerx/promise-modal`: nothing at medium or above in rounds 5 and 6.

Each keeps a share of a neighboring area and the `RG2` re-run.

## Wave decision

Round 7 runs, and it is the last round the owner's rule allows. The rule in [`bug-bounty/FIX-PROCEDURE.md`](../FIX-PROCEDURE.md) (round cycle, step 6) ends the hunting only after a round with no high finding, no regression and no watch-list repeat; round 6 has no high finding, but it has five distinct regressions and eight watch-list repeats at medium or above.

The signals the skill's "Ending the wave" section names, for the owner's information:

- Clean: absent. The round confirmed 7 distinct medium defects.
- Trivial: absent, though close. No item is critical or high, and most medium items need inputs a typical application does not produce (a batch with a hidden or null object, separately bundled renderers, an iframe ShadowRoot, an anchor reference in a non-standard container, hard-linked skill files); but the MUI label item needs only an ordinary `FieldInputProps.label`.
- Oscillating: present. Three contracts produced findings again after their round 5 fixes: the slider and label rendering of the UI plugins (three case (b) regressions of `0ce02213a`, `16f3ba679` and `cafc784f1`), batch composition in `@canard/schema-form` (round 3 item 5, round 5's caller-layer follow-up, now items 1 and 2, one breaking a behavior table row), and the AJV compile-fact walk (the round 5 plugins follow-up, now four items per plugin). This session recommends that the fix session settle these three contracts with the owner before writing round 6's fixes, and that round 7 test the settled contracts first.
- Round limit: round 7 is the last.

## Probes and verification limits

Probe copies sit in [probes/](probes/) as `probes/<package-slug>/<hunter-id>/`. They do not run in place, because path aliases and relative imports do not resolve there; copy a folder back to `<package path>/src/__bounty__/<hunter-id>/` and run the command its package document gives. The copies of earlier probes that the re-run hunters ran are not kept again; only their new neighbor files are. The `r6-regression-check` folders keep their tests and observation files without the archived plugin source trees, which `git archive <commit> packages/canard/<plugin>/src` regenerates.

- Every package's `dist` was newer than the last change to its `src` at the base commit, as the release hunter checked; probes that import a package by name test current code.
- Regressions by running both revisions: the three UI regressions ran the archived plugin source of each commit and its parent against the current dependencies and the current `@canard/schema-form`, not a historical dependency set; the `clone` regression ran both archived revisions. Regressions by reading: the antd-mobile part of the read-only transition. The schema-form case (a) regression rests on the behavior table row, not on a commit.
- Browser behavior rests on jsdom, except the `@winglet/style-utils` iframe item, which ran in real Chromium through Vitest's browser mode. Accessible names are computed by dom-accessibility-api. Garbage collection in the AJV ownership item is forced with `--expose_gc`. The separately bundled applications of `@canard/schema-form` item 3 load separate `react-dom` copies that share one React instance.
- React versions: the schema-form and `@lerx/promise-modal` probes ran on React 19 and 18; the UI plugin probes ran on React 19 only.
- The hunters of `r6-ajv-ownership`, `r6-ajv-compile` and `r6-core-react` were Claude subagents; the other hunters were Codex workers. A Codex hunter's first attempt left `packages/canard/schema-form/src/__bounty__/r6-release/independentApps.test.ts`, which fails on its own dual-React harness ("Invalid hook call"); it was not reported, is superseded by `@canard/schema-form` item 3, and was not kept.
- The bounded profile item checks one generated model; it does not claim that other tests lack empty-group coverage.
