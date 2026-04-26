# CLAUDE.md

`@slats/claude-assets-sync` — shared engine + dispatcher that lets any npm package ship its own Claude Code docs and inject them into a user's `.claude/` through the `inject-claude-settings` bin. Consumers own no runtime files — they declare `claude.assetPath` in `package.json` and hand the rest to the engine.

## Commands

```bash
yarn build           # inject-version → rollup (ESM) → build:types → build:hashes
yarn test            # vitest
yarn lint            # eslint
yarn dev:ui          # preview Ink phases (see scripts/dev-ui.tsx)
yarn dev:ui --tour   # cycle through all Ink phases with fixture data
```

## Public API

- `.` (main barrel, ESM-only)
  - `runCli(argv: string[]): Promise<void>` — dispatcher entry. Parses `--package <name...>` from argv (variadic: repeat or comma-separate). Each value is a scope alias (`@<scope>`), a scoped package (`@<scope>/<name>`), or an unscoped package (`<name>`).
  - Core primitives re-exported: `readHashManifest`, `computeNamespacePrefixes`, `resolveScope`, `buildPlan`, `applyAction`, `summarize`, `isValidScope`, `findNearestDotClaudeAncestor`, `hashContent`, `hashFile`, `hashEquals`, `HASH_MANIFEST_FILENAME`
  - No `injectDocs` orchestrator — both renderers (Ink `ui/` and plain `renderPlain`) compose primitives directly.
- `./buildHashes` — `buildHashes(options?)` produces `<packageRoot>/dist/claude-hashes.json`.

Bin entries (all map to the same engine; choose by invocation context):
- `claude-assets-sync` — npx canonical alias. Matches the package's unscoped name so `npx @slats/claude-assets-sync ...` works directly. Routes to the same dispatcher stub.
- `inject-claude-settings` — descriptive name for installed environments (`yarn add -D` / `npm i -g`). Two-line stub in `bin/inject-claude-settings.mjs` calls `runCli(process.argv)`.
- `claude-build-hashes` — standalone build helper that parses `process.cwd()/package.json` and delegates to `buildHashes`.

The commander `name(...)` is derived from `argv[1]` basename at runtime, so help/error output reflects the actual invocation (`claude-assets-sync` vs `inject-claude-settings`).

## CLI Surface

```
<bin> --package <name...> [--scope=user|project] [--dry-run] [--force] [--root=<cwd>] [--json]
```

Where `<bin>` is `claude-assets-sync` (npx) or `inject-claude-settings` (installed). Both bins point at the same dispatcher.

`--package` is variadic. Each value is classified by shape:

| Shape | Meaning |
|-------|---------|
| `@<scope>` (no slash) | all packages under the npm scope (workspace-enumerated) |
| `@<scope>/<name>` | one scoped package |
| `<name>` (no `@`) | one unscoped package |
| anything else | invalid → exit 2 |

`--json` forces the non-Ink `renderPlain` path (machine-friendly output). Non-TTY automatically uses the same path.

Repeat the flag or comma-separate values. Targets are deduped by resolved package name.

Workspace enumeration (scope alias) is confined to `src/commands/runCli/utils/resolveScopeAlias.ts`.

## Render Paths

- **TTY + no `--json`**: `renderOrFallback` dynamic-imports `src/ui/index.js` and calls `renderInjectApp(input)`. The Ink app composes `core/**` primitives through `useInjectSession` + per-step hooks (`useResolveStep`, `usePlanStep`, `useForceConfirmStep`, `useApplyStep`).
- **Non-TTY or `--json`**: `renderOrFallback` calls `renderPlain(targets, flags, originCwd)` which composes the same `core/**` primitives with picocolors text output.
- Both paths share the same primitives; no `injectDocs(opts)` orchestrator in between.

## Consumer Integration Pattern

Each consumer ships only:

