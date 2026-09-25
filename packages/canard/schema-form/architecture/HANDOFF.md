# HANDOFF — `@canard/schema-form` 재설계

다음 세션이 바로 이어서 일하기 위한 문서다. 이력은 `git log`와 `reviews/`에 있으므로 여기에는 지금 상태, 다음 할 일, 일하는 법만 적는다. 소유자는 Vincent다.

## 1. 지금 어디인가 (2026-09-26, 커밋 `50a393266`)

- **설계의 정본은 단일 원장 `ledger/`다.** 영역 17개, 항목 1,084개(현행 823, 대체됨 110, 열림 99, 분할됨 26, 중복 24). 형식과 규칙은 `ledger/README.md`.
- **옛 설계 문서(`00`–`09`, `adr/`, `open-questions.md`)는 동결됐다.** 더 고치지 않는다. 어긋남은 원장의 충돌 칸에 적는다. 원장이 인용하는 `path:line`은 모두 커밋 `ba398c330` 기준 줄 번호다(그 뒤 옛 문서는 바뀌지 않았으므로 지금도 같다).
- **18라운드가 원장 위에서 열려 있다.** 안건은 `reviews/round-18-agenda.md`, 소유자 답은 `reviews/round-18-owner-answers.md`(원문 그대로, 행마다 반영 칸). §12의 소유자 물음 10건과 값 이름의 후속 둘은 답을 받아 원장에 반영했다.
- **원장의 총검증은 한 번 돌렸다.** codex·antigravity의 누락 찾기와 그 판정은 `reviews/raw-round18-ledger-check.md`. 지적은 모두 반영됐다.
- 기계 검사 여섯은 모두 문제 0이다(§4의 명령). 소유자 답 216건이 모두 원장에 인용되고, 원천 문장 약 6,300개가 모두 인용되거나 분류됐다(`ledger/checks/sentence-classified.tsv`).

## 2. 다음 할 일 — 순서대로

1. **18라운드를 닫는다.** 원장의 열림 항목 99개를 안건 절별로 묶어 소유자에게 묻고, 답을 받아 원장에 반영한다(§3의 절차). 열림 항목은 다음 명령으로 뽑는다.
   ```
   cd packages/canard/schema-form/architecture
   for f in ledger/[a-z]*.md; do [ "$f" = ledger/README.md ] && continue; awk '/^### /{t=$0} /^- 상태: 열림/{print t "\n   " $0}' "$f"; done
   ```
   영역별 수: controls 11, error 10, fragment 9, event 8, schema 8, validate 8, write 8, node 7, test 7, settle 5, landing 4, value 4, goal 3, react 3, blueprint 2, surface 2.
   안건 절별로 보면 §11(원장이 드러낸 열린 항목) 20개, §9(PR-1·PR-2 뒤) 약 15개, §1(청사진이 읽는 범위) 약 10개, §3(쓰기 의미론)·§7(공개 표면)·§6(노드 구조)·§5(성능 예산 수치, 그 가운데 컴파일 예산 수치는 12-3이 답하지 않음)·§2(식 언어)·§4(프로토타입 v7)가 나머지다. 소유자가 정할 것과 편집자·스웜이 정할 것을 먼저 가른다(§3의 규칙 2).
2. **총검증을 한 번 더 돌린다.** 18라운드가 닫힌 뒤 같은 지시서(`reviews/raw-round18-ledger-check.md`의 머리에 적힌 방식, 지시서 원문은 그 파일 §1 앞의 설명)로 codex·antigravity에 옛 문서 대 원장의 누락·약화·상태·귀속을 묻고, 검증자가 거른 뒤 반영한다.
3. **설계 완료를 확정한다.** 열림 0, 검사 0, 총검증 지적 0이면 소유자에게 확정을 받는다.
4. **원장에서 ADR과 설계문서를 만든다.** 결정마다 원장 번호를 단다. 만든 뒤 §4의 검사를 원장 대 새 문서로 한 번 더 돌린다(새 문서의 문장이 원장 항목에 있는지).
5. **옛 문서를 백업 디렉토리로 옮긴다.** 소유자의 절 단위 통과는 새 설계문서에서만 한다(12-6).
6. **PR-0**(문서 최종화, 프로토타입 v7, 시나리오 패키지 뼈대, vitest `test.projects`), 그다음 **PR-1**. PR 계획은 원장 LANDING 영역(`ledger/landing.md`)이 정본이다.

