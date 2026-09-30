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

| 2026-10-01 | U5 | codex(세션 `7710e993`): 상태 키 결합(`settle/utils/controls/`, 결합 표 `STATE_KEYS`), 게터 `visible`·`enabled`·`readOnly`·`disabled`·`watchValues`, 떼어진 노드의 동결 읽기. G9·G10·G29 met, core unit 1,027 전부 초록(멤버 목록 시험과 `r9.mjs:51`이 초록으로 돌아옴) | `0ae92ff2d` |
| 2026-10-01 | U4b·U5 | antigravity 단위 검토(세션 `e722b186`) `no-blocking`. 권고 하나: `watchValues`와 `derived` 의존 집합이 단일 문자열 `watch`를 받아 줌 — 원장은 "`watch`의 형은 문자열 배열이며 단일 문자열은 받지 않는다"(CONTROLS-019, CONTROLS-032 충돌 줄). 붉은 시험 둘을 먼저 보이고 두 자리를 배열만 읽게 고침. 청사진이 `watch` 형을 오류로 거르지 않는 것은 02 청사진의 몫이라 PR 본문에 기록 | `b7f3af435` |
| 2026-10-01 | U6 | codex(세션 `1ce5d840`): 채움 원천의 `children` 항목·조각 층, 나감 정책 네 층·같은 층 유지 우선·꺼지는 조각·하위 트리·잠복 자손·직전 커밋 식 값(커밋 칸)·던진 식은 유지(28C-05). G11·G12 met, core unit 1,081 초록 | `06fd61da6` |
| 2026-10-01 | U7·U8 | codex(세션 `9b51286f`): SCN `states` 기대·`resetSubtree` 단계·`derive`(8)·`controls`(10) 부류, 코어 러너 둘, PR-6 몫 회귀 `r9.mjs` 8·`edge-cases.mjs` 3. G13·G14·G15·G16 met | `09bc596ec` |
| 2026-10-01 | 정리 | `settle/derive/__tests__`의 세 파일이 같은 `filid:contract derive-edge`를 선언하던 것을 정리 — 규칙 표·실패 판정 시험을 `derive.boundary.test.ts`(`derive-boundary`)로 합침(filid 검증 기록 규칙 §5) | `b7f3af435` |

