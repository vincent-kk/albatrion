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

- `src/{default,2019,2020}/index.ts` are the three public entry points; each exports `plugin`, `createValidatorFactory` and `createValidator`.
- `src/validator/createInstanceValidator.ts` builds a per-instance validator object with its own root registry; the entry points fix its dialect.
- Each entry point owns a process-wide `bind` selection and a schema-root registry.
- `src/validator/createValidatorFactory.ts` compiles full asynchronous validation.
- `src/validator/createGuardCompiler.ts` compiles synchronous guards: a self-contained `if` subschema (no `$schema`, `$ref`, `$dynamicRef`, `$recursiveRef`, `$id`, or anchor keyword anywhere) directly on the guard instance only when the root has no own `$schema`; a root declaring `$schema` or a guard containing `$schema` uses the root pointer, as do other contextual guards. Each entry point's `configure({ directGuardCompile: false })` restores the root pointer for later compiles.
- A compile error that only appears when another part of the root is compiled (an unresolved `$ref`, an invalid regex) makes full validation report `VALIDATOR_COMPILE_FAILED` and fails every root-pointer guard, a limitation of that path; a directly compiled self-contained guard still evaluates, as ERROR-041's per-gate failure rule prescribes. Do not make the direct path reproduce the root-wide failure.
- `src/validator/utils/transformErrors.ts` maps AJV issues to `ValidationIssue`.
- `src/__tests__/parity.{guard,guard.dynamic,validation,lifetime}.test.ts` run the shared validator parity scenarios of `@aileron/schema-form-scenarios/validator` (a devDependency) on this plugin's entries; conformance rows assert, observation rows only record.

## Key Details

- Default options: `allErrors: true`, `strictSchema: false`, `validateFormats: false`, `allowUnionTypes: true`.
- **Registration and call order**: `compileGuard(copy, pointer)` and `release(copy)` accept the engine-owned copy whether or not `compile(copy)` has run. Only guards that need the root location (for example a `$ref` into root definitions) register the root, on the guard instance; `compile` registers a copy of a root with `$id` on the selected validation instance (a separate sibling when its `$id` conflicts) and compiles a root without `$id` as a transient copy, and full validation can be compiled later. Pass the same copy object to `compile`, every `compileGuard`, and `release`. Releasing an unregistered root is a no-op.
- **Guard meta-schema**: the guard instance uses `allErrors: false` and `validateSchema: false`; AJV's root meta-schema check runs only in the whole-schema compile, so a root meta-schema violation outside the condition fails no guard, and a meta-only violation inside the condition schema is evaluated by the generated code; custom keyword meta-schema checks, strict options and code-generation checks still apply to guards (VALIDATE-033, ERROR-041).
- `bind(instance)` immediately refuses enabled `coerceTypes`, `useDefaults`, or `removeAdditional`; a refused instance never replaces the current binding.
- Callers discriminate the refusal by `group` (`'UNHANDLED_ERROR'`) and `code` (`'UNHANDLED_ERROR.VALIDATOR_BIND_REFUSED'`, the value of `FormErrorCode.ValidatorBindRefused`); core's `isUnhandledError` does not recognize it.
- `compileGuard` throws a native `GuardPointerNotSchemaError` when the pointer does not locate a schema (an object or boolean): a missing location, or a value such as `/type` or `/required`. Callers discriminate it by `group` (`'UNHANDLED_ERROR'`) and `code` (`'GUARD_POINTER_NOT_SCHEMA'`); `details` carries the root's `$id` (or `''`) and the pointer.
- Validation returns `null` or normalized issues; root `dataPath` is `''`.
- **Guard scope**: on an instance with `opts.dynamicRef` (Ajv2019, Ajv2020) and a root that has a dynamic-scope key, a root-pointer guard prefills AJV dynamic anchors from the outermost chain resource declaring each name, then compiles `$ref` (`src/validator/utils/dynamicScope/collectGuardDynamicAnchors.ts`); other root assertions never affect it, it matches whole validation's `if` verdict under the README's support condition, an inline reference that neither a chain resource nor an ancestor of the reference inside the `if` binds, or a selected `$async` declaration, fails `compileGuard`, and VALIDATE-047 case (iv) and a first binding outside the chain stay unsupported.
- **Bound strict options**: `strictTypes` and `strictRequired` on a bound instance may make some `if` guards fail to compile. The affected gate becomes false and produces a `GUARD_FAILED` `onError` record. The plugin does not override the consumer's options, and strict mode is not the plugin default (VALIDATE-003, VALIDATE-005, VALIDATE-033, ERROR-041).
- Builds target ES2022, ESM (`.mjs`), and CJS (`.cjs`).

## AJV 7 differences

- AJV 8 uses `strictSchema: false` and `instancePath`.
- The 2020 entry point supports Draft 2020-12.

## Maintainer contract

The [validator plugin contract](../schema-form/src/app/plugin/DETAIL.md) owns the shared obligations (VALIDATE-019, VALIDATE-033, VALIDATE-044, VALIDATE-046, VALIDATE-047, VALIDATE-050, VALIDATE-051, ERROR-201).

AJV keeps `refs` and `schemas` on the instance. A failed `addSchema` must restore both registries in place, including their key order and consumer string aliases, and remove the rejected copy from AJV's cache. Removing only the plugin key can delete a consumer's same-id registration or leave a rejected copy reusable. Keep this rollback paired with `registerValidationRoot` and its failure tests. Sibling instances preserve the bound constructor, options, formats, keyword definitions, bare keywords and consumer schemas, while excluding plugin-owned registrations; otherwise isolating a duplicate id changes validation meaning.

`allowUnionTypes: true` suppresses strict-type logging for union declarations without changing their verdict. Preserve it separately from value coercion and from the dynamic-scope limits documented above.

## Declaration compatibility check

`build:verify:types` checks every public package export from fresh built declarations in strict NodeNext and Bundler consumers with `skipLibCheck: false`; `build` runs it after declaration generation. This checks ESM consumer declarations, independently of source aliases and the workspace's Bundler-only typecheck. Build workspace dependencies first. The shared declaration fixer handles static `from`, side-effect imports and inline `import()` references, including current and parent directory indexes. It preserves string literal types/comments and emits `.js` for `.d.ts` targets or `.mjs` for `.d.mts` targets. Its unit tests run once through the root `test:build-scripts` command, not in each package build.

Sibling profiles preserve removed and replaced built-in keywords as well as custom keywords; constructor defaults must not restore a consumer-removed rule or override its replacement.

## Verification tables

Keep local parameter tables as static array literals at the Vitest each call so the case count can be audited without executing tests. Preserve case names, row order and assertions when relocating tables or splitting files by behavior. Shared scenario runners keep their canonical imported data rather than copying it into each runner.
