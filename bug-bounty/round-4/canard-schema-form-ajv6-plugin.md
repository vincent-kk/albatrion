# @canard/schema-form-ajv6-plugin: bug bounty round 4

This round confirmed 9 new findings in `@canard/schema-form-ajv6-plugin`: 3 high, 3 medium and 3 low. Items in the earlier round documents ([round 1](../round-1/canard-schema-form-ajv6-plugin.md), [round 2](../round-2/canard-schema-form-ajv6-plugin.md), [round 3](../round-3/canard-schema-form-ajv6-plugin.md)) were treated as fixed and excluded. The main session re-ran every probe, through the folder's probe-local configuration where it has one: this package's `r4-validation` folder ran 19 tests, of which 9 fail, and items 3 and 6 are reproduced by the `r4-validation` folder of `@canard/schema-form-ajv8-plugin`, which ran 101 tests, of which 16 fail; this package's `r4-contracts` folder ran 2 tests, of which 1 fails. Verification limits are listed under the probes.

Probes: [probes/canard-schema-form-ajv6-plugin/](probes/canard-schema-form-ajv6-plugin/)

- From `r4-validation`:
  - Probe folder in the working tree: `packages/canard/schema-form-ajv6-plugin/src/__bounty__/r4-validation/`; the round copy is `bug-bounty/round-4/probes/canard-schema-form-ajv6-plugin/r4-validation/`.
  - To run the copy: copy it back to `packages/canard/schema-form-ajv6-plugin/src/__bounty__/r4-validation/` and run `yarn workspace @canard/schema-form-ajv6-plugin test --run --config src/__bounty__/r4-validation/vitest.config.ts src/__bounty__/r4-validation/`. Through that config the folder runs 19 tests, of which the same 9 fail.
  - Items 3 and 6 are reproduced in the `@canard/schema-form-ajv8-plugin` folder (`bug-bounty/round-4/probes/canard-schema-form-ajv8-plugin/r4-validation/`), which imports this plugin's source and its AJV 6.12.6 copy by relative path; its document gives the command.
  - Failing tests that are not findings: none.
  - Control tests that pass:
    - `concurrentCalls.test.ts`: "[control] two overlapping calls on a root without $id each report their own verdict".
    - `lateSchema.test.ts`: "[control] a guard compiled first after the schema was added resolves it".
    - `pointerCache.test.ts`: "[control] the form issue under a referenced schema is a JSON Pointer" and "[control] the application's own validation keeps its configured dotted path".
    - `releaseConsumerSchema.test.ts`: "[control] without the form the application's registration validates".
    - `twoPluginCopies.test.ts`: both "[control]" tests with one evaluated copy.
    - `errorDataPathOption.test.ts`: "[control] default errorDataPath".
    - `sourceControl.test.ts`: both tests, which show that `@canard/schema-form` and `@winglet/common-utils/filter` resolve to their `src` modules.
  - Verification limits:
    - The folder's `vitest.config.ts` adds the `source` export condition first and the internal `@/<name>` aliases, so workspace packages resolve to `src`; every built `dist` of this round is stale. The plugin source imports `@canard/schema-form` only for types, so the main session's earlier run with the default config loaded no stale runtime code either.
    - The form-level symptoms of items 1 and 5 are recorded in [canard-schema-form](canard-schema-form.md) through an internal fixture.
- From `r4-contracts`:
  - Probe folder in the working tree: `packages/canard/schema-form-ajv6-plugin/src/__bounty__/r4-contracts/`; the round copy is `bug-bounty/round-4/probes/canard-schema-form-ajv6-plugin/r4-contracts/`.
  - To run the copy: copy it back to `packages/canard/schema-form-ajv6-plugin/src/__bounty__/r4-contracts/` and run `yarn workspace @canard/schema-form-ajv6-plugin test --run src/__bounty__/r4-contracts/es2020Environment.test.ts`. No probe-local configuration is needed.
  - The main session ran 2 tests: 1 fails, which reproduces item 9, and 1 control passes.
  - Failing tests that are not findings: none.
  - Control tests that pass: "control: the entry loads where the ES2021 globals exist".
  - Verification limits: the plugin source imports only types from `@canard/schema-form`, so the run loads no workspace `dist`. The globals are emulated with `vi.stubGlobal`; no real Safari 14.0 was used.

