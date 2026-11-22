# @canard/schema-form-ajv7-plugin: bug bounty round 5

5 new findings in `@canard/schema-form-ajv7-plugin`, all medium. Items in the documents of [round 1](../round-1/canard-schema-form-ajv7-plugin.md), [round 2](../round-2/canard-schema-form-ajv7-plugin.md), [round 3](../round-3/canard-schema-form-ajv7-plugin.md) and [round 4](../round-4/canard-schema-form-ajv7-plugin.md) were treated as fixed and excluded, together with the decisions and known limits of each round's `FIXES.md`. The main session re-ran every probe: the `r5-ajv-ownership` folder ran 7 tests, of which 4 fail, and the `r5-ajv-results` folder ran 46 tests, of which 12 fail. No item is a regression; items 1 and 2 repeat the watch-list point on registrations and the compile cache of the AJV plugins.

Item 5 of [canard-schema-form.md](canard-schema-form.md) also affects this package: the quick-start compatibility table says the AJV plugins declare no core peer.

Probes: [probes/canard-schema-form-ajv7-plugin/](probes/canard-schema-form-ajv7-plugin/)

- Copy a folder back to `packages/canard/schema-form-ajv7-plugin/src/__bounty__/<hunter-id>/` and run `yarn workspace @canard/schema-form-ajv7-plugin test --run src/__bounty__/<hunter-id>/`. The probes import the plugin source with its AJV 7.2.4 copy; `@canard/schema-form` resolves to its `dist`.
- Every failing test belongs to an item below. `r5-ajv-results/resultControls.test.ts` passes (26 tests).
- Earlier probes re-run (`r5-rerun-plugins`, see [canard-schema-form.md](canard-schema-form.md) for the method): rounds 1 to 4 ran 28 tests and 2 fail. The round 3 draft-06 test fails on the round 3 item 2 documentation decision, and the round 3 draft-04 test fails on a limit the earlier record lists. No earlier item regressed.

Root-cause files: `packages/canard/schema-form-ajv7-plugin/src/validator/`

## 1. A form root that embeds a resource whose `$id` an application document also embeds redirects the application's address to the form's copy; after release the address dangles, and a later form that references the resource fails to compile.

- Severity: medium. The plugin overwrites and then breaks an application registration, and a later form loses whole-schema validation. The input needs bundled schema documents that embed the same resource with its own `$id`.
- Affected public API: `compile` and `release` of `createValidator(ajv)` and of `plugin.validator` after `bind`; the application's `ajv.validate`, `ajv.getSchema` and `ajv.compile`.
- Contract violated: `.changeset/ajv7-registration-ownership.md:5`; the round 4 decision that application registrations are not deleted (`../round-4/FIXES.md:355`).
- Root cause: the plugin registers a root with `$id` on the application instance (`src/validator/utils/registerValidationRoot.ts:39`); the conflict check consults only plugin registrations (`registerSchemaRoot.ts:82`); AJV keeps an embedded resource as a string alias, and `addSchema` overwrites an alias that was never materialized without a check; the ownership record keeps only keys that were absent before, so the replaced application alias is neither recorded nor restored.
- Relation to earlier rounds: round 4 ownership fixes; round 3 class 23. The same defect is recorded for [ajv6 item 2](canard-schema-form-ajv6-plugin.md) and [ajv8 item 1](canard-schema-form-ajv8-plugin.md).
- Reopens an earlier fix: the ownership fix `3f2f5fcdf` wrote these lines.
- Regression of an earlier fix: no; the earlier `removeSchema(validationCopy)` left the same dangling alias.
- Watch list: yes, late schemas, registration and the compile cache of the AJV plugins.
- Reproduction: `r5-ajv-ownership/embeddedResourceAlias.test.ts`, "after the form root is released, the application still resolves its embedded resource" (actual `threw: no schema with key or ref "…/address.json"`), "… a new application schema can reference the embedded resource" (actual `compile threw: can't resolve reference …/address.json from id #`) and "… a later form root that references the resource compiles" (fails).
- Confidence: high; public plugin API from source.

