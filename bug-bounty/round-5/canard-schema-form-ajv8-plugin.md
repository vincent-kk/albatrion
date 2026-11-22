# @canard/schema-form-ajv8-plugin: bug bounty round 5

5 new findings in `@canard/schema-form-ajv8-plugin`: 4 medium and 1 low. Items in the documents of [round 1](../round-1/canard-schema-form-ajv8-plugin.md), [round 2](../round-2/canard-schema-form-ajv8-plugin.md), [round 3](../round-3/canard-schema-form-ajv8-plugin.md) and [round 4](../round-4/canard-schema-form-ajv8-plugin.md) were treated as fixed and excluded, together with the decisions and known limits of each round's `FIXES.md`. The main session re-ran every probe: the `r5-ajv-ownership` folder ran 21 tests, of which 7 fail, and the `r5-ajv-results` folder ran 74 tests, of which 25 fail. No item is a regression; items 1, 2 and 5 repeat the watch-list point on registrations and the compile cache of the AJV plugins.

Item 5 of [canard-schema-form.md](canard-schema-form.md) also affects this package: the quick-start compatibility table says the AJV plugins declare no core peer.

Probes: [probes/canard-schema-form-ajv8-plugin/](probes/canard-schema-form-ajv8-plugin/)

- Copy a folder back to `packages/canard/schema-form-ajv8-plugin/src/__bounty__/<hunter-id>/` and run `yarn workspace @canard/schema-form-ajv8-plugin test --run src/__bounty__/<hunter-id>/`. The probes import the plugin source (`src/index.ts`, `src/2019`, `src/2020`) with AJV 8.17.1; `@canard/schema-form` resolves to its `dist`.
- Every failing test belongs to an item below. `r5-ajv-results/resultControls.test.ts` passes (26 tests).
- Earlier probes re-run (`r5-rerun-plugins`, see [canard-schema-form.md](canard-schema-form.md) for the method): rounds 1 to 4 ran 135 tests and 8 fail, all on recorded decisions: the round 1 decision that only root-local paths get a `rejectedKey`, six round 3 draft tests decided by the item 2 documentation fix, and the round 3 migration example decided by item 3. No earlier item regressed.

Root-cause files: `packages/canard/schema-form-ajv8-plugin/src/validator/`

## 1. A form root that embeds a resource whose `$id` an application document also embeds redirects the application's address to the form's copy; after release the address dangles, and a later form that references the resource fails to compile.

- Severity: medium. The plugin overwrites and then breaks an application registration, and a later form loses whole-schema validation. The input needs bundled schema documents that embed the same resource with its own `$id`.
- Affected public API: `compile` and `release` of `createValidator(ajv)` and of `plugin.validator` after `bind`, in all three entries; the application's `ajv.validate`, `ajv.getSchema` and `ajv.compile`.
- Contract violated: `packages/canard/schema-form-ajv8-plugin/DETAIL.md:13`; `.changeset/ajv8-registration-ownership.md:5`; the round 4 decision that application registrations are not deleted (`../round-4/FIXES.md:355`).
- Root cause: the plugin registers a root with `$id` on the application instance (`src/validator/utils/registerValidationRoot.ts:39`); the conflict check consults only plugin registrations (`registerSchemaRoot.ts:84-90`); AJV keeps an embedded resource as a string alias, and `addSchema` overwrites an alias that was never materialized without a check (`node_modules/ajv/dist/compile/resolve.js:122-132`); the ownership record (`registerValidationRoot.ts:48-54`) keeps only keys that were absent before, so the replaced application alias is neither recorded nor restored.
- Relation to earlier rounds: round 4 ownership fixes; round 3 class 23. The same defect is recorded for [ajv6 item 2](canard-schema-form-ajv6-plugin.md) and [ajv7 item 1](canard-schema-form-ajv7-plugin.md).
- Reopens an earlier fix: the ownership fix `18cedd788` wrote these lines.
- Regression of an earlier fix: no; the earlier removal of the copy left the same dangling alias.
- Watch list: yes, late schemas, registration and the compile cache of the AJV plugins.
- Reproduction: `r5-ajv-ownership/embeddedResourceAlias.test.ts`, "after the form root is released, the application still resolves its embedded resource" (actual `threw: no schema with key or ref "…/address.json"`), "… a new application schema can reference the embedded resource" (actual `compile threw: can't resolve reference …/address.json from id #`) and "… a later form root that references the resource compiles" (fails).
- Confidence: high; public plugin API from source.

## 2. A Form-specific adapter memoized in a route component never releases its last roots; after garbage collection, the next visit of a form whose root has `$id` fails to compile with `already exists`.

