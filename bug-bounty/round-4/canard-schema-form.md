# @canard/schema-form: bug bounty round 4

This round confirmed 20 new findings in `@canard/schema-form`: 8 medium and 12 low. Items in the earlier round documents ([round 1](../round-1/canard-schema-form.md), [round 2](../round-2/canard-schema-form.md), [round 3](../round-3/canard-schema-form.md)) were treated as fixed and excluded. Five hunters covered this package: `r4-compile` (compile time), `r4-engine` (runtime engine), `r4-react` (React layer), `r4-validation` (validation together with the AJV plugins) and `r4-contracts` (release artifacts). The main session re-ran every probe folder, each through its probe-local configuration where the folder has one, which loads `@winglet/*` from source instead of the stale built `dist`: the `r4-compile` unit project ran 51 tests with 16 failing, its render project 6 tests with 4 failing, and its React 18 `publicForm.test.tsx` 5 tests with 4 failing; the `r4-engine` unit project ran 88 tests with 31 failing; the `r4-react` render and React 18 projects ran 36 tests each with 17 failing in each; the `r4-validation` unit project ran 14 tests with 4 failing; the `r4-contracts` unit project ran 4 tests with 2 failing. Every failing test maps to an item below, to a symptom of another package's item, or to a diagnostic, measurement or rejected hypothesis named under the probes.

Probes: [probes/canard-schema-form/](probes/canard-schema-form/)

- From `r4-compile`:
  - Probe folder in the working tree: `packages/canard/schema-form/src/__bounty__/r4-compile/`; the round copy is `bug-bounty/round-4/probes/canard-schema-form/r4-compile/`.
  - To run the copy, copy it back to `packages/canard/schema-form/src/__bounty__/r4-compile/` and run the three commands below. The folder's `vitest.config.ts` extends the package configuration, puts the `source` condition first and adds the `@/common-utils`, `@/json`, `@/json-schema` and `@/react-utils` aliases, so every `@winglet/*` import loads from source instead of the stale `dist`.
    - `yarn workspace @canard/schema-form test --run --config src/__bounty__/r4-compile/vitest.config.ts --project unit src/__bounty__/r4-compile/`
    - `yarn workspace @canard/schema-form test --run --config src/__bounty__/r4-compile/vitest.config.ts --project render src/__bounty__/r4-compile/`
    - `yarn workspace @canard/schema-form test --run --config src/__bounty__/r4-compile/vitest.config.ts --project react18 src/__bounty__/r4-compile/`
  - Failing tests that are not findings:
    - `compileEdges.test.ts`, "diagnostic: injectTo with the absolute spelling /g/../top": diagnostic for item 9, showing the same root cause at the `injectTo` entry point.
    - `compileEdges.test.ts`, "diagnostic: direct path spelling": diagnostic for the round 3 open lead on property names with a space. It fails visibly with `CREATE_DYNAMIC_FUNCTION`, and other spellings work, so it is not reported.
    - Running `publicForm.test.tsx` also prints unhandled errors. They are the load failures that the deliberately broken schemas report to the host, as the documents describe, and not failing tests.
  - Control tests that pass:
    - `sourceControl.test.ts` (unit) and `sourceControlRender.test.tsx` (render and react18) show that `@winglet/common-utils/lib`, `@winglet/json/pointer-escape` and `@winglet/json-schema/keyword` imported by package name are the same module instances as their `src` files.
    - `compileEdges.test.ts`: the plain AJV reference for item 1, the schemas without `$id`, the documented expression form, the constant-assigned literal, the relative spelling `../g/../top`, `node.find` on the absolute spellings, `injectTo` with a relative target, the four Boolean `if` cases, and the two space-name spellings that work.
    - `warningsRef.test.ts`: the declaration-list diagnostic.
    - `templateGates.test.ts`, `embeddedResources.test.ts` and `ifAgainstAjv.test.ts` pass completely.
    - `publicForm.test.tsx`: "reset after replacing the schema loads the valid schema and submits".
  - Verification limits:
    - Every probe imports `@canard/schema-form` source, and `@winglet/*` source through the folder's configuration; no result goes through a built `dist`.
    - The `.test.ts` probes use the internal fixtures `nodeFromJSONSchema` and `createTestValidator` and the internal `blueprint` function; all four findings are also confirmed through the public `Form` on React 19 and React 18.
    - The earlier load in item 1 and the earlier W1 pass in item 11 were not executed, because the earlier code was not run.
- From `r4-engine`:
  - The probe folder in the working tree is `packages/canard/schema-form/src/__bounty__/r4-engine/`; the round copy is `bug-bounty/round-4/probes/canard-schema-form/r4-engine/`. To run the copy, copy it back to `packages/canard/schema-form/src/__bounty__/r4-engine/` and run `yarn workspace @canard/schema-form test --run --config src/__bounty__/r4-engine/vitest.config.ts --project unit src/__bounty__/r4-engine/`. The probe-local `vitest.config.ts` extends the package configuration and resolves the `@winglet` packages from their source through the `source` export condition and their internal aliases, because every `dist` was stale during the round; the control `sourceResolution.test.ts` passes under it and fails under the package's default configuration. Diagnostics are appended to `r4-engine-diag.log` in the operating system temporary directory. The run gives 88 tests, of which 31 fail.
  - Failing tests that are not findings:
    - Diagnostic: `batchDifferentialShapes.test.ts` (its three differing seeds all reset the held `/period` node, so they show item 2 and item 3); `branchPayload.test.ts` "D1" (the UpdateValue payload of a terminal node carries raw values, which the probe first assumed were `{ value, outputValue }` pairs); `virtualReset.test.ts` "V7" (the `isDivergent` of a virtual group stays false and its `defaultValue` is `undefined`, which the literal "at this path" wording of the documents allows).
    - Rejected hypothesis: `arrayResetSubtree.test.ts` "A1" to "A6" (the load snapshot of an array follows structural operations and length changes by design, WRITE-085 and WRITE-095 in `packages/canard/schema-form/src/core/engine/settle/arrangeFieldNodeItems/DETAIL.md:35` and `:41`); `batchDifferential.test.ts` and `batchDifferentialNested.test.ts` (their differences are reads through `find` after an uncommitted scalar mark, which the documents say see the last commit, and EVENT-013 discarding a mark inside the reset scope); `batchWriteOptions.test.ts` "W1" and "W2" (suppression applied to a whole batch is deliberate under WRITE-015 and pinned by `packages/canard/schema-form/src/core/__tests__/regression/r7-port-notify.test.ts:187`); `branchPayload.test.ts` "D2" (without a gate every `oneOf` branch is on, as `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/expressions.md:84` states); `updaterProjection.test.ts` "P2" (the "same projected value as getValue()" sentence describes the root updater, and its control "P1" passes).
  - Control tests that pass: `sourceResolution.test.ts`; `virtualReset.test.ts` "V3" and "V4"; `virtualValidate.test.ts` "VV2" and "VV3"; `batchWriteOptions.test.ts` "W4"; `updaterProjection.test.ts` "P1"; and every test in `asyncOvertake.test.ts`, `retentionGrowth.test.ts`, `failureRecovery.test.ts`, `resetDerived.test.ts`, `batchMergeBranches.test.ts`, `batchChildrenEvents.test.ts`, `validatorWriteback.test.ts`, `churnCost.test.ts`, `terminalArrayVerbs.test.ts` and `batchGlobalState.test.ts`.
  - Verification limits: every probe builds trees through `buildFieldNodeTree` and `mountFieldNode`, the channel `<Form>` uses (`probeHelpers.ts`), and calls public `FieldNode` methods; no probe renders `<Form>`. The test named UI in item 13 calls the internal binding function `writeFieldNodeInput`. item 16 is a wall-clock measurement.
- From `r4-react`:
  - Probe folder in the working tree: `packages/canard/schema-form/src/__bounty__/r4-react/`; the round copy is `bug-bounty/round-4/probes/canard-schema-form/r4-react/`.
  - To run the copy: copy it back to `packages/canard/schema-form/src/__bounty__/r4-react/` and run `yarn workspace @canard/schema-form test --run --config src/__bounty__/r4-react/vitest.config.ts --project render src/__bounty__/r4-react/` for React 19, and the same command with `--project react18` for React 18. The folder's `vitest.config.ts` extends the package config, puts the `source` export condition first and maps the `@/<name>` aliases of the `@winglet/*` packages, so every `@winglet/*` import loads from source instead of the stale `dist`.
  - Each project runs 36 tests, and 17 fail in both: the 16 finding tests above and one diagnostic.
  - Failing tests that are not findings: `equalsCycle.test.tsx`, "[diagnostic] source equals on two isomorphic cyclic contexts", a diagnostic for item 7. It shows that `equals` from `@winglet/common-utils` source also does not terminate on the cyclic input (`'Error: did not terminate'`).
  - Control tests that pass:
    - `sourceResolution.test.tsx`: "control: @winglet subpaths imported by schema-form resolve to src". It fails under the package's default config.
    - `pluginScope.test.tsx`: "control: a nested FormProvider without settings keeps the unscoped plugin renderer" and "control: the same renderer in a plain object plugin is applied".
    - `radioItemMoves.test.tsx`: "control: rows show their loaded selections", "control: push keeps the selections of existing rows" and "remove(0) keeps the selections of the rows that move up".
    - `childFieldMapProto.test.tsx`: "control: a missing child with an ordinary name renders nothing".
    - `derivedOptionIds.test.tsx`: "control: siblings without a derived-id name keep ids unique and their labels inert for the groups".
    - `handleReentry.test.tsx`, `hydrationIds.test.tsx` and `hydrationDiag.test.tsx` pass completely; see the hypotheses below.
  - Verification limits:
    - Every probe renders through the public API in jsdom. No real browser was used, so the radio regrouping of item 6 and the native reset of item 5 follow the HTML rules as jsdom implements them.
    - On cold or loaded React 18 runs, an earlier version of the hydration helper reported "This root received an early update, before anything was able hydrate". This was a probe defect: the helper started `hydrateRoot` outside `act` and then unmounted the root before React's hydration task had run. `hydrationDiag.test.tsx` reproduces the same message on markup without schema-form. The helper now starts hydration inside `act`.
