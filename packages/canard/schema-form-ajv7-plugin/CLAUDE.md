# CLAUDE.md

`@canard/schema-form-ajv7-plugin` is the AJV 7.x validator plugin for `@canard/schema-form`. Its default instance uses JSON Schema Draft-07; a bound Ajv 2019 instance can evaluate 2019-09 keywords.

## Commands

```bash
yarn build             # ESM, CJS, and type declarations
yarn test              # Vitest tests
yarn test --watch      # Watch mode
yarn lint              # ESLint
yarn storybook         # Storybook development server (port 6006)
```

## Architecture

- `src/index.ts` — public entry point
- `src/validator/validatorPlugin.ts` — binding, compilation, guard, and release lifecycle
- `src/validator/createValidatorFactory.ts` — promise-returning validation
- `src/validator/createGuardCompiler.ts` — synchronous pointer guards
- `src/validator/utils/registerSchemaRoot.ts` — registration shared by validation and guards
- `src/validator/utils/transformErrors.ts` — AJV errors to `ValidationIssue`
- `src/validator/utils/resolveAjvConstructor.ts` — constructor extraction from the AJV default import

## Key Details

- **AJV defaults**: `allErrors: true`, `strict: false`, `validateFormats: false`.
- **Binding refusal**: `bind(instance)` throws immediately when `opts.coerceTypes`, `opts.useDefaults`, or `opts.removeAdditional` is enabled. The previous binding remains active. Callers discriminate the refusal by `group` (`'UNHANDLED_ERROR'`) and `code` (`'VALIDATOR_BIND_REFUSED'`); core's `isUnhandledError` does not recognize it.
- **Registration**: `compile(copy)`, `compileGuard(copy, pointer)`, and `release(copy)` use the same copy object identity. Overlapping live `$id` values use separate instances with the same settings.
- **Direct guard compile**: when the root has no own `$schema` and the `if` subschema contains no `$schema`, `$ref`, `$recursiveRef`, `$id`, or anchor keyword anywhere, `compileGuard` compiles that subschema object directly on the `allErrors: false` guard instance and `release(copy)` removes it; a root declaring `$schema` or a guard containing `$schema` uses the root pointer, as do other contextual guards. `ajvValidatorPlugin.configure({ directGuardCompile: false })` switches later compiles back to the root pointer (ledger round 52, 46C-01 Option A; boolean guards stay in Ajv's shared cache).
- **Direct guard compile errors**: a compile error that only appears when another part of the root is compiled (an unresolved `$ref`) makes full validation report `VALIDATOR_COMPILE_FAILED` and fails every root-pointer guard, a limitation of that path; a directly compiled self-contained guard still evaluates, as ERROR-041's per-gate failure rule prescribes (ledger 53C-01). Do not make the direct path reproduce the root-wide failure.
- **Guard scope**: Ajv 2019 dynamic and recursive references use the registered root's anchor context. VALIDATE-047 case (iv), one schema location reached from several dynamic scopes through `$dynamicRef` or `$recursiveRef`, is unsupported because `compileGuard(root, pointer)` provides one guard per location; that guard answers for the first-compiled dynamic scope.
- **Bound strict options**: `strictTypes` and `strictRequired` on a bound instance may make some `if` guards fail to compile. The affected gate becomes false and produces a `GUARD_FAILED` `onError` record. The plugin does not override the consumer's options, and strict mode is not the plugin default (VALIDATE-003, VALIDATE-005, VALIDATE-033, ERROR-041).
- **Errors**: `required` appends the missing property to `dataPath`, and root `dataPath` is `''`. Rejected object keys use `rejectedKey`.
- **AJV interop**: ajv@7 may expose `{ __esModule: true, default: Ajv }` rather than the constructor. Resolve default imports with `resolveAjvConstructor` before instantiation.
- **Build target**: ES2022, ESM (`.mjs`) and CJS (`.cjs`) via Rolldown.