| 2026-10-01 | U9 | codex(세션 `53b9b437`): `bench/derive-and-controls.bench.ts`, 04 `performance.md`. TEST-071 한 원소 쓰기는 두 엔진 모두 28C-06 선 통과, 공유 원소 깊은 방문 0(지름길 있음). 통째 교체 객체 행은 크기비의 선형 하한 아래(빠른 쪽) → 소유자 수용 대기. 03 벤치 04 뒤 재측정에서 조각 16·64 행이 7–109배 느려짐 | 벤치 파일(미커밋) |
| 2026-10-01 | U5 수정 | debugger(opus) 이분 탐색: 원인은 `0ae92ff2d`의 상태 키 단계 — 조상이라서 dirty인 호스트도 자식 전부로 넓혀 계산(`settle/utils/controls/calculateStateKeys.ts:39-48`, `getControlLayers.ts:61-73`). settle DETAIL "잎 입력은 재계산 목록만 순회"·SETTLE-017·GOAL-011 위반. Fix A(codex 세션 `7710e993`): 확장을 역의존·`@` 소유자·형상 변경·로드로 한정, 나감 정책 커밋에도 같은 가드. 비용 시험 수정 전 실패(기대 0, 실제 64). 조각 64 행 1.16ms → 0.031ms. B5·B6의 남은 상수 비용(`controls` 없는 청사진에서도 도는 단계)은 27라운드대로 최적화하지 않고 소유자 수용 목록으로 — 후속 후보는 청사진별 "controls 없음" 캐시 | `0cda5fd34`, `d5233155d` |
| 2026-10-01 | 정리 | settle 시험의 `filid:contract`가 DETAIL에 없는 묶음(`settle-derive`·`settle-state-keys`)을 가리키던 것을 DETAIL 수락 묶음으로 정의하고, 맥락 시험을 `settle-context`·`settle-state-keys`로 옮김. 03부터의 `settle-transition` 미정의와 묶음 중복 선언은 filid 스캔 결과로 PR에 기록 | `0cda5fd34`, `d5233155d` |
| 2026-10-01 | U10 대조 | 최종 게이트 G7·G8·G16·G19·G20·G21·G28 재실행 충족(unit+render 363 파일·4,609 통과). G19 CHECK에 `--reporter=dot --silent`를 더함(출력이 커 원장 hook이 성공 표지를 못 읽음). 교차 대조: antigravity(세션 `aefc66c8`) no-blocking, codex(세션 `d0e40bce`) 불일치 2(같은 이름 다른 종류의 `controls.children` 대상 — 재탄생 대상 무발화, 활성 종류 `watch` 무시), 조율 세션이 임시 시험으로 재현 | — |
| 2026-10-01 | U10 수정 ① | codex(세션 `fe2c9fab`): 규칙 에지 키를 대상 인스턴스로, 에지 비교는 형상에 있는 종류의 모든 선언의 `watch`(CONTROLS-073, WRITE-029, SETTLE-043). 수정 전 실패(`undefined`≠10, 99≠10) | `4c42fd90b` |
| 2026-10-01 | U10 검증 | 독립 검증자(opus) FAIL: F1 식 하나의 던짐이 정착의 자동 쓰기 전체를 멈춤(03부터, M10), F2 잎 쓰기마다 확정 규칙 값 전수 복사·`JSON.parse`, F3 제어 식 선형 조회로 로드 이차, F4–F6 실패할 수 없는 시험, F7 진입점 안 상수. 원장 관리자 판정 29C-02(`f600e28df`, `186926fcb`): Q1–Q3 모두 예, 03의 전체 생략은 결함 | — |
| 2026-10-01 | U10 수정 ② | DETAIL 선행(`2625153c0`, `e73e8812e`) 뒤 codex: F1 예산 초과만 원본 B, 던진 규칙만 후보 제외, 던진 게이트로 나간 노드만 비움 생략(`throwingGateExits`), 새 시험 5 수정 전 실패. F2 원천별 키 색인, 잎 쓰기 `JSON.parse` 64/640 → 0/0. F3 청사진당 조회 색인 1회. F4–F6 변이로 실패 확인, F7 상수 이동 | `0d3c8092e`, `750793953`, `6a811037c`, `c48d88629` |
| 2026-10-01 | U10 재검증 | 범위 재검증(opus) FAIL: F1·F3–F7·대상 종류 결함은 닫힘. N1 `750793953`의 회귀 — 방문한 자식 경로 정리가 방문하지 않은 호스트의 `controls.children` 규칙 기준까지 지워 무관한 쓰기 뒤 사용자 값을 덮어씀(SETTLE-004). N2 `controls.active` 식 선형 조회(03부터). N3 ERROR-125 건너뛰기 시험 공백. 공유 충돌 처분은 원장 관리자 판정 29C-03(`c75cd5028`, M11) | — |
| 2026-10-01 | U10 수정 ③ | codex: N1 정리 범위를 `source`·`occurrence`·`exitPolicy`로 나눔, 두 변형 시험 수정 전 실패. N2 청사진당 게이트 식 색인 — 조회는 0이나 게이트 달린 형제 N의 첫 로드는 여전히 이차(1k/8k 180/10633ms, 03부터, 원인 미분리) → 소유자 판단으로. N3 시험 추가(건너뛰기 제거 시 실패). N4 같은 정착·같은 종류 새 인스턴스는 엔진이 만들지 않음(레코드 재사용) — 시험 없음, `targetId` 유지. 29C-03 시험(옛 가드로 실패) | `8e6050b5f`, `83ec3fc48`, `098a817a3`, `45617b666` |
| 2026-10-01 | U10 재검증 ②–④ | 검증자(opus) 세 번 더 FAIL, 매번 앞 항목은 닫힘: 꺼진 조각의 `derived` 발화·중첩 호스트 조각 규칙 무발화(원천 선택을 "전부"로 대신 채움) → 직전 커밋 선택 사용(`0ff7fdb76`, `259f463d2`). 이로써 드러난 비루트 자기 선언 재선택 결함(M12) → 부모 형상 재계산(`7dc3ad093`). 조각이 켜질 때 형상에 남은 공유 노드의 규칙 발화 — FRAGMENT-050 (2) "기준점만 잡고 발화하지 않는다"와 어긋나 앞선 시험 기대값 다섯이 틀렸음 → 새로 들어온·다시 생긴·로드로 기준이 비워진 노드만 발화(`93affbcfd`). 게이트 달린 형제의 이차 첫 로드 원인 분리(`selectChildren.ts:181-183`, 03 코드, `15a3423a3`) | `0ff7fdb76`, `259f463d2`, `15a3423a3`, `7dc3ad093`, `93affbcfd` |
| 2026-10-01 | 원장 판정 | 조각 `controls.injectTo`는 청사진 오류가 맞음 — 허용 키는 CONTROLS-077·030의 닫힌 목록, FRAGMENT-050의 `injectTo` 열거는 조각 층에 대해 셋으로 읽음(29C-04, `ab06d0368`). 02 청사진 변경 없음. 설계 문서 두 곳의 같은 열거는 재생성 때 반영(04는 설계 문서를 건드리지 않음) | — |
| 2026-10-01 | U10 재검증 ⑤–⑥ | ⑤ FAIL: 식 없는 게이트(`if/then`, 판별자 `oneOf`)로 켜지는 정착에서 호스트를 방문하지 않아 켠 뒤 첫 원천 변화가 기준점으로 흡수(`93affbcfd`의 회귀) → DETAIL 선행 뒤 선언 선택이 바뀐 호스트를 방문(`81fc67c2a`, `8c45c128e`, 새 시험 7 수정 전 실패). ⑥ PASS(G25): probe 25종 차등 모두 BAD→OK, 변이로 새 시험 실패 확인, unit+render 368 파일·4,651 통과. 선택적 시험 공백(같은 길이 선택 교체)도 채움 | `81fc67c2a`, `8c45c128e`, 이 행의 커밋 |

