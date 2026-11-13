# CLAUDE.md

`@canard/schema-form` is a JSON Schema-based React form library with node-tree state management, a plugin system, and asynchronous validation.

## Design Values

- Consistent, predictable behavior is the core value — where behavior could go either way, follow the consistency the public interface leads a caller to expect.
- Speed first, minimal computation, and the same value read twice returns the same reference — every change states its speed and memory cost.
- For a small, fixed set of checks known at build time, use direct `&&` or `||` conditions. Hoist a constant key array when iteration is clearer; never allocate the same fixed list on every call.
- Use `hasOwnProperty` from `@winglet/common-utils/lib` for own-key checks instead of calling `Object.prototype.hasOwnProperty` directly.
- Use `isArray` from `@winglet/common-utils/filter` for array checks instead of calling `Array.isArray` directly (consumer-facing doc examples may show the native call).
- Use `EMPTY_ARRAY`/`EMPTY_OBJECT` from `@winglet/common-utils/constant` for shared empty values, except identity sentinels.

## Commands

Before local `build` or `typecheck`, rebuild workspace dependencies, including `yarn workspace @winglet/json-schema build` after `@winglet/common-utils` and `@winglet/json`; CI builds the dependency closure first via `scripts/ci/helpers/plan/createBuildSteps.mjs`.

Run these commands from `packages/canard/schema-form`. From the repository root, use `yarn workspace @canard/schema-form <command>`.

```bash
yarn build             # Build ESM/CJS bundles, verify build flags, generate declarations and agent hashes, then typecheck
yarn build:types       # Type declarations only
yarn build:hashes      # Regenerate only the docs/agents/** hash manifest
yarn test              # Vitest tests
yarn workspace @canard/schema-form test --run --project render # All React 19 render tests
yarn lint              # ESLint
yarn storybook         # Storybook dev (port 6006)
```

Coverage requires a provider package such as `@vitest/coverage-v8`, which is not installed.

## Agent Docs Injector

Inject `docs/agents/**` assets into the selected agent's locations. Engine: `@slats/agents-assets-sync` (bin: `inject-agents-settings`).
Select agents with `--agent`: `claude` uses `.claude/{skills,rules,commands}`; `codex`/`agents` use `.agents/skills` and marker blocks in `AGENTS.md` (at project scope).

```bash
npx -p @slats/agents-assets-sync inject-agents-settings --package=@canard/schema-form --agent=claude --scope=user
npx -p @slats/agents-assets-sync inject-agents-settings --package=@canard/schema-form --agent=codex --scope=project
npx -p @slats/agents-assets-sync inject-agents-settings --package=@canard/schema-form --agent=claude,codex --scope=user --dry-run
npx -p @slats/agents-assets-sync inject-agents-settings --package=@canard/schema-form --agent=claude --scope=user --force --yes
```

### Isolation Guardrails

- `src/**` MUST NOT import from `docs/**` or `@slats/agents-assets-sync`.
- **Never add `./docs/*` to `exports`.**

## Architecture

### Node System

- **`FieldNode` is the single runtime class** (`src/core/surface/runtime/FieldNode.ts`). Node kinds are public discriminated union types distinguished by `type`, rather than separate classes (`src/core/surface/type.ts`).
- **Terminal**: `StringNode`, `NumberNode`, `BooleanNode`, `NullNode`, `UnionNode` (`type` holds several kinds)
- **Branch**: `ObjectNode`, `ArrayNode`, `VirtualNode` (sibling fields grouped with `options.virtual`). An `object` or `array` is terminal when `options.terminal: true`. The schema determines this once; it does not change during execution.
- **Discrimination**: Use guards such as `isStringNode` and `node.strategy` (`'branch'` | `'terminal'`).
- Node creation: `<Form>` creates and mounts the tree from `jsonSchema` and `defaultValue`. External access uses `FormHandle.node`, `findNode`, `findNodes`, the `node` in the `children` function, and the FieldInput `node` prop. Direct tree creation is not public (tests and benchmarks use `src/__tests__/fixtures/nodeFromJSONSchema.ts`).

