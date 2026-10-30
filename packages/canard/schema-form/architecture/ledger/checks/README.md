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

2026-10-29(463라운드 B9-0·B12·B9-1 병합과 설계 Ⅳ 채택 뒤)의 결과다.

| 검사 | 기준값 |
| --- | --- |
| verbatim-check | 항목 1,415, 조각 327, 원문과 다른 결정 줄 0 |
| sup-check | 보충·충돌 인용 3,510, 인용 줄에 없는 것 0, 해석 못 한 것 0 |
| ref-check | 항목 1,415, 문제 0 |
| owner-cited | 소유자 답 680, 인용 680, 미인용 0 |
| sentence-check | 영역 열일곱 모두 missing 0, bad classifications 0 |
| tokens | 목록 2,383, 잔여 399(목록의 다섯은 462라운드에 고친 `README.md` 지금 상태 문단에서 왔고 인용되었다; 목록의 일곱은 461라운드에 고친 `README.md` 지금 상태 문단에서 왔고 인용되었다; 목록의 셋은 460라운드에 고친 `README.md` 지금 상태 문단에서 왔고 인용되었다; 목록의 둘은 459라운드에 고친 `README.md` 지금 상태 문단에서 왔고 인용되었다; 목록의 둘은 458라운드에 고친 `README.md` 지금 상태 문단에서 왔고 인용되었으며 잔여 하나는 458라운드 항목이 인용해 줄었다; 목록의 일곱은 453라운드에 고친 `README.md` 지금 상태 문단에서, 셋은 446라운드에 고친 `README.md` 지금 상태 문단에서 왔고 새 잔여는 0이다; 판정은 token-review.md 의 445라운드 절) |
| plan-links | 문제 0(계획 문서 76) |
| doc-coverage | 미인용 66(463라운드 항목 넷 — TEST-101·VALUE-043·SETTLE-054·PROCESS-081; 462라운드 항목 셋 — NODE-066·VALUE-042·PROCESS-080; 461라운드 항목 셋 — VALUE-041·TEST-100·PROCESS-079; 460라운드 항목 셋 — VALUE-040·TEST-099·PROCESS-078; 459라운드 항목 셋 — TEST-098·NODE-065·PROCESS-077; 458라운드 항목 셋 — TEST-097·NODE-064·VALUE-039; 457라운드 항목 셋 — TEST-096·NODE-063·PROCESS-076; 456라운드 항목 둘 — TEST-095·BLUEPRINT-057; 455라운드 항목 둘 — TEST-094·VALUE-038; 454라운드 항목 둘 — TEST-093·BLUEPRINT-056; 453라운드 항목 다섯 — LANDING-212·SETTLE-053·BLUEPRINT-055·TEST-092·PROCESS-075; 452라운드 항목 셋 — TEST-090·TEST-091·BLUEPRINT-054; 451라운드 항목 셋 — PROCESS-073·TEST-089·PROCESS-074; LANDING-209·210, 446라운드 항목 일곱 — LANDING-211·NODE-060·BLUEPRINT-052·053·SURFACE-063·TEST-080·PROCESS-069, 447라운드 항목 여섯 — TEST-081·082·083·SURFACE-064·EVENT-074·NODE-061, 448라운드 항목 일곱 — SETTLE-051·052·TEST-084·085·086·PROCESS-070·SURFACE-065, 449라운드 항목 셋 — TEST-087·PROCESS-071·NODE-062, 450라운드 항목 둘 — TEST-088·PROCESS-072; 설계문서·ADR 반영은 설계 최적화 단계의 루트 PR이 한다), 그 밖의 문제 0 |

수가 바뀌면 토큰·문장·인용별 원인을 대조하고, 까닭을 설명할 수 없는 증가를 통과로 보지 않는다.

## 3. 라운드 기록 절차

1. 소유자의 새 발언은 `reviews/round-NN-owner-answers.md` 표(확인 · 물음 요지 · 답 원문 · 반영)에 원문 그대로 적는다. 원문의 줄바꿈은 표 안에서 `\n` 으로 보존한다. 원장이 그 발언을 근거로 삼으면 `ledger/checks/owner-answers.tsv` 에 행(`reviews/round-NN-owner-answers.md:L<TAB>NN<TAB>라벨<TAB>"원문" (날짜, 원장 세션)`)을 더하고, `ledger/landing.md` 의 직전 소유자 줄 뒤에 `  > 소유자(NN라운드, 라벨): "원문" (\`reviews/round-NN-owner-answers.md:L\`)` 를 더한다.
2. 편집자 결정은 `reviews/round-NN-closing.md` 에 쓴다(1행 제목, 3행 머리 문단, 5행 `## 편집자 결정`, 결정마다 `- **NNC-kk (...)**` 와 `  - 【추론】 ...` 줄, `## 근거와 남은 것`, 끝에 `다음 라운드 번호는 NN+1이다.`).
3. 원장에 보충할 결정은 `node ledger/checks/sup-insert.mjs reviews/round-NN-closing.md <plan.json>` 으로 넣는다. plan 은 `[{"code":"NNC-01","line":8,"targets":["ledger/goal.md:GOAL-011"]}]` 꼴이다. 삽입 뒤에는 닫기 문서의 그 줄을 고치지 않으며, 같은 문서에 줄을 더할 때는 인용된 줄보다 뒤에만 더한다.
4. 단계가 끝나거나 상태가 바뀌면 `reviews/README.md` 의 단계별 경과와 마감 상태, 그리고 `README.md` 의 지금 상태 한 문단을 고친다. 진행 일지나 인계 문서는 따로 두지 않는다(445라운드 소유자 지시).
5. 1절의 검사를 모두 돌려 2절의 기준값과 대조한 뒤, 바뀐 파일을 경로로 지정해 커밋한다. 커밋 메시지에는 공동 저자나 세션 줄을 넣지 않는다.

