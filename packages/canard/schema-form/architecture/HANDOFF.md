# HANDOFF — `@canard/schema-form` 재설계

다음 세션이 바로 이어서 일하기 위한 문서다. 이력은 `git log`와 `reviews/`에 있으므로 여기에는 지금 상태, 다음 할 일, 일하는 법만 적는다. 소유자는 Vincent다.

## 1. 지금 어디인가 (2026-09-26, 18라운드 닫힘 + 소유자 검토 + union 설계 봉인)

- **설계의 정본은 단일 원장 `ledger/`다.** 영역 17개, 항목 1,332개(현행 1,062(부정 결정·기록 포함), 대체됨 199, 분할됨 47, 중복 24, 열림 0). 형식과 규칙은 `ledger/README.md`.
- **옛 설계 문서(`00`–`09`, `adr/`, `open-questions.md`)는 동결됐다.** 더 고치지 않는다. 어긋남은 원장의 충돌 칸에 적는다. 원장이 인용하는 옛 문서의 `path:line`은 모두 커밋 `ba398c330` 기준 줄 번호다(그 뒤 옛 문서는 바뀌지 않았다).
- **18라운드가 닫혔고, 소유자가 검토했고, 결정은 봉인됐다.**
  - 편집자 결정의 정본은 `reviews/round-18-closing.md`의 블록 `18C-01`…`18C-105`이다. 모든 결정에 【추론】 표지가 있다.
    - 01–88: 열린 항목 99개를 닫은 것과 반영 게이트가 드러낸 둘(87·88).
    - 89–93: union 설계 스웜의 편집자 결정(노드 공개 형, 청사진 판정 절차, 값 의미, 입력 바인딩, 이주·시험·비용).
    - 94–103: 채움 시점(WRITE-090)이 드러낸 파생(Refresh 범위, 순회 예산, 잠복 원본, 스냅숏 자리, 진단 초기화, 이주 행 셋, null 계약, `resetSubtree()` 범위, 에지 기준, 정리).
    - 104: 게이트 3이 찾은 U7의 반례를 닫은 정련(쓰기 경계는 정적 목록, 전이 단계는 원래 쓰인 값을 최종 유효 목록으로). 게이트 3 원문은 `reviews/raw-round18-tests/gate3-union-fill.md`.
    - 105: 최종 정합성 검증(codex·antigravity, `reviews/raw-round18-final-check.md`)이 찾은 13건을 닫은 블록 — U7의 게이트 되먹임은 전이 라운드 상한 안에서 다음 라운드를 부르고 원본 B에는 쓰기 경계의 해석만 남음, `VALIDATOR_COMPILE_FAILED`는 폼 수준 기록, 정적 선언 없는 이름의 분기 fold 불일치는 청사진 오류, `node.type`은 여덟, `push(v)`의 스냅숏 생성 값, 유효 목록의 "같은 참조" 뜻, 목록 밖 `default`는 노드가 생길 때마다.
  - 소유자 답은 `reviews/round-18-owner-answers.md:24-41`이다(`ledger/checks/owner-answers.tsv` 235건, 모두 인용됨). 요약은 `reviews/round-18-closing-summary.md` §D(24–37행). 38–41행은 설계서 검토 메모(2026-09-27)이며 아래 §2의 "소유자 메모" 줄이 반영 위치를 든다.
    - 24 union 규칙 A(순서 없음, 받아 주는 형이 하나일 때만 변환), 25 안쪽 이름 통일, 26 **채움은 노드가 생길 때만(B안)** — `setValue(V)`는 로드가 아니다, 27 명령 넷, 28 용어(`union`·variant 호스트).
    - 29–37 union 설계: 객체·배열 포함 union을 터미널 한정으로 허용, 형 없는 원시 `anyOf`는 분기 형을 모음, 필드는 `type`(종류)·`schemaType`(계산된 허용 형 목록, union만 배열, `'null'` 제외)·`nullable`, 형 없는 `const`·`enum` 분기와 객체·원시 혼합 `oneOf`는 오류, 값을 바꾸는 검증기는 `bind` 거부, Hint·props의 `type`은 종류, 좁힘은 연언의 교집합(정적은 청사진에서, 게이트는 켜진 동안 유효 목록만).
  - union 설계는 스웜(렌즈 넷 → 검증 둘 → 병합 → codex·antigravity 교차 확인 → 2·3판)으로 만들었다. 작업 파일은 `reviews/raw-round18-union-swarm/`(정본 설계 `merged-v3.md`), 시험 보고는 `reviews/raw-round18-tests/`(표준 대조 둘, 원장 정합성 시험 둘, 1차 교차 확인 둘).