### Plugin System (`src/app/plugin/`)

- Validator plugins: JSON Schema validation through AJV7/AJV8 and other validators
- UI plugins supply FieldRenderer and the root-owning LabelRenderer / ErrorMessageRenderer parts; optional InputRenderer frames the bound input. See [part assembly](docs/agents/skills/schema-form-skill/knowledge/field-input.md#bound-parts-and-input-frames).
- FieldInput plugins: Custom input components

### Error Isolation (user-injected render surfaces)

User-injected render surfaces (FieldRenderer/FieldInput and virtualization Placeholder) are isolated at the component resolution owner so a thrown render affects only that subtree. FieldProxy owns the renderer ErrorBoundary; the input definition adapter owns the input boundary. VirtualizationManager wraps Placeholder only when its original component reference changes, and every waiting field shares that adapter. Do not wrap again at each consumption site. The virtualization helper permits this Placeholder protection as its only React exception; see its INTENT.md.

### Key APIs

- `Form` — Main entry point
- `Form.Render` — Custom layout through JSONPointer paths
- `registerPlugin()` — Global plugin registration (required before rendering)
- `node.find('/path')` — JSONPointer node lookup (`..` for the parent; `*` wildcard support is limited)
- `node.value` — read a virtual group tuple through `FormHandle.findNode('/period')`, narrow with `isVirtualNode`, then read its `value`; see [virtual schema](docs/agents/skills/schema-form-skill/knowledge/virtual-schema.md).
- `node.outputValue` — Value refined by schema options. `FormHandle.getValue`/`submit`, root emission, and parent-side hydration snapshots read this value. `ArrayNode` applies `options.omitTrailing` trimming here (`omitEmpty` applies only to the parent propagation path).
- `node.validate()` / `node.errors`
- `node.subscribe()` — Subscribes to node events (returns a cleanup function). Events delivered before subscription are not replayed; state mirrors use the `onSubscribe` catch-up in `useFieldNodeSubscribe`.
- `node.revision(mask?)` — Monotonic revision of delivered event batches (counted regardless of listeners to detect gaps for late subscribers; `useFieldNodeTracker` uses it as the useSyncExternalStore snapshot)
- `virtualization` prop — deferred mounting for large forms. The node tree stays complete; branches at `threshold` defer children beyond `eagerCount` behind `[data-path][data-deferred]` placeholders until intersection, idle backfill, or Focus/Select reveals them once. `useChildFields` bakes gates and `VirtualizationManager` coordinates them. Style placeholders with `[data-deferred]` CSS or `Placeholder`; `estimateHeight` owns reserved space. SSR renders every field and hydrates unchanged; only branches and children added after hydration are gated. Hydration itself schedules no extra branch render, including custom branch inputs containing Suspense in React 18 and 19.

### FieldInput Priority (High → Low)

1. Direct schema `presentation.FieldInput` declaration
2. `fieldInputMap` path mapping
3. Form-level `fieldInputDefinitions`
4. Provider `fieldInputDefinitions`
5. Plugin-provided definitions

### Controls (Conditional and Derived Properties)

```typescript
controls: {
  visible: '../category === "premium"',
  readOnly: '../locked === true',
  watch: ['../category'],   // Explicit dependency
}
```

Reserved group keys, child scope and shallow types are declared once in `src/constants/reservedSchemaKeys.ts`; validation and key enumerations derive from it. Authoring type owners check exact key parity so a new key cannot silently drift. See the package and buildNodes DETAIL contracts for ownership and read-site trust.
For control value types and examples, use the [schema reference](https://vincent-kk.github.io/albatrion/docs/canard/schema-form/schema-reference#controls).

### Validation Modes

`OnChange` | `OnRequest` | `None`

## Fractal Contracts in This Package

Applies the root `Module Contract Principles` to this package.

- `src/index.ts` is the only public surface (`exports` has `"."` alone) and lists every export by name. Docs, README and agent skills show only names reachable from it. Adding a name is a contract change: enumerate the built `dist/index.d.ts` and compare before merging.
- Standard fractal shape: the root holds `INTENT.md`, `DETAIL.md`, `index.ts` and at most one implementation file named after the fractal (`components/Form/Form.tsx`). Child fractals sit under a role compartment (`components/Form/components/FormCore/`, `components/FieldProxy/components/FieldInputBridge/`), each with `index.ts`, its documents, and its own `components/`·`utils/` for helpers only it uses. Types live in a `types/` compartment split by concern (`src/core/engine/record/types/`), not in a root `type.ts`. Compartments are organs: no `index.ts` inside them, files are imported directly (`src/constants/bitmask`, not `src/constants`). Inside one organ, entry functions follow their siblings' shape: all files or all directories, never a mix.
- A fractal named after a role (`hooks`, `types`) keeps its files in topic compartments, never in a compartment that repeats the role name (`src/hooks/fieldNode/`·`src/hooks/form/`, `src/types/schema/`·`field/`·`error/`·`rolled/`; never `hooks/hooks/` or `types/types/`). Helpers extracted from a function go into a topic compartment beside their siblings, not into a directory named after the function with its own `utils/` (no `analyze/populateNodeChildren/utils/`). `src/hooks` stays a fractal because it composes `core`, `providers` and `components`; an organ may not import its owner's child fractals (model B1, guarded by `src/__tests__/importModel.test.ts`).
- Tests live in each fractal's `__tests__/` and import that fractal's internal files directly (`../runtime/FieldNode`, not `..` or `@/schema-form/core`). A test that needs another fractal's internals moves into that fractal; a fixture shared by two fractals sits in the `__tests__/fixtures/` of their lowest common fractal. `src/__tests__/e2e`, `scenarios`, `migration` and `agents-examples` are external consumers and import the root `index.ts`. A parent-level test that must reach a child fractal's internals (for example through `vi.mock`) is declared in the parent's `DETAIL.md` (see `src/core/engine/DETAIL.md`).
- Benchmarks live inside the nearest fractal's `__benchmarks__/` and import internals directly. `bench/distEngine/` loads built workspace bundles and installed 0.16.x bundles for diagnostic and version comparisons. `bench/` and `stories/` are ignored by filid, so reviewers check those imports by hand. A bench never justifies adding a name to an `index.ts`.
- Error codes come from one place: `FormErrorCode` and `FormWarningCode` (`src/errors/`), exported from the root. Product code emits codes through these constants, never as string literals.

## Render-Level Test Harness (`src/__tests__/`)

Vitest uses five projects: `unit` runs TypeScript core tests in Node, `render`
runs React tests and DOM-dependent TypeScript tests in jsdom, and `storybook`
runs portable stories through addon-vitest in headless Chromium, `react18` repeats the render project on React 18, and `production` checks the built bundles. Run `yarn test --run --project <name>` to select a project.
The dedicated `verify-unit` and `verify-render` bundle runs shadow wheel, verify table, and derive shadow checks via `yarn workspace @canard/schema-form test:verify --run`; default `unit`, `render`, and `react18` projects exercise the shipped skip/table configuration with derive shadow disabled.

- `src/__tests__/renderForm.tsx` remains the legacy Form regression harness.
  It observes both DOM (`data-path`, input values, deferred placeholders) and
  node state, with StrictMode, validators, caught errors, and user interactions.
- Existing render scenarios keep their location and assertions until the engine
  switch. Known legacy defects retain their explicit `it.fails` records.
- New shared scenarios belong to private `@aileron/schema-form-scenarios` as pure
  data. The package cannot import schema-form, including types; inject forms,
  handles, and adapters through structural contracts.
- Core scenario runners consume the shared families. New Form e2e runners belong
  to `src/__tests__/e2e/<family>.test.tsx`, with at most 15 cases per file.
  A scenario needing consumer-only spies or boundary assertions gets its own
  file. Shared screen steps run through `playScenario(scenario, element)`.
- The renderer registers its handle on the wrapper root or render container.
  `playScenario` searches the received element and descendants, so story and
  render contexts share the same call shape.
- Scenario stories render the current public Form entry, mirror the same data,
  and call `playScenario` from `play`; usage stories may assert their own readouts (the handle call log and what the story itself renders); behavior contracts stay in shared scenarios.
- Final observable behavior needs a render scenario; a core test alone does not
  verify DOM behavior. Harness skeleton tests and empty families claim no engine
  behavior coverage.

Filid case-cap exemptions name only runners consuming canonical shared scenario data or shared fixtures. Keep those imports so one data source serves every engine and renderer; copying the catalogue into each runner would let coverage drift. Local literal parity rows use ordinary case caps once their declaration and read-only uses are statically countable. Literal validator parity tables keep `as const`; catalogue validation receives a one-parameter identity projection so the static counter can prove the table binding does not escape while `indexDeclaredRows` still type-checks and validates every declared row against the shared catalogue. The exact exempt file list belongs in `.filid/config.json`, and the ownership contract records the reason.

## Class Member Ordering (Domain-First)

Identity → Tree Structure → Value Management → Computed Properties → State → Validation → Events → Injection → Lifecycle → Constructor

## Key Hooks

- `useFieldErrors` observes one field’s formatted feedback; see [validation UX](docs/agents/skills/schema-form-skill/knowledge/validation-ux.md#read-one-fields-errors).
- `useFieldNodeTracker`, `useFieldNodeSubscribe`, `useChildFieldMap`, `useChildFieldErrors`, `useFormSubmit` (`useFieldNode` is internal and absent from the public index)

## Key Type Utilities

- `InferValueType<Schema>`, `InferFieldNode<Schema>`, `FormHandle<Schema, Value>` (public exports; see [TypeScript inference](https://vincent-kk.github.io/albatrion/docs/canard/schema-form/api-reference#typescript))
- Apply `as const` for useful `InferValueType` inference; widened `type` falls back to `any`. It recurses through `properties`, finite `prefixItems` tuples and `items`. Object keys are optional because inactive or omitted fields can disappear, and objects stay open unless `additionalProperties: false` so keys from `oneOf`/`anyOf` branches are not rejected as excess properties. Finite literal `prefixItems` infer optional-position tuples (see [TypeScript inference](https://vincent-kk.github.io/albatrion/docs/canard/schema-form/api-reference#typescript) for the value contract and consumer impact). Supply `Form<Schema, Value>` / `FormHandle<Schema, Value>` explicitly when exact values are required; a concrete `defaultValue` can infer required keys that differ from the handle's default `Value`, so use the same explicit type with a ref.
- Nullable schemas add `| null` to the value type for both `type: [..., 'null']` and `nullable: true`. The runtime (`BranchStrategy` and `validateSchemaType`) accepts null, so the types follow the same contract. `nullable: true` is officially supported, equivalent to adding `'null'` to the `type` array, and produces no error or warning.

## Dependencies

`@winglet/common-utils`, `@winglet/json`, `@winglet/json-schema`, `@winglet/react-utils`, React 18-19 (peer)

## Build Output

Runtime bundles are `dist/index.mjs`, `dist/index.node.mjs`, and `dist/index.cjs`; declarations remain in `dist/index.d.ts`. The `node` export condition selects `index.node.mjs` for imports and `index.cjs` for require. Both Node outputs read `NODE_ENV` once at load and retain that decision after later environment changes. The default ESM keeps call-site comparisons. All runtime outputs intentionally remain unminified so consumer bundlers perform final minification.

## Declaration compatibility check

`build:verify:types` checks every public package export from fresh built declarations in strict NodeNext and Bundler consumers with `skipLibCheck: false`; `build` runs it after declaration generation. This checks ESM consumer declarations, independently of source aliases and the workspace's Bundler-only typecheck. Build workspace dependencies first. The shared declaration fixer handles static `from`, side-effect imports and inline `import()` references, including current and parent directory indexes. It preserves string literal types/comments and emits `.js` for `.d.ts` targets or `.mjs` for `.d.mts` targets. Its unit tests run once through the root `test:build-scripts` command, not in each package build.
