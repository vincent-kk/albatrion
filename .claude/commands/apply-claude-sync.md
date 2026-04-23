# /apply-claude-sync — Replicate the `claude-sync` bin setup on a target package

## Usage

```bash
/apply-claude-sync {target-package-path}

# Examples
/apply-claude-sync packages/lerx/promise-modal
/apply-claude-sync packages/winglet/react-utils
/apply-claude-sync packages/canard/schema-form-antd5-plugin
```

## Overview

Reproduce the `claude-sync` CLI bin setup that is already wired on `@canard/schema-form`
onto another consumer package. The consumer gains a thin `bin/claude-sync.mjs` that
delegates to the shared `@slats/claude-assets-sync` engine, a `build:hashes` step that
emits `dist/claude-hashes.json`, and isolation rules that keep the CLI surface out of
the library bundle.

- **Engine owner**: `@slats/claude-assets-sync` — holds the actual CLI logic.
- **Reference consumer** (source of truth): `packages/canard/schema-form`.
- **Invariant**: `src/**` MUST NOT import `bin/**`, `docs/**`, or `@slats/claude-assets-sync`.

Outcome after running this command on `{TARGET_PATH}`:

```bash
npx <PACKAGE_NAME> claude-sync --scope=user     # ~/.claude
npx <PACKAGE_NAME> claude-sync --scope=project  # nearest existing .claude upward (else cwd)
npx <PACKAGE_NAME> claude-sync --scope=local    # same rule, gitignored slot
# plus --dry-run / --force / --package=<name> as documented by the engine
```

The command behavior is describe-by-reference — it NEVER inlines file contents.
Every concrete artifact is copied from the reference files listed below so that
when the engine evolves, consumers auto-follow with the next `yarn install`.

---

## Pre-Flight

### P.1 Resolve arguments (no hardcoded mapping)

Derive these at runtime from the target package and the repo root:

- `TARGET_PATH` — the slash-command argument, e.g. `packages/lerx/promise-modal`.
  If the argument is missing, ask the user. Do NOT guess.
- `PACKAGE_NAME` — `name` field of `{TARGET_PATH}/package.json`.
- `SHORTCUT` — look up the root `package.json` `scripts` for an entry whose value
  is exactly `yarn workspace ${PACKAGE_NAME}`. Use it as `yarn ${SHORTCUT} <cmd>`.
  If none exists, fall back to `yarn workspace ${PACKAGE_NAME} <cmd>`.

### P.2 Preconditions

Verify ALL of the following before any write. If any fails, stop and report — do
NOT auto-restructure.

- [ ] `{TARGET_PATH}/docs/claude/skills/<expert-name>/SKILL.md` plus `knowledge/*.md`
      exist. The `skills/<name>/` level (depth-2) is the hash-manifest partition key,
      so the directory MUST be present before the hash builder can operate.
- [ ] `{TARGET_PATH}/package.json` has `"type": "module"` and `"sideEffects": false`.
- [ ] Build pipeline matches the monorepo standard: `rollup -c && yarn build:types`
      using `node ../../aileron/script/build/buildTypes.mjs`.
- [ ] `git status` shows the target area clean. If unrelated staged/untracked files
      exist, pause and confirm with the user — this change MUST ship as its own commit.

---

## Reference Files (copy from these — do NOT redesign)

Treat these as the single source of truth. Read, then replicate with only the
substitutions listed in Step 3.1 / 3.5. Do not hand-author equivalents.

- `packages/canard/schema-form/bin/claude-sync.mjs`
- `packages/canard/schema-form/scripts/build-hashes.mjs`
- `packages/canard/schema-form/package.json` — specifically the `bin`, `files`,
  `scripts.build`, `scripts.build:hashes`, `scripts.prepublishOnly`,
  `scripts.depcheck`, `dependencies`, and `claude.assetPath` fields.
- `packages/canard/schema-form/.dependency-cruiser.cjs` — the three isolation
  rules (`src-no-bin`, `src-no-docs`, `src-no-claude-assets-sync`), the `^bin/`
  pathNot entry in `no-orphans`, and `options.includeOnly: ['^src', '^bin']`.
