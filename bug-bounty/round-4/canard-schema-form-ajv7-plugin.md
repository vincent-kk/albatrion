# @canard/schema-form-ajv7-plugin: bug bounty round 4

This round confirmed 6 new findings in `@canard/schema-form-ajv7-plugin`: 2 high, 2 medium and 2 low. Items in the earlier round documents ([round 1](../round-1/canard-schema-form-ajv7-plugin.md), [round 2](../round-2/canard-schema-form-ajv7-plugin.md), [round 3](../round-3/canard-schema-form-ajv7-plugin.md)) were treated as fixed and excluded. The main session re-ran every probe, through the folder's probe-local configuration where it has one: this package's `r4-validation` folder ran 14 tests, of which 6 fail, and items 2 and 4 are reproduced by the `r4-validation` folder of `@canard/schema-form-ajv8-plugin`, which ran 101 tests, of which 16 fail; this package's `r4-contracts` folder ran 2 tests, of which 1 fails. Verification limits are listed under the probes.

Probes: [probes/canard-schema-form-ajv7-plugin/](probes/canard-schema-form-ajv7-plugin/)

- From `r4-validation`:
  - Probe folder in the working tree: `packages/canard/schema-form-ajv7-plugin/src/__bounty__/r4-validation/`; the round copy is `bug-bounty/round-4/probes/canard-schema-form-ajv7-plugin/r4-validation/`.
  - To run the copy: copy it back to `packages/canard/schema-form-ajv7-plugin/src/__bounty__/r4-validation/` and run `yarn workspace @canard/schema-form-ajv7-plugin test --run --config src/__bounty__/r4-validation/vitest.config.ts src/__bounty__/r4-validation/`. Through that config the folder runs 14 tests, of which the same 6 fail.
  - Items 2 and 4 are reproduced in the `@canard/schema-form-ajv8-plugin` folder (`bug-bounty/round-4/probes/canard-schema-form-ajv8-plugin/r4-validation/`), which imports this plugin's source and its AJV 7.2.4 copy by relative path; its document gives the command.
  - Failing tests that are not findings: none.
  - Control tests that pass:
    - `concurrentCalls.test.ts`: "[control] one call at a time reports the invalid value", and "a valid call that overlaps an invalid one does not receive its issues", which shows that only the earlier call of an invalid value is exposed.
    - `lateSchema.test.ts`: "[control] with 1 earlier root the later root resolves the added schema" and "[control] a guard compiled first after the schema was added resolves it".
    - `twoPluginCopies.test.ts`: both "[control]" tests with one evaluated copy.
    - `sourceControl.test.ts`: both tests, which show that `@canard/schema-form` and `@winglet/common-utils/filter` resolve to their `src` modules.
  - Verification limits:
    - The folder's `vitest.config.ts` adds the `source` export condition first and the internal `@/<name>` aliases, so workspace packages resolve to `src`; every built `dist` of this round is stale. The plugin source imports `@canard/schema-form` only for types, so the main session's earlier run with the default config loaded no stale runtime code either.
    - The form-level symptom of item 1 is recorded in [canard-schema-form](canard-schema-form.md) through an internal fixture.
- From `r4-contracts`:
  - Probe folder in the working tree: `packages/canard/schema-form-ajv7-plugin/src/__bounty__/r4-contracts/`; the round copy is `bug-bounty/round-4/probes/canard-schema-form-ajv7-plugin/r4-contracts/`.
  - To run the copy: copy it back to `packages/canard/schema-form-ajv7-plugin/src/__bounty__/r4-contracts/` and run `yarn workspace @canard/schema-form-ajv7-plugin test --run src/__bounty__/r4-contracts/es2020Environment.test.ts`. No probe-local configuration is needed.
  - The main session ran 2 tests: 1 fails, which reproduces item 6, and 1 control passes.
  - Failing tests that are not findings: none.
  - Control tests that pass: "control: the entry loads where the ES2021 globals exist".
  - Verification limits: the plugin source imports only types from `@canard/schema-form`, so the run loads no workspace `dist`. The globals are emulated with `vi.stubGlobal`; no real Safari 14.0 was used.