- From `r4-validation`:
  - Probe folder in the working tree: `packages/canard/schema-form/src/__bounty__/r4-validation/`; the round copy is `bug-bounty/round-4/probes/canard-schema-form/r4-validation/`.
  - To run the copy: copy it back to `packages/canard/schema-form/src/__bounty__/r4-validation/` and run `yarn workspace @canard/schema-form test --run --config src/__bounty__/r4-validation/vitest.config.ts --project unit src/__bounty__/r4-validation/`. The main session's run gave 14 tests, of which 4 fail: 2 for [canard-schema-form-ajv7-plugin item 1](canard-schema-form-ajv7-plugin.md) and [canard-schema-form-ajv6-plugin item 1](canard-schema-form-ajv6-plugin.md), 1 for [canard-schema-form-ajv6-plugin item 5](canard-schema-form-ajv6-plugin.md), and the rejected hypothesis below.
  - Failing tests that are not findings:
    - `guardThrowsOnce.test.ts`, "after the input is corrected the form returns to the state of the same input without the failure": a rejected hypothesis (see "Hypotheses checked and not bugs").
  - Control tests that pass:
    - `sharedValidatorOverlap.test.ts`: both tests of the "[control] ajv8, root without $id" rows.
    - `ajv6PointerCacheRouting.test.ts`: "[control] without earlier application use the issue path is a JSON Pointer".
    - `guardThrowsOnce.test.ts`: "[control] input the guard always accepts keeps diagnostics stable" and "[control] the same keyword throwing once in whole validation recovers on the next value".
    - `sourceControl.test.ts`: both tests, which show that `@winglet/common-utils/filter` and `@winglet/json-schema` resolve to their `src` modules.
  - `externalRefPlacement.test.ts` is a diagnostic that passes; it records the placements described under "Open leads".
  - Verification limits: the folder's `vitest.config.ts` adds the `source` export condition first and the internal `@/<name>` aliases, so workspace packages resolve to `src`. The probes build forms with the internal fixture `src/__tests__/fixtures/nodeFromJSONSchema.ts` and use the public `FieldNode` API; `guardThrowsOnce.test.ts` also calls the internal `submitForm`. The AJV plugins are imported from their sources by relative path.
- From `r4-contracts`:
  - Probe folder in the working tree: `packages/canard/schema-form/src/__bounty__/r4-contracts/`; the round copy is `bug-bounty/round-4/probes/canard-schema-form/r4-contracts/`.
  - To run the copy: copy it back to `packages/canard/schema-form/src/__bounty__/r4-contracts/` and run `yarn workspace @canard/schema-form test --run src/__bounty__/r4-contracts/node10RootTypes.test.ts --project unit` and `yarn workspace @canard/schema-form test --run src/__bounty__/r4-contracts/exactOptionalDeclarations.test.ts --project unit`. No probe-local configuration is needed.
  - The main session ran 4 tests: 2 fail, one for each item above, and 2 controls pass.
  - Failing tests that are not findings: none.
  - Control tests that pass:
    - `node10RootTypes.test.ts`: "control: a bundler consumer sees FormHandle.submit typed (assigning it to number is TS2322)".
    - `exactOptionalDeclarations.test.ts`: "control: the schema type modules type-check with the package options".
  - Verification limits: both probes drive the TypeScript compiler API in the test process and write nothing to the repository. The node10 probe links the workspace packages into a consumer in a temporary directory under `os.tmpdir()` and reads their stale `dist` declarations; item 19 is therefore static only and should be re-run after a rebuild. The `exactOptionalPropertyTypes` probe reads schema-form source and the stale `@winglet/json-schema` declarations described under item 20.

Root-cause files: `packages/canard/schema-form/src/` for every item, with three additions: item 8 also covers the packaged guide `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/field-input.md`; item 15 is in the documentation site pages under `documents/docs/canard/schema-form/` and their Korean copies under `documents/i18n/ko/`; item 20 also involves `packages/winglet/json-schema/src/types/jsonSchema.ts`.

## 1. A draft-07 schema that declares a fragment `$id`, such as `"$id": "#address"`, makes the Form fail to load with `UNKNOWN_JSON_SCHEMA`, although every `$ref` is a JSON Pointer and plain AJV accepts the schema.