- `packages/canard/schema-form/CLAUDE.md` — the `## Claude Docs Injector` section
  (usage block + Isolation Guardrails subsection).

---

## Steps

All steps are idempotent. If a step's desired state already holds, skip it and
note "already present" in the final report. On any conflicting existing value,
ask the user — never overwrite silently.

### 1. Create `{TARGET_PATH}/bin/claude-sync.mjs`

Copy the reference file verbatim. The ONLY substitution is the error-message
prefix: `[@canard/schema-form]` → `[${PACKAGE_NAME}]`. Everything else — the
shebang, the import of `runCli` from `@slats/claude-assets-sync`, the
`invokedFromBin: import.meta.url` hint, the `process.exit(1)` on rejection —
stays identical.

No templating tricks needed; the wrapper resolves the consumer package root at
runtime from its own `import.meta.url`.

### 2. Create `{TARGET_PATH}/scripts/build-hashes.mjs`

Copy the reference file verbatim. NO substitution. It calls `buildHashes()` from
`@slats/claude-assets-sync/buildHashes` and logs the emitted path + file count.

### 3. Patch `{TARGET_PATH}/package.json`

Apply the edits below as an additive, idempotent merge. When a key already exists
with a different value, STOP and ask the user — do not clobber.

- Add top-level `"bin": { "claude-sync": "./bin/claude-sync.mjs" }`.
- Append `"bin"` to the `files` array (alongside existing `"dist"`, `"docs"`, etc.).
- Append ` && yarn build:hashes` to `scripts.build` (guard against double-append
  if the suffix is already present).
- Add `"build:hashes": "node scripts/build-hashes.mjs"`.
- Add `"prepublishOnly": "yarn build"` — guards against a stale
  `dist/claude-hashes.json` on publish.
- Add `"@slats/claude-assets-sync": "workspace:^"` to `dependencies`.
  It MUST be `dependencies`, NOT `devDependencies`: `npx <PACKAGE_NAME> claude-sync`
  executed by a transitive consumer needs the engine installed alongside the
  consumer's `node_modules`. Tree-shaking (via import graph + depcruise rules)
  keeps it out of `dist/`.
- Ensure `claude.assetPath` exists. Default value: `"docs/claude"`. If the target
  already has a different value (e.g. a nonstandard asset root), keep it.
- Add `"depcheck": "depcruise src bin --config .dependency-cruiser.cjs --no-progress"`
  ONLY if Step 4 runs (i.e. the target has a `.dependency-cruiser` config).

**Do NOT add `./bin/*` to `exports`.** Keeping the bin out of the subpath map is
the fourth layer of the isolation guard — it prevents any consumer bundler from
accidentally pulling CLI assets through an `exports` traversal.

### 4. Update `.dependency-cruiser` (conditional)

If `{TARGET_PATH}/.dependency-cruiser.js` exists:

1. Rename to `.dependency-cruiser.cjs`. The monorepo uses `"type": "module"` at the
   root, so `.js` is parsed as ESM and `module.exports = { ... }` breaks. Update
   every script that referenced the old filename (typically `make-dependency-graph`).
2. Append the three isolation rules to `forbidden`, copied verbatim from the
   reference (severity: `error`):
   - `src-no-bin` — `from: { path: '^src/' }`, `to: { path: '^bin/' }`
   - `src-no-docs` — `from: { path: '^src/' }`, `to: { path: '^docs/' }`
   - `src-no-claude-assets-sync` — `from: { path: '^src/' }`,
     `to: { path: 'node_modules/@slats/claude-assets-sync' }`
3. Add `'^bin/'` to the existing `no-orphans` rule's `from.pathNot` array. The
   bin is an intentional orphan (npm resolves it via the `bin` field, not via
   `src/` imports).
4. Expand `options.includeOnly` from `['^src']` to `['^src', '^bin']` so the
   isolation rules actually get cruised.

If no `.dependency-cruiser` file exists, skip Step 4 AND the `depcheck` script
entry in Step 3. Warn the user that isolation regressions will then be caught
only by the bundle grep in Step 7 — no static pre-build gate.

