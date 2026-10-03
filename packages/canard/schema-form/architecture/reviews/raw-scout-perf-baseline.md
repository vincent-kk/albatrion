# schema-form performance baseline inventory

## (A) Benchmark inventory — `packages/canard/schema-form/bench/`

Run via `vitest bench --config vitest.bench.config.ts` (node env, no JSDOM; `vitest.bench.config.ts:12-27`). Scripts (`package.json:47-50`): `bench`, `bench:baseline` (writes `bench/.results/baseline.json`), `bench:compare` (diffs live vs baseline), `bench:watch`. `bench/.results/` is git-ignored (`bench/README.md:19`); **`baseline.json`, `latest.json`, `object-pending-read.baseline.json` all exist** on disk today.

| File | Scenario | Sizes | API |
|---|---|---|---|
| `nodeFromJSONSchema.bench.ts` | Pure schema→node-tree build, no React | flat 5 / nested 7 / oneOf 1-branch / computed | `nodeFromJSONSchema` |
| `branch-strategy-init.bench.ts` | `__primeInitialBranch__`+`__processChildren__` cost (race-fix #318 path) | oneOf 2×3…10×10 branches×children; nested depth 3/5 | `nodeFromJSONSchema` w/ oneOf |
| `event-cascade.bench.ts` | `setValue`→cascade cost, isolated from macrotask drain floor via K-batched distinct-field writes | 20 fields, batch=10/drain; derived chain a→sum→twice→label; oneOf toggle | `find().setValue()` + drain |
| `find-node.bench.ts` | `find()` traversal vs depth/fanout | depth 3/7/12; fanout 10/50 | `node.find(path)` |
| `compute-recalculate.bench.ts` | Pure `ComputedPropertiesManager.recalculate()` | visible/active/derived(2,7 deps)/watch(5)/oneOfIndex(3) | `.recalculate()` |
| `object-pending-read.bench.ts` | Parent object read cost while a child's batched commit is pending, vs no-read/write-only | 1000-op batches; depth 2/8/16 same-value writes; 50-field mount | `ObjectNode.value`, `setValue` |
| `render-delay.bench.ts` | Version-to-version mount regression guard: `[mount]` (validation on/off) + `[guard]` isolated clone cost | small(5)/medium(25)/large(150) terminals | `nodeFromJSONSchema`, `clone()` |

## (B) Cross-library benchmark — `packages/aileron/benchmark-form`

`packages/aileron/benchmark` (no `-form`) does **not** touch schema-form (only `benchmark-form/package.json:27-32` depends on it) — excluded.

`benchmark-form` compares `@canard/schema-form` (workspace + pinned 0.9.0-0.12.5) vs `@rjsf/core`, `react-hook-form`, `formik`, `@tanstack/react-form` (`package.json:26-42`). Shared harness (`src/benchmarks/competitors/harness.ts:1-120`) runs every adapter through identical mount/keystroke/setValueProgrammatic phases on **flat string-only** schemas (`harness.ts:19-23`) — schema-form-exclusive features (computed/&ref/if-then-else/oneOf) are deliberately excluded from cross-library comparison and instead covered by schema-form-only "scale" benches (`src/fixtures/scale-schemas.ts`: flat 50/100/500, nested depth×fanout, array 100/500/1000, oneOf 5/10/20) and `array-node-stress.tsx` (push/applyValue/remove, workspace-only). Run via `bench`, `bench:scale`, `bench:full`, `guard:baseline`/`guard:check` (statistical regression gate) scripts (`package.json:6-24`).

Per `PLAN.md` (historical, unverified here): mount cost ~linear in node count for flat/nested/array; oneOf mount cost is branch-count-independent (active branch only — lazy init confirmed); a ~10-12% cumulative mount-speed regression v0.5.0→pre-fix `latest` was attributed mainly to `BranchStrategy.initialize`'s per-node cost, not the race fix (`PLAN.md:164-166,335-337`).

## (C) Mobile perf report — `docs/ko/MOBILE_PERFORMANCE_REPORT.md`

2026-02-22, v0.10.6; audits all 10 `examples/` forms + bundle size (231KB raw/42.8KB gzip, `minify:false`) + the fact `SchemaNodeProxy` itself isn't `memo`-wrapped. All 10 + the memo question: **PASS**. Reasoning: value-change re-renders don't reach `SchemaNodeProxy` (Form is `memo`; `UPDATE_CHILDREN_MASK` excludes value updates); where a Proxy does re-render, `SchemaNodeInput`'s own `memo` blocks the DOM work, so un-memoized Proxy re-render costs ~0.01ms (hook-deps comparisons only). Worst cases measured: 6-dependent computed cascade ~<5ms (`role-based-access`), 2× nested oneOf switch ~<5ms (`media-registration`), 5-level nested propagation ~<1ms (microtask batching). Declared thresholds: total fields <50 safe/50-100+ caution; array items <30 safe/30-100+ needs `react-window`; computed deps <20 safe; nesting depth <8 safe; oneOf-branch field count <20 safe.

## (D) Optimization inventory — `src/`

| Mechanism | Where | Cost avoided |
|---|---|---|
| Shared frozen computed sentinel | `getComputedPropertiesManager.ts:19-26`, sentinel `.../utils/sharedComputedSentinel/sharedComputedSentinel.ts:8-34`, wired `AbstractNode.ts:1200-1201` | Per-node manager + empty-array alloc when schema has no computed/conditional surface |
| O(1) simple-equality branch index | `.../ComputedPropertiesManager/utils/getConditionIndexFactory/utils/getSimpleEquality.ts:16-64` | JS-expression eval for `&if`/oneOf conditions of form `dependencies[n]==="v"` — compiles to dictionary lookup |
| Lazy composed-value cache (`__composed__`) | `core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:107-110,304-317` | Recomposing base+draft on every `.value` read while a commit is pending; repeat reads share one reference |
| Event batching + merge (`EventCascadeManager`) | `.../EventCascadeManager/EventCascadeManager.ts:79-125`, merge `.../utils/mergeEventEntries.ts:13-30` | Sync re-entrant cascades; merges same-microtask publishes into one bitmask-OR'd collection |
| `revision(mask)` delivery ledger | `EventCascadeManager.ts:159-201` | Lets a late subscriber (concurrent-render gap) detect missed deliveries via monotonic per-type counters |
| `SetValueOption` bit flags incl. `Batch`/`Isolate` | `core/types/value.ts:26-66` | Batch=defer parent commit to one emit; Isolate=unsettled publish+single computed recompute, avoiding N commit/propagate cycles on bulk writes |
| `matchesSchemaPath` allocation-free check | `.../ValidationManager/utils/matchesSchemaPath.ts:29-37` | String alloc when matching AJV `schemaPath` against a node path |
| Render virtualization (deferred mount) | `helpers/virtualization/VirtualizationManager/VirtualizationManager.ts:44-70` (one shared IntersectionObserver + idle pump per form) | Eager-mounting every child of a large branch (≥`threshold`); rest mount on IO/idle |
| Memoized child-component map | `components/SchemaNode/SchemaNodeInput/hooks/useChildNodeComponents.tsx:52-113` | Recreating a `memo`-wrapped child component per render; keyed `Map` keeps identity stable across array renumbering |

## (E) `intersectSchema` merge policy (allOf)

Caller `helpers/jsonSchema/processAllOfSchema/processAllOfSchema.ts:34-53`: accumulator (`base`) = outer schema minus `allOf`; each `allOf[i]` merges in as `source`, left-to-right, in place.

| Field class | Fields | Policy | Where |
|---|---|---|---|
| Range keywords | min/max(Length/Items/Properties/Contains), multipleOf | Narrowing intersection (max-of-min, min-of-max) | `intersectMinimum.ts:13-21`, `intersectMaximum.ts:13-21` |
| `enum` | — | Set intersection (deep-equal aware); throws `EMPTY_ENUM_INTERSECTION` if disjoint | `intersectEnum.ts:23-41` |
| `pattern` | — | AND via lookahead concat `(?=A)(?=B)` | `intersectPattern.ts:14-22` |
| `required` | — | Union (dedup) | `unionRequired.ts:14-22` |
| First-win metadata | `title, description, $comment, examples, default, readOnly, writeOnly, format, additionalProperties, patternProperties, prefixItems` | Earliest-defined value wins; later redefinitions ignored | `processFirstWinFields.ts:16-27`, list `utils/constants.ts:8-20` |
| Ignored (composition) | `allOf, anyOf, oneOf, not, if/then/else, dependencies, dependentRequired/Schemas, unevaluatedProperties/Items, contains` | Dropped; dev warning if inside an `allOf` sub-schema | `constants.ts:61-75`, warning `processAllOfSchema.ts:38-44` |
| **Everything else** — `FormTypeInput`, `options`, `computed`, `&`-prefixed keys, `errorMessages`, any unrecognized key | not in any list above | **Last-wins**: `processOverwriteFields` unconditionally overwrites `base[key]` with `source[key]` whenever defined, each iteration — so the last `allOf` entry defining the key wins | `processOverwriteFields.ts:15-25`, `EXCLUDE_FIELDS` `constants.ts:84-88`, call order `intersectObjectSchema.ts:36-37` |

## (F) UNTRACED

- Validator compile caching: `ValidationManager` compiles once per node at construction (`ValidationManager.ts:191-204`); no cross-node compile cache inside `schema-form/src` — any such cache lives in the validator plugin package (ajv7/8), not inspected (out of `src/` scope).
- Root `onChange`/validation debouncing rides the same `EventCascadeManager` microtask batch (§D); no dedicated "debounce" utility found (`grep -rn debounce src` = 0 hits).
- `benchmark-form/browser-bench/` (Playwright) and `src/utils/heap-snapshot.tsx` exist but not read — outside requested bench/README + `*.bench.ts` scope.
- `intersectArraySchema.ts`, `intersectStringSchema.ts`, `intersectNumberSchema.ts`, `intersectBooleanSchema.ts`, `intersectConst.ts`, `intersectMultipleOf.ts`, `distributeSubSchema.ts`, `processSchemaType.ts` not opened individually — inferred from `intersectObjectSchema.ts`'s call pattern, which all five `intersect*Schema` entry points share via the common `processFirstWinFields`/`processOverwriteFields`/`constants.ts`.
