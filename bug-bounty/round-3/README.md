# Bug bounty round 3

Round 3 treated every item of [round 1](../round-1/README.md) and [round 2](../round-2/README.md) as fixed and excluded it, together with the decisions and known limits that [round 2's FIXES.md](../round-2/FIXES.md) records. It ran on branch `1.0.0/bugbounty` at base commit `43b0db5e6`, where the round 1 and round 2 fixes are merged; when the round started, no file under `packages/` was modified, and only the bug bounty skill files were. The 16 package documents hold 106 items that come from 92 distinct defects: a defect in the URI, enum, or textarea input of several UI plugins, or in the README of several AJV plugins, is recorded once in each plugin that owns its own lines, and a symptom whose cause another package owns cites that package's item instead of repeating it. Eleven distinct defects are high and none is critical. Every finding rests on a probe that fails because of it; the main session re-ran every hunter's probe folders and mapped each failing test to a finding, a diagnostic, a measurement, a rejected hypothesis, or an environment limit.

## Areas and angles

Angle ids are defined in `.claude/skills/bug-bounty/references/angles.md`. An asterisk marks an angle used in that area for the first time; "read only" marks an angle covered by reading code without a probe.

- `r3-compile`, `@canard/schema-form` compile time (`$ref` branches, special property names, `$id` and `$schema` spellings, numeric constraints, documented schema examples): `EQ1`, `EQ8`*, `BS2`*, `BS3`*, `CA1`*.
- `r3-engine`, `@canard/schema-form` runtime engine (subscribers that throw or write back, `derived` that throws, number edge cases, asynchronous work overtaken by a reset, same-shape writes): `EQ2`, `LC2`*, `FP1`*, `BS2`*, and `LC1`* read only.
- `r3-react`, `@canard/schema-form` React layer (several forms and providers on one page, portals, shadow roots, timers after unmount, documented React examples): `IN2`*, `EQ4`*, `LC4`*, `LC1`*, `CA1`*; `EQ4` under virtualization read only.
- `r3-validation`, the validation engine and the three AJV plugins (failure caches, deep data and many errors, special property names, callbacks into the form, README examples): `BS1`*, `BS3`*, `LC2`*, `CA1`*, `EQ7`, and `FP3`* read only.
- `r3-ui-plugins`, the four UI plugins (StrictMode, `<Activity>`, numeric edge values, non-Latin and special enum values, README examples, popups after unmount): `EQ5`*, `BS2`*, `BS3`*, `CA1`*, `LC4`*, `CA2`.
- `r3-contracts`, all 16 packages (version ranges between the packages, two copies in one application, packaged `docs/agents/**` knowledge and changesets, `exports` and declarations): `CA3`, `EQ3`, `IN1`*, `IN2`*, `CA2`*.
- `r3-common-utils`, `@winglet/common-utils` (promise, scheduler, and timer utilities under reentrancy and rejection, failure caching, hashing, cross-realm type guards): `LC1`*, `LC2`*, `FP1`*, `EQ6`*, `IN2`*, `EQ7`, `BS2`, and `FP3`* read only.
- `r3-style-utils`, `@winglet/style-utils` (CSS text variants against `postcss` and Chromium, incremental against one-shot injection, two copies on one page, destroy during injection, large sheets): `EQ8`*, `EQ6`*, `EQ3`*, `LC2`*, `BS1`*, `EQ7`, `EQ4`, `CA2`*.
- `r3-promise-modal`, `@lerx/promise-modal` (out-of-order resolution, handlers that open or close modals, StrictMode, React 18, server rendering, light and shadow roots, documented examples): `LC1`*, `LC2`*, `EQ4`*, `EQ5`*, `CA1`*.
- `r3-json`, `@winglet/json` and `@winglet/json-schema` (patch atomicity, numeric edge values, throwing callbacks, documented examples, pointer and URI spellings): `FP2`*, `FP1`*, `FP3`, `BS2`*, `CA1`*, `EQ8`*, `EQ7`; exception propagation under `FP1` read only.
- `r3-agents-assets-sync`, `@slats/agents-assets-sync` (concurrent and interrupted runs, malformed manifests, documented CLI examples, unusual file names, leftovers after a failure): `LC1`*, `LC4`*, `FP1`*, `FP2`, `CA1`*, `BS3`*, `EQ8`, `EQ9`; concurrent runs under `LC1` read only.
- `r3-react-utils-data-loader`, `@winglet/react-utils` and `@winglet/data-loader` (hooks after unmount and with replaced handles, portals in shadow roots, batch functions that reject or re-enter, priming after a failure): `EQ4`*, `EQ5`, `LC1`*, `LC2`*, `LC4`*, `FP1`*, `FP3`*, `CA1`, `CA2`*, and `LC3`* read only.

## Package documents

| Package | Items | High, medium, low | Document |
| --- | --- | --- | --- |
| `@canard/schema-form` | 17 | 5, 8, 4 | [canard-schema-form.md](canard-schema-form.md) |
| `@canard/schema-form-ajv6-plugin` | 3 | 0, 1, 2 | [canard-schema-form-ajv6-plugin.md](canard-schema-form-ajv6-plugin.md) |
| `@canard/schema-form-ajv7-plugin` | 2 | 0, 1, 1 | [canard-schema-form-ajv7-plugin.md](canard-schema-form-ajv7-plugin.md) |
| `@canard/schema-form-ajv8-plugin` | 3 | 0, 1, 2 | [canard-schema-form-ajv8-plugin.md](canard-schema-form-ajv8-plugin.md) |
| `@canard/schema-form-antd5-plugin` | 5 | 1, 3, 1 | [canard-schema-form-antd5-plugin.md](canard-schema-form-antd5-plugin.md) |
| `@canard/schema-form-antd6-plugin` | 6 | 1, 3, 2 | [canard-schema-form-antd6-plugin.md](canard-schema-form-antd6-plugin.md) |
| `@canard/schema-form-mui-plugin` | 5 | 1, 2, 2 | [canard-schema-form-mui-plugin.md](canard-schema-form-mui-plugin.md) |
| `@canard/schema-form-antd-mobile-plugin` | 6 | 0, 4, 2 | [canard-schema-form-antd-mobile-plugin.md](canard-schema-form-antd-mobile-plugin.md) |
| `@lerx/promise-modal` | 7 | 1, 2, 4 | [lerx-promise-modal.md](lerx-promise-modal.md) |
| `@slats/agents-assets-sync` | 14 | 2, 5, 7 | [slats-agents-assets-sync.md](slats-agents-assets-sync.md) |
| `@winglet/common-utils` | 15 | 1, 4, 10 | [winglet-common-utils.md](winglet-common-utils.md) |
| `@winglet/data-loader` | 4 | 0, 2, 2 | [winglet-data-loader.md](winglet-data-loader.md) |
| `@winglet/json` | 2 | 1, 0, 1 | [winglet-json.md](winglet-json.md) |
| `@winglet/json-schema` | 3 | 0, 1, 2 | [winglet-json-schema.md](winglet-json-schema.md) |
| `@winglet/react-utils` | 6 | 0, 3, 3 | [winglet-react-utils.md](winglet-react-utils.md) |
| `@winglet/style-utils` | 8 | 0, 3, 5 | [winglet-style-utils.md](winglet-style-utils.md) |

The antd5, antd6, and MUI documents also record the radio-name symptom of `@canard/schema-form` item 6, and `@canard/schema-form` records the form-level symptom of `@canard/schema-form-ajv6-plugin` item 2.

## Priorities

High items, one sentence each:

- [`@canard/schema-form` item 1](canard-schema-form.md): when two Forms on one page share a field path, they share element ids, so a click on a label or radio text in the second Form changes the first Form's value.
- [`@canard/schema-form` item 2](canard-schema-form.md): submitting a Form rendered through a portal inside another Form, such as a dialog, also submits the outer Form with a stale value.
- [`@canard/schema-form` items 3 and 4](canard-schema-form.md): an `active` condition of a reused `$defs` template does not react, or never turns a field back on, at the template's second and later locations; both reopen round 2 schema-form item 2, whose inline-equivalence contract stands, and fixing item 3 alone leaves item 4.
- [`@canard/schema-form` item 5](canard-schema-form.md): inside a `batch` or `visitSubtree`, a nested `Merge` write combined with any other write deletes the keys the `Merge` left out.
- [`@canard/schema-form-antd5-plugin`](canard-schema-form-antd5-plugin.md), [`-antd6-plugin`](canard-schema-form-antd6-plugin.md), and [`-mui-plugin`](canard-schema-form-mui-plugin.md) item 1: after an `<Activity>` hide and show, the URI input returns to its mount-time scheme, and the next path edit silently writes that scheme into the value.
- [`@lerx/promise-modal` item 1](lerx-promise-modal.md): modal content that suspends under a Suspense boundary enclosing the Provider starts an unbounded update loop that unmounts the whole root.
- [`@slats/agents-assets-sync` item 1](slats-agents-assets-sync.md): a codex or agents run replaces every invalid UTF-8 byte sequence in `AGENTS.md` with U+FFFD, destroying the user's own text outside the tool's blocks.
- [`@slats/agents-assets-sync` item 2](slats-agents-assets-sync.md): on a terminal, a unit whose plan fails is dropped and the run exits 0; this reopens round 2 agents-assets-sync item 3, whose fix (`30e6d4e5b`) covered only the plain-text and `--json` paths.
- [`@winglet/common-utils` item 1](winglet-common-utils.md): `throttle` stops throttling after `clear()` or at a window boundary, and with `leading: false` never runs the last call.
- [`@winglet/json` item 1](winglet-json.md): in the default immutable mode, `applyPatch` writes into the caller's value after a root `add` or `replace`; it is the second round of the same function and class as round 2 json item 1.

Medium items: `@canard/schema-form` items 6 to 13 cover radio fields that share a leaf name and merge into one native group (unverified in a browser: if arrow keys move between the two fields, item 6 becomes high), context objects whose private content changes go unnoticed, the documented collection condition `(../items).length > 0` that throws and blocks submission after the last item is removed, three batch defects (array verbs that treat rows by position, a `resetSubtree` undone at the end of the batch, and the documented bulk-update example that erases values an inactive branch retains), a validator write-back that makes OnChange validation loop, and two independently bundled applications on one page that overwrite each other's plugins. The AJV plugins add an Ajv 6 instance from another installed copy that rejects instead of reporting issues (ajv6 item 1) and formats or keywords added late that later roots skip (ajv7 and ajv8 item 1). The UI plugins add single-colon URI schemes that gain `http://` (antd5, antd6, and MUI item 2, reopening the round 1 URI fixes), enum values named like `Object.prototype` members (antd5, antd6, and MUI item 3, antd-mobile item 1), multi-select search that ignores displayed labels (antd5 and antd6 item 4), and the antd-mobile slider and stepper bounds, focus, and labels (antd-mobile items 2 to 4). `@lerx/promise-modal` items 2 and 3 cover a hidden Provider that cancels every pending request and an Escape that opens a modal and closes it at once. `@slats/agents-assets-sync` items 3 to 7 cover unvalidated terminal flags, a non-atomic `AGENTS.md` rewrite, a stale manifest that never converges, a terminal `--force` exit code, and a `.gitkeep` that blocks a whole package. `@winglet/common-utils` items 2 to 5 cover rejected async hooks, a throwing `onTaskError`, browser macrotask errors that vanish, and cross-realm values in `clone`. `@winglet/data-loader` items 1 and 2 cover bare browser schedulers and a scheduler that throws once. `@winglet/json-schema` item 1 covers a partial registration that survives a duplicate-identifier failure. `@winglet/react-utils` items 1 to 3 cover a Portal scope hidden by Activity or Suspense, `useHandle` reading an uncommitted render, and `useTimeout.schedule` after unmount. `@winglet/style-utils` items 1 to 3 cover an escaped quote in `compressCss`, a statement at-rule that swallows the next style, and an empty selector-list member that styles the scope container.

Items that need the owner's decision rather than a direct fix: `@canard/schema-form` item 9 (the consumer document promises item identity in a batch, while EVENT-035 and its test pin position continuity), item 11 (change the bulk-update example or the updater input), item 13 (the cost of round 2's realm-global registry decision; narrowing the scope would reverse that decision), and item 15 (an embedded `$id` base that BLUEPRINT-030 may intend to exclude); `@lerx/promise-modal` item 2 (adjacent to the round 2 promise-modal 5 decision); `@winglet/react-utils` item 2; and `@winglet/common-utils` item 2 (await the hooks or type them as synchronous).

