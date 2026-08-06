---
name: agents-docs-asset-wiring
description: "Wire a consumer package's docs/agents assets into the @slats/agents-assets-sync engine. Adds package.json.agents.assetPath, points scripts.build:hashes at agents-build-hashes, declares the engine as a devDependency, updates the consumer CLAUDE.md, and runs the dispatcher smoke test. Idempotent — asks before clobbering."
user-invocable: true
disable-model-invocation: true
argument-hint: <target-package-path>
---

# agents-docs-asset-wiring

Wire a consumer package's `docs/agents/**` into `@slats/agents-assets-sync` so end users can inject those assets through the engine's dispatcher. Reference consumer: `packages/canard/schema-form`.

The engine is single-dispatcher. Consumers do NOT ship their own bin stubs — they declare `agents.assetPath` in `package.json` and let the engine's `agents-build-hashes` bin regenerate `dist/agents-hashes.json` during build. `src/core/**` never reads `package.json`; only the engine's bin layer resolves an explicitly-named target.

**Outcome**

```bash
npx -p @slats/agents-assets-sync inject-agents-settings \
  --package=<PACKAGE_NAME> \
  --agent=claude|codex|agents \
  --scope=user|project [--dry-run] [--force] [--yes]
```

`--agent` is not optional. The CLI asks for it only on an interactive TTY; in every other context — a pipe, CI, an agent's shell, or `--no-interactive` — omitting it exits 2. The same holds for `--scope`.

The engine installs three bins. `agents-assets-sync` and `inject-agents-settings` are the same dispatcher under two names (npx alias vs. installed command); `agents-build-hashes` is the build-time helper this skill wires into `scripts.build:hashes`.

For a package that ships assets but declares no `agents.assetPath`, the caller can name the directory instead: `--asset-path=<dir>` overrides the declaration on every target and hashes that directory at run time, so no manifest is needed. That is a call-site escape hatch, not a substitute for the wiring below.

## Role

You are a monorepo wiring specialist. Execute the 6 steps below as a single, idempotent procedure. On any conflicting existing value — ask the user before overwriting. Never clobber silently.

## Knowledge Resources

Consult these files as needed during execution. Do NOT preload everything; load on demand.

- `knowledge/package-json-patches.md` — every required `package.json` edit with its guard condition, what the consumer must not own, and what the engine's three bins provide
- `knowledge/agent-md-template.md` — the `## Agent Docs Injector` section to inject into the target `CLAUDE.md`
- `knowledge/smoke-tests.md` — E2E 9-path matrix via the engine dispatcher
- `knowledge/gotchas.md` — invariants, pitfalls, and the optional dependency-cruiser gate

## Inputs

Resolve these before starting. If any is missing, stop and ask.

| Variable       | Source                                                                                               |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| `TARGET_PATH`  | Skill argument (e.g. `packages/lerx/promise-modal`). If absent, ask the user.                        |
| `PACKAGE_NAME` | `name` field of `${TARGET_PATH}/package.json`.                                                       |
| `SHORTCUT`     | Root `package.json` `scripts` entry whose value equals `yarn workspace ${PACKAGE_NAME}`; else unset. |

`SHORTCUT` is a convenience only. When unset, fall back to full workspace syntax: `yarn workspace ${PACKAGE_NAME} <subcommand>`.

## Pre-Flight

Stop and report on any failure. Do not attempt to fix silently.

- [ ] `${TARGET_PATH}/docs/agents/skills/<name>/SKILL.md` and `knowledge/*.md` exist — the docs to be injected.
- [ ] `${TARGET_PATH}/package.json` has `"type": "module"` and `"sideEffects": false`.
- [ ] Build pipeline uses `rolldown -c && yarn build:types` where `build:types` runs `node ../../aileron/script/build/buildTypes.mjs`.
- [ ] `git status` in `${TARGET_PATH}` is clean. Unrelated changes present → confirm with user before proceeding.

## Steps

Execute in order. Each step is idempotent; on conflict, ask rather than overwrite.

### Step 1 — Patch `${TARGET_PATH}/package.json`

See `knowledge/package-json-patches.md` for the complete patch list:

