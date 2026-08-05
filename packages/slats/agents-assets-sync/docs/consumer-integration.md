# Consumer Integration Template

How to make a package ship Claude Code assets through the `inject-agents-settings` dispatcher. Two fields in `package.json`; no stub code.

## 1. `package.json` additions

```jsonc
{
  "name": "@your-scope/your-package",
  "version": "…",
  "scripts": {
    "build": "… && yarn build:hashes",
    "build:hashes": "agents-build-hashes"
  },
  "devDependencies": {
    "@slats/agents-assets-sync": "workspace:^"
  },
  "files": ["dist", "docs", "README.md"],
  "claude": {
    "assetPath": "docs/claude"
  }
}
```

- `@slats/agents-assets-sync` MUST be in `devDependencies`. The engine is a CLI-only tool; declaring it in `dependencies` would pull `commander`, `@inquirer/prompts`, and their transitive trees into every end-user's production install even though the consumer's runtime never imports the engine.
- Do **not** add any `bin` field. Bin names collide across consumers under `node_modules/.bin/` and the engine is the sole CLI surface.
- Do **not** expose `./bin/*` or `./docs/*` in `exports`. Exposing them would let bundlers pull CLI code or the docs tree into app bundles.
- Do **not** create a `bin/` or `scripts/` directory in the consumer. The engine's `agents-build-hashes` bin (resolved via `node_modules/.bin/` from `devDependencies` at workspace install time) handles build-time hashing.

## 2. `docs/claude/` authoring

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

The build step (`yarn build:hashes` → `agents-build-hashes`) hashes every file under `docs/claude/` relative to the asset root and writes `dist/agents-hashes.json`. On inject, the CLI copies `skills`/`rules`/`commands` into the matching subtree under `.claude/`.

## 3. Isolation guardrails (optional but recommended)

In a `.dependency-cruiser.cjs`:

```javascript
{
  name: 'src-no-docs',
  severity: 'error',
  comment:
    'src/ must not import from docs/. docs/claude/** contains pure markdown ' +
    'assets meant only for the engine dispatcher, not for the library runtime.',
  from: { path: '^src/' },
  to: { path: '^docs/' },
},
```

Plus `"sideEffects": false` in `package.json`. These ensure the docs tree never leaks into consumer runtime bundles.

The legacy `src-no-bin` and `src-no-agents-assets-sync` rules are no longer load-bearing — the consumer owns no `bin/`, and the engine isn't referenced from `src/` anyway. Do not reintroduce them.

## 4. End-user invocations

The engine is not shipped as a runtime dependency of any consumer, so end users never get a hoisted `inject-agents-settings` bin. Always invoke via `npx -p @slats/agents-assets-sync ...`; the package manager fetches and caches the engine on demand.

| Scenario | Invocation |
|---|---|
| Single consumer target | `npx -p @slats/agents-assets-sync inject-agents-settings --package=@your-scope/your-package --scope=user` |
| All packages under one npm scope | `npx -p @slats/agents-assets-sync inject-agents-settings --package=@your-scope --scope=user` (scope alias — no slash) |
| Multiple specific targets | Repeat `--package` or comma-separate: `--package=@scope-a --package=@scope-b/pkg`. There is no `--all`. |

### Scope resolution (project)

For `--scope=project`, the target `.claude` directory is resolved by walking up from `process.cwd()` and reusing the first existing `.claude` directory found. Only if no ancestor owns a `.claude` does the CLI fall back to `process.cwd()/.claude`. The CLI logs `(auto-located)` when this happens.

```
workspace/
  .claude/                        ← reused target (auto-located)
  packages/
    @your-scope/your-package/     ← cd here and run inject-agents-settings
```

Running `inject-agents-settings --package=@your-scope/your-package --scope=project` from `packages/@your-scope/your-package/` injects into `workspace/.claude`, not `packages/@your-scope/your-package/.claude`.

## 5. Verification checklist

- [ ] `yarn build` succeeds and emits `dist/agents-hashes.json` alongside the rest of `dist/`.
- [ ] `node packages/slats/agents-assets-sync/bin/inject-agents-settings.mjs --help` prints the dispatcher usage.
- [ ] `node packages/slats/agents-assets-sync/bin/inject-agents-settings.mjs --package=@your-scope/your-package --scope=project --dry-run` emits a copy plan when run from `/tmp/...`.
- [ ] If you enabled Section 3's depcheck, `yarn depcheck` reports zero violations.
- [ ] Consumer bundler tree-shakes away docs — grep the built bundle for `@slats/agents-assets-sync`, `inject-agents-settings`, and `docs/claude`; all three should be absent.