- **기계 검사는 모두 문제 0이다(§4).** 소유자 답 235/235, 정확 일치 225 항목, 블록 105/105, 문장 검사 17 영역 0/0, 토큰 잔여 484(원장 반영은 잔여를 늘리지 않았고, 늘어난 것은 이 문서의 자기 서술 토큰이다 — `ledger/checks/token-review.md` 끝 절).
- **의미 게이트(게이트 3)는 13건을 찾아 모두 고쳤다.** 원문은 `reviews/raw-round18-tests/gate3-union-fill.md`. 게이트가 "확인하지 못한 것"으로 남긴 둘(정적 선언이 없는 이름에서 게이트 없는 분기끼리 fold가 다를 때, EVENT-072의 "한 로드에 한 번"이 `VALIDATOR_COMPILE_FAILED`에서 뜻하는 것)은 §2의 최종 검증(E)에 넣는다.

## 2. 다음 할 일 — 순서대로

1. **최종 논리 정합성 검증 — 끝났다(2026-09-27).** codex·antigravity에 같은 지시서(A–E)를 돌려 13건(겹침 제외)을 받았고, 검증 뒤 모두 18C-105로 닫았다. 원문·판정·고침 명세는 `reviews/raw-round18-final-check.md`. 다시 돌릴 때의 지시서 골격은 다음과 같다.
   - (A) 현행 항목끼리의 모순: 같은 상황에 다른 결과, 같은 이름의 두 뜻, 개수·코드 이름·PR 배정·순서·기본값의 불일치. 18라운드 항목(특히 89–103과 소유자 답 24–37에서 온 항목) 대 다른 영역의 옛 현행 항목을 가장 세게 본다.
   - (B) 끊긴 가리킴: `대체됨`·`중복`의 대상이 내용을 들지 않음, `분할됨`이 부모를 다 덮지 않음, 충돌의 이긴 쪽이 틀림.
   - (C) 소유자 답과 어긋나는 결정, 편집자 추론을 소유자 답처럼 적은 귀속.
   - (D) 현행인데 선택을 미룬 결정. 누가 언제 정하는지 없이 "미정", "나중에"라고 적은 것. (알려진 보류: 객체·원시 혼합 `oneOf`의 허용 — 소유자 답 33행이 "지금은 오류"로 정했고 나중에 풀어도 파괴적 변화가 아니다.)
   - (E) 18C 블록끼리의 불일치. 특히 U7(전이 단계의 재해석, BLUEPRINT-041) 대 정착 예산(SETTLE-017·047), 유효 목록(게이트) 대 VALUE-030의 경고등 정의.
   - 출발점은 `reviews/round-18-closing.md` 전체다. 블록마다 이름·코드·번호로 원장을 grep해 같은 주제의 현행 항목과 대조하고, 끝으로 개수와 이름을 17개 파일 전체에서 훑는다.
   - 지적 양식은 한 건마다 `F<n> <높음|중간|낮음>`, 두 항목과 상태, 원문 인용(`path:line`), 왜 모순인가, 제안(어느 쪽이 이기는가, 또는 "소유자 물음")이다.
   - 원문과 판정은 `reviews/raw-round18-final-check.md`에 적는다(`reviews/raw-round18-ledger-check.md`가 선례). 검증자가 원문과 대조해 거른 뒤 고침 명세로 반영한다. 지시서 초안은 세션 scratchpad의 `brief-final-check.md`였다(저장소에 없으므로 위 다섯으로 다시 쓴다).