## 2. A Form-specific adapter memoized in a route component never releases its last roots; after garbage collection, the next visit of a form whose root has `$id` fails to compile with `already exists`.

- Severity: medium. A form loses validation in documented usage, depending on when the browser collects the dropped adapter; the leak itself is permanent.
- Affected public API: `createValidator(ajv)` used as `validatorFactory`; `FormHandle.validate()`.
- Contract violated: `documents/docs/canard/schema-form/validation.mdx:84` (adapters created outside render or memoized with stable dependencies; independent adapters can share one instance); VALIDATE-021 in `packages/canard/schema-form/src/core/engine/validation/DETAIL.md:77` (registrations are released explicitly, not by garbage-collection notification).
- Root cause: each adapter owns its registry and its own `FinalizationRegistry` (`src/validator/createValidator.ts:40-43`), which is collected with the adapter and then runs no cleanup; the core releases a root only when its recent list exceeds eight (`packages/canard/schema-form/src/core/engine/validation/utils/lifetime/releaseValidationRoot.ts:12-23`); the conflict check (`registerSchemaRoot.ts:82`) sees only weak references, so the leftover `refs[$id]` makes `addSchema` throw.
- Relation to earlier rounds: new class (cleanup of a dropped owner, angle `LC4`); near round 1 class 11 and round 3 class 25. The same defect is recorded for [ajv6 item 3](canard-schema-form-ajv6-plugin.md) and [ajv8 item 2](canard-schema-form-ajv8-plugin.md).
- Reopens an earlier fix: no.
- Regression of an earlier fix: no.
- Watch list: yes, registration lifetime on the application instance.
- Reproduction: `r5-ajv-ownership/droppedAdapter.test.ts`, "a second visit after the first adapter was collected validates the same way as before collection": actual `{ leftover: [id], second: 'compile threw: … already exists' }`. Collection is forced inside the test with `setFlagsFromString('--expose_gc')` and `runInNewContext('gc')`.
- Confidence: high for the mechanism; medium for how often a browser collects between two visits.

## 3. An asynchronous keyword in a root with `$id` that contains any `$ref` fails to compile with `async keyword in sync schema`.

- Severity: medium. The form has no whole-schema validation (`VALIDATOR_COMPILE_FAILED`); roots with `$id`, a `$ref` and an asynchronous keyword are ordinary inputs. The AJV 6 plugin and plain AJV 7 validate the same schema.
- Affected public API: `createValidator(ajv).compile` and `plugin.validator.compile` after `bind`.
- Contract violated: `.changeset/ajv7-asynchronous-keyword-parity.md:5` (consistent results with and without a root `$id`); `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/validation-ux.md:89` (whole-schema validation may be asynchronous); parity with the AJV 6 plugin (round 4 class 32).
- Root cause: `src/validator/createValidatorFactory.ts:25-28` retries a root with `$id` through the wrapper `{ $async: true, $ref: key }`. AJV inlines the registered root into that wrapper only when the root contains no `$ref`; otherwise it compiles the root as its own environment without `$async` and refuses the asynchronous keyword.
- Relation to earlier rounds: round 4 item 4 (round 4 class 32).
- Reopens an earlier fix: round 4 item 4, commit `a6834da0e`, which added the wrapper; its own inputs have no `$ref` and still pass.
- Regression of an earlier fix: no; before `a6834da0e` every root with `$id` and an asynchronous keyword failed.
- Watch list: no.
- Reproduction: `r5-ajv-results/asyncKeywordWithRef.test.ts`, three rows (an unrelated local `$ref`, a `$ref` to the definition that holds the keyword, a recursive `$ref` to the root): actual `threw: async keyword in sync schema`, expected `['available /name']`. The controls without `$id` pass.
- Confidence: high; plugin source.

## 4. An asynchronous format fails to compile with `async format in sync schema` for every root.

