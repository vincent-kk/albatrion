# @canard/schema-form-ajv7-plugin: bug bounty round 3

This round confirmed 2 new findings in `@canard/schema-form-ajv7-plugin`. Items in the earlier round documents ([round 1](../round-1/canard-schema-form-ajv7-plugin.md), [round 2](../round-2/canard-schema-form-ajv7-plugin.md)) were treated as fixed and excluded. The main session re-ran every probe. Verification limits are listed under the probes.

Probes: [probes/canard-schema-form-ajv7-plugin/](probes/canard-schema-form-ajv7-plugin/)

- From `r3-validation`:
  - Probe folder in the working tree: `packages/canard/schema-form-ajv7-plugin/src/__bounty__/r3-validation/`; the round copy is `bug-bounty/round-3/probes/canard-schema-form-ajv7-plugin/r3-validation/`.
  - To run the copy: copy it back to `packages/canard/schema-form-ajv7-plugin/src/__bounty__/r3-validation/` and run `yarn workspace @canard/schema-form-ajv7-plugin test --run src/__bounty__/r3-validation/`.
  - Failing tests that are not findings: `draftSupport.test.ts`, "validates a schema declaring draft-04 $schema with boolean exclusiveMaximum", control. This README does not claim Draft-04, so the failure is expected.
  - Control tests that pass: "[control] with 1 earlier root the later format is validated" and "[control] with 1 earlier root the later keyword is validated" in `lateFormat.test.ts`.
  - Verification limits: the plugin tests run the plugin source; `@canard/schema-form` resolves to its built `dist`, from which the plugin only reads types and error-code constants.

Root-cause files: `packages/canard/schema-form-ajv7-plugin/src/validator/`

## 1. A format or keyword that the application adds to its AJV 7 instance after earlier compiles is silently skipped by validation of later roots once 64 roots without `$id` have been compiled, and by later guards of a root whose first guard was already compiled.

- Severity: medium. Invalid data passes validation, and an `if` that uses the new rule evaluates as true, in less common but plausible usage: a lazily loaded module that registers its formats or keywords after the first forms compiled.
- Affected public API: `createValidator(ajv)`, `plugin.validator.bind`, `compile`, `compileGuard`.
- Contract violated: VALIDATE-033 at `packages/canard/schema-form/src/core/engine/validation/DETAIL.md:83` (a guard keeps the same formats and user keywords as whole validation), and predictability (the same input gives the same verdict regardless of how many schemas were compiled earlier). The README restricts only the order of `bind`, not when formats and keywords may be added.
- Root cause:
  - `packages/canard/schema-form-ajv7-plugin/src/validator/utils/registerSchemaRoot.ts:72` replaces the shared transient instance with `cloneInstance` after every 64 roots without `$id`.
  - `packages/canard/schema-form-ajv7-plugin/src/validator/utils/cloneInstance.ts:21` to line 29 copy the formats and keywords once, when the clone is made, so rules added to the bound instance later never reach it.
  - Each root's guard instance is a clone made at its first guard compile (`packages/canard/schema-form-ajv7-plugin/src/validator/createGuardCompiler.ts:56` and `packages/canard/schema-form-ajv7-plugin/src/validator/utils/registerSchemaGuard.ts:20`). It is the same defect as [@canard/schema-form-ajv8-plugin item 1](canard-schema-form-ajv8-plugin.md).
- Relation to earlier rounds: Same class as `../round-1/winglet-json-schema.md` item 1 (lazy indexing that makes results depend on order), and close to `../round-2/canard-schema-form.md` item 7 (more than one copy of shared state; here a snapshot copy of the AJV instance drifts from the original).
- Reopens an earlier fix: No. `git log -L 72,77` on the root-cause file lists `5528e4026` and `2d7d72d82`, neither a bug bounty fix.
- Reproduction: `lateFormat.test.ts`. "with 65 earlier roots the later format is validated the same way": the actual result is `[]`; the expected result is `['format']`. "with 65 earlier roots the later keyword is validated the same way": the actual result is `[]`; the expected result is `['isEven']`. Both controls with one earlier root pass.
- Confidence: high. Verification level: public plugin API (source). The guard part was reproduced on AJV 8 only.

## 2. The README lists Draft-06 as supported, but a schema that declares the Draft-06 `$schema` fails to compile with the plugin's default instance.

- Severity: low. A consumer who trusts the list gets no validation for such a schema; the failure surfaces as `VALIDATOR_COMPILE_FAILED`.
- Affected public API: `plugin.validator.compile` and form validation with the default instance.
- Contract violated: `packages/canard/schema-form-ajv7-plugin/README.md:181` lists Draft-06 under JSON Schema Support.
- Root cause: The default instance (`packages/canard/schema-form-ajv7-plugin/src/validator/validatorPlugin.ts:28`) does not add the Draft-06 meta-schema, so AJV throws `no schema with key or ref "http://json-schema.org/draft-06/schema#"`. It is the same documentation gap as [@canard/schema-form-ajv8-plugin item 2](canard-schema-form-ajv8-plugin.md).
- Relation to earlier rounds: Same class as `../round-1/winglet-data-loader.md` item 1 (a documented configuration that does not work).
- Reopens an earlier fix: No. Neither `FIXES.md` lists a fix for this README line; `git log -L` was not run on it.
- Reproduction: `draftSupport.test.ts`, "validates a schema declaring draft-06 $schema". The actual result is `compile threw: no schema with key or ref "http://json-schema.org/draft-06/schema#"`; the expected result is `['exclusiveMaximum']`.
- Confidence: high for the behavior. Verification level: public plugin API (source).

## Hypotheses checked and not bugs
