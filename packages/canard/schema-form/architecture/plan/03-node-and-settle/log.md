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
| 2026-09-29 | U3 | codex(세션 `103916e7`)가 record·navigation·레거시 import 금지 설정을 씀. 편차 둘을 조율 세션이 받아들이고 DETAIL을 먼저 맞춤(navigation `origin: Self`, `updateSchemaNodeNameAndPath`의 `Self` 제약). 조율 세션이 navigation 뿌리의 구현 셋을 `utils/query/`·`utils/walk/`로 옮김(filid 뿌리 규칙). G6(15시험)·G30·tsc·eslint 통과(조율 세션 재실행). G5 재대조 antigravity PASS | `9a1cbfb92`, `fde2bc543` |
| 2026-09-29 | U4 | codex(세션 `258b196e`)가 parse(규칙 A)와 행 여덟·`BEHAVIORS`를 씀. 중간 질의: objectBehavior DETAIL의 "활성 자식 선언만"은 NODE-006 "자식 선언 목록만"보다 나감 → 조율 판정 (a) 선언 전부를 돌려주고 게이트 거르기는 settle(D3). 할당 0 시험은 쓰기 경로의 명시적 생성 부재만 봄(실행 힙 측정 아님). G7(17시험)·tsc·eslint 통과(조율 세션 재실행) | `e89acea25`, 이 커밋 |
| 2026-09-29 | U5 | 소유자 지시: PR 작성까지 이번 단계를 끝낸다. 견고·무결을 우선하고 핵심 가치 다섯(GOAL-049 일관성·투명성·예측가능성·표현자유도, GOAL-050 고속성)을 보장하며 원장에서 벗어나지 않는다. 조율 세션의 운용: U5부터 단위마다 antigravity가 코드를 원장·다섯 가치와 대조하고, 조율 세션이 게이트를 다시 돌린 뒤 커밋한다. 원장 모호는 원장 관리자에게 묻는다. PR 전 독립 verifier 판정을 한 번 더 받는다 | 이 기록 |
| 2026-09-29 | U3·U4 | antigravity 코드 대조 `CODE-U3U4: PASS`(차단 0). 비차단 하나(포인터 생략 시 throw)를 옛 `find(pointer?)` 호출 모양 계승으로 받아들여 DETAIL 먼저 고침 | `fcfd22df8` |
| 2026-09-29 | U5 | codex(세션 `6a71468e`)가 청사진 L·if 대역·정착 ①·WRITE-099 E26 시나리오를 씀. 조율 세션 재실행 G8·G9·G24·G28 통과, core 74파일·620시험 초록. 열린 문제: 유한 재귀 템플릿의 게이트는 발생마다 L이 다름 → 원장 관리자 질의 → 26C-07: 청사진은 읽는 경로 목록(절대 그대로, 상대는 오르는 단 수)만 정적으로 들고, 발생별 L은 settle이 노드 생성 때 한 번 계산해 메모. 이에 따라 codex의 템플릿 연결별 재생성(BLUEPRINT-030 "위치마다 한 번")은 되돌린다 | 원장 `8c510d226` (`reviews/round-26-closing.md:72-82`) |
| 2026-09-29 | U5 | antigravity 코드 대조 1차 `CODE-U5: FAIL`(차단: E26 시험이 E26을 안 봄, 입력 쓰기가 선언 자식 전수 순회 — SETTLE-047·NODE-026 위반, 템플릿 캐시 변경의 문서 누락; 비차단 넷) + 조율 세션 발견(`in`의 프로토타입 키). codex가 26C-07과 함께 8항목 수정: 50자식 입력 쓰기 계산 방문 2·선택 방문 0, 재귀 템플릿 둘째 발생 L `/next`, 캐시 원복. 조율 세션 재실행 G8·G9·G24·G28, core 74파일·627시험, tsc·eslint 통과, 새 형 단언 없음. 재대조 `CODE-U5-FIX: PASS`(antigravity, 패키지 전체 355파일·4,542시험 초록 보고) | `134045f99`, `89b835695` |
| 2026-09-30 | U6 | codex(세션 `29761afa`)가 전이·예산·원본 B·로드·쓰기 옵션을 씀(새 시험 25, WRITE-098·099 시나리오 3). 뒤 PR 몫은 26C-02·03대로 나눠 둠(PR-3 `derived`·`injectTo`·`unsetValue`, PR-4 배달·경고 중복 키·`UpdateValue`, PR-5 배열 복원·로드 인덱스, PR-6 `controls.children`·조각 나감 정책, PR-7 제출 거부·렌더). 조율 판정: (1) WRITE-015 배치 행은 `batch`가 PR-4 기제(LANDING-064)이므로 PR-4로 미룸(§4 기록). (2) 새 억제 비트를 패키지 공개 `PublicSetValueOption`에 넣은 것은 되돌림 — 07까지 `<Form>`은 옛 엔진이 섬기고 옛 엔진은 이 비트를 무시하므로 공개하면 예측가능성을 해침(D5, LANDING-159 규칙 3). 내부 `SetValueOption`에만 둠. codex의 `yarn build`로 생긴 낡은 `dist`가 stories의 tsc를 깨뜨려 다시 빌드함. 조율 세션 재실행 G10·G29, tsc·eslint, unit 257파일·3,641시험, render 52파일·539시험 통과 | 이 커밋 |
| 2026-09-30 | U6 | antigravity 코드 대조 `CODE-U6: PASS`(차단 0; 호출마다 판정이 PASS→FAIL→PASS로 흔들려 조율 세션이 직접 판정). 유일한 지적 — 양 비트 동시 지정의 억제 우선 단언이 Enable 시험 끝에 접혀 있음 — 을 받아들여 독립 시험 `WRITE-015 suppression wins …`로 떼고 Form 기본 상태에서도 단언(Enable 우선이면 채워지므로 판별함). settle 59시험 초록 | 이 커밋 |
| 2026-09-30 | U7 | codex(세션 `bbba3c93`)가 `SchemaNode` 클래스(프로토타입 멤버 28 = DETAIL 표 28)·공개 형·가드 10·`schemaNodeFactory`, 클래스 파일 전용 NODE-010 린트, 새 fractal 비시험 파일의 형 단언·`any` 금지, 의존 방향 순환 시험을 씀. 형 단언 1건(`getDependencyIndex.ts`)은 선언 자리에서 형을 고쳐 없앰, TEST-070 중단 사유 없음. 조율 세션이 fractal 뿌리의 구현 둘(`guards.ts`·`schemaNodeFactory.ts`)을 `utils/`로 옮김(filid 뿌리 규칙, 가드 묶음은 옛 `filter.ts` 관례). 재실행 G11·G12·G26, tsc, eslint, unit 260파일·3,659시험 통과 | 이 커밋 |
| 2026-09-30 | U7 | antigravity 코드 대조 `CODE-U7: PASS`(멤버 28 모두 PR-2 근거, 뒤 PR 멤버·스텁 없음). 비차단 둘: 순환 시험의 파일 수집 단언이 약함 → 중첩 파일 포함 단언을 더함. 떼어진 `target.active`를 거짓으로 단언하라는 제안은 NODE-044 문언과 부딪혀 원장 관리자 질의 → 26C-08: `active`는 형상 소속을 읽는 멤버라 떼어진 옛 참조는 거짓(살아 있는 트리의 사실, NODE-044 고정의 예외), 구현 유지. DETAIL 먼저 고치고 세 단언(살아 있는 노드 참, 옛 참조 거짓, 다시 들어도 옛 참조 거짓·새 인스턴스 참)과 값 고정 단언을 더함 | `ab5f5daf8`, `0ad9e4015`, `e1c734566`, 원장 `02ff97841` (`reviews/round-26-closing.md:83-91`) |
| 2026-09-30 | U8 | U8-A(codex `3fa3910e`): SCN 다섯 부류·`diagnostics` 기대·코어 부류 러너, 빈 부류 단언 제거. 조율 세션 재실행 G14·G25, 코어 시나리오 8파일·25시험 통과. 결함 하나: union `omitEmpty` 미적용(VALUE-034). U8-B(codex `b4dd43b5`): 회귀 75/101·union 시험 13(`todo` 4는 04·06·07 몫). 미이식 26 중 뒤 PR 기제 12(§4), 나머지는 엔진 결함 후보 → codex 결함 라운드에서 원장 대조로 A(엔진 결함)·B(프로토타입이 원장과 다름)·C(PR-2 관측값 없음)로 분류 | `e28af11f7`, `892c6873d`, `e554f4922`, `d639840f0` |
| 2026-09-30 | U8 | 결함 라운드(codex `83290c4c`): A 고침 — 비객체 원본 호스트 아래 자식 쓰기의 호스트 승격(:399·:571·:599), 비로드 `null` 채움(:485, WRITE-096), `Merge` 위임(r8-port:392, WRITE-079), union 경고등 재확장 해제(TEST-077), union `omitEmpty` 공유 투영(VALUE-034). A 단언만 — :211, :623. antigravity 대조 `CODE-DEFECTS: PASS`. B·C 판정은 원장 관리자 확인: :157(옛 상한 25, SETTLE-005)·:308·:430(BLUEPRINT-017)·:399의 `b`(WRITE-079)·:459(NODE-044)·:485의 루트 `null`(VALUE-034)은 B 맞음, :150은 C 맞음(SETTLE-013). 단 :220·:227은 codex의 "수렴" 판정이 틀림 → 26C-09: 존재 여부로 진동하므로 전이 라운드 초과, 원본 B 커밋·`degraded`·던짐 → codex 수정 중 | `41dea976e`, `86930e010`, 원장 `dfa648075` (`reviews/round-26-closing.md:93-101`) |
| 2026-09-30 | U8 | 26C-09 수정(codex `83290c4c`): 쓰기 없이 형상만 바뀐 라운드를 수렴으로 보던 결함(`transitionSettlement.ts`) — 형상 변경을 기록해 전이 상한에 세고, 중간 채움 회수는 안정된 최종 형상까지 미룸. settle DETAIL의 "실제 쓰기를 낸 라운드만 센다"를 먼저 고침. :220·:227 이식(원본 B `{}` 커밋·`degraded/budget/transition/iterations 2`·던짐). 이식 수 selfcheck 37·r9 20·r8-port 7·r9b 9·edge 9·rootOutput 2 = 84 (§4의 뒤 PR 몫 12, B 5, C 2를 뺀 수). 조율 세션 재실행 unit 277파일·3,775시험, render 52·539, tsc·eslint 통과 | 이 커밋 |
| 2026-09-30 | U9 | codex(`057ea020`)가 새 엔진 벤치(`bench/node-and-settle.bench.ts`, node 26·bun 1.4.2)와 아홉 행 보고서를 씀. B6 초기 로드가 옛 엔진의 46·107배 → 결함으로 판정, codex(`f7e9e5b9`)가 입력 키마다 전체 선언을 찾던 `markWrite`·`getTransitionCap`·`assembleObject`의 제곱 경로를 색인으로 고침(1만 노드 1,411→51ms), DETAIL에 초기 로드 선형 계약을 먼저 적고 작업량 비율 시험을 더함. 남은 느린 행(B6 node −41%·bun −76%, B5 bun −67%, B2 추정 1.5배 초과, 18C-15·67·81의 N·깊이 비례)을 소유자에게 올림 → 소유자 답: 최적화 한 차례 뒤 판단. codex 최적화 라운드 진행 | `38712faa1`, `6d194c8be`, `56d1ecaca` |
| 2026-09-30 | U9 | 최적화 라운드(codex `48bad859`): 쓰기당 할당 지점 Map·Set·클로저 0, 게이트 없는 쓰기의 빈 단계 건너뜀 — Node에서 B5·B6가 옛 엔진보다 빠름, B2 1,224→413B. antigravity `CODE-PERF: FAIL`(작업 용기 `Set<never>` 형 구멍) → `SettlementScratch<Self>` 런타임 칸(record에 먼저 선언)과 `NaN` 안정 비교로 고침, 칸을 생성 때 미리 둠. 소유자 판정(G31): 남은 느린 행(Bun B5·B6, B2 추정 상한, 18C-15·67·81, JSC 숨은 맵) 모두 수용. 소유자 지시: 성능 지표·개선 이력·Bun 격차 원인을 문서로 남긴다(`verification/03-node-and-settle/performance.md`); 폼 성능은 React가 약 95%·코어가 약 5%(옛 엔진 기록)이고 최종 평가는 React/jsdom에서 한다 → 새 엔진의 React 평가는 07(`<Form>` 전환, LANDING-159)의 게이트로 원장 관리자에게 기록 요청, PR-2에서는 jsdom render 회귀 없음과 `benchmark-form` React 경로 불변을 확인 | `854b25177`, `45cfc924e`, `ec6486f63`, `6229d57fe`, `898c824dd` |
| 2026-09-30 | U9 | 소유자가 원장 세션에서 직접 확인(원장 `06bea4b6b`, `reviews/round-27-owner-answers.md:7-11`): 느린 행 수용, 벤치 기록 문서, React 약 95%·JS 코어 약 5%, 최종 검사는 React/jsdom(PR-7 게이트, LANDING-067 보충), 최적화는 구현 완료 뒤 별도 작업 — PR-2에서는 최적화하지 않고 `performance.md`를 그 참고 자료로 남김. G31 닫음 | 원장 `06bea4b6b` |
| 2026-09-30 | U10 | PLAN §2 7단계 antigravity 원장 대 구현 대조 `CROSSCHECK-AGY: PASS` — TEST-069 (가)(나)(다)와 §5 38행 모두 구현·시험 짝 있음, 뒤 PR 멤버 누수 0, `src/index.ts`·`src/types` 변경 0줄, record 금지 import·형제 내부 import 0, 다섯 fractal DETAIL과 코드 일치. 비차단 참고: B5 Node 재측정 편차(수용 범위, performance.md에 기록) | 이 기록 |
| 2026-09-30 | U10 | codex 두 번째 교차 대조 `CROSSCHECK-CODEX: FAIL` — 원장 예측 시나리오 10 중 8 일치, 2 불일치(조율 세션이 원장 문구로 확인): (1) 예산 상한이 게이트 객체를 셈 — SETTLE-041은 조각을 한 번만 셈(판별+active 분기 상한 3→2), (2) 목록 밖 `default` 마운트 경고 출처가 `load` — VALUE-037은 `fill`. codex(`d714d67f`)가 DETAIL 먼저 고치고 공통 `getGateBudgetCap`·출처 판정을 고침, 시험 추가(수정 전 실패 확인), record·SchemaNode DETAIL의 낡은 `AnyNode` 서술 정정. Bun 격차 분석·`performance.md`(codex `6915b89e`): 옛 엔진이 Bun에서 특히 빠름(bun/node B5 5.67× 대 새 엔진 2.06×) | 이 커밋 |
| 2026-09-30 | U10 | 독립 verifier G22 `FAIL`: 실행 게이트 26 중 25 통과, G2 실패(공유 시험 도우미 `makeSchemaNodeTree.ts`가 허용 목록 밖 → 허용 목록에 더함). 차단 셋은 NODE-044 위반(재현 확인): B1 떼어질 때 직접 자식만 떼어진 상태로 표시 — 자손의 옛 참조 쓰기가 정착을 돌리고 값을 잃음, B2 떼어진 객체 전체 교체가 자손 잠복 원본을 남김, B3 떼어진 참조의 `typeMismatch`·`typeMismatches`·`inactiveValues`·`defaultValue`가 살아 있는 런타임을 읽음. 조율 판정: F1·F2 수용, F3는 떼어질 때 캡처해 record에 먼저 선언한 런타임 칸에 둠(26C-06 방식, 레코드 필드 없음), core DETAIL에 도우미 자리를 적음, N2 소비자 없는 `budgets` 칸 제거. 원장 질의: 떼어진 `diagnostics`, 떼어진 `Merge`, 전이 라운드 안의 호스트 바퀴 초과 분류(N1). N3: `e554f4922`의 제목은 diff와 다름(PR 본문에 적음) | 이 기록 |
| 2026-09-30 | U10 | 원장 판정(원장 `fd7865ac3`): 26C-10(`reviews/round-26-closing.md:103-111`) — 떼어진 참조의 `diagnostics`는 살아 있는 트리(ERROR-131·SURFACE-007), 나머지 넷은 떼어질 때 갈무리, 떼어진 쓰기는 살아 있는 쓰기와 같은 규칙으로 잠복 원본에 닿음(전체 교체는 자손 잠복 원본을 비움, `Merge`는 WRITE-079). 26C-11(`:113-121`) — 전이 라운드 안의 호스트 바퀴 초과는 즉시 `hostWheel` 초과(SETTLE-011 문언, P3), 26C-09 사례의 값은 `hostWheel`로 정정. codex G22 수정 라운드에 반영 중 | 원장 `fd7865ac3` |
| 2026-09-30 | U10 | G22 수정(codex `a433cd9b`, `deab1df32`·`f2ab1967d`): 떼어진 하위 트리 전체 표시, 네 읽기 갈무리, 떼어진 쓰기의 잠복 원본 규칙(26C-10), 전이 중 호스트 바퀴 초과 즉시 `hostWheel`(26C-11), `budgets` 칸 제거, 도우미 문서화. 재판정 G22 `FAIL`: B1–B4·N1 해소, 게이트 27 통과. 남은 차단: B5(새 코드) 폼 로드가 떼는 노드의 고정 읽기를 로드 뒤 상태로 갈무리 → 경고등 비움·스냅숏 교체를 커밋 직전으로; B6(기존, 첫 검증이 놓침) 중간 라운드에 잠시 나갔다 최종 형상에 남은 노드를 나간 노드로 처리 — 인스턴스 교체와 비움 정책 시 값 손실, SETTLE-005 "최종 형상" 문언이 분명하므로 조율 세션이 설계 결정(떼어짐·갈무리·비움을 최종 형상 뒤로 미루고 돌아온 노드는 같은 인스턴스). N4: 한 파일 여러 수출 둘 정리. codex 수정 중 | 이 기록 |
| 2026-09-30 | U10 | B5·B6·N4 수정(codex `b786edc8`): 로드의 경고등 비움을 계산 뒤로, 스냅숏 교체를 쓰기 뒤 `finally`로; 중간 라운드 이탈 노드는 보류해 재진입 때 같은 인스턴스를 쓰고 최종 이탈만 `finalizeExits`에서 떼어짐·갈무리·비움; 떼어진 읽기 함수를 `settle/utils/detached/`로 나누고 `isPlain` 분리. 수정 전 B5·B6 시험 실패 확인. 조율 세션 재실행 unit·render 333파일·4,337시험, lint·typecheck 통과. 벤치 1회(Node): B5 새 0.0161ms 대 옛 0.0210ms, B6 새 30.7ms 대 옛 29.5ms — 최종 이탈 처리로 초기 로드가 앞선 24.9ms보다 늘었으나 소유자 답(`round-27-owner-answers.md:11`)대로 최적화는 구현 완료 뒤로 미룸 | 이 커밋 |
| 2026-09-30 | U10 | G22 3차 `FAIL`: B5·B6·N4 해소, 게이트 27 통과. 남은 차단: R1·R2(1fa3075e9의 퇴행 — 나감 비움이 억제 비트·원본 B를 무시해 값 손실), W1(기존 — `inactiveValues`가 WRITE-087과 어긋남: 호스트 항목 중복, 사전순, 참조 재생성). 비차단 P1(입력 쓰기마다 문자열 할당), P2(`resetSubtree` 스냅숏 참조 교체). W2는 원장 질의 → 26C-12(원장 `a68139102`, `reviews/round-26-closing.md:123-131`): 같은 (경로, 종류)가 살아 있는 동안 옛 참조 쓰기는 무동작. 조율 판정: F-R 수용, W1 설계(잠복 항목에 청사진 노드와 전순서 키, 바뀐 조상만 재생성). codex 수정 중 | 원장 `a68139102` |
| 2026-09-30 | U10 | R1·R2·W1·P1·P2 수정 커밋 `c12496437`(문서)·`d829920ee`(코드). G22 4차 `FAIL`: R1·R2·P1·P2·W2 해소, 게이트 27 통과. 남은 차단: B7(`d829920ee`의 W1 고침에서 생긴 퇴행 — 같은 잠복 상태가 거쳐 온 길에 따라 `inactiveValues`가 다름), B8(`62a53ca39`부터 있던 결함 — 같은 이름을 배타 게이트 아래 다른 종류로 선언하면 마운트부터 `hostWheel` 초과). 비차단 P3(커밋마다 열거 배열 할당), P4(대량 이탈 때 `getLatentOrder` 비용 691→1,069ms, 최적화는 소유자 답대로 뒤로). 조율 판정: B7은 열거를 잠복 상태의 순수 함수로 — 브랜치 호스트 값을 청사진 자식 선언으로 펼치고 자기 키를 가진 자손은 그 키가 이김 | 이 기록 |
| 2026-09-30 | U10 | 원장 판정 26C-13(원장 `74ac267f8`, `reviews/round-26-closing.md:137-139`): 같은 이름이 다른 종류로 형상에 살아 있으면 비활성 선언은 부모 값에서 잠복 원본을 만들지 않음, 로드는 형상에 없는 경로의 값을 전순서에서 앞선 종류 하나의 잠복 원본으로 실음, 열거는 경로 단위. 후속 확인(원장 변경 없음): 한 경로의 여러 종류 잠복 원본은 전순서 앞선 종류 하나로 열거, 전체 교체 쓰기·로드는 범위 안의 모든 종류 잠복 원본을 V로 바꾸거나 지움(WRITE-094·085, 18C-64), 들어오는 다른 종류 노드는 자기 잠복 원본 또는 없음에서 채움(VALUE-002·004·025, SETTLE-005) | 원장 `74ac267f8` |
| 2026-09-30 | U10 | B7·B8·P3·26C-13(codex `75910280`), 교차 대조 antigravity `FAIL` F1(전체 쓰기가 다른 종류 잠복 원본을 되살림)·F2(같은 이름 다른 종류 중복 열거) 재현 확인 → codex 용량 초과로 sonnet 서브에이전트가 수정, 들어오는 자식이 호스트의 옛 키를 읽던 결함(debugger 진단, `readHostInput`)을 worker가 수정. 수정 전 새 시험 실패 확인. 조율 세션 재실행 unit·render 334파일·4,365시험 통과, lint·typecheck·SCN 15 통과. P4는 `performance.md` 후속 후보에 기록 | 이 커밋 |
| 2026-09-30 | U10 | 진단 중 발견: 객체 호스트의 `raw`가 로드·전체 쓰기로 받은 V 전체를 들고 입력 쓰기로 갱신되지 않음(VALUE-002·004 위반, PR-2 겉면 `raw`로 보임). 원장 관리자 확인(원장 변경 없음): PR-2 범위(LANDING-062·082, 26C-01), `extras`는 VALUE-002·WRITE-090·091·018, `Merge`의 기반은 자식마다의 현재 원본(WRITE-079), 로드 스냅숏은 런타임 칸이라 영향 없음(WRITE-085, 26C-06). 조율 판정: PR-2 안에서 값 모델을 원장대로 맞춤 — 설계 명세 작성 중 | 이 기록 |
| 2026-09-30 | U10 | 값 모델 설계: 명세 v1(Plan) → verifier `REWORK`(12 지적) → 원장 판정 O1–O6·Q1–Q4·OPEN-1/2/4(26C-14, 원장 `d1c6a25a0`) → 명세 v2 → verifier `APPROVE-WITH-FIXES`(F-N1–N9 수용). 결정: 호스트 `raw`는 잘못된 종류 값만, 선언 밖 키는 `extras`, 잠복 원본은 노드마다(호스트는 자기 `extras`·잘못된 종류 값), 경로를 담은 형상 밖 쓰기는 전순서 첫 종류에 쓰고 다른 종류를 지움(떼어진 참조는 자기 종류), `Merge`는 키마다 부분 쓰기, 들어오는 자식은 분배 입력 → 자기 잠복 → 없음, 채움은 원본 B에 남지 않음, 열거는 노드 단위(`extras` 없음). 구현 codex(`c3337821`): 시험 먼저 27건 실패 확인 뒤 통과. 조율 세션 게이트 실행 25 통과(G18은 이 기록의 분할된 옛 항목 인용을 WRITE-090·091로 고침, G19는 커밋 전). 교차 대조 antigravity `PASS` | 이 커밋 |
| 2026-09-30 | U10 | G22 5차 `FAIL`: B7·B8 해소, 값 모델 확인 시험 약 60건 통과, 이전 고침 퇴행 없음, P3 해소. 남은 차단: G18(이 기록의 분할된 옛 항목 인용), R3(`c77e89da5`의 새 퇴행 — 로드 정착이 나감 갈무리를 통째로 건너뛰어 `resetSubtree`가 범위 밖 노드를 내보내면 원본 손실, EVENT-072·NODE-044·VALUE-006). 조율 세션 수정: 인용을 고치고 settle DETAIL 먼저, 로드 범위 밖 나감은 일반 나감 규칙으로 갈무리(`finalizeExits`·`applyExitClearing`), 시험 추가(수정 전 실패 확인). 재실행 unit·render 335파일·4,390시험, lint·typecheck·SCN 15, G18 통과 | 이 커밋 |
| 2026-09-30 | U10 | G22 6차 `PASS`(`e770721e4`): 실행 게이트 27 통과, R3 해소, 로드 범위 경계 탐침(억제·실패·중첩 범위·범위 밖을 읽는 게이트·폼 reset 대 부분 reset) 전부 통과, 이전 고침 퇴행 없음. 누적 차단 지적 B1–B8·R1–R3·W1·W2·G2·G18 모두 해소. 남은 게이트 G20(storybook, 소유자 실행)·G21(filid 스캔, PR 경계) | 이 커밋 |

