# 04 파생 + 상태 키·제어 — 실행 기록

Planning method: 저장소 지침 — `PLAN.md` §2와 `plan/prompts.md`의 단계 실행 절차, 소유자의 착수 승인(2026-09-30). 단위마다의 단계·명령·기대 결과는 seiri `write-plan`의 불변식으로 채운다. 실행 계획은 [execution-plan.md](execution-plan.md)(작성 전), 게이트 원장은 `.seiri/tasks/schema-form-04-derive-and-controls/gates.md`(작성 전).

정본의 순서: 원장 `ledger/<area>.md` > 계획서 `request.md`·`adr-and-axes.md`·`verification.md` > 실행 계획 > 이 기록. 이 기록이 원장과 다르면 원장대로 가고 §4에 적는다.

## 0. 머리

- 선출 이유: 03 PR #350이 실제로 머지되어(`0705217d5`, 2026-09-30 13:30Z) 04·05·06의 의존이 풀렸다. 05는 D-1(EVENT-073)이 열려 있어 막혔고, 04·06 가운데 단계 순서가 앞서며 03이 넘긴 사례(03 `log.md` §4의 2·3·9·13–17행)가 가장 많이 모인 04를 골랐다. 소유자가 04 착수를 승인했고 D-1은 05 착수 때 다시 올린다(2026-09-30).
- 브랜치 `feat/schema-form-derive-and-controls`, base와 PR base `1.0.0-beta`(`0705217d5`).
- 원장 질의는 원장 관리 세션 `albatrion-79`로 보낸다(소유자 지시, 2026-09-30).
- 착수 전 확인(`request.md`): LANDING-063의 셋은 18C-50(SETTLE-043)·18C-51(FRAGMENT-050)이 닫음, `controls.children` 세부는 CONTROLS-073, 게이트는 03의 술어 대역을 그대로 씀(`if` 가드 컴파일은 05). 막는 소유자 결정 없음.

## 1. 최초 작업 기준선

| 원문 | 리비전 | sha256(앞 16자) |
| --- | --- | --- |
| `plan/04-derive-and-controls/request.md` | `0705217d5` | `3bcda77ab9b7f546` |
| `plan/04-derive-and-controls/adr-and-axes.md` | `0705217d5` | `afffad6fdb651d97` |
| `plan/04-derive-and-controls/verification.md` | `0705217d5` | `80bccee545e9a19e` |
| `ledger/*.md` | `0705217d5` | 커밋으로 고정 |
| 03에서 넘어온 사례 | `plan/03-node-and-settle/log.md` §4 @ `0705217d5` | 커밋으로 고정 |

- 목표: 정착 루프의 계산 단계를 완결한다 — 파생 `settle/derive/`(`controls.derived`·`injectTo`·`unsetValue`, 같은 대상 규칙, 에지 소비, `DisableAutomaticWrites`, `controls.resetInteraction`, 개발 모드 정착 기록; LANDING-063·083)과 상태 키·제어(결합 OR/AND, `controls.children`, 조각 `controls`, `unsetOnInactive`의 층·식 값·하위 트리 정책, 겉면 계산 게터 넷; LANDING-066·086).
- 비목표: `if`의 가드 컴파일·평가(05), 통지·`batch`·배달(05), 배열 행(06), 렌더 계층의 전체 잠금과 공개 전환(07), 옛 `InjectionGuardManager` 재진입 가드의 재구성.
- 산출물·완료 기준·게이트: `request.md` "산출물과 완료 기준", `verification.md` 전체. 원장 ID 목록은 두 문서의 "원장 항목 색인". 03이 넘긴 이식 사례는 03 `log.md` §4.

## 2. 진행

