# Bug bounty round 4

Round 4 treated every item of [round 1](../round-1/README.md), [round 2](../round-2/README.md) and [round 3](../round-3/README.md) as fixed and excluded it, together with the decisions and known limits that [round 3's FIXES.md](../round-3/FIXES.md) records. It ran on branch `1.0.0/bugbounty` at base commit `1fc1400a7`, where the round 1 to round 3 fixes are merged; when the round started, the working tree was clean. The 16 package documents hold 108 items that come from 88 distinct defects: a defect in lines that several plugins each own, such as the derived option ids of the UI plugins or the default settings of the AJV plugins, is recorded once in each package that owns its own lines, and a symptom whose cause another package owns cites that package's item instead of repeating it. Eight items, from four distinct defects, are high, and none is critical. Every finding rests on a probe that fails because of it, or on a static check that its document names; the main session re-ran every hunter's probe folders and mapped each failing test to a finding, a diagnostic, a measurement, a rejected hypothesis or an environment limit.

## Areas and angles

Angle ids are defined in `.claude/skills/bug-bounty/references/angles.md`. This round added six angles to the catalog, derived from round 3's cross-package classes: `EQ10` (composed operations against the same calls made one by one), `EQ11` (sibling implementations of one contract against each other), `BS4` (lexical context inside scanned text), `FP4` (recovery after a failing call), `IN3` (identifiers that must stay unique per instance) and `RG1` (neighbors of earlier fixes). An asterisk marks an angle used in that area for the first time.

- `r4-compile`, `@canard/schema-form` compile time (`$ref` and `$defs` reuse, embedded `$id` resources, expression parsing, `allOf` warnings, conditional gates): `EQ1`, `RG1`*, `BS4`*, `EQ7`*, `FP4`*, with `EQ8` and `EQ11`* for the path spellings of item 9.
- `r4-engine`, `@canard/schema-form` runtime engine (`batch`, `visitSubtree`, write options, array verbs, `reset` and `resetSubtree`, virtual groups): `EQ2`, `EQ10`*, `RG1`*, `FP4`*, `LC4`*, `LC1`, with `CA2` for item 15 and `BS1` for item 16.
- `r4-react`, `@canard/schema-form` React layer (nested providers, plugin registration, native form events, radio names, hydration, context comparison): `IN3`*, `RG1`*, `FP4`*, `LC2`*, `EQ5`.
- `r4-validation`, the validation engine and the three AJV plugins (concurrent calls, registrations on a shared AJV instance, plugin parity, decimal numbers, recovery after a throwing guard): `IN3`*, `EQ11`*, `FP4`*, `RG1`*, `BS2`*, `FP3`.
- `r4-ui-antd`, the antd5 and antd6 plugins: `RG1`*, `EQ11`*, `EQ8`*, `EQ7`*, `IN3`*, `EQ5`.
- `r4-ui-mui-mobile`, the MUI and antd-mobile plugins: `RG1`*, `EQ11`*, `EQ8`*, `EQ7`*, `IN3`*, `EQ5`.
- `r4-promise-modal`, `@lerx/promise-modal` (hidden and detached requests, many requests at once, failure recovery, package copies): `RG1`*, `FP4`*, `IN3`*, `EQ10`*, `EQ5`.
- `r4-agents-assets-sync`, `@slats/agents-assets-sync` (marker blocks, encodings, placeholders, shared namespaces, output modes): `RG1`*, `BS4`*, `FP4`*, `EQ10`*, `BS1`*, `EQ9`.
- `r4-common-utils`, `@winglet/common-utils` (`clone`, `equals`, the scheduler, trackable handlers, console helpers, math): `RG1`*, `FP4`*, `EQ10`*, `EQ8`*, `EQ7`, `FP3`.
- `r4-json-style`, `@winglet/json`, `@winglet/json-schema` and `@winglet/style-utils` (merge patch, pointer conversion, CSS compression and shadow root injection): `RG1`*, `BS4`*, `EQ10`*, `FP4`*, `EQ7`, `CA2`.
- `r4-react-utils-data-loader`, `@winglet/react-utils` and `@winglet/data-loader` (hooks across remounts and abandoned renders, documented examples, cache failures): `RG1`*, `FP4`*, `EQ10`*, `IN3`*, `BS2`*, `LC3`.
- `r4-contracts`, all 16 packages as release artifacts (`exports`, declarations under consumer configurations, documented imports, documented environments): `CA3`, `EQ3`, `RG1`*, `CA1`*, `IN3`*.

Round 3's `r3-ui-plugins` area, which round 3 listed under areas to revisit, was split into `r4-ui-antd` and `r4-ui-mui-mobile`. To stay within 12 hunters, `@winglet/style-utils` shared `r4-json-style` with `@winglet/json` and `@winglet/json-schema`.

## Package documents

| Package | Items | High, medium, low | Document |
| --- | --- | --- | --- |
| `@canard/schema-form` | 20 | 0, 8, 12 | [canard-schema-form.md](canard-schema-form.md) |
| `@canard/schema-form-ajv6-plugin` | 9 | 3, 3, 3 | [canard-schema-form-ajv6-plugin.md](canard-schema-form-ajv6-plugin.md) |
| `@canard/schema-form-ajv7-plugin` | 6 | 2, 2, 2 | [canard-schema-form-ajv7-plugin.md](canard-schema-form-ajv7-plugin.md) |
| `@canard/schema-form-ajv8-plugin` | 5 | 1, 1, 3 | [canard-schema-form-ajv8-plugin.md](canard-schema-form-ajv8-plugin.md) |
| `@canard/schema-form-antd5-plugin` | 4 | 1, 1, 2 | [canard-schema-form-antd5-plugin.md](canard-schema-form-antd5-plugin.md) |
| `@canard/schema-form-antd6-plugin` | 4 | 1, 1, 2 | [canard-schema-form-antd6-plugin.md](canard-schema-form-antd6-plugin.md) |
| `@canard/schema-form-mui-plugin` | 8 | 0, 5, 3 | [canard-schema-form-mui-plugin.md](canard-schema-form-mui-plugin.md) |
| `@canard/schema-form-antd-mobile-plugin` | 5 | 0, 4, 1 | [canard-schema-form-antd-mobile-plugin.md](canard-schema-form-antd-mobile-plugin.md) |
| `@lerx/promise-modal` | 5 | 0, 2, 3 | [lerx-promise-modal.md](lerx-promise-modal.md) |
| `@slats/agents-assets-sync` | 14 | 0, 5, 9 | [slats-agents-assets-sync.md](slats-agents-assets-sync.md) |
| `@winglet/common-utils` | 12 | 0, 2, 10 | [winglet-common-utils.md](winglet-common-utils.md) |
| `@winglet/data-loader` | 3 | 0, 0, 3 | [winglet-data-loader.md](winglet-data-loader.md) |
| `@winglet/json` | 3 | 0, 1, 2 | [winglet-json.md](winglet-json.md) |
| `@winglet/json-schema` | 1 | 0, 0, 1 | [winglet-json-schema.md](winglet-json-schema.md) |
| `@winglet/react-utils` | 5 | 0, 2, 3 | [winglet-react-utils.md](winglet-react-utils.md) |
| `@winglet/style-utils` | 4 | 0, 0, 4 | [winglet-style-utils.md](winglet-style-utils.md) |

## Priorities

High items, from four distinct defects:

- [`@canard/schema-form-antd5-plugin` item 1](canard-schema-form-antd5-plugin.md) and [`@canard/schema-form-antd6-plugin` item 1](canard-schema-form-antd6-plugin.md): browsing the panel of a date, month or time range picker stores the viewed date in the form value although the user picked nothing, so a stored range silently changes or reverses.
- [`@canard/schema-form-ajv7-plugin` item 1](canard-schema-form-ajv7-plugin.md) and [`@canard/schema-form-ajv6-plugin` item 1](canard-schema-form-ajv6-plugin.md): when one compiled validator is called again before an earlier call settles, the earlier call reads the later call's empty errors, so an invalid value is reported as valid; two forms that share a schema object trigger it.
- [`@canard/schema-form-ajv6-plugin` item 2](canard-schema-form-ajv6-plugin.md): `release` deletes the application's own registration of a schema with the same `$id`.
- [`@canard/schema-form-ajv8-plugin` item 1](canard-schema-form-ajv8-plugin.md), [`@canard/schema-form-ajv7-plugin` item 2](canard-schema-form-ajv7-plugin.md) and [`@canard/schema-form-ajv6-plugin` item 3](canard-schema-form-ajv6-plugin.md): the default instances reject exact decimal multiples such as 19.99 against `multipleOf: 0.01`, while the core's number input steps by `multipleOf`, so a common price field cannot be submitted.

Medium items: `@canard/schema-form` items 1 to 8 cover a draft-07 fragment `$id` that stops the form from loading (a regression of the round 3 item 15 fix), `resetSubtree()` on a virtual group that deletes the stored fields, batch marks written through a virtual alias that survive a reset (round 3 item 10), a nested `FormProvider` that drops the plugin scope (round 3 item 13), a native reset button that resets only the screen, `insert(0)` that clears moved radio selections (round 3 item 6), a context with a cycle that hangs the comparison (round 3 item 7), and option ids that equal a sibling field's id (round 3 items 1 and 6). The AJV plugins add schemas added after the plugin cloned the instance (ajv8 item 2, ajv7 item 3, ajv6 item 4), the AJV 6 compile cache that defeats the `jsonPointers` switch (ajv6 item 5, round 3 item 2) and asynchronous keywords that compile only in some plugins (ajv7 item 4, ajv6 item 6). The UI plugins add the same option id collision (antd5 item 2, antd6 item 2, MUI item 5, antd-mobile item 4), array errors that are never rendered (MUI item 1, antd-mobile item 1), the MUI string switch that reads the enum in the opposite order (MUI item 2), sliders that write only values failing `multipleOf` when `minimum` is not a multiple (MUI item 3, antd-mobile item 2), the antd-mobile checkbox group that rewrites an unknown value as its JSON spelling (antd-mobile item 3) and the MUI nullable checkbox that stays indeterminate (MUI item 4). `@lerx/promise-modal` items 1 and 2 cover focus taken from the page by a hidden request that settles, and a navigation missed while the Provider was hidden. `@slats/agents-assets-sync` items 1 to 5 cover a fenced marker example taken as a block, duplicated blocks, rule sources that are not UTF-8, `skills/.gitkeep` (round 3 item 7) and a shared skill namespace whose terminal result differs from the other output modes. `@winglet/common-utils` items 1 and 2 cover `clone` of subclasses and of an Error with a cause, `@winglet/json` item 1 covers `mergePatch` with an `undefined` member, and `@winglet/react-utils` items 1 and 2 cover `useTimeout` after a remount (a regression of the round 3 item 3 fix) and snapshot hooks that write refs during render.

Items that need the owner's decision rather than a direct fix: MUI item 2 (no document fixes the order of a two-value string switch, and the MUI and antd tests each pin their own order), `@lerx/promise-modal` item 1 (the specification says both that a hidden request releases focus and that focus returns to the opener at settlement), and the three contracts named under the wave decision below.

## Cross-package classes

Next round's hunters look for siblings of these classes. The numbering continues round 3's list, which ended at 30.

31. Identifiers derived from a scoped id by a suffix that equal another field's scoped id: `@canard/schema-form` item 8 (the built-in inputs and the packaged guide that teaches the pattern), antd5 and antd6 item 2, MUI item 5, antd-mobile item 4 (round 3 class 23).
32. Sibling implementations of one contract that disagree: MUI items 1, 2 and 3 and antd-mobile items 1 and 2 against the antd plugins and the core, ajv7 item 4 and ajv6 item 6 against AJV 8, and the decimal `multipleOf` default of all three AJV plugins against the core's number input.
33. Shared mutable state read across an asynchronous gap or between instances: ajv7 and ajv6 item 1 (the compiled function's `errors` after an `await`), ajv6 item 2 and the plugin copy items (ajv8 item 3, ajv7 item 5, ajv6 item 7), the late schemas of ajv8 item 2, ajv7 item 3 and ajv6 item 4, and `@winglet/common-utils` item 5 (scheduler ids reused after teardown).
34. A virtual or alias path used as the address of stored data: `@canard/schema-form` items 2, 3 and 14, and item 9 (absolute paths with `..` or `.` segments that are never normalized).
35. State that a hidden, re-suspended or abandoned React tree leaves stale: `@lerx/promise-modal` items 1 to 4, `@winglet/react-utils` items 1 and 2 (round 3 class 25).
36. Recursive or iterative walks without cycle detection that never finish: `@canard/schema-form` item 7 and `@winglet/common-utils` item 4.
37. Inherited prototype members read as data, again (round 3 class 24): `@canard/schema-form` items 13 and 17, `@winglet/common-utils` item 6.
38. Scanners that ignore lexical context, again (round 3 class 28): `@canard/schema-form` item 10, `@winglet/style-utils` items 2 and 3, `@slats/agents-assets-sync` item 1, and the console format string of `@winglet/common-utils` item 7.
39. Documents and translations that a fix or a later change did not update, again (round 3 classes 21 and 27): `@canard/schema-form` item 15, `@winglet/react-utils` items 3 and 5, `@winglet/data-loader` item 2, `@winglet/common-utils` items 4 and 12, `@winglet/style-utils` item 4, `@slats/agents-assets-sync` items 12 and 13.
40. Run-time APIs and type requirements newer than the documented environment or consumer configuration: ajv6 item 9, ajv7 item 6 and ajv8 item 4 (Safari 14.0), ajv8 item 5 (ES2020 `lib`), `@winglet/json-schema` item 1 and `@canard/schema-form` item 19 (`node10` resolution), `@canard/schema-form` item 20 (`exactOptionalPropertyTypes`), `@slats/agents-assets-sync` item 14 (`require` under `nodenext`) (round 3 class 30).
41. Results that depend on the output mode of a command-line tool: `@slats/agents-assets-sync` items 5, 7, 8 and 11.
42. Spelling variants of one value handled differently, again: antd5 and antd6 items 3 (lowercase `z`) and 4 (Unicode normalization), `@winglet/common-utils` item 8 (full Unicode case mapping), `@winglet/json` item 3 (empty reference tokens).

## Areas to revisit

No hunter reached the cap of 20; the largest list had 14 items in one package. These areas produced high findings from angles new to them and are revisited if another round runs:

- `r4-validation`: the AJV plugins' items 1 to 3 in ajv6, items 1 and 2 in ajv7 and item 1 in ajv8, from `IN3`, `EQ11` and `BS2`.
- `r4-ui-antd`: antd5 and antd6 item 1, from `EQ11` and `RG1`.

Every other area produced at least one finding at medium or above except `r4-contracts` and the `@winglet/json-schema`, `@winglet/style-utils` and `@winglet/data-loader` parts of their shared areas, whose findings are all low this round.

## Areas to lower

None. No area produced nothing at medium or above in two consecutive rounds: `@winglet/json-schema`, `@winglet/style-utils`, `@winglet/data-loader` and the release-artifact area each had a medium finding in round 3.

## Wave decision

Round 5 does not run. The wave targeted round 5, and round 4 shows the oscillating signal, which the skill names as a reason to stop early:

- Clean: absent. The round confirmed 4 distinct high defects and 28 distinct medium defects.
- Trivial: absent. The high items arise in common usage: browsing a range picker, two forms that share a schema, an application that registers its own schema, and a price field.
- Oscillating: present. Three functions yielded a finding of the same class for the third round, all three on the second-round watch list that the fix session sent: the terminal plan path of `@slats/agents-assets-sync` (round 2 item 3, round 3 item 2, now items 5 and 11, item 5 at medium), the string context of `compressCss` in `@winglet/style-utils` (round 1 item 4, round 3 item 1, now item 3) and the shared state of `getTrackableHandler` in `@winglet/common-utils` (round 2 item 5, where one concurrent call reset the shared `pending` flag, round 3 items 2 and 15 on its lifecycle hooks, now item 3, where a nested call resets the shared hook flag when `preventConcurrent` is `false`). In each, a fix closed the reported input and the next round found a neighbor with the same mechanism, so the owner has to decide the contract before more hunting can settle it: which output modes and package combinations the terminal plan path must match, how far `compressCss` must parse CSS strings, comments and escapes, and whether hook re-entry is supported when `preventConcurrent` is `false`. No finding at medium or above reverses an earlier fix's decision. The other reopened fixes are recorded as Reopens because their decisions stand: `@canard/schema-form` items 1, 3, 4, 6, 7 and 8, the UI plugins' id items, ajv6 items 4 and 5, ajv7 item 3, ajv8 item 2, `@slats/agents-assets-sync` item 4 and `@winglet/react-utils` item 1. Two of them are regressions that a round 3 fix introduced without reversing its decision: `@canard/schema-form` item 1 (round 3 item 15) and `@winglet/react-utils` item 1 (round 3 item 3); the UI plugins' id items also arrived with the round 3 id fixes, which introduced the derived option ids in those plugins.
- Round limit: not reached. Round 5 was the target.

Stopping ends only the hunting: the fix session still fixes round 4's findings. Another round makes sense once the owner has decided the three contracts above and the packages have been rebuilt, so that the release-artifact conclusions withdrawn below can be checked again.

## Probes and verification limits

Probe copies sit in [probes/](probes/) as `probes/<package-slug>/<hunter-id>/`. They do not run in place, because path aliases and relative imports do not resolve there; copy a folder back to `<package path>/src/__bounty__/<hunter-id>/` and run the command its package document gives, with `--config src/__bounty__/<hunter-id>/vitest.config.ts` when the folder has a probe-local configuration.

- Every package's built `dist` in the working tree predates the round 1 to round 3 fixes (built on 2026-11-17, with no `.d.cts` files), and a workspace import by package name resolves to `dist`. A rebuild was not run, because the bug bounty procedure does not rebuild packages and the permission classifier denied `yarn build:all`. Most probe folders therefore carry a probe-local Vitest configuration that puts the `source` export condition first and maps each package's internal `@/<name>` aliases to source, with a control test that proves the source was loaded. The antd folders alias every workspace export subpath instead, because the third-party `scroll-into-view-if-needed` and `compute-scroll-into-view` also declare a `source` condition. The freshness check at launch compared file times and missed the stale builds; this round changed the skill's Prepare step to compare each `dist` with the last commit that touched its package's source.
- Static only, from declarations or manifests rather than a failing run on current output: `@winglet/json-schema` item 1 and `@canard/schema-form` item 19 type-check the stale `dist` declarations, whose import lines equal the current source; `@slats/agents-assets-sync` item 14 type-checks the stale `dist/index.d.ts`; ajv8 item 5 emits one declaration file in memory. `@canard/schema-form` item 20 type-checks source type modules, but `@winglet/json-schema` types resolve to its stale `dist`, whose relevant lines equal the source.
- The release-artifact hunter built HEAD once into a scratch copy outside the repository before it learned that the round does not build; the repository and its `dist` were not touched. The conclusions that came only from that build are withdrawn and must be checked again after the owner rebuilds: the declaration type-check matrix across module resolution and compiler profiles, export-name parity between the ESM and CommonJS entries, React 18 type compatibility, and loading the CommonJS entries with `require(esm)` disabled.
- Browser behavior rests on jsdom: focus fixup is applied by hand in `@lerx/promise-modal` item 4, the Navigation API is simulated in its item 2, the missing ES2021 globals are emulated for the Safari 14.0 items, and the native reset and radio regrouping of `@canard/schema-form` items 5 and 6 follow jsdom's implementation of the HTML rules.
- `@canard/schema-form` item 16 is a wall-clock measurement and depends on the machine; its growth ratio was about 13 to 21 across runs.
- React 18: the `@canard/schema-form` React and compile render probes and the `@lerx/promise-modal` probes ran under React 19 and React 18; `@lerx/promise-modal` rows that need `Activity` are skipped under React 18. The UI plugin probes ran under React 19 only. An earlier React 18 hydration failure in the `r4-react` folder was a defect of the probe's own helper, not of the library, and the current probe and its diagnostic file pass.
