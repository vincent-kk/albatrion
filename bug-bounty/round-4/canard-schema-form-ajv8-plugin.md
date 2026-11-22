# @canard/schema-form-ajv8-plugin: bug bounty round 4

This round confirmed 5 new findings in `@canard/schema-form-ajv8-plugin`: 1 high, 1 medium and 3 low. Items in the earlier round documents ([round 1](../round-1/canard-schema-form-ajv8-plugin.md), [round 2](../round-2/canard-schema-form-ajv8-plugin.md), [round 3](../round-3/canard-schema-form-ajv8-plugin.md)) were treated as fixed and excluded. The main session re-ran every probe, through the folder's probe-local configuration where it has one: this package's `r4-validation` folder ran 101 tests, of which 16 fail; 7 of them belong to the items below, and the other 9 are the AJV 6 and AJV 7 rows of items owned by those plugins' documents; its `r4-contracts` folder ran 4 tests, of which 3 fail. Verification limits are listed under the probes.

Probes: [probes/canard-schema-form-ajv8-plugin/](probes/canard-schema-form-ajv8-plugin/)

- From `r4-validation`:
  - Probe folder in the working tree: `packages/canard/schema-form-ajv8-plugin/src/__bounty__/r4-validation/`; the round copy is `bug-bounty/round-4/probes/canard-schema-form-ajv8-plugin/r4-validation/`.
  - To run the copy: copy it back to `packages/canard/schema-form-ajv8-plugin/src/__bounty__/r4-validation/` and run `yarn workspace @canard/schema-form-ajv8-plugin test --run --config src/__bounty__/r4-validation/vitest.config.ts src/__bounty__/r4-validation/`. Through that config the folder runs 101 tests, of which the same 16 fail.
  - The cross-plugin probes (`decimalMultipleOf.test.ts`, `asyncKeywordParity.test.ts`, `pluginParity.test.ts`, `readmeDraft06.test.ts`) import the AJV 6 and AJV 7 plugin sources by relative path, and those sources resolve their own AJV copies (6.12.6 and 7.2.4) from their package folders.
  - Failing tests that belong to other packages' items:
    - `decimalMultipleOf.test.ts`: the three "accepts %j, whose values are exact multiples" rows under "ajv6 default plugin and decimal multipleOf" ([canard-schema-form-ajv6-plugin item 3](canard-schema-form-ajv6-plugin.md)) and under "ajv7 default plugin and decimal multipleOf" ([canard-schema-form-ajv7-plugin item 2](canard-schema-form-ajv7-plugin.md)).
    - `asyncKeywordParity.test.ts`: "root with $id reports the same keyword issue" under "ajv6 asynchronous keyword in whole validation" ([canard-schema-form-ajv6-plugin item 6](canard-schema-form-ajv6-plugin.md)), and both tests without "[control]" under "ajv7 asynchronous keyword in whole validation" ([canard-schema-form-ajv7-plugin item 4](canard-schema-form-ajv7-plugin.md)).
  - Failing tests that are not findings: none.
  - Control tests that pass:
    - `decimalMultipleOf.test.ts`: "[control] 1.1 and 2.5 are accepted" and "[control] rejects 19.995 for multipleOf 0.01" for each plugin, and "[control] an instance configured with multipleOfPrecision accepts 19.99 and 0.3".
    - `asyncKeywordParity.test.ts`: "[control] a root that declares $async: true itself reports the keyword issue, with and without $id" for each plugin, and both AJV 8 tests.
    - `lateSchema.test.ts`: "[control] with 1 earlier root the later root resolves the added schema" and "[control] a guard compiled first after the schema was added resolves it".
    - `twoPluginCopies.test.ts`: both "[control]" tests with one evaluated copy.
    - `pluginParity.test.ts`: all 63 tests. `readmeDraft06.test.ts`: all 3 tests.
    - `sourceControl.test.ts`: both tests, which show that `@canard/schema-form` and `@winglet/common-utils/filter` resolve to their `src` modules.
  - Verification limits:
    - The folder's `vitest.config.ts` adds the `source` export condition first and the internal `@/<name>` aliases, so workspace packages resolve to `src`; every built `dist` of this round is stale. The plugin sources import `@canard/schema-form` only for types, so the main session's earlier run with the default config loaded no stale runtime code either.
    - Item 1 was probed through the `default` entry only. The `2019` and `2020` entries carry the same settings without `multipleOfPrecision`, which is a static check.
