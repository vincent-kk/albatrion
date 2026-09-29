# 03 노드 트리와 정착 — 실행 기록

Planning method: 저장소 지침 — `PLAN.md` §2와 `plan/prompts.md`의 단계 실행 절차, 소유자의 오케스트레이터 실행 요청(2026-09-29). 단위마다의 단계·명령·기대 결과는 seiri `write-plan`의 불변식으로 채운다. 실행 계획은 [execution-plan.md](execution-plan.md), 게이트 원장은 `.seiri/tasks/schema-form-03-node-and-settle/gates.md`.

정본의 순서: 원장 `ledger/<area>.md` > 계획서 `request.md`·`adr-and-axes.md`·`verification.md` > 실행 계획 > 이 기록. 이 기록이 원장과 다르면 원장대로 가고 §4에 적는다. 26차 새 원장 보충을 따르기 위해 계획서 문장 세 곳만 좁혀 고쳤다(§4).

## 0. 머리

- 선출 이유: `PLAN.md` §3에서 `진행`인 단계가 없고, 보정 PR #349가 실제로 머지되어(`85e7d01af`, 2026-09-29 10:28Z) §4 다음 할 일의 첫 실행 가능 단계가 03이 됐다. 01 절 단위 통과는 소유자의 일이고, D-1은 05만 막는다. 소유자가 03 착수를 승인했다(2026-09-29).
- 브랜치 `feat/schema-form-node-and-settle`, base와 PR base `1.0.0-beta`(`85e7d01af`).
- 원장 질의는 원장 관리 세션 `albatrion-f8`로 보낸다(소유자 지시, 2026-09-29).
- 착수 전 확인(`request.md`): LANDING-062의 안건과 노드 구조는 18라운드가 닫음, 명령 메서드(EVENT-073)는 05 몫이라 겉면 시험은 그 자리를 비움. 막는 소유자 결정 없음.

## 1. 최초 작업 기준선

| 원문 | 리비전 | sha256(앞 16자) |
| --- | --- | --- |
| `plan/03-node-and-settle/request.md` | `85e7d01af` | `74356a3a34c48bec` |
| `plan/03-node-and-settle/adr-and-axes.md` | `85e7d01af` | `d5eb4307d93b665a` |
| `plan/03-node-and-settle/verification.md` | `85e7d01af` | `d97ace6fbac1e3e9` |
| `ledger/*.md` | `85e7d01af` | 커밋으로 고정 |

- 목표: 상속 없는 단일 클래스 `SchemaNode`와 동작 행, `raw`·`extras` 둘뿐인 상태, 정착 루프(표시·계산·전이·커밋)와 예산·원본 B, `diagnostics`(LANDING-062).
- 비목표: `if`의 실제 `compileGuard` 연결(05), 파생(04), 상태 키·제어(04), 통지·검증(05), 배열 행(06), 렌더·공개 전환(07), 명령 메서드(05, EVENT-073). 판별 게이트와 노드·조각 `controls.active`의 실제 평가는 03의 몫이다(26C-04).
- 산출물·완료 기준·게이트: `request.md` "산출물과 완료 기준", `verification.md` 전체. 원장 ID 목록은 두 문서의 "원장 항목 색인".

## 2. 진행

