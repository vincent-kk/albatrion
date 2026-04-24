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
- `core/` — `hash`, `hashManifest`, `scope`, `buildPlan`, `injectDocs` primitives
- `ui/` — Ink React UI layer for TTY path (internal, dynamic-imported)
- `utils/` — logger, asyncPool, types, version (organ)

## Conventions

- TypeScript strict mode, ESM-only rollup build
- `./buildHashes` subpath is build-time hash generation, pure Node ESM
- `scripts/buildHashes.mjs` runs outside rollup; self-executing bin is
  `scripts/claude-build-hashes.mjs`
- Dispatcher entry point is `bin/inject-claude-settings.mjs`, a two-line
  re-export of `runCli(process.argv)`

## Boundaries

### Always do

- Keep `core/` UI-free; both TTY (Ink) and non-TTY (`renderPlain`)
  compose core primitives directly
- Cross-fractal imports go through each sibling's `index.ts` barrel
- `ui/` is loaded only by `commands/runCli/utils/renderOrFallback.ts`
  via dynamic `import('../../../ui/index.js')`; the main `.` barrel
  (`src/index.ts`) MUST NOT re-export from `ui/`

### Ask first

- Adding top-level commands beyond the single `inject-claude-settings` action
- Changing the public shape of `runCli`, `HashManifest`, or `InjectReport`

### Never do

- Import from `ui/` outside `renderOrFallback.ts`
- Read `package.json` or walk `node_modules` inside `core/**`, `ui/**`, or `utils/**`
- Re-introduce GitHub fetch, `.sync-meta.json`, or legacy sync state
