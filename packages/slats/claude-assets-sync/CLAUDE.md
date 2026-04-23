# CLAUDE.md

`@slats/claude-assets-sync` — thin CLI engine that discovers any package declaring `claude.assetPath` in its `package.json` and injects that package's `docs/claude/` tree into the user's `.claude` directory.

## Commands

```bash
yarn build           # inject-version → rollup (ESM + CJS) → build:types
yarn test            # vitest
yarn lint            # eslint
```

## Public API

- `.` (main barrel)
  - `runCli(argv, options?)` — primary CLI entry; used by consumers' `bin/claude-sync.mjs` 3-line stub
  - `discover(options?)` — returns `ConsumerPackage[]` for all packages with `claude.assetPath` in the walked tree
  - `injectDocs(options)` — headless programmatic inject (UI-free)
  - `readHashManifest`, `resolveScope`, `computeNamespacePrefixes`, `isInteractive`, `isValidScope`
  - `program` (`@deprecated`) — legacy factory retained for backward compat; scheduled for removal
- `./cli` — legacy `program()` factory subpath; forwards to the new prompts layer internally
- `./buildHashes` — `buildHashes({ packageRoot? })` library function shared with the `claude-build-hashes` bin

Bin entries: `claude-sync`, `claude-assets-sync` (legacy alias), `claude-build-hashes` (standalone CLI for hash generation).

## CLI Surface

```
claude-sync [--scope=user|project|local] [--dry-run] [--force]
            [--package=@scope/pkg] [--all]
            [--root=<cwd>] [--no-workspaces]

claude-sync list [--json] [--root=<cwd>]
claude-sync build-hashes [pkgRoot]
claude-sync inject-docs [options]    # legacy alias
```

## Consumer Integration Pattern

Each consumer package ships:
```
<consumer>/
  bin/claude-sync.mjs          # 3-line re-export stub → runCli(argv, { invokedFromBin: import.meta.url })
  scripts/build-hashes.mjs     # calls buildHashes → dist/claude-hashes.json
  docs/claude/                  # authored content
  dist/claude-hashes.json      # GENERATED at build, publish-included
```

The implicit `--package` target is picked in this order: `--all` / `--package` > **consumer that owns `process.cwd()`** > `invokedFromBin` consumer (fallback) > sole discovered consumer > error. The `invokedFromBin: import.meta.url` hint in the stub keeps the fallback working for `npx -p <pkg> claude-sync` and similar launches from cwds outside every consumer root. Consumers can still override via `--package=<other>` or `--all`. Slats's own top-level bin (`./dist/cli.mjs`) omits `invokedFromBin` so it behaves as a cross-consumer dispatcher.

For `--scope=project` / `--scope=local`, the target `.claude` directory is resolved by walking up from `process.cwd()` and reusing the nearest existing `.claude` ancestor; the CLI logs `(auto-located)` in its resolution line when this happens. If no ancestor owns a `.claude`, the CLI falls back to `process.cwd()/.claude`.

Consumer `package.json` must:
- `bin: { "claude-sync": "./bin/claude-sync.mjs" }`
- `files: [..., "bin", "docs", "dist/claude-hashes.json"]`
- `dependencies: { "@slats/claude-assets-sync": "workspace:^" }` (or the equivalent published range)
- `claude: { "assetPath": "docs/claude" }`
- Include `yarn build:hashes` in the build chain
- NEVER expose `./bin/*` in `exports` (blocks consumers from accidentally bundling the CLI)

## Architecture

```
src/
├── cli.ts                  # primary bin entry — calls runCli(process.argv, { version })
├── program.ts              # @deprecated legacy factory, retained for legacy consumer wrappers
├── index.ts                # public programmatic barrel
├── discover.ts             # node_modules + yarn workspace walker
├── core/
│   ├── hash.ts             # sha256 compute/compare
│   ├── scope.ts            # user | project | local → target dir
│   ├── hashManifest.ts     # dist/claude-hashes.json IO + namespace prefixes
│   ├── injectPlan.ts       # copy / skip / warn-diverged / warn-orphan / delete
│   └── inject.ts           # orchestrate plan → apply (UI-free, UNTOUCHED)
├── commands/
│   ├── root.ts             # top-level commander root + subcommand router
│   ├── inject.ts           # commander binding for `inject-docs` (also used by root default)
│   ├── list.ts             # `claude-sync list` handler (tabular + --json)
│   ├── buildHashesCmd.ts   # `claude-sync build-hashes` thin wrapper
│   └── _deprecated.ts      # legacy subcommand stubs (sync, add, list, …) — removed in v1.0
├── prompts/                # @inquirer/prompts-based selectScope + confirmForce
└── utils/
    ├── asyncPool.ts        # concurrency limiter (8)
    ├── heartbeat.ts        # wall-clock ticker at COMMAND layer (never touches core)
    ├── logger.ts           # picocolors-based; bold/heading/accent/heartbeat helpers
    └── types.ts
```

## Hash Strategy (Option A)

- `dist/claude-hashes.json` is the sole source of truth (schema v1, `previousVersions: {}` reserved).
- Consumer-side comparison: copy if missing, skip if equal, warn+require `--force` if different.
- `--force` in TTY: interactive confirm via `@inquirer/prompts.confirm` shows diverged/orphan file list. Non-TTY: stderr emission + exit 0.

## Boundaries

- `src/core/**` never imports from `src/prompts/`, `src/commands/`, or `src/utils/heartbeat.ts`. Heartbeat is wrapped at the command layer.
- The legacy ink/react tree (`src/components/**`) has been removed. Migration reference lives only in git history. `src/prompts/` is the sole prompt surface going forward.
- `scripts/buildHashes.mjs` stays pure Node ESM (no top-level await) so Rollup can bundle it; `scripts/claude-build-hashes.mjs` holds the self-executing CLI wrapper.

## Build Output

`dist/index.{mjs,cjs,d.ts}` + `dist/program.{mjs,cjs,d.ts}` + `dist/cli.mjs` (shebang) + `dist/discover.{mjs,cjs,d.ts}` + `dist/commands/*` + `dist/prompts/*`. Total ≈ 300 KB across both formats.
