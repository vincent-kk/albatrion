# Round 441 — three owner tables at the new product end `47ad92cf3`: mount, single input, bulk setValue (0.16.1 vs current, Node, NODE_ENV=production)

Measurement only, in the MAIN worktree `/Users/Vincent/Workspace/albatrion` (HEAD and product end `47ad92cf3`; it contains #431 reader fix and #432 node export condition on top of `8a3ee595a`). Report in complete formal Korean sentences; owner names only Vincent or Vincent Kelvin.

Orca rules: run-use 와 코디네이터 명령 금지, check 는 --terminal 로. No delegation, spawning, terminal/worktree creation or removal, model substitution, no config/auth changes, no `git stash`, no commit, push, PR or install. Excluded CLIs (`yarn`, `gh`, `orca`, `npm`, `bun`) run as the only thing in a shell call: no pipes, `;`, redirects, env prefixes or heredocs. Use `/opt/homebrew/bin/node` (v26.12.0) for every measured process. If your provider reports a usage limit, stop and send `worker_done --outcome failed` naming the step reached. Stop and send a `question` on anything not covered rather than guessing — in particular on the scene definitions below if the 0.16.1 bundle cannot run one of them.

## Why

The owner's reporting rule (439C-04) asks for a table whenever a stage changes the speed figures, and on 2026-10-21 the owner added: "다음부터는 마운트 / 입력 을 별도 표로 구분하고, 단일 입력(input 에 단일 입력)과 setValue 로 일괄 입력하는 것을 구분해서 하도록 해." So this window produces three tables, each 0.16.1 (E0) versus current (E9), with the columns 항목, N, E0 ms, 폭, E9 ms, 폭, Δ ms, Δ %, E0 µs/N, E9 µs/N.

## Namespace and editions

`<ns>` = `/Users/Vincent/Workspace/albatrion/.seiri/tasks/three-tables-441/` (create; gitignored). References (read-only): `/Users/Vincent/Workspace/albatrion/.seiri/tasks/mount-env-440/` (mount tools, E0 bundle `bundles/E0.mjs` SHA256 `8724b4d98ceea5b27dae868ff228f8eb315fe8e70a34e2a540827499ffda605c`, probe export tail), `/Users/Vincent/Workspace/albatrion/.seiri/tasks/dev-flag-440/measure/` (prepare that resolves the file Node actually loads), `/Users/Vincent/Workspace/albatrion/.seiri/tasks/m3-433/` (the M3 window's core-update lanes that ran the same update scenes on E0 and the current edition — reuse its scene code and E0 adapter), and `packages/canard/schema-form/architecture/verification/perf-optimization/m3-results.md` (how update rows were defined: oneOf = two writes summed, flat/nested = ten writes summed — this window replaces that with the two separated input tables).

- `E0` = copy `mount-env-440/bundles/E0.mjs`; verify the SHA256.
- `E9` = the current build in `packages/canard/schema-form/dist/` (already rebuilt after the merge; confirm `git rev-parse HEAD` is `47ad92cf3`, `git status --porcelain` shows only untracked briefs and the two `schema-form-*/` directories that are being removed — never touch them). Resolve the file Node actually loads with `import.meta.resolve('@canard/schema-form')` from the package directory, assert it ends with `dist/index.node.mjs`, copy it to `<ns>/bundles/E9.mjs` and record SHA256 of `index.mjs`, `index.node.mjs`, `index.cjs` in `<ns>/build.md`. Build the probe copy as `dev-flag-440/measure` did (same export tail). Do not run `yarn build`.

## Scenes (14 sizes each: oneOf-5/10/20/40/80, flat-50/100/500/1000/2000, nested-d3/d4/d5/d6 with the fixtures of `mount-env-440/tools`)

1. **Mount** — exactly as `mount-env-440` (blueprint + tree + first settle), production condition only (unset condition not needed this time).
2. **Single input** — one write to one leaf through the public node API as a typed input would do (the same call the M3 core-update lane used for one write): flat = the last field; nested = one leaf at the deepest level; oneOf = one field inside the currently active branch. Report ms per single write (not summed). Add for oneOf a second row "branch switch": one write to the discriminator that activates another branch (a single input too, but a different cost); label it separately.
3. **Bulk setValue** — one `setValue` on the root with a complete new value in which every leaf differs from the mounted value (flat: all fields; nested: all leaves; oneOf: the active branch's fields plus the discriminator unchanged). Report ms per bulk write.

For scenes 2 and 3 each measured process mounts once (not timed), then performs the write repeatedly on fresh mounts or on a reset value as the M3 lane did; state exactly which. If the 0.16.1 bundle lacks an API needed for a scene, do not emulate it: leave the E0 cell empty with the reason (the owner's rule: "이전 버전에서 없던 기능은 비교대상을 공란으로 하고, 절대값만 표시하면 된다").

## Steps

1. Assemble `<ns>/tools/` from the references (copy, then adapt only paths, edition lists and the three-scene driver); record every change in `<ns>/tools-diff.txt` and `<ns>/environment.json`.
2. Quiet window (ask the coordinator with a `question` before starting; process snapshots before and after; UTC times in `<ns>/window.json`): 3 scenes (+ the oneOf branch-switch row) × 14 sizes × editions E0, E9 × 3 rounds, interleaved and rotated as before, new process per run, NODE_ENV=production. Every command must exit 0; on a failure record it, rerun once, and report if it repeats.
3. Derive `<ns>/rows.md`: Table 1 mount, Table 2 single input (with the oneOf branch-switch rows), Table 3 bulk setValue; plus the 439b/440 mount columns for continuity (`E6-prod`, `E7-prod` copied from the earlier rows.md files with a note that those windows measured `index.mjs`, this one measures `index.node.mjs`).
4. Write `<ns>/report.md` (Korean): scope, the three tables, per-family summary, and limitations (one machine, one window, no A′ calibration, no 동치/입증 verdicts claimed; the file switch). Seal `<ns>` into `<ns>/seal.json` (SHA256 of every file).

`worker_done --outcome succeeded` only when all runs exited 0, the tables and the seal exist, and `git status --porcelain` shows nothing new. Otherwise `failed` with the failing command, cwd, exit and output. Check the live mailbox once before one genuine worker_done, then idle.
