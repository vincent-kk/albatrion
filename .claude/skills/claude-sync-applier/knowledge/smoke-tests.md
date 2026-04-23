# E2E Smoke Tests — 6-path matrix

**Run from `/tmp/...` — never from the monorepo root or `${TARGET_PATH}/`.**

`--scope=project` walks `cwd` upward looking for an existing `.claude`
directory. Running from the monorepo would reuse or mutate the real repo's
`.claude`, which is a destructive error.

No fake `node_modules` needed — the bin resolves everything via
`import.meta.url`.

---

## Setup

```bash
BIN=$PWD/${TARGET_PATH}/bin/claude-sync.mjs
DIR=/tmp/claude-sync-smoke-${SHORTCUT:-target}
[ -d "$DIR" ] && find "$DIR" -mindepth 1 -delete
mkdir -p "$DIR" && cd "$DIR"
```

`[ -d ... ] && find -delete` keeps the setup idempotent. **Never** use
`rm -rf` or unquoted `*` globs — too easy to nuke the wrong directory.

---

## Matrix

Execute sequentially. `EXIT=$?` after each so the value is captured before the
next command overwrites `$?`.

| # | Command                                                                     | Expected exit | Purpose                                                  |
|---|-----------------------------------------------------------------------------|---------------|----------------------------------------------------------|
| 1 | `node "$BIN" --scope=project --dry-run`                                     | 0             | Dry run on empty dir — previews actions, no writes.      |
| 2 | `node "$BIN" --scope=project`                                               | 0             | First real install — writes `.claude/` under `$DIR`.     |
| 3 | `node "$BIN" --scope=project`                                               | 0             | Re-run — no-op because everything is already up-to-date. |
| 4 | (after tampering) `CI=true node "$BIN" --scope=project`                     | **2**         | CI + tampered content → refuse to overwrite.             |
| 5 | `CI=true node "$BIN" --scope=project --force`                               | 0             | `--force` overrides the refusal.                         |
| 6 | `CI=true node "$BIN"`                                                       | **2**         | Missing `--scope` in non-TTY context → exit 2.           |

### Tamper step (between path 3 and path 4)

```bash
find .claude -name SKILL.md -exec sh -c 'echo tampered >> "$1"' _ {} \;
```

Appends `tampered` to every `SKILL.md` under the local `.claude/`. This
simulates a human edit that the CI-mode bin must detect and refuse to clobber.

---

## Execution Shape

Split into **two bash calls** because `cwd` resets between Bash tool
invocations.

**First call** — paths 1–3:

```bash
BIN=$PWD/${TARGET_PATH}/bin/claude-sync.mjs
DIR=/tmp/claude-sync-smoke-${SHORTCUT:-target}
[ -d "$DIR" ] && find "$DIR" -mindepth 1 -delete
mkdir -p "$DIR" && cd "$DIR"

node "$BIN" --scope=project --dry-run; echo "EXIT=$?"   # expect 0
node "$BIN" --scope=project;           echo "EXIT=$?"   # expect 0
node "$BIN" --scope=project;           echo "EXIT=$?"   # expect 0
```

**Second call** — paths 4–6 (re-enter `$DIR`, reuse state from first call):

```bash
DIR=/tmp/claude-sync-smoke-${SHORTCUT:-target}
BIN=$PWD/${TARGET_PATH}/bin/claude-sync.mjs
cd "$DIR"

find .claude -name SKILL.md -exec sh -c 'echo tampered >> "$1"' _ {} \;
CI=true node "$BIN" --scope=project;         echo "EXIT=$?"   # expect 2
CI=true node "$BIN" --scope=project --force; echo "EXIT=$?"   # expect 0
CI=true node "$BIN";                         echo "EXIT=$?"   # expect 2
```

Note: `$PWD` in the second call is the parent shell's cwd (monorepo root), so
`BIN` resolves correctly. `cd "$DIR"` then moves into the smoke directory
before invoking.

---

## Failure Handling

| Observed | Meaning                                                                 | Action                                                             |
|----------|-------------------------------------------------------------------------|--------------------------------------------------------------------|
| 1 ≠ 0    | Dry-run crashed. Likely a stub or engine bug.                           | Stop, capture stderr, report.                                      |
| 2 ≠ 0    | First write failed. Likely permissions, engine bug, or manifest issue.  | Stop, inspect `dist/claude-hashes.json`, report.                   |
| 3 ≠ 0    | Idempotency broken — re-run should be no-op.                            | Stop, diff `$DIR/.claude` before/after, report.                    |
| 4 = 0    | CI mode did not refuse tampered files. Safety regression.               | Stop — the engine's CI gate is broken.                             |
| 5 ≠ 0    | `--force` failed to override. Check engine.                             | Stop, report.                                                      |
| 6 = 0    | Engine defaulted a scope in non-TTY context. Should require `--scope`.  | Stop, report.                                                      |

Do not attempt to "make the tests pass" by altering expectations. The matrix
encodes invariants of the engine — a mismatch is a real regression upstream.
