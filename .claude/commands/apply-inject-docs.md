# /apply-inject-docs - Replicate schema-form's inject-docs Setup

## Usage

```bash
/apply-inject-docs {target-package-path}

# Examples
/apply-inject-docs packages/lerx/promise-modal
/apply-inject-docs packages/winglet/json
/apply-inject-docs packages/winglet/react-utils
```

## Overview

Replicates the `inject-docs` CLI setup (already deployed on `@canard/schema-form`) onto another consumer package. Each consumer gets a thin `bin/inject-docs.mjs` wrapper that delegates to the shared `@slats/claude-assets-sync/cli` engine, plus a `build:hashes` step and CLI/library isolation rules.

**Pattern owner**: `@slats/claude-assets-sync` (shared core). **Reference consumer**: `packages/canard/schema-form` (copy from this).

---

## Pre-Flight

### P.1 Target resolution

Derive from `{target-package-path}`:

- `TARGET_PATH` = the argument, e.g. `packages/lerx/promise-modal`
- `PACKAGE_NAME` = `name` field inside `{TARGET_PATH}/package.json`
- `SHORTCUT` = look up the root `package.json` `scripts` for a yarn alias whose command matches `yarn workspace ${PACKAGE_NAME}` (e.g. `promiseModal`). If none exists, skip the shortcut and use `yarn workspace ${PACKAGE_NAME} <cmd>` directly

If `{target-package-path}` is missing, ask the user for it. Do not guess.

### P.2 Prerequisites

Confirm all of the following before touching any file:

- [ ] `{TARGET_PATH}/docs/claude/skills/<expert-name>/SKILL.md` + `knowledge/*.md` exist (2-depth `skills/<name>/` namespace is the hash-manifest partition key)
- [ ] `{TARGET_PATH}/package.json` has `"type": "module"` and `"sideEffects": false`
- [ ] Build uses rollup + `node ../../aileron/script/build/buildTypes.mjs` (standard monorepo pattern)
- [ ] `git status` is clean in the target area (no staged unrelated changes — keep this PR separable)

If any check fails, **stop and report to the user**. Do not auto-restructure.

---

## Reference Files (copy from these, do NOT re-design)

- `packages/canard/schema-form/bin/inject-docs.mjs`
- `packages/canard/schema-form/scripts/build-hashes.mjs`
- `packages/canard/schema-form/package.json` — the `bin`, `files`, `scripts.build`, `scripts.build:hashes`, `scripts.prepublishOnly`, `scripts.depcheck`, `dependencies` fields
- `packages/canard/schema-form/.dependency-cruiser.cjs` — 3 isolation rules + `^bin/` orphan exception + `includeOnly: ['^src', '^bin']`
- `packages/canard/schema-form/CLAUDE.md` — the `## Claude Docs Injector` section

---

## Steps

### 1. Create `{TARGET_PATH}/bin/inject-docs.mjs`

Identical to the reference (15-line wrapper). No content substitution needed — the wrapper calculates `packageRoot` from its own location and reads `package.json` at runtime.

### 2. Create `{TARGET_PATH}/scripts/build-hashes.mjs`

Identical to the reference. A 10-line wrapper that calls `buildHashes()` from `@slats/claude-assets-sync/buildHashes`.

### 3. Patch `{TARGET_PATH}/package.json`

Apply these edits (idempotent merge, do not overwrite existing values with different ones — ask if a conflict arises):