- From `r4-contracts`:
  - Probe folder in the working tree: `packages/canard/schema-form-ajv8-plugin/src/__bounty__/r4-contracts/`; the round copy is `bug-bounty/round-4/probes/canard-schema-form-ajv8-plugin/r4-contracts/`.
  - To run the copy: copy it back to `packages/canard/schema-form-ajv8-plugin/src/__bounty__/r4-contracts/` and run `yarn workspace @canard/schema-form-ajv8-plugin test --run src/__bounty__/r4-contracts/es2020Environment.test.ts`. No probe-local configuration is needed.
  - The main session ran 4 tests: 3 fail and 1 control passes. The default and 2020 entry tests reproduce item 4, and the emitted declaration test reproduces item 5.
  - Failing tests that are not findings: none.
  - Control tests that pass: "control: the default entry loads where the ES2021 globals exist".
  - Verification limits: the plugin source imports only types from `@canard/schema-form`, so the import tests load no workspace `dist`. The globals are emulated with `vi.stubGlobal`; no real Safari 14.0 was used. The declaration test emits one file in memory and builds nothing.

Root-cause files: `packages/canard/schema-form-ajv8-plugin/src/`

## 1. The default instance rejects exact decimal multiples, such as 19.99 against `multipleOf: 0.01` and 0.3 against `multipleOf: 0.1`.