2. **설계 완료 확정과 개발계획 — 끝났다(2026-09-27).** 소유자가 설계서 검토 메모 넷(38–41행)을 주고 원장 반영을 지시했으며, 개발계획을 `plan/`에 썼다. 우산 구조: `1.0.0-beta` 브랜치의 우산 PR #344(`master` 기준, 빈 스캐폴드 커밋), 자식은 설계 PR(이 브랜치) → 개발 PR(원장 PR-0 코드 부분…PR-7) → 플러그인 PR → 정리·릴리스 PR(PR-8). 소유자 결정 P1–P4(`plan/README.md` §4: 플러그인 일의 자리, 레거시 삭제 시점, 인접 단계 합침, 릴리스 전환 PR 시점)가 열려 있다.
3. **원장에서 ADR과 설계문서를 만든다.** 결정마다 원장 번호를 단다. 만든 뒤 §4의 검사를 원장 대 새 문서로 한 번 더 돌린다(새 문서의 문장이 원장 항목에 있는지). union의 설계문서는 `reviews/raw-round18-union-swarm/merged-v3.md`를 원장 번호로 바꿔 쓴다.
4. **옛 문서를 백업 디렉토리로 옮긴다.** 소유자의 절 단위 통과는 새 설계문서에서만 한다(12-6).
5. **PR-0**(문서 최종화, 프로토타입 v7, 시나리오 패키지 뼈대, vitest `test.projects`), 그다음 **PR-1**. PR 계획은 원장 LANDING 영역(`ledger/landing.md`)이 정본이다. 프로토타입 v7은 18C-88의 방출 규칙과 18C-91의 규칙 A(`isMember`·`convert`·`interpret`, 동점 12건)를 따른다. v6은 빈 루트를 `undefined`로 낸다.
   - **소유자 메모(2026-09-27, 설계서 검토, `reviews/round-18-owner-answers.md` 38–41행) — 반영됨(2026-09-27, 소유자 지시)**: (38) 청사진 내부 이름은 약어 없이(`PropertyDecl` → `PropertyDeclaration` 같은 풀 네임) → BLUEPRINT-046, BLUEPRINT-002에 보충·충돌. (39) 조각의 구현 타입 이름은 `SchemaFragment`(개념어 "조각"과 FRAGMENT 영역 이름은 그대로) → BLUEPRINT-047, BLUEPRINT-002에 보충·충돌. 둘은 PR-1의 청사진 `DETAIL.md`·`type.ts`가 적는다. (40) 명령 넷(`focus`·`select`·`refresh`·`remount`)은 메서드 넷이 아니라 명령 종류를 매개변수로 받는 노드 메서드 하나(`action`·`interaction`·`request` 또는 명령 한정 `publish`) → EVENT-073; 메서드 이름·값의 형·`FormHandle` 대칭 모양은 PR-4 착수 전에 편집자가 권장안을 올리고 소유자가 정한다. EVENT-063·SURFACE-011·SURFACE-058·LANDING-170에 보충·충돌(겉면 수 약 57 → 약 54). (41) 경고등 공개 이름 확정: 게터 `typeMismatch`·목록 `typeMismatches`·코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH` → SURFACE-061; 가칭을 결정문에 든 현행 항목 열둘(BLUEPRINT-041, ERROR-186, ERROR-198, LANDING-126, NODE-058, REACT-032, REACT-033, SURFACE-052, SURFACE-058, VALUE-030, VALUE-037, WRITE-079)에 보충·충돌, 보충만 든 항목 6개(ERROR-164, NODE-041, REACT-027, SURFACE-010, TEST-077, WRITE-093)에 보충. 시험 파일 이름 `union.mismatch-light.test.ts`는 그대로다. LANDING-127은 가칭을 들지 않아 손대지 않았다. 네 행은 `ledger/checks/owner-answers.tsv`에 더했고(235건), `reviews/round-18-closing-summary.md` §D에는 넣지 않았다.
   - PR-2 게이트에 반드시 넣을 시험: 규칙 A 표 전체와 동점 12건, `integer` 멤버십, 게이트 켜짐·꺼짐 전이에서 경고등만 바뀌고 값은 바뀌지 않음, `setValue({kind:'num', a:'42'})`가 직전 상태와 무관하게 `a = 42`(U7), 서로소 게이트 둘의 충돌(TEST-077).

## 3. 일하는 법

**물음을 내는 법.** 소유자는 유도할 수 있는 것은 묻지 않기를 원한다.
- 원리, 앞선 소유자 답, 채택된 ADR, 현행 원장 항목, 패키지 설계 가치(`packages/canard/schema-form/CLAUDE.md` Design Values)로 갈리는 것은 편집자가 【추론】으로 닫는다.
- 소유자에게는 가치가 서열 없이 부딪치고 사용자에게 보이는 결과가 갈리는 것만 묻는다.
- 물은다면 "배경 → 왜 묻는가 → 예시 → 선택지와 결과 → 관련 원장 번호"를 붙인다. 마크다운 한 장을 `/preview`로 띄워 댓글로 받는다.
- 소유자가 "정합하면 채택"으로 위임한 결정은 검증자로 검증하고, 검증이 찾은 결함을 고친 형태로 채택한다. 소유자 답에는 위임 원문과 검증 결과 파일을 함께 적는다(37행이 선례).

**답을 기록하는 법.** `reviews/round-18-owner-answers.md`에 행 하나를 더한다.
- 칸: 번호, 물음, 답(원문 그대로, 날짜), 반영(원장에 어떻게 적히는지). 반영 칸이 원장 항목의 정본 글이 된다(WRITE-078, BLUEPRINT-036이 선례).
- `ledger/checks/owner-answers.tsv`에 그 줄을 더한다(열: `path:line`, 라운드, 라벨, 답의 첫 80자).
- 소유자 답이 앞선 답이나 18C 블록의 문장을 대체하면 그 항목은 `분할됨(→ 나머지 항목, 새 항목)`이 되고, 나머지 항목은 살아남은 문장만 정확히 인용한다. 표 행이라 `#n` 조각으로 나눌 수 없으면 출처에 그 사정을 적는다.

