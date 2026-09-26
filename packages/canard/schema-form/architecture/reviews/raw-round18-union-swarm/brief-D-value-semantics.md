# Lens D — value semantics, validation and tests

Read `brief-common.md` in this directory first; it binds. This lens owns **what a union node does with values**: rule A as an exact specification, its interaction with emission, defaults, expressions and the validator, and the tests that pin it.

## Questions to answer with a concrete proposal

1. **Rule A as three pure functions** with signatures and tables: `isMember(value, kind)` for string/number/integer/boolean/null/object/array (JSON Schema semantics: finite numbers, integer-valued; object = non-null non-array; `undefined` = absent), `convert(value, kind) → { ok, result }` per WRITE-075, and `interpret(value, list) → { value, mismatch }` (equal results count once; tie → keep + mismatch). Enumerate every tie in the table and prove there are no others. Cost per write.
2. **Where rule A runs**: every write path (input write, `setValue`, `Merge`, default fill, load/reset, `injectTo`/derived writes) — confirm each goes through `interpret`, cite WRITE items; what a load of a mismatching value does.
3. **Warning light and warning emission** with the draft rule: `valueTypeMismatch` per commit, `VALUE_TYPE_MISMATCH` once per lighting (ERROR-186), payload fields; the getters `valueTypeMismatch`/`valueTypeMismatches` (18C-40) on union; "false ≠ validation passed" wording.
4. **Emission**: `omitEmpty` on `''`/`{}`/`[]` whole values; root union with no value (VALUE-034, 18C-88); `trim` on a string value in a union (`finishInput` shared with the string row).
5. **Defaults**: `controls.default` > `default` as whole value at creation; goes through rule A; `{}` arriving as a value is not overwritten (vs WRITE-082 object host); `default` of a mismatching type lights the warning at mount.
6. **Expressions and gates** reading union values: `computed`/`controls` paths into an emitted object value (`./slot/key`), `if` with `const` on a union-typed discriminator key (strict `===`, `"1"` vs `1`), FRAGMENT-007/008 with a union-typed `controls.discriminator` key.
7. **Validator**: what the validator receives (reference vs copy) and the pending decision on mutating options (`coerceTypes`/`useDefaults`/`removeAdditional`): specify the contract text, the bind-time check (`ajv.opts`), and the behavior when detected (warn / refuse / copy for that instance only), with cost; also the compile-time schema copy (deep vs shallow) given `nullable`+`type` array mutation observed in ajv 8.17.1.
8. **Tests to add** (TEST-area items): node-tree tests and renderForm scenarios for: each rule-A table row, ties, integer, object/array membership, drafts in the default input, `omitEmpty`, defaults, migration shapes, mutating validator detection. Name files under `PKG/src/__tests__/scenarios/` style.

Read: ledger WRITE-075/082/089/090, VALUE-030/033/034, SURFACE-052, ERROR-186, CONTROLS-080, FRAGMENT-007/008, VALIDATE-001/002/003, 18C-40, 18C-88; `PLUG/schema-form-ajv8-plugin/src/validator/createValidatorFactory.ts`, `PLUG/schema-form-ajv8-plugin/src/default/validatorPlugin.ts`; `S/reports/t1a-union-consistency.md` (M1, G2, G10).