Root-cause files: `packages/canard/schema-form-ajv6-plugin/src/validator/`

## 1. When a validator compiled for a root with `$id` is called again before an earlier call settles, the earlier call reads the later call's errors, so an invalid value can be reported as valid.

- Severity: high. Failure is reported as success. Two forms that share one schema object and the plugin's validator share one compiled function, so a page that validates or submits several such forms together with `Promise.all` lets an invalid form pass and clears its field errors, so a save that trusts the verdict sends invalid data.
- Affected public API: `plugin.validator.compile`, `createValidator(ajv).compile` and `createValidatorFactory(ajv, key)` for a root with `$id`; through them `FormHandle.validate()`, `FormHandle.submit()` and `node.validate()`.
- Contract violated:
  - `documents/docs/canard/schema-form/validation.mdx:52`: the compiled function returns the ordered issues of the value it receives.
  - `packages/canard/schema-form/src/core/engine/validation/DETAIL.md:27`: an explicit caller waits for the verdict of the value at call time.
  - `packages/canard/schema-form/src/core/engine/validation/DETAIL.md:105` (VALIDATE-048): forms that use the same validator and root object share the compiled result, so the shared function must not mix their verdicts.
  - The round 3 known limit that no contract covers sharing one AJV instance across threads (`../round-3/FIXES.md`, section "알려진 한계") does not apply: these calls overlap on one thread.
