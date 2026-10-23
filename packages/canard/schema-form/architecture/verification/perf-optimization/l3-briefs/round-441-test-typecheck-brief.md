# Round 441 — fix the typecheck error introduced by the PR #433 closing amendment (test-only)

Work in the Orca worktree `/Users/Vincent/Workspace/albatrion/schema-form-test-typecheck` (branch `vincent-kk/schema-form-test-typecheck`, created from `feat/schema-form-08-review-and-perf` at `4847b1c1b`; first confirm `git rev-parse HEAD` is `4847b1c1b` and `git status --porcelain` is empty). Report in complete formal Korean sentences; owner names only Vincent or Vincent Kelvin.

Orca rules: run-use 와 코디네이터 명령 금지, check 는 --terminal 로. No delegation, spawning, terminal/worktree creation or removal, model substitution, no config/auth changes, no `git stash`, no `git add .`/`-A`, no merge, no `gh pr ready`, no `gh pr merge`, no benchmark. Fresh-worktree setup allowed once: `yarn --cwd /Users/Vincent/Workspace/albatrion/schema-form-test-typecheck install --immutable` and `yarn workspace @winglet/<name> build` for dependency workspaces as needed for typecheck. Excluded CLIs run as the only thing in a shell call. Commit: `git -c user.name="Vincent Kelvin" -c user.email="vincent-kk@users.noreply.github.com" commit -F <ns>/<msgfile>`; no co-author, session or ID lines. `<ns>` = `/Users/Vincent/Workspace/albatrion/schema-form-test-typecheck/.seiri/tasks/test-typecheck-441/` (create). Product code must not change.

## Why

`yarn workspace @canard/schema-form build` (which ends with `typecheck`) fails on the branch after the PR #433 closing amendment: `src/core/engine/settle/__tests__/settle.dirty-postorder.test.ts(28,5): error TS2531: Object is possibly 'null'` — the line `root.find('/toggle').setValue(true);`. The amendment's gates ran lint and the settle tests but not typecheck (coordinator omission).

## Steps

1. One commit: change line 28 to `root.find('/toggle')!.setValue(true);` (the sibling convention, see `settle.array-legacy-ports.test.ts:29`). Commit `test(schema-form): assert the toggle node exists in the gated dirty-index test`.
2. Gates as separate bare calls, recorded in `<ns>/gates/`: `yarn workspace @canard/schema-form typecheck` (exit 0 required), `yarn workspace @canard/schema-form lint`, `yarn workspace @canard/schema-form test --run src/core/engine/settle/__tests__/settle.dirty-postorder.test.ts`.
3. Push; `gh pr create --repo vincent-kk/albatrion --base feat/schema-form-08-review-and-perf --head vincent-kk/schema-form-test-typecheck --draft --title "test(schema-form): assert the toggle node exists in the gated dirty-index test" --body-file <ns>/pr-body.md` (body: the error, the one-line fix, the three gate results; no session or co-author lines); `<ns>/report.md` with the commit SHA and PR number; copy `<ns>` to `/Users/Vincent/Workspace/albatrion/.seiri/tasks/test-typecheck-441/`.

`worker_done --outcome succeeded` only when typecheck exits 0, the other gates pass, the PR exists and `git status --porcelain` is empty. Check the live mailbox once before one genuine worker_done, then idle.