| 날짜 | 단계 | 무엇 | 근거 |
| --- | --- | --- | --- |
| 2026-09-29 | 착수 | 브랜치 생성, `PLAN.md` §3 보정 행 `머지`·03 행 `진행`, 이 기록 | `a0be6cc07` |
| 2026-09-29 | U0 | scout 둘로 02 코드 계약(청사진 수출·형, 레거시 이동 선례, 하네스, 벤치, filid 설정)과 프로토타입 회귀 묶음을 조사. 실행 계획·구조 결정·게이트 원장 초안 | [execution-plan](execution-plan.md), [execution-adr](execution-adr.md) |
| 2026-09-29 | U0 | 원장 관리 세션 `albatrion-f8`에 해석 확인 Q1–Q6 송신(겉면 스텁, 동사 진입, 렌더 시나리오 게이트, 뒤 PR 기제를 쓰는 게이트, 게이트 평가와 L, 형 충돌 신호) | 회신 대기 |
| 2026-09-29 | U0 | 소유자 지시: "codex와 agy를 활발하게 사용하면서 claude 자체 토큰 소비량을 억제하렴. 멀티에이전트 관리를 해주길 바라." 구현은 codex, 대조·리뷰는 antigravity, 조율·판정은 이 세션으로 배정(실행 계획 §4 머리) | 이 커밋 |
| 2026-09-29 | U0 | 계획 리뷰 1차(verifier, `1bd021cb1` 기준) `rework-required`. 높음 둘: H1 겉면 스텁이 TEST-069 (나)·EVENT-073·raw-round17:74와 어긋남, H2 `controls.active` 스텁이 TEST-069 (가)·(나)·LANDING-062·25C-06과 어긋남. 중간 여덟(M1 U1 import 목록 불완전 — 상대 import 37+8+1곳, 별칭 9파일, `stories`·`bench` 4파일; M2 TEST-069 (가) 의무 누락; M3 청사진 L의 담당·시험 없음; M4 벤치 실행 불가와 옛 엔진 기준선 시점; M5 U3∥U4 의존; M6 게이트·추적표 불일치; M7 §6.1 배분 오류; M8 원장 세션과 같은 체크아웃). 낮음 아홉. 리뷰어가 원장 관리 세션이 작업 트리에 쓰는 26라운드(26C-01~05, Q1–Q6의 답)를 확인함 | 이 기록 |
| 2026-09-29 | U0 | 원장 관리 세션 회신과 26라운드 커밋(`a6af7f8a3`, `reviews/round-26-closing.md` 26C-01~05, 보충 줄 48, 검사 전부 0). 판정은 아래 줄마다 적는다 | `a6af7f8a3` |
| 2026-09-29 | U0 재작업 | 1차 `rework-required`의 H1·H2, M1–M8, L1–L9와 고침 명세 1–11을 26C-01–05에 맞춰 실행 계획·구조 결정·게이트에 반영. 정본 계획서 세 문장은 새 원장 판정 때문에 고침(§4). 재리뷰 대기 | `plan-review.md`, `reviews/round-26-closing.md` |

- Q1(틀림, 26C-01): 멤버는 그 기제를 들여오는 PR에서 겉면에 들고, 그 PR이 DETAIL 목록·멤버 목록 시험·공개 형을 함께 고친다.
  - 이기는 원장: EVENT-063, LANDING-064·066, TEST-069 (나).
  - PR-2 겉면: `raw-round17-node-structure.md:74`의 PR-2 목록(식별·값 게터, `active`, `find`·`findNodes`, 가드, 생성, settle로 직접 위임하는 `setValue`)에 `raw`·`extras`·`diagnostics`·`SetValueOption`·`defaultValue`·`resetSubtree`와 경고등 게터 `typeMismatch`·`typeMismatches`(WRITE-093, 원장 `64160dcaa`)를 더한 것.
  - 뒤 PR의 멤버: 명령 메서드·`subscribe`·`validate`·오류 읽기·외부 오류 설정은 PR-4, 배열 메서드는 PR-5, 계산 게터는 PR-6.
  - TEST-070의 "배열 멤버" 형 검사는 PR-5.
  - `verification.md:26`을 26C-01로 고친다.
- Q2(맞음): TEST-069 "PR-2에서 사슬은 settle 호출 하나다", LANDING-064. NODE-010 보충에 정본 줄을 붙임.
- Q3(맞음, 26C-02): 코어 러너로 잰다.
  - `FormHandle.reset()`은 루트의 폼 수준 로드, `resetSubtree()`는 그 노드의 로드다. 제출 거부는 TEST-069 (다)로 PR-7.
  - 고침: ERROR-204의 경고 중복 키 단언은 PR-4다(ERROR-032, LANDING-064). PR-2는 `diagnostics` 초기화만 단언한다.