Root-cause files: `packages/canard/schema-form-ajv7-plugin/src/validator/`

## 1. When a compiled validator is called again before an earlier call settles, the earlier call reads the later call's errors, so an invalid value can be reported as valid.

- Severity: high. Failure is reported as success, for every root. Two forms that share one schema object and the plugin's validator share one compiled function, so a page that validates or submits several such forms together with `Promise.all` lets an invalid form pass and clears its field errors, so a save that trusts the verdict sends invalid data.
- Affected public API: `plugin.validator.compile`, `createValidator(ajv).compile` and `createValidatorFactory`; through them `FormHandle.validate()`, `FormHandle.submit()` and `node.validate()`.
- Contract violated:
  - `documents/docs/canard/schema-form/validation.mdx:52`: the compiled function returns the ordered issues of the value it receives.
  - `packages/canard/schema-form/src/core/engine/validation/DETAIL.md:27`: an explicit caller waits for the verdict of the value at call time.
  - `packages/canard/schema-form/src/core/engine/validation/DETAIL.md:105` (VALIDATE-048): forms that use the same validator and root object share the compiled result, so the shared function must not mix their verdicts.
  - The round 3 known limit that no contract covers sharing one AJV instance across threads (`../round-3/FIXES.md`, section "알려진 한계") does not apply: these calls overlap on one thread.
