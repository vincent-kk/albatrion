# Round 441 — closing amendment of Draft PR #433: a test that detects mutation M2 (gated writes keep the general dirty index)

Work in the Orca worktree `/Users/Vincent/Workspace/albatrion/schema-form-dirty-postorder` (branch `vincent-kk/schema-form-dirty-postorder`, PR #433; first confirm `git status --porcelain` is empty and `git rev-parse HEAD` is `110502bc6`). Report in complete formal Korean sentences; owner names only Vincent or Vincent Kelvin.

Orca rules: run-use 와 코디네이터 명령 금지, check 는 --terminal 로. No delegation, spawning, terminal/worktree creation or removal, model substitution, no install, no config/auth changes, no `git stash`, no `git add .`/`-A`, no merge, no `gh pr ready`, no `gh pr merge`, no benchmark or measurement. Excluded CLIs run as the only thing in a shell call. Commits: `git -c user.name="Vincent Kelvin" -c user.email="vincent-kk@users.noreply.github.com" commit -F <ns>/<msgfile>`; no co-author, session or ID lines. `<ns>` = `/Users/Vincent/Workspace/albatrion/schema-form-dirty-postorder/.seiri/tasks/dirty-postorder-441/amend/` (create). Product code must not change; if a step seems to need it, stop and send a `question`.

## Why

The verifier (Claude Opus) passed PR #433 and recommended one cheap test: mutation M2 (switching to the post-order index unconditionally, even when `context.hasGates`) is not caught by the existing 1,291 settle tests, and the `!context.hasGates` condition must stay because `DETAIL.md:130` contracts the general index for gated computation and an index-level order difference exists (a stale path under a consumed child).

## Steps

1. Test commit: in `src/core/engine/settle/__tests__/settle.dirty-postorder.test.ts`, first `describe`, add `it('keeps the general index during a gated write', …)`: schema `{ type: 'object', properties: { toggle: { type: 'boolean', default: false }, head: { type: 'string', default: 'h', controls: { active: '../toggle === true' } } } }`; mount; `const begin = vi.spyOn(DirtyPathSet.prototype, 'beginPostOrder')`; `root.find('/toggle').setValue(true)`; assert `begin` was not called and `root.value` equals `{ toggle: true, head: 'h' }`. Verify: passes on HEAD; fails under M2 (temporarily drop the `!context.hasGates` condition in `writeFieldNode.ts`, run the file, restore — record both runs in `<ns>/mutation-m2.md`). Also add to the results document `dirty-postorder-results.md` one sentence that M2 is now detected by this test (remove the "open coverage item" wording). Commit `test(schema-form): keep the general dirty index during gated writes`.
2. Gates: `yarn workspace @canard/schema-form lint` and the settle test directory run (`yarn workspace @canard/schema-form test --run src/core/engine/settle`), as separate bare calls; record in `<ns>/gates/`.
3. Push; `gh pr edit 433 --body-file <ns>/pr-body.md` (previous body plus a line about the M2 test); copy `<ns>` to `/Users/Vincent/Workspace/albatrion/.seiri/tasks/dirty-postorder-441/amend/`; `<ns>/report.md` with the commit SHA.

`worker_done --outcome succeeded` only when the commit exists, both gates passed, M2 failed as expected, the PR body is updated and `git status --porcelain` is empty. Check the live mailbox once before one genuine worker_done, then idle.