## 464라운드 마감 검사 보충(2026-10-30)

기존 기준표는 그대로 두고 분기 전환 단계 마감의 새 결과를 더합니다. React S/E 각 두 통과가 모두 끝난 뒤 위 검사 명령을 실행했습니다. 기존 라운드 기록은 원상 복구했으며 결과·계획·원장의 자료 주소 보충도 검사에서 거부되지 않았습니다.

| 검사 | 마감 결과·변화 이유 |
| --- | --- |
| verbatim-check | 항목 1,415·조각327·다른 결정 줄0, 기존과 같음 |
| sup-check | 보충·충돌3,563·불일치0·해석 못 함0; 소유자32행·편집자 결정20보충·README 상태 인용1을 더해 +53 |
| ref-check | 항목1,415·문제0 |
| owner-cited | 소유자 답712·인용712·미인용0; 원문32행 추가 |
| sentence-check | 17영역 모두 missing0·bad classifications0 |
| tokens | 목록2,387·잔여399; README 새 상태 문단의 제품SHA·08가지·7.374배·1.4% 네 토큰을 더했으며 모두 원장이 인용함. 첫 실행의 새 잔여7.374배 하나는 README의 수치 문장을 그대로 보충 인용해 해소했고 기존 잔여399는 건드리지 않음 |
| plan-links | 계획 문서77·문제0; 76→77은 마감 작업 전 머리0f11c2fe2에 이미 있던 미시 위생 계획서를 포함한 수이며 이 마감이 추가한 계획 파일은0 |
| doc-coverage | 미인용66·그 밖의 문제0, 기존 기준과 같음 |

분할한 원장 항목이 없어 expand-split-pointers는 해당하지 않습니다. 전체 출력과 마감의 첫 토큰 잔여·교정 근거는 [마감 결과](../../verification/branch-switch/closing-results.md)에 연결합니다. 제품 코드·시험을 바꾸지 않아 제품 전체 시험과 FCA 재실행을 이 문서 작업의 통과 증거로 주장하지 않습니다.


## 465라운드 입력 응답성 마감 검사 보충(2026-10-31)

기존 기준표·기존 오류는 보존하고 마감 전후 결과를 덧붙입니다. 전체 명령을 architecture에서 실행했으며 원장 분할이 없어 expand-split-pointers는 해당하지 않습니다.

| 검사 | 마감 결과와 기존 기준 대비 변화 |
| --- | --- |
| verbatim-check | 항목1415·조각327·불일치0, 같음 |
| sup-check | 보충·충돌3582·불일치0·해석실패0; baseline3563에서 소유자8행·결정11보충 추가 |
| ref-check | 항목1415·문제0 |
| owner-cited | 답720·인용720·미인용0; baseline712에 원문8개 추가 |
| sentence-check | 17영역 모두 missing0·bad classifications0 |
| tokens | 목록2387·잔여398; baseline399에서 L+소수값 표기가 옛 L0 토큰과 어휘상 겹친1건 감소. 옛 항목의 의미적 커버리지 해소는 아님 |
| plan-links | 계획80·문제1, 편집 전과 같은 design의 이미 분할된 ERROR-038 인용. 기존 줄은 고치지 않음 |
| doc-coverage | 미인용66·그 밖 문제0, 기존과 같음 |

[종합 마감 결과](../../verification/input-responsiveness/closing-results.md), [검사 요약](../../verification/input-responsiveness/raw/closing/ledger-checks.json), [전체 출력](../../verification/input-responsiveness/raw/closing/ledger-logs.json.gz)에 baseline과 최종을 함께 보존합니다. 새 추가분의 인용·소유자 원문·분류·계획 문제 증가는0입니다. benchmark 재현 도구의 승인된 수리는 별도34시험·lint·browser typecheck와 기본 재현6명령·명시적 추가줄 경로감사로 확인하며 schema-form 제품 차분은0입니다.