- Severity: medium. A form loses validation in documented usage, depending on when the browser collects the dropped adapter; the leak itself is permanent.
- Affected public API: `createValidator(ajv)` used as `validatorFactory`; `FormHandle.validate()`.
- Contract violated: `documents/docs/canard/schema-form/validation.mdx:84` (adapters created outside render or memoized with stable dependencies; independent adapters can share one instance) and `api-reference.mdx:47`; VALIDATE-021 in `packages/canard/schema-form/src/core/engine/validation/DETAIL.md:77` (registrations are released explicitly, not by garbage-collection notification); `packages/canard/schema-form-ajv8-plugin/DETAIL.md:9`.
- Root cause: each adapter owns a registry and its own `FinalizationRegistry` (`src/validator/createInstanceValidator.ts:33`, `utils/createSchemaRootRegistry.ts:9`), which is collected with the adapter and then runs no cleanup; the core releases a root only when its recent list exceeds eight (`packages/canard/schema-form/src/core/engine/validation/utils/lifetime/releaseValidationRoot.ts:12-23`); the conflict check (`registerSchemaRoot.ts:79-90`) sees only weak references, so the leftover `refs[$id]` makes `addSchema` throw.
- Relation to earlier rounds: new class (cleanup of a dropped owner, angle `LC4`); near round 1 class 11 and round 3 class 25. The same defect is recorded for [ajv6 item 3](canard-schema-form-ajv6-plugin.md) and [ajv7 item 2](canard-schema-form-ajv7-plugin.md).
- Reopens an earlier fix: no; `git log -L` lists `949b33cc0` (round 4 item 4) and `e95451d9d` (round 4 item 3), whose decisions stand.
- Regression of an earlier fix: no.
- Watch list: yes, registration lifetime on the application instance.
- Reproduction: `r5-ajv-ownership/droppedAdapter.test.tsx`, three tests: "a second visit after the first adapter was collected validates the same way as before collection" (actual `compile threw: schema with key or id "https://r5.invalid/ajv8/route-form.json" already exists`), "after every adapter is gone, the application instance no longer holds the form copy" (actual leftover `[id]`), and "the second visit after collection reports the same field error as the first visit", a `Form` with `useMemo(() => createValidator(ajv), [])` (actual `{ leftover: [id], second: 'validate rejected: Whole-schema validation could not be compiled' }`). Collection is forced inside the test with `setFlagsFromString('--expose_gc')` and `runInNewContext('gc')`.
- Confidence: high for the mechanism; medium for how often a browser collects between two visits.

## 3. A root with `$id` that uses an asynchronous keyword or format and contains any `$ref` fails to compile, in all three entries.

- Severity: medium. The form has no whole-schema validation (`VALIDATOR_COMPILE_FAILED`); roots with `$id`, a `$ref` and an asynchronous rule are ordinary inputs. The AJV 6 plugin validates the same keyword schema.
- Affected public API: `createValidator(ajv).compile`, `plugin.validator.compile` after `bind`, and `createValidatorFactory(ajv)`, from `.`, `./2019` and `./2020`.
- Contract violated: `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/validation-ux.md:89` (whole-schema validation may be asynchronous); `documents/docs/canard/schema-form/validation.mdx:60` (asynchronous rules are excluded only from guards); the parity that `.changeset/ajv6-asynchronous-keyword-parity.md:5` and `.changeset/ajv7-asynchronous-keyword-parity.md:5` state for the sibling plugins (round 4 class 32).
- Root cause: `src/validator/createValidatorFactory.ts:28-29` validates a root with `$id` through `{ $async: true, $ref: registration.key }`. AJV inlines the registered root into that wrapper only when the root contains no `$ref`; otherwise it compiles the root as its own environment without `$async` and refuses the asynchronous rule.
- Relation to earlier rounds: round 4 AJV 7 item 4 and AJV 6 item 6 (round 4 class 32); the AJV 7 case is [ajv7 item 3](canard-schema-form-ajv7-plugin.md).
- Reopens an earlier fix: no; the lines come from `5528e4026`, `2d7d72d82`, `ebc8a0471` and `a21bced85`.
- Regression of an earlier fix: no.
- Watch list: no.
- Reproduction: `r5-ajv-results/asyncKeywordWithRef.test.ts`, 18 rows over three entries, for an unrelated `$ref`, a `$ref` to the definition that holds the rule and a recursive `$ref`, each with a keyword and a format: actual `threw: async keyword in sync schema` or `threw: async format in sync schema`, expected `['available /name']` or `['format /name']`. The rows without `$id` and the plain-AJV control pass.
- Confidence: high; plugin source.

