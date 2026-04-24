---
name: claude-sync-applier
description: "Wire the claude-sync CLI onto a consumer package in this monorepo. Copies verbatim bin/claude-sync.mjs and scripts/build-hashes.mjs stubs, patches package.json, updates CLAUDE.md, runs E2E smoke tests, and verifies bundle isolation. Idempotent — asks before clobbering."
user-invocable: true
disable-model-invocation: true
argument-hint: <target-package-path>
---

# claude-sync-applier

Replicate the `claude-sync` bin setup on a target consumer package. The engine
is `@slats/claude-assets-sync`; the reference consumer is `packages/canard/schema-form`.

The bin stub reads its own `package.json` via `import.meta.url` and hands the
engine `{ packageRoot, packageName, packageVersion, assetPath }`. Each invocation
targets exactly one consumer — it does not discover other packages.

**Outcome**

```bash
npx <PACKAGE_NAME> claude-sync --scope=user|project [--dry-run] [--force] [--root=<cwd>]
```

## Role

You are a monorepo wiring specialist. Execute the 10 steps below as a single,
idempotent procedure. On any conflicting existing value — ask the user before
overwriting. Never clobber silently.

## Knowledge Resources

Consult these files as needed during execution. Do NOT preload everything;
load on demand.

- `knowledge/reference-files.md` — source stubs (`bin/claude-sync.mjs`, `scripts/build-hashes.mjs`) with expected contents and rationale
- `knowledge/package-json-patches.md` — every required `package.json` edit, with guard conditions
- `knowledge/claude-md-template.md` — the `## Claude Docs Injector` section to inject into the target `CLAUDE.md`
- `knowledge/dependency-cruiser.md` — optional Step 4: three forbidden rules + config shape for static isolation
- `knowledge/smoke-tests.md` — E2E 6-path matrix with expected exit codes and why
- `knowledge/gotchas.md` — invariants, isolation guardrails, pitfalls

## Inputs

Resolve these before starting. If any is missing, stop and ask.

| Variable          | Source                                                                                               |
|-------------------|------------------------------------------------------------------------------------------------------|
| `TARGET_PATH`     | Skill argument (e.g. `packages/lerx/promise-modal`). If absent, ask the user.                        |
| `PACKAGE_NAME`    | `name` field of `${TARGET_PATH}/package.json`.                                                       |
| `SHORTCUT`        | Root `package.json` `scripts` entry whose value equals `yarn workspace ${PACKAGE_NAME}`; else unset. |

`SHORTCUT` is a convenience only. When unset, fall back to full workspace
syntax: `yarn workspace ${PACKAGE_NAME} <subcommand>`.

## Pre-Flight

Stop and report on any failure. Do not attempt to fix silently.

- [ ] `${TARGET_PATH}/docs/claude/skills/<name>/SKILL.md` and `knowledge/*.md` exist — the docs to be injected.
- [ ] `${TARGET_PATH}/package.json` has `"type": "module"` and `"sideEffects": false`.
- [ ] Build pipeline uses `rollup -c && yarn build:types` where `build:types` runs `node ../../aileron/script/build/buildTypes.mjs`.
- [ ] `git status` in `${TARGET_PATH}` is clean. Unrelated changes present → confirm with user before proceeding.

## Steps

Execute in order. Each step is idempotent; on conflict, ask rather than overwrite.

### Step 1 — Create `${TARGET_PATH}/bin/claude-sync.mjs`

Copy verbatim from the reference consumer. See `knowledge/reference-files.md`
for the expected content and the source path. `chmod +x` the result.

### Step 2 — Create `${TARGET_PATH}/scripts/build-hashes.mjs`

Copy verbatim. See `knowledge/reference-files.md`.

### Step 3 — Patch `${TARGET_PATH}/package.json`

See `knowledge/package-json-patches.md` for the complete patch list:

- `bin` entry
- `files` append
- `scripts.build` append (guarded)
- `scripts.build:hashes`
- `scripts.prepublishOnly`
- `dependencies."@slats/claude-assets-sync"` (NOT devDependencies)
- `claude.assetPath` default

Do NOT add `./bin/*` to `exports` — ever.

### Step 4 — (Optional) dependency-cruiser isolation gate

