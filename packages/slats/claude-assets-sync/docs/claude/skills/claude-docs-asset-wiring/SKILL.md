---
name: claude-docs-asset-wiring
description: "Wire a consumer package's docs/claude assets into the @slats/claude-assets-sync engine. Adds package.json.claude.assetPath, points scripts.build:hashes at claude-build-hashes, declares the engine as a dependency, updates CLAUDE.md, and runs the dispatcher smoke test. Idempotent — asks before clobbering."
user-invocable: true
disable-model-invocation: true
argument-hint: <target-package-path>
---

# claude-docs-asset-wiring

Wire a consumer package's `docs/claude/**` into `@slats/claude-assets-sync`
so end users can inject those assets via the engine's `inject-claude-settings`
bin. Reference consumer: `packages/canard/schema-form`.

The engine is single-dispatcher. Consumers do NOT ship their own bin stubs
— they declare `claude.assetPath` in `package.json` and let the engine's
`claude-build-hashes` bin regenerate `dist/claude-hashes.json` during
build. `src/core/**` never reads `package.json`; only the engine's `bin/`
layer resolves a single explicitly-named target.

**Outcome**

```bash
npx -p @slats/claude-assets-sync inject-claude-settings \
  --package=<PACKAGE_NAME> \
  --scope=user|project [--dry-run] [--force]
```

## Role

You are a monorepo wiring specialist. Execute the 6 steps below as a
single, idempotent procedure. On any conflicting existing value — ask
the user before overwriting. Never clobber silently.

## Knowledge Resources

Consult these files as needed during execution. Do NOT preload everything;
load on demand.

- `knowledge/reference-files.md` — what the consumer should (and should not) own
- `knowledge/package-json-patches.md` — every required `package.json` edit, with guard conditions
- `knowledge/claude-md-template.md` — the `## Claude Docs Injector` section to inject into the target `CLAUDE.md`
- `knowledge/smoke-tests.md` — E2E 8-path matrix via the engine dispatcher
- `knowledge/dependency-cruiser.md` — optional CI-time isolation rule
- `knowledge/gotchas.md` — invariants and pitfalls

## Inputs

Resolve these before starting. If any is missing, stop and ask.

| Variable       | Source                                                                                                    |
|----------------|-----------------------------------------------------------------------------------------------------------|
| `TARGET_PATH`  | Skill argument (e.g. `packages/lerx/promise-modal`). If absent, ask the user.                             |
| `PACKAGE_NAME` | `name` field of `${TARGET_PATH}/package.json`.                                                            |
| `SHORTCUT`     | Root `package.json` `scripts` entry whose value equals `yarn workspace ${PACKAGE_NAME}`; else unset.      |

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

### Step 1 — Patch `${TARGET_PATH}/package.json`

See `knowledge/package-json-patches.md` for the complete patch list:

- `claude.assetPath` — set to `docs/claude` (or the consumer's chosen path).
- `scripts.build` — ensure the chain ends with `&& yarn build:hashes`.
- `scripts.build:hashes` — set to `claude-build-hashes` (the engine's bin).
- `scripts.prepublishOnly` — `yarn build` if not already present.
- `dependencies."@slats/claude-assets-sync"` — add (NOT `devDependencies`, NOT `peerDependencies`).
- `files` — ensure `"dist"`, `"docs"`, `"README.md"` are listed. Never include `"bin"` or `"scripts"`.

Do NOT add any `bin` entry. Do NOT add `./bin/*` or `./docs/*` to `exports`.
Do NOT create `bin/` or `scripts/` directories in the consumer.

### Step 2 — Patch `${TARGET_PATH}/CLAUDE.md`

If `CLAUDE.md` exists, append or replace the `## Claude Docs Injector`
section from `knowledge/claude-md-template.md`, substituting
`${PACKAGE_NAME}`. Skip if `CLAUDE.md` does not exist (do not create one).

### Step 3 — (Optional) Dependency-cruiser isolation gate

Skip unless `${TARGET_PATH}/.dependency-cruiser.cjs` already exists or the
user explicitly asks. See `knowledge/dependency-cruiser.md` for the single
remaining forbidden rule (`src/**` → `docs/**`) and the `depcheck` script.

### Step 4 — Install and build

```bash
yarn install
yarn ${SHORTCUT:-workspace ${PACKAGE_NAME}} build
```

Expected: `rollup` → `buildTypes` → `claude-build-hashes` succeed, and
`${TARGET_PATH}/dist/claude-hashes.json` is written.

### Step 5 — E2E smoke via engine dispatcher

Run from `/tmp/...`, never from the monorepo root or `${TARGET_PATH}/` —
`--scope=project` walks `cwd` upward looking for an existing `.claude`,
which would mutate the real repo's. See `knowledge/smoke-tests.md` for
the full 8-path matrix, expected exit codes, and rationale.

### Step 6 — Report

Summarize:

- Files patched vs. skipped (with reason for each skip).
- Manifest file count from `dist/claude-hashes.json`.
- Smoke-test exit codes (all 8).
- Recommendation: commit this change on its own, separate from other work.

## Report Template

```markdown
## claude-docs-asset-wiring — ${PACKAGE_NAME}

**Files patched**
- package.json                 — patched: [claude.assetPath, scripts.build, scripts.build:hashes, dependencies, files]
- CLAUDE.md                    — section added | skipped (no CLAUDE.md)
- .dependency-cruiser.cjs      — updated | skipped (not present)

**Manifest**
- dist/claude-hashes.json: <N> files

**Smoke tests**
| # | command                                                     | expected | actual |
|---|-------------------------------------------------------------|----------|--------|
| 1 | --package=${PACKAGE_NAME} --scope=project --dry-run         | 0        | <n>    |
| 2 | --package=${PACKAGE_NAME} --scope=project                   | 0        | <n>    |
| 3 | --package=${PACKAGE_NAME} --scope=project (up-to-date)      | 0        | <n>    |
| 4 | CI=true --package=${PACKAGE_NAME} --scope=project (tampered)| 2        | <n>    |
| 5 | CI=true --package=${PACKAGE_NAME} --scope=project --force   | 0        | <n>    |
| 6 | CI=true --package=${PACKAGE_NAME} (missing --scope)         | 2        | <n>    |
| 7 | (missing --package)                                         | 2        | <n>    |
| 8 | --package=@does/not-exist                                   | 2        | <n>    |

**Next**: commit on its own — do not bundle with unrelated changes.
```

## Termination Conditions

- **Pre-Flight fails** → stop, report the failing check. Do not proceed.
- **Conflict during patch** → stop, show the diff, ask user whether to overwrite.
- **Build fails at Step 4** → stop, report error. Do not run smoke tests on a broken build.
- **Smoke test mismatch** → stop, report the failing path with captured exit code.
- **All steps pass** → emit the report from the template above.
