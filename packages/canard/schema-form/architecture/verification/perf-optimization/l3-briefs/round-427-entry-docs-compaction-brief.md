# Round 427 — entry document compaction (AGENT-HANDOFF, HANDOFF, PLAN)

Run in the MAIN worktree `/Users/Vincent/Workspace/albatrion` (HEAD must equal `origin/feat/schema-form-08-review-and-perf`; verify first). Documentation-only, mechanical task: apply the compaction exactly as specified, run the canonical checks, stage exact paths, write the commit message file. The coordinator commits and pushes. No product, test, build, timing, PR, merge or install work. Report in complete formal Korean sentences; owner names are only Vincent or Vincent Kelvin; never write any other form of the owner's name.

Orca rules: run-use 와 코디네이터 명령 금지, check 는 --terminal 로. No delegation, worker spawning, terminal/worktree creation, model substitution. CLIs stand alone; the HANDOFF section 4 node check commands run as written (their `| tail -1` / `| head -1` are part of the command). Never use bare git stash, `git add .`, `git add -A`, `git commit`, `git push`, config/auth changes or denied-operation bypass. Never stage `l3e-direct-ownership/` or `schema-form-observation-identity-2/`. Stop and ask on anything the spec does not cover; do not improvise wording.

All relative paths below are under `packages/canard/schema-form/architecture/` unless absolute. The authored replacement texts are in `/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/920681de-5507-4bac-b671-978d55a29c7a/scratchpad/compact427/` (files `AH-head.md`, `AH-s1-add.md`, `AH-s2.md`, `AH-s3.md`, `AH-s5.md`, `AH-s6.md`, `HO-s1-add.md`, `HO-s2.md`, `PL-s3intro.md`, `PL-row07.md`, `PL-rowopt.md`, `PL-s4.md`). Insert them byte-for-byte; do not edit their wording. If a file is missing, stop and ask.

## Why and what is immutable

The round-close tool is designed to keep only the three newest round bullets in HANDOFF section 1 and one record row in PLAN section 5, moving older ones to PLAN-LOG. Hand edits over many rounds left 134 round bullets and 95 rows in place, and AGENT-HANDOFF section 3 accumulated per-round history paragraphs. This round moves that history where it belongs and freezes the pre-compaction text in an archive. Nothing is deleted from the repository: every removed line survives verbatim either in `PLAN-LOG.md` or in `_archive/2026-10-20/`.

Immutable: every file under `ledger/` except what step 6's round-close and the owner-answers row touch, every file under `reviews/`, `ledger/checks/*.mjs`, owner quotes, and all `【추론】` lines. Ledger items whose canonical source is `HANDOFF.md` quote lines that also exist at the ledger base commit, so the verbatim check keeps passing; if any check fails after your edit, restore the exact removed line to its original position and report, never edit the ledger or the check scripts.

## Step 0 — archive the three documents as they are

Create `_archive/2026-10-20/` and copy the current `AGENT-HANDOFF.md`, `HANDOFF.md`, `PLAN.md` into it unchanged (same names). Add `_archive/2026-10-20/README.md` with two sentences: these are the entry documents as they were before the round 427 compaction; the live documents and `PLAN-LOG.md` carry everything still current.

## Step 1 — HANDOFF.md section 1 (lines 5–159 at the time of writing; locate by heading, not by number)

Section 1 is from the line starting `## 1. ` to the line before `## 2. `. Inside it:

1. Round bullets are lines matching `^- \*\*[0-9]+라운드\(` (134 of them, rounds 289–426). Keep only the three newest (currently 424, 425, 426) in place. Move every other round bullet, in their current order, to the END of `PLAN-LOG.md` section 2 (`## 2. 라운드별 요지`), after its last entry, as new lines verbatim. The two combined bullets `- **320·321라운드(...)` and `- **324·325라운드(...)` (lines 38 and 41 at time of writing) are round history too: move them with the others, keeping their relative order.
2. Keep every other line of section 1 untouched EXCEPT the design-stage status block: the lines from `- **설계의 정본은 단일 원장 `ledger/`다.**` through the last line before `## 2. ` (currently lines 144–158: ledger size counts, frozen old documents, round 18 sealed-decisions block with its sub-bullets, "기계 검사는 모두 문제 0이다", "의미 게이트"). Replace that whole block with the content of `HO-s1-add.md`. Keep the line `- **그 앞의 라운드 요지(19라운드부터)는 PLAN-LOG.md 2절에 있다.**` (currently line 143) exactly as is, directly after the three round bullets.
3. Do not touch the heading line 5 or the preamble above it.

## Step 2 — HANDOFF.md section 2

Replace everything between the heading `## 2. 다음 할 일 — 순서대로` and the line before `## 3. 일하는 법` with one blank line, the content of `HO-s2.md`, and one blank line. The removed items are preserved by Step 0.