## Cross-package classes

Next round's hunters look for siblings of these classes. The numbering continues the brief's list of 20 classes from rounds 1 and 2.

21. A fix that left a case out while its contract stands: `@canard/schema-form` items 3 and 4 (round 2 schema-form 2), the antd5, antd6, and MUI item 2 (round 1 URI fixes), `@slats/agents-assets-sync` item 2 (round 2 item 3), `@winglet/react-utils` item 1 (round 2 react-utils 1) and item 5 (round 2 react-utils 2), `@lerx/promise-modal` item 3 (round 1 promise-modal 5), `@winglet/common-utils` item 11 (round 1 common-utils 3), and documents a fix did not update (`@winglet/style-utils` item 8, `@winglet/react-utils` item 6). For each earlier fix, test the neighbouring inputs and the other surfaces (terminal, documents, other plugins) it did not touch.
22. Composed operations that differ from the same calls made one by one: the three `batch` defects in `@canard/schema-form` items 5, 9, and 10, and `@winglet/style-utils` item 2, where styles injected separately differ from one sheet.
23. One identifier shared by every instance or copy on a page: element ids and radio names (`@canard/schema-form` items 1 and 6), nested forms through a portal (item 2), the realm-global plugin registry (item 13), and a class identity checked with `instanceof` across installed copies (`@canard/schema-form-ajv6-plugin` item 1). This extends round 2 class 5.
24. Lookups that read inherited prototype keys from a plain object: the enum label maps of all four UI plugins (antd5, antd6, and MUI item 3, antd-mobile item 1).
25. Work done in effects that `<Activity>` re-runs or that a server render never runs, again (round 1 class 11, round 2 class 4): the URI protocol in antd5, antd6, and MUI item 1 and MUI item 4, `@winglet/react-utils` item 1, and `@lerx/promise-modal` items 1 and 2.
26. Errors that vanish or state that sticks, again (round 2 class 8): `@winglet/common-utils` items 2, 3, 4, and 10, `@winglet/data-loader` item 2, `@winglet/json-schema` item 1, the degraded status after `@canard/schema-form` item 8, and `@slats/agents-assets-sync` item 2.
27. Documented examples and packaged knowledge that do not match the code, again (round 1 class 19): `@canard/schema-form` items 8, 11, and 14, `@winglet/json` item 2, `@winglet/data-loader` items 3 and 4, `@winglet/react-utils` items 4 and 6, `@winglet/common-utils` item 9, `@winglet/style-utils` item 8, the AJV plugin READMEs (ajv6 item 3, ajv7 item 2, ajv8 items 2 and 3), the textarea settings (antd5 and antd6 item 5, antd-mobile item 6), and the antd-mobile slider example (item 5).
28. Scanners that ignore escapes or token boundaries, again (round 1 class 16): `@winglet/style-utils` items 1, 4, 6, and 7.
29. Values from another realm or another installed copy, again: `@winglet/common-utils` items 5, 13, and 14, and `@canard/schema-form-ajv6-plugin` item 1.
30. Declarations and `exports` that the shipped files do not support: `@winglet/common-utils` items 6, 7, and 8, which list every affected package.