- Severity: medium. A form whose draft-07 schema names a subschema with a location-independent identifier renders nothing and reports `JSON_SCHEMA_ERROR.UNKNOWN_JSON_SCHEMA`. The same schema validates in plain AJV, and it loaded before the round 3 fix.
- Affected public API: `jsonSchema` of `Form`. The failure needs a string `$id` with a non-empty fragment in one of three places: on a declared property or branch schema, on any schema that a `$ref` JSON Pointer walks through, or anywhere in the document once another embedded `$id` makes the engine build its resource index.
- Contract violated:
  - JSON Schema draft-07 Core, section 8.2.3 (https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-01#section-8.2.3), defines an `$id` with a plain-name fragment as a location-independent identifier.
  - `packages/canard/schema-form/src/core/engine/blueprint/buildNodes/DETAIL.md:89` (BLUEPRINT-030) leaves anchors unresolved and fails only broken URIs and pointers, resources outside the document and targets that are not schemas. An identifier that no reference uses is none of these.
  - `documents/docs/canard/schema-form/validation.mdx:56` asks that `$id` and anchor context be preserved. Plain AJV with its default draft-07 class, which the AJV 8 `default` entry and the AJV 6 and AJV 7 plugins use, compiles the schema.
- Root cause:
  - `packages/canard/schema-form/src/core/engine/blueprint/buildNodes/utils/references/resources/resolveResourceIdentifier.ts:21-23` throws for every identifier with a non-empty fragment, and `resources/getResourceIndex.ts:46-55` calls it for every string `$id` in the document.
  - The engine builds that index from `references/resolveReference.ts:49-50` when a JSON Pointer walk meets any `$id`, and from `declarations/collectDeclarations.ts:58-59` when a non-root declaration has one. The error therefore ends construction.
- Relation to earlier rounds: Same class as [round 3 item 15](../round-3/canard-schema-form.md), which this fix addressed, and round 3 cross-package class 21, a fix that left a case out (`../round-3/README.md`).
- Reopens an earlier fix: [Round 3 item 15](../round-3/canard-schema-form.md). `git log -L` on the root-cause lines shows `73e47569b`, `b3b10604e` and `53a05f27e`. The fix introduced the load failure without reversing its decision that anchors stay unresolved, so this is recorded as a reopened fix, not an oscillation. Before `73e47569b`, `resolveReference` ignored `$id`, so these schemas loaded; this comes from reading the diff and was not executed.
- Reproduction:
  - `compileEdges.test.ts`, "the form loads a definition with a fragment $id referenced by JSON pointer" and "the form loads an inline property that declares a fragment $id": the actual result is `JSON_SCHEMA_ERROR.UNKNOWN_JSON_SCHEMA`, and the expected value is `{ home: { city: 'Seoul' } }`. The plain AJV reference test and the control without `$id` pass.
  - `publicForm.test.tsx`, "a definition with $id "#address" referenced by JSON pointer renders its field": `getValue()` returns `undefined` and `onError` receives `JSON_SCHEMA_ERROR.UNKNOWN_JSON_SCHEMA`, on React 19 and React 18.
- Confidence: high for the behavior, through the public API. The claim that the schema loaded before the fix rests on reading the diff.

## 2. Calling `resetSubtree()` on a virtual group deletes both stored fields from the form value instead of restoring their loaded values.

- Severity: medium. Loaded data is lost from the output and from the screen, even when nothing was edited. A date-range FieldInput, the canonical virtual case, that offers a reset through `node.resetSubtree()` erases the start and end dates it was meant to restore, and the form then submits without them. Resetting a virtual group is less common than resetting an ordinary field.
- Affected public API: `FieldNode.resetSubtree` on a virtual node, reached through `FormHandle.findNode('/period')` or the `node` prop of the virtual FieldInput.
- Contract violated:
  - `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/virtual-schema.md:3` states that `options.virtual` does not change the stored data shape, and line 28 states that the underlying fields are what actually gets stored.
  - `packages/canard/schema-form/src/core/engine/settle/DETAIL.md:218` states that the load snapshot is the source of `resetSubtree`, and line 121 states that `resetSubtree` treats only its scope as a new lifetime.
  - `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/interaction-state.md:123` states that a child `resetSubtree()` follows its own load source.
- Root cause: `packages/canard/schema-form/src/core/engine/settle/utils/reset/resetFieldNodeSubtree.ts:20` to line 27 reads the load snapshot at `node.path`. The path of a virtual node, such as `/period`, is an alias that does not exist in the stored data, so `getLoadValue` returns `undefined`. `setLoadValue` then records `undefined` at `/period`, and the Load write of `undefined` to the virtual node scatters `undefined` into every referenced field.
- Relation to earlier rounds: Same class as round 2 cross-package class 1 (indirection moves the location a decision is keyed on; [round 2 README](../round-2/README.md)). This instance is new: the alias path of a virtual group is used as a data address.
- Reopens an earlier fix: No. `git log -L 15,30` on the root-cause file shows `b63bac7f0`, `927f50024`, `5528e4026`, `c5c7c453b` and `2d7d72d82`, none of them a bug bounty fix.
- Reproduction: `virtualReset.test.ts`, with `start` and `end` grouped as `period` and loaded as `2025-01-01` and `2025-01-31`.
  - Test "V1 resetSubtree on an unedited virtual group keeps the loaded field values": the actual value is `{ note: 'n' }`; the expected value is `{ start: '2025-01-01', end: '2025-01-31', note: 'n' }`.
  - Test "V2 resetSubtree on a virtual group restores its edited fields to the loaded values": after the group is set to `['2025-02-01', '2025-02-28']`, the actual and expected values are the same as in V1.
  - The controls "V3" (`resetSubtree()` on each field) and "V4" (the root `resetSubtree()`) restore both fields and pass.
  - Every difference in the seeded differential `batchDifferentialShapes.test.ts` (seeds 15, 64 and 331) comes from a step that resets the held `/period` node.
- Confidence: high; public `FieldNode` API on trees built through `buildFieldNodeTree` and `mountFieldNode`, with the `@winglet` packages loaded from source.

## 3. Inside a batch, a write marked through a virtual group survives a later `resetSubtree()` of one of its fields, and the reverse also holds, so the reset is overwritten when the batch ends.

- Severity: medium. A consumer who writes through a virtual group and resets one of its fields in the same `batch` or `visitSubtree` visitor sees the reset applied inside the batch and silently reverted at its end, while the same calls made one by one keep the reset. This is the symptom of round 3 item 10, reached through the alias of a virtual group.
- Affected public API: `FieldNode.batch` and `FieldNode.visitSubtree` with `FieldNode.resetSubtree`, after `setValue` on a virtual group or on one of the fields of a virtual group that is reset.
- Contract violated:
  - `packages/canard/schema-form/src/core/engine/write/DETAIL.md:61` (EVENT-013) states that a subtree reset clears the marks in its own scope and settles the remaining ancestor marks first, so that an earlier mark does not overwrite the loaded value later.
  - `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/arrays-and-scale.md:84` states that a subtree reset loads immediately inside a batch.
  - Round 3 decided that a batch gives the same result as the same calls made one by one (`../round-3/FIXES.md`, the decisions for `@canard/schema-form` items 5 and 9).
- Root cause: `packages/canard/schema-form/src/core/engine/write/utils/entry/dispatchResetSubtree.ts:33` to line 43 decides which marks to discard and which to settle first by path alone (`isDescendantPath`). A mark on `/period` is neither inside the scope of `/start` nor its ancestor by path, and a mark on `/start` is not inside the scope of `/period` by path. The mark therefore stays in `batchWrites`, and `flushBatchWrites` applies it after the reset.
- Relation to earlier rounds: Sibling of [round 3 item 10](../round-3/canard-schema-form.md), where an ancestor mark undid a subtree reset inside a batch; the fix did not cover marks that reach the scope through a virtual alias. It shares the virtual alias address with item 2 but goes through a different function.
- Reopens an earlier fix: [round 3 item 10](../round-3/canard-schema-form.md). `git log -L 30,47` on the root-cause file shows the fix commits `16cdb5b45` and `d7304476e` ("round-3 schema-form 9, 10" and "round-3 schema-form 3,4,9,10,16"). The decision of that fix stands; this is an input it left out.
- Reproduction: `virtualReset.test.ts`.
  - Test "V6 batch: a virtual group write marked before resetSubtree of one of its fields is not applied over the reset": inside a batch, the group is set to `['2025-04-01', '2025-04-30']` and then `start` is reset. The actual value is `{ start: '2025-04-01', end: '2025-04-30', note: 'n' }`; the expected value, which the same calls give one by one, is `{ start: '2025-01-01', end: '2025-04-30', note: 'n' }`.
  - Test "V5 batch: a field write marked before resetSubtree of its virtual group is not applied over the reset" shows the reverse direction: the batched value keeps `start: '2025-03-01'`. Its sequential result is also affected by item 2, so V5 shows both items together.
- Confidence: high; public `FieldNode` API on trees built through `buildFieldNodeTree` and `mountFieldNode`, with the `@winglet` packages loaded from source.

## 4. A `FormProvider` without `pluginScope` inside a `FormProvider` that selects an application scope makes the Forms below it use the shared realm registry, so they are drawn and validated by another application's plugin or by no plugin.

- Severity: medium. It is the failure that [round 3 item 13](../round-3/canard-schema-form.md) fixed, and it returns in a common layout: an application isolates itself with `pluginScope` at its root, and a section adds its own `FormProvider` only to set `errorVisibility` or `validationMode`. The Forms in that section then use the renderers and validator that another application registered without a scope, or the built-in defaults when nobody did.
- Affected public API: `FormProvider` with `pluginScope`, `registerPlugin(plugin, { scope })` and `Form`.
- Contract violated:
  - `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/plugin-system.md:119-133` tells an application to isolate itself by registering with a scope and rendering its Forms under `<FormProvider pluginScope>`.
  - The `FormProvider` JSDoc at `packages/canard/schema-form/src/providers/ExternalFormContext/components/ExternalFormContextProvider.tsx:63` says that its configuration applies to all nested forms, and `.changeset/schema-form-application-plugin-scope.md:5` announces the isolation.
  - Predictability: with unscoped registration the same nested layout keeps the plugin renderer (the control passes), so choosing the documented isolation changes what an unrelated section renders.
  - Contract conflict for the owner: `packages/canard/schema-form/src/providers/ExternalFormContext/DETAIL.md:9` says that omitting `pluginScope` uses the realm-wide registry, which describes this code but not its effect on nested Forms.
- Root cause: `packages/canard/schema-form/src/providers/ExternalFormContext/components/ExternalFormContextProvider.tsx:206-209` selects the shared `PluginManager` whenever `pluginScope` is undefined, instead of keeping the `pluginManager` of the enclosing context. The inner provider replaces the outer context value as a whole, and every consumer reads the inner value: the renderer slots and the formatter (`packages/canard/schema-form/src/providers/FieldRendererContext/hooks/useFieldRendererContext.ts:13-24`), input selection (`packages/canard/schema-form/src/components/FieldProxy/components/FieldInputBridge/hooks/useFieldInput.ts:62`), the input frame (`packages/canard/schema-form/src/components/FieldProxy/components/FieldInputBridge/FieldInputBridge.tsx:61`) and the validator (`packages/canard/schema-form/src/providers/RootNodeContext/components/RootNodeContextProvider.tsx:79`).
- Relation to earlier rounds: Sibling of [round 3 item 13](../round-3/canard-schema-form.md); same class as round 3 cross-package class 21 (a fix that left a case out).
- Reopens an earlier fix: Yes. The fix for [round 3 item 13](../round-3/canard-schema-form.md) (`188cef38b`, then `53a05f27e`) is the history of the root-cause lines. The round 3 decision (realm-wide sharing by default, opt-in application scopes) stands; the fix left out the nested provider.
- Reproduction: `pluginScope.test.tsx`.
  - "a nested FormProvider without pluginScope keeps the application scope selected by the outer FormProvider": the renderer owners on the page are `['other-app']`; expected `['app-a']`.
  - "a nested FormProvider without pluginScope keeps the scoped validator": the validators that compiled are `['other-app']`; expected `['app-b']`.
  - The control "control: a nested FormProvider without settings keeps the unscoped plugin renderer" passes.
- Confidence: high for the behavior; medium that the owner treats it as a defect, because of the DETAIL sentence above. Public API.

## 5. A native reset button inside a Form restores the inputs on screen to their loaded values but leaves the form values unchanged, so the next submission sends values the user no longer sees.

- Severity: medium. The submitted data silently differs from the screen: after typing `typed` over `loaded` and pressing a `<button type="reset">`, the field shows `loaded` and `onSubmit` receives `typed`. Native reset buttons are less common than handle-based reset buttons in React applications.
- Affected public API: `Form` (the native form element it renders), the built-in inputs that read `defaultValue`, `onSubmit` and `FormHandle.submit`.
- Contract violated:
  - `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/imperative-and-layout.md:69` states that one Form creates its own native form boundary.
  - `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/field-input.md:62` states that an input displays the form value through `defaultValue`.
  - The [HTML Living Standard form reset algorithm](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#concept-form-reset) restores each control to its default without input events, so nothing tells the form that the screen changed.
  - Predictability: the value a user sees and the value that is submitted must agree.
- Root cause: `packages/canard/schema-form/src/components/Form/components/FormCore/components/FormRootProxy.tsx:20` renders `<form ref onSubmit>` and handles no `reset` event: it neither prevents the native reset nor resets the form through the handle. The built-in inputs are uncontrolled (`packages/canard/schema-form/src/fieldInputs/fieldInputDefinitions/FieldInputString/FieldInputString.tsx:40` passes `defaultValue`), so the browser reset changes only the DOM.
- Relation to earlier rounds: Same class as round 1 class 13 ([round 1](../round-1/README.md)), uncontrolled widgets whose display diverges from the form value, with a new mechanism.
- Reopens an earlier fix: No. `git log -L` on `FormRootProxy.tsx:18-24` shows `3a72d109d`, `c5c7c453b` and `54cbf6004`, none of them a bug bounty fix.
- Reproduction: `nativeReset.test.tsx`, "a native reset button leaves the screen and the submitted value in agreement": after typing and resetting, the input shows `'loaded'` and the submission is `{ name: 'typed' }`; expected the screen and the submission to hold the same value.
- Confidence: high. Public API in jsdom; not checked in a real browser, which applies the same reset algorithm.

## 6. Inserting an item at the front of an array whose items contain a built-in radio field clears the visible selection of a moved item, although the form value keeps it.

- Severity: medium. The screen is visibly wrong in a common layout, a list of rows with a radio choice: after `insert(0)` before `['a', 'b']`, the rows show `[null, 'a', null]`, and after `insert(0, { kind: 'c' })` they show `['c', null, 'b']`. Users see an empty choice for a stored value. The values stay correct.
- Affected public API: the built-in radio input (`presentation.inputType` set to `'radio'` or `'radiogroup'`) and `ArrayNode.insert`.
- Contract violated:
  - `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/field-input.md:160` makes the scoped id the native radio group name, and `field-input.md:62` states that an input displays the form value.
  - `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/arrays-and-scale.md:12` states that items from the insertion index keep their nodes and keys and move back one position.
  - The [HTML Living Standard radio button group](https://html.spec.whatwg.org/multipage/input.html#radio-button-group) unchecks the other radios of a group when a checked radio is inserted or its `name` changes.
- Root cause: `packages/canard/schema-form/src/fieldInputs/fieldInputDefinitions/FieldInputStringRadio/FieldInputStringRadio.tsx:67` sets the native `name` to the scoped id, which `packages/canard/schema-form/src/components/FieldProxy/components/FieldInputBridge/FieldInputBridge.tsx:265` builds from the current path. When items move, React renames each moved row's radios in place, in document order. The checked radio renamed from `/items/0/kind` to `/items/1/kind` joins the group that the next row still holds and unchecks it. A new checked row inserted at `/items/0/kind` unchecks the row that still holds that name. `remove(0)` passes because React removes the row before renaming the others.
- Relation to earlier rounds: Sibling of [round 3 item 6](../round-3/canard-schema-form.md); same class as round 3 cross-package classes 21 and 23. This is the second round in which native radio group names cause this class. The UI plugins also use the scoped id as the native radio name, so their radio groups may show the same symptom; that was not checked.
- Reopens an earlier fix: Yes. The fix for [round 3 item 6](../round-3/canard-schema-form.md) (`633ef8c8e` and `2cba123b8`) made the names path-based and left out item moves.
- Reproduction: `radioItemMoves.test.tsx`.
  - "insert(0) of an empty row keeps the selections of the rows it moves": the checked values per row are `[null, 'a', null]`; expected `[null, 'a', 'b']`. `getValue()` holds `a` and `b`.
  - "insert(0) of a selected row keeps the selections of the rows it moves": `['c', null, 'b']`; expected `['c', 'a', 'b']`.
  - The controls "control: rows show their loaded selections", "control: push keeps the selections of existing rows" and "remove(0) keeps the selections of the rows that move up" pass.
- Confidence: high in jsdom through the public API; not checked in a real browser, which follows the same radio group rules.

## 7. A `context` whose content contains a reference cycle and that is rebuilt on each render makes the Form's context comparison loop forever, which freezes the page.

- Severity: medium. The page stops responding on the next re-render, and no error is reported. It needs a context built from plain objects, arrays or maps with a cycle (for example a graph with parent links or a `structuredClone` of such a structure) that is rebuilt on each render.
- Affected public API: the `context` prop of `Form` and of `FormProvider`.
- Contract violated: `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/field-input.md:153-154` states that context is compared by content before propagation; a comparison that never ends is a hang, which basic correctness excludes.
- Root cause: `packages/canard/schema-form/src/providers/hooks/contextSnapshot/utils/areContextsEqual.ts:29` runs a loop over a stack of value pairs and pushes the children of plain objects (`:62`), arrays (`:46`) and maps (`:72`) without recording the pairs it has visited. Two distinct but isomorphic cyclic graphs therefore push the same pair forever. `useContextSnapshot` calls it on every render of `WorkspaceContextProvider` and `ExternalFormContextProvider`.
- Relation to earlier rounds: New class (a cycle in a content comparison). The comparator that preceded it, `equals` from `@winglet/common-utils`, also loops on this input since the fix for [round 2 item 7](../round-2/winglet-json.md) (`83590aa76`) replaced its recursion with an explicit loop.
- Reopens an earlier fix: Yes. `git log -L` on the root-cause lines shows `682b37de1`, the fix for [round 3 item 7](../round-3/canard-schema-form.md), which introduced this comparator. The page froze on this input before that fix as well, through `equals`, so it is a case both fixes left out rather than a regression of `682b37de1`.
- Reproduction: `contextCycle.test.tsx`. The cycle goes through an enumerable getter that throws after 100,000 reads, so the probe fails instead of hanging.
  - "a Form whose rebuilt context contains a cycle re-renders in bounded time": the getter passes its limit, and the throwing frame is `areContextsEqual.ts`; expected a bounded comparison.
  - "a FormProvider whose rebuilt context contains a cycle re-renders in bounded time": the same through `FormProvider`.
- Confidence: high. Public API, with `@winglet/*` loaded from source.

## 8. In one Form, a field named after a built-in radio or checkbox group plus "-<index>" has the same DOM id as one of the group's options, so clicking that field's label changes the group's value.

- Severity: medium. The user clicks a text field's label and another field's choice changes silently: with `plan` (radio) beside `plan-1`, clicking the "plan-1" label changes `plan` from `'free'` to `'pro'` in `getValue()` and in the submission. Assistive technology also announces the label for the wrong control. It needs a sibling whose name is the group name followed by "-" and a digit, for example `phone` and `phone-1`.
- Affected public API: the built-in radio input, the built-in checkbox group (a string enum array with `presentation.inputType` `'checkbox'`), the Label part and `Form.Label` of the colliding field, and custom inputs that follow the documented option pattern.
- Contract violated:
  - The [HTML Living Standard requires an `id` value to be unique in its tree](https://html.spec.whatwg.org/multipage/dom.html#the-id-attribute).
  - `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/field-input.md:160` states that a Label's `htmlFor` equals its input's Form-scoped id.
  - The round 3 decision for items 1 and 6 ([round 3 FIXES](../round-3/FIXES.md), decisions for `@canard/schema-form`) makes every identifier scoped and unique.
  - `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/field-input.md:244-247` teaches the colliding pattern, `const optionId = id + '-' + index`.
- Root cause: `packages/canard/schema-form/src/fieldInputs/fieldInputDefinitions/FieldInputStringRadio/FieldInputStringRadio.tsx:61` and `packages/canard/schema-form/src/fieldInputs/fieldInputDefinitions/FieldInputStringCheckbox/FieldInputStringCheckbox.tsx:75` build option ids as `fieldId + '-' + index`, where `fieldId` is `formId + ':' + node.path` (`packages/canard/schema-form/src/components/FieldProxy/components/FieldInputBridge/FieldInputBridge.tsx:265`). The input of a sibling at `/plan-1` gets `formId + ':/plan-1'`, the id of option 1 of `/plan`. A label's `for` resolves to the first element with that id in tree order, which is the option of the earlier group. The Form scope removed collisions between Forms, not between a field id and the ids derived from another field id in the same Form. Array item paths use a slash (`/items/0`), so in the core built-ins only sibling names that end in "-" and a digit collide.
- Relation to earlier rounds: Sibling of [round 3 item 1](../round-3/canard-schema-form.md); same class as round 3 cross-package class 23 (one identifier shared within a tree). This item owns the guide pattern. The antd and MUI plugins build option ids the same way in their own code: [canard-schema-form-antd5-plugin item 2](canard-schema-form-antd5-plugin.md), [canard-schema-form-antd6-plugin item 2](canard-schema-form-antd6-plugin.md) and [canard-schema-form-mui-plugin item 5](canard-schema-form-mui-plugin.md) and [canard-schema-form-antd-mobile-plugin item 4](canard-schema-form-antd-mobile-plugin.md).
- Reopens an earlier fix: Yes. `git log -L` on the radio and checkbox lines shows `633ef8c8e` and, on the radio, `2cba123b8`, the fixes for [round 3 item 1](../round-3/canard-schema-form.md) and [round 3 item 6](../round-3/canard-schema-form.md); the guide lines come from `b3b10604e` of the same round. Path-based ids collided the same way before round 3, so the fix left this case out rather than introducing it.
- Reproduction: `derivedOptionIds.test.tsx`, an automatic layout loaded with `{ plan: 'free', tags: [] }`.
  - "ids stay unique when a sibling is named after a built-in radio option id": the duplicates are `['_r_1_:/plan-1']` with React 19 and `[':r1::/plan-1']` with React 18; expected none.
  - "clicking the label of a sibling named plan-1 leaves the radio value unchanged": `plan` becomes `'pro'`, the checked radio is `'pro'` and the label's control is the radio; expected `'free'` and a text control.
  - "ids stay unique when a sibling is named after a built-in checkbox option id": the duplicates are `['_r_3_:/tags-0']` with React 19 and `[':r3::/tags-0']` with React 18.
  - "clicking the label of a sibling named tags-0 leaves the checkbox value unchanged": `tags` becomes `['a']` and the label's control is the checkbox; expected `[]` and a text control.
  - The control "control: siblings without a derived-id name keep ids unique and their labels inert for the groups" passes.
- Confidence: high. Public API, with `@winglet/*` loaded from source.

## 9. An absolute path with `..` or `.` segments, such as `/g/../top` or `#/./top`, is never resolved in controls expressions, `watch` and `injectTo`; expressions and `watch` silently read `undefined`, while `find` resolves the same string to `/top`.

- Severity: low. The spelling is rare, but the failure is silent: an `active` gate never turns on, a `derived` value never follows its source, and `watchValues` stays `undefined`, with no error. `injectTo` fails with `SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING`.
- Affected public API: every expression key in `controls`, `controls.watch`, and the target paths that `controls.injectTo` returns.
- Contract violated:
  - `packages/canard/schema-form/docs/agents/skills/schema-form-skill/SKILL.md:57` lists `..` and `.` as supported in controls expressions.
  - `packages/canard/schema-form/src/helpers/jsonPointer/DETAIL.md:62` (pointer-resolution) resolves current, parent, absolute and fragment paths with one grammar.
  - Predictable behavior: `node.find` and `FormHandle.findNode` resolve the same strings to `/top`.
- Root cause: `packages/canard/schema-form/src/helpers/jsonPointer/utils/resolvePointer.ts:24-25` returns every pointer that starts with `/` or `#/` unchanged, skipping the operator normalization at lines 26 to 44 that relative pointers receive. `packages/canard/schema-form/src/core/engine/utils/paths/resolveDependencyPath.ts` wraps it for gates, derivations, `watch` and `packages/canard/schema-form/src/core/engine/derive/evaluateDeriveRound/utils/inject/evaluateInjectTo.ts:59`. The dependency is therefore registered and read at the literal path `/g/../top`, which names no node.
- Relation to earlier rounds: Same class as round 2 cross-package class 3, spelling variants of paths ([round 2 item 8](../round-2/canard-schema-form.md) and [round 2 item 12](../round-2/canard-schema-form.md)). The round 3 probe of `watch` spellings covered relative spellings only.
- Reopens an earlier fix: No. `git log -L 24,25` on the root-cause lines shows only `5528e4026`.
- Reproduction:
  - `compileEdges.test.ts`, "/g/../top behaves like /top" and the same test for `#/g/../top`, `/./top`, `#/./top` and `/g/x/../../top`: every step reads `{ out: 'none', gated: undefined, watch: undefined }`, while `/top` reads `'a'`, then `'on'` with the gated field set to `'G'`, then `'b'`.
  - The controls pass: the relative spelling `../g/../top`, "node.find resolves the same absolute spellings to /top", and `injectTo` with the relative target `../g/../top`. The diagnostic "injectTo with the absolute spelling /g/../top" reports `SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING`.
  - `publicForm.test.tsx`, "derived "(/g/../top) ?? \"none\"" reads /top like find("/g/../top") does": `findNode` returns `/top`, `out` is `'none'` and `onError` receives nothing, on React 19 and React 18.
- Confidence: high, public API.

## 10. A statement body that returns a regular expression literal, such as `{ return /^\d+$/.test(../code); }`, reads the literal as a path and throws `EXPRESSION_THREW` at load and on every write.

- Severity: low. Statement bodies are documented only in an internal module document, and the failure is visible. The same literal works in the documented expression form, or when the body assigns it to a constant first.
- Affected public API: every expression key in `controls` written as a `{ … }` statement body.
- Contract violated:
  - `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/expressions.md:21` states that regular expression literals are not code.
  - `packages/canard/schema-form/src/core/engine/blueprint/compileBlueprintExpressions/createDynamicFunction/DETAIL.md:19` compiles a `{ … }` body with `return` statements.
  - The known limit in `../round-1/FIXES.md` (알려진 한계) reads a literal that also reads as an absolute path as the path, and reads a literal with a backslash as a regular expression. `/^\d+$/` has a backslash, so this input goes past that limit.
- Root cause:
  - `packages/canard/schema-form/src/core/engine/blueprint/utils/expressions/replaceExpressionPaths.ts:5` (`NON_CODE_HINT`) does not treat a slash after a word character as a possible literal. An expression without quotes or comments therefore takes the plain pattern pass at lines 17 to 19, which substitutes `/^\d+$/.test` as a path.
  - When the scanner runs, `replaceScannedExpressionPaths.ts:5` and `:78` (`VALUE_END = /[\w$)\]}]/`) mark the keyword `return` as a value. `readSlashTokenEnd.ts:33` then decides that the slash divides, and the path pattern consumes the literal.
  - The generated body becomes `return dependencies[0](dependencies[1])`, which throws `dependencies[0] is not a function`.
- Relation to earlier rounds: Same class as [round 1 item 4](../round-1/canard-schema-form.md), round 1 class 16 and round 3 cross-package class 28, scanners that ignore token boundaries.
- Reopens an earlier fix: [Round 1 item 4](../round-1/canard-schema-form.md), commit `46650871c`. `git log -L` on both root-cause lines shows only that commit, which introduced the scanner and the hint. Its rule that regular expression literals are not code leaves out a literal that follows a keyword.
- Reproduction:
  - `compileEdges.test.ts`, "a statement body returning the same regular expression literal works" and "the same body with a string literal (scanner path) works": the actual result is `SCHEMA_FORM_ERROR.EXPRESSION_THREW`. For the codes `123`, `abc` and `42`, the expected `ok` values are true, false and true, and `extra` is expected present, absent and present. The controls pass: the documented expression form, and a statement body that assigns the literal to a constant first.
  - `publicForm.test.tsx`, "a derived statement body returning /^\d+$/.test(../code) follows the code field": `onError` receives `SCHEMA_FORM_ERROR.EXPRESSION_THREW` twice, the write throws it, and `ok` is missing from the value, on React 19 and React 18.
- Confidence: high, public API.

## 11. An `allOf` part written as `$ref` never raises `ALL_OF_KEYWORD_IGNORED_FOR_FORM`, including the exact shape that the round 2 fix record lists as passing.

- Severity: low. A development warning goes missing: an author whose `$ref` part carries `not`, `contains`, `dependentRequired` or `unevaluatedProperties` is not told that the form ignores them, while the same part written inline warns.
- Affected public API: `FormWarningCode.AllOfKeywordIgnoredForForm`, delivered through `onError`.
- Contract violated:
  - `documents/docs/canard/schema-form/error-reference.mdx:106` states the condition without regard to how the part is written.
  - The item 9 row and the decisions of `../round-2/FIXES.md` record that the W1 shape passes.
- Root cause: `packages/canard/schema-form/src/core/engine/blueprint/collectBlueprintWarnings/collectBlueprintWarnings.ts:115` decides whether a declaration is an `allOf` part with `endsWithBranchIndex(declaration.schemaPath, ['allOf'])`. The declaration that carries the keywords of a `$ref` part keeps the target location, such as `#/$defs/N`; the root node's declarations are `#`, `#/allOf/0` and `#/$defs/N`. The round 2 fix `96952c11c` moved only the union checks to fragment lineage (`getUnionBranchFragmentIds`) and left this check based on the path.
- Relation to earlier rounds: Same class as [round 2 item 9](../round-2/canard-schema-form.md); line 115 is the `allOf` half of the root cause that item states.
- Reopens an earlier fix: [Round 2 item 9](../round-2/canard-schema-form.md), commit `96952c11c`, whose message says "allOf W1 already passes and is unchanged". `git log -L 113,120` on the check shows only `5528e4026`. Why W1 passed in round 2 is not explained, because the round 2 code was not run.
- Reproduction:
  - `warningsRef.test.ts`, "W1 allOf branch via $ref with not warns like the inline branch", with the round 2 shape: the reference form collects nothing, and the expected result is `ALL_OF_KEYWORD_IGNORED_FOR_FORM` with keyword `not`, as for the inline part.
  - The four neighbors with `not`, `contains`, `dependentRequired` and `unevaluatedProperties` fail the same way. The diagnostic "lists the schema paths and fragment ids of every root declaration" passes and shows the declaration list.
  - `publicForm.test.tsx`, "onError receives ALL_OF_KEYWORD_IGNORED_FOR_FORM for a $ref allOf part as for the inline part": the inline form receives the warning and the reference form receives none, on React 19 and React 18.
- Confidence: high for the behavior, through the public API. The declaration list comes from the internal `blueprint` function.

## 12. In a form with `disableAutomaticWrites`, an `EnableAutomaticWrites` option on one write inside a batch turns on automatic writes for every other write in the batch, so an `injectTo` overwrites a value the user edited.

- Severity: low. It needs the form-level suppression and a batch that mixes an enabling write with a plain write. The effect is silent: the `injectTo` of another write replaces a user edit, and `derived` values run for writes that the application expected to stay suppressed.
- Affected public API: `SetValueOption.EnableAutomaticWrites`, `FieldNode.batch`, `FieldNode.visitSubtree`, and the `disableAutomaticWrites` prop of `Form`.
- Contract violated:
  - `packages/canard/schema-form/src/core/engine/write/DETAIL.md:99` (WRITE-100) states that a call's option applies only to the automatic writes that call produces.
  - `packages/canard/schema-form/src/core/engine/write/DETAIL.md:87` (WRITE-015) states that when the bits conflict within one batch, suppression wins, as a conservative choice that keeps only some marks from allowing automatic rules.
  - `documents/docs/canard/schema-form/api-reference.mdx:24` documents `disableAutomaticWrites`, and line 75 documents the per-call override.
- Root cause: `packages/canard/schema-form/src/core/engine/write/utils/chain/flushBatchWrites.ts:30` to line 31 combines the options of every mark with a bitwise OR and passes the result to the single `writeFieldNode` call at line 124. The form-level suppression is not a bit of any mark, so one mark with `EnableAutomaticWrites` turns into enabling for the whole batch, which is the opposite of the "suppression wins" rule.
- Relation to earlier rounds: Same class as round 3 cross-package class 22 (composed operations that differ from the same calls made one by one; [round 3 README](../round-3/README.md)), in a function no earlier item named.
- Reopens an earlier fix: No. `git log` on the root-cause lines shows `c5c7c453b`, `5528e4026` and `927f50024`, none of them a bug bounty fix.
- Reproduction: `batchWriteOptions.test.ts`, on a form built with `disableAutomaticWrites: true`.
  - Test "W3 EnableAutomaticWrites on one write does not enable automatic writes of another write on a suppressing form": the batched value contains `db: 14`, derived from the plain write to `b`; the sequential value has no `db`.
  - Test "W5 EnableAutomaticWrites on one write does not let injectTo of another write overwrite an edited target on a suppressing form": after the user value `copy: 'user-edited'`, the batched value has `copy: 't'`; the expected value, which the same calls give one by one, keeps `'user-edited'`.
  - The control "W4" (the same writes without options) passes.
- Confidence: high for the behavior; medium that the owner treats it as a defect, because batch-wide suppression in the opposite direction is deliberate (see the hypotheses below). Public `FieldNode` API on trees built through `buildFieldNodeTree` and `mountFieldNode`.

## 13. An updater inside a batch, or one emitted through a FieldInput `onChange`, for an absent field named `constructor` or `toString` receives the inherited `Object.prototype` member and writes it into the form value.

- Severity: low. It needs a field with such a name, but `constructor` is an ordinary domain word, for example a racing team's constructor. The stored value is corrupted, for example `"function Object() { [native code] }x"` for the updater `(prev) => (prev ?? '') + 'x'`.
- Affected public API: `FieldNode.setValue` with an updater function inside `FieldNode.batch` or `FieldNode.visitSubtree`, and the `onChange` of a FieldInput called with an updater. The input channel always opens a batch (`packages/canard/schema-form/src/core/engine/write/utils/entry/dispatchWriteInput.ts:26`, WRITE-083 at `packages/canard/schema-form/src/core/engine/write/DETAIL.md:95`), so the documented hybrid-parent pattern `onChange((prev) => ({ ...prev, [Child.field]: input }))` (`packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/field-input.md:113`) takes this path.
- Contract violated: `packages/canard/schema-form/src/core/engine/write/DETAIL.md:71` (EVENT-061) states that an updater receives the last commit with the earlier marks laid over it. Outside a batch the same updater receives `undefined`, so equal calls give different results.
- Root cause: `packages/canard/schema-form/src/core/engine/write/utils/chain/readBatchValue.ts:27` to line 31 walks the path segments with `Reflect.get`, which returns inherited members of a plain object; line 35 does the same for the fields of a virtual node.
- Relation to earlier rounds: Same class as round 3 cross-package class 24 (lookups that read inherited prototype keys from a plain object; [round 3 README](../round-3/README.md)).
- Reopens an earlier fix: No. `git log -L 28,32` on the root-cause file shows only `c5c7c453b`.
- Reproduction: `batchUpdaterInherited.test.ts`.
  - Tests "U /constructor", "U /toString" and "U /team/constructor": inside a batch the updater receives `function Object` or `function toString`; outside a batch it receives `undefined`.
  - Test "UC": the output has `team.constructor` equal to `"function Object() { [native code] }x"`; the expected value, which the same call gives outside a batch, is `"x"`.
  - Test "UI": the same corruption through `writeFieldNodeInput`, the binding behind FieldInput `onChange`, with no consumer batch.
- Confidence: high. The tests named U and UC use the public `FieldNode` API on trees built through `buildFieldNodeTree` and `mountFieldNode`; the test named UI calls the internal binding function `writeFieldNodeInput` directly.

## 14. `validate()` on a virtual group resolves with the verdict but publishes no errors on the fields of the group.

- Severity: low. In the OnRequest validation mode, a grouped widget that validates its own node shows no error for the field the user must correct. The automatic OnChange path is not affected.
- Affected public API: `FieldNode.validate` on a virtual node; `FieldNode.errors` of its fields.
- Contract violated:
  - `packages/canard/schema-form/src/core/engine/write/utils/entry/dispatchValidate.ts:31` documents the parameter as the root or subtree whose displayed errors should refresh.
  - `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/virtual-schema.md:51` states that an issue addressed to a stored field belongs to that field even when a grouped widget edits it.
- Root cause: `packages/canard/schema-form/src/core/engine/validation/utils/route/createValidationScope.ts:20` to line 21 defines the scope of a single target as the target itself and the nodes whose path lies under its path. The fields `/start` and `/end` do not lie under `/period`, so routing leaves their errors untouched.
- Relation to earlier rounds: Same class as item 2 and round 2 cross-package class 1 (the alias path of a virtual group used as a subtree address), in a different function.
- Reopens an earlier fix: No. `git log -L 16,22` on the root-cause file shows `8a6fe5c27` and `5528e4026`.
- Reproduction: `virtualValidate.test.ts`, test "VV1 period.validate() refreshes the errors of its own fields, as start.validate() does": after `start` is set to `'bad'`, `period.validate()` leaves the errors of `start` as `[]`; `start.validate()` gives `['bad']`. The controls "VV2" (no error leaks to an unrelated field) and "VV3" (OnChange shows the error after a write through the group) pass.
- Confidence: high; public `FieldNode` API with a synchronous test validator, on trees built through `buildFieldNodeTree` and `mountFieldNode`.

## 15. Two site reference pages still describe the batch behavior that the fixes of round 3 items 5 and 9 changed.

- Severity: low. A reader who relies on the stated behavior expects a nested Merge in a batch to drop nested keys and expects item nodes in a batch to stay at their positions, and gets the opposite.
- Affected public API: `FieldNode.batch` with `SetValueOption.Merge`, the array methods inside a batch, and `controls.inactiveValue` coverage.
- Contract violated:
  - `documents/docs/canard/schema-form/schema-reference.mdx:99` states "Multi-write batch merges are shallow." The Korean page `documents/i18n/ko/docusaurus-plugin-content-docs/current/canard/schema-form/schema-reference.mdx:99` says the same.
  - `documents/docs/canard/schema-form/api-reference.mdx:179` states that whole-array settlement in a batch carries item identity by position. The Korean page `documents/i18n/ko/docusaurus-plugin-content-docs/current/canard/schema-form/api-reference.mdx:179` says the same.
  - Both contradict the current code and the updated package document `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/arrays-and-scale.md:84`, which states that surviving item nodes keep their identity.
- Root cause: the fix pull request #648 for round 3 items 5 and 9 did not update these two sentences. `git log -L` on both English lines shows the last edits in `3a72d109d` (pull request #549), before the round 3 fixes.
- Relation to earlier rounds: Same class as round 3 cross-package class 21 (a fix that left a case out, here documents the fix did not update; [round 3 README](../round-3/README.md)), for [round 3 item 5](../round-3/canard-schema-form.md) and [round 3 item 9](../round-3/canard-schema-form.md).
- Reopens an earlier fix: No. The code fixes of round 3 items 5 and 9 hold; only the site pages are stale.
- Reproduction: `batchMergeCoverageDoc.test.ts`; each test asserts the documented statement.
  - Test "M1": after `root.setValue({ o: { a: { x: 9 } } }, Merge)` and another write in one batch, `o.a` is `{ x: 9, y: 2 }`; a shallow merge gives `{ x: 9 }`.
  - Test "M2": when the same batch also turns the gate of `/o/a/y` off, the `inactiveValue` resolver of `/o/a/y` runs and retains `77`, so the batched Merge did not cover `y` as a shallow merge would.
  - Test "M3": after `batch(() => list.remove(0))`, position 0 holds the node that held `"b"`, not the node that held position 0.
- Confidence: high; public `FieldNode` API on trees built through `buildFieldNodeTree` and `mountFieldNode`.

## 16. `findNodes` with a wildcard takes time that grows with the square of the number of matched nodes.

- Severity: low. A wildcard query over a wide branch array, such as `findNodes('/list/*/name')` on 20,000 items, takes about 95 to 150 milliseconds instead of a few, and the cost keeps growing quadratically with the array.
- Affected public API: `FieldNode.findNodes` and `FormHandle.findNodes` with a `*` segment (`documents/docs/canard/schema-form/api-reference.mdx:61`).
- Contract violated: the round brief's definition of a pathological cost, super-linear growth on realistic input. Large forms are a documented use case (`documents/docs/canard/schema-form/api-reference.mdx:261`, virtualization keeps the complete node tree).
- Root cause: `packages/canard/schema-form/src/core/engine/navigation/utils/query/findNodes.ts:40` and line 46 deduplicate every pushed node with `next.indexOf(child)`, a linear scan of the growing result, so N matches cost on the order of N squared comparisons.
- Relation to earlier rounds: Same class as [round 3 item 17](../round-3/canard-schema-form.md) (a per-node collection that grows quadratically), in a different function.
- Reopens an earlier fix: No. `git log -L 23,50` on the root-cause file shows `b63bac7f0`, `5528e4026`, `485e11dd6` and `2d7d72d82`.
- Reproduction: `wildcardScale.test.ts`, test "4x items cost under 8x time for /list/*/name": 5,000 items took 6.8 milliseconds and 20,000 items 94.7 milliseconds, a ratio of 13.9; the hunter's runs gave ratios from 13.9 to 21.0 and the main session's run 13.0. The expected ratio is below 8.
- Confidence: high that the growth is super-linear and that the `indexOf` deduplication causes it; wall-clock measurement, machine dependent.

## 17. `useChildFieldMap` returns an `Object.prototype` member for a missing child named `constructor`, `valueOf` or `toString`, so rendering that child breaks the whole group or prints `[object Undefined]`.

- Severity: low. It needs a schema property with one of these names that is currently absent, for example inactive. Then `constructor` and `valueOf` throw while rendering, and the error boundary replaces the whole custom group input, including its other fields; `toString` renders the text `[object Undefined]`.
- Affected public API: `useChildFieldMap`.
- Contract violated: `documents/docs/canard/schema-form/api-reference.mdx:242` states that missing names render nothing.
- Root cause: the Proxy handler at `packages/canard/schema-form/src/hooks/fieldNode/useChildFieldMap.ts:13` returns `target[key] ?? NOOP_FUNCTION`, and the target built at `:25` is a plain `{}`, so a missing key reads the inherited member, which React then renders as a component.
- Relation to earlier rounds: Same class as round 3 cross-package class 24 (lookups that read inherited prototype keys from a plain object). It confirms the `r3-react` open lead in [round 3](../round-3/canard-schema-form.md) ("Open leads").
- Reopens an earlier fix: No. `git log -L` on `useChildFieldMap.ts:10-35` shows only `5528e4026`, which is not a bug bounty fix.
- Reproduction: `childFieldMapProto.test.tsx`, "a missing child named %s renders nothing and keeps its siblings".
  - `constructor`: the group input is replaced by the error fallback, its sibling input is gone, and `onError` is called once ("Objects are not valid as a React child").
  - `valueOf`: the same, with "Cannot convert undefined or null to object".
  - `toString`: the group renders `[object Undefined]`.
  - Expected for every name: nothing rendered for the missing child, the sibling kept and no error. The control "control: a missing child with an ordinary name renders nothing" passes.
- Confidence: high. Public API.

## 18. `registerPlugin` silently ignores a plugin that is a class instance or a module namespace object, although both satisfy `SchemaFormPlugin`.

- Severity: low. The registration appears to succeed, while every Form keeps the default renderers. The documented plugins are plain objects, so this needs a class-based plugin or `import * as plugin` of a module that exports the plugin members.
- Affected public API: `registerPlugin`.
- Contract violated: `packages/canard/schema-form/src/app/plugin/utils/registerPlugin.ts:25` documents `@throws {UnhandledError} When plugin registration fails`, and `packages/canard/schema-form/src/app/plugin/DETAIL.md:67` requires that a failed registration surface instead of passing for a successful configuration. The public type accepts both inputs.
- Root cause: `packages/canard/schema-form/src/app/plugin/utils/registerPlugin.ts:212` returns early when `isPlainObject(plugin)` is false; a class instance has another prototype, and a module namespace object has the `Module` tag.
- Relation to earlier rounds: Same class as round 3 cross-package class 26 (errors that vanish).
- Reopens an earlier fix: No. `git log -L` on the guard shows `a6f6a9d74`, `589e0a68b` and `714b414be`, none of them a bug bounty fix.
- Reproduction: `pluginScope.test.tsx`, "registerPlugin applies a class-instance plugin or reports that it did not" and "registerPlugin applies a plugin module namespace or reports that it did not": no renderer of the plugin is applied and nothing is thrown; expected one of the two. The control "control: the same renderer in a plain object plugin is applied" passes.
- Confidence: high. Public API.

## 19. Under `moduleResolution: node10`, `FormHandle.submit` from the package root is typed `any`, because the root declarations import `TrackableHandlerFunction` from the `@winglet/common-utils/function` subpath, which node10 cannot resolve.

- Severity: low. A CommonJS TypeScript project on `node10` resolution, which TypeScript 5.9 still uses by default for `module: commonjs`, loses every type check on `FormHandle.submit` without any error: a wrong argument, a misuse of the returned promise, or a read of `pending` and `subscribe` all compile. The probe ran with `skipLibCheck: true`, where the loss is silent.
- Affected public API: `FormHandle` (`submit`) from the `@canard/schema-form` root, also as the plugins reach it through that root. The error classes import `BaseError` from `@winglet/common-utils/error` in the same way (`packages/canard/schema-form/src/errors/classes/SchemaFormError.ts:1`); that instance was not probed.
- Contract violated:
  - `documents/docs/canard/schema-form/api-reference.mdx:69` documents `submit()` as a promise-returning submission whose handler also exposes `pending` and `subscribe`.
  - The known limit recorded for round 3 at `bug-bounty/round-3/FIXES.md:513` ([round 3 fixes](../round-3/FIXES.md)) says that a node10 consumer still resolves the package root through the top-level `types` field and that only subpath types do not resolve. The root of this package does not fully resolve either.
- Root cause: `packages/canard/schema-form/src/components/Form/components/FormCore/types/handle.ts:1` imports `TrackableHandlerFunction` from `@winglet/common-utils/function`, and `packages/canard/schema-form/src/components/Form/components/FormCore/types/handle.ts:57` types `submit` with it. node10 ignores `exports`, and `packages/winglet/common-utils/package.json` declares no `typesVersions`, so the import does not resolve and `submit` becomes `any`.
- Relation to earlier rounds: Same mechanism as [winglet-json-schema item 1](winglet-json-schema.md). Same class as [round 3 item 6](../round-3/winglet-common-utils.md), declarations that a valid consumer configuration cannot use (round 3 class 30).
- Reopens an earlier fix: No. `git log -L` on `handle.ts:1` and `handle.ts:57` shows only `5528e4026`, a feature commit, and no bug bounty fix.
- Reproduction: `packages/canard/schema-form/src/__bounty__/r4-contracts/node10RootTypes.test.ts`, "a node10 consumer of the package root sees FormHandle.submit typed, not any". A `type: commonjs` consumer with `module: commonjs`, `moduleResolution: node10` and `skipLibCheck: true` assigns `handle.submit` to a `number`. Actual: `[]`, no error, because `submit` is `any`. Expected: `['TS2322']`. The control "control: a bundler consumer sees FormHandle.submit typed (assigning it to number is TS2322)" gets `['TS2322']`.
- Confidence: high for the mechanism; static only. The probe type-checks the stale `dist` declarations of `@canard/schema-form` and its workspace dependencies, built before the round 1 to 3 fixes; the import line in `dist/components/Form/components/FormCore/types/handle.d.ts:1` is the same as the current source line.

## 20. With `exactOptionalPropertyTypes: true` and `skipLibCheck: false`, the schema type declarations fail to type-check with 13 errors TS2344 that a consumer cannot fix.

- Severity: low. A consumer with a strict compiler configuration gets 13 errors inside `node_modules`, for `@canard/schema-form` and for every plugin whose declarations load these types. The consumer's own schemas and `InferValueType` code still compile, and `skipLibCheck: true` hides the errors.
- Affected public API: `JSONSchema`, `InferValueType` and the other schema types of `@canard/schema-form`, emitted to `dist/types/schema/jsonSchema.d.ts` and `dist/types/schema/value.d.ts`.
- Contract violated: published declarations must type-check under valid consumer compiler options when `skipLibCheck` is `false`, and no document of the package excludes `exactOptionalPropertyTypes`. The package's declaration check (`build:verify:types`, described in `packages/canard/schema-form/CLAUDE.md`) holds the declarations to `skipLibCheck: false` in strict consumers, but `strict` does not include `exactOptionalPropertyTypes`, so the check does not cover this flag.
- Root cause:
  - `RefSchema` declares `type?: undefined` (`packages/winglet/json-schema/src/types/jsonSchema.ts:309-311`). Under `exactOptionalPropertyTypes`, that property does not fit `UnknownSchema.type?: string | readonly string[]` (`packages/winglet/json-schema/src/types/jsonSchema.ts:15-18`), so every `JSONSchemaChildren<Options>` constraint fails, at `packages/canard/schema-form/src/types/schema/jsonSchema.ts:106`, `:110`, `:119`, `:128`, `:142`, `:146`, `:155`, `:166`, `:182`, `:195`, `:219` and `:223`.
  - `NormalizeType<T>` keeps `type?: … | undefined` and fails its constraint at `packages/canard/schema-form/src/types/schema/value.ts:134`.
  - The declaration that does not fit is in `@winglet/json-schema`, while the failing constraints are schema-form's, so this item is placed with the failing check.
- Relation to earlier rounds: New class: published declarations that fail under a strictness flag the consumer may enable.
- Reopens an earlier fix: No. `git log -L` on `packages/winglet/json-schema/src/types/jsonSchema.ts:309-311` shows `2d7d72d82`, `9ad2528ec`, `c5c0c2c26` and `94f7ca987`, all feature commits, and no bug bounty fix.
- Reproduction: `packages/canard/schema-form/src/__bounty__/r4-contracts/exactOptionalDeclarations.test.ts`, "the schema type modules type-check for a consumer that enables exactOptionalPropertyTypes". The probe type-checks `src/types/schema/jsonSchema.ts` and `src/types/schema/value.ts` with the package's own compiler options plus that flag. Actual: 13 entries, TS2344 at the 13 lines above. Expected: `[]`. The control "control: the schema type modules type-check with the package options" passes.
- Confidence: high. The schema-form side is source. The `@winglet/json-schema` types resolve through the workspace link to its stale `dist/types/jsonSchema.d.ts`, because the package `tsconfig.json` sets no `source` condition; there `UnknownSchema.type` (line 5) and `RefSchema.type?: undefined` (line 153) are the same declarations as the current source lines cited above.

## Symptoms of root causes in other packages

### Two forms that share a schema object and a validator, validated together, report the invalid form as valid

Owning items: [@canard/schema-form-ajv7-plugin item 1](canard-schema-form-ajv7-plugin.md) (every root) and [@canard/schema-form-ajv6-plugin item 1](canard-schema-form-ajv6-plugin.md) (roots with `$id`).

- Two forms that use the same schema object and the same validator share one compiled function (VALIDATE-048, `packages/canard/schema-form/src/core/engine/validation/DETAIL.md:105`). When a page validates both at once, for example with `Promise.all` over several rows before saving them, the invalid form receives the valid form's empty verdict: `validate()` resolves with no issues, the field shows no error, and a save that trusts that verdict sends the invalid value.
- Schema: `{ type: 'object', properties: { name: { type: 'string', minLength: 3 } } }`, with `$id: 'https://example.com/row.json'` added for the AJV 6 row; the values are `{ name: 'x' }` and `{ name: 'valid name' }`.
- Reproduction: `sharedValidatorOverlap.test.ts`, "explicit validate() of both forms at once reports the invalid form as invalid", in the rows "ajv7, root without $id" and "ajv6, root with $id". The actual result is `{ invalid: [], valid: [], nameField: [] }`; the expected result is `{ invalid: ['minLength'], valid: [], nameField: ['minLength'] }`. The AJV 8 control row passes.
- Verification level: source through a probe-local config, internal fixture with the public `FieldNode` API.

### An issue under a referenced schema gets a dotted path after the application validated that schema itself

Owning item: [@canard/schema-form-ajv6-plugin item 5](canard-schema-form-ajv6-plugin.md).

- With the AJV 6 plugin, when application code that shares the bound instance has validated a registered schema before the form compiled, an issue the form finds inside that schema is reported at a path that mixes a JSON Pointer with AJV 6's dotted notation, so it names no field and the entry's field shows no error.
- Schema: the bound instance holds `https://example.com/address.json` (an object with `street: { type: 'string', minLength: 3 }` and `country: { $ref: 'country.json' }`) and `https://example.com/country.json`; the form schema maps entries to it with `addresses: { type: 'object', additionalProperties: { $ref: 'https://example.com/address.json' } }`; the value is `{ addresses: { home: { street: 'x', country: 'KR' } } }`.
- Reproduction: `ajv6PointerCacheRouting.test.ts`, "after the application validated the referenced schema the issue path is still a JSON Pointer". The actual result is `['/addresses/home.street']`; the expected result is `['/addresses/home/street']`. The control without earlier application use passes.
- Verification level: source through a probe-local config, internal fixture with the public `FieldNode` API and the AJV 6.12.6 copy that the plugin resolves.

## Hypotheses checked and not bugs

- From `r4-compile`:
  - The reused `$defs` template on the watch list (round 3 items 3 and 4) did not fail a third time. These cases match the inline schema at the second location (`templateGates.test.ts`):
    - child gates under `then` and `else`
    - the `controls.active` of a gated `allOf` fragment
    - a child gate inside an ungated `allOf` part
    - context reads in a `then` branch and in an `allOf` fragment
    - an `active` gate on a `oneOf` branch
    - a template nested inside another template
  - Six neighbors of round 3 item 15 build the field type that AJV 2020-12 checks (`embeddedResources.test.ts`):
    - an inline embedded resource
    - an embedded resource used as an `allOf` member
    - a property with `$id` whose `allOf` refers to its local `$defs`
    - the relative reference `a.json#/$defs/X`
    - a nested resource with a relative `$id`
    - a JSON Pointer inside a resource
  - AJV 8.17.1 itself overflows its stack for an `$id` whose sibling `$ref` points into its own `$defs`. This is AJV's behavior, not the form's, and the probe uses a nested `allOf` instead.
  - Boolean `if` schemas (`true`, `false`, `{}` and `{ not: {} }`) select the branch that AJV applies.
  - The `if` verdict agrees with AJV on the emitted value for each of these conditions (`ifAgainstAjv.test.ts`):
    - `required` with an empty list under `omitEmpty`
    - `minItems`
    - an empty string against `minLength`
    - `-0` and `0` against `const: 0`
    - `not` with `required`
  - A Form loaded with a schema whose expression does not compile behaves as expected when rerendered with a valid schema and reset: it loads the valid schema, submits, and reports the first failure once.
  - The round 3 open lead on property names with a space is not a defect:
    - `../first name` fails visibly at load with `CREATE_DYNAMIC_FUNCTION`.
    - `(../)["first name"]` and `watch: ['../first name']` both work.
  - The equality fast path decodes each admitted literal as JavaScript does, or refuses the expression and leaves it to the general compiler; this was checked by reading the code.
  - `collectIfGateReadNames` admits only keywords whose reads name a property, and falls back to reading the whole host otherwise; this was checked by reading the code.
  - The effective schema merge keeps a Boolean exclusive bound as an `allOf` clause and keeps every `pattern`; this was checked by reading the code.
  - `isSameSchema` treats an object with an own `current` key as atomic. This is the documented render-atomic limit in `packages/canard/schema-form/src/helpers/schemaIdentity/DETAIL.md`.
  - `(../price)/100` without spaces reads `/100` as a path and fails visibly at compile time. The documents show the spaced form `(../price) / 100`, so it is not reported.
- From `r4-engine`:
  - Over 1,200 seeded sequences, `batch`, nested `batch` and `visitSubtree` give the same values, returned values, item identities, external errors, touched flags, inactive retention, `onChange` value and UpdateValue and UpdateError delivery as the same calls made one by one. This covers nested arrays, references held before the calls, discriminated branches, `derived` values, nullable objects, terminal arrays and virtual writes; the only exceptions are item 2 and item 3 and the documented cases listed under the probes.
  - A nested Merge across a branch switch, a gate reentry, two partial merges of one object and an updater after a merge gives the same result in a batch as one by one (`batchMergeBranches.test.ts`).
  - Batched array methods that return to equal content still deliver UpdateChildren and leave subscribers on the live item nodes (`batchChildrenEvents.test.ts`).
  - Array methods on a terminal array give the same values and returned values in a batch as one by one (`terminalArrayVerbs.test.ts`).
  - The global state, the global errors and `onStateChange` agree in a batch and one by one when nodes leave through removal, a whole-array write or a gate (`batchGlobalState.test.ts`).
  - A throwing updater, visitor, nested batch, `injectTo` or listener surfaces once, leaves no open batch, entry or visit depth and no pending mark, and the next valid write notifies once (`failureRecovery.test.ts`); the degraded status after an `injectTo` failure is the documented ERROR-011 behavior.
  - Per-runtime collections stay bounded over 200 cycles of push and pop, insert and remove, gate and branch toggles, items with errors and touched flags, subscribe and cleanup, and validation (`retentionGrowth.test.ts`), and a write to an outer dependency costs the same after 3,000 items came and went (`churnCost.test.ts`).
  - Subscriptions on a removed item stay registered until the consumer calls the cleanup, which `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/event-system.md:44` makes the consumer's duty.
  - An asynchronous OnChange verdict overtaken by a removal, and an explicit `validate()` overtaken by a removal, an insertion or a `resetSubtree()`, never put the old verdict on a moved or new item (`asyncOvertake.test.ts`); the explicit call returns its call-time verdict as documented.
  - A validator that writes equal content back in a new object, a new array or a root Merge settles after one run and shows its verdict, so the fix of round 3 item 12 covers these inputs (`validatorWriteback.test.ts`).
  - `resetSubtree()` re-derives `derived` fields inside and outside its scope and restores schema defaults (`resetDerived.test.ts`).
  - A `derived` value that differs between a batched root write and separate writes falls under the documented caveat that automatic writes can differ when intermediate states are skipped (`packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/arrays-and-scale.md:84`, EVENT-019).
  - Updater and visitor failures are reported as `LISTENER_THREW`, which `packages/canard/schema-form/src/errors/constants/FormErrorCode.ts:53` defines as a subscriber or form callback that throws.
- From `r4-react`:
  - Callbacks that call the Form handle while they run settle correctly: an `onSubmit` that resets the form, an `onChange` that submits on each change, an `onValidate` that normalizes through `setValue`, and `useFormSubmit().pending` after `onSubmit` resets the form (`handleReentry.test.tsx`).
  - `renderToString` followed by `hydrateRoot` keeps every scoped id, `for`, `name` and selection under StrictMode in React 18 and 19, for radio groups, checkbox groups, array rows with radios, two automatic Forms in one root and a composed layout under `FormProvider`; a hydration that yields to slow siblings records no recoverable error (`hydrationIds.test.tsx`).
  - A Form nested in another Form through a portal inherits no per-Form context: `FormRoot` provides every Form context again, and `FormErrorPathContext` wraps only deferred placeholders (static check).
  - The React layer keeps no per-Form state at module level; its module caches are `WeakMap` adapters keyed by component, which read the reporter at render (static check).
  - A `registerPlugin` call whose input definitions fail normalization applies nothing and records no deduplication hash, so the corrected plugin registers on the next call; the round 1 item 8 fix holds (static check).
  - A submission on a Form without a loaded root resolving without calling `onSubmit` is documented in `packages/canard/schema-form/src/components/Form/components/FormCore/DETAIL.md:11`.
  - A failed renderer or input boundary that Refresh does not recover is documented in `packages/canard/schema-form/src/components/FieldProxy/DETAIL.md:51`; Remount recovers it.
  - `Form.Render` fixing `children`, `FieldInput` and `Wrapper` at mount is documented in its JSDoc and in `packages/canard/schema-form/src/components/Form/components/FormRender/DETAIL.md`.
  - `useFormSubmit` rebinding only when the calling component commits is documented in its JSDoc.
  - Leaf names on the native form could shadow form element properties, but the package reads only `form.ownerDocument` (`packages/canard/schema-form/src/components/Form/components/FormCore/utils/focusFieldNode.ts:35`), which no realistic field name reaches.
- From `r4-validation`:
  - A guard keyword that throws for one input leaves the form `degraded` after the input is corrected, and a submit is rejected with `SUBMIT_WHILE_DEGRADED` until a form-level load. This is the documented rule: `packages/canard/schema-form/src/core/engine/settle/DETAIL.md:93` keeps `degraded` until a form-level load. The same keyword throwing once in whole validation recovers on the next value (`guardThrowsOnce.test.ts`).
  - Automatic validation of two forms that share a validator and mount in one task, with animation frames unavailable so both load slots run in one batched macrotask, does not interleave their verdicts: the "automatic validation of two forms mounted together shows the invalid form error" rows of `sharedValidatorOverlap.test.ts` pass for AJV 7 and AJV 6.
  - The round 3 item 12 fix (`5895eb16f`) holds in both validation paths: a verdict computed before a later commit is discarded only when the stored output value or the context changed (`packages/canard/schema-form/src/core/engine/validation/utils/run/requestFieldNodeValidation.ts:72-81` and `packages/canard/schema-form/src/core/engine/write/utils/entry/dispatchValidate.ts:113-125`). Static check.
  - The round 3 item 17 fix (`3bea0d84a`) is unchanged: routing appends each issue to its node's list (`packages/canard/schema-form/src/core/engine/validation/utils/route/routeValidationIssues.ts:108`) instead of copying the list. Static check.
  - A whole-schema compile failure is not retried while fields are edited; this is documented in `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/validation-failures.md:35`.
  - `packages/canard/schema-form/src/helpers/error/formatValidationError/utils/selectKeywordErrorMessage.ts:12` reads `errorMessages[keyword]` without an own-key check, so an issue whose keyword is an `Object.prototype` name such as `constructor` would skip the `default` message; no keyword that the shipped plugins report has such a name, so it is not reachable through them. Static check.
- From `r4-contracts`:
  - The realm registry key `@canard/schema-form/plugin-registry/0.16` (`packages/canard/schema-form/src/app/plugin/utils/getPluginRegistry.ts:47`) collides with no published version, because the 0.16.0 and 0.16.1 bundles installed under `node_modules/@canard/` declare no `Symbol.for` key.
  - `dist/index.node.mjs` reading `NODE_ENV` once at load is documented in the "Build Output" section of `packages/canard/schema-form/CLAUDE.md`.

## Open leads

- From `r4-validation`:
  - A `$ref` to a schema that only the bound validator instance holds builds under an `additionalProperties` map and under `not`, but the form fails to build when the same `$ref` sits on a terminal object, under `allOf` on a terminal object, or as the `items` of a terminal array (`externalRefPlacement.test.ts`). `documents/docs/canard/schema-form/validation.mdx:60` tells consumers to provide referenced schemas in the bound instance, and `documents/docs/canard/schema-form/schema-reference.mdx:53` says the blueprint reads `$ref` targets; no document states which placements may point outside the form schema, so this is not recorded as a finding.
- From `r4-ui-mui-mobile`:
  - An array field loaded as `[]` with `minItems: 1` reported no error from `validate()` in an early version of the MUI probe `branchErrors.test.tsx`. The likely reason is that `omitEmpty` removes the empty array from the output value, so `minItems` has no array to check. No probe isolated this in the core, and no document was checked for whether an emptied array with a minimum length should report an error.