## 3. 다음 행동

- U7 antigravity 코드 대조 → U8(시나리오·회귀 이식·union 시험·SCN) → U9(벤치) → U10(최종 게이트·PR).
- 이 세션의 커밋은 경로를 지정한 `git add`만 쓴다(원장 세션의 미커밋 변경과 섞지 않음).

## 4. 원장·계획서 어긋남

- 계획서 §6.1의 PR-2 회귀 배분에 뒤 PR 기제가 필요한 사례가 들어 있다: `r9.mjs:76`(경고 수 4건)·`:80`(검증기 결과 4건)은 PR-4의 경고 기록·검증기, `selfcheck-v5.mjs:348`(통지)은 PR-4, `:519`(배열 `omitTrailing`)은 PR-5. 26C-03에 따라 그 PR로 넘기고 G27의 기대 수를 그만큼 줄인다.
- 프로토타입 기대가 현행 원장과 달라(원장 관리자 확인) 이식하지 않는 `selfcheck-v5.mjs` 사례: `:157`×2(옛 상한 25 — SETTLE-005의 셈이 이김), `:308`·`:430`(BLUEPRINT-017 — 판별식 없는 `const`는 읽지 않음), `:459`(NODE-044 — 떠난 옛 참조 쓰기는 내지 않음). PR-2 겉면에 관측값이 없는 `:150`×2(SETTLE-013). 그래서 G27의 기대 수는 selfcheck 37(46−2−5−2), r9 20(28−8)이다.

- 계획서 U6 "배치에서 억제 우선"(WRITE-015 배치 행)은 PR-2에서 단언하지 않는다. `batch`는 PR-4의 기제(LANDING-064)이고 26C-03이 뒤 PR 기제를 쓰는 단언을 그 PR로 나누게 하므로 05(PR-4)가 단언한다.

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