| 날짜 | 단계 | 무엇 | 근거 |
| --- | --- | --- | --- |
| 2026-09-30 | 착수 | 상황판 03 → 머지, 04 → 진행. 이 기록 작성 | `52c04716e` |
| 2026-09-30 | 착수 | 소유자 결정: 구현은 codex, 대조·리뷰는 antigravity, 사용량 초과로 멈추면 일의 무게에 맞춘 Claude 서브에이전트로 대체. `plan/prompts.md` §1에 반영 | `34ac214b0` |
| 2026-09-30 | U0 | 실행 계획 초안(Claude opus 서브에이전트 — 계획 작성은 구현·리뷰 배정 밖). 원장 질의 Q1–Q7을 원장 관리 세션에 보냄 → 28라운드 28C-01~07로 닫힘(`@` 결함 수정·`setContext` 맥락 변경 정착·`watchValues`가 04로 들어옴). 분할되어 현행이 아닌 옛 오류 정책 항목의 인용을 현행 ERROR-122·`adr/0014-error-policy.md:188-197`로 고침. 계획 반영 뒤 `plan-links` problems 0 | `execution-plan.md` §2.3 |
| 2026-09-30 | U0 | antigravity 1차 계획 리뷰(세션 `0c589e67`) `cleared`·지적 0 → **기각**: 근거로 든 경로 여섯 가운데 다섯이 저장소에 없음(`src/core/SchemaNode/internals/AbstractNode.ts`, `test/core/SchemaNode/union.write-paths.test.ts`, `src/core/settle/utils/derivation/evaluateGate.ts`, `src/core/settle/utils/InjectionGuardManager.ts`, `src/core/blueprint/utils/compileExpressions/compileBlueprintExpressions.ts`). 근거 인용을 의무로 한 2차 리뷰를 요청. Q8(`node.context` 게터의 PR)과 I27 확인을 원장 관리 세션에 보냄 | 이 기록 |
| 2026-09-30 | U0 | 28C-08(Q8: `node.context`는 04 멤버, I27 정정: 깊이 같은 새 맥락은 정착 없음·옛 참조 유지, Form 속성 억제가 기본값, `setContext`는 NODE-010대로 `src/core/index.ts`에서도 이름으로 다시 내보냄) 반영. `dist`에 새 엔진이 들지 않음을 G30으로 확인. 28라운드 커밋 `754169d05`(원장 관리 세션) — 검증자 게이트의 조정 셋(LANDING-137은 04, `@` 결함 위치 추가, `trim`은 억제 범위 밖) 반영 | `754169d05`, `reviews/round-28-closing.md` |

| 2026-09-30 | U0 | antigravity 2차 검토(세션 `dd51aa1d`) `cleared`(낮음 둘 반영) → 범위 한정 재검토 `cleared`(커버리지·원장 대조 근거 첨부, 새 지적 0). 계획 리비전은 이 커밋. 실행 계획 §9 | 이 커밋 |

| 2026-10-01 | U1 | G1·G2 met — 04의 레거시 이동 0(03에서 완료) | `59862834c` |
| 2026-10-01 | U2 | codex(세션 `66239a0c`)가 `settle/derive/` INTENT·DETAIL과 settle·record·SchemaNode·core·SCN DETAIL을 씀(원장 NODE-016의 `settle/derive < settle`를 계획 §3.2보다 우선). G3 met. antigravity G4(세션 `efaea927`) `no-blocking`, 32문장 일치, 낮음 둘(`trim` 제외 WRITE-100, `injectTo` 후보 배제) 반영 → G4 met | `e2b22242b`, `212e6bc3a` |
| 2026-10-01 | U3 | codex(세션 `fe2c9fab`): `settle/derive/`, `settle/utils/derivation/`, `settle/utils/context/`, 에지·로드 발화·`unsetValue`·예산·억제·정착 기록, `@` 결함 다섯 자리 수정, `sameValue`를 18C-50 (가)로 넓힘(03 정착 시험 초록 유지). 조율 세션 재실행: G5 163시험, G6, G26 met, eslint·tsc 깨끗, core unit 891 통과 1 실패 | `49ad47e13` |
| 2026-10-01 | U3 | **계획 이탈**: `SchemaNode/__tests__/surface.test.ts`의 "26C-01 PR-2 member list matches the DETAIL table exactly"가 U2 문서 선행(`e2b22242b`)부터 빨강 — DETAIL 멤버 표가 04의 최종 멤버 여섯을 먼저 적었기 때문(기대 28, 실제 34). 시험을 느슨하게 하면 계약 약화라 고치지 않고, U4b·U5가 멤버를 들이면 초록이 된다. 그 사이 커밋은 이 시험 하나가 빨강 | 이 기록 |