- Root cause: `packages/canard/schema-form-ajv6-plugin/src/validator/createValidatorFactory.ts:42-49` awaits the boolean that AJV's synchronous function returns and only then reads the shared `validate.errors` property. A second call that starts before that continuation runs overwrites `validate.errors`. A root without `$id` is compiled as an `$async` transient (lines 23 to 25), whose errors travel in the rejection, but a root with `$id` is validated through `getSchema(key)` on its registered copy (line 26 and `packages/canard/schema-form-ajv6-plugin/src/validator/utils/compileWithPointers.ts:20`), which is synchronous.
- Relation to earlier rounds: Same class as round 3 cross-package class 22 (composed operations that differ from the same calls made one by one) and class 23 (one identifier, here the function's `errors` slot, shared by every form that shares the compiled root), see `../round-3/README.md`. The same defect in AJV 7 is [canard-schema-form-ajv7-plugin item 1](canard-schema-form-ajv7-plugin.md); the AJV 8 plugin always validates through an `$async` function and is not affected.
- Reopens an earlier fix: No. `git log -L 40,50` on the root-cause file lists `a05b92d4b`, `215c215e6` and `f85696c5a` from [round 1 item 1](../round-1/canard-schema-form-ajv6-plugin.md) and [round 1 item 2](../round-1/canard-schema-form-ajv6-plugin.md), which changed only the arguments passed to `transformDataPath`, and the formatting commit `5aee2a934`; the read of `validate.errors` after `await` predates them.
- Reproduction: `concurrentCalls.test.ts`, "two overlapping calls on a root with $id each report their own verdict". The actual result is `[[], []]`; the expected result is `[['minLength /name'], []]`. The control without `$id` passes. The form-level symptom is in [canard-schema-form](canard-schema-form.md) (`sharedValidatorOverlap.test.ts`).
- Confidence: high. Verification level: source through a probe-local config, public plugin API.

## 2. `release` deletes the application's own registration of a schema whose `$id` and content equal the released root.

- Severity: high. The plugin removes state it does not own from the consumer's AJV instance. After a form that uses the application's shared schema releases its root, the application's own `ajv.validate('<id>', data)`, and every later compile that `$ref`s that id, throws `no schema with key or ref`. The core calls `release` when a released root is evicted from the recent-release list or replaced by a root with the same `$id` (VALIDATE-045, `packages/canard/schema-form/src/core/engine/validation/DETAIL.md:93`).
- Affected public API: `plugin.validator.release` and `createValidator(ajv).release`, called by the core on eviction.
- Contract violated:
  - `packages/canard/schema-form-ajv6-plugin/CLAUDE.md:22`: "`release` removes only resources owned by that root", and "Cleanup by id alone can otherwise erase a consumer schema".
  - `documents/docs/canard/schema-form/validation.mdx:56`: release runs when a cached root is evicted.
  - The registration itself is accepted behavior: [round 2](../round-2/canard-schema-form-ajv6-plugin.md), "Hypotheses checked and not bugs", records that AJV 6 accepts a root whose `$id` the bound instance already holds when the content is equal.
- Root cause: `packages/canard/schema-form-ajv6-plugin/src/validator/utils/registerValidationRoot.ts:34` calls `addSchema(copy, key)`, and AJV 6's serialized-schema cache returns the application's schema object, so the plugin key aliases the consumer's registration. `packages/canard/schema-form-ajv6-plugin/src/validator/utils/disposeSchemaRoot.ts:6-7` then calls `removeSchema(key)`, which deletes that cache entry, and `removeSchema(validationCopy)`, which in AJV 6 deletes `_schemas[$id]` and `_refs[$id]` by the copy's `$id`, the application's own entries.
- Relation to earlier rounds: Same class as round 3 cross-package class 23 (`../round-3/README.md`): the consumer's registration and the plugin's copy share one identifier. It is the failure that the plugin's `CLAUDE.md` names and that the failed-`addSchema` rollback already prevents; the release path does not.
- Reopens an earlier fix: No. `git log -L 4,8` on `disposeSchemaRoot.ts` lists `5528e4026` and `2d7d72d82`, neither a bug bounty fix.
- Reproduction: `releaseConsumerSchema.test.ts`, "releasing the form root keeps the application's registration of the same $id". The actual result after `release` is `threw: no schema with key or ref "https://example.com/user.json"`; the expected result is `false` (the application's own verdict for the invalid value). The control without the form passes.
- Confidence: high. Verification level: source through a probe-local config, public plugin API.

## 3. The default instance rejects exact decimal multiples, such as 19.99 against `multipleOf: 0.01` and 0.3 against `multipleOf: 0.1`.

- Severity: high. Valid data is rejected in common usage, such as a price field, and the form cannot be submitted. The core's number input uses `multipleOf` as its step (`packages/canard/schema-form/src/fieldInputs/fieldInputDefinitions/FieldInputNumber/FieldInputNumber.tsx:35`), so the validator rejects values the input itself produces.
- Affected public API: `plugin.validator` with its default instance, and form validation that uses it.
- Contract violated:
  - JSON Schema Validation, section 6.2.1 ([https://json-schema.org/draft/2020-12/json-schema-validation#section-6.2.1](https://json-schema.org/draft/2020-12/json-schema-validation#section-6.2.1); the same clause is section 6.2.1 of Draft-07): a number is valid when its division by `multipleOf` is an integer.
  - `documents/docs/canard/schema-form/schema-reference.mdx:245`: `multipleOf` supplies the step of the number inputs. [Round 3](../round-3/canard-schema-form-antd5-plugin.md), "Hypotheses checked and not bugs", records that stepping from 0.2 with `multipleOf: 0.1` stores exactly 0.3.
- Root cause: `packages/canard/schema-form-ajv6-plugin/src/validator/validatorPlugin.ts:15-20` sets no `multipleOfPrecision`, and AJV 6 compares the binary floating-point quotient with `parseInt` (`packages/canard/schema-form-ajv6-plugin/node_modules/ajv/lib/dotjs/multipleOf.js:30`): `19.99 / 0.01` is `1998.9999999999998`. The same comparison also rejects `1e21` against `multipleOf: 1`, an input too large to count separately.
- Relation to earlier rounds: New class (numeric precision of a standard keyword). The same default is [canard-schema-form-ajv7-plugin item 2](canard-schema-form-ajv7-plugin.md) and [canard-schema-form-ajv8-plugin item 1](canard-schema-form-ajv8-plugin.md).
- Reopens an earlier fix: No. `git log -L 15,20` on the root-cause file lists `eb16b5f6b` and `a21bced85`, neither a bug bounty fix.
- Reproduction: `decimalMultipleOf.test.ts` in the `@canard/schema-form-ajv8-plugin` folder, describe "ajv6 default plugin and decimal multipleOf", test "accepts %j, whose values are exact multiples" for `{ price: 19.99, rating: 0.3 }`, `{ price: 0.07, rating: 0.7 }` and `{ price: 4.35, rating: 2.3 }`. The actual result is `['multipleOf /price', 'multipleOf /rating']`; the expected result is `[]`. The controls "[control] 1.1 and 2.5 are accepted" and "[control] rejects 19.995 for multipleOf 0.01" pass, and the AJV 8 control with `multipleOfPrecision: 9` passes.
- Confidence: high for the behavior; medium for whether the owner treats AJV's floating-point division as accepted behavior. Verification level: source through a probe-local config, public plugin API.

## 4. A schema that the application adds to the bound instance after a root's first guard compile cannot be resolved by that root's later guards, while whole validation of the same root resolves it.

- Severity: medium. In less common but plausible usage, such as a lazily loaded module that registers shared definitions after the first forms mounted, a later `if` that `$ref`s those definitions fails to compile, so both its `then` and `else` branches turn off with `GuardFailed`.
- Affected public API: `createValidator(ajv).compileGuard`, `plugin.validator.compileGuard` after `bind`, and conditional fields.
- Contract violated:
  - `packages/canard/schema-form-ajv6-plugin/CLAUDE.md:20`: guard clones preserve the consumer's schemas.
  - `documents/docs/canard/schema-form/validation.mdx:60`: referenced schemas may be provided in the bound instance.
  - The round 3 specification table (`../round-3/FIXES.md`, section "스펙표"): settings added to the user's AJV instance apply to later compiles.
- Root cause: `packages/canard/schema-form-ajv6-plugin/src/validator/utils/cloneInstance.ts:29-31` copies the bound instance's schemas once, when the clone is made, while lines 25 to 28 keep formats and keyword rules live. Each root's guard clone is made at its first guard compile (`packages/canard/schema-form-ajv6-plugin/src/validator/createGuardCompiler.ts:58` and `packages/canard/schema-form-ajv6-plugin/src/validator/utils/registerSchemaGuard.ts:20`), so a schema added later never reaches it.
- Relation to earlier rounds: Same class as round 3 cross-package class 21 (a fix that left a case out). It is the schema-registry sibling of [round 3 item 1 of the AJV 8 plugin](../round-3/canard-schema-form-ajv8-plugin.md), whose AJV 6 counterpart was fixed as an additional fix. The same defect is [canard-schema-form-ajv7-plugin item 3](canard-schema-form-ajv7-plugin.md) and [canard-schema-form-ajv8-plugin item 2](canard-schema-form-ajv8-plugin.md).
- Reopens an earlier fix: Yes, the round 3 additional AJV 6 fix for late formats and keywords (`ba80506ee`, listed in `../round-3/FIXES.md`) changed these lines and covered formats and keywords only. The cases it fixed still pass.
- Reproduction: `lateSchema.test.ts`, "a guard compiled after the schema was added resolves it like whole validation of the same root". The actual guard result is `compileGuard threw: can't resolve reference https://example.com/defs.json#/definitions/code from id #`, while whole validation reports `[['minLength', '/b'], ['if', '/b']]`; the expected guard verdict is `true`. The control that compiles the first guard after the schema was added passes.
- Confidence: high. Verification level: source through a probe-local config, public plugin API.

## 5. AJV 6's compile cache defeats the plugin's `jsonPointers` switch, so issue paths become dotted or mixed paths and the application's own validation changes its path format.

- Severity: medium. It needs an application that shares the bound instance with its own validation code, which plausible applications do. The form then reports an issue under a referenced schema at `/billing.street`, a path that names no field; with the shared same-`$id` schema of item 2, an issue under the key `"it's"` is again reported at `/x`, the address of an unrelated valid field (the input of round 3 item 2). In the other order, the application's own `ajv.errors` report `/street` instead of its configured `.street`.
- Affected public API: `createValidator(ajv)`, `plugin.validator.bind`, `ValidationIssue.dataPath`, `node.errors`, `FormHandle.getErrors()`.
- Contract violated:
  - `packages/canard/schema-form/src/core/engine/validation/types/issue.ts:5`: `dataPath` is the location of the rejected value.
  - `packages/canard/schema-form-ajv6-plugin/CLAUDE.md:25` and `documents/docs/canard/schema-form/validation.mdx:74`: AJV 6 paths are normalized to JSON Pointer.
  - [Round 3 item 2](../round-3/canard-schema-form-ajv6-plugin.md) and its fix: `jsonPointers` is turned on only during the plugin's compile, and the consumer's option is restored.
- Root cause: `packages/canard/schema-form-ajv6-plugin/src/validator/utils/compileWithPointers.ts:16-24` changes `jsonPointers` only for the duration of the plugin's compile. AJV 6 caches compiled validators on the schema objects of registered schemas: a `$ref` target that is not inlined (because it contains a `$ref` itself) reuses whichever validator was compiled first, and a root whose content equals a registered schema receives that schema's cached validator through the serialized-schema cache. Whichever side compiles first fixes the path format for both.
- Relation to earlier rounds: Sibling of [round 3 item 2](../round-3/canard-schema-form-ajv6-plugin.md) (same function, a case its fix left out), round 3 cross-package class 21, and angle `IN3` (a compile cache shared through one instance).
- Reopens an earlier fix: Yes, [round 3 item 2](../round-3/canard-schema-form-ajv6-plugin.md), fix commit `39ea8e5ab`: the `/x` symptom returns when the application shares the schema.
- Reproduction: `pointerCache.test.ts`.
  - "the form issue stays a JSON Pointer after the application validated the referenced schema itself": the actual path is `/billing.street`; the expected path is `/billing/street`.
  - "a root with $id that the application also registered and used reports the round-3 dynamic key path": the actual path is `/x`; the expected path is `/it's/x`.
  - "the application's own validation keeps its configured dotted path after a form compiled": the actual path is `/street`; the expected path is `.street`.
  - Both controls pass. The form-level symptom (`/addresses/home.street`) is in [canard-schema-form](canard-schema-form.md) (`ajv6PointerCacheRouting.test.ts`).
- Confidence: high. Verification level: source through a probe-local config, public plugin API.

## 6. A schema with an asynchronous keyword validates when its root has no `$id` but fails to compile with `async keyword in sync schema` when the root has `$id`.

- Severity: medium. Adding a root `$id` to a schema that uses an asynchronous keyword, such as a server-side availability check, leaves the form without validation (`VALIDATOR_COMPILE_FAILED`), while the AJV 8 plugin validates both shapes.
- Affected public API: `plugin.validator.compile`, `createValidator(ajv).compile` and `createValidatorFactory(ajv, key)` for a root with `$id`.
- Contract violated:
  - `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/validation-ux.md:89`: whole-schema validation may be asynchronous.
  - `documents/docs/canard/schema-form/validation.mdx:86`: the AJV 6 factory normalizes asynchronous results to issues or null.
  - Predictability: the same schema with and without a root `$id`, and the same schema across the three AJV plugins, should give the same verdict.
- Root cause: `packages/canard/schema-form-ajv6-plugin/src/validator/createValidatorFactory.ts:23-26` wraps only a root without `$id` in `{ ...clone, $async: true }`; a root with `$id` is compiled from its registered synchronous copy through `getSchema(key)`, which AJV 6 refuses when it contains an asynchronous keyword.
- Relation to earlier rounds: New class (angle `EQ11`, sibling plugins that differ on one input). The AJV 7 plugin fails for every root: [canard-schema-form-ajv7-plugin item 4](canard-schema-form-ajv7-plugin.md).
- Reopens an earlier fix: No. `git log -L 22,27` lists `39ea8e5ab` from [round 3 item 2](../round-3/canard-schema-form-ajv6-plugin.md), which replaced the compile call with `compileWithPointers` but kept the object that is compiled; the key path dates from `2d7d72d82`.
- Reproduction: `asyncKeywordParity.test.ts` in the `@canard/schema-form-ajv8-plugin` folder, describe "ajv6 asynchronous keyword in whole validation", test "root with $id reports the same keyword issue". The actual result is `threw: async keyword in sync schema`; the expected result is `['availableName /name']`. "root without $id reports the keyword issue" and the control with an explicit `$async: true` pass.
- Confidence: high. Verification level: source through a probe-local config, public plugin API.

## 7. Two evaluated copies of the plugin that share one AJV instance collide on registration keys and do not see each other's `$id` registrations.

- Severity: low. It needs two copies of the plugin, such as its ESM and CommonJS builds in one Node process or two bundles, and the same AJV instance passed to both. The second copy's first root with `$id` fails to compile with `schema with key or id "urn:canard:schema-form:ajv6:1" already exists`, and two live roots with the same `$id` are not isolated.
- Affected public API: `createValidator(ajv)` and `plugin.validator.bind` used from two copies with one instance.
- Contract violated: `documents/docs/canard/schema-form/validation.mdx:84` (independent adapters can share one non-modifying AJV instance) and VALIDATE-046 (`packages/canard/schema-form/src/core/engine/validation/DETAIL.md:95`: different live roots with the same `$id` stay isolated).
- Root cause: the registration key counter is module state (`packages/canard/schema-form-ajv6-plugin/src/validator/utils/registerSchemaRoot.ts:28`, used at line 55), so each copy starts again at 1; the per-instance list of `$id` registrations is a module-level `WeakMap` (`packages/canard/schema-form-ajv6-plugin/src/validator/utils/instanceIdRegistrationsOf.ts:7`), so one copy does not see the other copy's ids when it decides whether a root needs a separate instance.
- Relation to earlier rounds: Same class as round 3 cross-package classes 23 and 29 and round 2 class 5 (more than one copy of a package). The same defect is [canard-schema-form-ajv7-plugin item 5](canard-schema-form-ajv7-plugin.md) and [canard-schema-form-ajv8-plugin item 3](canard-schema-form-ajv8-plugin.md).
- Reopens an earlier fix: No.
- Reproduction: `twoPluginCopies.test.ts`, where `vi.resetModules()` re-evaluates the source as a second copy.
  - "two copies compile two roots with different $id": the second result is `compile threw: schema with key or id "urn:canard:schema-form:ajv6:1" already exists`; the expected result is `['type /y']`.
  - "two copies keep two live roots with the same $id isolated (VALIDATE-046)": the second result is `compile threw: schema with key or id "https://example.com/a.json" already exists`; the expected result is `['type /z']`.
  - Both controls with one copy pass.
- Confidence: high for the mechanism; low for how often the layout occurs. Verification level: source through a probe-local config, with a re-evaluated module standing in for a second copy.

## 8. With the AJV 6 option `errorDataPath: 'property'` on the bound instance, a `required` issue's `dataPath` repeats the missing property name.

- Severity: low. The option is a legacy AJV 6 setting, but an instance that carries it reports `/profile/name/name` instead of `/profile/name`; when the missing property is an object field, the issue reaches no field.
- Affected public API: `createValidator(ajv)` and `plugin.validator.bind` with an instance that sets `errorDataPath: 'property'`, `ValidationIssue.dataPath`.
- Contract violated: `packages/canard/schema-form/src/core/engine/validation/types/issue.ts:5` and `documents/docs/canard/schema-form/validation.mdx:74` (paths normalized to JSON Pointer), and equivalence with the default option.
- Root cause: `packages/canard/schema-form-ajv6-plugin/src/validator/utils/transformDataPath.ts:25-33` always appends `missingProperty` to a `required` issue's path, but with `errorDataPath: 'property'` AJV 6 already places the issue at the property.
- Relation to earlier rounds: Sibling of [round 3 item 2](../round-3/canard-schema-form-ajv6-plugin.md) (a consumer option that changes AJV 6's path output, which the plugin normalizes for `jsonPointers` only).
- Reopens an earlier fix: No. `git log -L 25,33` lists `2d7d72d82` and `70bbecaf9`.
- Reproduction: `errorDataPathOption.test.ts`, "errorDataPath: 'property' gives the same path". The actual result is `['required /profile/name/name']`; the expected result is `['required /profile/name']`. The control with the default option passes.
- Confidence: high. Verification level: source through a probe-local config, public plugin API.

## 9. `@canard/schema-form-ajv6-plugin` throws at import time in Safari 14.0, which its README lists as supported, because the module creates a `FinalizationRegistry` while it loads.

- Severity: low. The environment is rare today, but the failure is total: the import fails, so an application that loads the plugin at start-up does not start. `WeakRef` and `FinalizationRegistry` belong to ECMAScript 2021 and shipped in Safari 14.1 ([tc39/proposal-weakrefs](https://github.com/tc39/proposal-weakrefs)), so Safari 14.0 and iOS Safari 14.0 to 14.4 lack them.
- Affected public API: the entry of `@canard/schema-form-ajv6-plugin`.
- Contract violated: `packages/canard/schema-form-ajv6-plugin/README.md:149` lists "Modern browsers (Chrome 91+, Firefox 90+, Safari 14+)", and `packages/canard/schema-form-ajv6-plugin/README.md:144` says the package is built with ECMAScript 2020 syntax.
- Root cause: `packages/canard/schema-form-ajv6-plugin/src/validator/validatorPlugin.ts:41` calls `new FinalizationRegistry(...)` at module level. The shared build lowers syntax to ES2020 (`TRANSFORM_TARGET` at `packages/aileron/script/build/utils/getCodegenOptions.mjs:32`), which cannot supply ES2021 globals.
- Relation to earlier rounds: New class: a run-time API newer than the documented environment. The same cause exists in the ajv7 and ajv8 plugins ([canard-schema-form-ajv7-plugin item 6](canard-schema-form-ajv7-plugin.md), [canard-schema-form-ajv8-plugin item 4](canard-schema-form-ajv8-plugin.md)).
- Reopens an earlier fix: No. `git log -L` on `validatorPlugin.ts:41` shows only `2d7d72d82`, a feature commit, and no bug bounty fix.
- Reproduction: `packages/canard/schema-form-ajv6-plugin/src/__bounty__/r4-contracts/es2020Environment.test.ts`, "the entry loads in an ES2020 host without WeakRef and FinalizationRegistry (README: Safari 14+)". The probe sets both globals to `undefined` and imports the source entry again. Actual: "threw TypeError: FinalizationRegistry is not a constructor". Expected: "loaded". In Safari 14.0, where the name is not defined at all, the error would be a `ReferenceError`. The control "control: the entry loads where the ES2021 globals exist" passes.
- Confidence: high for the mechanism and medium for the environment claim; the source public entry with the globals emulated, not run in a real browser.

## Hypotheses checked and not bugs

- From `r4-validation`:
  - On 32 Draft-07 schema and data pairs (`required`, `additionalProperties`, `propertyNames`, `dependencies`, `if`/`then`, `contains`, tuples, `false` schemas, `not.required`, `nullable`, `-0` against `exclusiveMinimum`, `1.5` against `integer`, astral characters against `maxLength` and others), this plugin's keyword, `dataPath` and `rejectedKey` equal those of the AJV 7 and AJV 8 plugins, with and without a root `$id` (`pluginParity.test.ts` in the `@canard/schema-form-ajv8-plugin` folder).
  - The README example "Enabling a declared Draft-06 schema", fixed by round 3 item 3, runs as written and reports `exclusiveMaximum` (`readmeDraft06.test.ts` in the same folder).
  - Two overlapping calls on a root without `$id` each receive their own verdict, because that path compiles an `$async` transient.
- From `r4-contracts`: `packages/canard/schema-form-ajv6-plugin/src/validator/utils/registerSchemaRoot.ts:1` carries the same `/// <reference lib="es2021.weakref" />` as the ajv8 plugin, but the ajv6 public declarations (`dist/index.d.ts` and `dist/validator/validatorPlugin.d.ts`) do not import the files that use `WeakRef`, so the dropped directive of [canard-schema-form-ajv8-plugin item 5](canard-schema-form-ajv8-plugin.md) does not reach an ajv6 consumer.
