# @canard/schema-form-ajv8-plugin: bug bounty round 3

This round confirmed 3 new findings in `@canard/schema-form-ajv8-plugin`. Items in the earlier round documents ([round 1](../round-1/canard-schema-form-ajv8-plugin.md), [round 2](../round-2/canard-schema-form-ajv8-plugin.md)) were treated as fixed and excluded. The main session re-ran every probe. Verification limits are listed under the probes.

Probes: [probes/canard-schema-form-ajv8-plugin/](probes/canard-schema-form-ajv8-plugin/)

- From `r3-validation`:
  - Probe folder in the working tree: `packages/canard/schema-form-ajv8-plugin/src/__bounty__/r3-validation/`; the round copy is `bug-bounty/round-3/probes/canard-schema-form-ajv8-plugin/r3-validation/`.
  - To run the copy: copy it back to `packages/canard/schema-form-ajv8-plugin/src/__bounty__/r3-validation/` and run `yarn workspace @canard/schema-form-ajv8-plugin test --run src/__bounty__/r3-validation/`.
  - Failing tests that are not findings: none.
  - Control tests that pass: all five rows of `dynamicKeyPath.test.ts` (AJV 8 escapes dynamic keys `it's`, `C:\new`, `a~b`, `a/b` and `%41` correctly, the control for [@canard/schema-form-ajv6-plugin item 2](canard-schema-form-ajv6-plugin.md)); "[control] with 1 earlier root the later format is validated" and "[control] with 1 earlier root the later keyword is validated" in `lateFormat.test.ts`.
  - Verification limits: the plugin tests run the plugin source; `@canard/schema-form` resolves to its built `dist`, from which the plugin only reads types and error-code constants. The plugin's own `dist` predates the round 2 fixes and was not used.

Root-cause files: `packages/canard/schema-form-ajv8-plugin/src/`

## 1. A format or keyword that the application adds to its AJV 8 instance after earlier compiles is silently skipped by validation of later roots once 64 roots without `$id` have been compiled, and by later guards of a root whose first guard was already compiled.

- Severity: medium. Invalid data passes validation, and an `if` that uses the new rule evaluates as true so that the wrong fields take part, in less common but plausible usage: a lazily loaded module that registers its formats or keywords after the first forms compiled.
- Affected public API: `createValidator(ajv)` and `plugin.validator.bind` of all three entry points, `compile`, `compileGuard`.
- Contract violated: VALIDATE-033 at `packages/canard/schema-form/src/core/engine/validation/DETAIL.md:83` (a guard keeps the same formats and user keywords as whole validation), and predictability (the same input gives the same verdict regardless of how many schemas were compiled earlier). `packages/canard/schema-form-ajv8-plugin/README.md:104` restricts only the order of `bind`, not when formats and keywords may be added.
- Root cause:
  - `packages/canard/schema-form-ajv8-plugin/src/validator/utils/registerSchemaRoot.ts:81` replaces the shared transient instance (`compilerCurrent`) with `makeSibling` after every 64 roots without `$id`, and line 86 compiles later roots on it.
  - `packages/canard/schema-form-ajv8-plugin/src/validator/utils/makeSibling.ts:21` to line 30 copy formats and keywords once, when the sibling is made.
  - Each root's guard instance is a sibling made at its first guard compile (`packages/canard/schema-form-ajv8-plugin/src/validator/createGuardCompiler.ts:53` and `packages/canard/schema-form-ajv8-plugin/src/validator/utils/registerSchemaGuard.ts:22`), so later guards of that root miss later rules while whole validation on the bound instance sees them.
- Relation to earlier rounds: Same class as `../round-1/winglet-json-schema.md` item 1 (lazy indexing that makes results depend on order), and close to `../round-2/canard-schema-form.md` item 7 (more than one copy of shared state; here a snapshot copy of the AJV instance drifts from the original).
- Reopens an earlier fix: No. `git log -L 76,87` on the root-cause file lists `5528e4026` and `2d7d72d82`, neither a bug bounty fix.
- Reproduction: `lateFormat.test.ts`.
  - "with 65 earlier roots the later format is validated the same way": the actual result is `[]`; the expected result is `['format']`.
  - "with 65 earlier roots the later keyword is validated the same way": the actual result is `[]`; the expected result is `['isEven']`.
  - "a guard compiled after the keyword was added agrees with whole validation of the same root": the actual guard verdict is `true` while plain AJV evaluates the same `if` as `false`; the expected guard verdict is `false`.
  - Both controls with one earlier root pass.