**결정을 적는 법.**
- 새 결정은 먼저 정본 문서에 블록으로 적는다. 블록은 닫는 항목·결정·근거·게이트로 이루어지고, 결정은 한 줄에 한 문장이다.
- 원장은 그 줄을 글자 그대로 인용한다. 그래서 정본을 고칠 때는 줄 수를 바꾸지 않고 제자리에서 고치고, 원장에서 그 줄을 인용한 곳을 같은 글로 맞춘다.
- 새 결정은 파일 끝에 새 블록으로 붙인다. 근거가 세션 작업 파일이면 먼저 `reviews/raw-*/`로 옮기고 그 경로를 인용한다(scratchpad 경로는 커밋에 남지 않는다).

**원장에 반영하는 법.** 먼저 번호를 모두 미리 배정한 계획을 만들고, 영역별로 병렬 반영한 뒤, 영역별 검증자가 본다. 규칙은 다음과 같다.
- **집.** 블록의 결정·게이트 줄은 모두 어떤 항목의 결정 칸에 있어야 한다(첫 출처가 `(정본)`인 항목). 옛 항목의 보충에만 두지 않는다. 이주 줄은 LANDING의 이주 행이 든다.
- **옛 항목.** 결정이 물음·주제·미정이면 `대체됨(→ 새 번호)`, 여럿으로 나뉘면 `분할됨(→ …)`이다. 이때 이번 라운드가 보충에 더한 같은 줄은 지운다. 규칙이 그대로 유효하면 `현행`으로 두고 보충을 교차 참조로 남긴다. 행을 나눌 수 없는 표 항목은 충돌 줄로 적는다.
- **게이트 줄**(PR·무엇·통과·실패)은 결정이다.
- **옛 글은 자라기만 한다.** 옛 결정과 옛 줄은 고치지 않는다. 이번 라운드가 더한 것은 되돌릴 수 있다. 옛 항목의 제목은 현행 항목의 낡은 가리킴만 고친다.
- **충돌 줄 모양:** `` `path:line`의 "원문"은 N라운드 결정과 다르다: 새 규칙(번호). N라운드 결정이 이긴다(`정본:줄`). `` 소유자 답이 이기면 `소유자 답이 이긴다(`reviews/round-18-owner-answers.md:N`)`.
- **가리킴:** `대체됨`·`분할됨`의 목록은 옛 내용을 드는 항목을 모두 적는다. 항목을 분할하면 §4의 분할 포인터 풀기를 먼저 돌린다.
- **닫은 사람:** 18라운드 내용은 편집자 결정이다. 소유자 답은 그 답이 규칙을 정할 때만 닫은 사람이 된다.

**규칙 셋(변하지 않음).**
1. 소유자 답은 고정이다. 어긋나는 결론은 소유자 물음이 된다.
2. 원칙으로 정해지지 않고, 서열 없는 가치가 부딪치며, 사용자에게 보이는 결과가 갈리는 것만 소유자에게 간다. 나머지는 편집자나 스웜이 정하고, 닫은 사람에 그렇게 적는다.
3. 오류는 삼키지 않는다.

## 4. 검사 명령 (`architecture/`에서, 모두 문제 0이어야 한다)

