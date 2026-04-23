# Consumer Integration Template

How to make a package "claude-sync aware" so `claude-sync` discovers and injects its `docs/claude/` tree into end-user `.claude` directories.

## 1. `package.json` additions

```jsonc
{
  "name": "@your-scope/your-package",
  "version": "…",
  "bin": {
    "claude-sync": "./bin/claude-sync.mjs"
  },
  "files": [
    "dist",
    "docs",
    "dist/claude-hashes.json",
    "bin",
    "README.md"
  ],
  "scripts": {
    "build": "… && yarn build:hashes",
    "build:hashes": "node scripts/build-hashes.mjs"
  },
  "dependencies": {
    "@slats/claude-assets-sync": "workspace:^",
  },
  "claude": {
    "assetPath": "docs/claude"
  }
}
```

Do **not** expose `./bin/*` in `exports`. That would let consumer bundlers accidentally pull CLI code into app bundles.

## 2. `bin/claude-sync.mjs` (3-line re-export stub)

```javascript
#!/usr/bin/env node
import { runCli } from '@slats/claude-assets-sync';

runCli(process.argv).catch((err) => {
  process.stderr.write(
    `[@your-scope/your-package] claude-sync failed: ${err instanceof Error ? err.message : String(err)}\n`,
  );
  process.exit(1);
});
```

Remember `chmod +x bin/claude-sync.mjs` (or rely on `files` entry to ship executable bit via npm).

## 3. `scripts/build-hashes.mjs` (one line import)

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

This reads the current `package.json` + its `claude.assetPath`, hashes every file under the asset root (ignoring `.omc/**`, `*.log`, `.DS_Store`), and writes `dist/claude-hashes.json`.

## 4. Isolation guardrails (optional but recommended)

In a `.dependency-cruiser.cjs`:

```javascript
{
  name: 'src-no-bin',
  severity: 'error',
  from: { path: '^src/' },
  to: { path: '^bin/' },
},
{
  name: 'src-no-docs',
  severity: 'error',
  from: { path: '^src/' },
  to: { path: '^docs/' },
},
{
  name: 'src-no-claude-assets-sync',
  severity: 'error',
  from: { path: '^src/' },
  to: { path: 'node_modules/@slats/claude-assets-sync' },
},
```

Plus `"sideEffects": false` in `package.json`. The guardrails ensure the CLI engine never leaks into consumer runtime bundles.

## 5. End-user invocations

| Install topology | Working invocations |
|---|---|
| Consumer is a **direct dep** of the user's project | `npx claude-sync --scope=user` *(bare)* |
| Always works (preferred in docs) | `npx -p @your-scope/your-package claude-sync --scope=user` |
| Consumer is a **transitive dep** | `npx -p @your-scope/your-package claude-sync --scope=user` |
| User has no consumer installed | `npx @slats/claude-assets-sync --package=@your-scope/your-package --scope=user` |
| Multiple consumers discovered | `npx claude-sync --package=@your-scope/your-package` *or* `npx claude-sync --all` |

## 6. Authoring `docs/claude/`

Any file tree works, but the recommended layout is:

```
docs/claude/
├── skills/
│   └── <skill-name>/
│       ├── SKILL.md
│       └── knowledge/...
├── rules/...
└── commands/...
```

The hash manifest tracks every file under `docs/claude/` relative to the asset root. On inject, the CLI copies skills/rules/commands into the matching subtree under `.claude/`.

## 7. Verification checklist

- [ ] `yarn build` succeeds and emits `dist/claude-hashes.json` alongside the rest of `dist/`.
- [ ] `node bin/claude-sync.mjs --help` prints the `claude-sync` subcommand tree.
- [ ] `node bin/claude-sync.mjs list --json` emits an entry for your package with `hashesPresent: true`.
- [ ] `node bin/claude-sync.mjs --scope=project --dry-run --package=@your-scope/your-package` emits a copy plan.
- [ ] `yarn depcheck` (or whatever your dep-cruiser invocation is named) reports zero new violations.
- [ ] Consumer bundler tree-shakes away CLI code (verify by greping the built bundle: should contain zero references to `@slats/claude-assets-sync`).