- Severity: medium. With a bound instance that defines an asynchronous format, the form has no validation unless the schema itself declares `$async: true`; the AJV 8 plugin validates the same schema.
- Affected public API: `createValidator(ajv).compile`, `plugin.validator.compile` after `bind`.
- Contract violated: `validation-ux.md:89`; `documents/docs/canard/schema-form/validation.mdx:60`, which excludes asynchronous rules only from guards; parity with the AJV 8 plugin.
- Root cause: `src/validator/createValidatorFactory.ts:11-13` compiles a plain clone without `$async`, and `:19-23` retry only when the message is the keyword message.
- Relation to earlier rounds: the format case of round 4 item 4; the same defect is recorded for [ajv6 item 4](canard-schema-form-ajv6-plugin.md).
- Reopens an earlier fix: round 4 item 4, commit `a6834da0e`.
- Regression of an earlier fix: no; the plain clone dates from `2d7d72d82`, and formats never had the retry.
- Watch list: no.
- Reproduction: `r5-ajv-results/asyncFormat.test.ts`, "a root without $id reports the format issue", "a root with $id reports the format issue" and the `bind` row: actual `threw: async format in sync schema`, expected `['format /name']`. The control that declares `$async: true` passes.
- Confidence: high; plugin source.

## 5. A keyword exception that carries an `errors` array is returned as validation issues, or replaced by a `TypeError`.

- Severity: medium. An execution failure becomes a verdict: for a root without `$id`, `validate()` resolves with root issues whose keyword is `undefined`, and `VALIDATOR_THREW` never fires; for a root with `$id`, the original error is lost behind a `TypeError`. `AggregateError` and many library validation errors carry such an array.
- Affected public API: `createValidator(ajv)`, `plugin.validator` after `bind`, with any keyword that throws or rejects.
- Contract violated: `documents/docs/canard/schema-form/validation.mdx:52` ("Throws indicate execution failure, not a validation verdict"); `packages/canard/schema-form/src/errors/constants/FormErrorCode.ts:73-74` (`VALIDATOR_THREW`); the round 3 decision for the AJV 6 plugin (`../round-3/FIXES.md:167`) that AJV's ValidationError is recognized by its markers and unrelated exceptions are rethrown. The AJV 6 plugin rethrows the same `AggregateError`.
- Root cause: `src/validator/createValidatorFactory.ts:50-53` treats any `Error` with an array `errors` as AJV's ValidationError and ignores AJV's markers (`ajv === true`, `validation === true`); on the asynchronous `$id` path, `:55-61` call `error.schemaPath.startsWith` on the foreign entries.
- Relation to earlier rounds: round 3 AJV 6 item 1, whose decision was not carried to this plugin. The same defect is recorded for [ajv8 item 4](canard-schema-form-ajv8-plugin.md).
- Reopens an earlier fix: no; `a6834da0e` and `d89b8d7fa` touched these lines, but the classification comes from `3cc2316a1` and `2d7d72d82`.
- Regression of an earlier fix: no.
- Watch list: no.
- Reproduction: `r5-ajv-results/thrownErrorsArray.test.ts`, 6 of 8 tests fail. Without `$id`: actual `{ resolved: [[undefined, '', 'server a down'], [undefined, '', 'server b down']] }`, expected a rejection with the `AggregateError`. With `$id`: actual `TypeError: Cannot read properties of undefined (reading 'startsWith')`. The plain-`Error` controls pass.
- Confidence: high; plugin source.

## Hypotheses checked and not bugs

- A plain `Error` thrown by a keyword is rethrown, and the next call is independent.
- Each plugin's issue list equals plain AJV 7 for 14 schema shapes; decimal `multipleOf` agrees with the other plugins.
- Overlapping and nested calls of one compiled validator equal sequential calls; round 4's per-invocation decision holds.
- No `rejectedKey` is given for `not.required` inside a nested `$id` resource. The AJV 8 README documents this limit (`README.md:137`); this plugin's README does not state it, which is a documentation gap below the quality bar.
- A root whose `$id` the application currently holds fails with `already exists`; this is the round 2 decision, pinned by `lifetime.consumer-schema-kept`.
