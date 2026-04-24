# E2E Smoke Tests — 8-path matrix via engine dispatcher

**Run from `/tmp/...` — never from the monorepo root or `${TARGET_PATH}/`.**

`--scope=project` walks `cwd` upward looking for an existing `.claude`
directory. Running from the monorepo would reuse or mutate the real
repo's `.claude`, which is a destructive error.

No fake `node_modules` needed — the engine uses
`createRequire(import.meta.url).resolve(`${PACKAGE_NAME}/package.json`)`
from the engine's own installed location.

---

## Setup

```bash
BIN="$PWD/packages/slats/claude-assets-sync/bin/inject-claude-settings.mjs"
DIR=/tmp/inject-smoke-${SHORTCUT:-target}
[ -d "$DIR" ] && find "$DIR" -mindepth 1 -delete
mkdir -p "$DIR" && cd "$DIR"
```

`[ -d ... ] && find -delete` keeps the setup idempotent. **Never** use
`rm -rf` or unquoted `*` globs — too easy to nuke the wrong directory.

---

## Matrix

Execute sequentially. `EXIT=$?` after each so the value is captured
before the next command overwrites `$?`.

| #  | Command                                                                                          | Expected exit | Purpose                                                      |
|----|--------------------------------------------------------------------------------------------------|---------------|--------------------------------------------------------------|
|  1 | `node "$BIN" --package=${PACKAGE_NAME} --scope=project --dry-run`                                | 0             | Dry run — previews actions, no writes.                       |
|  2 | `node "$BIN" --package=${PACKAGE_NAME} --scope=project`                                          | 0             | First real install — writes `.claude/` under `$DIR`.         |
|  3 | `node "$BIN" --package=${PACKAGE_NAME} --scope=project`                                          | 0             | Re-run — no-op (idempotent).                                 |
|  4 | (after tampering) `CI=true node "$BIN" --package=${PACKAGE_NAME} --scope=project`                | **2**         | CI + tampered content → refuse to overwrite.                 |
|  5 | `CI=true node "$BIN" --package=${PACKAGE_NAME} --scope=project --force`                          | 0             | `--force` overrides the refusal.                             |
|  6 | `CI=true node "$BIN" --package=${PACKAGE_NAME}`                                                  | **2**         | Missing `--scope` in non-TTY context.                        |
|  7 | `node "$BIN"`                                                                                    | **2**         | Missing `--package` (dispatcher-specific).                   |
|  8 | `node "$BIN" --package=@does/not-exist`                                                          | **2**         | Unresolvable package (dispatcher-specific).                  |

### Tamper step (between path 3 and path 4)

```bash
find .claude -name SKILL.md -exec sh -c 'echo tampered >> "$1"' _ {} \;
```

Appends `tampered` to every `SKILL.md` under the local `.claude/`.
Simulates a human edit that the CI-mode dispatcher must detect and
refuse to clobber.

---

## Execution Shape

Split into **two bash calls** because `cwd` resets between Bash tool
invocations.

**First call** — paths 1–3:

```bash
BIN="$PWD/packages/slats/claude-assets-sync/bin/inject-claude-settings.mjs"
DIR=/tmp/inject-smoke-${SHORTCUT:-target}
[ -d "$DIR" ] && find "$DIR" -mindepth 1 -delete
mkdir -p "$DIR" && cd "$DIR"

node "$BIN" --package=${PACKAGE_NAME} --scope=project --dry-run; echo "EXIT=$?"
node "$BIN" --package=${PACKAGE_NAME} --scope=project;           echo "EXIT=$?"
node "$BIN" --package=${PACKAGE_NAME} --scope=project;           echo "EXIT=$?"
```

**Second call** — paths 4–8:

```bash
DIR=/tmp/inject-smoke-${SHORTCUT:-target}
BIN="$PWD/packages/slats/claude-assets-sync/bin/inject-claude-settings.mjs"
cd "$DIR"

find .claude -name SKILL.md -exec sh -c 'echo tampered >> "$1"' _ {} \;
CI=true node "$BIN" --package=${PACKAGE_NAME} --scope=project;         echo "EXIT=$?"
CI=true node "$BIN" --package=${PACKAGE_NAME} --scope=project --force; echo "EXIT=$?"
CI=true node "$BIN" --package=${PACKAGE_NAME};                         echo "EXIT=$?"
node "$BIN";                                                            echo "EXIT=$?"
node "$BIN" --package=@does/not-exist;                                 echo "EXIT=$?"
```

Note: `$PWD` in the second call is the parent shell's cwd (monorepo
root), so `BIN` resolves correctly. `cd "$DIR"` then moves into the
smoke directory before invoking.

---

## Failure Handling

| Observed | Meaning                                                                 | Action                                                             |
|----------|-------------------------------------------------------------------------|--------------------------------------------------------------------|
| 1 ≠ 0    | Dry-run crashed. Likely an engine bug or bad `claude.assetPath`.        | Stop, capture stderr, report.                                      |
| 2 ≠ 0    | First write failed. Permissions, engine bug, or manifest issue.         | Stop, inspect `dist/claude-hashes.json`, report.                   |
| 3 ≠ 0    | Idempotency broken — re-run should be no-op.                            | Stop, diff `$DIR/.claude` before/after, report.                    |
| 4 = 0    | CI mode did not refuse tampered files. Safety regression.               | Stop — the engine's CI gate is broken.                             |
| 5 ≠ 0    | `--force` failed to override. Check engine.                             | Stop, report.                                                      |
| 6 = 0    | Engine defaulted a scope in non-TTY context. Should require `--scope`.  | Stop, report.                                                      |
| 7 = 0    | Dispatcher accepted no `--package`. Violates contract.                  | Stop — dispatcher bug.                                             |
| 8 = 0    | Dispatcher succeeded on unresolvable package. Violates contract.        | Stop — dispatcher bug.                                             |

Do not attempt to "make the tests pass" by altering expectations. The
matrix encodes invariants of the engine — a mismatch is a real
regression upstream.
