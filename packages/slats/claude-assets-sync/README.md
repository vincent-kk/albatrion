# @slats/claude-assets-sync

Engine + dispatcher CLI that lets any npm package ship its own Claude Code docs (skills, rules, commands) and inject them into a user's `.claude/` directory. Consumers declare `claude.assetPath` in `package.json` and the engine's `inject-claude-settings` bin handles the rest.

## Overview

A consumer package declares `claude.assetPath` in `package.json` and runs `claude-build-hashes` during build to emit `dist/claude-hashes.json`. End users run `npx -p @slats/claude-assets-sync inject-claude-settings --package=<name>` and this engine resolves that single package's metadata via `createRequire`, compares the hash manifest against the target `.claude/`, and copies only what is out of date.

The library operates on exactly one consumer per invocation — the one named in `--package`. It never walks `node_modules` for siblings; it never enumerates workspaces.

No GitHub fetch, no `.sync-meta.json`, no migrations — the consumer's `dist/claude-hashes.json` is the single source of truth.

## Install

```bash
npm install -D @slats/claude-assets-sync
# or
yarn add -D @slats/claude-assets-sync
```

## CLI Surface

```
inject-claude-settings --package=<name> [--scope=user|project] [--dry-run] [--force] [--root=<cwd>]
claude-build-hashes
```

### End-user invocation

The engine is not shipped as a runtime dependency of consumers. Always invoke via `npx -p @slats/claude-assets-sync ...`; the package manager fetches and caches the engine on demand.

```bash
npx -p @slats/claude-assets-sync inject-claude-settings --package=@canard/schema-form --scope=user
```

| Flag | Meaning |
|---|---|
| `--package <name>` | **Required.** Scoped npm name of a consumer that declares `claude.assetPath`. |
| `--scope=user` | `~/.claude` (applies globally). |
| `--scope=project` | Nearest ancestor `.claude` directory, or `<cwd>/.claude` if none found. |
| `--dry-run` | Print the copy / skip / warn plan, no writes. |
| `--force` | Overwrite diverged files & delete orphans (interactive confirm on TTY). |
| `--root <path>` | Override scope-resolution cwd. |

**Exit codes**: `0` success / up-to-date / dry-run, `1` runtime error, `2` user / configuration error (missing `--package`, missing `--scope` in non-TTY, unresolvable package, missing `claude.assetPath`).

For `--scope=project` the target `.claude` directory is resolved by walking up from `process.cwd()` to the nearest existing `.claude` ancestor; the CLI logs `(auto-located)` when this happens.

## Consumer Integration (2 steps)

### 1. `package.json`

```jsonc
{
  "name": "@your-scope/your-package",
  "scripts": {
    "build": "… && yarn build:hashes",
    "build:hashes": "claude-build-hashes"
  },
  "devDependencies": {
    "@slats/claude-assets-sync": "workspace:^"
  },
  "files": ["dist", "docs", "README.md"],
  "claude": { "assetPath": "docs/claude" }
}
```

- `@slats/claude-assets-sync` MUST be in `devDependencies` — the engine is a CLI-only tool and must not leak into end-user production installs. See Rationale below.
- Do **not** add any `bin` field. The engine is the sole CLI surface; per-consumer bins would collide under `node_modules/.bin/`.
- Do **not** expose `./bin/*` or `./docs/*` in `exports`. That would let consumer bundlers pull CLI code or the asset tree into app bundles.
- Do **not** create a `bin/` or `scripts/` directory in the consumer.

### 2. Build

```bash
yarn build
# rolls up the library, emits types, then `claude-build-hashes` hashes every
# file under `claude.assetPath` and writes dist/claude-hashes.json
```

Ship the resulting `dist/` (including `claude-hashes.json`) alongside `docs/` when you publish.

### Rationale: `devDependencies`, not `dependencies`

- The engine is used at two moments only: (1) the consumer's own build, where `claude-build-hashes` produces `dist/claude-hashes.json`, and (2) the end user's one-off `inject-claude-settings` invocation. Neither is runtime behaviour of the consumer library.
- Putting the engine in `dependencies` would force every downstream installer of the consumer to pull `commander`, `@inquirer/prompts`, and their transitive trees into their production `node_modules` — dead weight for anyone who never sets up Claude Code assets.
- The workspace build chain still resolves `.bin/claude-build-hashes` from `devDependencies` at `yarn install` time; yarn workspaces link devDeps and deps identically for workspace-local builds.
- End users never rely on a hoisted `inject-claude-settings` bin. The canonical invocation is `npx -p @slats/claude-assets-sync inject-claude-settings --package=<THIS>`, which fetches the engine on demand and caches it.
- Bundle isolation is enforced by the import graph (`src/**` in the consumer never references the engine), not by dependency-type.

## Authoring `docs/claude/`

Any tree works, but the recommended layout matches Claude Code conventions:

```
docs/claude/
├── skills/
│   └── <skill-name>/
│       ├── SKILL.md
│       └── knowledge/...
├── rules/...
└── commands/...
```

Every file under the asset root is hashed and tracked in `dist/claude-hashes.json`.

## Hash-Based Sync Strategy (Option A)

- `dist/claude-hashes.json` (schema v1) is the sole source of truth.
- Per-file SHA-256 comparison:
  - **missing locally** → copy
  - **hash equal** → skip
  - **hash differs** → warn + require `--force` (user edit vs. source update is indistinguishable by design)
  - **file is outside the manifest but under a managed prefix (`skills/<name>/`)** → orphan; requires `--force` to delete

- `--force` on TTY opens an interactive confirm via `@inquirer/prompts.confirm`, listing up to 3 diverged/orphan paths.
- `--force` on non-TTY prints the divergent list to stderr and proceeds.

## Architectural Invariants

- `src/core/**` never reads `package.json` or walks the filesystem. Only the `bin/` layer (and `src/commands/runCli/utils/resolvePackage.ts`, invoked from that dispatcher) is allowed to resolve a single explicitly-named target via `createRequire().resolve('${name}/package.json')`. Cross-package discovery (`--all`, workspace scan) is not supported.
- Prompts go through `@inquirer/prompts` only. No ink, no React.
- The engine assumes one consumer per invocation. That is the stable contract — extensions require explicit re-architecture.

## Programmatic API

```ts
import {
  runCli,
  injectDocs,
  readHashManifest,
  resolveScope,
  isInteractive,
  isValidScope,
  computeNamespacePrefixes,
} from '@slats/claude-assets-sync';
```

See `src/index.ts` and `src/DETAIL.md` for the full export surface.

## Additional Docs

- `docs/consumer-integration.md` — complete consumer checklist (package.json patches, verification steps, end-user install topologies)
- `docs/bundle-size-decision.md` — why `@inquirer/prompts` over ink

## License

MIT — see [LICENSE](./LICENSE).