## Step 3 — HANDOFF.md section 5 file map

Leave section 5 (`## 5. 파일 지도`) unchanged in this round. Add nothing.

## Step 4 — PLAN.md

1. Section 3 (`## 3. 진행 상황`): replace the paragraph starting `최적화 작업은 **소유자 결정60 대기**입니다.` (currently line 49) with `PL-s3intro.md`. Keep the 426 paragraph above it (line 47) unchanged. In the status table replace the `| 07 | 전환 | 리뷰 |` row with `PL-row07.md` and the `| 최적화 | 성능 최적화 |` row with `PL-rowopt.md`. No other row changes.
2. Section 4 (`## 4. 다음 할 일`): replace everything between the heading and the line before `## 5. 기록` with one blank line, `PL-s4.md`, and one blank line.
3. Section 5 (`## 5. 기록`): the table must keep only its header, separator and the FIRST data row (the 426 row). Of the other 94 rows, 26 are already byte-identical rows in `PLAN-LOG.md` section 1: drop those. The remaining 68 rows (rounds 287–375 as listed in the table) are absent from `PLAN-LOG.md` section 1: insert them into section 1 of `PLAN-LOG.md` in chronological order by their date and round number among the existing rows (the existing table is chronological; the 426 row is its last row before `## 2. `). Compute the set programmatically by exact string comparison, never by eye; report the counts (expected: 26 dropped, 68 moved, 1 kept).

## Step 5 — AGENT-HANDOFF.md

1. Replace lines 1–3 (title and preamble paragraph) with `AH-head.md`.
2. Section 1: keep all existing bullets; append the two bullets of `AH-s1-add.md` at the end of the section.
3. Replace section 2 (`## 2. 지금 상태 (2026-10-19)` through the line before `## 3. Orca 상태`) with `AH-s2.md` plus one trailing blank line.
4. Replace section 3 (`## 3. Orca 상태` through the line before `## 4. 라운드 닫기 절차`) with `AH-s3.md` plus one trailing blank line, where the placeholder line `@@KEEP_CAUTION_LINE@@` is replaced by the existing caution bullet that starts `- 주의: 워커가 \`run-use\` 나` (currently line 115), copied verbatim.
5. Replace section 5 (`## 5. 다음 할 일 (400C-04 순서; ...)` through the line before `## 6. 열린 소유자 물음`) with `AH-s5.md` plus one trailing blank line.
6. Replace section 6 (`## 6. 열린 소유자 물음` through the line before `## 7. `) with `AH-s6.md` plus one trailing blank line.
7. Sections 4, 7, 8, 9 stay unchanged.

## Step 6 — round 427 ledger documents and checks

Mirror round 426's documents for form (`reviews/round-426-closing.md`, `reviews/round-426-owner-answers.md`, `.seiri/tasks/round426-insert-plan.json`, `.seiri/tasks/round426-commit-message.txt`). Owner statements to record verbatim, in this order (2026-10-20, 원장 세션); write `\n` for line breaks inside quotes:

1. 확인: core 마운트 비효율 수정 확인 물음과 압축 시점 물음. 원문: "응 core 의 마운트 비효율은 수정을 해야하는 문제가 맞지.\n그냥 확인차 물어본거야.\n\n그럼 다음 작업은 내가 지시하면 시작하고,\n그전에 원장과 히스토리 중 지나치게 길어진 곳이나 불필요한 내용은 암축하거나 제거했으면 하는데.\n작업을 마무리하고 하는게 나을까?". 반영: 다음 성능 작업은 소유자 지시 뒤 시작하기로 했고, 진입 문서 셋은 지금 압축하되 원장 본문과 reviews 기록은 줄 번호 인용 6,825곳이 깨지므로 9단계 squash 직전에 보관하기로 권고했다.
2. 확인: 압축 진행 승인. 원문: "응 지금 진행해줘.". 반영: 427라운드에 진입 문서 셋을 압축한다. 옮긴 글은 PLAN-LOG.md와 _archive/2026-10-20/에 보존한다.
3. 확인: 워커 배정 지시. 원문: "이 작업에는 agy 나 cursor-agent 의 빠른 모델을 쓰도록 하던가 직접 하도록 해.\nagy 하위모델이나 cursor-agent 는 아무래도 큰 작업보단 짧거나 단발적인 작업을 시켜야 할거야.\ncursor-agent 도 사용량이 좀 남으니까 이걸 쓰는걸 고려해봐 orca cli를 써서 말이지". 반영: 이 압축은 Orca로 띄운 cursor 워커가 수행한다.
4. 확인: cursor 모델 지정. 원문: "어? 아 cursor 도 grok 4.7 정도는 써줘". 반영: cursor 워커 모델을 Grok 4.7 계열로 정했다.
5. 확인: cursor 모델 범위와 사용량 관리. 원문: "그리고 cursor 쓸때는 grok 4.7 을 쓰던가, 아니면 다른 프론티어모델(gemini4 / fable4.1 등. 적당한 모델 선출)을 써도 돼.\n사용량 초과하면 멈추도록만 하면 된다. 아무튼 목표는 사용량을 소진하는 것이니까. \n참고로 grok / composer-2.5 이랑 프론티어모델은 사용량이 따로 책정되니까 따로따로 관리해야해.". 반영: cursor는 Grok 4.7 또는 적당한 프론티어 모델을 쓰고, Grok·Composer와 프론티어 모델의 사용량을 따로 관리하며 한도에 걸리면 멈추고 보고한다. AGENT-HANDOFF 1절에 적었다.

