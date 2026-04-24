# CLAUDE.md

`@slats/claude-assets-sync` — generic single-consumer asset sync engine. The caller owns all package metadata (`packageRoot`, `packageName`, `packageVersion`, `assetPath`); the library never walks `node_modules` or yarn workspaces, and never reads `package.json`.

## Commands

```bash
yarn build           # inject-version → rollup (ESM + CJS) → build:types
yarn test            # vitest
yarn lint            # eslint
```

## Public API

- `.` (main barrel)
  - `runCli(argv, options)` — CLI entry. `options` MUST include `{ packageRoot, packageName, packageVersion, assetPath }`.
  - `injectDocs(options)` — headless programmatic inject (UI-free)
  - `readHashManifest`, `resolveScope`, `computeNamespacePrefixes`, `isInteractive`, `isValidScope`, `HASH_MANIFEST_FILENAME`
- `./buildHashes` — `buildHashes({ packageRoot, packageName, packageVersion, assetPath })` produces `<packageRoot>/dist/claude-hashes.json`.

Bin entries: `claude-build-hashes` (convenience standalone bin that parses `process.cwd()/package.json` with the consumer convention `pkg.claude?.assetPath ?? 'claude'`).

## CLI Surface

```
claude-sync [--scope=user|project] [--dry-run] [--force] [--root=<cwd>]
```

The library targets exactly one consumer per invocation — the one described by the caller's options. There is no cross-package discovery.

## Consumer Integration Pattern

Each consumer package ships:
```
<consumer>/
  bin/claude-sync.mjs          # reads its own package.json → calls runCli with metadata
  scripts/build-hashes.mjs     # reads its own package.json → calls buildHashes
  docs/claude/ (or any dir)    # authored content — caller picks the path
  dist/claude-hashes.json      # GENERATED at build, publish-included
```

Recommended stub shape:

```js
// bin/claude-sync.mjs
import { runCli } from '@slats/claude-assets-sync';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(
  await readFile(resolve(packageRoot, 'package.json'), 'utf-8'),
);

if (
  typeof pkg.claude?.assetPath === 'string' &&
  pkg.claude.assetPath.length > 0
) {
  runCli(process.argv, {
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
}
```

The `claude.assetPath` field in a consumer's `package.json` is a **consumer-side convention**; the library does not enforce or even know about it. Consumers are free to use any field shape and resolve `assetPath` in their stub.

For `--scope=project`, the target `.claude` directory is resolved by walking up from `process.cwd()` and reusing the nearest existing `.claude` ancestor; the CLI logs `(auto-located)` when this happens. If no ancestor owns a `.claude`, it falls back to `process.cwd()/.claude`.

Consumer `package.json` should:
- `bin: { "claude-sync": "./bin/claude-sync.mjs" }`
- `files: [..., "bin", "docs" (or wherever assets live), "dist/claude-hashes.json"]`
- `dependencies: { "@slats/claude-assets-sync": "workspace:^" }` (or the equivalent published range)
- Include `yarn build:hashes` in the build chain
- NEVER expose `./bin/*` in `exports` (blocks consumers from accidentally bundling the CLI)

## Architecture

```
src/
├── index.ts                        # public programmatic barrel
├── commands/
│   └── runCli/                     # sole CLI surface (default action only)
├── core/
│   ├── hash/                       # sha256 compute / compare
│   ├── hashManifest/               # dist/claude-hashes.json IO + namespace prefixes
│   ├── scope/                      # user | project → target dir
│   ├── buildPlan/                  # copy / skip / warn-diverged / warn-orphan / delete
│   └── injectDocs/                 # orchestrate plan → apply (UI-free)
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
- The library never reads `package.json` or walks the filesystem looking for other packages.
- `scripts/buildHashes.mjs` stays pure Node ESM (no top-level await) so Rollup can import it if needed; `scripts/claude-build-hashes.mjs` holds the self-executing CLI wrapper.

## Build Output

`dist/index.{mjs,cjs,d.ts}` + subpath entrypoints per rollup config.