## 4. A keyword exception that carries an `errors` array is returned as validation issues, or replaced by a `TypeError`, in all three entries.

- Severity: medium. An execution failure becomes a verdict: for a root without `$id`, `validate()` resolves with root issues whose keyword is `undefined`, and `VALIDATOR_THREW` never fires; for a root with `$id`, the original error is lost behind a `TypeError`. `AggregateError` and many library validation errors carry such an array.
- Affected public API: `createValidator(ajv)`, `plugin.validator` after `bind`, with any keyword that throws or rejects.
- Contract violated: `documents/docs/canard/schema-form/validation.mdx:52` ("Throws indicate execution failure, not a validation verdict"); `packages/canard/schema-form/src/errors/constants/FormErrorCode.ts:73-74` (`VALIDATOR_THREW`); the round 3 decision for the AJV 6 plugin (`../round-3/FIXES.md:167`) that AJV's ValidationError is recognized by its markers. The AJV 6 plugin rethrows the same `AggregateError`.
- Root cause: `src/validator/createValidatorFactory.ts:48-52` treats any `Error` with an array `errors` as AJV's ValidationError and ignores AJV's markers; for a root with `$id`, `src/validator/utils/createRootPathRewriter.ts:13`, reached from `transformErrors.ts:27`, calls `startsWith` on an undefined `schemaPath`.
- Relation to earlier rounds: round 3 AJV 6 item 1, whose decision was not carried to this plugin; the AJV 7 case is [ajv7 item 5](canard-schema-form-ajv7-plugin.md).
- Reopens an earlier fix: no; `c9f790e90`, `411f76652` and `aafdf0732` (round 1 items 1 and 2) touched these lines, but the classification comes from `a21bced85`.
- Regression of an earlier fix: no.
- Watch list: no.
- Reproduction: `r5-ajv-results/thrownErrorsArray.test.ts`, 7 of 9 tests fail, including a `bind` row. Without `$id` the call resolves with `[undefined, '', …]` issues; with `$id` it rejects with `TypeError: Cannot read properties of undefined (reading 'startsWith')`. The plain-`Error` controls pass.
- Confidence: high; plugin source.

## 5. The 64-root cap on code compiled into the application instance is counted per adapter, so per-mount adapters grow the instance without bound.

- Severity: low. A linear memory leak: 200 visits with a fresh adapter each left 413 retained scope entries, against 141 with one long-lived adapter. Whether the provisional cap is a contract is open, so confidence is medium.
- Affected public API: `createValidator(ajv)`. The AJV 7 plugin creates its pool per adapter the same way; it was not measured.
- Contract violated: the cap's rationale at `src/validator/utils/registerSchemaRoot.ts:9`; VALIDATE-021; `documents/docs/canard/schema-form/validation.mdx:84`.
- Root cause: `compilerCount` starts at 0 in each adapter's registry (`utils/createSchemaRootRegistry.ts:10`), and `registerSchemaRoot.ts:91-99` compiles roots without `$id` on the application instance until that adapter reaches 64.
- Relation to earlier rounds: item 2; the 64-root pool of round 3 item 1 and round 4 item 2.
- Reopens an earlier fix: no; the lines come from `5528e4026` and `2d7d72d82`.
- Regression of an earlier fix: no.
- Watch list: yes, the same pool on the application instance.
- Reproduction: `r5-ajv-ownership/perMountScopeGrowth.test.ts`, "200 mounts that each memoize their own adapter grow the instance no more than one long-lived adapter": actual `{ perMountGrowth: 413 }`, expected `141`.

## Hypotheses checked and not bugs

- The core never calls the plugin's `release` on StrictMode effect replay or unmount; release happens only on eviction. A root hidden by `<Activity>` and evicted by nine other roots validates when shown again, and eight recent roots remain after every form is gone (VALIDATE-045, `releaseLifecycle.test.tsx`).
- Two plugin copies on one instance keep same-`$id` roots isolated in both release orders and leave no plugin entry; a root-pointer guard that threw on a missing application schema recovers once that schema is registered (`guardRecovery.test.ts`); an application that removes its schema before a same-`$id` form root compiles is served correctly.
- A root whose `$id` the application currently holds fails with `already exists`; this is the round 2 decision, pinned by `lifetime.consumer-schema-kept`. Replaced application content after a private copy is the round 4 late-schema limit.
- Each plugin's issue list equals plain AJV 8 for 14 schema shapes; decimal `multipleOf` agrees with plain AJV 8 (`multipleOfPrecision: 9`); nested `multipleOf` gives the same keyword, paths and `rejectedKey` across plugins.
- No `rejectedKey` is given for `not.required` inside a nested `$id` resource, as `README.md:137` documents.