## 3. 다음 행동

- PR [#351](https://github.com/vincent-kk/albatrion/pull/351)을 열었다. 이어서 `filid:enrich-docs`, filid 스캔 한 번(G24), `seiri:request-review`(antigravity), `seiri:receive-review`, 고침·재검증.
- 소유자 확인: 벤치 행 수용(G18), storybook(G23).

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
| M10 | 03부터의 정착 실패 경로: 계산 중 식이 하나라도 던지면 그 정착의 전이(채움)·나감 비움 전체를 건너뛰고, 04의 파생도 같은 `context.failure`로 라운드를 끊는다(`src/core/settle/utils/settlement/finishSettlement.ts:32-33`, `utils/derivation/runDeriveRounds.ts:31`, `utils/transition/finalizeExits.ts:46`) | 원장은 던짐의 효과를 자리 하나로 한정한다: 정착은 자리마다 정의된 값으로 마치고, 게이트는 그 게이트만 거짓, 파생 규칙은 그 규칙만 그 라운드 후보에서 빠짐, 나감 비움 생략은 던져 거짓이 된 게이트로 나간 노드와 함께 나가는 하위 트리뿐. 자동 쓰기 전체 제외는 예산 초과의 처분이다 | ERROR-121·122·125·126, SETTLE-011, WRITE-033, CONTROLS-022·023, 29C-02 | 03의 근사는 결정 기록이 없는 이탈(원장 관리자 판정, 28C-03의 `@` 사례와 같은 처리). 04에서 노드 단위로 좁혀 고친다 |
| M11 | 03까지 공유 충돌(`SHARED_NODE_CONFLICT`)이 난 정착도 `context.failure`로 파생·전이·나감 비움을 건너뜀. 29C-02 수정(`0d3c8092e`) 뒤에는 예산 초과만 멈춤 | 공유 충돌은 식·가드 실패와 같은 정착 오류 부류이고, 전순서에서 앞선 종류의 노드를 살린 계산 결과와 그 정착의 자동 쓰기를 커밋한 뒤 사슬 끝에서 던짐. 원본 B는 예산 초과의 처분 | BLUEPRINT-012·041, ERROR-070·159·164, SETTLE-011, 26C-05, 29C-03 (`c75cd5028`) | 현재 조건(`context.cause !== 'budget'`)이 원장과 맞음(원장 관리자 판정). 이를 단언하는 시험을 더함 |
| M12 | 03부터 루트가 아닌 노드는 자기 `if` 게이트가 뒤집혀도 자기 선언을 다시 고르지 않음 — `selectNodeSchema`는 루트만, 비루트는 부모의 `selectChildren`만 고르는데 게이트는 노드 자신을 형상 변경으로 표시(`settle/utils/compute/computeNode.ts:35`, `utils/gates/getGateRegistry.ts:146`, `utils/write/registerRecalculation.ts:29-33`). 유효 스키마·선택 id가 새 로드와 어긋남. 04의 "선언 전부" 대체가 파생에서 이를 가리다가 직전 커밋 선택으로 바꾼 `0ff7fdb76`에서 드러남(비루트 if/then 조각이 켜져도 `derived`·`resetInteraction` 무발화) | 게이트의 현재 평가가 형상과 선택을 정한다 | SETTLE-003, CONTROLS-026·077, SETTLE-049 | 04에서 고친다(파생과 맞닿음). 자기 선언의 게이트가 바뀐 값을 읽으면 부모를 형상 변경으로 표시해 부모의 `selectChildren`이 선언 선택·입력 분배·종류 처리를 함께 다시 하게 한다(`getGateRegistry.ts` `mayChangeOwnDeclarationAt`) |
| M8 | 03 코드 `settle/utils/paths/resolveDependencyPath.ts:5-11`, `settle/utils/gates/evaluateGate.ts:80`, `settle/utils/gates/getGateRegistry.ts:155`(호스트 경로 치환), `settle/utils/write/getDependencyIndex.ts:32`·`:42`(역의존 표에서 제외), 시험 `settle/__tests__/settle.gates.test.ts:72-84` | 03이 `@`를 호스트 `extras`로 읽었다 — 원장 근거 없음(03의 이탈) | CONTROLS-080 (3)·(6)·(8), 28C-03 | 04 U3·U4b가 `@`를 런타임 맥락 칸으로 고치고 역의존 표에 `@` 소유자를 들인다 |
