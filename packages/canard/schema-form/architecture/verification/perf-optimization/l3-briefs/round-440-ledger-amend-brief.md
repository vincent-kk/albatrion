# Round 440 — amend the staged ledger close with the owner's two later messages (rows 7–8)

Run in the MAIN worktree `/Users/Vincent/Workspace/albatrion` (HEAD `0645705c1`; the round-440 close is already applied and STAGED by the previous worker per `l3-briefs/round-440-ledger-brief.md`; do not undo anything). Documentation only; the coordinator commits and pushes. Never stage `schema-form-env-hoist/` or `schema-form-dev-flag/`. Report in complete formal Korean sentences; owner names only Vincent or Vincent Kelvin. Orca rules: run-use 와 코디네이터 명령 금지, check 는 --terminal 로. No delegation, spawning, terminal/worktree creation or removal, model substitution; never `git stash`, `git add .`, `git add -A`, `git commit`, `git push`. If your provider reports a usage limit, stop and send `worker_done --outcome failed` naming the step reached.

Paths are under `packages/canard/schema-form/architecture/`.

## What to add

The owner sent two more messages on 2026-10-21 after the six recorded ones (raw copy: the last two blocks of `/Users/Vincent/Workspace/albatrion/.seiri/tasks/round440-owner-answers.txt`; keep every character, inner line breaks as `\n`, trailing spaces kept):

```
지금 보여주는 표는 전부 마운트 비용인거야? 아니면 동작비용을 포함한거야? oneOf 등 분기가 있을때 입력비용이 이렇게 크면 좀 난처한데.
앞선 단계에서 동작 최적화를 해서 꽤 줄여둔거같은데 말이야.
```

```
다음부터는 마운트 / 입력 을 별도 표로 구분하고, 단일 입력(input 에 단일 입력)과 setValue 로 일괄 입력하는 것을 구분해서 하도록 해. 
현재 스팩 상태를 명확히 인지하지 못하겠군.
```

1. Append rows 7 and 8 to `reviews/round-440-owner-answers.md` (same columns):
   - 7. 표의 범위(마운트인가 동작 포함인가) — 물음: 보여준 표가 마운트 비용만인지 동작(입력) 비용을 포함하는지, 분기 폼의 입력 비용 우려. 반영: 표는 모두 마운트만이다(청사진·트리·첫 정착). 입력 비용은 M3(434라운드)의 core-update(oneOf-20 0.19→1.70 ms, +792 %)와 결정 58(#427; oneOf-80 갱신 1.45→1.02 ms, −29.65 %)에서 쟀고 셋째 창의 oneOf-80 core-update는 1.00 ms로 동치다. 남은 원인은 oneOf 갱신이 바뀐 분기 하나가 아니라 N개 분기의 게이트를 전부 재평가하는 구조(437 진단, GOAL-011 증명 미충족)이며 결정 61 구현 뒤 다음 가설로 올린다. React 렌더에서는 oneOf-5 갱신 벽시계 +42 %, 프로파일러 갱신 −21 %(M3).
   - 8. 보고표 규칙 보강(마운트/입력 분리, 단일 입력과 setValue 일괄 구분) — 물음: 지시. 반영: 다음 보고부터 표를 셋으로 나눈다: 마운트, 단일 입력(한 필드에 한 번 입력), setValue 일괄 입력(핸들·루트 setValue로 값 전체 교체). 지금 측정 하네스의 core-update는 oneOf는 두 쓰기의 합, flat·nested는 열 쓰기의 합이라 단일 입력과 일괄을 구분하지 않으므로 다음 측정 창부터 두 장면을 따로 둔다(440C-04).
2. Add the two tsv rows to `ledger/checks/owner-answers.tsv` and the two `> 소유자(440라운드, <확인>): "<답 원문>" (`reviews/round-440-owner-answers.md:<line>`)` lines to `ledger/landing.md` directly after the sixth round-440 line, same form as the existing six.
3. In `reviews/round-440-closing.md`, append to the end of the 440C-04 body (before its final line break) the sentence: `소유자가 이어서 표의 범위를 물어 "지금 보여주는 표는 전부 마운트 비용인거야?"(위 7행) 마운트만임을 확인했고, "다음부터는 마운트 / 입력 을 별도 표로 구분하고, 단일 입력(input 에 단일 입력)과 setValue 로 일괄 입력하는 것을 구분해서 하도록 해."(위 8행)라고 지시했으므로 다음 보고부터 표는 마운트·단일 입력·setValue 일괄 입력 셋이고 측정 하네스도 두 입력 장면을 분리한다.` Then re-run `node ledger/checks/sup-insert.mjs reviews/round-440-closing.md /Users/Vincent/Workspace/albatrion/.seiri/tasks/round440-insert-plan.json` only if that tool is idempotent for an already-inserted plan (check its usage text first); if it is not, instead edit the 440C-04 supplement text that sup-insert already placed under `ledger/process.md:PROCESS-060` and `ledger/test.md:TEST-027` to match the amended closing body exactly, and say which you did.
4. Run every check in `HANDOFF.md` section 4 from `architecture/`. All must report 0 problems; doc-coverage may show only LANDING-209/210. Expected owner answers 587 cited 587.
5. Re-stage by exact path only the files you changed (`reviews/round-440-owner-answers.md`, `reviews/round-440-closing.md`, `ledger/checks/owner-answers.tsv`, `ledger/landing.md`, `ledger/process.md`, `ledger/test.md` as applicable, and this brief `verification/perf-optimization/l3-briefs/round-440-ledger-amend-brief.md`). Confirm with `git status --porcelain` that the previously staged set is intact and nothing else is staged. Append the result lines to `/Users/Vincent/Workspace/albatrion/.seiri/tasks/ledger440/report.md`.

`worker_done --outcome succeeded` only when every check reports 0 problems and staging is exact; otherwise `failed` with the failing command, cwd, exit and output. Check the live mailbox once before one genuine worker_done, then idle.