- Root cause: `packages/canard/schema-form-ajv7-plugin/src/validator/createValidatorFactory.ts:18-19` awaits the boolean that AJV's synchronous function returns and only then reads the shared `validate.errors` property. A second call that starts before that continuation runs overwrites `validate.errors`. The plugin compiles a synchronous function for every root, because the transient (lines 10 to 12) carries no `$async`, and a root with `$id` uses its registered synchronous copy through `getSchema(key)`.
- Relation to earlier rounds: Same class as round 3 cross-package class 22 (composed operations that differ from the same calls made one by one) and class 23 (one identifier, here the function's `errors` slot, shared by every form that shares the compiled root), see `../round-3/README.md`. The same defect for roots with `$id` is [canard-schema-form-ajv6-plugin item 1](canard-schema-form-ajv6-plugin.md); the AJV 8 plugin always validates through an `$async` function and is not affected.
- Reopens an earlier fix: No. `git log -L 16,20` on the root-cause file lists `d89b8d7fa`, a performance change that passes a memoized `not.required` key to `transformErrors`, and `2d7d72d82` and `3cc2316a1`; none is a bug bounty fix.
- Reproduction: `concurrentCalls.test.ts`.
  - "two overlapping calls each report the verdict of their own value": the actual result is `[[], []]`; the expected result is `[['minLength /name'], []]`.
  - "two overlapping calls on a root with $id each report their own verdict": the same actual and expected results.
  - The control with one call at a time passes. The form-level symptom is in [canard-schema-form](canard-schema-form.md) (`sharedValidatorOverlap.test.ts`).
- Confidence: high. Verification level: source through a probe-local config, public plugin API.

## 2. The default instance rejects exact decimal multiples, such as 19.99 against `multipleOf: 0.01` and 0.3 against `multipleOf: 0.1`.

- Severity: high. Valid data is rejected in common usage, such as a price field, and the form cannot be submitted. The core's number input uses `multipleOf` as its step (`packages/canard/schema-form/src/fieldInputs/fieldInputDefinitions/FieldInputNumber/FieldInputNumber.tsx:35`), so the validator rejects values the input itself produces.
- Affected public API: `plugin.validator` with its default instance, and form validation that uses it.
- Contract violated:
  - JSON Schema Validation, section 6.2.1 ([https://json-schema.org/draft/2020-12/json-schema-validation#section-6.2.1](https://json-schema.org/draft/2020-12/json-schema-validation#section-6.2.1); the same clause is section 6.2.1 of Draft-07): a number is valid when its division by `multipleOf` is an integer.
  - `documents/docs/canard/schema-form/schema-reference.mdx:245`: `multipleOf` supplies the step of the number inputs. [Round 3](../round-3/canard-schema-form-antd5-plugin.md), "Hypotheses checked and not bugs", records that stepping from 0.2 with `multipleOf: 0.1` stores exactly 0.3.
- Root cause: `packages/canard/schema-form-ajv7-plugin/src/validator/validatorPlugin.ts:28-32` sets no `multipleOfPrecision`, and AJV 7 compares the binary floating-point quotient with `parseInt` (`packages/canard/schema-form-ajv7-plugin/node_modules/ajv/dist/vocabularies/validation/multipleOf.js:21`): `19.99 / 0.01` is `1998.9999999999998`.
- Relation to earlier rounds: New class (numeric precision of a standard keyword). The same default is [canard-schema-form-ajv6-plugin item 3](canard-schema-form-ajv6-plugin.md) and [canard-schema-form-ajv8-plugin item 1](canard-schema-form-ajv8-plugin.md).
- Reopens an earlier fix: No. `git log -L 28,32` lists only `3cc2316a1`.
- Reproduction: `decimalMultipleOf.test.ts` in the `@canard/schema-form-ajv8-plugin` folder, describe "ajv7 default plugin and decimal multipleOf", test "accepts %j, whose values are exact multiples" for `{ price: 19.99, rating: 0.3 }`, `{ price: 0.07, rating: 0.7 }` and `{ price: 4.35, rating: 2.3 }`. The actual result is `['multipleOf /price', 'multipleOf /rating']`; the expected result is `[]`. The controls "[control] 1.1 and 2.5 are accepted" and "[control] rejects 19.995 for multipleOf 0.01" pass.
- Confidence: high for the behavior; medium for whether the owner treats AJV's floating-point division as accepted behavior. Verification level: source through a probe-local config, public plugin API.

## 3. A schema that the application adds to the bound instance after earlier compiles cannot be resolved by later roots once 64 roots without `$id` were compiled, nor by a root's guards after its first guard compile.

- Severity: medium. In less common but plausible usage, such as a lazily loaded module that registers shared definitions after the first forms mounted, a later form fails to compile with `can't resolve reference`, so it is not validated, and a later `if` that `$ref`s the definitions turns both its branches off with `GuardFailed`.
- Affected public API: `createValidator(ajv)`, `plugin.validator.bind`, `compile`, `compileGuard`.
- Contract violated:
  - `packages/canard/schema-form-ajv7-plugin/CLAUDE.md:47`: sibling instances preserve the bound instance's consumer schemas.
  - `documents/docs/canard/schema-form/validation.mdx:60`: referenced schemas may be provided in the bound instance.
  - The round 3 specification table (`../round-3/FIXES.md`, section "스펙표"): settings added to the user's AJV instance apply to later compiles.
- Root cause: `packages/canard/schema-form-ajv7-plugin/src/validator/utils/cloneInstance.ts:31-33` copies the bound instance's schemas once, when the clone is made, while lines 27 to 30 keep formats and keyword rules live. The shared compiler for roots without `$id` is replaced by such a clone after every 64 roots (`packages/canard/schema-form-ajv7-plugin/src/validator/utils/registerSchemaRoot.ts:73`), and each root's guard clone is made at its first guard compile (`packages/canard/schema-form-ajv7-plugin/src/validator/createGuardCompiler.ts:56` and `packages/canard/schema-form-ajv7-plugin/src/validator/utils/registerSchemaGuard.ts:20`).
- Relation to earlier rounds: Same class as round 3 cross-package class 21 (a fix that left a case out); the schema-registry sibling of [round 3 item 1](../round-3/canard-schema-form-ajv7-plugin.md). The same defect is [canard-schema-form-ajv6-plugin item 4](canard-schema-form-ajv6-plugin.md) (guards only) and [canard-schema-form-ajv8-plugin item 2](canard-schema-form-ajv8-plugin.md).
- Reopens an earlier fix: Yes, [round 3 item 1](../round-3/canard-schema-form-ajv7-plugin.md), fix commit `d12ca25cc`, which made formats and keyword rules live but left the schema copy as a snapshot. The cases it fixed still pass.
- Reproduction: `lateSchema.test.ts`.
  - "with 65 earlier roots the later root resolves the added schema the same way": the actual result is `compile threw: can't resolve reference https://example.com/defs.json#/definitions/code from id #`; the expected result is `['pattern']`.
  - "a guard compiled after the schema was added resolves it like whole validation of the same root": the actual guard result is `compileGuard threw: can't resolve reference https://example.com/defs.json#/definitions/code from id #`, while whole validation reports `[['minLength', '/b'], ['if', '/b']]`; the expected guard verdict is `true`.
  - Both controls pass.
- Confidence: high. Verification level: source through a probe-local config, public plugin API.

## 4. A schema with an asynchronous keyword fails to compile with `async keyword in sync schema` for every root, while the AJV 8 plugin validates it.

- Severity: medium. A form whose schema uses an asynchronous keyword, such as a server-side availability check, has no validation at all (`VALIDATOR_COMPILE_FAILED`) unless the author writes `$async: true` into the schema, which neither the plugin's README nor the core documents ask for; the AJV 6 plugin (for roots without `$id`) and the AJV 8 plugin add it themselves.
- Affected public API: `plugin.validator.compile`, `createValidator(ajv).compile`, `createValidatorFactory`.
- Contract violated:
  - `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/validation-ux.md:89`: whole-schema validation may be asynchronous.
  - `documents/docs/canard/schema-form/validation.mdx:86`: the AJV 7 factory normalizes asynchronous results to issues or null.
  - Predictability across the three AJV plugins for the same schema and data.
- Root cause: `packages/canard/schema-form-ajv7-plugin/src/validator/createValidatorFactory.ts:10-12` compiles a plain clone without `$async: true`. The published 0.16 factory compiled `{ ...jsonSchema, $async: true }`; the engine rewrite `2d7d72d82` dropped the wrapper, and no changeset announces the change.
- Relation to earlier rounds: New class (angle `EQ11`, sibling plugins that differ on one input). The AJV 6 plugin fails the same way for roots with `$id`: [canard-schema-form-ajv6-plugin item 6](canard-schema-form-ajv6-plugin.md).
- Reopens an earlier fix: No. The wrapper was removed by `2d7d72d82`, not by a bug bounty fix.
- Reproduction: `asyncKeywordParity.test.ts` in the `@canard/schema-form-ajv8-plugin` folder, describe "ajv7 asynchronous keyword in whole validation", tests "root without $id reports the keyword issue" and "root with $id reports the same keyword issue". The actual result is `threw: async keyword in sync schema`; the expected result is `['availableName /name']`. The control with an explicit `$async: true` passes.
- Confidence: high. Verification level: source through a probe-local config, public plugin API.

## 5. Two evaluated copies of the plugin that share one AJV instance collide on registration keys and do not see each other's `$id` registrations.

- Severity: low. It needs two copies of the plugin, such as its ESM and CommonJS builds in one Node process or two bundles, and the same AJV instance passed to both. The second copy's first root with `$id` fails to compile with `schema with key or id "urn:canard:schema-form:ajv7:1" already exists`, and two live roots with the same `$id` are not isolated.
- Affected public API: `createValidator(ajv)` and `plugin.validator.bind` used from two copies with one instance.
- Contract violated: `documents/docs/canard/schema-form/validation.mdx:84` (independent adapters can share one non-modifying AJV instance) and VALIDATE-046 (`packages/canard/schema-form/src/core/engine/validation/DETAIL.md:95`: different live roots with the same `$id` stay isolated).
- Root cause: the registration key counter is module state (`packages/canard/schema-form-ajv7-plugin/src/validator/utils/registerSchemaRoot.ts:43`, used at line 79), so each copy starts again at 1; the per-instance list of `$id` registrations is a module-level `WeakMap` (`packages/canard/schema-form-ajv7-plugin/src/validator/utils/instanceIdRegistrationsOf.ts:7`), so one copy does not see the other copy's ids.
- Relation to earlier rounds: Same class as round 3 cross-package classes 23 and 29 and round 2 class 5 (more than one copy of a package). The same defect is [canard-schema-form-ajv6-plugin item 7](canard-schema-form-ajv6-plugin.md) and [canard-schema-form-ajv8-plugin item 3](canard-schema-form-ajv8-plugin.md).
- Reopens an earlier fix: No.
- Reproduction: `twoPluginCopies.test.ts`, where `vi.resetModules()` re-evaluates the source as a second copy.
  - "two copies compile two roots with different $id": the second result is `compile threw: schema with key or id "urn:canard:schema-form:ajv7:1" already exists`; the expected result is `['type /y']`.
  - "two copies keep two live roots with the same $id isolated (VALIDATE-046)": the second result is `compile threw: schema with key or id "https://example.com/a.json" already exists`; the expected result is `['type /z']`.
  - Both controls with one copy pass.
- Confidence: high for the mechanism; low for how often the layout occurs. Verification level: source through a probe-local config, with a re-evaluated module standing in for a second copy.

## 6. `@canard/schema-form-ajv7-plugin` throws at import time in Safari 14.0, which its README lists as supported, because the module creates a `FinalizationRegistry` while it loads.

- Severity: low. The environment is rare today, but the failure is total: the import fails, so an application that loads the plugin at start-up does not start. `WeakRef` and `FinalizationRegistry` belong to ECMAScript 2021 and shipped in Safari 14.1 ([tc39/proposal-weakrefs](https://github.com/tc39/proposal-weakrefs)), so Safari 14.0 and iOS Safari 14.0 to 14.4 lack them.
- Affected public API: the entry of `@canard/schema-form-ajv7-plugin`.
- Contract violated: `packages/canard/schema-form-ajv7-plugin/README.md:168` lists "Modern browsers (Chrome 91+, Firefox 90+, Safari 14+)", and `packages/canard/schema-form-ajv7-plugin/README.md:163` says the package is built with ECMAScript 2020 syntax.
- Root cause: `packages/canard/schema-form-ajv7-plugin/src/validator/validatorPlugin.ts:53` calls `new FinalizationRegistry(...)` at module level. The shared build lowers syntax to ES2020 (`TRANSFORM_TARGET` at `packages/aileron/script/build/utils/getCodegenOptions.mjs:32`), which cannot supply ES2021 globals.
- Relation to earlier rounds: New class: a run-time API newer than the documented environment. The same cause exists in the ajv6 and ajv8 plugins ([canard-schema-form-ajv6-plugin item 9](canard-schema-form-ajv6-plugin.md), [canard-schema-form-ajv8-plugin item 4](canard-schema-form-ajv8-plugin.md)).
- Reopens an earlier fix: No. `git log -L` on `validatorPlugin.ts:53` shows only `2d7d72d82`, a feature commit, and no bug bounty fix.
- Reproduction: `packages/canard/schema-form-ajv7-plugin/src/__bounty__/r4-contracts/es2020Environment.test.ts`, "the entry loads in an ES2020 host without WeakRef and FinalizationRegistry (README: Safari 14+)". The probe sets both globals to `undefined` and imports the source entry again. Actual: "threw TypeError: FinalizationRegistry is not a constructor". Expected: "loaded". In Safari 14.0, where the name is not defined at all, the error would be a `ReferenceError`. The control "control: the entry loads where the ES2021 globals exist" passes.
- Confidence: high for the mechanism and medium for the environment claim; the source public entry with the globals emulated, not run in a real browser.

## Hypotheses checked and not bugs

- From `r4-validation`:
  - On 32 Draft-07 schema and data pairs, this plugin's keyword, `dataPath` and `rejectedKey` equal those of the AJV 6 and AJV 8 plugins, with and without a root `$id` (`pluginParity.test.ts` in the `@canard/schema-form-ajv8-plugin` folder).
  - The README example "Enabling a declared Draft-06 schema", fixed by round 3 item 2, runs as written and reports `exclusiveMaximum` (`readmeDraft06.test.ts` in the same folder).
  - A schema that declares `$async: true` itself validates an asynchronous keyword, with and without `$id`.
- From `r4-contracts`: the ajv7 plugin's `registerSchemaRoot.ts` carries the same `/// <reference lib="es2021.weakref" />` as the ajv8 plugin, but the ajv7 public declarations (`dist/index.d.ts` and `dist/validator/validatorPlugin.d.ts`) do not import the files that use `WeakRef`, so the dropped directive of [canard-schema-form-ajv8-plugin item 5](canard-schema-form-ajv8-plugin.md) does not reach an ajv7 consumer.
