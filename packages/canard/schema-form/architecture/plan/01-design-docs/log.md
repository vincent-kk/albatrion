# 01 설계문서 — 실행 계획과 기록

Planning method: 저장소 지침 — `PLAN.md` §2와 `plan/prompts.md`의 단계 실행 프롬프트(작업 단위 표는 이 `log.md`). 단위마다의 단계·명령·기대 결과는 seiri `write-plan`의 불변식으로 채운다. 진행 순서는 소유자 지시대로 seiri 흐름(계획 작성 → 계획 검증 → 리뷰 반영 → 개발 → 검증)이다.

정본의 순서: 원장 `ledger/<area>.md` > 계획서 `request.md`·`adr-and-axes.md`·`verification.md` > 이 기록. 이 기록이 원장과 다르면 원장대로 가고 §6에 적는다. 원장과 계획서는 고치지 않는다.

계획 검증: 1차(2026-09-27) verifier `rework-required`(높음 셋 — 백업 이동 순서, (ㄷ)의 절 범위, merged-v3 규칙; 중간 여섯; 낮음 여덟)와 원장 관리 세션의 정합 검토(규칙 3↔4, 규칙 5의 범위, §6의 순서, ADR 소속 수치, 낡은 글귀 여섯)를 모두 이 판에 반영했다. 2차 확인(2026-09-28)의 N1–N5와 3차 확인의 정비 문장 예외를 반영했고, verifier가 "두 줄을 그대로 넣으면 다시 확인 없이 통과"라고 한 고침까지 넣었다. **판정: `cleared`**(verifier 3차, 원장 관리 세션 정합 확인). PROCESS-023(§6의 4)은 원장 관리 세션이 20라운드로 닫았다(PROCESS-068, 현행 1,073).

## 0. 머리

- 선출 이유: 소유자가 순서를 적지 않았고 `PLAN.md` §3에 `진행`인 단계가 없어 §4 다음 할 일의 첫 단계를 골랐다. 소유자가 확인했다(2026-09-27).
- 브랜치 `docs/schema-form-design-docs`, base와 PR base `1.0.0-beta`(`5dc53ba1b`). 시작 2026-09-27 23:33 KST.
- 원장 질의는 원장 관리 세션에 보낸다(소유자 지시): 처음 `albatrion-2c`, 2026-09-28 재개부터 `albatrion-96`. 첫 회신: 인용된 16항목 모두 현행, 착수를 막는 소유자 결정 없음. 실측 상태: 현행 1,012, 현행(부정 결정) 25, 현행(기록) 35(합 1,072), 대체됨 199, 분할됨 49, 중복 24, 열림 0.
- 착수 전 확인:
  1. 원장 검사 전부 0 — **닫힘**. `HANDOFF.md` §4의 명령 전부: `verbatim` 0, `sup` 0, `ref` 0, 소유자 답 242/242, 분할 포인터 0, 문장 검사 17영역 모두 missing 0·bad 0, 토큰 잔여 488(기준과 같음), `plan-links` 0.
  2. 설계문서의 절 구성에 소유자 이견이 없는지 — 첫 문서 `design/02`의 개요와 초안으로 확인한다. **U2가 끝나면 멈추고 묻는다.**
- 소유자 결정(2026-09-27): 대상 단계 01. 문서는 opus 에이전트가 쓰고, 검사 도구는 codex가 짜고, 외부 해상도 대조는 codex·antigravity 둘. 절 단위 통과는 02만 U2 뒤에 멈춰 받고, 나머지 일곱은 PR 리뷰에서 받는다.

## 1. 목표와 완료 기준

원장(정본)에서 읽기 표면인 설계문서 8편과 ADR 17편을 만들고, 옛 문서를 백업으로 옮기고, 소유자의 절 단위 통과를 받는다(LANDING-060 보충, PROCESS-050, PROCESS-061, PROCESS-062).

| 완료 기준(`request.md`) | 단위 | 관찰할 증거 |
| --- | --- | --- |
| `design/00`–`07` 8편, 문장마다 원장 ID | U2–U5 | `doc-coverage` (ㄱ)·(ㄹ) 0, 조각마다 verifier 두 방향 대조 PASS |
| `adr/0001`–`0017` 재작성(옛 것은 `_archive/`) | U6, U8 | 파일 17개, `doc-coverage`를 `design/*.md adr/*.md`에 돌려 0 |
| `ledger/checks/doc-coverage.mjs`와 HANDOFF §4의 검사 줄 | U1, U8 | 픽스처에서 검사마다 정해진 줄이 잡힘, `tokens.mjs` 출력 불변, HANDOFF §4의 새 줄 |
| `_archive/<날짜>/` 이동과 README, `lib.mjs` 원천 루트 갱신, 기존 검사 전부 여전히 0 | U8 | HANDOFF §4 명령 전부 0(토큰 잔여는 판정 기록) |
| codex·antigravity "원장 대 문서" 해상도 대조, 결과는 `reviews/raw-design-docs-check.md` | U7 | 기록 파일, 거른 뒤 새 지적 0 |
| 소유자 절 단위 통과 8편 → `1.0.0-beta`로 병합 | U2(02), PR 리뷰(나머지) | 문서 머리의 통과 표 |

범위 밖: 코드(`src/**`)와 원장·계획서의 내용. 패키지 `lint`는 `src/**/*.{ts,tsx}`만 보므로(`packages/canard/schema-form/package.json:57`) `ledger/checks/*.mjs`는 대상이 아니다. `request.md`가 정한 대로 filid 스캔 대상도 아니다.

## 2. 형식 명세 — 모든 단위가 따른다

### 2.1 설계문서의 모양

- 파일은 `architecture/design/` 아래 여덟이다: `00-goals-and-values.md`(GOAL·PROCESS), `01-schema-to-blueprint.md`(SCHEMA·BLUEPRINT·FRAGMENT), `02-node-and-value.md`(NODE·VALUE·WRITE), `03-settle-and-events.md`(SETTLE·EVENT), `04-controls.md`(CONTROLS), `05-validation-and-errors.md`(VALIDATE·ERROR), `06-react-and-surface.md`(REACT·SURFACE), `07-landing-and-tests.md`(LANDING·TEST).
- 머리: `# <번호> <제목>`, 한 단락 머리말("이 문서는 원장의 <영역> 영역을 읽는 표면이다. 정본은 `ledger/`이며, 문장 끝 괄호의 ID가 근거이고, 어긋나면 원장이 이긴다."), `## 소유자 통과` 표(`| 절 | 상태 | 날짜 |`, 행은 본문의 `###` 절마다, 상태는 `대기` 또는 `통과`). 머리는 (ㄱ)·(ㄷ)·(ㄹ)의 대상이 아니다. 소유자가 통과를 말하면 이 세션이 그 행을 `통과`와 날짜로 고친다.
- 본문: 장 하나가 원장 영역 하나다. 장은 `## <n>. <제목>`(파일 이름의 영역 순서), 절은 `### <n>.<m> <주제>`. 절의 묶음과 순서는 개요(§2.3)가 정하며, 원리를 먼저, 그 원리에서 도출된 규칙을 뒤에 둔다(PROCESS-004).
- `design/00`은 첫 절에 패키지 설계 가치(GOAL-049, GOAL-050)를 두고, 가치끼리 부딪히는 자리의 표(GOAL-086)를 옮긴다.

