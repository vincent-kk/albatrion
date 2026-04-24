# Phase 0 — Prompt Library Bundle-Size Decision

**Gate threshold**: tree-shaken footprint for `select` + `confirm` ≤ 200 KB.

## Measurement setup

- Entry: `import { select, confirm } from '@inquirer/prompts'; export { select, confirm };`
- Bundler: esbuild 0.28.0 via `yarn dlx esbuild`
- Flags: `--bundle --format=esm --platform=node --external:node:*`
- Measured from `packages/slats/claude-assets-sync/` with `@inquirer/prompts@^8.4.2` resolved via yarn workspaces.

## Results

| Variant | Size |
|---|---|
| Bundled + minified | **28.5 KB** (29,215 bytes) |
| Bundled, no minify | 62.0 KB (63,522 bytes) |
| Raw `node_modules/@inquirer` footprint | 1.6 MB (includes unused prompt families) |

The minified bundle represents the realistic runtime cost after slats's Rollup build. The raw node_modules number is not representative because tree-shaking and dead-code elimination eliminate unused prompts from the published `dist/`.

## Decision

**Pinned**: `@inquirer/prompts@^8.4.2` in `dependencies`.

**Pinned**: `@inquirer/testing@^3.3.5` in `devDependencies`.

The 28.5 KB minified footprint is **7× under the 200 KB threshold**. No fallback to `@clack/prompts` needed.

## Fallback plan (unused)

If a future `@inquirer/prompts` major release inflates the bundle past 200 KB (e.g., new default imports that resist tree-shaking), replace with `@clack/prompts@^0.7.0` (~30 KB, zero deps) and re-run this measurement. `@clack` lacks a first-party testing kit, so `tests/prompts/*.test.ts` would need to switch to raw stdin mocking.

## Artifacts

Scratch files removed after measurement: `scratch-entry.mjs`, `scratch-bundle.mjs`, `scratch-bundle-raw.mjs`.