```
<consumer>/
  docs/claude/ (or any path)   # authored content — caller picks the path
  dist/claude-hashes.json      # GENERATED at build, publish-included
  package.json: {
    "scripts": { "build:hashes": "claude-build-hashes" },
    "devDependencies": { "@slats/claude-assets-sync": "workspace:^" },
    "claude": { "assetPath": "docs/claude" }
  }
```

Consumers must:
- `scripts.build:hashes: "claude-build-hashes"` — engine bin, linked into workspace `.bin/` at install time
- `devDependencies: { "@slats/claude-assets-sync": "workspace:^" }` — MUST be devDependencies
- `claude.assetPath: "docs/claude"` — consumer-side convention
- `files: ["dist", "docs", "README.md"]` — NEVER include `"bin"` or `"scripts"`

End users invoke via `npx @slats/claude-assets-sync --package=<name>`.

## Architecture

```
bin/
└── inject-claude-settings.mjs      # 2-line dispatcher (ESM)
src/
├── index.ts                        # ESM public barrel (runCli + core primitives)
├── commands/
│   └── runCli/
│       ├── runCli.ts               # commander root + action
│       └── utils/
│           ├── classifyTarget.ts   # pure: scope | package | invalid
│           ├── resolvePackage.ts   # single-target resolve
│           ├── resolveScopeAlias.ts# scope → packages enumeration (only enumerator)
│           ├── resolveTargets.ts   # classify/resolve/dedupe orchestrator
│           ├── resolveScopeFlag.ts # plain-path scope flag validator
│           ├── toConsumerPackages.ts # metadata → ConsumerPackage
│           ├── renderOrFallback.ts # TTY vs plain branch + dynamic UI import
│           └── renderPlain.ts      # non-TTY/--json picocolors renderer
├── core/
│   ├── hash/                       # sha256 compute / compare
│   ├── hashManifest/               # dist/claude-hashes.json IO + namespace prefixes
│   ├── scope/                      # user | project → target dir
│   ├── buildPlan/                  # copy / skip / warn-diverged / warn-orphan / delete
│   └── injectDocs/                 # apply + summarize primitives (no orchestrator)
├── ui/                             # Ink React TTY path (internal only)
│   ├── InjectApp/                  # phase state machine + <InjectApp/>
│   ├── components/                 # Banner, StepTracker, PlanTable, ...
│   ├── hooks/                      # pipeline hooks + useInjectSession
│   ├── theme/                      # colors, icons, layout
│   └── types/                      # Phase, InjectEvent, RenderInput, target
└── utils/                          # asyncPool, logger, types, version
scripts/
├── buildHashes.mjs                 # pure Node ESM, importable from Rollup
├── claude-build-hashes.mjs         # self-executing bin
├── dev-ui.tsx                      # Ink phase preview / tour
└── dev-ui-fixtures.ts              # mock plans + targets for dev preview
```

## Hash Strategy (Option A)

- `dist/claude-hashes.json` is the sole source of truth (schema v1, `previousVersions: {}` reserved).
- Per-file SHA-256 comparison: copy if missing, skip if equal, warn + require `--force` if different.
- `--force` on TTY: Ink `ConfirmForce` dialog. Non-TTY: stderr emission + proceed.

## Boundaries

- `src/core/**` never imports from `src/ui/`, `src/commands/`, or `src/utils/logger.ts` (applyAction has a single `logger.warn` for rare unlink failures, the only exception).
- `src/ui/**` never calls into `src/commands/**`; it's loaded via dynamic import from `renderOrFallback` only.
- `src/ui/` is **not** exposed as a package subpath — internal only.
- `scripts/buildHashes.mjs` stays pure Node ESM (no top-level await) so Rollup can import it; `scripts/claude-build-hashes.mjs` holds the self-executing CLI wrapper.

## Build Output

ESM-only: `dist/index.{mjs,d.ts}` + `dist/ui/**` + subpath entrypoints per rollup config.