Closing decisions for `reviews/round-427-closing.md` (target `ledger/process.md:PROCESS-060` unless a more exact current item exists; write the `【추론】` lines once):

- 427C-01 (진입 문서 압축의 범위와 보존): AGENT-HANDOFF·HANDOFF·PLAN의 라운드별 경위와 끝난 항목을 PLAN-LOG와 `_archive/2026-10-20/`으로 옮기고 현재 상태·운영 규칙·다음 할 일만 남긴다. 지우는 줄은 없으며 모든 줄은 두 곳 중 하나에 원문으로 남는다. 원장 본문과 reviews 기록은 줄 번호 인용이 깨지므로 9단계 squash 직전에 한 번 보관한다.
- 427C-02 (워커 배정과 사용량 관리): 큰 구현·측정은 codex gpt-6.1-sol high, 짧거나 단발적인 작업은 agy 하위 모델이나 Orca로 띄운 cursor(Grok 4.7 또는 적당한 프론티어 모델)에 맡기며, Grok·Composer와 프론티어 모델의 사용량을 따로 관리하고 한도에 걸린 워커는 멈추고 보고한다. 다음 성능 작업은 소유자 지시 뒤 시작한다.

Write `reviews/round-427-owner-answers.md` (five rows), `reviews/round-427-closing.md` (ending `다음 라운드 번호는 428이다.`), append five `ledger/checks/owner-answers.tsv` rows and five `ledger/landing.md` supplement lines in the round 426 form, write `/Users/Vincent/Workspace/albatrion/.seiri/tasks/round427-insert-plan.json`, run `node ledger/checks/sup-insert.mjs reviews/round-427-closing.md /Users/Vincent/Workspace/albatrion/.seiri/tasks/round427-insert-plan.json` from `architecture/`, then run `node ledger/checks/round-close.mjs 427 "<PLAN §5 row>" "<HANDOFF §1 bullet ending with ' 다음 라운드 번호는 428.'>" "<HANDOFF §5 map row>"`. The round-close tool will move the oldest of the three remaining bullets (424) to PLAN-LOG section 2 and replace the PLAN §5 row; that is intended. Then hand-update `HANDOFF.md` line 5 (the section 1 heading) to say 427라운드 닫힘 with the compaction and the waiting state.

Then run every HANDOFF section 4 check from `architecture/`; all must report 0 problems, doc-coverage only the known LANDING-209/210. Compare counts with round 426 (owner 554→559 expected; explain supplements and tokens). The `tokens.mjs inventory` command reads `HANDOFF.md`; a changed token count must be explained by the moved lines and nothing else.

## Step 7 — stage and report

Stage only by exact path: `AGENT-HANDOFF.md`, `HANDOFF.md`, `PLAN.md`, `PLAN-LOG.md`, `_archive/2026-10-20/` (four files), `reviews/round-427-*.md`, the ledger files sup-insert and the owner rows touched, `ledger/checks/owner-answers.tsv`, and this brief. Confirm with `git status --porcelain` that nothing else is staged and that the two child directories stay untracked. Write `/Users/Vincent/Workspace/albatrion/.seiri/tasks/round427-commit-message.txt` (subject `docs(schema-form): compact entry documents and record worker assignment for round 427`; Korean body; no co-author, session or ID lines) and `/Users/Vincent/Workspace/albatrion/.seiri/tasks/ledger427/report.md` with: byte size of the three documents before and after, the moved/dropped/kept counts of Step 1 and Step 4, each check's result line, counts versus 426, and the staged path list.

`worker_done --outcome succeeded` only when every check reports 0 problems and staging is exact; otherwise `failed` with the exact failing command, cwd, exit and output. If your provider reports a usage limit, stop immediately, leave the working tree as it is, and send `worker_done --outcome failed` naming the step reached. Check the live mailbox once before one genuine worker_done, then idle.