## 3. 18라운드를 이어 하는 법

**물음을 내는 법.** 소유자는 "배경 → 왜 묻는가 → 예시 → 선택지와 결과 → 관련 원장 번호"가 붙은 물음을 원한다. 짧은 물음 목록만 주면 난해하다고 돌아온다. 여러 물음은 마크다운 한 장으로 만들어 `/preview`(deilen)로 띄우고 댓글로 답을 받는다(이번 §12가 그렇게 진행됐다. 초안은 `/tmp/claude-501/ledger-full/preview/`에 있었으나 세션이 바뀌면 없을 수 있다). 소유자는 짧게 답한다("가", "받아들입니다", 되물음). 되물음이면 대화로 답하고, 그 답의 요지를 반영 칸에 적는다.

**답을 기록하는 법.** `reviews/round-18-owner-answers.md`에 행 하나: 번호(안건 행 번호, 후속이면 "12-8 이어서"처럼), 물음, 답(원문 그대로, 날짜), 반영(원장에 어떻게 적히는지 — 닫히는 항목, 대체되는 옛 문장, 새 규칙). `ledger/checks/owner-answers.tsv`에 그 줄을 더한다(열: `path:line`, 라운드, 라벨, 답의 첫 80자).

**원장에 반영하는 법.** 에이전트(opus)에 다음을 준다: README §3·§6, 선례(`ledger/write.md`의 WRITE-076·077·078), 답 행의 줄 번호, 행마다 적용할 것. 규칙은 이렇다.
- 닫히는 항목: 보충에 답 원문 인용(`(\`reviews/round-18-owner-answers.md:N\`)`), 출처에 그 줄, 닫은 사람 `소유자 답(\`…:N\` 12-k)`, 라운드 18, 상태 현행.
- 답이 옛 규칙을 바꾸면: 옛 항목은 `대체됨(→ 새 번호)`로 두고 결정 원문은 남긴다. 새 항목은 영역 파일 끝에 새 번호로, 결정은 반영 칸 문장을 원문 그대로, 옛 문서의 어긋난 문장에는 충돌 칸.
- 항목의 일부만 걸리면 문장 경계에서 나눈다(`분할됨`). 표 행은 나눌 수 없으니 통째로 처리하고 보충에 어느 부분인지 적는다.
- 번호는 다시 쓰지 않는다. 색인 행을 항목과 같게 맞춘다. 안건 행의 물음 칸 끝에 `— **답함(날짜, \`…:N\`)**`을 붙인다.
- 끝에 §4의 검사를 돌려 모두 0이어야 한다.

**규칙 셋(변하지 않음).** (1) 소유자 답은 고정이다. 어긋나는 결론은 소유자 물음이 된다. (2) 원칙으로 정해지지 않고, 서열 없는 가치가 부딪히며, 사용자에게 보이는 결과가 갈리는 것만 소유자에게 간다. 나머지는 편집자나 스웜이 정하고 닫은 사람에 그렇게 적는다. (3) 오류는 삼키지 않는다.

## 4. 검사 명령 (`architecture/`에서, 모두 문제 0이어야 한다)

