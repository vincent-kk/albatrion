# src

## Purpose

Shared CLI engine that consumer packages call via a thin `bin/inject-docs.mjs` wrapper to inject their bundled Claude docs into a user's `.claude` directory. Emulates the Playwright-cli pattern: consumers own the wrapper, this package owns the logic.

## Structure

- `index.ts` — programmatic public API barrel
- `program.ts` — `./cli` subpath entry; builds the commander program
- `cli.ts` — standalone dev bin (fallback packageName/version when cwd has no package.json)
- `commands/` — commander action handlers (fractal)
- `core/` — hash, scope, hashManifest, injectPlan, inject (organ)
- `components/` — ink UI (fractal container with primitives/, shared/, inject/)
- `utils/` — logger, asyncPool, types (organ)

## Conventions

- TypeScript strict mode, ESM + CJS dual output via rollup
- `./cli` subpath export for consumers; `./buildHashes` for build-time hash generation
- `scripts/buildHashes.mjs` is Node ESM, outside rollup; self-executing or importable

## Boundaries

### Always do

- Keep `injectDocs` free of UI concerns — render hooks (`renderScopeSelect`, `renderForceConfirm`) are injected from `program.ts`
- Treat `core/` and `utils/` as flat organs; split into sub-fractals only when injectPlan.ts > 100 lines or bidirectional deps emerge

### Ask first

- Adding new commander commands beyond `inject-docs` and the 7 deprecation stubs
- Changing `ProgramOptions` or `InjectOptions` public shapes

### Never do

- Import `ink`/`react` from `core/` or `utils/` (keep them UI-free)
- Re-introduce GitHub fetch, `.sync-meta.json`, or any legacy sync state
