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
- `src/__tests__/parity.{guard,validation,lifetime}.test.ts` run the shared validator parity scenarios of `@aileron/schema-form-scenarios/validator` (a devDependency) on this plugin's entries; conformance rows assert, observation rows only record (IR-11 PR-D).
- `src/validator/utils/resolveAjvConstructor.ts` — constructor extraction from the AJV default import

## Key Details

- **AJV defaults**: `allErrors: true`, `strict: false`, `validateFormats: false`.
- **Binding refusal**: `bind(instance)` throws immediately when `opts.coerceTypes`, `opts.useDefaults`, or `opts.removeAdditional` is enabled. The previous binding remains active. Callers discriminate the refusal by `group` (`'UNHANDLED_ERROR'`) and `code` (`'UNHANDLED_ERROR.VALIDATOR_BIND_REFUSED'`, the value of `FormErrorCode.ValidatorBindRefused`); core's `isUnhandledError` does not recognize it.
- **Guard pointer refusal**: `compileGuard` throws a native `GuardPointerNotSchemaError` when the pointer does not locate a schema (an object or boolean): a missing location, or a value such as `/type` or `/required`. Callers discriminate it by `group` (`'UNHANDLED_ERROR'`) and `code` (`'GUARD_POINTER_NOT_SCHEMA'`); `details` carries the root's `$id` (or `''`) and the pointer.
- **Registration**: `compile(copy)`, `compileGuard(copy, pointer)`, and `release(copy)` use the same copy object identity. Only guards that need the root location register the root, on the guard instance; `compile` registers a copy of a root with `$id` on the selected validation instance (a separate sibling when its `$id` conflicts) and compiles a root without `$id` as a transient copy. Overlapping live `$id` values use separate instances with the same settings.
- **Direct guard compile**: when the root has no own `$schema` and the `if` subschema contains no `$schema`, `$ref`, `$recursiveRef`, `$id`, or anchor keyword anywhere, `compileGuard` compiles that subschema object directly on the `allErrors: false` guard instance and `release(copy)` removes it; a root declaring `$schema` or a guard containing `$schema` uses the root pointer, as do other contextual guards. `ajvValidatorPlugin.configure({ directGuardCompile: false })` switches later compiles back to the root pointer (ledger round 52, 46C-01 Option A; boolean guards stay in Ajv's shared cache).
- **Direct guard compile errors**: a compile error that only appears when another part of the root is compiled (an unresolved `$ref`) makes full validation report `VALIDATOR_COMPILE_FAILED` and fails every root-pointer guard, a limitation of that path; a directly compiled self-contained guard still evaluates, as ERROR-041's per-gate failure rule prescribes (ledger 53C-01). Do not make the direct path reproduce the root-wide failure.
- **Guard meta-schema**: the guard instance uses `allErrors: false` and `validateSchema: false`; AJV's root meta-schema check runs only in the whole-schema compile, so a root meta-schema violation outside the condition fails no guard, and a meta-only violation inside the condition schema is evaluated by the generated code; custom keyword meta-schema checks, strict options and code-generation checks still apply to guards (IR-10, VALIDATE-033, ERROR-041).
- **Guard scope**: on an instance with `opts.dynamicRef` (Ajv2019, Ajv2020) and a root that has a dynamic-scope key, a root-pointer guard prefills AJV dynamic anchors from the outermost chain resource declaring each name, then compiles `$ref` (`src/validator/utils/dynamicScope/collectGuardDynamicAnchors.ts`); other root assertions never affect it, it matches whole validation's `if` verdict under the README's support condition, an inline reference that neither a chain resource nor an ancestor of the reference inside the `if` binds, or a selected `$async` declaration, fails `compileGuard`, and VALIDATE-047 case (iv) and a first binding outside the chain stay unsupported.
- **Bound strict options**: `strictTypes` and `strictRequired` on a bound instance may make some `if` guards fail to compile. The affected gate becomes false and produces a `GUARD_FAILED` `onError` record. The plugin does not override the consumer's options, and strict mode is not the plugin default (VALIDATE-003, VALIDATE-005, VALIDATE-033, ERROR-041).
- **Errors**: `required` appends the missing property to `dataPath`, and root `dataPath` is `''`. Rejected object keys use `rejectedKey`.
- **AJV interop**: ajv@7 may expose `{ __esModule: true, default: Ajv }` rather than the constructor. Resolve default imports with `resolveAjvConstructor` before instantiation.
- **Build target**: ES2022, ESM (`.mjs`) and CJS (`.cjs`) via Rolldown.
