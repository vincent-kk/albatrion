# CLAUDE.md

`@canard/schema-form-ajv8-plugin` provides AJV 8 validation for `@canard/schema-form`, with Draft-07, 2019-09, and 2020-12 entry points.

## Commands

```bash
yarn build             # ESM, CJS, and declarations
yarn test              # Vitest
yarn lint              # ESLint
yarn storybook         # Storybook development server
```

## Architecture

- `src/{default,2019,2020}/index.ts` are the three public entry points.
- Each entry point owns a process-wide `bind` selection and a schema-root registry.
- `src/validator/createValidatorFactory.ts` compiles full asynchronous validation.
- `src/validator/createGuardCompiler.ts` compiles synchronous guards: a self-contained `if` subschema (no `$schema`, `$ref`, `$dynamicRef`, `$recursiveRef`, `$id`, or anchor keyword anywhere) directly on the guard instance only when the root has no own `$schema`; a root declaring `$schema` or a guard containing `$schema` uses the root pointer, as do other contextual guards. Each entry point's `configure({ directGuardCompile: false })` restores the root pointer for later compiles (ledger round 52, 46C-01 Option A).
- A compile error that only appears when another part of the root is compiled (an unresolved `$ref`, an invalid regex) makes full validation report `VALIDATOR_COMPILE_FAILED` and fails every root-pointer guard, a limitation of that path; a directly compiled self-contained guard still evaluates, as ERROR-041's per-gate failure rule prescribes (ledger 53C-01). Do not make the direct path reproduce the root-wide failure.
- `src/validator/utils/transformErrors.ts` maps AJV issues to `ValidationIssue`.

## Key Details

- Default options: `allErrors: true`, `strictSchema: false`, `validateFormats: false`, `allowUnionTypes: true`.
- `bind(instance)` immediately refuses enabled `coerceTypes`, `useDefaults`, or `removeAdditional`; a refused instance never replaces the current binding.
- Callers discriminate the refusal by `group` (`'UNHANDLED_ERROR'`) and `code` (`'VALIDATOR_BIND_REFUSED'`); core's `isUnhandledError` does not recognize it.
- Validation returns `null` or normalized issues; root `dataPath` is `''`.
- A single location used from several dynamic scopes is unsupported by `compileGuard`.
- Builds target ES2022, ESM (`.mjs`), and CJS (`.cjs`).

## AJV 7 differences

- AJV 8 uses `strictSchema: false` and `instancePath`.
- The 2020 entry point supports Draft 2020-12.