### 2.2 원장에서 문서로 옮기는 규칙

1. **인용.** 본문 문장마다 끝에 괄호로 원장 ID를 단다: `…한다(NODE-002).`, 여러 항목이면 `(NODE-002, WRITE-090)`(PROCESS-068).
2. **원문 보존.** 결정 칸의 문장은 원문을 그대로 옮긴다. 허용하는 변형은 접속어를 더하기, 긴 문장을 뜻을 빼지 않고 나누기, 가리킴을 바꾸기(4번), 충돌의 진 쪽을 바꾸기(6번)뿐이다. 조건·예외·수량·순서·이름을 빼거나 바꾸지 않고 요약하지 않는다(PROCESS-007, PROCESS-051 (가)). 약어를 쓰지 않으며 원리 `P1`–`P5`, 목표 `G1`–`G8`처럼 번호로 부르는 것은 처음 나올 때 풀어 쓰되 번호 표지를 남긴다: `목표 G4(하나의 개념에는 하나의 장치)`(PROCESS-023).
3. **표와 코드 블록.** 결정 칸의 표는 행과 칸을 바꾸지 않고 옮긴다. 머리 행이 같은 표의 행을 항목마다 따로 든 연속 항목은 한 표로 합친다. 표나 코드 블록 바로 앞의 비어 있지 않은 줄은 그 표가 옮기는 항목의 ID를 모두 드는 문장이거나 `(ID, …)`만 있는 줄이다. 셀에는 인용 꼬리표를 넣지 않는다(4번의 가리킴 바꿈은 예외). 인용 블록(`>`)은 쓰지 않는다.
4. **가리킴.** 결정문 안의 옛 문서 가리킴(`00-goals.md`, "원장 §3", "ADR 0008 §3", "09 §6.2", `reviews/…` 경로)은 표 셀 안에서도 그 규칙을 든 현행 원장 ID로 바꾼다(예: GOAL-086의 "어디에 적혀 있는가" 열, PROCESS-021의 주인 문서 표). PROCESS-023의 표기 문장("원장 §n", "ADR 00nn", "07 n.n")은 20라운드 충돌 줄이 이긴 쪽으로 정했으므로 규칙 6대로 PROCESS-068의 문장으로 옮긴다(§6의 4). 오늘 코드의 관찰 위치(`getCompositionKeyInfo.ts:33` 같은)는 그대로 둔다. 대응을 찾지 못한 가리킴은 지우지 않고 그대로 둔 채 작성 보고에 적는다. 바꿈으로 사라진 토큰은 예외 파일에 까닭 `가리킴 바꿈`으로 적는다.

   **현행 아닌 ID.** 결정·보충·충돌 줄에서 옮기는 글 안의 현행 아닌 ID는 그 문장이 가리키는 규칙을 결정 칸에 든 현행 조각의 ID로 바꾼다. 대체됨이면 대상으로, 분할됨이면 그 규칙을 든 조각으로 바꾸고, 대상이 다시 대체·분할됐으면 끝까지 따라간다. 원장이 이미 풀어 준 가리킴(WRITE-097)은 그대로 따른다. 인용하는 항목 자신을 가리키게 되는 꼬리("X 그대로")는 지운다. 원장 자신에 대한 정비 문장은 옮기지 않는다. 옮기지 않은 정비 문장이나 지운 꼬리에만 있던 토큰은 예외 파일에 까닭 `정비 문장`으로 적는다. 원장 관리 세션이 결정 칸의 24쌍을 다음과 같이 풀었다(현행 아닌 ID는 하이픈 없이 적음).

   | 부류 | 자리 | 옮기는 법 |
   | --- | --- | --- |
   | 정비 문장, 옮기지 않음 | CONTROLS-079(ERROR 123), WRITE-097의 세 문장(LANDING 118·WRITE 017, WRITE-085의 가리킴, FRAGMENT-054의 가리킴), TEST-071(TEST 063), SURFACE-058(NODE 019) | 작성 보고에 "원장 정비 문장, 옮기지 않음" |
   | "X 그대로" 꼬리 | BLUEPRINT-032(BLUEPRINT 009), SCHEMA-044(SCHEMA 014), SURFACE-051(SURFACE 025) | 문장은 옮기고 꼬리를 지운다 |
   | 원장이 푼 가리킴 | WRITE-085 "(D-7, WRITE 017)" → WRITE-090, "(SETTLE 027)" → SETTLE-046; FRAGMENT-054 "(VALUE 015·WRITE 014)" → VALUE-036, WRITE-092 | WRITE-097대로 |
   | 조각 하나로 | BLUEPRINT-043 (BLUEPRINT 009) → BLUEPRINT-032; REACT-033 (BLUEPRINT 033), (BLUEPRINT 034 (4)) → BLUEPRINT-042; VALIDATE-051 (BLUEPRINT 033) → BLUEPRINT-042(BLUEPRINT-040일 수 있어 verifier가 확인); NODE-051 (SETTLE 027) → SETTLE-046; WRITE-089 (VALUE 007) → VALUE-035; BLUEPRINT-030 (VALUE 015) → VALUE-036; WRITE-079 (WRITE 014) → WRITE-090; WRITE-093 (WRITE 080) → WRITE-091 | 그 규칙을 든 조각의 ID |

   보충과 충돌 줄 안의 경우(verifier 실측: 보충 넷 — BLUEPRINT-042, ERROR-159, VALUE-029, WRITE-092; 충돌 다섯 — FRAGMENT-054 둘, VALUE-029, WRITE-085 둘)도 같은 규칙으로 옮긴다. 조각 브리프에는 그 조각의 해당 자리를 스크립트로 뽑아 넣는다(§2.3).
5. **보충.** 결정을 좁히거나 조건·예외·값을 더하는 보충, 그리고 결정 원문을 확정하거나 뒤집는 반영 칸 보충(PROCESS-062, VALIDATE-026)의 원문은 같은 항목 ID로 결정 곁에 옮긴다. 결정과 같은 문장을 다른 출처에서 되풀이한 보충은 옮기지 않는다.
6. **충돌.** 충돌 줄이 다른 위치의 글을 인용하고 이 항목의 정본이 이긴다고 적으면 옮길 것이 없다. 충돌 줄이 인용한 글이 이 항목 자신의 결정에 있고 이긴 쪽이 다른 항목이나 소유자 답이면, 그 글(문장이나 셀)을 충돌 줄의 콜론 뒤 규칙 문장으로 바꾸고, 그 규칙을 결정 칸에 든 항목의 ID를 더 단다(충돌 줄이 그 ID를 적지 않았으면 이 항목의 ID만 단다). 해당 항목은 스크립트가 기계로 뽑는다: 충돌 줄이 큰따옴표로 인용한 글의 앞 30자가 그 항목의 결정 칸에 있고, 줄에 `이긴다`가 있으되 `정본이 이긴다`가 아닌 현행 항목이다(verifier 추정 약 130개; 예 BLUEPRINT-002의 옛 이름은 BLUEPRINT-046, 가칭을 든 항목은 SURFACE-061). 원장 관리 세션이 확인한 다섯 — GOAL-086(→ WRITE-090), LANDING-060(→ PROCESS-062), LANDING-068(→ TEST-045), TEST-028(→ TEST-073), NODE-027(→ NODE-047) — 은 그 예다. 조각 브리프에는 그 조각의 해당 항목과 충돌 줄을 넣는다(§2.3). 이긴 쪽을 적지 않은 충돌 줄은 결정을 좁히면 보충처럼 곁에 옮기고, 아니면 옮기지 않는다.
   **부분 적용(원장 관리 세션 판정, 2026-09-28).** 충돌 줄의 인용은 자리를 가리킬 뿐이고, 무엇이 뒤집히는지는 콜론 뒤의 규칙 문장이 말한다. 규칙이 이름을 바꾸거나, 더하거나, 좁히면 문장의 나머지는 현행이므로 남기고 규칙을 곁에 적는다. 규칙이 목록을 통째로 주면(VALUE-031 첫째 충돌, WRITE-074) 통째로 바꾼다. "이 항목의 …로 읽는다" 모양의 충돌 줄은 인용한 문장 하나가 아니라 항목 전체에 걸린다(VALUE-030, VALUE-037, NODE-058, NODE-041). 소유자 원문 인용 안에는 규칙 6을 적용하지 않고 이긴 규칙을 곁에 붙인다.
