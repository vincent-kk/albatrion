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
- **Guard scope**: Ajv 2019 dynamic and recursive references use the registered root's anchor context. One location used from several dynamic scopes is unsupported because `compileGuard(root, pointer)` provides one guard for that location.
- **Errors**: `required` appends the missing property to `dataPath`, and root `dataPath` is `''`. Rejected object keys use `rejectedKey`.
- **AJV interop**: ajv@7 may expose `{ __esModule: true, default: Ajv }` rather than the constructor. Resolve default imports with `resolveAjvConstructor` before instantiation.
- **Build target**: ES2022, ESM (`.mjs`) and CJS (`.cjs`) via Rolldown.
