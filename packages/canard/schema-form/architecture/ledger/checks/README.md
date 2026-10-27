# 원장 검사와 라운드 기록 절차

원장(`../`)을 고친 뒤 돌리는 기계 검사와, 소유자의 새 발언이나 편집자 결정을 기록으로 남기는 절차다. 모두 `architecture/` 디렉토리에서 실행하며, 통과 기준은 아래 기준값과 같은 결과다.

## 1. 검사 명령

```
node ledger/checks/expand-split-pointers.mjs ledger/checks/sentence-classified.tsv -- ledger/*.md   # 분할한 항목이 있으면 먼저
node ledger/checks/verbatim-check.mjs . ledger/*.md
node ledger/checks/sup-check.mjs . ledger/*.md
node ledger/checks/ref-check.mjs ledger/*.md
node ledger/checks/owner-cited.mjs ledger/checks/owner-answers.tsv ledger/*.md
node ledger/checks/bundle.mjs . ledger/checks/section-map.tsv $TMPDIR/bundles
for d in GOAL SCHEMA CONTROLS BLUEPRINT FRAGMENT VALUE WRITE SETTLE EVENT VALIDATE ERROR NODE REACT SURFACE LANDING TEST PROCESS; do
  node ledger/checks/sentence-check.mjs $TMPDIR/bundles/bundle-$d.md ledger/checks/sentence-classified.tsv ledger/*.md | tail -1; done
node ledger/checks/tokens.mjs inventory $TMPDIR/inv.json _archive/2026-09-29/0*.md _archive/2026-09-29/open-questions.md _archive/2026-09-29/adr/*.md README.md
node ledger/checks/tokens.mjs check $TMPDIR/inv.json ledger/*.md | head -1   # 잔여의 판정은 token-review.md
node ledger/checks/plan-links.mjs plan/README.md plan/*/*.md -- ledger/*.md
node ledger/checks/doc-coverage.mjs design/*.md adr/*.md -- ledger/*.md
```

- 원장이 인용하는 `path:line` 은 기준 커밋 `ba398c330` 의 줄 번호다. 지금 작업 트리에 없거나 줄이 바뀐 문서(옛 `HANDOFF.md` 등)는 `sup-check` 가 그 커밋에서 읽는다(`lib.mjs` 의 `baseReader`).
- `verbatim-check` 는 인용한 줄이 출처 파일 어딘가에 있는지만 본다. 줄 범위가 틀리거나 줄이 빠지거나 순서가 바뀐 것은 잡지 못한다.
- `bundle-*.md` 는 `section-map.tsv` 에서 언제든 다시 만든다. 문장 검사는 인용을 먼저 보고 분류 행을 보므로, 인용된 문장에 남은 낡은 분류 행은 무해하다.

## 2. 기준값

2026-10-27(450라운드 병합 뒤)의 결과다.

| 검사 | 기준값 |
| --- | --- |
| verbatim-check | 항목 1,376, 조각 327, 원문과 다른 결정 줄 0 |
| sup-check | 보충·충돌 인용 3,209, 인용 줄에 없는 것 0, 해석 못 한 것 0 |
| ref-check | 항목 1,376, 문제 0 |
| owner-cited | 소유자 답 621, 인용 621, 미인용 0 |
| sentence-check | 영역 열일곱 모두 missing 0, bad classifications 0 |
| tokens | 목록 2,357, 잔여 400(목록의 셋은 446라운드에 고친 `README.md` 지금 상태 문단에서 왔고 새 잔여는 0이다; 판정은 token-review.md 의 445라운드 절) |
| plan-links | 문제 0 |
| doc-coverage | 미인용 27(LANDING-209·210, 446라운드 항목 일곱 — LANDING-211·NODE-060·BLUEPRINT-052·053·SURFACE-063·TEST-080·PROCESS-069, 447라운드 항목 여섯 — TEST-081·082·083·SURFACE-064·EVENT-074·NODE-061, 448라운드 항목 일곱 — SETTLE-051·052·TEST-084·085·086·PROCESS-070·SURFACE-065, 449라운드 항목 셋 — TEST-087·PROCESS-071·NODE-062, 450라운드 항목 둘 — TEST-088·PROCESS-072; 설계문서·ADR 반영은 설계 최적화 단계의 루트 PR이 한다), 그 밖의 문제 0 |

수가 바뀌면 토큰·문장·인용별 원인을 대조하고, 까닭을 설명할 수 없는 증가를 통과로 보지 않는다.

## 3. 라운드 기록 절차

1. 소유자의 새 발언은 `reviews/round-NN-owner-answers.md` 표(확인 · 물음 요지 · 답 원문 · 반영)에 원문 그대로 적는다. 원문의 줄바꿈은 표 안에서 `\n` 으로 보존한다. 원장이 그 발언을 근거로 삼으면 `ledger/checks/owner-answers.tsv` 에 행(`reviews/round-NN-owner-answers.md:L<TAB>NN<TAB>라벨<TAB>"원문" (날짜, 원장 세션)`)을 더하고, `ledger/landing.md` 의 직전 소유자 줄 뒤에 `  > 소유자(NN라운드, 라벨): "원문" (\`reviews/round-NN-owner-answers.md:L\`)` 를 더한다.
2. 편집자 결정은 `reviews/round-NN-closing.md` 에 쓴다(1행 제목, 3행 머리 문단, 5행 `## 편집자 결정`, 결정마다 `- **NNC-kk (...)**` 와 `  - 【추론】 ...` 줄, `## 근거와 남은 것`, 끝에 `다음 라운드 번호는 NN+1이다.`).
3. 원장에 보충할 결정은 `node ledger/checks/sup-insert.mjs reviews/round-NN-closing.md <plan.json>` 으로 넣는다. plan 은 `[{"code":"NNC-01","line":8,"targets":["ledger/goal.md:GOAL-011"]}]` 꼴이다. 삽입 뒤에는 닫기 문서의 그 줄을 고치지 않으며, 같은 문서에 줄을 더할 때는 인용된 줄보다 뒤에만 더한다.
4. 단계가 끝나거나 상태가 바뀌면 `reviews/README.md` 의 단계별 경과와 마감 상태, 그리고 `README.md` 의 지금 상태 한 문단을 고친다. 진행 일지나 인계 문서는 따로 두지 않는다(445라운드 소유자 지시).
5. 1절의 검사를 모두 돌려 2절의 기준값과 대조한 뒤, 바뀐 파일을 경로로 지정해 커밋한다. 커밋 메시지에는 공동 저자나 세션 줄을 넣지 않는다.