7. **상태.** `현행`, `현행(부정 결정)`, `현행(기록)`만 옮긴다. 부정 결정은 "…하지 않는다"로, 기록은 기록임을 밝혀 옮긴다. `대체됨`·`분할됨`·`중복`인 항목은 인용하지 않고, 잔여가 현행이라고 적힌 대체됨 항목과 `중복(→ X)`은 화살표의 대상 ID를 인용한다.
8. **귀속과 낡은 글귀.** 문장이 누가 정했는지 말할 때는 원장의 닫은 사람 칸의 글을 그대로 옮긴다. 결정문 안의 【추론】 표지는 그대로 둔다. 결정 원문에 "제안", "미수락", "확인 대기"처럼 확정 전 상태가 남은 현행 항목은 원문 뒤 괄호에 닫은 사람 칸의 확정 근거를 단다. 원장 관리 세션이 확인한 여섯은 다음과 같다.

   | 항목 | 옮기는 법 |
   | --- | --- |
   | PROCESS-052 | 원문 뒤 괄호에 확정 근거(`reviews/round-18-owner-answers.md:10`) |
   | PROCESS-062 | 반영 칸 문장("절 단위 통과는 새 설계문서에서만 한다. 08·09는 통과 절차 없이 백업으로 간다.")을 결정 곁에(5번) |
   | VALIDATE-026 | 반영 칸 문장이 규칙이다(`reviews/round-18-owner-answers.md:14`) |
   | TEST-028 | 소유자 요구의 인용은 그대로, "수치 예산은 아직 정해지지 않았다"는 TEST-073으로(6번) |
   | NODE-027 | 첫 문장은 NODE-047의 문장으로(6번), "제안은 끊지 않는 것이다"는 "끊지 않는다"와 확정 근거(`reviews/round-17-owner-answers.md:12`)로 |
   | GOAL-051 | "상태: 관찰 + 대응(제안)."은 옛 문서의 상태 표기이므로 옮기지 않고 보고에 적는다. 규칙 문장만 옮긴다 |

   BLUEPRINT-049의 "뒤로 미루며, 나중에 풀어도 파괴적 변화가 아니다"는 낡은 글귀가 아니라 규칙이다. 그대로 옮긴다.
9. **union.** `reviews/raw-round18-union-swarm/merged-v3.md`는 union 절의 묶음과 순서를 정할 때만 참고한다. 문장은 원장의 결정 칸에서 옮기고, 원장에 없는 merged-v3의 문장은 옮기지 않는다(§6의 5).
10. **정하지 않은 이름.** EVENT-073의 명령 메서드 이름·명령 종류 값의 형·`FormHandle` 대칭 모양은 "PR-4 착수 전에 소유자가 정한다"로 적고 이름을 지어 넣지 않는다.
11. **새 주장 금지.** 원장에 없는 문장을 만들지 않는다(PROCESS-050). 원장에 없는 글은 머리말과 개요의 제목뿐이다. 새 문서에서 원장의 결함을 찾으면 문서에서 고치지 않고 이 기록 §6에 적고 원장 관리 세션에 묻는다.

### 2.3 개요와 나눠 쓰기

- 문서마다 먼저 개요 `design-parts/<doc>-outline.tsv`(세션 scratchpad, 커밋하지 않음)를 만든다. 열은 절 번호(`n.m`), 절 제목, 이 절이 집인 항목 ID(쉼표, 읽는 순서)다. 문서 영역의 현행 항목은 정확히 한 절을 집으로 가진다.
- 개요 검사: scratchpad의 node 스크립트가 `lib.mjs`의 `readLedgers`로 영역의 현행 ID 집합을 만들고, 개요 셋째 열의 ID가 그 집합과 같으며 한 번씩만 나오는지 보고 `outline ok`를 찍는다. 같은 스크립트가 조각마다 브리프 부록을 뽑는다: 규칙 6에 해당하는 항목과 그 충돌 줄, 규칙 4의 현행 아닌 ID가 든 자리(결정·보충·충돌), 규칙 8의 낡은 글귀 항목.
- 나눠 쓰기: 이어진 절을 묶어, 집인 항목의 결정·보충 원문이 약 20,000자 이하인 조각으로 나눈다. 조각마다 opus 에이전트 하나가 그 절들을 `design-parts/<doc>-<nn>.txt`에 쓴다(파일 도구가 막히면 Bash로 쓴다). 항목의 결정 문장과 표 행은 모두 집인 절에 있어야 하고, 다른 절은 그 ID를 가리킴으로만 인용한다.
- 조각마다 verifier 하나가 두 방향으로 본다. 문서 → 원장: 문장마다 인용한 항목의 결정·보충·이긴 충돌과 조건·예외·수량·순서가 같은가, 원장에 없는 주장이 없는가, 진 충돌을 옮기지 않았는가, 약어가 없는가. 원장 → 문서: 개요의 항목마다 결정 문장, 표 행, 옮겨야 할 보충이 집인 절에 모두 있는가.

### 2.4 ADR의 모양

