# Round 426 — T14 follow-up step 1: remaining timing assertion diagnosis and G5 scope reading

## Activation and role

Activated only by the live root Orca dispatch naming it. Vincent instructed on 2026-10-19 to proceed with the T14 follow-up and then re-measurement. This brief covers only the first step: diagnose the one remaining head-only test failure and read back what gate G5 requires. It authorizes read-only diagnosis plus repeated runs of one test file; it does not authorize product edits, expectation changes, fixes, commits, pushes, PR edits, merges or timing acceptance. Codex gpt-6.1-sol high only. Report in complete formal Korean sentences; owner names only Vincent or Vincent Kelvin.

Orca rules: run-use 와 코디네이터 명령 금지, check 는 --terminal 로. Use only the live handle, task and dispatch IDs. No worker spawning, coordinator commands, terminal/worktree creation, Claude, astra or model substitution. Standalone CLIs without pipes, semicolons, redirects or env prefixes. Ask blocking questions through the live preamble. Never use bare git stash, installs, auth or config changes.

## Checkout and inputs

Checkout `/Users/Vincent/Workspace/albatrion/schema-form-observation-identity-2`, HEAD must be `dfdda7f55abba36c76b0ebf57258ccb7f61f9f79`, base `5cfb7c74c8bfa517289673274e74c2395cb2717d`, status clean. Dependencies and workspace `dist` are already built; do not reinstall or rebuild. Existing evidence under `.seiri/tasks/observation-identity-reacquire/` (seal SHA256 27c9f9583ee314bdbf080d5904405b086720032a1e27d18f1864e4422450e43f) is read-only; `classification.md` and `test-full-head-3.json` carry the remaining failure. Main `/Users/Vincent/Workspace/albatrion` is read-only input.

## Part A — timing assertion diagnosis

Target: `packages/canard/schema-form/src/core/__tests__/global-errors.timing.test.ts`, test "clears fields holding root issues one call at a time in linear time". It passed at base and in head run 1, failed in head runs 2 and 3 (solo).

1. Read the test: record the exact measured quantity, the threshold or ratio asserted, and which product modules it exercises.
2. Confirm by `git diff --stat 5cfb7c74c dfdda7f55 -- packages/canard/schema-form/src` and by import tracing whether any of the four T14 commits touches a module on that path. T14 is declared verification-only (13 verification paths + `src/core/DETAIL.md`); state whether that declaration holds for this path.
3. Run only that test file with `yarn workspace @canard/schema-form test --run src/core/__tests__/global-errors.timing.test.ts` five times at head and, after `git switch --detach 5cfb7c74c8bfa517289673274e74c2395cb2717d`, five times at base, then return to `vincent-kk/schema-form-observation-identity-2` and verify HEAD/clean. Record per run: pass/fail, the measured values the test prints or that you can read from its assertion message, Node version, and wall time. Do not run anything else concurrently.
4. Verdict, one of: `product-regression` (head measurably slower on the same path with a code cause you can name at path:line), `timing-noise` (fails intermittently on both commits or failure does not track the commit), `verification-interference` (a T14 verification file changes the environment of this test, for example a global fixture, setup file or vitest config include), or `indeterminate`. Give the evidence; do not change the test, its threshold, or product code.

## Part B — G5 reading

Read main `/Users/Vincent/Workspace/albatrion/.seiri/tasks/first-object-names-portability/amended-plan.md` and the refinement `.seiri/tasks/first-object-names-portability-refinement/plan.md` (SHA256 d174b315d12d1f6cd66896f8d75e37e1bbdf1236492b20e725ff3163d1398a0e). Quote verbatim the definition of gate G5 of the new execution gates G1–G5 (not the original eleven), list its concrete pass conditions, which of them the re-acquired evidence already satisfies (cite file paths), and which require new runs, readiness inputs or the lost raw evidence. Do not execute G5; only report what it needs.

## Evidence and completion

Write under `/Users/Vincent/Workspace/albatrion/schema-form-observation-identity-2/.seiri/tasks/t14-followup-diagnosis/`: `timing-runs.json` (ten receipts), `timing-diagnosis.md`, `g5-reading.md`, `report.md`, `seal.json`. No Seiri journals or CHECK-bearing commands. `worker_done --outcome succeeded` when Part A has a verdict with evidence and Part B quotes G5; `failed` otherwise. The summary states the verdict, the ten pass/fail results with measured values, the G5 pass conditions and their status, the report and seal paths with SHA256, and unresolved limitations. Check the live mailbox once before one genuine worker_done, then idle.