- Severity: high. Valid data is rejected in common usage, such as a price field, and the form cannot be submitted. The core's number input uses `multipleOf` as its step (`packages/canard/schema-form/src/fieldInputs/fieldInputDefinitions/FieldInputNumber/FieldInputNumber.tsx:35`), so the validator rejects values the input itself produces.
- Affected public API: `plugin.validator` of the `default`, `2019` and `2020` entries with their default instances, and form validation that uses them.
- Contract violated:
  - JSON Schema Validation, section 6.2.1 ([https://json-schema.org/draft/2020-12/json-schema-validation#section-6.2.1](https://json-schema.org/draft/2020-12/json-schema-validation#section-6.2.1)): a number is valid when its division by `multipleOf` is an integer.
  - `documents/docs/canard/schema-form/schema-reference.mdx:245`: `multipleOf` supplies the step of the number inputs. [Round 3](../round-3/canard-schema-form-antd5-plugin.md), "Hypotheses checked and not bugs", records that stepping from 0.2 with `multipleOf: 0.1` stores exactly 0.3.
- Root cause: `packages/canard/schema-form-ajv8-plugin/src/default/validatorPlugin.ts:26-32`, `packages/canard/schema-form-ajv8-plugin/src/2019/validatorPlugin.ts:31-37` and `packages/canard/schema-form-ajv8-plugin/src/2020/validatorPlugin.ts:31-37` set no `multipleOfPrecision`, and AJV 8 compares the binary floating-point quotient with `parseInt` (`node_modules/ajv/dist/vocabularies/validation/multipleOf.js:21`, AJV 8.17.1): `19.99 / 0.01` is `1998.9999999999998`. The same comparison also rejects `1e21` against `multipleOf: 1`, an input too large to count separately.
- Relation to earlier rounds: New class (numeric precision of a standard keyword). The same default in the other plugins is [canard-schema-form-ajv6-plugin item 3](canard-schema-form-ajv6-plugin.md) and [canard-schema-form-ajv7-plugin item 2](canard-schema-form-ajv7-plugin.md); each plugin owns its own settings line.
- Reopens an earlier fix: No. `git log -L 26,32` on the default entry lists `d98badc3a` from [round 2 item 2](../round-2/canard-schema-form-ajv8-plugin.md), which turned off strict-mode warnings and did not touch numeric precision.
- Reproduction: `decimalMultipleOf.test.ts`, describe "ajv8 default plugin and decimal multipleOf", test "accepts %j, whose values are exact multiples" for `{ price: 19.99, rating: 0.3 }`, `{ price: 0.07, rating: 0.7 }` and `{ price: 4.35, rating: 2.3 }`. The actual result is `['multipleOf /price', 'multipleOf /rating']`; the expected result is `[]`. Both controls pass, and "[control] an instance configured with multipleOfPrecision accepts 19.99 and 0.3" shows the setting that removes the failure.
- Confidence: high for the behavior; medium for whether the owner treats AJV's floating-point division as accepted behavior. Verification level: source through a probe-local config, public plugin API.

## 2. A schema that the application adds to the bound instance after earlier compiles cannot be resolved by later roots once 64 roots without `$id` were compiled, nor by a root's guards after its first guard compile.

- Severity: medium. In less common but plausible usage, such as a lazily loaded module that registers shared definitions after the first forms mounted, a later form fails to compile with `can't resolve reference`, so it is not validated, and a later `if` that `$ref`s the definitions turns both its branches off with `GuardFailed`.
- Affected public API: `createValidator(ajv)`, `plugin.validator.bind`, `compile`, `compileGuard`.
- Contract violated:
  - `packages/canard/schema-form-ajv8-plugin/CLAUDE.md:47`: sibling instances preserve the bound instance's consumer schemas.
  - `documents/docs/canard/schema-form/validation.mdx:60`: referenced schemas may be provided in the bound instance.
  - The round 3 specification table (`../round-3/FIXES.md`, section "스펙표"): settings added to the user's AJV instance apply to later compiles.
- Root cause: `packages/canard/schema-form-ajv8-plugin/src/validator/utils/makeSibling.ts:30-32` copies the bound instance's schemas once, when the sibling is made, while lines 26 to 29 keep formats and keyword rules live. The shared compiler for roots without `$id` is replaced by such a sibling after every 64 roots (`packages/canard/schema-form-ajv8-plugin/src/validator/utils/registerSchemaRoot.ts:81-82`), and each root's guard sibling is made at its first guard compile (`packages/canard/schema-form-ajv8-plugin/src/validator/createGuardCompiler.ts:53` and `packages/canard/schema-form-ajv8-plugin/src/validator/utils/registerSchemaGuard.ts:22`).
- Relation to earlier rounds: Same class as round 3 cross-package class 21 (a fix that left a case out); the schema-registry sibling of [round 3 item 1](../round-3/canard-schema-form-ajv8-plugin.md). The same defect is [canard-schema-form-ajv6-plugin item 4](canard-schema-form-ajv6-plugin.md) (guards only) and [canard-schema-form-ajv7-plugin item 3](canard-schema-form-ajv7-plugin.md).
- Reopens an earlier fix: Yes, [round 3 item 1](../round-3/canard-schema-form-ajv8-plugin.md), fix commit `76b756d2b`, which made formats and keyword rules live but left the schema copy as a snapshot. The cases it fixed still pass.
- Reproduction: `lateSchema.test.ts`.
  - "with 65 earlier roots the later root resolves the added schema the same way": the actual result is `compile threw: can't resolve reference https://example.com/defs.json#/definitions/code from id #`; the expected result is `['pattern']`.
  - "a guard compiled after the schema was added resolves it like whole validation of the same root": the actual guard result is `compileGuard threw: can't resolve reference https://example.com/defs.json#/definitions/code from id https://canard.invalid/ajv8/root/69`, while whole validation reports `[['minLength', '/b'], ['if', '/b']]`; the expected guard verdict is `true`.
  - Both controls pass.
- Confidence: high. Verification level: source through a probe-local config, public plugin API.

## 3. Two evaluated copies of the plugin that share one AJV instance collide on registration keys and do not see each other's `$id` registrations.

- Severity: low. It needs two copies of the plugin, such as its ESM and CommonJS builds in one Node process or two bundles, and the same AJV instance passed to both. The second copy's first root with `$id` fails to compile with `schema with key or id "https://canard.invalid/ajv8/root/1" already exists`, and two live roots with the same `$id` are not isolated.
- Affected public API: `createValidator(ajv)` and `plugin.validator.bind` used from two copies with one instance.
- Contract violated: `documents/docs/canard/schema-form/validation.mdx:84` (independent adapters can share one non-modifying AJV instance) and VALIDATE-046 (`packages/canard/schema-form/src/core/engine/validation/DETAIL.md:95`: different live roots with the same `$id` stay isolated).
- Root cause: the registration key counter is module state (`packages/canard/schema-form-ajv8-plugin/src/validator/utils/registerSchemaRoot.ts:48`, used at line 88), so each copy starts again at 1; the per-instance list of `$id` registrations is a module-level `WeakMap` (`packages/canard/schema-form-ajv8-plugin/src/validator/utils/instanceIdRegistrationsOf.ts:7`), so one copy does not see the other copy's ids.
- Relation to earlier rounds: Same class as round 3 cross-package classes 23 and 29 and round 2 class 5 (more than one copy of a package). The same defect is [canard-schema-form-ajv6-plugin item 7](canard-schema-form-ajv6-plugin.md) and [canard-schema-form-ajv7-plugin item 5](canard-schema-form-ajv7-plugin.md).
- Reopens an earlier fix: No. `git log -L` on the counter and the map lists only `c5c7c453b` and `2d7d72d82`, neither a bug bounty fix.
- Reproduction: `twoPluginCopies.test.ts`, where `vi.resetModules()` re-evaluates the source as a second copy.
  - "two copies compile two roots with different $id": the second result is `compile threw: schema with key or id "https://canard.invalid/ajv8/root/1" already exists`; the expected result is `['type /y']`.
  - "two copies keep two live roots with the same $id isolated (VALIDATE-046)": the second result is `compile threw: schema with key or id "https://example.com/a.json" already exists`; the expected result is `['type /z']`.
  - Both controls with one copy pass.
- Confidence: high for the mechanism; low for how often the layout occurs. Verification level: source through a probe-local config, with a re-evaluated module standing in for a second copy.

## 4. `@canard/schema-form-ajv8-plugin` throws at import time in Safari 14.0, which its README lists as supported, because each entry creates a `FinalizationRegistry` while it loads.

- Severity: low. The environment is rare today, but the failure is total: the import fails, so an application that loads the plugin at start-up does not start. `WeakRef` and `FinalizationRegistry` belong to ECMAScript 2021 and shipped in Safari 14.1 ([tc39/proposal-weakrefs](https://github.com/tc39/proposal-weakrefs)), so Safari 14.0 and iOS Safari 14.0 to 14.4 lack them.
- Affected public API: the `.`, `./2019` and `./2020` entries of `@canard/schema-form-ajv8-plugin`.
- Contract violated: `packages/canard/schema-form-ajv8-plugin/README.md:222` lists "Modern browsers (Chrome 91+, Firefox 90+, Safari 14+)", and `packages/canard/schema-form-ajv8-plugin/README.md:217` says the package is built with ECMAScript 2020 syntax.
- Root cause: `createSchemaRootRegistry` calls `new FinalizationRegistry(...)` (`packages/canard/schema-form-ajv8-plugin/src/validator/utils/createSchemaRootRegistry.ts:8`), and each entry calls it at module level: `packages/canard/schema-form-ajv8-plugin/src/default/validatorPlugin.ts:49`, `packages/canard/schema-form-ajv8-plugin/src/2019/validatorPlugin.ts:54` and `packages/canard/schema-form-ajv8-plugin/src/2020/validatorPlugin.ts:54`. The shared build lowers syntax to ES2020 (`TRANSFORM_TARGET` at `packages/aileron/script/build/utils/getCodegenOptions.mjs:32`), which cannot supply ES2021 globals.
- Relation to earlier rounds: New class: a run-time API newer than the documented environment. The same cause exists in the ajv6 and ajv7 plugins ([canard-schema-form-ajv6-plugin item 9](canard-schema-form-ajv6-plugin.md), [canard-schema-form-ajv7-plugin item 6](canard-schema-form-ajv7-plugin.md)).
- Reopens an earlier fix: No. `git log -L` on `createSchemaRootRegistry.ts:1-12` shows `2d7d72d82` and `c5c7c453b`, both feature commits, and no bug bounty fix.
- Reproduction: `packages/canard/schema-form-ajv8-plugin/src/__bounty__/r4-contracts/es2020Environment.test.ts`. The probe sets both globals to `undefined` and imports the source entry again.
  - "the default entry loads in an ES2020 host without WeakRef and FinalizationRegistry (README: Safari 14+)": actual "threw TypeError: FinalizationRegistry is not a constructor"; expected "loaded".
  - "the 2020 entry loads in an ES2020 host without WeakRef and FinalizationRegistry": the same.
  - In Safari 14.0, where the name is not defined at all, the error would be a `ReferenceError`. The control "control: the default entry loads where the ES2021 globals exist" passes. The `./2019` entry was not run; it has the same module-level call.
- Confidence: high for the mechanism and medium for the environment claim; the source public entries with the globals emulated, not run in a real browser.

## 5. The emitted declarations of `@canard/schema-form-ajv8-plugin` drop the `/// <reference lib="es2021.weakref" />` that its source declares, so a consumer whose `lib` stops at ES2020 cannot resolve `WeakRef` and `FinalizationRegistry` in them.

- Severity: low. A consumer whose `lib` is ES2020 plus DOM, which matches the README's ES2020 statement and this repository's own base setting (`tsconfig.base.json`), gets error TS2304 for `WeakRef` and `FinalizationRegistry` inside the plugin's declarations with `skipLibCheck: false`; with `skipLibCheck: true` the two types silently fail to resolve. This consequence follows from TypeScript's rules and was not run as a consumer check.
- Affected public API: the `.`, `./2019` and `./2020` entries of `@canard/schema-form-ajv8-plugin`. Each entry's declaration imports `createValidatorFactory`, whose declaration imports `SchemaRootRegistry` from `validator/utils/registerSchemaRoot`, which uses `WeakRef` and `FinalizationRegistry`.
- Contract violated: the source states the dependency explicitly at `packages/canard/schema-form-ajv8-plugin/src/validator/utils/registerSchemaRoot.ts:1` and `packages/canard/schema-form-ajv8-plugin/src/validator/utils/instanceIdRegistrationsOf.ts:1`, and the published declarations must carry it for consumers on the documented ES2020 baseline (`packages/canard/schema-form-ajv8-plugin/README.md:217`).
- Root cause: TypeScript 5.5 and later keep a `/// <reference lib="…" />` directive in declaration output only when it carries `preserve="true"` ([TypeScript 5.5 release notes, "Simplified Reference Directive Declaration Emit"](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html)). The declaration step (`packages/aileron/script/build/buildTypes.mjs:35`, `tsc -p ${tsconfig}` with `./tsconfig.declarations.json` as the default at `:30`) therefore emits `registerSchemaRoot.d.ts` with `WeakRef<…>` and `FinalizationRegistry<…>` but without the directive.
- Relation to earlier rounds: Same class as [round 3 item 8](../round-3/winglet-common-utils.md), published declarations that need global types the consumer's environment may lack (round 3 class 30).
- Reopens an earlier fix: No. `git log -L` on `registerSchemaRoot.ts:1` shows only `2d7d72d82`, a feature commit, and no bug bounty fix.
- Reproduction: `packages/canard/schema-form-ajv8-plugin/src/__bounty__/r4-contracts/es2020Environment.test.ts`, "the emitted declaration keeps the es2021.weakref lib reference its source declares, so ES2020-lib consumers resolve WeakRef". The probe emits the declaration of `registerSchemaRoot.ts` in memory with the package's `tsconfig.declarations.json` and writes nothing. Actual: the emitted text contains `WeakRef<` but no `reference lib="es2021.weakref"`. Expected: the directive is present.
- Confidence: high; static only. The evidence is the in-memory emit of one source file, the source line, and the documented TypeScript 5.5 behavior. The working tree's stale `dist/validator/utils/registerSchemaRoot.d.ts`, emitted by the same declaration step from a source that already carried the directive, shows the same omission (`WeakRef` at line 27, no directive).

## Hypotheses checked and not bugs

- From `r4-validation`:
  - On 32 Draft-07 schema and data pairs (`required`, `additionalProperties`, `propertyNames`, `dependencies`, `if`/`then`, `contains`, tuples, `false` schemas, `not.required`, `-0` against `exclusiveMinimum`, `1.5` against `integer`, astral characters against `maxLength` and others), and on the 31 of them that can carry a root `$id`, the three plugins report the same keyword, `dataPath` and `rejectedKey` (`pluginParity.test.ts`).
  - The README example for a declared Draft-06 schema, fixed by [round 3 item 2](../round-3/canard-schema-form-ajv8-plugin.md), runs as written in each plugin (`readmeDraft06.test.ts`).
  - Two overlapping validations of one compiled root each receive their own verdict, because this plugin validates through an `$async` function whose errors travel in the rejection (`packages/canard/schema-form-ajv8-plugin/src/validator/createValidatorFactory.ts:22-23`); the AJV 8 control row of `sharedValidatorOverlap.test.ts` in [canard-schema-form](canard-schema-form.md) passes.
  - A schema with an asynchronous keyword validates with and without a root `$id` (`asyncKeywordParity.test.ts`).
