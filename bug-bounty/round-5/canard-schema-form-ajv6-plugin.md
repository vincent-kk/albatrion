# @canard/schema-form-ajv6-plugin: bug bounty round 5

6 new findings in `@canard/schema-form-ajv6-plugin`: 1 high, 3 medium and 2 low. Items in the documents of [round 1](../round-1/canard-schema-form-ajv6-plugin.md), [round 2](../round-2/canard-schema-form-ajv6-plugin.md), [round 3](../round-3/canard-schema-form-ajv6-plugin.md) and [round 4](../round-4/canard-schema-form-ajv6-plugin.md) were treated as fixed and excluded, together with the decisions and known limits of each round's `FIXES.md`. The main session re-ran every probe: the `r5-ajv-ownership` folder ran 18 tests, of which 9 fail, and the `r5-ajv-results` folder ran 42 tests, of which 7 fail. Items 1, 4, 5 and 6 are regressions of round 4 fixes, and items 1, 2, 3, 5 and 6 repeat the watch-list point on registrations and the compile cache of the AJV plugins.

Item 5 of [canard-schema-form.md](canard-schema-form.md) also affects this package: the quick-start compatibility table says the AJV plugins declare no core peer.

Probes: [probes/canard-schema-form-ajv6-plugin/](probes/canard-schema-form-ajv6-plugin/)

- Copy a folder back to `packages/canard/schema-form-ajv6-plugin/src/__bounty__/<hunter-id>/` and run `yarn workspace @canard/schema-form-ajv6-plugin test --run src/__bounty__/<hunter-id>/`. The probes import the plugin source; `@canard/schema-form` resolves to its `dist`.
- `r5-ajv-results/bisect/<commit>/` holds read-only `git archive` extractions of the plugin `src` at `b267c050f^`, `b267c050f`, `6326b9730^` and `6326b9730`. Only the `[bisect]` rows load them. "[bisect] at b267c050f …" and "[bisect] at 6326b9730 …" fail on purpose with the item's actual value; their parent rows pass.
- Earlier probes re-run (`r5-rerun-plugins`, see [canard-schema-form.md](canard-schema-form.md) for the method): rounds 1 to 4 ran 34 tests and 2 fail, both round 3 `draftSupport` tests decided by the round 3 item 3 documentation fix. No earlier item regressed.

Root-cause files: `packages/canard/schema-form-ajv6-plugin/src/validator/`

## 1. After the plugin releases a form root equal to a schema the application compiled with `ajv.compile(schema)` or `ajv.validate(schema, data)`, the application's next `ajv.validate(schema, data)` throws `already exists`, and every later form root with that schema fails to compile.