- 파일은 `architecture/adr/`에 둔다. 0001–0014는 옛 파일 이름을 그대로 쓰고(옛 주제 단위 유지), 새 번호는 `0015-union-leaf.md`, `0016-fill-timing-and-full-replace-write.md`, `0017-narrowing-intersection.md`다. U6에서는 `adr-next/`에 쓰고 U8에서 `adr/`로 옮긴다.
- 소속: 0001–0014는 출처 칸의 위치 가운데 하나라도 그 옛 ADR 파일을 인용하는 현행 항목(영역 제한 없음)이다. 한 항목이 여러 ADR에 들 수 있다. 원장 관리 세션의 실측 수는 0001 13, 0002 37, 0003 54, 0004 25, 0005 28, 0006 23, 0007 36, 0008 48, 0009 17, 0010 11, 0011 23, 0012 4, 0013 27, 0014 143이다. 0015는 BLUEPRINT-036·038·040–051, NODE-057·058·059, WRITE-093·098·099, VALUE-037, SURFACE-061, REACT-032·033, LANDING-207·208, TEST-079. 0016은 WRITE-090·094…097, EVENT-071·072, ERROR-204. 0017은 BLUEPRINT-041·044, WRITE-098·099.
- 절: `# ADR 00NN — <주제>`. `## 상태`는 표만 둔다(`| 항목 | 닫은 사람 | 라운드 |`, 행은 소속 항목마다 원장 칸 그대로, 첫 칸이 ID). `## 결정`은 소속 항목의 집인 절 글을 설계문서에서 그대로 가져와 설계문서의 순서로 놓고, 가져온 절마다 `### <design 파일> §n.m <절 제목>`을 단다. `## 설계문서`는 `` `design/<파일>` §n.m (ID, …) `` 줄들이다. 맥락과 결과는 소속 항목(원리·목표·이주·시험 항목)이 들므로 따로 새 문장을 만들지 않는다. 변경 이력은 두지 않는다(이력은 `reviews/`와 git).
- ADR 0010은 현행 결정까지만 옮긴다. 최종화는 PR-8의 일이다(LANDING-068).

### 2.5 `doc-coverage.mjs` 명세

