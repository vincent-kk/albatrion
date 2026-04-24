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
  - `runCli(argv: string[]): Promise<void>` — dispatcher entry. Parses `--package <name...>` from argv (variadic: repeat or comma-separate). Each value is a scope alias (`@<scope>`), a scoped package (`@<scope>/<name>`), or an unscoped package (`<name>`).
  - `injectDocs(options)` — headless programmatic inject (UI-free). Caller owns metadata.
  - `readHashManifest`, `resolveScope`, `computeNamespacePrefixes`, `isInteractive`, `isValidScope`, `HASH_MANIFEST_FILENAME`
- `./buildHashes` — `buildHashes(options?)` produces `<packageRoot>/dist/claude-hashes.json`.

Bin entries:
- `inject-claude-settings` — the dispatcher. Two-line stub in `bin/inject-claude-settings.mjs` calls `runCli(process.argv)`.
- `claude-build-hashes` — standalone bin that parses `process.cwd()/package.json` and delegates to `buildHashes`. Consumer convention: `pkg.claude?.assetPath ?? 'claude'`.

## CLI Surface

```
inject-claude-settings --package <name...> [--scope=user|project] [--dry-run] [--force] [--root=<cwd>]
```

`--package` is variadic. Each value is classified by shape:

| Shape | Meaning |
|-------|---------|
| `@<scope>` (no slash) | all packages under the npm scope (workspace-enumerated) |
| `@<scope>/<name>` | one scoped package |
| `<name>` (no `@`) | one unscoped package |
| anything else | invalid → exit 2 |

Repeat the flag or comma-separate values. Targets are deduped by resolved package name.

Single-target invocations preserve v0.3.0 behaviour (asset-missing → exit 2; failure → exit report code). Batch invocations (scope alias or multi-target) warn and skip asset-missing packages, continue past individual failures, and exit 1 iff any target failed.

Workspace enumeration (scope alias) is confined to `src/commands/runCli/utils/resolveScopeAlias.ts`; every other file still operates on exactly one explicitly-named target.

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

No bin stub. No scripts wrapper. No `bin/` or `scripts/` directory in the consumer.

Consumer `package.json` should:
- `scripts.build:hashes: "claude-build-hashes"` — engine bin, linked into workspace `.bin/` at install time
- `devDependencies: { "@slats/claude-assets-sync": "workspace:^" }` — MUST be `devDependencies` (the engine is a CLI-only tool and must not leak into end-user production installs)
- `claude.assetPath: "docs/claude"` — consumer-side convention
- `files: ["dist", "docs", "README.md"]` — NEVER include `"bin"` or `"scripts"`
- NEVER expose `./bin/*` or `./docs/*` in `exports`

End users never install the engine transitively. They invoke the dispatcher via `npx -p @slats/claude-assets-sync inject-claude-settings --package=<name>`, which pulls the engine on demand and caches it. The workspace build chain still gets `.bin/claude-build-hashes` from devDependencies during `yarn install`.

The `claude.assetPath` field is a **consumer-side convention**; the engine dispatcher exits 2 when it is missing. `claude-build-hashes` silently no-ops when the field is missing — that is the intentional opt-out.

For `--scope=project`, the target `.claude` directory is resolved by walking up from `process.cwd()` and reusing the nearest existing `.claude` ancestor; the CLI logs `(auto-located)` when this happens. If no ancestor owns a `.claude`, it falls back to `process.cwd()/.claude`.

### End-user invocation

The engine is not shipped as a runtime dep of consumers. Always invoke via `npx -p @slats/claude-assets-sync ...`; the package manager fetches and caches the engine on demand.

```bash
# single scoped package
npx -p @slats/claude-assets-sync inject-claude-settings --package @canard/schema-form --scope=user

# all packages under an npm scope (scope alias — no slash)
npx -p @slats/claude-assets-sync inject-claude-settings --package @winglet --scope=user

# mixed targets: repeat --package or comma-separate
npx -p @slats/claude-assets-sync inject-claude-settings --package @canard --package @lerx/promise-modal --scope=user
npx -p @slats/claude-assets-sync inject-claude-settings --package @canard,@winglet --scope=user
```

## Architecture

```
bin/
├── inject-claude-settings.mjs      # 2-line dispatcher
src/
├── index.ts                        # public programmatic barrel
├── commands/
│   └── runCli/                         # sole CLI surface
│       ├── runCli.ts                   # commander root + action
│       ├── utils/classifyTarget.ts     # pure: scope | package | invalid
│       ├── utils/resolvePackage.ts     # single-target resolve
│       ├── utils/resolveScopeAlias.ts  # scope → packages enumeration (only enumerator)
│       ├── utils/resolveTargets.ts     # classify/resolve/dedupe orchestrator
│       ├── utils/runInject.ts          # batch orchestrator
│       └── utils/injectOne.ts          # per-target inject
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
- `src/core/**` and `src/utils/**` never read `package.json` or walk the filesystem. Only the `bin/` dispatcher layer is allowed to resolve consumer metadata: `src/commands/runCli/utils/resolvePackage.ts` resolves ONE caller-named target, and `src/commands/runCli/utils/resolveScopeAlias.ts` is the SOLE file permitted to enumerate workspace siblings (triggered only when a `--package` value is a scope alias like `@canard`).
- `src/prompts/` is the sole prompt surface (no ink/react).
- `scripts/buildHashes.mjs` stays pure Node ESM (no top-level await) so Rollup can import it; `scripts/claude-build-hashes.mjs` holds the self-executing CLI wrapper.

## Build Output

`dist/index.{mjs,cjs,d.ts}` + subpath entrypoints per rollup config.
