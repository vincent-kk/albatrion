# Round 425 — Draft PR423 checkout and gate evidence re-acquisition after local evidence loss

## Activation and role

This brief is activated only by the live root Orca dispatch that names it. The owner Vincent confirmed on 2026-10-19 that the former child checkout `/Users/Vincent/Workspace/albatrion/l3e-direct-ownership`, with its private measurement raw data and P1 failure evidence, was deleted during environment cleanup, that no backup exists, and instructed re-acquisition. This brief authorizes checkout verification, environment re-establishment and the four package gates only. It does not authorize product edits, expectation changes, timing measurements, the P1 protocol, commits, pushes, PR edits or merges. Owner 60 hold, owner 54/58/59, TEST-027/M3 and performance acceptance remain held. Only the codex worker named in the live preamble may perform it, using gpt-6.1-sol with high effort. Report in complete formal Korean sentences, using only Vincent or Vincent Kelvin for owner names.

Orca rules: run-use 와 코디네이터 명령 금지, check 는 --terminal 로. Use only the live handle, task and dispatch IDs. No worker spawning, coordinator commands, terminal/worktree creation, Claude, astra or model substitution. Use standalone CLIs without pipes, semicolons, redirects or environment prefixes. Ask blocking scope questions through the live Orca preamble. Stop a genuinely denied scope without alternate-tool/path retries or permission/configuration changes, and report exact command/cwd/exit/error. Never use bare git stash, authentication changes or shell-close recovery.

## Target and immutable inputs

Your checkout is `/Users/Vincent/Workspace/albatrion/l3e-direct-ownership`, Orca worktree id `e6ce1c03-a2d9-41a9-a217-79ad5c407d6d::/Users/Vincent/Workspace/albatrion/l3e-direct-ownership`, local branch `vincent-kk/l3e-direct-ownership` created from `origin/perf/schema-form-itemless-declarations`. First step: verify `git rev-parse HEAD` equals `282685f27aea0a82c042b4d945e2730dc9d4f9a3` (Draft PR423 head), record `git merge-base HEAD origin/feat/schema-form-08-review-and-perf`, record `git rev-parse HEAD:packages/canard/schema-form/src` (expected `337fca70768f31ded96871fed934db370e9b7729`), and verify `git status --porcelain` is empty. If HEAD differs or the tree is dirty, stop and ask. Never push the local branch; it is a read-only mirror of the PR branch.

Main `/Users/Vincent/Workspace/albatrion` is read-only input: do not edit, stage, run tests in, or change its `node_modules`. The ledger's recorded PR423 results (two-runtime 58-scene observation difference 0, four gates passed, 136 measurement rows, P1 whole-protocol failure) are context, not expectations: record what actually happens now and name every divergence.

## Environment re-establishment

Record Node, Bun, Yarn and OS versions. If the checkout has no usable `node_modules`, run exactly `yarn install --immutable` once from the checkout root; the owner authorized this install for re-acquisition. Record its exit, duration and whether `yarn.lock` or any tracked file changed (it must not; if it does, stop and ask). No other install, link, config, hook or authentication change. If a designated command then fails because a tool is missing, record the exact command, cwd, exit and error and ask before any workaround.

## Required runs

From the checkout, `yarn workspace @canard/schema-form typecheck`, `lint`, `test --run`, `build`, in that order. Capture full raw stdout/stderr per run and a vitest JSON result (`--reporter=json --outputFile=<path>`) for the test run, through the tool's own flags, never shell redirects. Record exits, files/tests passed, failed, todo, errors, the list of failing test files and names, and whether build changed tracked artifacts (`git status --porcelain`); do not commit artifacts. Run each gate once; repeat only an interrupted run and say so. No benchmarks, no timing, no P1 or comparison protocol.

## Evidence namespace and seal

Write everything under `/Users/Vincent/Workspace/albatrion/l3e-direct-ownership/.seiri/tasks/itemless-declarations-reacquire/`: `environment.json` (versions, install receipt, lockfile hash before/after, HEAD, merge-base, src tree hash), `gates.json`, `test-full.json` plus raw log, `report.md`, and `seal.json` listing every evidence file with bytes and SHA256. Do not write into main's `.seiri/tasks`, do not create or touch Seiri journals or session JSON, and do not run Seiri CHECK-bearing commands.

## Completion evidence and outcome

`worker_done --outcome succeeded` means the checkout verified, the environment record exists, all four gates executed and the seal exists, regardless of gate results. `--outcome failed` means a required run could not be executed or the checkout drifted. The summary must state: actual HEAD, merge-base and src tree hash, install performed or not, the four gate exits and full test totals, the report and seal paths with the seal SHA256, and every unresolved limitation. Do not call PR423 accepted or mergeable. Check your live mailbox once before one genuine worker_done, then idle.
