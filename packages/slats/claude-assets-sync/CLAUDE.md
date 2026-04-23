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
- `./buildHashes` — `buildHashes({ packageRoot? })` library function shared with the `claude-build-hashes` bin

Bin entries: `claude-sync`, `claude-build-hashes` (standalone CLI for hash generation).

## CLI Surface

```
claude-sync [--scope=user|project|local] [--dry-run] [--force]
            [--package=@scope/pkg] [--all]
            [--root=<cwd>] [--no-workspaces]

claude-sync list [--json] [--root=<cwd>]
claude-sync build-hashes [pkgRoot]
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

The implicit `--package` target is picked in this order: `--all` / `--package` > **consumer that owns `process.cwd()`** > `invokedFromBin` consumer (fallback) > sole discovered consumer > error. The `invokedFromBin: import.meta.url` hint in the stub keeps the fallback working for `npx -p <pkg> claude-sync` and similar launches from cwds outside every consumer root. Consumers can still override via `--package=<other>` or `--all`. Slats's own top-level bin (`./dist/main.mjs`) omits `invokedFromBin` so it behaves as a cross-consumer dispatcher.

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
├── main.ts                         # primary bin entry — calls runCli(process.argv, { version })
├── index.ts                        # public programmatic barrel
├── commands/
│   ├── runCli/                     # top-level CLI (default inject + list + build-hashes)
│   ├── listConsumers/              # `claude-sync list` tabular / JSON handler
│   └── buildHashesCmd/             # `claude-sync build-hashes [pkgRoot]` handler
├── core/
│   ├── hash/                       # sha256 compute / compare
│   ├── hashManifest/               # dist/claude-hashes.json IO + namespace prefixes
│   ├── scope/                      # user | project | local → target dir
│   ├── buildPlan/                  # copy / skip / warn-diverged / warn-orphan / delete
│   └── injectDocs/                 # orchestrate plan → apply (UI-free)
├── discover/                       # node_modules + yarn workspace walker
├── prompts/                        # @inquirer/prompts-based selectScope + confirmForce
└── utils/                          # asyncPool, heartbeat, logger, types, version (organ)
```

Each directory is a fractal with `index.ts` barrel + `INTENT.md`; helpers live under `utils/` organs inside each fractal.

## Hash Strategy (Option A)

- `dist/claude-hashes.json` is the sole source of truth (schema v1, `previousVersions: {}` reserved).
- Consumer-side comparison: copy if missing, skip if equal, warn+require `--force` if different.
- `--force` in TTY: interactive confirm via `@inquirer/prompts.confirm` shows diverged/orphan file list. Non-TTY: stderr emission + exit 0.

## Boundaries

- `src/core/**` never imports from `src/prompts/`, `src/commands/`, or `src/utils/heartbeat.ts`. Heartbeat is wrapped at the command layer.
- `src/prompts/` is the sole prompt surface (no ink/react).
- `scripts/buildHashes.mjs` stays pure Node ESM (no top-level await) so Rollup can bundle it; `scripts/claude-build-hashes.mjs` holds the self-executing CLI wrapper.

## Build Output

`dist/index.{mjs,cjs,d.ts}` + `dist/main.mjs` (shebang) + subpath entrypoints per rollup config.