| 2026-10-01 | U3 | antigravity 단위 검토(세션 `19ed2e0c`) `blocking-found` — 근거 1–6은 없는 경로 인용이라 버리고, 지적 하나(나간 컨테이너 자손의 규칙 기준점이 커밋 칸에 남아 재탄생 에지가 빠짐, WRITE-029)는 조율 세션이 코드로 확인. codex(같은 세션 `fe2c9fab`)가 수정 전 실패(`expected true to be false`)를 보이고 고침. 대상 쪽 기준점은 CONTROLS-053대로 두었다 | `b3f7c1b49` |
| 2026-10-01 | U4 | codex(세션 `e1330ad8`): `injectTo`·같은 대상 규칙(순위·층 표 `derive/utils/rank/`), 오류 코드 `INJECT_TARGET_MISSING`·`INVALID_VIRTUAL_NODE_VALUES`, union `it.todo` 둘을 실제 시험으로. G7·G8 met. antigravity 단위 검토(세션 `d44b6fa4`) `no-blocking`(인용 두 곳을 조율 세션이 대조) | `a9bd71b41` |
| 2026-10-01 | U4b | codex(세션 `129177c0`): `setContext`(`SchemaNode/index.ts`·`src/core/index.ts` 이름 수출, `src/index.ts` 없음), `settle/utils/context/changeSchemaNodeContext.ts`, `context` 게터. G27·G30 met. G30의 `rolldown -c`가 `dist` 타입 선언을 지워 `stories/` 형 검사가 깨짐 → `yarn workspace @canard/schema-form build:types`로 복구하고 G30에 복구 안내를 더함 | `439c491c5` |
| 2026-10-01 | U8 | PR-3 몫 82사례 이식(codex 세션 `de624cab`, 원천별 9·27·20·4·6·12·4). 실패 7 → debugger(opus) 진단: 제품 결함 0. `r9b.mjs:137`(원본 `undefined` 가드 누락)·`selfcheck-v5.mjs:297`(로드 진입을 비로드 `setValue`로 옮김)은 이식 오류로 고침. 나머지 넷은 원장 질의 Q9 → **29C-01**(원장 관리 세션, `9e1a2dfd9`): 태어나거나 로드된 노드의 규칙은 원천 방출 값이 `undefined`여도 거짓→참 에지로 발화한다. 기대를 `{ t: 'from-undefined' }`로 바꿈. 채움 뒤 파생 재평가(SETTLE-005 "→ 표시로")를 `derive.injectTo.edges.test.ts`에 단언. `r9.mjs:51`(`visible`)은 U5 뒤 초록 | `77dda7e75` |

## 3. 다음 행동

- U5(codex) 진행 중 → U6 → U7·U8(PR-6 몫)·U9 → U10. U10 전에 `settle/derive/__tests__`의 `filid:contract derive-edge` 세 파일 중복 선언을 정리한다(filid 검증 기록 규칙 §5).
- 이 세션의 커밋은 경로를 지정한 `git add`만 쓴다(원장 세션의 미커밋 변경과 섞지 않음).

## 4. 원장·계획서 어긋남