## Areas to revisit

No hunter reached the cap of 20; the largest list had 14 items. These areas produced high findings and are revisited in round 4:

- `r3-compile`: `@canard/schema-form` items 3 and 4, from the authored-indirection check `EQ1`, which produced high findings for the second round.
- `r3-engine`: `@canard/schema-form` item 5, from the write-shape check `EQ2`, which produced a high finding for the second round.
- `r3-react`: `@canard/schema-form` items 1 and 2, from several forms on one page and a form in a portal, angles new to this area.
- `r3-ui-plugins`: the URI item 1 in antd5, antd6, and MUI, from the React lifecycle check `EQ5`, new to this area.
- `r3-promise-modal`: `@lerx/promise-modal` item 1, from the React lifecycle check `EQ5`, new to this area.
- `r3-agents-assets-sync`: `@slats/agents-assets-sync` items 1 and 2.
- `r3-common-utils`: `@winglet/common-utils` item 1.
- `r3-json`: `@winglet/json` item 1.

`r3-validation`, `r3-contracts`, `r3-style-utils`, and `r3-react-utils-data-loader` produced no high finding; their medium findings still keep them in the plan.

## Areas to lower

None. Every area produced at least one finding at medium or above in this round.

## Wave decision

Round 4 runs. The wave targets round 5, and round 3 shows none of the stop signals:

- Clean: absent. The round confirmed 11 distinct high defects and 36 distinct medium defects.
- Trivial: absent. The high items arise in common usage: two forms on a page, a dialog form, a reused `$defs` template, a batch write, a hidden tab, a `throttle` call, and a patch at the document root.
- Oscillating: absent. The signal has two parts. First, no finding at medium or above reverses behavior that an earlier fix decided. The items that reopen an earlier fix (`@canard/schema-form` items 3 and 4, the URI item 2 in three plugins, `@slats/agents-assets-sync` item 2, `@winglet/react-utils` item 1, `@lerx/promise-modal` item 3) are fixes that left a case out while the contract they implement still stands, so they count as Reopens, not as oscillation. `@canard/schema-form` item 13 is the closest case: it is the cost of the round 2 decision to share the plugin registry across a realm, and a fix that narrows that scope would reverse the decision, so the owner decides the trade-off instead of the fix group flipping it. Second, no function has yielded the same class for a third round. These functions have now yielded the same class in two rounds, and a third would raise the signal: `applyPatch` root ownership (`@winglet/json` item 1), `clone` across realms (`@winglet/common-utils` item 5), `getTrackableHandler` hooks (`@winglet/common-utils` item 2), `compressCss` string context (`@winglet/style-utils` item 1), the URI input schemes of antd5, antd6, and MUI (item 2), the reused-template `active` gates (`@canard/schema-form` items 3 and 4), the Portal under Activity (`@winglet/react-utils` item 1), and the terminal plan path of agents-assets-sync (item 2). The json-schema resolver store has findings in rounds 1, 2, and 3, but its class (errors that stick) appears in rounds 2 and 3 only.
- Round limit: not reached. Round 5 is the target.

