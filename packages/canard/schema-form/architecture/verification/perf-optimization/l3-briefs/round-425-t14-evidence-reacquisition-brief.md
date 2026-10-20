# Round 425 — T14 Draft PR424 evidence re-acquisition after local evidence loss

## Activation and role

This brief is activated only by the live root Orca dispatch that names it. The owner Vincent confirmed on 2026-10-19 that the former child checkout `/Users/Vincent/Workspace/albatrion/schema-form-observation-identity` and its private `.seiri/tasks/observation-identity-portability/` evidence were deleted during environment cleanup, that no backup exists, and instructed re-acquisition. This brief authorizes evidence re-acquisition only. It does not authorize product edits, test or expectation changes, fixes for failing tests, commits, pushes, PR edits, merges, timing measurements or performance acceptance. Only the codex worker named in the live preamble may perform it, using gpt-6.1-sol with high effort. Report in complete formal Korean sentences, using only Vincent or Vincent Kelvin for owner names.

Orca rules: run-use 와 코디네이터 명령 금지, check 는 --terminal 로. Use only the live handle, task and dispatch IDs. No worker spawning, coordinator commands, terminal/worktree creation, Claude, astra or model substitution. Use standalone CLIs without pipes, semicolons, redirects or environment prefixes. Ask blocking scope questions through the live Orca preamble. Stop a genuinely denied scope without alternate-tool/path retries or permission/configuration changes, and report exact command/cwd/exit/error. Never use bare git stash, authentication changes or shell-close recovery.

## Target and immutable inputs

Your checkout is `/Users/Vincent/Workspace/albatrion/schema-form-observation-identity-2`, Orca worktree id `e6ce1c03-a2d9-41a9-a217-79ad5c407d6d::/Users/Vincent/Workspace/albatrion/schema-form-observation-identity-2`, local branch `vincent-kk/schema-form-observation-identity-2` created from `origin/vincent-kk/schema-form-observation-identity`. First step: verify `git rev-parse HEAD` equals `dfdda7f55abba36c76b0ebf57258ccb7f61f9f79` (Draft PR424 head), that `git merge-base HEAD origin/feat/schema-form-08-review-and-perf` equals `5cfb7c74c8bfa517289673274e74c2395cb2717d`, and that `git status --porcelain` is empty. If any differs, stop and ask. Never push the local `-2` branch; it is a read-only mirror of the PR branch.

Main `/Users/Vincent/Workspace/albatrion` is read-only input: do not edit, stage, run tests in, or change its `node_modules`. The historical reports `packages/canard/schema-form/architecture/reviews/round-423-t14-handoff.md` and `reviews/round-424-environment-handoff.md` describe the lost evidence (full test 37 failed/724 passed files, 61 failed/4748 passed/1 todo tests, 18 errors, exit 1; targeted 26 passed; typecheck/lint/build exit 0). They are context, not expectations: record what actually happens now and name every divergence.

## Environment re-establishment

The previous child environment (own Yarn state, package-local AJV8, tsc-alias, addon-vitest 10.4.1 clone with a one-byte LF package.json difference) is lost and must not be reconstructed by manual links or copies. Record Node, Bun, Yarn and OS versions. If the checkout has no usable `node_modules`, run exactly `yarn install --immutable` once from the checkout root; the owner authorized this install for re-acquisition. Record its exit, duration and whether `yarn.lock` or any tracked file changed (it must not; if it does, stop and ask). No other install, link, config, hook or authentication change. If a designated command then fails because a tool is missing, record the exact command, cwd, exit and error and ask before any workaround.

## Required runs, in this order

All package commands run from the checkout with `yarn workspace @canard/schema-form <script>`. Capture full raw stdout/stderr of every run to files under the evidence namespace; use vitest's own `--reporter=json --outputFile=<path>` in addition to the default reporter where a JSON result is needed. Do not use shell pipes or redirects for excluded CLIs; use the tool's own output flags, or capture through the worker's own file-writing mechanism.

1. Targeted tests at head: `src/core/__tests__/fixtures/itemlessDeclarations/__tests__/ruleTargetIdentity.test.ts`, `src/core/__tests__/fixtures/observationIdentity/__tests__/capture.test.ts` and `src/__tests__/importModel.test.ts`. Record counts.
2. Gates at head: `typecheck`, `lint`, `build`. Record exits and whether build produced tracked artifact changes (`git status --porcelain`); do not commit artifacts.
3. Full test at head: `test --run`. Record files/tests passed, failed, todo, errors, exit, and the list of failing test files and test names.
4. Baseline comparison in the same environment: `git switch --detach 5cfb7c74c8bfa517289673274e74c2395cb2717d`, run the same `test --run`, record the same fields, then `git switch vincent-kk/schema-form-observation-identity-2` and verify HEAD is again `dfdda7f55` with empty status. Do not reinstall between the two runs.
5. Classification: for every failing test or error at head, state one of: `baseline-same` (identical failure at base in this environment), `head-only` (passes or absent at base, fails at head), `base-only` (fails at base, passes at head), `flaky` (differs between repeats only if you had to repeat). Group `baseline-same` by probable cause family from the error text (for example Storybook addon fetch, jsdom guard, assertion) without asserting the cause as proven. Do not rerun the full suite more than once per commit unless a specific run was interrupted; say so if you did.
6. Node/Bun standalone readiness check only if cheap and already scripted in the tree (`src/core/__benchmarks__/observation-identity.mjs` readiness mode); record the exact command and result or skip with a stated reason. No timing comparisons.

## Evidence namespace and seal

Write everything under `/Users/Vincent/Workspace/albatrion/schema-form-observation-identity-2/.seiri/tasks/observation-identity-reacquire/`: `environment.json` (versions, install receipt, lockfile hash before/after, HEAD and base), `targeted.json`, `gates.json`, `test-full-head.json` plus raw log, `test-full-base.json` plus raw log, `classification.md`, `report.md`, and `seal.json` listing every evidence file with bytes and SHA256. Do not write into main's `.seiri/tasks`, do not create or touch Seiri journals or session JSON, and do not run Seiri CHECK-bearing commands; this is evidence collection, not a Seiri task.

## Completion evidence and outcome

`worker_done --outcome succeeded` means every run above executed and the classification and seal exist, regardless of whether the tests pass. `--outcome failed` means a required run could not be executed or the checkout drifted. The summary must state: actual HEAD and base, install performed or not, the four head counts (targeted, typecheck/lint/build exits, full test totals), the base full test totals, the classification totals per category, the report and seal paths with the seal SHA256, and every unresolved limitation. Do not call PR424 passing, reviewed or mergeable. Check your live mailbox once before one genuine worker_done, then idle.
