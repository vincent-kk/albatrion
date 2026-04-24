# CLAUDE.md

`@slats/claude-assets-sync` — shared engine + dispatcher that lets any npm package ship its own Claude Code docs and inject them into a user's `.claude/` through the `inject-claude-settings` bin. Consumers own no runtime files — they declare `claude.assetPath` in `package.json` and hand the rest to the engine.

## Commands

```bash
yarn build           # inject-version → rollup (ESM + CJS) → build:types → build:hashes
yarn test            # vitest
yarn lint            # eslint
```

## Public API

- `.` (main barrel)
  - `runCli(argv: string[]): Promise<void>` — dispatcher entry. Parses `--package=<name>` from argv.
  - `injectDocs(options)` — headless programmatic inject (UI-free). Caller owns metadata.
  - `readHashManifest`, `resolveScope`, `computeNamespacePrefixes`, `isInteractive`, `isValidScope`, `HASH_MANIFEST_FILENAME`
- `./buildHashes` — `buildHashes(options?)` produces `<packageRoot>/dist/claude-hashes.json`.

Bin entries:
- `inject-claude-settings` — the dispatcher. Two-line stub in `bin/inject-claude-settings.mjs` calls `runCli(process.argv)`.
- `claude-build-hashes` — standalone bin that parses `process.cwd()/package.json` and delegates to `buildHashes`. Consumer convention: `pkg.claude?.assetPath ?? 'claude'`.

## CLI Surface

```
inject-claude-settings --package=<name> [--scope=user|project] [--dry-run] [--force] [--root=<cwd>]
```

The library operates on exactly one consumer per invocation — the target named in `--package`. Cross-package discovery (`--all`, workspace scan) is not supported.

## Consumer Integration Pattern

Each consumer ships only:

```
<consumer>/
  docs/claude/ (or any path)   # authored content — caller picks the path
  dist/claude-hashes.json      # GENERATED at build, publish-included
  package.json: {
    "scripts": { "build:hashes": "claude-build-hashes" },
    "dependencies": { "@slats/claude-assets-sync": "workspace:^" },
    "claude": { "assetPath": "docs/claude" }
  }
```

No bin stub. No scripts wrapper. No `bin/` or `scripts/` directory in the consumer.

Consumer `package.json` should:
- `scripts.build:hashes: "claude-build-hashes"` — engine bin, transitively hoisted from `dependencies`
- `dependencies: { "@slats/claude-assets-sync": "workspace:^" }` — MUST NOT be `devDependencies` or `peerDependencies`
- `claude.assetPath: "docs/claude"` — consumer-side convention
- `files: ["dist", "docs", "README.md"]` — NEVER include `"bin"` or `"scripts"`
- NEVER expose `./bin/*` or `./docs/*` in `exports`

The `claude.assetPath` field is a **consumer-side convention**; the engine dispatcher exits 2 when it is missing. `claude-build-hashes` silently no-ops when the field is missing — that is the intentional opt-out.

For `--scope=project`, the target `.claude` directory is resolved by walking up from `process.cwd()` and reusing the nearest existing `.claude` ancestor; the CLI logs `(auto-located)` when this happens. If no ancestor owns a `.claude`, it falls back to `process.cwd()/.claude`.

### End-user invocation

```bash
# universal — every PM (pnpm strict / yarn-berry PnP included)
npx -p @slats/claude-assets-sync inject-claude-settings --package=@canard/schema-form --scope=user

# simple — npm / yarn-classic only (relies on transitive bin hoist)
npx inject-claude-settings --package=@canard/schema-form --scope=user
```

## Architecture

```
bin/
├── inject-claude-settings.mjs      # 2-line dispatcher
src/
├── index.ts                        # public programmatic barrel
├── commands/
│   └── runCli/                     # sole CLI surface
│       ├── runCli.ts               # commander root + action
│       ├── utils/resolvePackage.ts # dispatcher-only single-target resolve
│       ├── utils/runInject.ts      # orchestrator
│       └── utils/injectOne.ts      # per-target inject
├── core/
│   ├── hash/                       # sha256 compute / compare
│   ├── hashManifest/               # dist/claude-hashes.json IO + namespace prefixes
│   ├── scope/                      # user | project → target dir
│   ├── buildPlan/                  # copy / skip / warn-diverged / warn-orphan / delete
│   └── injectDocs/                 # orchestrate plan → apply (UI-free)
├── prompts/                        # @inquirer/prompts-based selectScope + confirmForce
└── utils/                          # asyncPool, heartbeat, logger, types, version (organ)
scripts/
├── buildHashes.mjs                 # pure Node ESM, importable from Rollup
└── claude-build-hashes.mjs         # self-executing bin
```

Each directory under `src/` is a fractal with `index.ts` barrel + `INTENT.md`.

## Hash Strategy (Option A)

- `dist/claude-hashes.json` is the sole source of truth (schema v1, `previousVersions: {}` reserved).
- Per-file SHA-256 comparison: copy if missing, skip if equal, warn + require `--force` if different.
- `--force` on TTY: interactive confirm via `@inquirer/prompts.confirm` listing diverged/orphan files. Non-TTY: stderr emission + proceed.

## Boundaries

- `src/core/**` never imports from `src/prompts/`, `src/commands/`, or `src/utils/heartbeat.ts`. Heartbeat is wrapped at the command layer.
- `src/core/**` and `src/utils/**` never read `package.json` or walk the filesystem. Only the `bin/` dispatcher layer (and `src/commands/runCli/utils/resolvePackage.ts`, invoked from that dispatcher) is allowed to resolve a single caller-named target.
- `src/prompts/` is the sole prompt surface (no ink/react).
- `scripts/buildHashes.mjs` stays pure Node ESM (no top-level await) so Rollup can import it; `scripts/claude-build-hashes.mjs` holds the self-executing CLI wrapper.

## Build Output

`dist/index.{mjs,cjs,d.ts}` + subpath entrypoints per rollup config.