- Add `"bin": { "inject-docs": "./bin/inject-docs.mjs" }` at the top level
- Append `"bin"` to the `files` array
- Append ` && yarn build:hashes` to the end of `scripts.build`
- Add `"build:hashes": "node scripts/build-hashes.mjs"`
- Add `"prepublishOnly": "yarn build"` (guards against stale `dist/claude-hashes.json` on publish)
- Add `"depcheck": "depcruise src bin --config .dependency-cruiser.cjs --no-progress"` **only if the target already has a `.dependency-cruiser` file**
- Add `"@slats/claude-assets-sync": "workspace:^"` to `dependencies` (**not** `devDependencies` — `npx ${PACKAGE_NAME} inject-docs` requires it to be installed in the consumer's `node_modules`)
- **Do not add `./bin/*` to `exports`** — keeping the bin out of the subpath map is the fourth layer of the isolation guard

### 4. Update `.dependency-cruiser` (if it exists)

If `{TARGET_PATH}/.dependency-cruiser.js` exists:

1. Rename it to `.dependency-cruiser.cjs` (the monorepo uses `"type": "module"`, so `.js` is parsed as ESM and breaks the existing CJS config). Update any script that references the old name (e.g. `make-dependency-graph`).
2. Append the 3 isolation rules to `forbidden` (copy verbatim from the reference):
   - `src-no-bin` — `from: ^src/`, `to: ^bin/`, severity `error`
   - `src-no-docs` — `from: ^src/`, `to: ^docs/`, severity `error`
   - `src-no-claude-assets-sync` — `from: ^src/`, `to: node_modules/@slats/claude-assets-sync`, severity `error`
3. Add `'^bin/'` to the existing `no-orphans` rule's `from.pathNot` array (bin entries are orphans by design)
4. Expand `options.includeOnly` from `['^src']` to `['^src', '^bin']`

If the file does not exist, skip this step and warn the user that isolation regressions will only be caught by the bundle `grep` assertion (Step 9).

### 5. Add `## Claude Docs Injector` section to `{TARGET_PATH}/CLAUDE.md`

Copy the section from the reference verbatim, substituting `@canard/schema-form` → `${PACKAGE_NAME}`. Keep the "Isolation Guardrails" sub-section (future maintainers must know not to add `./bin/*` to `exports`).

Skip silently if `CLAUDE.md` does not exist (not every package has one).

### 6. `yarn install` + build verification

From the monorepo root:

```bash
yarn install                    # link the new workspace dependency
yarn ${SHORTCUT} build          # or: yarn workspace ${PACKAGE_NAME} build
```

Expected: `rollup` → `buildTypes` → `build:hashes` all succeed and `{TARGET_PATH}/dist/claude-hashes.json` is generated. Count the `files` entries in the manifest and report it.

### 7. E2E smoke tests (6 paths)

Run the following and confirm each exit code/stderr signal. Abort and report if any path behaves unexpectedly:

```bash
BIN=$PWD/{TARGET_PATH}/bin/inject-docs.mjs
DIR=/tmp/inject-smoke-${SHORTCUT:-inject}
mkdir -p "$DIR" && cd "$DIR" && rm -rf .claude

node "$BIN" --scope=project --dry-run                 # (1) + marks, exit 0
node "$BIN" --scope=project                           # (2) create, exit 0
node "$BIN" --scope=project                           # (3) all up-to-date, exit 0
echo tampered >> .claude/skills/*/SKILL.md
CI=true node "$BIN" --scope=project; echo "EXIT=$?"    # (4) diverged, exit 2
CI=true node "$BIN" --scope=project --force            # (5) stderr diverged list, exit 0
CI=true node "$BIN"; echo "EXIT=$?"                    # (6) missing scope, exit 2
```

### 8. Bundle isolation assertion (must be empty)

```bash
grep -rE "@slats/claude-assets-sync|docs/claude|inject-docs" \
  {TARGET_PATH}/dist/index.mjs \
  {TARGET_PATH}/dist/index.cjs
```

Zero matches required. If anything leaks, **stop**: that is a principle-1 violation (production bundle would ship CLI code).

### 9. depcruise check (if `.dependency-cruiser.cjs` was added)

```bash
yarn ${SHORTCUT} depcheck     # expect 0 errors (warnings on pre-existing orphans are OK)
```

### 10. Report to user

Summarize:

- Files created / modified / skipped
- Hash manifest file count
- E2E paths passed (1–6)
- Isolation grep result (should be empty)
- Recommend a separate commit scoped to this change so it doesn't mix with unrelated staged work

---

## Gotchas

- `yarn workspace ${PACKAGE_NAME} build` may fail with `command not found: rollup` in some shell environments (hoisted `.bin` not on PATH). Prefer the root `yarn ${SHORTCUT} build` alias, or invoke `$PWD/node_modules/.bin/rollup -c` directly from the target dir.
- `bin/inject-docs.mjs` is authored in plain `.mjs` — no TypeScript compilation step. It ships to npm as-is.
- `@slats/claude-assets-sync` is a **runtime** dependency because `npx ${PACKAGE_NAME} inject-docs` needs the engine installed alongside the consumer. Tree-shaking keeps it out of `dist/index.{mjs,cjs}` (isolation is guaranteed by the import graph + the depcruise rules, not by dependency declaration type).
- Do not commit `dist/claude-hashes.json` — it regenerates on every build and `dist/` is already gitignored.
- If the user is mid-way through an unrelated rename or refactor (`git status` shows lots of untracked/staged files in the target area), pause and check with them before layering this change on top.
