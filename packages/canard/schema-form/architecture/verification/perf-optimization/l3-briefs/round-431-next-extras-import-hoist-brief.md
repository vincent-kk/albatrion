# Round 431 — hoist the `hasOwnProperty` import in `nextExtras.ts` (Draft PR #425 follow-up)

Work in the worktree `/Users/Vincent/Workspace/albatrion/schema-form-next-extras` (branch `vincent-kk/schema-form-next-extras`, HEAD `1613fb919`). First confirm `git status --porcelain` is empty and HEAD matches. One mechanical change only. Report in complete formal Korean sentences; owner names only Vincent or Vincent Kelvin.

Orca rules: run-use 와 코디네이터 명령 금지, check 는 --terminal 로. No delegation, spawning, terminal/worktree creation or removal, model substitution, no install, no `git stash`, no `git add .`/`-A`, no push, no PR changes. Excluded CLIs (`yarn`, `gh`, `orca`) run as the only thing in a shell call: no pipes, `;`, redirects, env prefixes or heredocs. If your provider reports a usage limit, stop and send `worker_done --outcome failed` naming the step reached.

## Change

`packages/canard/schema-form/src/core/engine/settle/utils/input/nextExtras.ts` ends with `import { hasOwnProperty } from '@winglet/common-utils/lib';` on its last line (added by commit 179a2d76f). Move that import statement to the top of the file, next to the other imports, following the import order the file already uses (external package imports before relative ones; match the neighbouring files in the same directory). Change nothing else: no reformatting of other lines, no logic change, no comment.

## Gates (each as its own shell call; save outputs under `/Users/Vincent/Workspace/albatrion/schema-form-next-extras/.seiri/tasks/next-extras-431/hoist/`)

1. `yarn workspace @canard/schema-form typecheck`
2. `yarn workspace @canard/schema-form lint`
3. `yarn workspace @canard/schema-form test --run --reporter=dot --outputFile=/Users/Vincent/Workspace/albatrion/schema-form-next-extras/.seiri/tasks/next-extras-431/hoist/test.json --reporter=json` (all five projects; a Storybook failure counts only if it remains after a solo warm-cache re-run, 425C-02)
4. `yarn workspace @canard/schema-form build`

## Commit

`git add packages/canard/schema-form/src/core/engine/settle/utils/input/nextExtras.ts` then `git -c user.name="Vincent Kelvin" -c user.email="vincent-kk@users.noreply.github.com" commit -F /Users/Vincent/Workspace/albatrion/schema-form-next-extras/.seiri/tasks/next-extras-431/hoist/commit.txt` with subject `style(schema-form): hoist hasOwnProperty import in nextExtras` and a one-line Korean body. No co-author, session or ID lines. Do not push.

Write `/Users/Vincent/Workspace/albatrion/schema-form-next-extras/.seiri/tasks/next-extras-431/hoist/report.md` with the diff, the four gate result lines and the commit hash. `worker_done --outcome succeeded` only when all four gates passed and `git status --porcelain` is empty afterwards; otherwise `failed` with the failing command and output. Check the live mailbox once before one genuine worker_done, then idle.