- 사용: `node ledger/checks/doc-coverage.mjs [--areas A,B,…] [--exempt <tsv>] <doc.md…> -- <ledger.md…>`, `architecture/`에서. `--exempt`의 기본값은 `ledger/checks/doc-token-exempt.tsv`이고, 파일이 없으면 빈 목록이다. 없는 문서 경로는 `missing doc <path>`로 문제에 센다. 형제 검사처럼 문제 줄을 찍고 끝에 요약 한 줄을 찍는다: `docs N, items in scope M, uncited A, bad ids B, missing tokens C, untagged sentences D, stale exemptions E, problems P`(P는 앞의 문제 수와 missing doc의 합).
- 원장은 `readLedgers`로 읽고, 현행은 상태가 `현행`으로 시작하는 항목이다. `--areas`는 (ㄱ)·(ㄷ)의 범위를 그 영역 접두어로 좁힌다. (ㄴ)은 늘 전체 원장으로 본다.
- 문서의 본문은 `## 소유자 통과`가 아닌 첫 `## ` 제목부터다. ID는 `\b[A-Z]{4,9}-\d{3}\b`로 찾는다(`plan-links.mjs`와 같음). 절은 `##`·`###` 제목 줄부터 다음 `##`·`###` 제목 전까지다.
- (ㄱ) 인용 누락: 범위 안의 현행 항목마다 어느 문서의 본문이 그 ID를 인용해야 한다. `uncited <ID> <제목>`.
- (ㄴ) 인용 ID: 문서 전체(머리와 코드 블록 포함)의 ID가 원장에 있고 현행이어야 한다. `<doc>:<줄> <ID> does not exist` 또는 `is not in force (<상태>)`.
- (ㄷ) 토큰: 범위 안의 현행 항목마다 결정 칸의 토큰(`TOKEN_PATTERNS`의 `code`·`errorCode`·`id`·`number`)이, 그 ID를 인용하는 모든 절을 합친 글 어딘가에 그대로 있어야 한다. 인용하는 절이 없는 항목은 (ㄱ)에서만 세고 (ㄷ)에서는 세지 않는다. `code` 가운데 `^(0\d-[^`]*\.md|open-questions\.md|adr/\d{4}-[^`]*|reviews/[^`]*|HANDOFF\.md|README\.md)(:[\d,#-]+)?$` 또는 `^:\d[\d,#-]*$`에 맞는 옛 문서 가리킴만 뺀다. 예외 파일의 열은 ID, 토큰, 까닭이며 까닭은 `이긴 충돌 …`, `가리킴 바꿈 …`, 또는 `정비 문장 …`(규칙 4 표의 첫째·둘째 행 항목만)으로 시작한다. verifier가 예외 행마다 그 까닭이 원장과 규칙 4 표에 맞는지 대조한다. 범위 안의 예외 행이 빠지지 않은 쌍을 적으면 `stale exemption`, 범위 밖 행은 무시한다. `missing token <ID> <kind> <token>`.
- (ㄹ) 문장 ID: 본문에서 제목 줄, 빈 줄, 코드 블록 안을 빼고, 인라인 코드와 큰따옴표 인용("…", “…”)을 가린 뒤 `splitSentences`로 나눈 문장마다 ID가 하나 이상 있어야 한다(인용 안의 `?`·`!`에서 문장이 갈리지 않게 한다; 공용 `splitSentences`는 바꾸지 않는다). 표의 행은 그 행에 ID가 있거나, 표 앞에서 가장 가까운 비어 있지 않은 표 밖 줄에 ID가 있으면 통과한다. 표의 머리 행과 구분 행은 그 표의 본문 행이 모두 ID를 가지면 통과한다(ADR `## 상태` 표). 굵은 표지 문장은 ID를 빈칸 없이 붙인다: `**진입 사슬.**(ERROR-001)`. `<doc>:<줄> untagged: <앞 60자>`.
- 보강(U1 검증에서): 코드 블록 안의 `## `·`### ` 줄은 절 경계가 아니다. `--areas`에 원장에 없는 영역 접두어가 있으면 usage 오류(exit 2)다. 예외 행의 ID가 원장에 없거나 현행이 아니면, 또는 까닭이 세 접두어 다음에 빈칸이나 줄 끝이 오지 않으면 `bad exemption`으로 센다. 새 픽스처 `edge.md`가 이 경우들과 인용·표 머리·굵은 표지를 덮는다(게이트 G37).
- 토큰 패턴은 `tokens.mjs`에서 `lib.mjs`의 `export const TOKEN_PATTERNS`로 옮기고 `tokens.mjs`가 그것을 가져온다. `tokens.mjs`의 출력은 바뀌지 않아야 한다(20라운드 뒤 기준 2509·488).
- 픽스처(`ledger/checks/fixtures/doc-coverage/`에 커밋해 게이트 G5·G6이 어느 세션에서나 다시 돌게 한다; 아래에서 항목은 접두어 `FIXT`와 번호로 부르며 실제 파일에는 하이픈 꼴 ID로 적는다): 원장 `ledger.md`에 FIXT 001(현행, 결정 "`alpha` 값은 3회 쓴다."), FIXT 002(현행, 결정 "`beta`를 쓴다."), FIXT 003(대체됨, → FIXT 001). 문서 `bad.md`의 본문 절 하나가 FIXT 001을 인용하되 `alpha`와 `3회`가 없고, 한 문장이 FIXT 003을 인용하고, 한 문장은 ID가 없으며, FIXT 002는 인용하지 않는다. `--exempt absent.tsv`(없는 파일)로 돌린 기대: `uncited 1, bad ids 1, missing tokens 2, untagged sentences 1, stale exemptions 0, problems 5`. 고친 `good.md`는 `problems 0`. `good.md`에서 빠지지 않은 쌍 하나를 적은 `stale.tsv`를 `--exempt`로 주면 `stale exemptions 1, problems 1`.

### 2.6 이 기록의 표기

이 기록은 `plan-links.mjs`가 읽는다. 현행이 아닌 ID는 하이픈 없이 적는다(예: "BLUEPRINT 037").

## 3. 작업 단위

**게이트.** 단위의 끝은 게이트로만 말한다. 게이트 원장은 저장소 루트의 `.seiri/tasks/schema-form-01-design-docs/gates.md`(G1–G37, git이 무시하는 경로)이며, 게이트마다 결과 문장, 저장소 루트에서 도는 `CHECK`, 성공할 때만 찍히는 `EXPECT`가 있다. 단위별로 U0 G1–G3, U1 G4–G8, U1b G37, U2 G9–G12, U3 G13–G15, U4 G16–G18, U5 G19–G22, U6 G23–G25, U7 G26–G27, U8 G28–G31, 마지막 G32–G36이다. 사람이나 verifier가 판정하는 게이트(G8·G10·G12·G14·G17·G21·G24·G27·G36)는 판정 결과를 증거로 적는다. 72시간 동안 손대지 않으면 원장이 지워지므로 게이트의 결과는 §5에도 적는다. codex·opus·worker의 브리프에는 그 단위의 게이트를 `CHECK`·`EXPECT` 그대로 넣고, "게이트를 고치지 말고, 끝났다는 말은 `CHECK`를 돌려 `EXPECT`가 찍힌 출력으로만 하라"를 넣는다.

| 단위 | 산출물 | 검증 | 위험 | 원장 ID | 실행 |
| --- | --- | --- | --- | --- | --- |
| U0 | `PLAN.md` §3 01 `진행`, §5 한 줄, 이 `log.md` | `plan-links` 0 | 이 기록이 현행 아닌 ID를 인용 | PROCESS-067 | 이 세션 |
| U1 | `doc-coverage.mjs`, `lib.mjs`의 `TOKEN_PATTERNS`, `tokens.mjs` 가져오기 | 픽스처 기대값, `tokens.mjs` 출력 불변, 기존 검사 0 | 명세의 빈칸 | PROCESS-051, LANDING-060 | codex → verifier |
| U2 | `design/02-node-and-value.md` | 개요 `outline ok`, `--areas NODE,VALUE,WRITE` 0, 조각마다 verifier PASS, **소유자의 절 구성 확인** | WRITE 46k자 | NODE, VALUE, WRITE 영역, PROCESS-007, PROCESS-023 | opus(개요 하나 + 조각 다섯 남짓) → verifier |
| U3 | `design/01-schema-to-blueprint.md`, `design/03-settle-and-events.md` | 같음 | union 절의 묶음 | SCHEMA, BLUEPRINT, FRAGMENT, SETTLE, EVENT 영역 | 같음 |
| U4 | `design/05-validation-and-errors.md`, `design/04-controls.md` | 같음 | ERROR 65k자 | VALIDATE, ERROR, CONTROLS 영역 | 같음 |
| U5 | `design/06-react-and-surface.md`, `design/07-landing-and-tests.md`, `design/00-goals-and-values.md` | 같음, 끝에 `design/*.md` 전체 0 | LANDING 61k·TEST 58k자, EVENT-073 이름 | REACT, SURFACE, LANDING, TEST, GOAL, PROCESS 영역 | 같음 |
| U6 | `adr-next/` 아래 새 ADR 0001–0017 | `design/*.md adr-next/*.md` 0, verifier PASS | 소속 목록 | PROCESS-061, LANDING-068 | opus 넷 → verifier |
| U7 | `reviews/raw-design-docs-check.md`, 거른 지적의 고침 | 거른 뒤 새 지적 0(최대 세 차례) | 외부 전송이 자동 승인 검토에 막힘 | PROCESS-051 | codex·antigravity → verifier → worker |
| U8 | `_archive/<날짜>/` 이동과 README, `adr-next` → `adr`, `lib.mjs`의 `ARCHIVE_ROOT`, HANDOFF §1·§4·§5, `architecture/README.md`, `token-review.md` 판정, 단계 검증, PR, `PLAN.md` §3 `리뷰` | HANDOFF §4 명령 전부 0, `design/*.md adr/*.md` 0, `verification.md` 게이트 | 토큰 잔여 변화 | PROCESS-052, PROCESS-061, LANDING-204 | worker → verifier, 이 세션 |

순서의 까닭: PROCESS-061("원장에서 ADR과 설계문서를 쓰고 3의 검사를 한 번 더 거친다. 통과한 뒤에 옛 문서를 백업 디렉토리로 옮긴다.")의 "3의 검사"는 세 겹 (가)·(나)·(다)다. 그래서 설계문서(U2–U5)와 ADR(U6)을 쓰고, 해상도 대조(U7)까지 통과한 뒤에 옛 문서를 옮긴다(U8). 새 ADR은 옛 ADR과 같은 파일 이름이므로 U8까지 `adr-next/`에 둔다.

### U0 — 착수 기록

1. 이 파일과 `PLAN.md`(§3 01 행을 `진행`, §5에 "01 착수" 한 줄)를 고친다.
2. `node ledger/checks/plan-links.mjs plan/*.md plan/*/*.md -- ledger/*.md` → `problems 0`.
3. 커밋 `docs(schema-form): start stage 01 design docs`.

### U1 — 역검사 도구

1. codex 브리프: §2.5 명세와 픽스처, 형제 스크립트(`plan-links.mjs`, `tokens.mjs`, `lib.mjs`)의 모양을 따를 것, 게이트 G4–G6의 `CHECK`를 돌려 `EXPECT`가 찍힌 출력으로 끝을 보고할 것, 게이트를 고치지 말 것, 커밋하지 말 것, 결정이 필요하면 멈추고 보고할 것.
2. 기대 결과(`architecture/`에서):
   - `node ledger/checks/tokens.mjs inventory $TMPDIR/inv.json 0*.md open-questions.md adr/*.md README.md HANDOFF.md` → `{"distinctTokens":2509,"byKind":{"code":2091,"id":211,"number":176,"errorCode":31}}`(20라운드 뒤), 이어서 `node ledger/checks/tokens.mjs check $TMPDIR/inv.json ledger/*.md | head -1` → `{"total":2509,"missing":488}`.
   - §2.5의 픽스처 기대값 셋.
   - HANDOFF §4의 기존 명령 전부 0.
3. verifier가 명세 대조와 위 결과를 재현한다. 커밋 `feat(schema-form): add the doc-coverage reverse check`. HANDOFF §4의 검사 줄은 백업 이동 뒤(U8)에 넣는다. 그 전에는 옛 `adr/`가 있어 0이 될 수 없다.

### U2 — `design/02-node-and-value.md` (시범)

1. 개요(opus 하나): §2.1–§2.3을 읽고 NODE·VALUE·WRITE의 현행 항목을 절로 묶은 `design-parts/02-outline.tsv`와 조각 나눔을 낸다. 개요 검사 → `outline ok`.
2. 조각 작성(opus, 조각마다 하나, 병렬): 입력은 이 기록 §2, 자기 조각의 개요 행, 원장 파일이다. 출력은 `design-parts/02-<nn>.txt`와 옮기지 못한 가리킴·원장 결함의 보고다.
3. 조립: 머리(제목 `# 02 노드와 값`, 머리말, 통과 표)를 쓰고 조각을 이어 `design/02-node-and-value.md`를 만든다.
4. `node ledger/checks/doc-coverage.mjs --areas NODE,VALUE,WRITE design/02-node-and-value.md -- ledger/*.md` → `problems 0`. 잔여는 그 조각의 작성 에이전트에게 되돌린다.
5. 조각마다 verifier(§2.3의 두 방향). FAIL이면 고침 명세를 worker가 적용하고 다시 검증한다. 같은 조각이 세 번 FAIL이면 멈춘다.
6. 커밋 `docs(schema-form): write design/02 node and value`. **멈추고 소유자에게 절 구성(개요)과 형식을 묻는다**(착수 전 확인 2). §6의 4가 원장에서 닫히지 않았으면 같은 자리에서 권장안과 함께 묻는다. 답에 따라 §2를 고치고 나머지 단위를 잇는다.

### U3–U5 — 나머지 일곱 편

- U2의 1–5를 문서마다 되풀이한다. 순서는 01 → 03 → 05 → 04 → 06 → 07 → 00(`request.md`의 통과 순서). 제목은 `# 00 목표와 가치`, `# 01 스키마에서 청사진까지`, `# 03 정착과 통지`, `# 04 제어`, `# 05 검증과 오류`, `# 06 React와 공개 표면`, `# 07 이주·착수와 시험`.
- U5의 끝에서 `node ledger/checks/doc-coverage.mjs design/*.md -- ledger/*.md` → `problems 0`(전체 범위).
- 커밋: `docs(schema-form): write design/01 and design/03`, `… design/05 and design/04`, `… design/06, design/07 and design/00`.

### U6 — 새 ADR

1. 소속 목록: scratchpad의 node 스크립트가 §2.4의 규칙으로 ADR마다 ID 목록을 뽑고, 수가 §2.4의 실측과 같은지 확인한다.
2. 작성(opus 넷, ADR을 나눠 맡음): §2.4대로 `architecture/adr-next/<파일 이름>`에 쓴다.
3. `node ledger/checks/doc-coverage.mjs design/*.md adr-next/*.md -- ledger/*.md` → `problems 0`.
4. verifier: 소속이 목록과 같은가, `## 결정`의 글이 설계문서의 같은 절 글과 같은가, `## 상태` 표가 원장 칸 그대로인가.
5. 커밋 `docs(schema-form): write the new ADR 0001-0017 from the ledger`.

### U7 — 해상도 대조

1. codex와 antigravity에 같은 지시서를 보낸다: 브랜치, `design/*.md`·`adr-next/*.md`·`ledger/*.md` 경로, 찾을 것 다섯(원장에 없는 주장, 뒤집힌 현행 결정, 요약으로 바뀐 뜻, 진 충돌을 옮김, 빠진 보충), 양식 `F<n> <높음|중간|낮음>`, 두 위치(문서 `path:line`, 원장 ID와 줄), 원문 인용, 왜, 제안. 크기가 넘치면 문서 묶음 넷({00,07}, {01,04}, {02,03}, {05,06}+ADR)으로 나눈다.
2. verifier가 원문과 대조해 거른다. 원장이 틀렸다는 지적은 소유자에게 올린다.
3. worker가 고침을 적용하고 `doc-coverage`를 다시 돌린다. 고친 절을 가져간 `adr-next/`의 같은 `### <design 파일> §n.m` 블록도 함께 고치고, scratchpad 스크립트로 두 글이 같은지 확인한다. 원문·판정·고침을 차례마다 `reviews/raw-design-docs-check.md`에 적는다(선례 `reviews/raw-round18-final-check.md`).
4. 거른 새 지적이 0이 될 때까지 같은 지시서로 다시 보낸다(PROCESS-051 (다), §6의 7). 세 차례를 넘으면 멈추고 묻는다. 커밋은 차례마다 `docs(schema-form): record design docs resolution check round <n>`.
5. 외부 전송이 자동 승인 검토에 막히면 우회하지 않고 기록해 소유자에게 알린다.

### U8 — 백업 이동, 마무리, PR

1. 이동(worker, `<D>`는 실행일 `YYYY-MM-DD`로 바꿔 적음): `mkdir -p _archive/<D>/adr && git mv 0?-*.md open-questions.md _archive/<D>/ && git mv adr/*.md _archive/<D>/adr/ && git mv adr-next/*.md adr/`. 디렉토리째 옮기지 않는 까닭: `adr/.claude/.cc-writes`(추적하지 않는 빈 훅 디렉토리)가 함께 옮겨지거나 샌드박스에 막힐 수 있다. 끝나면 `git ls-files adr-next`가 비어 있어야 한다.
2. `_archive/<D>/README.md`: "동결됐다. 정본은 `ledger/`, 읽는 표면은 `design/`, 인용은 커밋 `ba398c330`의 줄 번호"와 담긴 파일 목록.
3. `lib.mjs`: `export const ARCHIVE_ROOT = '_archive/<D>';`. `docReader`는 경로가 `^(0\d-[^/]+\.md|open-questions\.md|adr/.+)$`에 맞고 `path.join(root, ARCHIVE_ROOT, rel)`이 있으면 그것을 읽는다. `bundle.mjs`는 기준 커밋으로 되돌아가 읽지 않고, 같은 이름의 새 ADR이 옛 인용을 가로채므로 필요하다.
4. HANDOFF(원장 관리 세션과 나눔: §1의 항목 수·현행 수·라운드 글머리와 §4의 검사 기준값, 토큰 잔여의 판정은 원장 관리 세션이 소유한다 — 바뀌어야 하면 커밋 해시와 함께 알리고 그쪽이 고친다): §4의 토큰 목록 명령을 `node ledger/checks/tokens.mjs inventory $TMPDIR/inv.json _archive/<D>/0*.md _archive/<D>/open-questions.md _archive/<D>/adr/*.md README.md HANDOFF.md`로, `node ledger/checks/doc-coverage.mjs design/*.md adr/*.md -- ledger/*.md` 줄을 더하고, §5 파일 지도(`design/`, 새 `adr/`, `_archive/`, `doc-coverage.mjs`, `doc-token-exempt.tsv`)와 §1·§4의 토큰 잔여 수를 고친다. §2의 3·4번(ADR과 설계문서, 백업 이동)은 끝났다고 적고, 3번의 merged-v3 문장은 §6의 5대로 고치되 근거 "원장 결정 칸에서 옮긴다(PROCESS-050·051)"를 남긴다. `architecture/README.md`는 새 읽는 순서(PLAN → ledger → design → adr → plan → reviews → `_archive/`)로 고친다.
5. HANDOFF §4 명령 전부(`verification.md:11`의 "8종"은 HANDOFF §4 전부로 읽는다) → 0. 토큰 잔여가 바뀐 만큼은 `ledger/checks/token-review.md` 끝 절에 판정한다(HANDOFF·README의 자기 서술 토큰).
6. 커밋 `docs(schema-form): archive the frozen design documents and adopt the new ADRs`, `docs(schema-form): point HANDOFF and README at the design surface`.
7. 단계 검증(verifier): `verification.md`의 기계 검사 셋, 해상도 대조 기록, 리뷰 체크리스트.
8. push 뒤 `gh pr create`(단독 명령, 본문은 `--body-file`, base `1.0.0-beta`). 본문은 완료 기준 표, 리뷰 체크리스트, 검증 결과, 교차 확인 요약, §6의 어긋남 표. `PLAN.md` §3을 `리뷰`로, §4·§5 갱신, 같은 브랜치에 커밋·push.
9. 소유자에게 PR 링크, 어긋남 표, 열린 물음을 보고하고 멈춘다.

## 4. 위험과 대응

- 하위 에이전트의 `.md` 파일 쓰기가 훅에 막힐 수 있다(HANDOFF §6). 원고는 scratchpad의 `.txt`로 받고, 파일 도구가 막히면 Bash로 쓰게 한다. 원고를 메시지로 받지 않는다.
- 토큰 (ㄷ)의 예외는 이긴 충돌과 가리킴 바꿈만 허용한다. 예외 행마다 verifier가 원장의 충돌 줄이나 바뀐 가리킴과 대조한다.
- codex·antigravity가 `adr-next/`와 `design/`을 읽지 못하면 파일 목록을 인라인으로 넘긴다. codex는 세션 scratchpad를 읽지 못한다(HANDOFF §6).
- 멈추는 경우: 착수 전 확인 2(U2 뒤), 현행 원장 항목 둘의 어긋남이나 원장이 틀렸다는 판단, 같은 조각 세 번 FAIL, U7 세 차례 초과, 파괴적 작업, 범위 밖으로 번지는 일. 멈출 때는 §5에 까닭과 물음을 먼저 적는다.

## 5. 진행 기록

| 시각 | 단위 | 무엇 | 결과 |
| --- | --- | --- | --- |
| 2026-09-27 23:33 | — | 브랜치 생성, 원장 검사 전부 0, 원장 관리 세션 첫 회신 | 착수 전 확인 1 닫힘 |
| 2026-09-27 | — | 계획 작성, 1차 계획 검증(verifier `rework-required`, 원장 관리 세션 정합 검토) | 이 판에 반영 |
| 2026-09-28 | — | 2차 확인(verifier `rework-required` N1–N5, 원장 관리 세션: 규칙 4의 24쌍 풀이, 이긴 쪽 다섯과 §6 줄 번호 맞음) | 규칙 2·4·6, §2.3, (ㄷ), U7, U8, §6의 4·7에 반영 |
| 2026-09-28 | — | 3차 확인(verifier: 정비 문장 예외 두 줄), 게이트 원장 작성(G1–G36, 소유자 지시) | 계획 `cleared` |
| 2026-09-28 | — | 원장 관리 세션이 20라운드(PROCESS-068, 20C-01)를 커밋 `cd7f60c67`로 이 브랜치에 넣음(원장 파일 셋). 같은 작업 트리를 쓰므로, 이 뒤로 원장 관리 세션은 파일을 고치기 전에 알린다. 토큰 기준은 2509·488로 바뀌어 G4를 고쳤다 | 검사 전부 기준값 |
| 2026-09-28 | U1 | codex에 역검사 도구 위임(G4–G6을 브리프에 그대로) | codex 보고 뒤 이 세션이 G4–G6 재실행 |
| 2026-09-28 | U1 | verifier 1차 조건부 통과(명세 빈칸 둘: ADR 상태 표의 머리 행, 인용 안의 `?`·`!`; 낮음: 펜스 안 제목, 영역 오타, 예외 행 검사) → §2.5 보강과 G37 추가 → codex 고침 → verifier 재검증 PASS | G4·G5·G6·G37·G8·G7 충족, 커밋 `9938567e2` |
| 2026-09-28 | U2 | 개요(opus, 25절·6조각, `outline ok`) → 조각 작성 여섯(opus 병렬) → 조립(895줄) → 예외 21행을 `ledger/checks/doc-token-exempt.tsv`로 | G9 `DOC02_OK`; 조각 verifier 여섯 진행, 원장 물음 아홉을 원장 관리 세션에 |
| 2026-09-28 | — | **일시 정지(소유자 지시).** 소유자의 의도는 03이었고 이 세션은 규칙대로 01을 골랐다. 소유자가 새로 시작하기로 해 여기서 멈춘다. `design/02` 초안은 검증을 마치지 않은 채 커밋해 보존한다 | 아래 재개 메모 |
| 2026-09-28 | — | **재개(소유자 지시).** 재개 메모의 순서대로 잇는다. 원장 관리 세션이 `albatrion-96`으로 바뀌어, 보류된 충돌 줄 여섯 자리 쓰기와 새 원장 물음 넷(VALUE-027, VALUE-037, NODE-050, NODE-018)을 그쪽에 넘겼다 | U2 고침 적용 중 |
| 2026-09-28 | U2 | 고침 1차(opus: 조각 01·03 FAIL 여섯, 원장 판정 아홉) → 조각 verifier 2차 다섯(02·04·05 FAIL, 06 조건부, 01·03 재확인 FAIL) → 고침 2차(worker, 약 스물다섯) → 원장 관리 세션 판정 열다섯과 21라운드(WRITE-100) → 고침 3차(이 세션) → 재확인 verifier PASS | G9 `DOC02_OK`(149항목), G10 충족 |
| 2026-09-28 | U2 | WRITE-100의 게이트 줄은 원장 관리 세션이 "시험 문서 몫"이라 했으나 `design/02`에 싣는다: 게이트 줄은 결정이고(`HANDOFF.md` §3), 규칙 2는 결정 문장을 모두 옮기며, 같은 문서의 게이트를 가진 다른 열두 항목도 실었다 | 원장 관리 세션에 알림 |
| 2026-09-28 | U2 | **멈춤(착수 전 확인 2, G12).** 소유자에게 묻는 것: (1) `design/02`의 절 구성(3장 25절)과 형식(문장 끝 원장 ID, 규칙 6 부분 적용, 게이트 줄 수록, 통과 표는 `###` 절마다), (2) U3부터의 분담을 codex 작성·antigravity 전수 대조·opus verifier 판정으로 바꾸는 안 | 답을 기다림 |

### 재개 메모 (2026-09-28, U2 중간)

- 상태: G1–G9·G37 충족, G10(조각 verifier) 미완. 조각 01·03은 FAIL(고침 여섯, 아래), 조각 02·04·05·06의 verifier는 중지돼 결과가 없다. 원장 충돌 줄 여섯 자리 추가(WRITE-056 둘, WRITE-051, WRITE-005, WRITE-015, NODE-015 둘, VALUE-002 꼬리)는 원장 관리 세션이 이 세션의 신호를 기다리며 보류 중이었다.
- 조각 01 고침: NODE-050 "내부 통로는 core만 쓰는 호스트에 열지 않는다" → "열지 않는다"(제목에서 가져온 글); NODE-015 "이름을 유지하는 규칙은 그대로다"의 NODE-041 인용 제거; NODE-008 둘째 문장에 지어 넣은 "나눈 fractal은 … 다" 틀 제거.
- 조각 03 고침: VALUE-014 셀 "2.7 µs" 뒤 지워진 측정 출처를 (TEST-036)으로; "열린 물음 Q14(`emit`의 키 순서)" → "Q14"(Q14는 SETTLE-042가 닫음); VALUE-037의 원장 정비 문장("VALUE-030의 … 로 고친다") 제거.
- 원장 관리 세션 답(물음 아홉): 규칙 6의 부분 적용은 맞는 읽기(뒤집는 범위는 충돌 줄의 콜론 뒤). 단 VALUE-031 첫째 충돌은 목록 전체라 "길은 셋"으로(VALUE-031, WRITE-090, WRITE-094). 문서 고침: WRITE-056 부르는 쪽에 기본 union 입력(REACT-033), WRITE-051 "로드와 전체 교체 쓰기에서만"(SETTLE-047), WRITE-005·WRITE-015 목록에 포커스 아웃 `trim` 쓰기(WRITE-078), NODE-015 "나머지 아홉 가운데 일곱"·"공개 가드 열"(NODE-041), NODE-031 문장에 ERROR-185 함께, VALUE-002 표에 경고등 계산 행과 "칸은 열하나"(VALUE-030, WRITE-054, SURFACE-061), WRITE-010 뒤에 WRITE-082, NODE-056 셋째 문장의 근거를 BLUEPRINT-042로.
- 새 원장 물음(미전송): VALUE-027 반영 칸의 `getInactiveValues(path)`에 충돌 줄 없음; VALUE-037의 정비 문장 분류; NODE-050 결정의 목적어가 제목에만 있음; NODE-018 "행은 종류마다 하나"(object·array는 행이 둘).
- 재개 순서: 위 고침 적용 → 조각 02·04·05·06 verifier(두 방향) → 고침 → G10 → 커밋(G11) → 소유자에게 절 구성 확인(G12). 작업 보조(개요 TSV, 조각 원고, 브리프, 부록 도구)는 이 세션 scratchpad에만 있었으므로 필요하면 §2.3대로 다시 만든다.

## 6. 어긋남

| # | 어디(파일:줄) | 무엇 | 현행 원장(ID와 줄) | 어떻게 했다 |
| --- | --- | --- | --- | --- |
| 1 | `adr-and-axes.md:21`, `request.md:18` | ADR 0015의 항목 범위 BLUEPRINT-036…047이 19라운드에 분할된 037·039를 담고, 19라운드의 새 항목이 없다 | BLUEPRINT 037 → BLUEPRINT-050·051, BLUEPRINT 039 → BLUEPRINT-048·049(`ledger/blueprint.md`), 19라운드의 NODE-059, LANDING-207·208, TEST-079 | 0015는 §2.4의 현행 목록으로 쓴다 |
| 2 | `adr-and-axes.md:26` | GOAL-086 표를 그대로 옮기라 하나, 첫 행의 "재채움(로드는 새 수명)"은 충돌 줄에서 진 쪽이다 | GOAL-086 충돌 줄(`ledger/goal.md:1243`), 소유자 답이 이김(r18:26, WRITE-090) | 그 칸을 WRITE-090의 현행 결정으로 적는다(§2.2의 6) |
| 3 | `request.md:19` 대 `HANDOFF.md:36` | 역검사의 방향이 반대다(계획서는 원장→문서, HANDOFF는 문서→원장) | PROCESS-051 (나)(`ledger/process.md:734`) | 두 방향 모두: (ㄱ)(ㄴ)(ㄷ)에 (ㄹ) 문장마다 ID를 더한다(§2.5) |
| 4 | PROCESS-023(`ledger/process.md:375`) | 결정문이 옛 표기("원장 §n", "ADR 00nn", "07 n.n")를 규칙으로 든다. 새 문서의 근거는 원장 ID다. 표기를 바꾸는 것은 가리킴 바꿈이 아니라 규칙의 변경이라 문서가 원장을 앞설 수 없다(`verification.md:23`, `adr-and-axes.md:31`) | PROCESS-023, PROCESS-050 | 원장 관리 세션이 20라운드 편집자 결정으로 닫았다(2026-09-28): PROCESS-068(새 설계문서와 ADR의 근거는 문장 끝 괄호 안에 원장 ID), PROCESS-023에 보충 둘과 충돌 줄(20라운드 결정이 이김), 정본 `reviews/round-20-closing.md` 20C-01. 문서는 규칙 6대로 따른다 |
| 5 | `request.md:17` | "union의 설계문서는 merged-v3.md를 원장 번호로 바꿔 쓴다"(HANDOFF §2 3번 인용). merged-v3의 문장 692개 가운데 원장에 그대로 있는 것은 16개이고, 원장은 merged-v3를 인용하지 않는다 | PROCESS-050, PROCESS-051 (가) | merged-v3는 묶음과 순서만 참고하고 문장은 결정 칸에서 옮긴다(§2.2의 9) |
| 6 | `adr-and-axes.md:20` | ADR마다의 항목 수(0003 → CONTROLS 55 등)가 어느 규칙으로도 재현되지 않는다 | 원장에 ADR 소속을 정한 항목 없음, `ledger/README.md:65`(출처의 정의) | 출처 칸의 어느 위치든 그 ADR을 인용하는 현행 항목으로 뽑는다(§2.4) |
| 7 | `verification.md:17` | 해상도 대조를 "한 번 돌린다" | PROCESS-051 (다) "새로 나오지 않을 때까지 찾는다", PROCESS-061 | 거른 새 지적이 0이 될 때까지. 세 차례는 끝이 아니라 멈춰 소유자에게 묻는 자리다(원장 문구가 이긴다) |
| 8 | `ledger/write.md`, `ledger/node.md`, `ledger/value.md` | 설계문서 02를 쓰며 원장의 반영 누락 여덟을 찾음: 충돌 줄이 빠진 WRITE-056(둘)·WRITE-051·WRITE-005·WRITE-015·NODE-015(둘)·VALUE-027, VALUE-002 충돌 줄의 이긴 쪽, NODE-050 결정의 목적어 | 이미 있던 결정(18C-40·92·95, 소유자 답 12행, NODE-041, VALUE-029, 18C-48)의 반영 누락 | 원장 관리 세션이 충돌 줄·보충으로 채움(커밋 `1220ea9ad`, 새 라운드 없음). 문서는 그 줄대로 |
| 9 | `ledger/blueprint.md`, `ledger/node.md`, `ledger/validate.md`, `ledger/write.md`, `ledger/value.md` | 가칭 `union` 표기의 풂이 빠진 충돌 줄(BLUEPRINT-032·043, NODE-041), NODE-041의 이름 충돌 줄, VALIDATE-048의 18C-101 보충이 18C-105에 진 것, WRITE-095 게이트의 "위 실패 장면"이 결정 칸에 없음, VALUE-002 충돌 줄의 이긴 쪽 | BLUEPRINT-035, SURFACE-061, WRITE-099, 18C-97 | 원장 관리 세션이 채움(커밋 `f7950ffa1`) |
| 10 | `ledger/write.md` WRITE-015 둘째 충돌 | 호출 수준 억제 비트가 뒤이은 포커스 아웃 `trim`을 막는지 원장이 정하지 않음 | WRITE-015, WRITE-078, WRITE-091에서 유도 | 21라운드 편집자 결정 WRITE-100(`reviews/round-21-closing.md` 21C-01, 소유자 물음 아님)으로 닫힘. 문서 §3.10에 규칙과 게이트 |
