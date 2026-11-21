# @canard/schema-form-ajv6-plugin: bug bounty round 3

This round confirmed 3 new findings in `@canard/schema-form-ajv6-plugin`. Items in the earlier round documents ([round 1](../round-1/canard-schema-form-ajv6-plugin.md), [round 2](../round-2/canard-schema-form-ajv6-plugin.md)) were treated as fixed and excluded. The main session re-ran every probe. Verification limits are listed under the probes.

Probes: [probes/canard-schema-form-ajv6-plugin/](probes/canard-schema-form-ajv6-plugin/)

- From `r3-validation`:
  - Probe folder in the working tree: `packages/canard/schema-form-ajv6-plugin/src/__bounty__/r3-validation/`; the round copy is `bug-bounty/round-3/probes/canard-schema-form-ajv6-plugin/r3-validation/`.
  - To run the copy: copy it back to `packages/canard/schema-form-ajv6-plugin/src/__bounty__/r3-validation/` and run `yarn workspace @canard/schema-form-ajv6-plugin test --run src/__bounty__/r3-validation/`.
  - Failing tests that are not findings: none.
  - Control tests that pass: the `plain` rows of both parameterized tests in `dynamicKeyPath.test.ts`.
  - Verification limits: the plugin tests run the plugin source; `@canard/schema-form` resolves to its built `dist`, from which the plugin only reads types and error-code constants.
- From `r3-contracts`:
  - Probe folder in the working tree: `packages/canard/schema-form-ajv6-plugin/src/__bounty__/r3-contracts/`; the round copy is `bug-bounty/round-3/probes/canard-schema-form-ajv6-plugin/r3-contracts/`.
  - To run the copy: copy it back to `packages/canard/schema-form-ajv6-plugin/src/__bounty__/r3-contracts/` and run `yarn workspace @canard/schema-form-ajv6-plugin test --run src/__bounty__/r3-contracts/foreignAjvCopy.test.ts`.
  - Failing tests that are not findings: none.
  - Control tests that pass: "setup: the two ajv 6.12.6 copies are distinct modules" and "control: the plugin own ajv copy reports issues for invalid data".
  - Verification limits: the second ajv copy is the installed `node_modules/eslint/node_modules/ajv` (6.12.6), which stands in for an application workspace's own nested copy. The effect on a rendered `Form` (no field errors, a reported validator failure, a rejected `validate()`) is read from `packages/canard/schema-form/src/core/engine/write/utils/entry/dispatchValidate.ts:56-99`, not reproduced.

Root-cause files: `packages/canard/schema-form-ajv6-plugin/`

## 1. When the plugin is given an Ajv 6 instance created from another installed copy of the same ajv release, every invalid value rejects validation with an exception instead of returning issues.

