# Mount merge author metadata repair — local preview only

Work only in /Users/Vincent/Workspace/albatrion, as a bounded coordinator metadata task. No product/source/test/document edits, checkout, reset, stash, history replacement, push, remote mutation or new agents. The approved implementation plan continues separately. This dispatch authorizes only a reviewable local commit-object preview and a new preview ref, never rewriting the live branch.

Orca rules: run-use 와 코디네이터 명령 금지, check 는 --terminal 로. Use live preamble IDs, standalone CLIs without pipes, semicolons, redirects or environment prefixes. No installs, fetcher or permission/configuration changes. Use native child-process argument arrays if metadata must be supplied through stdin or a process environment; never shell interpolation of commit text.

## 0. Defect and exact scope

The coordinator observed that merge ef6747ea074bb8ddd0413533e5ff352154743afb has an owner-style author name outside the allowed display forms, while subsequent e714a3b49 and9adffb74c have allowed author/committer names. Do not print, save, repeat or quote the disallowed name anywhere. Inspect existing commit metadata in memory and emit only allowed/redacted boolean classifications. Never include raw author headers in an artifact, error or tool output.

Confirm current HEAD and origin/feat/schema-form-08-review-and-perf are9adffb74c and the linear range after parent06fcd512e contains exactly ef6747ea0, e714a3b49,9adffb74c. Preserve the original commits and all refs. Create replacement commit objects with exactly the same tree and full message for each old commit, the same dates where practical, allowed author and committer names Vincent Kelvin, and the replacement parent chain rooted at the unchanged06fcd512e. Use a fresh local preview ref repair/schema-form-mount-author-preview only if absent; never overwrite an existing ref. Do not point the live branch at the preview.

## 1. Evidence and future integration

For each of the three old/new pairs, assert tree identity, full message identity, expected parent mapping, allowed author/committer forms and forbidden commit-line count zero. Assert the final aggregate source tree and working/index state are unchanged, the live local/origin ref remains the old HEAD, remote operations count zero, and all old commits remain reachable. Record exact old/new commit IDs and the current remote lease as a concrete proposed repair. No product gate or ledger audit is needed because this preview changes no working file.

Provide a guarded standalone force-with-lease command as a proposal only. Executing it requires the owner's explicit approval because it rewrites an already-pushed working branch. Identify that rewriting the branch does not erase old GitHub commit/PR objects or guarantee removal from caches; do not claim privacy erasure.

Also assess a future merge procedure that creates the final single squash commit locally with explicit allowed metadata, validates its tree/message, replaces only the unreviewed-by-owner PR branch with a lease after independent verification, and fast-forwards the base with a lease so the PR head becomes an ancestor. Do not execute it now or change the owner's account profile. The coordinator decides the final procedure after the exact mechanism is verified; a proposed procedure is not a completed PR merge.

## 2. Report and idle

Include complete derived evidence and old/new mapping directly in worker_done, no disallowed names and no raw commit headers. Keep the scratch report concise. Report any unexpected DAG/remote/metadata condition instead of widening scope. Send worker_done once with live IDs then idle. Do not push, force-push, amend live commits or delete old refs after completion.