- Severity: high. The plugin destroys application state it does not own, AJV 6's compile-cache entry for the application's schema, in common AJV 6 usage: the core releases a root on same-`$id` replacement, which happens whenever a route rebuilds its schema object. The application's own validation throws, and the remounted form loses whole-schema validation (`VALIDATOR_COMPILE_FAILED`).
- Affected public API: `createValidator(ajv).release` and `plugin.validator.release` after `bind(ajv)`, which the core calls on eviction or same-`$id` replacement (VALIDATE-045); through them `FormHandle.validate()` and the application's `ajv.validate(schema, data)` and `ajv.compile(schema)`.
- Contract violated: `.changeset/ajv6-registration-ownership.md:5` ("A schema registered before the form … remains available to the application"); the maintainer contract in `packages/canard/schema-form-ajv6-plugin/CLAUDE.md` ("`release` removes only resources owned by that root"); the round 4 decision that application registrations are not deleted (`../round-4/FIXES.md:355` and `:446`).
- Root cause: `src/validator/utils/registerValidationRoot.ts:54` decides `isCacheOwned` by looking for the reused environment in `_schemas` only. `ajv.compile` and `ajv.validate(schemaObject, …)` store the application's environment in `_refs` and the serialized `_cache`, never in `_schemas`, so the alias is classed as plugin-owned. `src/validator/utils/disposeSchemaRoot.ts:13` then calls `removeSchema(key)`, which deletes the cache entry while the application's `_refs[$id]` survives (it is not in the plugin's list of new references), so the next compile of the same object reaches AJV's `checkUnique` and throws.
- Relation to earlier rounds: same function as round 4 item 2, through a registration path that fix did not consider; round 4 class 33 and round 3 class 23.
- Reopens an earlier fix: round 4 item 2, commit `2e4061359`.
- Regression of an earlier fix: yes, case (b): round 4 `@canard/schema-form-ajv6-plugin` item 2, commit `2e4061359`. Before it, release also removed the copy by object, which deleted `_refs[$id]`, so the application's next `ajv.validate(schema, data)` recompiled and worked. The main session read both versions; the probe "[diagnostic] the pre-fix release … left ajv.validate(schema, data) working" replays the old release and passes.
- Watch list: yes, late schemas, registration and the compile cache of the AJV plugins.
- Reproduction: `r5-ajv-ownership/compiledApplicationSchema.test.ts`, "after release, the application still validates its own schema object" (actual `threw: schema with key or id "https://r5.invalid/ajv6/compiled-by-application" already exists`, expected `true`); "after release, ajv.compile(schema) still returns the application validator" (the same throw); "after release, a later form root with the same schema compiles again" (actual `compile threw: … already exists`, expected `['minLength /name']`). `compiledApplicationSchema.form.test.tsx`, "two visits with a rebuilt schema object keep both the application and the form validating": the second visit gives `validate rejected: Whole-schema validation could not be compiled`, expected `['minLength']`. The controls pass.
- Confidence: high; public plugin API from source and public `Form` from the core `dist`.

## 2. A form root that embeds a resource whose `$id` an application document also embeds redirects the application's address to the form's copy, and after release the address dangles.

- Severity: medium. The plugin overwrites and then breaks an application registration. The input needs bundled schema documents that embed the same resource with its own `$id`.
- Affected public API: `compile` and `release` of `createValidator(ajv)` and of `plugin.validator` after `bind`; the application's `ajv.validate`, `ajv.getSchema` and `ajv.compile`.
- Contract violated: `.changeset/ajv6-registration-ownership.md:5`; `../round-4/FIXES.md:355`.
- Root cause: the plugin registers a root with `$id` on the application instance (`src/validator/utils/registerValidationRoot.ts:40`); the conflict check consults only plugin registrations (`registerSchemaRoot.ts:74`); AJV keeps an embedded resource as a string alias, and `addSchema` overwrites an alias that was never materialized without a check (AJV 6 `lib/compile/resolve.js:252-261`); the ownership record (`registerValidationRoot.ts:48-54`) keeps only keys that were absent before, so the replaced application alias is neither recorded nor restored, and release deletes the document it now points to.
- Relation to earlier rounds: round 4 item 2; round 3 class 23. The same defect is recorded for [ajv7 item 1](canard-schema-form-ajv7-plugin.md) and [ajv8 item 1](canard-schema-form-ajv8-plugin.md), whose lines are their own.
- Reopens an earlier fix: round 4 item 2 (`2e4061359` wrote these lines). The defect predates it: the earlier `removeSchema(validationCopy)` left the same dangling alias.
- Regression of an earlier fix: no.
- Watch list: yes, late schemas, registration and the compile cache of the AJV plugins.
- Reproduction: `r5-ajv-ownership/embeddedResourceAlias.test.ts`, "after the form root is released, the application still resolves its embedded resource" (actual `threw: no schema with key or ref "…/address.json"`) and "… a new application schema can reference the embedded resource" (actual `compile threw: can't resolve reference …/address.json from id #`). A later form that references the resource still compiles in AJV 6, through the seeded private compiler.
- Confidence: high; public plugin API from source.

## 3. A Form-specific adapter memoized in a route component never releases its last roots, so the shared application instance keeps every visited root.

- Severity: medium. A permanent leak in documented usage. In AJV 6 the next visit still validates, through the serialized cache; the AJV 7 and AJV 8 plugins fail to compile it ([ajv7 item 2](canard-schema-form-ajv7-plugin.md), [ajv8 item 2](canard-schema-form-ajv8-plugin.md)).
- Affected public API: `createValidator(ajv)` used as `validatorFactory`.
- Contract violated: `documents/docs/canard/schema-form/validation.mdx:84` (adapters created outside render or memoized with stable dependencies; independent adapters can share one instance); VALIDATE-021 in `packages/canard/schema-form/src/core/engine/validation/DETAIL.md:77` (registrations are released explicitly, not by garbage-collection notification).
- Root cause: each adapter owns its registry and its own `FinalizationRegistry` (`src/validator/createValidator.ts:38-40`), which is collected together with the adapter and then runs no cleanup; the core releases a root only when its recent list exceeds eight (`packages/canard/schema-form/src/core/engine/validation/utils/lifetime/releaseValidationRoot.ts:12-23`), so the last roots of an unreachable adapter are never released.
- Relation to earlier rounds: new class (cleanup of a dropped owner, angle `LC4`); near round 1 class 11 and round 3 class 25.
- Reopens an earlier fix: no; the AJV 8 lines carry round 4 ajv8 items 3 and 4, whose decisions stand.
- Regression of an earlier fix: no.
- Watch list: yes, registration lifetime on the application instance.
- Reproduction: `r5-ajv-ownership/droppedAdapter.test.ts`, "a second visit after the first adapter was collected validates the same way as before collection": actual `{ leftover: [id], second: ['minLength /name'] }`, expected no leftover. Collection is forced inside the test with `setFlagsFromString('--expose_gc')` and `runInNewContext('gc')`.
- Confidence: high for the leak; medium for how often a browser collects between two visits.

## 4. An asynchronous format fails to compile with `async format in sync schema` for every root.

- Severity: medium. With a bound instance that defines an async format, the form has no validation unless the schema itself declares `$async: true`; the AJV 8 plugin validates the same schema.
- Affected public API: `createValidator(ajv).compile` and `plugin.validator.compile` after `bind`. The low-level `createValidatorFactory(ajv)` still forces asynchronous compilation and works.
- Contract violated: `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/validation-ux.md:89` (whole-schema validation may be asynchronous); `documents/docs/canard/schema-form/validation.mdx:60` and this package's `README.md:106`, which exclude async formats only from guards; parity with AJV 8 (round 4 class 32).
- Root cause: `src/validator/utils/createSchemaValidator.ts:34-49` compiles synchronously first and retries asynchronously only when the message is exactly `async keyword in sync schema`; `validatorPlugin.ts:76-83` and `createValidator.ts:53-60` pass `forceAsync: false`.
- Relation to earlier rounds: the format case of round 4 item 6 (round 4 class 32).
- Reopens an earlier fix: round 4 item 6, commit `a4ef334dd`; its keyword-only retry was moved here by `6326b9730`.
- Regression of an earlier fix: yes, case (b), for roots without `$id`: commit `6326b9730` ("perf(ajv6): defer native async compilation until required (round-4 ajv6 1, 5, 6)"). Before it, a root without a key was compiled as `{ ...clone, $async: true }`. The commit lies in the round 4 fix range of `../round-4/FIXES.md:3` and names round 4 items 1, 5 and 6, although the result table there does not list it. Roots with `$id` already failed before it.
- Watch list: no.
- Reproduction: `r5-ajv-results/asyncFormat.test.ts`, "a root without $id reports the format issue", "a root with $id reports the format issue" and the `bind` row: actual `threw: async format in sync schema`, expected `['format /name']`. "[bisect] at 6326b9730^ …" passes and "[bisect] at 6326b9730 …" fails with the same actual value.
- Confidence: high; plugin source and historical source snapshots.

## 5. A form root whose `$id` the application registered and later removed fails with `already exists`, because the plugin's private pointer compiler kept the removed schema.

- Severity: low. The application must remove its registration after some form compiled; the failure surfaces as `VALIDATOR_COMPILE_FAILED`. The AJV 8 plugin compiles the same sequence.
- Affected public API: `createValidator(ajv).compile`, `plugin.validator.compile` after `bind`.
- Contract violated: `.changeset/ajv6-independent-path-profiles.md` (the private cache normalizes paths, not which roots compile); parity with AJV 8. It goes past the round 4 late-schema limit in `.changeset/ajv6-late-schema-resolution.md`, which covers stale content, not the rejection of a new root.
- Root cause: `src/validator/utils/compileWithPointers/pointerCompilerOf.ts:11-21` creates one private compiler per application instance; `utils/cloneInstance.ts:62-69` copies the application's `_schemas` into it at creation; `utils/compileWithPointers/seedPointerCompilation.ts:56` declines to seed because that compiler still holds the `$id`; `utils/compileWithPointers.ts:56-59` then compiles on it, and AJV's `checkUnique` throws.
- Relation to earlier rounds: round 4 item 5; round 4 class 33.
- Reopens an earlier fix: round 4 item 5, commit `b267c050f`.
- Regression of an earlier fix: yes, case (b): round 4 `@canard/schema-form-ajv6-plugin` item 5, commit `b267c050f`, which moved compilation onto the private compiler; before it, compilation used the application instance, which no longer held the `$id`. Established by reading the code before and after the commit.
- Watch list: yes, late schemas, registration and the compile cache of the AJV plugins.
- Reproduction: `r5-ajv-ownership/removedApplicationSchema.test.ts`, "the application removes its schema after an unrelated form compiled" and "the same sequence through a second adapter on the same instance": actual `compile threw: schema with key or id "https://r5.invalid/ajv6/removed-by-application" already exists`, expected `['minLength /name']`. The control (removal before any compile) passes.
- Confidence: high for the mechanism; medium for how often the input occurs.

## 6. Compiling the same root object a second time throws `already exists` when the root has `$id` and an asynchronous keyword.

- Severity: low. The Form engine compiles each entry once (`packages/canard/schema-form/src/core/engine/validation/utils/cache/compileValidationEntry.ts:19-23`); the failure needs a direct second `compile` of the same object or the engine's duplicate-id retry of the same copy (`retryValidationEntry.ts:28`), and it is thrown, not silent.
- Affected public API: `createValidator(ajv).compile`, `plugin.validator.compile` after `bind`.
- Contract violated: this package's `README.md:135` ("Reuses the registration for the same root object until `release(root)`") and `:105`; `retryValidationEntry.ts:8-9`, which recompiles the same copy after guard calls.
- Root cause: `src/validator/utils/compileWithPointers.ts:39-59`. The first compile's asynchronous retry (`:41-53`) registers `{ ...registered, $async: true }`, which carries the root's `$id`, on the private pointer compiler. The second compile overwrites the `pointerCompilations` entry (`:56`) and compiles the synchronous snapshot on the same compiler (`:59`), so AJV's unique-id check throws, and `createSchemaValidator.ts:37-41` rethrows because it retries only the keyword message.
- Relation to earlier rounds: round 4 item 5 (the private pointer-compilation cache that fix introduced).
- Reopens an earlier fix: round 4 items 5 and 8, commit `b267c050f`.
- Regression of an earlier fix: yes, case (b): round 4 `@canard/schema-form-ajv6-plugin` items 5 and 8, commit `b267c050f` (`../round-4/FIXES.md:147` and `:150`). Before it, the asynchronous retry compiled a transient `{ $async: true, $ref: key }` and removed it, so no `$id` stayed on any compiler.
- Watch list: yes, late schemas, registration and the compile cache of the AJV plugins.
- Reproduction: `r5-ajv-results/repeatedAsyncCompile.test.ts`, "a root with $id and an asynchronous keyword gives the same verdict on the second compile (createValidator)" and the `bind` row: actual `[['minLength /name'], 'compile threw: schema with key or id "https://example.com/r5-repeat-1.json" already exists']`, expected two equal verdicts. "[bisect] at b267c050f^ …" passes and "[bisect] at b267c050f …" fails.
- Confidence: high for the mechanism; low for how often consumers compile the same object twice.

## Hypotheses checked and not bugs

- An application registration made with `addSchema` survives release and keeps `ajv.validate(schema, data)` working; only the `compile` and `validate(schemaObject)` path of item 1 fails.
- An `AggregateError` thrown by a keyword is rethrown unchanged, with and without `$id`; this is the control for [ajv7 item 5](canard-schema-form-ajv7-plugin.md) and [ajv8 item 4](canard-schema-form-ajv8-plugin.md).
- Compiling a guard before the whole schema works, and two adapters on one instance work; only a second compile of the same object fails (item 6).
- Decimal `multipleOf` on the default instance agrees with plain AJV 8 (`multipleOfPrecision: 9`) for negative values, tiny and large magnitudes, exponent spellings and `-0`; 1,000 seeded exact multiples are accepted and their half-step neighbors rejected. Quotients above 1e6 are the documented limit (`README.md:232`).
- Overlapping and nested calls of one compiled validator give the same results as sequential calls; round 4's per-invocation decision holds.
- Rebinding drops the registries, but `documents/docs/canard/schema-form/validation.mdx:82` says rebinding is not a supported lifecycle.