- Q4(맞음, 26C-03): 제안대로 나눈다. 미룬 단언은 log와 PR 본문에 사례마다 PR 번호를 단다.
- Q5(판별·`if` 맞음, `controls.active` 틀림, 26C-04):
  - 노드·조각 게이트의 `controls.active` 식은 PR-2가 `BlueprintExpression.evaluate`로 호스트 바퀴에서 실제로 평가한다(TEST-069 (가), LANDING-062, WRITE-099).
  - L은 PR-2가 청사진에 계산과 칸을 더한다. 청사진 시험에 세 규칙 사례를 둔다: `#`·`(/)`는 루트, `/p`·`#/p`는 p의 자리, `@`는 세지 않음.
- Q6(맞음, 26C-05): `EffectiveSchema { schema, typeConflict }`가 최종 모양이다.
  - `cause:'sharedConflict'`(ERROR-133), 사슬 끝·모든 환경(ERROR-070), `degraded`는 폼 수준 로드까지.
  - 주의: 정적 선언 없는 이름에서 fold가 다른 게이트 선언이 동시에 켜지는 경우(BLUEPRINT-044)는 `typeConflict`가 나르지 않는다. 정착이 켜진 선언 집합에서 따로 판정해 같은 코드로 낸다(26C-05).
| 2026-09-29 | U0 | codex 계획 수정(세션 `25d18ed4`, `f65cb79a8`), 원장 `64160dcaa`의 경고등 게터 둘을 겉면 목록에 더함, antigravity 2차 재검토와 조율 세션 판정 `cleared`(실행 계획 §9) | 이 커밋 |
| 2026-09-29 | U1 | 옛 엔진 최종 벤치 기준선을 이동 전에 조율 세션이 단독 호출로 잼(`yarn workspace @canard/schema-form bench:baseline`, `e5a6c8061`, 결과 `verification/03-node-and-settle/baseline/core-legacy-final.json`). codex(세션 `e986c241`)가 `src/core/DETAIL.md`를 먼저 고치고 407파일을 `__legacy__`로 옮기며 import를 수선함. unit 242파일·3,542시험, render 52파일·539시험이 이동 전후 같음. G2·G3·G23·G32 통과(조율 세션 재실행) | `8fa6b3f74`, `abc2a0c72`, `verification/03-node-and-settle/legacy-migration.md` |
| 2026-09-29 | U2 | codex(세션 `522bb905`)가 새 fractal 다섯과 종류 fractal 일곱의 INTENT·DETAIL, 청사진 DETAIL의 평가 자리 L 절(`BlueprintGate.evaluationHostPath`)을 먼저 씀. 코드 없음(`.md` 25파일만 확인). 칸 이름 `evaluationHostPath`는 조율 세션이 받아들임(SETTLE-045·26C-04, 형은 U5). G4 통과(조율 세션 실행). G5는 antigravity 대조 진행 중 | `3ee7e09f6` |
| 2026-09-29 | U2 | G5 1차(antigravity) FAIL: 차단 둘(런타임 `entryDepth`는 PR-4 기제, 런타임 칸 다섯의 원장 근거), 비차단 하나(objectBehavior DETAIL의 배열 행 문장 오기). 조율 판정: `entryDepth`·런타임 `rootNode` 삭제, 배열 행 문장 삭제를 받아들임. 나머지 넷(`loadSnapshot`·`latentRaw`·`typeMismatchPaths`·`inactiveValuesMemo`)은 원장 관리자 질의 → 26C-06으로 런타임 칸 확정(루트 전용 레코드 필드 없음). 문서 수정은 U3 codex가 코드보다 먼저 함 | 원장 `6330c8854` (`reviews/round-26-closing.md:61-70`) |

## 3. 다음 행동