| # | 자리 | 어긋남 | 원장 | 처리 |
| --- | --- | --- | --- | --- |
| M1 | `request.md:34`, `request.md:47` | 네 레거시 기호와 시험을 옮기라고 적었으나 03 U1이 이미 `src/__legacy__/core/nodes/…`로 옮겼다 | LANDING-159·205 | 04의 이동 0을 게이트로 확인하고 PR 본문의 레거시 이동 목록에 "03에서 완료"로 적는다 |
| M2 | `request.md:22` | 하위 트리로 내려가는 정책을 04 몫으로 적었으나 LANDING-066 충돌 줄이 하위 트리 규칙을 PR-2로 좁힌다 | LANDING-066 충돌 줄, LANDING-092 | 04는 `children` 항목 층·조각 `controls` 층·식 값만 더한다 |
| M3 | `verification.md:21` | "`selfcheck-v5`의 f와 c 가운데 주입 단언" — 주입 단언 다섯은 무리 c가 아니라 a(A4a·A4b·A4c·A4-cap·A6-automatic)에 있다 | TEST-069 (라), 03 log §4 2행 | a의 다섯과 f의 넷을 이식한다 |
| M4 | `verification.md:21` | `r8-port`·`r7-port` 묶음 이름이 실제 파일과 맞지 않는다 | TEST-069 (라), 03 I9 | 03의 파일 대응을 따른다 |
| M5 | `verification.md:21`, `verification.md:26` | v7에 조각 `controls` 층 나감 에지 사례가 없고, 있는 사례(`settleRules.test.mjs:59`)는 `batch`(05 기제)를 쓴다 | TEST-069 (라), FRAGMENT-050, LANDING-064 | 조각 층 사례는 새로 쓰고, `:59`는 루트 `setValue(V)` 한 번으로 이식한다 |
| M6 | `verification.md:12` | "02 §9 목록"은 보관된 검증 전략 절이며 상황 목록이 아니다 | LANDING-071, TEST-023 | 상황은 TEST-016·019와 원장 게이트에서 뽑는다 |
| M7 | `adr-and-axes.md:26` | 자동 쓰기 억제 비트가 뒤이은 포커스 아웃 `trim`에 듣지 않는다는 WRITE-100이 빠졌다 | WRITE-078·100 | 원장 변경 없음(28라운드 확인). `trim`은 07이며 04의 억제 단언은 파생·주입·`unsetValue`·채움·나감 비움에 한정한다 |
| M9 | TEST-069 (라)의 배분과 이 단계 `execution-plan.md`의 "기대값은 `round18/proto/REPORT-v7.md`의 기대 치환을 따른다"(v7 모형이 원장과 다른 자리에는 미치지 않음, `reviews/round-29-closing.md:14`), `spikes/round18/proto/REPORT-v7.md:47` | v7 모형(`spikes/round18/proto/utils/operations/fires.mjs:10-18`, LOAD_EDGE `e !== MISSING`)은 없음인 원천을 생김·로드에서 발화시키지 않아 A4b(`selfcheck-v5.mjs:285`)·X16(`r8-port.mjs:361`, `r7-port.mjs:444`)·X16_noDefault(`r8-port.mjs:362`)를 `from-C`로 기대한다 — 현행 원장과 다름 | WRITE-029, FRAGMENT-050 (2)·(3), CONTROLS-027·079·084, SETTLE-004·005, 29C-01 | 원장대로 `{ t: 'from-undefined' }`를 기대하고 엔진은 바꾸지 않는다. 시험 이름에 29C-01 |
| M8 | 03 코드 `settle/utils/paths/resolveDependencyPath.ts:5-11`, `settle/utils/gates/evaluateGate.ts:80`, `settle/utils/gates/getGateRegistry.ts:155`(호스트 경로 치환), `settle/utils/write/getDependencyIndex.ts:32`·`:42`(역의존 표에서 제외), 시험 `settle/__tests__/settle.gates.test.ts:72-84` | 03이 `@`를 호스트 `extras`로 읽었다 — 원장 근거 없음(03의 이탈) | CONTROLS-080 (3)·(6)·(8), 28C-03 | 04 U3·U4b가 `@`를 런타임 맥락 칸으로 고치고 역의존 표에 `@` 소유자를 들인다 |