Round 4 starts when the fix session has merged round 3's fixes and sends the new HEAD. `r3-compile`, `r3-ui-plugins`, and `r3-validation` have two to four applicable angles left unused, so round 4 combines them with the classes above, and round 5 will need new catalog angles derived from round 4's classes.

## Probes and verification limits

Probe copies sit in [probes/](probes/) as `probes/<package-slug>/<hunter-id>/`. They do not run in place, because path aliases and relative imports do not resolve there; copy a folder back to `<package path>/src/__bounty__/<hunter-id>/` and run the command its package document gives.

- Many `dist` builds were older than their sources after the round 2 merge, so most probes import source. The UI plugin probes import `@canard/schema-form` through its stale `dist`, while every line they blame is plugin source.
- `r3-engine` builds trees with `buildFieldNodeTree` and `mountFieldNode`, the path Form uses, and calls only public `FieldNode` methods. `@canard/schema-form` item 15, the terminal items of `@slats/agents-assets-sync`, and the form-level symptom of `@canard/schema-form-ajv6-plugin` item 2 are verified through internal fixtures. The textarea item of antd6 and antd-mobile is a static check. Each document states the level of every item.
- Some browser claims rest on Chromium checks that two hunters ran outside the probes: the data-loader scheduler receiver and the style-utils rule counts. The browser behavior behind `@winglet/style-utils` item 3 rests on the Selectors Level 4 grammar alone.
- React 18: the `@canard/schema-form` render probes ran under both React 19 and React 18, except `twoBundlesRegistry`, whose React 18 run fails in its control as well after `vi.resetModules()` and is an environment limit. The UI plugin probes ran under React 19 only, and one `@lerx/promise-modal` Activity test is skipped under React 18 because Activity exists only in React 19.
- The angles marked "read only" under Areas and angles have no probe, and nothing is reported from them.
- Three `r3-compile` probe files write diagnostics to `r3-compile-diag.jsonl` under the operating system's temporary directory.
