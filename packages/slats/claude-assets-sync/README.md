# @slats/claude-assets-sync

Shared CLI engine that lets any npm package ship its own Claude Code docs (skills, rules, commands) and inject them into a user's `.claude/` directory through a thin `claude-sync` bin stub.

## Overview

A consumer package ships a thin `bin/claude-sync.mjs` stub that reads its own `package.json` and calls `runCli(argv, { packageRoot, packageName, packageVersion, assetPath })`. End users run `npx claude-sync` (or the consumer's own bin alias) and this engine compares a per-file SHA-256 manifest against the target `.claude/`, copying only what is out of date. The library operates on exactly one consumer per invocation — the one supplied by the caller; it never walks `node_modules` or yarn workspaces.

No GitHub fetch, no `.sync-meta.json`, no migrations — the consumer's `dist/claude-hashes.json` is the single source of truth.

## Install

```bash
npm install -D @slats/claude-assets-sync
# or
yarn add -D @slats/claude-assets-sync
```

## CLI Surface

```
claude-sync [--scope=user|project] [--dry-run] [--force]
```

Each consumer package exposes its own `claude-sync` bin entry (see [Consumer Integration](#consumer-integration-3-steps) below). When invoked, the engine operates on exactly one consumer — the one whose metadata was passed by the stub. There is no cross-package discovery.

| Flag | Meaning |
|---|---|
| `--scope=user` | `~/.claude` (applies globally) |
| `--scope=project` | nearest ancestor `.claude` directory, or `<cwd>/.claude` if none found |
| `--dry-run` | print the copy / skip / warn plan, no writes |
| `--force` | overwrite diverged files & delete orphans (interactive confirm on TTY) |

**Exit codes**: `0` success / up-to-date / dry-run, `1` runtime error, `2` user / configuration error (e.g. missing `--scope` in non-TTY, invalid `assetPath`).

For `--scope=project` the target `.claude` directory is resolved by walking up from `process.cwd()` to the nearest existing `.claude` ancestor; the CLI logs `(auto-located)` when this happens.

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

### 2. `bin/claude-sync.mjs`

```javascript
#!/usr/bin/env node
import { runCli } from '@slats/claude-assets-sync';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(
  await readFile(resolve(packageRoot, 'package.json'), 'utf-8'),
);

if (typeof pkg.claude?.assetPath !== 'string') {
  process.stderr.write(
    `[claude-sync] missing or invalid "claude.assetPath" in ${resolve(packageRoot, 'package.json')}\n`,
  );
  process.exit(2);
}

await runCli(process.argv, {
  packageRoot,
  packageName: pkg.name,
  packageVersion: pkg.version,
  assetPath: pkg.claude.assetPath,
}).catch((err) => {
  process.stderr.write(
    `[${pkg.name}] claude-sync failed: ${err instanceof Error ? err.message : String(err)}\n`,
  );
  process.exit(1);
});
```

The `claude.assetPath` field in the consumer's `package.json` is a **consumer-side convention**; the library does not enforce or read it. Consumers are free to resolve `assetPath` in any way they choose and pass the result to `runCli`.

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
