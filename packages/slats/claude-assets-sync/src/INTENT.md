# src

## Purpose

Shared CLI engine that consumer packages call via a thin `bin/claude-sync.mjs` wrapper to inject their bundled Claude docs into a user's `.claude` directory. Emulates the Playwright-cli pattern: consumers own the wrapper, this package owns the logic.

## Structure

- `index.ts` — programmatic public API barrel
- `cli.ts` — primary bin entry (`claude-sync`); forwards to `runCli`
- `program.ts` — `@deprecated` `./cli` subpath; forwards to the new prompts layer
- `discover.ts` — workspace + node_modules walker for `claude.assetPath`
- `version.ts` — build-time injected `VERSION` constant
- `commands/` — commander handlers: `root`, `inject`, `list`, `buildHashesCmd`, `_deprecated` (fractal)
- `core/` — hash, scope, hashManifest, injectPlan, inject (organ)
- `prompts/` — `@inquirer/prompts`-based scope picker and force confirm (fractal)
- `utils/` — logger, asyncPool, heartbeat, types (organ)

## Conventions

- TypeScript strict mode, ESM + CJS dual output via rollup
- `./cli` subpath for legacy consumers; `./buildHashes` for build-time hash generation
- `scripts/buildHashes.mjs` is pure Node ESM, outside rollup; self-executing bin lives in `scripts/claude-build-hashes.mjs`

## Boundaries

### Always do

- Keep `core/` UI-free; prompts are called only from `commands/`
- Treat `core/` and `utils/` as flat organs; split into sub-fractals only when a single file grows past ~200 lines or bidirectional deps emerge

### Ask first

- Adding top-level commands beyond `inject`/`list`/`build-hashes` and the legacy `inject-docs` alias
- Changing `RunCliOptions`, `ProgramOptions`, or `InjectOptions` public shapes

### Never do

- Import `ink`/`react` anywhere — `@inquirer/prompts` is the sole prompt surface
- Re-introduce GitHub fetch, `.sync-meta.json`, or any legacy sync state
- Import from `prompts/` inside `core/` or `utils/`