- Severity: medium. An application that follows the README (`import Ajv from 'ajv'`, then `plugin.validator.bind(customAjv)`) in an npm or yarn monorepo that hoists ajv 8 to the root gets its own ajv 6 copy, different from the plugin's nested copy, which is the layout of this repository. Every validation failure then rejects with `ValidationError`, so the form shows no field errors and reports a validator failure instead.
- Affected public API: `plugin.validator.bind`, `createValidatorFactory`, `createValidator`.
- Contract violated: `packages/canard/schema-form-ajv6-plugin/README.md:35-48`, which binds a consumer-created Ajv instance, and equivalence with the sibling plugins, whose validators return issues for the same input because they classify thrown errors by shape (`packages/canard/schema-form-ajv7-plugin/src/validator/createValidatorFactory.ts:21`, `packages/canard/schema-form-ajv8-plugin/src/validator/createValidatorFactory.ts:35`).
- Root cause: `packages/canard/schema-form-ajv6-plugin/src/validator/createValidatorFactory.ts:36` tests `thrown instanceof Ajv.ValidationError` against the plugin's own ajv module, while the validator was compiled by an instance (or a `cloneInstance` copy built from its constructor) of the consumer's module, so the thrown error belongs to the consumer's class and is rethrown. `packages/canard/schema-form-ajv6-plugin/package.json:63` lists `ajv` only as a dependency, although the public API accepts consumer-created instances, so package managers keep the two copies apart.
- Relation to earlier rounds: Same class as round 2 class 5, more than one copy of a package; sibling of `../round-2/lerx-promise-modal.md` item 7 and `../round-2/canard-schema-form.md` item 7 (module identity across copies).
- Reopens an earlier fix: No. The `instanceof` test dates from the original plugin (#217); the round 1 commits on these lines changed only the path conversion arguments.
- Reproduction: `foreignAjvCopy.test.ts`. "createValidatorFactory reports issues, not a rejection, for an equal Ajv 6 release from another copy" and "plugin.validator.bind(customAjv), as the README shows, reports issues for invalid data": the actual result is `{ rejected: 'ValidationError: validation failed' }`, the expected result is one `type` issue at `/age`.
- Confidence: high for the mechanism and medium for how often the layout occurs; verified through the public API.

## 2. With the AJV 6 plugin, an issue under a dynamic property key that contains a single quote or a backslash gets a wrong `dataPath`, which can point at a different, valid field.

- Severity: low. Keys such as `O'Brien` or `C:\new` in an `additionalProperties` or `patternProperties` map are uncommon, but when they occur the issue's location is wrong and the form can show the error on an unrelated field.
- Affected public API: `plugin.validator.compile` and `createValidator` of `@canard/schema-form-ajv6-plugin`, `ValidationIssue.dataPath`, `node.errors`, `FormHandle.getErrors()`.
- Contract violated:
  - `packages/canard/schema-form/src/core/engine/validation/types/issue.ts:5` defines `dataPath` as the location of the rejected value.
  - The AJV 7 and AJV 8 plugins report `/it's/x` for the same input, so the three validator plugins disagree on equivalent input.
  - `packages/canard/schema-form-ajv6-plugin/CLAUDE.md` states that the plugin converts AJV 6 paths to JSON Pointers.
- Root cause:
  - `packages/canard/schema-form-ajv6-plugin/src/validator/utils/dataPath/toJSONPointer.ts:4` (the `PATH_SEGMENTS` pattern) and lines 46 to 50 (the `QUOTED_ESCAPE` decoding) assume that AJV 6 escapes `'` and `\` inside a quoted bracket segment.
  - AJV 6.12.6 escapes only static `properties` keys. Dynamic keys go through `getPathExpr` (`packages/canard/schema-form-ajv6-plugin/node_modules/ajv/lib/compile/util.js:163`, used at `packages/canard/schema-form-ajv6-plugin/node_modules/ajv/lib/dotjs/properties.js:141`, `:157` and `:305`), which writes `['<key>']` without escaping.
  - As a result, `"it's"` matches no segment and becomes `''`, an issue at `"it's"` then `x` becomes `/x`, `C:\new` is decoded with a line feed, and `a\\b` loses a backslash.
- Relation to earlier rounds: Sibling of `../round-1/canard-schema-form-ajv6-plugin.md` item 2 (an encoded property name mishandled by this plugin) and `../round-2/canard-schema-form-ajv6-plugin.md` item 1 (a spelling variant of a name, raw against escaped), in a different function. The earlier rounds checked only static `properties` keys, which AJV 6 does escape.
- Reopens an earlier fix: No. The root-cause file's commits are `0ff81250d` and `be0d8c27d` (both marked COR-06), neither a bug bounty fix.
- Reproduction: `dynamicKeyPath.test.ts` in the probe folder.
  - "additionalProperties issue for key %j points at that key": for `"it's"` the actual `dataPath` is `''` and the expected one is `/it's`; for `"C:\\new"` the actual one is `/C:` followed by a line feed and `ew`; for `"a\\\\b"` the actual one is `/a\b` and the expected one is `/a\\b`; for `"O'Brien"` the actual one is `''`.
  - "patternProperties issue for key %j points at that key" fails the same way for `"it's"` and `"C:\\new"`.
  - "a nested issue under dynamic key "it's" does not point at the root field of the same name": the actual `dataPath` is `/x`; the expected one is `/it's/x`.
  - The form-level symptom is the SYMPTOM D section under `canard-schema-form`.
- Confidence: high. Verification level: public plugin API (source), with a form-level confirmation through the internal fixture.

## 3. The README lists Draft-04 and Draft-06 as supported, but a schema that declares either draft's `$schema` fails to compile with the plugin's default instance.

- Severity: low. A consumer who trusts the list and keeps an older schema gets no validation at all; the failure surfaces as `VALIDATOR_COMPILE_FAILED`, not silently.
- Affected public API: `plugin.validator.compile` and form validation with the default instance.
- Contract violated: `packages/canard/schema-form-ajv6-plugin/README.md:162` and `packages/canard/schema-form-ajv6-plugin/README.md:163` list Draft-04 and Draft-06 under JSON Schema Support.
- Root cause: The default instance (`packages/canard/schema-form-ajv6-plugin/src/validator/validatorPlugin.ts:15`) adds neither the Draft-04 nor the Draft-06 meta-schema, so AJV throws `no schema with key or ref "http://json-schema.org/draft-0X/schema#"`. It is the same documentation gap as [@canard/schema-form-ajv8-plugin item 2](canard-schema-form-ajv8-plugin.md).
- Relation to earlier rounds: Same class as `../round-1/winglet-data-loader.md` item 1 (a documented configuration that does not work).
- Reopens an earlier fix: No. Neither `FIXES.md` lists a fix for these README lines; `git log -L` was not run on them.
- Reproduction: `draftSupport.test.ts`. "validates a schema declaring draft-06 $schema" and "validates a schema declaring draft-04 $schema with boolean exclusiveMaximum" both actually report `compile threw: no schema with key or ref "…"`; the expected results are `['exclusiveMaximum']` and `['maximum']`.
- Confidence: high for the behavior. Verification level: public plugin API (source). Whether to fix the README or add the meta-schemas is the owner's decision.

## Hypotheses checked and not bugs

- From `r3-validation`:
  - Static `properties` keys with quotes, backslashes and control characters are escaped by AJV 6 and decoded correctly; this was already established in round 2 and the `plain` controls confirm the ordinary path.
  - The plugin has no pool of transient instances, so the snapshot defect of [@canard/schema-form-ajv8-plugin item 1](canard-schema-form-ajv8-plugin.md) does not apply to roots without `$id`.
- From `r3-contracts`:
  - The ajv7 and ajv8 plugins classify thrown validation errors by shape, so an instance from another ajv copy works there.

## Open leads

- From `r3-validation`:
  - `cloneInstance` also snapshots formats and keywords when two live roots share an `$id`, so the defect of [@canard/schema-form-ajv8-plugin item 1](canard-schema-form-ajv8-plugin.md) may apply to such roots; this was not reproduced.
  - `registerSchemaRoot` collects `$id` strings from data keywords such as `default` and `examples` for its conflict check, unlike the classifier that `CLAUDE.md` describes; no observable difference was found.