Skip unless `${TARGET_PATH}/.dependency-cruiser.cjs` already exists or the user
explicitly asks. Legacy `.dependency-cruiser.js` → out of scope; flag to user.

When applicable, see `knowledge/dependency-cruiser.md` for the three forbidden
rules, `no-orphans` adjustment, `includeOnly` expansion, and `depcheck` script.

### Step 5 — Patch `${TARGET_PATH}/CLAUDE.md`

If `CLAUDE.md` exists, append the `## Claude Docs Injector` section from
`knowledge/claude-md-template.md`, substituting `@canard/schema-form` →
`${PACKAGE_NAME}`. Keep the Isolation Guardrails subsection. Skip if
`CLAUDE.md` does not exist.

### Step 6 — Install and build

```bash
yarn install
yarn ${SHORTCUT:-workspace ${PACKAGE_NAME}} build
```

Expected: `rollup` → `buildTypes` → `build:hashes` succeed, and
`${TARGET_PATH}/dist/claude-hashes.json` is written.

### Step 7 — E2E smoke tests (6 paths)

Run from `/tmp/...`, never from the monorepo root or `${TARGET_PATH}/` —
`--scope=project` walks cwd upward looking for an existing `.claude`, and would
mutate the real repo's. See `knowledge/smoke-tests.md` for the full 6-path
matrix, expected exit codes, and rationale.

Split into two bash calls (paths 1–3, then 4–6). cwd resets between calls; the
`[ -d ... ] && find -delete` prefix keeps it idempotent. Never use `rm -rf` or
unquoted `*` globs.

### Step 8 — Bundle isolation grep (must be empty)

```bash
grep -rE "@slats/claude-assets-sync|docs/claude|claude-sync" \
  ${TARGET_PATH}/dist/index.mjs ${TARGET_PATH}/dist/index.cjs
```

Pass = exit code 1 (no matches). Any match → stop; CLI has leaked into the
library bundle. See `knowledge/gotchas.md` for the three-layer isolation model.

### Step 9 — depcheck (only if Step 4 ran)

```bash
yarn ${SHORTCUT:-workspace ${PACKAGE_NAME}} depcheck
```

Zero errors. Pre-existing `no-orphans` warnings are acceptable.

### Step 10 — Report

Summarize:

- Files written vs. skipped (with reason for each skip)
- Manifest file count from `dist/claude-hashes.json`
- Smoke-test exit codes (all 6)
- Grep result (expected: no matches)
- depcheck result (or "static isolation not enforced" if Step 4 skipped)
- Recommendation: commit this change on its own, separate from other work

## Report Template

```markdown
## apply-claude-sync — ${PACKAGE_NAME}

**Files**
- bin/claude-sync.mjs          — created | unchanged | asked-user
- scripts/build-hashes.mjs     — created | unchanged | asked-user
- package.json                 — patched: [bin, files, scripts.build, …]
- CLAUDE.md                    — section added | skipped (no CLAUDE.md)
- .dependency-cruiser.cjs      — updated | skipped (not present)

**Manifest**
- dist/claude-hashes.json: <N> files

**Smoke tests**
| # | command                                         | expected | actual |
|---|-------------------------------------------------|----------|--------|
| 1 | --scope=project --dry-run                       | 0        | <n>    |
| 2 | --scope=project                                 | 0        | <n>    |
| 3 | --scope=project (up-to-date)                    | 0        | <n>    |
| 4 | CI=true --scope=project (tampered)              | 2        | <n>    |
| 5 | CI=true --scope=project --force                 | 0        | <n>    |
| 6 | CI=true (missing --scope)                       | 2        | <n>    |

**Isolation**
- grep on dist/index.{mjs,cjs}: no matches ✓
- depcheck: <result | "static isolation not enforced">

**Next**: commit on its own — do not bundle with unrelated changes.
```

## Termination Conditions

- **Pre-Flight fails** → stop, report the failing check. Do not proceed.
- **Conflict during patch** → stop, show the diff, ask user whether to overwrite.
- **Build fails at Step 6** → stop, report error. Do not run smoke tests on a broken build.
- **Smoke test mismatch** → stop, report the failing path with captured exit code.
- **Bundle grep finds matches** → stop, report which file leaked. Isolation is broken.
- **All steps pass** → emit the report from the template above.
