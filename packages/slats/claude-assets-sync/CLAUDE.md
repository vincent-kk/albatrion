# CLAUDE.md

`@slats/claude-assets-sync` — shared CLI engine for injecting Claude docs from a consumer package's `docs/claude` tree into a user's `.claude` directory.

## Commands

```bash
yarn build     # inject-version → rollup (ESM + CJS) → build:types
yarn dev       # standalone bin (uses cwd as packageRoot)
yarn test      # vitest
yarn lint      # eslint
```

## Public API

- `./cli` — `program({ packageName, packageVersion, packageRoot, assetRoot?, argv? })`. Called by each consumer's `bin/inject-docs.mjs` wrapper.
- `.` — programmatic: `program`, `injectDocs`, `readHashManifest`, `resolveScope`, etc.
- `./buildHashes` — `buildHashes({ packageName, packageVersion, packageRoot, assetPathRel? })`. Called from each consumer's `scripts/build-hashes.mjs` during its own build.

## Consumer Integration Pattern

```
<consumer>/
  bin/inject-docs.mjs          # 15-line wrapper → @slats/claude-assets-sync/cli
  scripts/build-hashes.mjs     # calls buildHashes → dist/claude-hashes.json
  docs/claude/                  # authored content
  dist/claude-hashes.json      # GENERATED at build, publish-included
```

Consumer `package.json` must:
- `bin: { "inject-docs": "./bin/inject-docs.mjs" }`
- `files: [..., "bin"]`
- `dependencies: { "@slats/claude-assets-sync": "^0.2.0" }`
- `scripts.build` chains `yarn build:hashes`
- NEVER expose `./bin/*` in `exports` (blocks consumers from accidentally importing CLI into a bundle)

## Architecture

```
src/
├── program.ts              # ./cli subpath — Commander program factory
├── index.ts                # programmatic barrel
├── cli.ts                  # standalone dev bin
├── core/
│   ├── hash.ts             # sha256 compute/compare
│   ├── scope.ts            # user | project | local → target dir
│   ├── hashManifest.ts     # dist/claude-hashes.json IO + namespace prefix derivation
│   ├── injectPlan.ts       # copy / skip / warn-diverged / warn-orphan / delete
│   └── inject.ts           # orchestrate plan → apply
├── commands/
│   ├── inject.ts           # commander binding for `inject-docs`
│   └── _deprecated.ts      # 7 legacy stubs (exit 1 + MIGRATION.md pointer)
├── components/
│   ├── primitives/         # Box, Text, Spinner
│   ├── shared/             # Confirm, MenuItem, …
│   └── inject/             # ScopeSelect, ForceConfirm (confirmForceAsync wrapper)
└── utils/                  # asyncPool, logger, types
```

## Hash Strategy (Option A)

- `dist/claude-hashes.json` is the sole source of truth for file hashes (sha256, v1 schema, `previousVersions: {}` reserved for future Option A+).
- Consumer-side comparison: copy if missing, skip if equal, warn+require `--force` if different (user-edit vs source-update is indistinguishable).
- `--force` in TTY: interactive confirm prompt shows diverged file names (max 3) + "in git?" question. In non-TTY: emits diverged/orphan list to stderr, then proceeds (exit 0).

## Boundaries

- `src/` must never import `bin/` or `docs/` (depcruise rule on the consumer side).
- `components/` subdirectories (`primitives/`, `shared/`, `inject/`) are fractal modules with their own INTENT.md.
- `scripts/buildHashes.mjs` is pure ESM Node, runs outside rollup; ignores `.omc/**`, `*.log`, `.DS_Store`.

## Build Output

`dist/index.{mjs,cjs,d.ts}` + `dist/program.{mjs,cjs,d.ts}` + `dist/cli.mjs` (shebang, standalone dev bin).