- `agents.assetPath` — set to `docs/agents` (or the consumer's chosen path).
- `scripts.build` — ensure the chain ends with `&& yarn build:hashes`.
- `scripts.build:hashes` — set to `agents-build-hashes` (the engine's bin).
- `scripts.prepublishOnly` — `yarn build` if not already present.
- `devDependencies."@slats/agents-assets-sync"` — add (NOT `dependencies`, NOT `peerDependencies`). The engine is CLI-only and must not leak into end-user production installs.
- `files` — ensure `"dist"`, `"docs"`, `"README.md"` are listed. Never include `"bin"` or `"scripts"`.

Do NOT add any `bin` entry. Do NOT add `./bin/*` or `./docs/*` to `exports`. Do NOT create `bin/` or `scripts/` directories in the consumer.

### Step 2 — Patch `${TARGET_PATH}/CLAUDE.md`

If `CLAUDE.md` exists, append or replace the `## Agent Docs Injector` section from `knowledge/agent-md-template.md`, substituting `${PACKAGE_NAME}`. Skip if `CLAUDE.md` does not exist (do not create one).

The heading is `## Agent Docs Injector` — every deployed consumer uses that name. Matching on anything else finds no existing section and appends a duplicate, which is how this step loses its idempotency.

### Step 3 — (Optional) Dependency-cruiser isolation gate

Skip unless `${TARGET_PATH}/.dependency-cruiser.cjs` already exists or the user explicitly asks. See the optional gate section in `knowledge/gotchas.md` for the single forbidden rule (`src/**` → `docs/**`) and the `depcheck` script.

### Step 4 — Install and build

```bash
yarn install
yarn ${SHORTCUT:-workspace ${PACKAGE_NAME}} build
```

Expected: `rolldown` → `buildTypes` → `agents-build-hashes` succeed, and `${TARGET_PATH}/dist/agents-hashes.json` is written.

### Step 5 — E2E smoke via engine dispatcher

Run from `/tmp/...`, never from the monorepo root or `${TARGET_PATH}/` — `--scope=project` walks `cwd` upward for the nearest project anchor, and `.git` is one of them, so any run started inside this repository targets the real repository root. See `knowledge/smoke-tests.md` for the full 9-path matrix, expected exit codes, and rationale. Every command in it carries `--agent=claude`; the ninth path is the one that omits `--agent` on purpose.

### Step 6 — Report

Summarize:

- Files patched vs. skipped (with reason for each skip).
- Manifest file count from `dist/agents-hashes.json`.
- Smoke-test exit codes (all 9).
- Recommendation: commit this change on its own, separate from other work.

## Report Template

```markdown
## agents-docs-asset-wiring — ${PACKAGE_NAME}

**Files patched**

- package.json — patched: [agents.assetPath, scripts.build, scripts.build:hashes, devDependencies, files]
- CLAUDE.md — section added | skipped (no CLAUDE.md)
- .dependency-cruiser.cjs — updated | skipped (not present)

**Manifest**

- dist/agents-hashes.json: <N> files

**Smoke tests** (`run` = `node "$BIN" --no-interactive`)
| # | command | expected | actual |
|---|-------------------------------------------------------------------------|----------|--------|
| 1 | run --package=${PACKAGE_NAME} --agent=claude --scope=project --dry-run | 0 | <n> |
| 2 | run --package=${PACKAGE_NAME} --agent=claude --scope=project | 0 | <n> |
| 3 | run --package=${PACKAGE_NAME} --agent=claude --scope=project (up-to-date) | 0 | <n> |
| 4 | run --package=${PACKAGE_NAME} --agent=claude --scope=project (tampered) | 2 | <n> |
| 5 | run --package=${PACKAGE_NAME} --agent=claude --scope=project --force | 0 | <n> |
| 6 | run --package=${PACKAGE_NAME} --agent=claude (missing --scope) | 2 | <n> |
| 7 | run --agent=claude --scope=project (missing --package) | 2 | <n> |
| 8 | run --package=@does/not-exist --agent=claude --scope=project | 2 | <n> |
| 9 | run --package=${PACKAGE_NAME} --scope=project (missing --agent) | 2 | <n> |

**Next**: commit on its own — do not bundle with unrelated changes.
```

## Termination Conditions

- **Pre-Flight fails** → stop, report the failing check. Do not proceed.
- **Conflict during patch** → stop, show the diff, ask user whether to overwrite.
- **Build fails at Step 4** → stop, report error. Do not run smoke tests on a broken build.
- **Smoke test mismatch** → stop, report the failing path with captured exit code.
- **All steps pass** → emit the report from the template above.
