# CLAUDE.md

`@canard/schema-form-ajv6-plugin` is the AJV 6.x Draft-07 validator plugin for `@canard/schema-form`.

## Commands

Run from this package, or use `yarn workspace @canard/schema-form-ajv6-plugin <command>`:

```bash
yarn build
yarn test --run
yarn lint
```

## Maintainer contract

The [validator plugin contract](../schema-form/src/app/plugin/DETAIL.md) owns the shared obligations (VALIDATE-019, VALIDATE-033, VALIDATE-044, VALIDATE-046, VALIDATE-047, VALIDATE-050, VALIDATE-051, ERROR-201). Keep version-specific behavior here.

- AJV6 reads mutation options from `_opts`, not `opts`. Refuse enabled `coerceTypes`, `useDefaults` or `removeAdditional` before replacing the binding; the caller receives `UNHANDLED_ERROR.VALIDATOR_BIND_REFUSED`. The defaults retain `allErrors: true`, `nullable: true`, `verbose: true`, and `format: false` so format checks remain an explicit consumer choice.
- Guard clones preserve the constructor, consumer formats, custom and bare keywords, schemas and options, except `allErrors: false` and `validateSchema: false`. Whole-schema compilation owns the root meta-schema check; disabling custom-keyword checks as well would change the condition's meaning. Draft-07 `$id` and relative references are supported; do not promise the dynamic/recursive-reference vocabulary of newer dialects.
- Contextual guards register the root independently of whole validation; self-contained guards may compile directly when the root has no own `$schema`. `configure({ directGuardCompile: false })` selects root pointers for later compiles. Root-pointer compilation can fail because another part of the root cannot compile, while a self-contained direct guard still evaluates; preserve that isolation.
- Same-id roots use separate validation instances with the same profile. A failed `addSchema` restores `_refs` and `_schemas` in place, including order and consumer aliases, and removes the rejected cache entry. Cleanup by id alone can otherwise erase a consumer schema. `release` removes only resources owned by that root, including guards compiled before full validation.
- Path normalization keeps allocation-free checks for already-normalized pointers and skips quote parsing for ordinary dot paths or a single unescaped quoted property; complex quoted paths retain the full decoder.
- AJV6 dotted and single-quoted bracket paths are decoded using AJV6 string escapes, then escaped as JSON Pointer segments; a bound `jsonPointers: true` path is retained verbatim, including `/` for an empty-name child.
- AJV6 reports `dataPath`; normalization converts it to JSON Pointer, appends missing required properties, preserves root `''` and carries rejected object keys separately. Treat these paths as plugin output, not a second routing policy.

## Declaration compatibility check

`build:verify:types` checks every public package export from fresh built declarations in strict NodeNext and Bundler consumers with `skipLibCheck: false`; `build` runs it after declaration generation. This checks ESM consumer declarations, independently of source aliases and the workspace's Bundler-only typecheck. Build workspace dependencies first. The shared declaration fixer handles static `from`, side-effect imports and inline `import()` references, including current and parent directory indexes. It preserves string literal types/comments and emits `.js` for `.d.ts` targets or `.mjs` for `.d.mts` targets. Its unit tests run once through the root `test:build-scripts` command, not in each package build.

Sibling profiles preserve removed and replaced built-in keywords as well as custom keywords; constructor defaults must not restore a consumer-removed rule or override its replacement.