- Confidence: high. Verification level: public plugin API (source).

## 2. The README promises full Draft-04 and Draft-06 support, but a schema that declares either draft's `$schema` fails to compile in all three entry points.

- Severity: low. A consumer who trusts the README and keeps an older schema gets no validation at all; the failure surfaces as `VALIDATOR_COMPILE_FAILED`, not silently.
- Affected public API: `plugin.validator.compile` of the default, `2019` and `2020` entry points, and form validation.
- Contract violated: `packages/canard/schema-form-ajv8-plugin/README.md:211` ("Full support for Draft-07, Draft-06, and Draft-04"), `packages/canard/schema-form-ajv8-plugin/README.md:239` and `packages/canard/schema-form-ajv8-plugin/README.md:240` (Draft-06 and Draft-04 marked as supported), and the same claims in `packages/canard/schema-form-ajv8-plugin/README-ko_kr.md:202` and lines 231 to 232.
- Root cause: The default instances (`packages/canard/schema-form-ajv8-plugin/src/default/validatorPlugin.ts:26`, `packages/canard/schema-form-ajv8-plugin/src/2019/validatorPlugin.ts:31` and `packages/canard/schema-form-ajv8-plugin/src/2020/validatorPlugin.ts:31`) add neither meta-schema, and AJV 8 needs the separate `ajv-draft-04` package for Draft-04 at all. AJV therefore throws `no schema with key or ref "http://json-schema.org/draft-0X/schema#"`.
- Relation to earlier rounds: Same class as `../round-1/winglet-data-loader.md` item 1 (a documented configuration that does not work).
- Reopens an earlier fix: No. Neither `FIXES.md` lists a fix for these README lines; `git log -L` was not run on them.
- Reproduction: `draftSupport.test.ts`, describe "ajv8 %s entry and older drafts" for `default`, `2019` and `2020`. "validates a schema declaring draft-06 $schema" and "validates a schema declaring draft-04 $schema with boolean exclusiveMaximum" all actually report `compile threw: no schema with key or ref "…"`; the expected result is `['exclusiveMaximum']`.
- Confidence: high for the behavior. Verification level: public plugin API (source). Whether to fix the README or add the meta-schemas is the owner's decision.

## 3. The README migration example says format validation is on, but its instance ignores every format and only logs a warning.

- Severity: low. A consumer migrating from the AJV 6 plugin who copies the example believes that `format: 'email'` and similar checks run, so invalid values pass, and every compile logs two warnings, also in production.
- Affected public API: `plugin.validator.bind` with the documented instance, `compile`.
- Contract violated: `packages/canard/schema-form-ajv8-plugin/README.md:263` to line 266, where the example sets `validateFormats: true` with the comment "Format validation is enabled by default in AJV 8.x". AJV 8 ships no formats, so the example also needs `ajv-formats`.
- Root cause: The example does not add `ajv-formats`; with `strict: false`, AJV 8 logs `unknown format "…" ignored` and skips the keyword. The defect is in the README example, not in the plugin code.
- Relation to earlier rounds: Same class as `../round-1/winglet-data-loader.md` item 1 (a documented configuration that does not work).
- Reopens an earlier fix: No. Neither `FIXES.md` lists a fix for these README lines; `git log -L` was not run on them.
- Reproduction: `draftSupport.test.ts`, "the migration example instance validates format: email ("Format validation is enabled by default")". The actual result is no issue and two warnings `unknown format "email" ignored in schema at path "#/properties/email"`; the expected result is `['format']` and no warning.
- Confidence: high. Verification level: public plugin API (source).

## Hypotheses checked and not bugs

- From `r3-validation`:
  - Dynamic keys in `additionalProperties` (`it's`, `C:\new`, `a~b`, `a/b`, `%41`) receive a correctly escaped `instancePath`, so [@canard/schema-form-ajv6-plugin item 2](canard-schema-form-ajv6-plugin.md) does not apply to this plugin; the AJV 7 and AJV 8 rows of the form-level probe in `canard-schema-form` agree.
  - With one root compiled before a format or keyword is added, the later rule is validated, so the defect of item 1 needs the pool rotation or an existing guard instance.

## Open leads

- From `r3-validation`:
  - When `compile` throws in `packages/canard/schema-form-ajv8-plugin/src/validator/createValidatorFactory.ts:24`, the `removeSchema` call on line 25 does not run, so the transient copy may stay in AJV's cache; this was seen in the code only and not reproduced.
