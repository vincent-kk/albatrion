# Completed task branches cleanup brief

Vincent explicitly instructed: 사용완료된 브랜치들은 정리하도록 하세요. Work in /Users/Vincent/Workspace/albatrion. This authorizes branch-ref cleanup for completed schema-form review/performance tasks and the now-published author repair preview, not deleting Orca worktrees, active resources or unrelated repository work.

Orca rules: run-use 와 코디네이터 명령 금지, check 는 --terminal 로. Use live preamble IDs. Standalone CLIs, no pipes, semicolons, redirects, environment prefixes, installs, configuration/credential changes or other agents. Never output or save disallowed owner names or raw commit author headers. Allowed owner names are Vincent and Vincent Kelvin.

## 0. Exact current state

The approved author repair is published: main HEAD and origin/feat/schema-form-08-review-and-perf are994dd3a68929dcd8985f76cfceb925ff702216a5. It maps old ef6747ea0→20b07ee2e, e714a3b49→6c2ea848f,9adffb74c→994dd3a68 with unchanged trees/messages. PR #422 remains historically merged at its old GitHub commit address. Owner415 records that mapping. The preview branch repair/schema-form-mount-author-preview has served its purpose and can be deleted after confirming it equals current main. Do not amend, rewrite or move main or implementation branches.

## 1. Inventory and proof

Inventory local branches, configured upstream/remote heads, worktree checkouts and relevant Orca activity. Preserve current main, perf/schema-form-itemless-declarations, master/main, release/integration branches including1.0.0-beta, any branch checked out in a worktree, every open/draft/owner-reviewing PR branch and any ref with unclassified or incomplete work. Do not treat a gone upstream or old age alone as proof. Do not delete unrelated branches merely because Git reports them merged.

For completed schema-form task branches, verify the exact local/remote head against an actually MERGED PR and its repository/base, or native ancestry into retained current main. Squash PRs need the actual merged-PR record and exact head match; do not claim git --merged proves them. A head that advanced after merge is unclassified. Record old SHA and proof before deletion. Avoid losing commits not represented by the task's verified completion. If source/tree ambiguity remains, report and preserve it.

## 2. Bounded cleanup

Delete only proved completed local refs that are not checked out. A normal -d may refuse a verified squash-merged branch; a force branch deletion is allowed only for that already-proved exact ref and recorded SHA. Use remote deletion only when that exact remote branch still exists, its head is still the proved merged head, and no open PR/worktree/active worker owns it. Guard remote deletion with an exact lease so an advanced head fails closed. Do not mass-delete by pattern. Do not prune or recreate active refs. No worktree, terminal, folder, evidence or Git-object deletion.

Preserve owner415 uncommitted ledger/brief changes and the nested work folder. No product gates or builds. Do not install a deletion helper or change Git configuration. If an operation is denied, report exact purpose/cwd/command/error without retrying via another path.

## 3. Report and idle

Report concise complete formal Korean sentences directly in worker_done: every deleted local/remote branch and prior SHA, exact completion proof, every preserved in-scope ref and reason, worktree/current main/active itemless identity, unchanged work/index and no evidence/worktree deletion. Existing unrelated refs can be counted rather than inventoried. Save a concise scratch recovery mapping. Do not write tracked files or commits. Send worker_done once then idle.