```
node ledger/checks/expand-split-pointers.mjs ledger/checks/sentence-classified.tsv -- ledger/*.md   # 분할한 항목이 있으면 먼저
node ledger/checks/verbatim-check.mjs . ledger/*.md
node ledger/checks/sup-check.mjs . ledger/*.md
node ledger/checks/ref-check.mjs ledger/*.md
node ledger/checks/owner-cited.mjs ledger/checks/owner-answers.tsv ledger/*.md
node ledger/checks/bundle.mjs . ledger/checks/section-map.tsv $TMPDIR/bundles
for d in GOAL SCHEMA CONTROLS BLUEPRINT FRAGMENT VALUE WRITE SETTLE EVENT VALIDATE ERROR NODE REACT SURFACE LANDING TEST PROCESS; do
  node ledger/checks/sentence-check.mjs $TMPDIR/bundles/bundle-$d.md ledger/checks/sentence-classified.tsv ledger/*.md | tail -1; done
node ledger/checks/tokens.mjs inventory $TMPDIR/inv.json 0*.md open-questions.md adr/*.md README.md HANDOFF.md
node ledger/checks/tokens.mjs check $TMPDIR/inv.json ledger/*.md | head -1   # 잔여의 판정은 ledger/checks/token-review.md
node ledger/checks/plan-links.mjs plan/*.md -- ledger/*.md              # 개발계획서가 인용한 ID는 모두 현행, PR 정의 항목은 모두 인용됨
```

- **원천 묶음.** `bundle-*.md`는 `section-map.tsv`에서 언제든 다시 만든다.
- **문장 검사.** 인용을 먼저 보고 분류 행을 본다. 그래서 인용된 문장에 남은 낡은 분류 행은 무해하다.
- **토큰 잔여.** 지금 484이다. 원장 쪽 잔여는 HEAD 잔여의 부분집합이고, 나머지는 HANDOFF의 자기 서술 토큰이다(`ledger/checks/token-review.md`).
- **`verbatim-check`의 한계.** 인용한 줄이 출처 파일 어딘가에 있는지만 본다. 그래서 줄 범위가 틀리거나, 줄이 빠지거나, 순서가 바뀐 것은 잡지 못한다.
  - 18라운드에서는 세션 scratchpad의 임시 스크립트 셋(`exact-check.mjs` 정확 일치, `block-check.mjs` 블록 덮개와 항목↔블록 이름, `diff-guard.mjs` 옛 항목은 자라기만 한다)으로 이것을 보았다. 저장소에는 없다. 정본 블록을 새로 반영할 때는 같은 대조를 다시 만든다(각 40–80줄).

## 5. 파일 지도

