# src

## Purpose

Shared CLI engine that lets any npm package ship its own Claude Code
docs (skills, rules, commands). The engine owns the
`inject-claude-settings` dispatcher; consumers only declare
`claude.assetPath` in `package.json` and let `claude-build-hashes` hash
their asset tree at build time.

## Structure

- `index.ts` — programmatic public API barrel
- `commands/` — commander root: `inject-claude-settings` dispatcher + action
- `core/` — `hash`, `hashManifest`, `scope`, `buildPlan`, `injectDocs` (fractal-of-fractals)
- `prompts/` — `@inquirer/prompts`-based scope picker & force confirm (organ)
- `utils/` — logger, asyncPool, heartbeat, types, version (organ)

## Conventions

- TypeScript strict mode, rollup dual ESM + CJS output
- `./buildHashes` subpath is build-time hash generation, pure Node ESM
- `scripts/buildHashes.mjs` runs outside rollup; self-executing bin is
  `scripts/claude-build-hashes.mjs`
- Dispatcher entry point is `bin/inject-claude-settings.mjs`, a two-line
  re-export of `runCli(process.argv)`

## Boundaries

### Always do

- Keep `core/` UI-free; prompts only through `prompts/` from `commands/`
- Cross-fractal imports go through each sibling's `index.ts` barrel

### Ask first

- Adding top-level commands beyond the single `inject-claude-settings` action
- Changing the public shape of `runCli`, `InjectOptions`, or `HashManifest`

### Never do

- Import `ink` or `react`; `@inquirer/prompts` is the only prompt surface
- Read `package.json` or walk `node_modules` inside `core/**` or `utils/**`
- Re-introduce GitHub fetch, `.sync-meta.json`, or legacy sync state