### 5. Add `## Claude Docs Injector` section to `{TARGET_PATH}/CLAUDE.md`

Copy the section verbatim from the reference `CLAUDE.md`. Substitute
`@canard/schema-form` → `${PACKAGE_NAME}`. Keep the Isolation Guardrails
subsection — future maintainers MUST be told not to add `./bin/*` to `exports`.

If `{TARGET_PATH}/CLAUDE.md` does not exist, skip silently. Do not create one.

### 6. Install and build

From the monorepo root:

```bash
yarn install                                 # link the new workspace dependency
yarn ${SHORTCUT:-workspace ${PACKAGE_NAME}} build
```

Expected: rollup → buildTypes → build:hashes all succeed, and
`{TARGET_PATH}/dist/claude-hashes.json` is written. Report the `files` entry
count from the manifest.

### 7. E2E smoke tests (6 paths)

Run all six. Abort and report on any mismatch — exit codes and stderr signals
are part of the engine's contract.

```bash
BIN=$PWD/{TARGET_PATH}/bin/claude-sync.mjs
DIR=/tmp/claude-sync-smoke-${SHORTCUT:-target}
mkdir -p "$DIR" && cd "$DIR" && rm -rf .claude

node "$BIN" --scope=project --dry-run                 # (1) plan with '+' marks, exit 0
node "$BIN" --scope=project                           # (2) create, exit 0
node "$BIN" --scope=project                           # (3) all up-to-date, exit 0
echo tampered >> .claude/skills/*/SKILL.md
CI=true node "$BIN" --scope=project; echo "EXIT=$?"   # (4) diverged → exit 2
CI=true node "$BIN" --scope=project --force           # (5) stderr diverged list, exit 0
CI=true node "$BIN"; echo "EXIT=$?"                   # (6) missing scope → exit 2
```

### 8. Bundle isolation assertion (must be empty)

```bash
grep -rE "@slats/claude-assets-sync|docs/claude|claude-sync" \
  {TARGET_PATH}/dist/index.mjs \
  {TARGET_PATH}/dist/index.cjs
```

Zero matches required. Any match means CLI code or docs-injector references
leaked into the production bundle — stop immediately, this violates the
src-isolation invariant and will ship CLI bytes to end-user bundles.

### 9. depcheck (only if Step 4 ran)

```bash
yarn ${SHORTCUT:-workspace ${PACKAGE_NAME}} depcheck
```

Expect zero errors. Pre-existing `no-orphans` warnings are acceptable.

### 10. Report

Summarize to the user:

- Files created / modified / skipped (with "already present" vs "newly written").
- `dist/claude-hashes.json` file count.
- Smoke-test paths 1–6: pass/fail.
- Isolation grep result: should be empty.
- depcheck result (if applicable).
- Recommendation: commit this change on its own so it stays separable from
  unrelated work in the target package.

---

## Gotchas

- `yarn workspace ${PACKAGE_NAME} build` can fail with `command not found: rollup`
  in some shells because the hoisted `.bin` is not on PATH. Prefer the root
  `yarn ${SHORTCUT} build` alias, or invoke `$PWD/node_modules/.bin/rollup -c`
  from the target directory.
- `bin/claude-sync.mjs` is plain `.mjs` — no TypeScript compile step. It ships
  to npm as-is and runs on Node's ESM loader.
- `@slats/claude-assets-sync` MUST be a `dependencies` entry, not `devDependencies`.
  `npx <PACKAGE_NAME> claude-sync` run by a transitive consumer needs the engine
  installed; isolation from the library bundle is enforced by the import graph +
  depcruise rules, not by the dependency-type field.
- Do NOT commit `{TARGET_PATH}/dist/claude-hashes.json`. It regenerates every
  build and `dist/` is already gitignored.
- If the target area has unrelated in-flight changes, pause before touching files —
  this change should ship as a dedicated commit so reverts stay clean.
- Never add `./bin/*` to `exports`. Fourth-layer isolation guard; intentional.
