# /apply-claude-sync — Replicate the `claude-sync` bin setup on a target package

## Usage

```bash
/apply-claude-sync {target-package-path}

# Examples
/apply-claude-sync packages/lerx/promise-modal
/apply-claude-sync packages/winglet/react-utils
```

## Overview

Wire the `claude-sync` CLI onto a consumer package. The stub reads its own
`package.json` via `import.meta.url` and hands the engine
`{ packageRoot, packageName, packageVersion, assetPath }`. The engine targets
exactly one consumer per invocation; it does not discover other packages.

- **Engine**: `@slats/claude-assets-sync`.
- **Reference consumer**: `packages/canard/schema-form`.
- **Invariant**: `src/**` MUST NOT import `bin/**`, `docs/**`, or `@slats/claude-assets-sync`.

Outcome:

```bash
npx <PACKAGE_NAME> claude-sync --scope=user|project|local [--dry-run] [--force] [--root=<cwd>]
```

---

## Pre-Flight

### P.1 Resolve arguments

- `TARGET_PATH` — slash-command argument. If missing, ask.
- `PACKAGE_NAME` — `name` field of `{TARGET_PATH}/package.json`.
- `SHORTCUT` — root `package.json` `scripts` entry whose value equals
  `yarn workspace ${PACKAGE_NAME}`; fall back to the full syntax otherwise.

### P.2 Preconditions (stop and report on failure)

- [ ] `{TARGET_PATH}/docs/claude/skills/<name>/SKILL.md` + `knowledge/*.md` exist.
- [ ] `{TARGET_PATH}/package.json` has `"type": "module"` and `"sideEffects": false`.
- [ ] Build pipeline: `rollup -c && yarn build:types` via
      `node ../../aileron/script/build/buildTypes.mjs`.
- [ ] `git status` on the target area is clean; unrelated changes → confirm first.

---

## Reference Files

Both stub files are identical across consumers — copy verbatim, no substitution.
Runtime `import.meta.url` resolves package metadata.

- `packages/canard/schema-form/bin/claude-sync.mjs`
- `packages/canard/schema-form/scripts/build-hashes.mjs`
- `packages/canard/schema-form/package.json` — `bin`, `files`, `scripts.build`,
  `scripts.build:hashes`, `scripts.prepublishOnly`, `dependencies`, `claude.assetPath`.
- `packages/canard/schema-form/CLAUDE.md` — `## Claude Docs Injector` section.

---

## Steps

Idempotent. On any conflicting existing value, ask the user — do not clobber.

### 1. Create `{TARGET_PATH}/bin/claude-sync.mjs`

Copy verbatim. `chmod +x`.

### 2. Create `{TARGET_PATH}/scripts/build-hashes.mjs`

Copy verbatim.

### 3. Patch `{TARGET_PATH}/package.json`

- `"bin": { "claude-sync": "./bin/claude-sync.mjs" }`
- Append `"bin"` to `files`.
- Append ` && yarn build:hashes` to `scripts.build` (guard against double-append).
- `"build:hashes": "node scripts/build-hashes.mjs"`
- `"prepublishOnly": "yarn build"`
- `"@slats/claude-assets-sync": "workspace:^"` in `dependencies` (NOT dev).
- `claude.assetPath` — default `"docs/claude"`; keep existing non-default value.
  The stub guards `if (typeof pkg.claude?.assetPath === 'string')` — missing
  field = silent no-op.

Do NOT add `./bin/*` to `exports`.

### 4. (Optional) dependency-cruiser isolation gate

Skip unless `{TARGET_PATH}/.dependency-cruiser.cjs` already exists or the user
asks. If it exists, copy verbatim from `packages/canard/schema-form/.dependency-cruiser.cjs`:

1. Append three `forbidden` rules (severity `error`): `src-no-bin`, `src-no-docs`,
   `src-no-claude-assets-sync`.
2. Add `'^bin/'` to `no-orphans`'s `from.pathNot`.
3. Expand `options.includeOnly` to `['^src', '^bin']`.
4. Add `"depcheck": "depcruise src bin --config .dependency-cruiser.cjs --no-progress"`.

Legacy `.dependency-cruiser.js` → out of scope; flag to user, do not rename.

### 5. CLAUDE.md — add `## Claude Docs Injector` section

Copy verbatim from reference, substitute `@canard/schema-form` → `${PACKAGE_NAME}`.
Keep Isolation Guardrails subsection. Skip if `CLAUDE.md` does not exist.

### 6. Install and build

```bash
yarn install
yarn ${SHORTCUT:-workspace ${PACKAGE_NAME}} build
```

Expect rollup → buildTypes → build:hashes to succeed and
`{TARGET_PATH}/dist/claude-hashes.json` to be written.

### 7. E2E smoke tests (6 paths)

Run from `/tmp/...`, not from the monorepo root or `{TARGET_PATH}/`
(`--scope=project` walks cwd upward for an existing `.claude` and would mutate
the real repo's). No fake node_modules needed — the bin resolves everything
via `import.meta.url`.

```bash
BIN=$PWD/{TARGET_PATH}/bin/claude-sync.mjs
DIR=/tmp/claude-sync-smoke-${SHORTCUT:-target}
[ -d "$DIR" ] && find "$DIR" -mindepth 1 -delete
mkdir -p "$DIR" && cd "$DIR"

node "$BIN" --scope=project --dry-run;         echo "EXIT=$?"   # expect 0
node "$BIN" --scope=project;                   echo "EXIT=$?"   # expect 0
node "$BIN" --scope=project;                   echo "EXIT=$?"   # expect 0 (up-to-date)
find .claude -name SKILL.md -exec sh -c 'echo tampered >> "$1"' _ {} \;
CI=true node "$BIN" --scope=project;           echo "EXIT=$?"   # expect 2
CI=true node "$BIN" --scope=project --force;   echo "EXIT=$?"   # expect 0
CI=true node "$BIN";                           echo "EXIT=$?"   # expect 2
```

Agent notes: split into two bash calls (paths 1–3, then 4–6) — cwd resets
between calls, the `[ -d ... ] && find -delete` prefix keeps it idempotent.
Do not use `rm -rf` or unquoted `*` globs.

### 8. Bundle isolation grep (must be empty)

```bash
grep -rE "@slats/claude-assets-sync|docs/claude|claude-sync" \
  {TARGET_PATH}/dist/index.mjs {TARGET_PATH}/dist/index.cjs
```

Pass = exit 1 (no matches). Any match → stop; CLI leaked into bundle.

### 9. depcheck (only if Step 4 ran)

```bash
yarn ${SHORTCUT:-workspace ${PACKAGE_NAME}} depcheck
```

Zero errors; pre-existing `no-orphans` warnings OK.

### 10. Report

Files written/skipped, manifest file count, smoke-test exit codes, grep result
(no matches), depcheck result (or "static isolation not enforced"), and the
recommendation to commit this change on its own.

---

## Gotchas

- Stubs are identical across packages — no substitution.
- `pkg.claude.assetPath` missing → bin silently no-ops.
- `@slats/claude-assets-sync` MUST be `dependencies`, not `devDependencies`;
  isolation is via import graph, not dependency-type.
- Never add `./bin/*` to `exports`.
- Do not commit `dist/claude-hashes.json`.
- `yarn workspace ${PACKAGE_NAME} build` can fail with `rollup: command not
  found`; prefer `yarn ${SHORTCUT} build` from the root.