| 파일 | 무엇 |
| --- | --- |
| `ledger/README.md` | 원장의 형식, 정본 우선순위, 상태·닫은 사람·분류의 허용값, 검사, 18라운드부터의 규칙 |
| `ledger/<영역>.md` ×17 | 원장. 머리 + 색인 표 + 항목 |
| `ledger/checks/*.mjs` | 검사 도구(`lib.mjs`의 문장 분할이 조각 출처 `path:line#n`의 기준) |
| `ledger/checks/section-map.tsv` | 옛 문서를 절 단위로 영역에 배정한 표(421절) |
| `ledger/checks/sentence-classified.tsv` | 원장에 인용되지 않은 문장의 분류(RESTATES·VIEW·HISTORY·OUT) |
| `ledger/checks/owner-answers.tsv` | 기록된 소유자 답 목록(235) |
| `ledger/checks/token-review.md` | 토큰 검사 잔여의 판정 |
| `plan/README.md`, `plan/pr-*.md` | 개발계획(2026-09-27): 우산 구조(`1.0.0-beta`, PR #344), 단계별 계획서 11편(원장 PR-0…PR-8 + 플러그인 + 릴리스 전환), 독립 검증 장치, 소유자 결정 P1–P4 |
| `reviews/round-18-closing.md` | 18라운드 편집자 결정의 정본(18C-01…105) |
| `reviews/round-18-closing-summary.md` | 소유자 검토용 요약(원장이 인용하지 않음). §D가 검토 결과 |
| `reviews/round-18-agenda.md` | 18라운드 안건. 행마다 닫힘 표지 |
| `reviews/round-18-owner-answers.md` | 18라운드 소유자 답(원문). 23행은 닫기 방식, 24–37행은 검토 결과와 union 설계, 38–41행은 설계서 검토 메모(2026-09-27, 원장 반영됨) |
| `reviews/raw-round18-union-swarm/` | union 설계 스웜: 공통 브리프, 렌즈 넷의 제안, 검증 둘, 판정 셋, 교차 확인 둘, O7·O8 검증, 정본 설계 `merged-v3.md`, 규칙 A 전수 실행 스크립트 |
| `reviews/raw-round18-tests/` | 표준 대조(명세·생성기·검증기·폼 라이브러리, 브랜치 노드), 원장 정합성 시험(union, 채움 시점), 1차 교차 확인(codex·antigravity), 게이트 3 원문 |
| `reviews/raw-round18-ledger-check.md` | 원장 총검증(codex·antigravity) 원문과 판정 |
| `reviews/round-N-*.md`, `reviews/raw-*.md` | 1–17라운드 기록(원장이 인용) |
| `spikes/` | 프로토타입과 실측(`.md`는 훅에 막히므로 `.txt`) |

## 6. 배운 것 — 다음에도 같은 방식으로

- **위임의 갈래.** 추출이나 결정문 작성(opus) → 독립 검증(verifier) → 고침(worker, 정확한 문자열만) → 재검증. 쓴 사람이 스스로 검증하지 않는다.
- **설계 스웜의 모양(union에서 검증됨).** 공통 브리프(확정 사실·가치·소유자 원문) + 렌즈별 브리프 → 렌즈들이 서로 요구를 주고받으며 제안 → 검증 둘(렌즈 간 정합, 원장·가치 대조) → 편집자 판정 → 병합 → 외부 교차 확인(codex·antigravity) → 재판정 → 재병합. 소유자에게는 갈린 것만 선택지 둘과 권장으로 올린다. 병합 문서는 규칙 한 문장마다 근거를 달아, 그대로 소유자 답·18C 블록으로 옮겨진다.
- **소유자가 위임한 결정도 검증을 거친다.** O7·O8은 검증자가 "정합하지 않음"을 찾아 고친 형태로 채택됐다(순서 의존, `setValue` 순서 의존). 검증 없이 채택했다면 하위 문법 둘이 들어갔을 것이다.
- **검증이 늘 잡는 것.**
  - 편집자 산문, 검토자 결론, 소유자의 되물음을 소유자 답으로 적은 귀속
  - 소유자 답이 정했는데 편집자 결정으로 적은 누락
  - 옛 커밋으로만 확인되는 라운드
  - 안건에 없는 열린 항목
  - 편집자가 확정 결정을 뒤집은 판정(codex가 O8에서 잡았다) — 뒤집으려면 소유자 항목으로 올린다
- **반영 계획은 블록 덮개를 기계로 확인한다.** 블록마다 결정 칸의 집이 있어야 한다. 18라운드 1차 계획은 이것을 놓쳐, 질문 모양의 옛 항목이 `현행`으로 남고 결정은 보충에만 들어갔다.
- **게이트 지시서에는 판정 기준을 미리 적는다.** 질문 모양의 현행과 게이트 줄이 그 예다. 적지 않으면 게이트마다 판정이 갈린다.
- **결정은 모형과 대조한다.** 새 결정이 원장의 상태 모형(P3 등)과 맞는지 게이트가 따로 본다. 18C-87의 "빈 그릇 로드"는 모형에서 효과가 없음이 드러나 18C-88로 다시 정했다. 오래된 빈틈이 원장 밖 기록(예: `reviews/round-6-coherence.md:107`)에 남아 있을 수 있다.
- **한 소유자 답이 원장 곳곳에 파생을 낳는다.** 26행(채움 B안)은 항목 40여 개의 충돌·보충과 블록 열 개(94–103)를 낳았다. 소유자 답을 반영한 뒤에는 그 답만 겨냥한 정합성 시험을 한 번 돌린다(`reviews/raw-round18-tests/t1b-fill-consistency.md`가 선례).
- **작업자는 검사 출력으로만 "끝"을 말하게 한다.** 스스로 했다고 하는 보고는 세지 않는다.
- **하위 에이전트의 보고서 파일 쓰기를 훅이 막는다.** 보고는 메시지로 받아 팀장이 파일로 옮긴다.
- **외부 검토자(codex·antigravity)는 낡은 분류 행에 속는다.** 인용된 문장의 분류 행은 지우고 넘긴다. codex는 세션 scratchpad를 읽지 못하므로 파일을 저장소 안에 두거나 본문을 인라인으로 넘긴다.
