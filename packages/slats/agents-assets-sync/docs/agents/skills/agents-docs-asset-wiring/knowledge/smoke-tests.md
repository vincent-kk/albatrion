# E2E Smoke Tests — 9-path matrix via engine dispatcher

**Run from `/tmp/...` — never from the monorepo root or `${TARGET_PATH}/`.**

`--scope=project` walks `cwd` upward in two tiers: the nearest ancestor owning a root marker (`.git`, `pnpm-workspace.yaml`, or a lockfile: `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`, `npm-shrinkwrap.json`, `bun.lock`, `bun.lockb`) wins over any nearer `.claude`, `AGENTS.md`, `.agents` or `.codex`; only without a marker does the nearest of those agent directories decide, and with neither the root is `cwd`. Markers at or above the home directory are ignored. This repository's root owns `.git`, so any run started here targets the real repository root — a destructive error, not a near miss.

No fake `node_modules` needed — the engine resolves `${PACKAGE_NAME}/package.json` through `createRequire(...).resolve()` from its own installed location. The engine's own `dist/` must exist first: `bin/inject-agents-settings.mjs` imports `@slats/agents-assets-sync`, which resolves to `dist/index.mjs` through the workspace link.

---

## Why every command carries `--agent`

`--agent` is required wherever the CLI cannot ask. Plain and `--json` runs validate the completed flags without prompting, so a missing `--agent` exits 2 there whatever the terminal is. Only the Ink TTY path prompts for it.

The renderer is chosen by `process.stdout.isTTY` — the engine reads no `CI` variable, so setting one changes nothing. `--no-interactive` forces the plain renderer even on a TTY, which is why every path below carries it: the matrix then yields identical exit codes from an agent's pipe and from a human's terminal.

Use exactly **one** agent to keep the matrix minimal. The run's exit code is aggregated the same way for any number of (package, agent) pairs and in plain, `--json` and terminal output: `1` when any unit hit an execution error, otherwise `2` when a run that is not `--dry-run` has a unit needing `--force` without it, or a confirmation was declined, otherwise `0`. A `1` on path 4 is therefore an execution error, not aggregation.

---

## Setup

```bash
BIN="$PWD/packages/slats/agents-assets-sync/bin/inject-agents-settings.mjs"
DIR=/tmp/inject-smoke-${SHORTCUT:-target}
[ -d "$DIR" ] && find "$DIR" -mindepth 1 -delete
mkdir -p "$DIR" && cd "$DIR"
mkdir -p "$DIR/.git"
run() { node "$BIN" --no-interactive "$@"; echo "EXIT=$?"; }
```

`[ -d ... ] && find -delete` keeps the setup idempotent. **Never** use `rm -rf` or unquoted `*` globs — too easy to nuke the wrong directory.

`mkdir -p "$DIR/.git"` pins the project root to `$DIR` instead of leaving it to whatever ancestor of `/tmp` happens to own a root marker or an agent directory. It is inert for `--agent=claude`, which writes only under `.claude/`.

---

## Matrix

Execute sequentially. `run` echoes `EXIT=` after each command, so the value is captured before the next one overwrites `$?`.

| #   | Command (`run` = `node "$BIN" --no-interactive`)                                 | Expected exit | Purpose                                                |
| --- | -------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------ |
| 1   | `run --package=${PACKAGE_NAME} --agent=claude --scope=project --dry-run`         | 0             | Dry run — previews actions, no writes.                 |
| 2   | `run --package=${PACKAGE_NAME} --agent=claude --scope=project`                   | 0             | First real install — writes `.claude/` under `$DIR`.   |
| 3   | `run --package=${PACKAGE_NAME} --agent=claude --scope=project`                   | 0             | Re-run — no-op (idempotent).                           |
| 4   | (after tampering) `run --package=${PACKAGE_NAME} --agent=claude --scope=project` | **2**         | Diverged local content → refuse to overwrite.          |
| 5   | `run --package=${PACKAGE_NAME} --agent=claude --scope=project --force`           | 0             | `--force` overrides the refusal.                       |
| 6   | `run --package=${PACKAGE_NAME} --agent=claude`                                   | **2**         | Missing `--scope`.                                     |
| 7   | `run --agent=claude --scope=project`                                             | **2**         | Missing `--package` (dispatcher-specific).             |
| 8   | `run --package=@does/not-exist --agent=claude --scope=project`                   | **2**         | Unresolvable package (dispatcher-specific).            |
| 9   | `run --package=${PACKAGE_NAME} --scope=project`                                  | **2**         | Missing `--agent` — the flag every other path carries. |