```
node ledger/checks/verbatim-check.mjs . ledger/*.md
node ledger/checks/sup-check.mjs . ledger/*.md
node ledger/checks/ref-check.mjs ledger/*.md
node ledger/checks/owner-cited.mjs ledger/checks/owner-answers.tsv ledger/*.md
node ledger/checks/bundle.mjs . ledger/checks/section-map.tsv $TMPDIR/bundles
for d in GOAL SCHEMA CONTROLS BLUEPRINT FRAGMENT VALUE WRITE SETTLE EVENT VALIDATE ERROR NODE REACT SURFACE LANDING TEST PROCESS; do
  node ledger/checks/sentence-check.mjs $TMPDIR/bundles/bundle-$d.md ledger/checks/sentence-classified.tsv ledger/*.md | tail -1; done
node ledger/checks/tokens.mjs inventory $TMPDIR/inv.json 0*.md open-questions.md adr/*.md README.md HANDOFF.md
node ledger/checks/tokens.mjs check $TMPDIR/inv.json ledger/*.md | head -1   # 잔여의 판정은 ledger/checks/token-review.md
```

원천 묶음(`bundle-*.md`)은 `section-map.tsv`에서 언제든 다시 만든다. 문장 검사는 인용을 먼저 보고 분류 행을 보므로, 인용된 문장의 낡은 분류 행은 무해하다(끝에 한 번 지웠다).

## 5. 파일 지도

| 파일 | 무엇 |
| --- | --- |
| `ledger/README.md` | 원장의 형식, 정본 우선순위, 상태·닫은 사람·분류의 허용값, 검사, 18라운드부터의 규칙 |
| `ledger/<영역>.md` ×17 | 원장. 머리 + 색인 표 + 항목 |
| `ledger/checks/*.mjs` | 검사 도구(`lib.mjs`의 문장 분할이 조각 출처 `path:line#n`의 기준) |
| `ledger/checks/section-map.tsv` | 옛 문서를 절 단위로 영역에 배정한 표(421절) |
| `ledger/checks/sentence-classified.tsv` | 원장에 인용되지 않은 문장의 분류(RESTATES·VIEW·HISTORY·OUT) |
| `ledger/checks/owner-answers.tsv` | 기록된 소유자 답 목록(216) |
| `ledger/checks/token-review.md` | 토큰 검사 잔여의 판정 |
| `reviews/round-18-agenda.md` | 18라운드 안건. §11 원장이 드러낸 열린 항목 20, §12 소유자 물음 10(답함) |
| `reviews/round-18-owner-answers.md` | 18라운드 소유자 답(원문) |
| `reviews/raw-round18-ledger-check.md` | 원장 총검증(codex·antigravity) 원문과 판정 |
| `reviews/round-N-*.md`, `reviews/raw-*.md` | 1–17라운드 기록(원장이 인용) |
| `spikes/` | 프로토타입과 실측(`.md`는 훅에 막히므로 `.txt`) |

## 6. 이번 세션에서 배운 것 — 다음에도 같은 방식으로

- **위임의 갈래.** 추출(원문 그대로, opus) → 독립 검증(verifier, 닫은 사람 귀속·상태·분류·해상도; 판정문 파일은 저장소 밖 `$TMPDIR`에 히어독으로 쓰게 한다) → 고침(worker, 정확한 문자열만) → 2차 통과(영역 사이에 넘긴 문장). 추출한 사람이 스스로 검증하지 않는다.
- **검증이 늘 잡는 것.** 편집자 산문·검토자 결론·소유자의 되물음을 소유자 답으로 적은 귀속, 소유자 답이 정했는데 편집자 결정으로 적은 누락, 옛 커밋으로만 확인되는 라운드, 안건에 없는 열린 항목. 새 항목을 만들 때마다 이 넷을 먼저 본다.
- **작업자는 검사 출력으로만 "끝"을 말하게 한다.** 스스로 했다고 하는 보고는 세지 않는다.
- **훅이 하위 에이전트의 보고서 파일 쓰기를 막는다.** 보고는 메시지로 받아 팀장이 파일로 옮긴다. 판정문은 verifier가 Bash 히어독으로 쓰면 된다.
- **에이전트끼리 scratchpad를 공유한다.** 스크립트는 영역별 폴더에 두게 한다(한 번 덮어써진 사고가 있었다).
- **외부 검토자(codex·antigravity)는 낡은 분류 행에 속는다.** 인용된 문장의 분류 행은 지우고 넘긴다.