- U2 문서의 원장 대조(G5, antigravity) 판정 → 지적 반영. 병행으로 U3(codex, `record`·`navigation`·레거시 import 금지) 진행 → 검사 뒤 커밋 → U4.
- 이 세션의 커밋은 경로를 지정한 `git add`만 쓴다(원장 세션의 미커밋 변경과 섞지 않음).

## 4. 원장·계획서 어긋남

| # | 자리 | 어긋남 | 원장 | 처리 |
| --- | --- | --- | --- | --- |
| 1 | TEST-069 (라)의 묶음 이름·수 | "`r8-port`(q8 108)"의 108은 `spikes/round9/r9.mjs`이고, "`r7-port`(52, E1–E13·X*)"의 52는 `r9b.mjs`의 검사 수다. `r7-port.mjs`·`r8-port.mjs`는 단언 없는 관찰 도구다 | TEST-069 | 파일 기준으로 가르고 (라)의 일반 규칙으로 몫을 정한다(실행 계획 I9, §6.1) |
| 2 | `selfcheck-v5` 무리 a의 주입 사용 다섯 | 원장은 무리 c의 주입 단언만 PR-3으로 보내지만, 무리 a에도 주입을 쓰는 단언 다섯이 있다(A4a·A4b·A4c·A4-cap·A6-automatic) | TEST-069 | (라) "건드리는 기제가 모두 있는 가장 이른 PR"대로 04로 넘긴다 |
| 3 | `r9.mjs` P4(상태 키 16) | 원장이 PR을 적지 않았다 | TEST-069 | 상태 키(`readOnly`·`disabled`·`visible`·`&children`)가 PR-6 기제이므로 (라)대로 04(PR-3 + PR-6)로 넘긴다 |
| 4 | SETTLE-045 "청사진이 … L로 옮긴다" | 02 청사진에 L 계산이 없다 | SETTLE-045, 26C-04 | U5가 청사진 `BlueprintGate`에 L 계산과 칸을 더하고 세 규칙을 시험한다 |
| 5 | `request.md:8` | 게이트 둘을 스텁으로 적어 노드·조각의 `controls.active` 실제 평가와 어긋났다 | 26C-04, TEST-069, LANDING-062 | 새 원장 라운드를 따라 `if`만 술어 뒤에 둔다고 고쳤다. 검사 통과를 위한 변경이 아니다 |
| 6 | `adr-and-axes.md:51` | 게이트를 평가하지 않는다고 적어 PR-2 호스트 바퀴의 몫을 지웠다 | 26C-04, SETTLE-045 | 새 원장 라운드를 따라 판별·`controls.active` 실제 평가로 고쳤다. 검사 통과를 위한 변경이 아니다 |
| 7 | `verification.md:26` | 명령 메서드 하나만 뺀 약 54개 목록을 PR-2가 단언하도록 읽혔다 | 26C-01, NODE-010, EVENT-063 | 새 원장 라운드의 PR별 멤버 추가 규칙으로 고쳤다. 검사 통과를 위한 변경이 아니다 |
| 8 | ERROR-204의 경고 중복 키 초기화·제출 거부 | PR-2 게이트로 함께 읽힐 수 있으나 경고 구조 키·제출 바인딩은 뒤 PR의 기제다 | 26C-02, ERROR-032, LANDING-064, TEST-069 | 경고 중복 키 초기화 → 05(PR-4), 제출 거부 → 07(PR-7). PR-2는 `diagnostics` 초기화만 단언 |
| 9 | SETTLE-048의 `derived`·`injectTo` 발화, SETTLE-049의 `injectTo` 대상 값·범위 | PR-2에는 파생·주입 기제가 없다 | 26C-03, LANDING-063 | 두 사례의 발화·대상 값·범위 단언 → 04(PR-3). PR-2는 생김·채움과 로드 범위 신호만 단언 |
| 10 | EVENT-071의 리스너 안 `setValue`·`RequestRefresh` 배달 횟수·캐럿·IME, WRITE-096의 `UpdateValue` 출처 칸 | PR-2에는 배달·렌더 기제가 없다 | 26C-03, LANDING-064, TEST-069 | 리스너·배달·출처 칸 → 05(PR-4), 캐럿·IME → 07(PR-7). PR-2는 Refresh 대상 집합과 표시의 쓰기 종류만 단언 |
| 11 | WRITE-099의 `push(v)` 스냅숏, TEST-070의 배열 멤버 형, 25C-11의 노드/배열 아이템 `schemaType` 참조 동일성 | 배열 아이템·배열 멤버는 PR-2에 없다 | 26C-01, TEST-070, LANDING-065, 25C-11 | 각 사례 → 06(PR-5). PR-2는 유효 목록·노드 형만 단언 |
| 12 | 나감 비움의 `children` 항목·조각 `controls` 층, `rootOutput.test.mjs` :13·:24·:30과 :40 | PR-2에는 조각 정책·배열 행·`onChange` 배달이 없다 | TEST-069, LANDING-066, 26C-03 | 앞의 두 층 → 04(PR-6), 배열 세 사례 → 06(PR-5), `onChange` 배달 사례 → 05(PR-4) |
| 13 | `r9b.mjs`의 뒤 PR 네 프로브와 `r7-port.mjs`의 E3·X3c·X3L·X15·X16·XA4·D-17·X2/X3·E4·E6 | 파생·주입 또는 배달 기제를 쓴다 | TEST-069 (라), LANDING-063·064 | `r9b.mjs`의 `final-shape-after-derived`·`final-shape-after-fill-dependency`·`final-shape-preserves-caller-raw`·`final-shape-feedback-budget` 및 E3·X3c·X3L·X15·X16·XA4 → 04(PR-3); D-17·X2/X3·E4·E6 → 05(PR-4) |
| 14 | `selfcheck-v5.mjs`의 A4a·A4b·A4c·A4-cap·A6-automatic, f 네 사례, g 여덟 사례 | 주입·억제·통지 기제의 배정 | TEST-069 (라), LANDING-063·064 | A4a·A4b·A4c·A4-cap·A6-automatic와 f 네 사례 → 04(PR-3); g 여덟 사례 → 05(PR-4) |
| 15 | `r9.mjs` P2·P5·P6·P7·P4 | P2 6·P5 16·P6 12·P7 30검사는 파생·주입·억제, P4 16검사는 상태 키다 | TEST-069 (라), LANDING-063·066 | P2·P5·P6·P7 → 04(PR-3), P4 → 04(PR-6). 원천의 반복과 `eq` 수로 108검사 배분을 검산했다 |
| 16 | `r8-port.mjs` P4의 X16·X16_noDefault, P1, P2 | 주입·에지 기제를 쓴다 | TEST-069 (라), LANDING-063 | 각 사례 → 04(PR-3); P4의 N1·N1_noDefault·N9·N9_noDefault·X16_noAuto는 PR-2에 이식 |
| 17 | `edge-cases.mjs`의 clear 자기 의존 4검사, clear 객체 2, 자동 덮어쓰기 1, 단계 순서 2, 파생 예산 3, 잠금 결합 5 | 앞 12검사는 파생·주입·`clearValue`, 뒤 5검사는 PR-6 상태 키를 쓴다 | TEST-069 (라), LANDING-063·066 | 앞 12검사 → 04(PR-3), 잠금 결합 5검사 → 04(PR-6). 조각 생김·`allOf` else·객체 채움·덧씌움 기본값의 9검사는 PR-2 |
| 18 | `round18/proto/__tests__/`의 `settleRules.test.mjs` :15·:36·:25·:59와 `rootOutput.test.mjs` :13·:24·:30·:40 | 동점·우선순위·나감 에지·배열·배달 기제는 PR-2에 없다 | TEST-069 (라), LANDING-063·064·065 | `settleRules` :15·:36·:25·:59 → 04(PR-3), `rootOutput` :13·:24·:30 → 06(PR-5), :40 → 05(PR-4) |