Paths 6 and 9 are distinguishable, not redundant: validation reports every missing flag, so path 6 reports only the scope message and path 9 only the agent message. Read the stderr line, not just the code.

The engine's own suite pins the shapes of paths 6–9 (`src/__tests__/cli.test.ts`, the `exits 2 on %s` table). A mismatch here is an upstream regression, not a stale expectation.

### Tamper step (between path 3 and path 4)

```bash
find .claude -name SKILL.md -exec sh -c 'echo tampered >> "$1"' _ {} \;
```

Appends `tampered` to every `SKILL.md` under the local `.claude/`. Simulates a human edit the dispatcher must detect and refuse to clobber.

---

## Execution Shape

Split into **two bash calls** because `cwd` resets between Bash tool invocations. `run()` is a shell function, so it has to be defined again in the second call.

**First call** — paths 1–3:

```bash
BIN="$PWD/packages/slats/agents-assets-sync/bin/inject-agents-settings.mjs"
DIR=/tmp/inject-smoke-${SHORTCUT:-target}
[ -d "$DIR" ] && find "$DIR" -mindepth 1 -delete
mkdir -p "$DIR" && cd "$DIR"
mkdir -p "$DIR/.git"
run() { node "$BIN" --no-interactive "$@"; echo "EXIT=$?"; }

run --package=${PACKAGE_NAME} --agent=claude --scope=project --dry-run
run --package=${PACKAGE_NAME} --agent=claude --scope=project
run --package=${PACKAGE_NAME} --agent=claude --scope=project
```

**Second call** — paths 4–9:

```bash
BIN="$PWD/packages/slats/agents-assets-sync/bin/inject-agents-settings.mjs"
DIR=/tmp/inject-smoke-${SHORTCUT:-target}
cd "$DIR"
run() { node "$BIN" --no-interactive "$@"; echo "EXIT=$?"; }

find .claude -name SKILL.md -exec sh -c 'echo tampered >> "$1"' _ {} \;
run --package=${PACKAGE_NAME} --agent=claude --scope=project
run --package=${PACKAGE_NAME} --agent=claude --scope=project --force
run --package=${PACKAGE_NAME} --agent=claude
run --agent=claude --scope=project
run --package=@does/not-exist --agent=claude --scope=project
run --package=${PACKAGE_NAME} --scope=project
```

Note: `$PWD` in the second call is the parent shell's cwd (monorepo root), so `BIN` resolves before `cd "$DIR"` moves into the smoke directory.

---

## Failure Handling

| Observed | Meaning                                                                                                            | Action                                           |
| -------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| 1 ≠ 0 | Dry-run failed. Exit 1 with a file and line in stderr is a refused rule source (unclosed or nested fence or comment); otherwise an engine bug or bad `agents.assetPath`. | Stop, capture stderr, report. |
| 2 ≠ 0    | First write failed. Permissions, engine bug, or manifest issue.                                                    | Stop, inspect `dist/agents-hashes.json`, report. |
| 3 ≠ 0    | Idempotency broken — re-run should be no-op.                                                                       | Stop, diff `$DIR/.claude` before/after, report.  |
| 4 = 0    | Divergence not detected. Safety regression.                                                                        | Stop — the engine's overwrite gate is broken.    |
| 4 = 1 | An execution error preceded the divergence verdict, such as a refused rule source, a destination outside `$DIR`, or a failed write. | Stop, capture stderr, report. |
| 5 ≠ 0    | `--force` failed to override. Check engine.                                                                        | Stop, report.                                    |
| 6 = 0    | Engine defaulted a scope with no prompt available.                                                                 | Stop, report.                                    |
| 7 = 0    | Dispatcher accepted no `--package`. Violates contract.                                                             | Stop — dispatcher bug.                           |
| 8 = 0    | Dispatcher succeeded on unresolvable package. Violates contract.                                                   | Stop — dispatcher bug.                           |
| 9 = 0    | Engine defaulted an agent with no prompt available.                                                                | Stop, report.                                    |

Do not attempt to "make the tests pass" by altering expectations. The matrix encodes invariants of the engine — a mismatch is a real regression upstream.
