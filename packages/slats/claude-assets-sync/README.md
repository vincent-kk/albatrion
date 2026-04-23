# @slats/claude-assets-sync

Shared CLI engine that lets any npm package ship its own Claude Code docs (skills, rules, commands) and inject them into a user's `.claude/` directory through a thin `claude-sync` bin stub.

## Overview

A package becomes "claude-sync aware" by declaring `claude.assetPath` in its `package.json` and shipping a 3-line `bin/claude-sync.mjs` wrapper. End users run `npx claude-sync` (or the consumer's own bin) and this engine walks the workspace + `node_modules` tree, compares a per-file SHA-256 manifest against the target `.claude/`, and copies only what's out of date.

No GitHub fetch, no `.sync-meta.json`, no migrations — the consumer's `dist/claude-hashes.json` is the single source of truth.

## Install

```bash
npm install -D @slats/claude-assets-sync
# or
yarn add -D @slats/claude-assets-sync
```

## CLI Surface

```
claude-sync [--scope=user|project|local] [--dry-run] [--force]
            [--package=@scope/pkg] [--all]
            [--root=<cwd>] [--no-workspaces]

claude-sync list [--json] [--root=<cwd>]
claude-sync build-hashes [pkgRoot]
```

### Default action — inject

Default invocation discovers every consumer reachable from the current workspace + all ancestor `node_modules`, picks one target (see precedence below), and syncs its `docs/claude/` tree into the chosen scope.

| Flag | Meaning |
|---|---|
| `--scope=user` | `~/.claude` (applies globally) |
| `--scope=project` | nearest ancestor `.claude` or `<cwd>/.claude` |
| `--scope=local` | same path as `project`, expected to be gitignored |
| `--dry-run` | print the copy / skip / warn plan, no writes |
| `--force` | overwrite diverged files & delete orphans (interactive confirm on TTY) |
| `--package=<name>` | target a single consumer by package name |
| `--all` | inject every discovered consumer |
| `--root=<cwd>` | override the walk origin |
| `--no-workspaces` | skip yarn workspace discovery (shallow `node_modules` only) |

**Target precedence**: `--all` / `--package` > consumer owning `process.cwd()` > consumer owning `invokedFromBin` > sole discovered consumer > error.

### `list`

```bash
claude-sync list          # tabular view
claude-sync list --json   # structured output for scripts
```

### `build-hashes`

```bash
claude-sync build-hashes            # writes <cwd>/dist/claude-hashes.json
claude-sync build-hashes packages/x # writes packages/x/dist/claude-hashes.json
```

## Consumer Integration (3 steps)

### 1. `package.json`

```jsonc
{
  "name": "@your-scope/your-package",
  "bin": { "claude-sync": "./bin/claude-sync.mjs" },
  "files": ["dist", "docs", "dist/claude-hashes.json", "bin", "README.md"],
  "scripts": {
    "build": "… && yarn build:hashes",
    "build:hashes": "node scripts/build-hashes.mjs"
  },
  "dependencies": {
    "@slats/claude-assets-sync": "workspace:^"
  },
  "claude": { "assetPath": "docs/claude" }
}
```

Do **not** expose `./bin/*` in `exports` — that would let consumer bundlers pull CLI code into app bundles.

### 2. `bin/claude-sync.mjs` (3-line re-export stub)

```javascript
#!/usr/bin/env node
import { runCli } from '@slats/claude-assets-sync';

runCli(process.argv, { invokedFromBin: import.meta.url }).catch((err) => {
  process.stderr.write(
    `[@your-scope/your-package] claude-sync failed: ${err instanceof Error ? err.message : String(err)}\n`,
  );
  process.exit(1);
});
```

### 3. `scripts/build-hashes.mjs`

```javascript
#!/usr/bin/env node
import { buildHashes } from '@slats/claude-assets-sync/buildHashes';

try {
  const { outPath, fileCount } = await buildHashes();
  console.log(`✓ claude-hashes.json written: ${fileCount} file(s) → ${outPath}`);
} catch (err) {
  console.error('❌ buildHashes failed:', err?.message ?? err);
  process.exit(1);
}
```

`buildHashes` reads the current `package.json`'s `claude.assetPath`, hashes every file beneath it (ignoring `.omc/**`, `*.log`, `.DS_Store`), and writes `dist/claude-hashes.json`.

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

## Programmatic API

```ts
import {
  runCli,
  discover,
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

- `docs/consumer-integration.md` — complete consumer checklist (dep-cruiser rules, verification steps, end-user install topologies)
- `docs/bundle-size-decision.md` — why `@inquirer/prompts` over ink

## License

MIT — see [LICENSE](./LICENSE).
