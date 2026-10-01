# 06 배열 — 실행 계획

Planning method: 저장소 지침 — `PLAN.md` §2(한 PR의 순서)와 `plan/prompts.md`의 단계 실행 절차, 소유자의 06 착수 승인(2026-10-01). 단위마다 채우는 단계·명령·기대 결과는 seiri `write-plan`의 불변식에서 가져온다. 구조 결정은 [execution-adr.md](execution-adr.md), 게이트 원장은 `.seiri/tasks/schema-form-array/gates.md`, 진행과 어긋남은 [log.md](log.md)에 적는다.

정본의 순서: 원장 `ledger/<area>.md`(`상태: 현행` 항목의 결정·보충·충돌 줄) > 계획서 `request.md`·`adr-and-axes.md`·`verification.md` > 이 계획. 이 계획이 원장과 다르게 읽히면 원장대로 간다. 최초 기준선(원문 경로와 해시)은 `log.md` §1에 있다. 원장 관리 세션 `albatrion-5c`가 질의 Q1–Q11에 답했고 33라운드(33C-01)와 35라운드(35C-01~12)로 적는다. 이 계획은 그 답을 반영했다(§2.3).

경로 약어: `PKG` = `packages/canard/schema-form`, `CORE` = `PKG/src/core`, `ARCH` = `PKG/architecture`, `SCN` = `packages/aileron/schema-form-scenarios`. 단계 번호와 원장 PR 번호의 대응은 03 = PR-2, 04 = PR-3 + PR-6, 05 = PR-4, 06 = PR-5, 07 = PR-7이다(LANDING-204).

## 1. 목표와 완료 기준

목표: 새 엔진에 배열을 들인다. (1) 행: `CORE/behaviors/arrayBehavior/`(`branch/`·`terminal/`·`utils/`)의 두 행과 비배열 행의 공유 거부 칸(LANDING-056·065·085·094, NODE-005·014). (2) 아이템 호스트: 자리 i의 청사진(`prefixItems[i]` > `items`)으로 아이템 노드를 모두 실체화하고, 통째 쓰기는 위치로 잇고, 청사진 없는 자리의 값은 호스트 `extras`에 둔다(NODE-051·052·053). (3) 구조 연산 다섯 `push`·`pop`·`update`·`remove`·`clear`를 동기 겉면 멤버로 들이고, 위치가 밀리면 이름·경로와 경로를 열쇠로 쓰는 런타임 저장소를 옮기며, 스냅숏 배열의 자리를 맞춘다(SURFACE-005, GOAL-058, WRITE-085·095·099). (4) 아이템 안에 선언된 식·게이트·파생·상태 키가 아이템마다 자기 실제 경로로 평가된다(CONTROLS-080, 35C-08). (5) `resolveArrayLimits`를 청사진으로 옮기고, 투영의 `omitEmpty`·`omitTrailing`을 비트 분기로 쓴다(LANDING-085·094, VALUE-034). 새 엔진은 07까지 `<Form>`에 닿지 않으므로 옛 시험 전체가 회귀 신호다(LANDING-159).

| 완료 기준(`request.md`) | 단위 | 관찰할 증거 |
| --- | --- | --- |
| `arrayBehavior/` 세 조직과 문서 | U2, U4 | 문서 선행 커밋 검사(G3), 행 시험·행 표 시험 초록(G5), 의존 방향 시험(G10) |
| 구조 연산·identity·스냅숏 자리 시험 | U5, U6, U7, U8 | §5 게이트 추적표의 시험 이름 태그(G6·G7·G8·G9)와 초록, 시나리오 수(G13) |
| `resolveArrayLimits` 이동, 필터의 비트 분기 | U3, U4 | 옮긴 시험 초록과 청사진 문서 갱신(G4), 투영 시험(G5) |
| 벤치 행(지연 실체화 판정 포함), `verification.md`의 게이트 전부 통과 | U9, U10, U11 | `verification/06-array/performance.md`의 세 행과 NODE-053 판정(G17·G18), 최종 게이트(G19–G25) |

비목표(원장 ID와 함께):

- 아이템 노드의 지연 실체화. 벤치 게이트가 실패하고 소유자가 느린 행을 받아들이지 않을 때만 그 대응으로 연다(NODE-053, 18C-59 ㅁ). 미리 만들지 않는다.
- 성능 최적화. 느린 행은 까닭과 함께 `verification/06-array/performance.md`와 `verification/performance-issues.md`에 적고 소유자 수용을 받는다(TEST-027, 27·30라운드 소유자 답).
- 배열 동사의 `dispatch` 진입 파일, 진입 사슬(깊이 계수·`onChange`·사슬 끝 throw), `batch` 합침, 경로가 바뀐 통지 `UpdatePath`의 배달, ERROR-197의 `onError` 보고. 나중에 머지하는 단계가 더한다(LANDING-084, EVENT-027·035·068, 33C-01, 35C-01·02).
- 공개 삽입 동사와 내부 삽입(35C-03). `minItems`까지 채우기와 `maxItems` 초과 차단(WRITE-022). `contains` 읽기(FRAGMENT-051).
- 배열 위치를 가리키는 `controls.children` 대상(35C-11). 어떤 배열을 터미널로 정하는가의 판정(청사진의 몫, 35C-12).
- 렌더 key·가상화·입력 구성 요소의 길이 제약, 시나리오 스토리와 e2e 실행기, 채움 시점 이주 행 셋의 이주 점검, 소비자 이름 이주(07, TEST-023 26C-02, LANDING-203).
- 레거시 삭제(09). 옛 `resolveArrayLimits`는 `src/__legacy__`에 그대로 남는다(LANDING-159).

## 2. 해석과 자율 결정

원장으로 답이 정해지는 것은 여기서 닫는다. 원장이 말하지 않은 자리는 원장 관리자의 편집자 결정(33C-01, 35C-01~12)으로 닫혔다. 막힌 단위는 없다. 35라운드 기록의 커밋은 원장 관리자 쪽에서 뒤따른다(`log.md`에 해시를 적는다).

### 2.1 해석 표

| # | 물음 | 채택한 해석 | 근거 | 상태 |
| --- | --- | --- | --- | --- |
| I1 | 아이템 노드의 이름과 경로 | 아이템 i는 이름 `"i"`, 경로 `<호스트 경로>/i`인 자식이다. 경로는 위치이고 JSON Pointer·`find`·로드 스냅숏이 모두 위치로 읽는다. 생성 순서의 정체성 키 `#n`은 공개하지 않는 레코드 칸에 둔다. 호스트는 키 계수를 가지며 계수는 되감지 않는다 | NODE-004·021, GOAL-073, SURFACE-054, CONTROLS-080(색인 마디는 `/n`), 35C-05 | 닫힘 |
| I2 | 통째 쓰기의 identity | 정착 안에서는 아이템 이름을 바꾸지 않는다. 새 값의 i번째는 이름 `"i"`의 기존 노드를 그대로 잇고(그 노드의 원본에 새 값을 쓴다), 길면 뒤에 새 키의 노드가 생기고, 짧으면 남는 노드는 소멸한다. 생김은 쓰기 종류로 정한다: 로드는 형상의 모든 노드를 생김으로, 로드가 아닌 통째 쓰기(`setValue(V)`·`Merge`가 준 배열·입력 쓰기·`injectTo`·`derived`)는 뒤에 새로 생긴 아이템만 생김으로 본다 | NODE-051, WRITE-090, WRITE-007 충돌 줄, WRITE-048·097, LANDING-164·202 | 닫힘 |
| I3 | 소멸과 나감 | 짧아진 통째 쓰기·`remove`·`pop`·`clear`·로드로 사라지는 아이템은 소멸이다: 노드와 그 자손을 NODE-044대로 떼어 마지막 커밋 읽기를 얼리되 나감 정책·나감 비움·잠복 보관·원본 B 나감 기록이 없고, 그 경로의 경로 열쇠 항목은 버린다. 게이트로 꺼진 아이템은 나감이다: 나감 정책·비움·잠복 보관이 적용되고 그 자리는 남아 VALUE-034대로 채운다 | WRITE-036, NODE-044, VALUE-034, 35C-08·09 | 닫힘 |
| I4 | 튜플과 `extras` | 자리 i의 청사진은 `prefixItems[i]`, 아니면 `items`(옛 철자 `items: [..]`이면 `additionalItems`는 청사진이 아직 컴파일하지 않으므로 U3에서 확인)이다. 청사진 없는 자리(닫힌 튜플의 꼬리)는 노드를 만들지 않고 그 값을 호스트 `extras`에 자리 순서로 둔다. 구조 연산으로 자리가 밀리면 값은 새 자리의 청사진 유무에 따라 노드와 `extras` 사이를 옮긴다. 청사진 없는 자리의 `push`도 막지 않는다 | NODE-052, VALUE-002, WRITE-022, LANDING-165 | 닫힘(`additionalItems`는 U3 확인 항목) |
| I5 | 구조 연산의 모양 | 겉면 메서드는 `node.behavior.arrange(node, operation)` 한 칸을 거쳐 settle의 구조 진입 함수 하나를 부른다. 행의 `arrange`는 순수 계획(새 자리마다 옛 자리 또는 새 값, 터미널은 새 원본 사본)을 돌려주고, 비배열 행은 공유 칸이 ERROR-197을 던진다. settle의 구조 진입은 계획을 적용하고(이름·경로 바꿈, 경로 열쇠 저장소 옮김, 스냅숏 자리 맞춤, 생김·소멸 기록) 정착을 한 번 돈다. 자기 진입 사슬은 없다(PR-2 꼴) | NODE-014, LANDING-056, TEST-069, 33C-01, 35C-01 | 닫힘(칸 이름 `arrange`는 자율 결정) |
| I6 | 다섯 동사의 뜻 | `push(v?)`: 끝에 새 키의 아이템, 원본은 `v`, 없음인 자손에만 채움, 스냅숏 자리에 `v`. `pop()`: 마지막 아이템 소멸, 스냅숏 자리 자름. `update(i, v)`: 그 아이템의 로드가 아닌 통째 쓰기(키·스냅숏 유지, 그 안에서 NODE-051). `remove(i)`: 그 아이템 소멸, 뒤 아이템의 이름·경로가 하나씩 당겨짐, 스냅숏 자리 자름. `clear()`: 모든 아이템 소멸, 스냅숏 배열 `[]`. 범위 밖·음수 색인의 `update`·`remove`, 빈 배열의 `pop`, 값이 `null`인 배열의 `update`·`remove`·`pop`은 오류 없는 무동작. 터미널 배열은 원본 사본 위에서 연산해 호스트를 통째로 쓴다(아이템 노드·재색인·아이템 스냅숏 자리 없음) | SURFACE-005, WRITE-007·085·088·095·099, NODE-005, GOAL-058, 35C-06·12 | 닫힘 |
| I7 | 동사의 반환 값 | 원장이 정하지 않았다. 옛 메서드의 반환을 동기로 지킨다: `push`는 연산 뒤 길이, `pop`·`remove`는 뺀 아이템의 직전 커밋 `value`(없으면 `undefined`), `update`는 쓴 뒤 그 아이템의 `value`(범위 밖이면 `undefined`), `clear`는 `void`. Promise를 돌려주지 않는다 | GOAL-058, `src/__legacy__/core/nodes/ArrayNode/ArrayNode.ts:140-185` | 자율 결정(되돌릴 수 있음, log §4) |
| I8 | 스냅숏 자리 맞춤 | 아이템을 만들거나 없애는 모든 쓰기는 호스트 경로의 스냅숏 배열을 아이템 목록과 같은 길이로 맞춘다: 없앤 자리는 자르고, 구조 연산의 새 자리에는 생성 값 `v`, 비구조 쓰기의 새 자리에는 `undefined`. 값은 싣지 않는다(O(배열 길이)). 호스트 경로에 스냅숏 배열이 없으면 `undefined` 자리의 배열을 만든다. 아이템을 만들지도 없애지도 않는 쓰기는 스냅숏을 건드리지 않는다. 삽입 동사가 없으므로 WRITE-099 게이트의 삽입 절반은 해당 없음 | WRITE-085·095·099, 18C-97·105, 35C-03 | 닫힘 |
| I9 | 투영 | 배열 호스트의 `local`은 아이템 방출의 배열이다. 방출 없는 아이템 자리는 객체 아이템 `{}`, 배열 아이템 `[]`, 잎 아이템 `null`로 채우고, 그 뒤에 `extras`를 자리 순서로 잇는다. `omitTrailing`은 채운 꼬리 자리를 자르고, `omitEmpty`(기본 켬)는 아이템 없는 `[]`를 방출하지 않는다. 두 선택은 정적 `options`이고 유효 스키마 메모와 함께 한 번 구한 비트로 분기한다. 원본과 상태는 바꾸지 않는다. 배열 루트에 방출이 없으면 `outputValue`는 `[]`. union 잎 아이템이 `{}`를 들고 `omitEmpty`가 켜져 있으면 그 자리는 `null` | VALUE-034·037, LANDING-085, CONTROLS-010, SCHEMA-039, GOAL-030, 18C-88 | 닫힘 |
| I10 | 아이템 안의 선언 | 청사진의 선언 경로는 배열 단계마다 아이템 마디 하나(`items`는 `*`, `prefixItems`는 `i`)를 둔다. 실행에서는 노드가 자기 실제 경로를 기준점으로 식을 평가해 `..`·`../1`·`./x`가 `/arr/3/...`에서 풀린다. 정적 역의존 표는 선언의 `*` 마디가 아무 색인과 맞도록 마디별로 맞추고, 결과 소유자 경로의 `*`를 바뀐 경로의 색인으로 묶는다. 다른 아이템을 가리키는 절대 경로(`/arr/0/x`)는 18C-13대로 배열 호스트 하위 트리에 기대므로 `/arr` 아래의 변화가 그 독자를 다시 평가한다. 게이트 자리 L의 계산, 파생 규칙 열쇠, 나감 정책 열쇠, 상태 키 층도 실제 경로로 묶는다. 청사진은 바꾸지 않는다 | CONTROLS-080, SETTLE-017·045, 18C-13, BLUEPRINT-030, 35C-08 | 닫힘 |
| I11 | 아이템 자신의 게이트 | `items` 스키마 자체의 `controls.active`나 게이트 있는 조각은 허용된다. 꺼진 아이템은 나감이고(I3) 자리는 남는다 | BLUEPRINT-030, VALUE-034, 35C-08 | 닫힘 |
| I12 | 비활성 배열 호스트의 잠복 원본 | 배열 값은 평범한 객체가 아니므로 호스트의 잠복 원본은 배열 값 전체를 자기 원본으로 얼린 것이다(아이템별 잠복 항목 없음). `inactiveValues`는 호스트 경로의 항목 하나다. 다시 들면 그 값으로 새 키의 아이템을 만들고 채움은 로드·비로드 규칙대로 없음인 자손에만 간다 | 26C-13·14, SETTLE-029, VALUE-002·029, WRITE-087, NODE-044, 35C-10 | 닫힘 |
| I13 | 원본 B의 배열 구조 기록 | 자동 쓰기(채움·`derived`·`injectTo`·`unsetValue`·나감 비움)가 배열 호스트의 아이템을 만들거나 없애면 정착 작업 칸에 {호스트, 직전 아이템 목록(차례대로의 노드 참조), 직전 아이템 수, 직전 `extras`}를 기록하고, 예산 초과 때 기존 자동 쓰기 로그와 함께 뒤에서부터 되돌린다. 되돌린 아이템은 커밋 형상에 나타나지 않으므로 생김이 아니고 채움도 없다. 키 계수는 되감지 않는다. 소멸은 나감이 아니므로 나감 기록이 없다. 터미널 배열은 구조 기록이 없고 호스트의 직전 원본만 기록한다 | LANDING-062 충돌 줄, TEST-069·018, WRITE-036, settle `DETAIL.md` 28행, 35C-05·12 | 닫힘 |
| I14 | `resolveArrayLimits`의 자리와 모양 | 청사진 fractal의 organ으로 옮기고 청사진 진입점이 이름으로 내보낸다. 유효 스키마의 `schema`를 받아 조각이 준 `minItems`·`maxItems`도 센다. 반환은 오늘처럼 `{ min, max }`(닫힌 튜플은 `prefixItems` 길이로 `max`를 좁힘). core 안에서는 쓰는 곳이 없고 옮긴 시험만 쓴다. 의도한 소비자는 렌더 계층의 입력 구성 요소(07·08)이며 그 의도를 `blueprint/DETAIL.md`에 적는다. 레거시는 자기 사본을 쓴다 | NODE-009, LANDING-085·094·159, WRITE-022, 35C-04 | 닫힘 |
| I15 | 공개 형과 겉면 | 다섯 메서드는 단일 클래스에 두고 형은 공개 `SchemaNode` 합집합의 `ArrayNode` 구성원(branch·terminal 둘)에만 준다. `SchemaNode/DETAIL.md` 멤버 표, 멤버 목록 시험(`toHaveLength(34)` → 39), 공개 형 시험, `tsc --strict`(`as`·`any` 없음, `node.children`이 저장 배열과 같은 참조)를 함께 고친다 | NODE-010·014, TEST-070 26C-01, SURFACE-056 | 닫힘 |
| I16 | 비배열에서 부른 동사 | 공유 칸이 `SchemaFormError`(가칭 코드 `ARRAY_METHOD_ON_NON_ARRAY`, 기록에 `path`·`details.method`)를 모든 환경에서 즉시 던진다. `onError` 보고는 하지 않고 그 칸의 DETAIL에 "보고는 dispatch 배선 PR이 더함" 한 줄을 남긴다. 코드 이름은 05 세션에 알렸다(이름 확정은 05) | NODE-014, ERROR-164·197, 35C-01 | 닫힘 |
| I17 | `batch`·통지를 쓰는 사례 | 06은 상태 신호(값·`revision`·경로·`defaultValue`·잠복·진단)만 단언한다. `batch` 합침, 진입마다 한 번의 `onChange`, `UpdatePath` 배달은 단언하지 않는다. `batch`가 필요한 이식 사례는 루트 `setValue` 한 번으로 바꾸거나 05로 넘긴다 | 26C-03, 33C-01, 35C-02, 04 `log.md` §4 M5 | 닫힘 |
| I18 | 지연 실체화의 판정 | 벤치 세 행을 옛 판과 같은 실행에서 견준다. 느리지 않으면 통과. 느린 행은 까닭과 함께 기록해 원장 관리자를 거쳐 소유자 수용을 받는다. 수용되면 통과이고 지연 실체화를 넣지 않는다. 수용되지 않으면 NODE-053의 실패 대응(두 모드 시험으로 관찰 동일성을 보인 경우에만 지연 실체화, 아니면 소유자 상신)을 연다. 판정은 통과·실패 모두 `log.md`에 적는다 | NODE-053, TEST-027·032, 18C-59 ㅁ, 30라운드 소유자 답 | 닫힘 |
| I19 | 시나리오 어휘 | SCN의 단계 형에 `pop`·`clear`가 없으면 더한다(`push`·`remove`·`update`는 이미 있음, `SCN/src/types.ts:27-38`). 새 부류 `array`를 둔다. 코어 시나리오 실행기 `executeCoreScenarioStep`가 다섯 동사를 실행하게 한다(오늘은 `push`·`remove`·`update`에서 던짐). 스토리·e2e는 07 | TEST-011·023, 26C-02 | 자율 결정 |
| I20 | 채움 시점 이주 행의 배열 장면 | LANDING-202의 장면(배열 통째 `setValue`)을 오늘 코드(레거시)와 새 구현에서 돌린다. 오늘은 탐침 P8대로 `[{"a":"x"},{"a":"x"}]`, 새 구현은 `[{}, {"a":"x"}]`(남은 아이템은 채우지 않고 뒤에 새로 생긴 아이템만 채움). 나머지 두 장면은 07 | LANDING-200–203, 18C-99, `reviews/raw-round18-tests/t1b-fill-consistency.md:116-133` | 닫힘 |

### 2.2 원장·계획서·코드 어긋남(U0에서 `log.md` §4로 옮김)

| ID | 자리 | 어긋남 | 원장 | 처리 |
| --- | --- | --- | --- | --- |
| M1 | `request.md:11`·`:15` | LANDING-065 본문은 동사를 `push`·`remove`·`update` 셋으로 적음 | SURFACE-005(충돌 줄로 이김): 다섯 | 다섯을 구현 |
| M2 | `request.md:18`, `verification.md` 스냅숏 줄 | WRITE-095의 "새 자리는 `undefined`"만 인용 | WRITE-099(18C-105)가 구조 연산의 새 자리를 `v`로 좁힘 | I8대로 |
| M3 | `request.md:16` 등 | "로드(`setValue(V)`·`reset`·마운트)" 문구가 남은 원장 인용 | WRITE-090(충돌 줄로 이김): `setValue(V)`는 로드가 아님 | I2대로 |
| M4 | `verification.md` 게이트 줄 "`push`·삽입" | 삽입 동사가 없음 | SURFACE-005, 35C-03 | 삽입 절반은 해당 없음으로 기록 |
| M5 | `CORE/behaviors/DETAIL.md:12` | "터미널 배열 행은 06단계에서 추가" — 배열 branch 행도 06이 더함 | LANDING-065·094 | U2에서 문서를 고침 |
| M6 | `CORE/settle/DETAIL.md:28` | "배열 구조의 생성·폐기 로그는 PR-5에서 더한다" | LANDING-062 충돌 줄, 35C-05 | U5에서 구현하고 문장을 현행 계약으로 바꿈 |
| M7 | `CORE/record/utils/updateSchemaNodeNameAndPath.ts` | 한 노드의 다섯 칸만 바꾸고 제품 호출자가 없음 | NODE-004·051 | U6이 자손 경로와 경로 열쇠 저장소를 함께 옮기는 organ을 세우고 이 함수를 그 안에서 쓴다 |

### 2.3 원장 질의와 답(33·35라운드)

| 질의 | 답 | 반영 |
| --- | --- | --- |
| 배열 동사의 `dispatch` 진입 파일은 누가 더하나 | 나중에 머지하는 단계(33C-01). 06이 먼저 머지되면 PR-2 꼴(정착 호출 하나) | 비목표, I5, I17 |
| Q1 ERROR-197 | 던짐은 06, `onError` 보고는 dispatch 배선 PR(35C-01) | I16 |
| Q2 `UpdatePath` | 06은 레코드의 경로 바꿈과 (이전, 지금) 사실까지, 배달은 PR-4(35C-02) | I17, U6 |
| Q3 삽입 | 공개·내부 모두 없음(35C-03) | I6, I8, M4 |
| Q4 `resolveArrayLimits` | 청사진 진입점, 유효 스키마 입력, 의도 기록(35C-04) | I14, U3 |
| Q5 원본 B 구조 기록 | 제안대로, 키 계수는 되감지 않음(35C-05) | I13 |
| Q6 범위 밖 색인 | 레거시대로 무동작, 시험으로 고정(35C-06) | I6 |
| Q7 아이템 안의 선언 | 06의 몫, 실제 경로 기준, `*` 마디 맞춤, 꺼진 아이템은 나감·자리 유지(35C-08) | I10, I11, U7 |
| Q8 소멸 | NODE-044의 떼기, 나감 처리 없음(35C-09) | I3 |
| Q9 비활성 배열 호스트 | 배열 값 전체를 호스트 잠복 원본으로(35C-10) | I12 |
| Q10 `controls.children` | 객체 전용, 06은 코드·경고를 더하지 않음(35C-11) | 비목표 |
| Q11 터미널 배열 | 전략은 청사진의 것, 06은 행만(35C-12) | I6, I13 |

## 3. 구조

### 3.1 새 fractal과 새 organ

- 새 fractal `CORE/behaviors/arrayBehavior/`: `arrayBehavior.ts`(행 둘을 `{ branch, terminal }`로 내는 진입 구현), `index.ts`, `INTENT.md`, `DETAIL.md`, organ `branch/`·`terminal/`·`utils/`. `utils/`에 `omitTrailingArray`·`omitEmptyArray`(레거시에서 복사해 새 규칙으로), 자리 청사진 선택, 구멍 채움, `extras` 잇기, 구조 계획 보조를 주제별 하위 디렉토리로 둔다(LANDING-056·085, NODE-009). 객체 행 `objectBehavior/`와 같은 모양이다.
- `CORE/behaviors/utils/slots/`에 공유 거부 칸 하나(비배열의 `arrange`, ERROR-197)를 더한다.
- `CORE/blueprint/utils/`에 `resolveArrayLimits/`(옮김)와 아이템 자리 항목 보조(가칭 `getItemEntry`, 아래 D2)를 둔다.
- `CORE/settle/utils/`에 새 organ `structure/`: 구조 진입의 적용(계획 → 아이템 목록), 이름·경로 바꿈과 경로 열쇠 저장소 옮김, 스냅숏 자리 맞춤, 소멸 처리, 원본 B 구조 기록. `CORE/settle/utils/paths/`에 템플릿 경로 묶기(`*` 마디).
- 레코드에 칸 셋: 아이템의 정체성 키, 배열 호스트의 아이템 수, 키 계수(D3). 이름은 U2에서 `record/DETAIL.md`와 함께 정한다.

### 3.2 의존 방향

`blueprint < record < {behaviors(종류 fractal → 뿌리), navigation} < settle/derive < settle < SchemaNode`는 그대로다. `arrayBehavior/`는 `record`·`blueprint`·behaviors 공유 organ만 소비하고 behaviors 뿌리·`settle`·`SchemaNode`를 형 수준으로도 가져오지 않는다(NODE-009·016). 구조 연산의 효과는 settle의 `structure/` organ 한 곳에 있고 행의 `arrange`는 순수하다. `CORE/__tests__/dependencyDirection.test.ts`에 `arrayBehavior`를 더해 매 실행 단언한다.

### 3.3 바뀌는 계약 문서(코드보다 먼저, U2)

| 문서 | 바뀌는 것 |
| --- | --- |
| `arrayBehavior/INTENT.md`·`DETAIL.md`(새) | 두 행의 칸, 자리 청사진, 구멍 채움과 `extras`, 투영 비트, `arrange` 계획의 모양, 터미널 연산, ERROR-197의 보고 표시 줄 |
| `behaviors/DETAIL.md` | 행 열(여덟 → 열), 칸 순서에 `arrange` 추가, 공유 거부 칸, M5 문장 |
| `blueprint/DETAIL.md` | `resolveArrayLimits`의 계약과 의도한 소비자, 아이템 자리 항목 보조 |
| `record/DETAIL.md` | 새 칸 셋과 그 비용(노드당 메모리), `Behavior`의 `arrange` 칸, 구조 계획 형 |
| `settle/DETAIL.md` | 배열 분배(평범한 객체 대신 배열), 위치 잇기, 소멸과 나감, 구조 진입 함수, 경로 열쇠 옮김, 스냅숏 자리, 원본 B 구조 기록(M6), 템플릿 경로 묶기 |
| `SchemaNode/DETAIL.md`·`INTENT.md` | 멤버 표 다섯 줄, 공개 형의 배열 메서드, "배열 메서드는 06" 문장 제거 |
| `core/DETAIL.md` | 진입점이 내보내는 새 이름(구조 진입은 settle 내부라 내보내지 않으면 변화 없음 — U2에서 확인) |

## 4. 작업 단위

| 역할 | 담당 |
| --- | --- |
| 설계·조율·커밋·로그 | 이 세션 |
| 구현(단위마다 한 세션) | codex(cennad 경유). 멈추면 Claude `worker`(sonnet·medium)로 대체하고 로그에 적음 |
| 계획 리뷰·원장 대조·PR 뒤 약식 리뷰 | antigravity(cennad 경유). 멈추면 Claude `verifier`(opus)로 대체 |
| 실패 원인 | Claude `debugger`(opus·high) |
| 최종 게이트 판정 | 새 컨텍스트의 Claude `verifier`(opus·xhigh) |

U3–U7은 앞 단위의 계약에 기대므로 차례로 간다. U8·U9·U10은 U7 뒤 병렬로 갈 수 있다. 파일마다 작성자는 하나다.

### U0 착수 — 이 계획, ADR, 게이트 원장, 원장 질의

- 이 계획·`execution-adr.md`·`.seiri/tasks/schema-form-array/gates.md`를 쓰고, §2.2를 `log.md` §4로 옮기고, 원장 질의 답(33C-01, 35C-01~12)을 `log.md`에 적는다.
- 계획 리뷰(antigravity, `seiri:review-plan`)를 받아 `cleared`까지 고친다(G1). 판정은 §9.
- 완료: G1·G2.

### U1 레거시 확인

- `ArrayNode`와 전략·시험·`resolveArrayLimits`·`omitTrailingArray`·`omitEmptyArray`·`resolveArrayValueFilter`가 `src/__legacy__/` 아래에만 있는지 확인한다(03 U1이 옮김, LANDING-159·205). 06이 옮길 파일은 0이다. PR 본문 "레거시 이동 목록"에 "03에서 완료, 06 이동 0"으로 적는다.
- 완료: G2.

### U2 문서 선행 — 새 fractal과 바뀌는 계약

- §3.3의 문서를 고치고 새 fractal의 INTENT·DETAIL을 쓴다. 코드는 넣지 않는다. 한 커밋(`docs(schema-form): ...`)으로 코드보다 먼저 들어간다(filid 배치 §5, `request.md` 절차).
- 완료: G3(문서 선행 커밋이 첫 코드 커밋보다 앞섬).

### U3 청사진 — `resolveArrayLimits` 이동과 아이템 자리 항목

- 원장: LANDING-085·094, NODE-009·052, WRITE-022, BLUEPRINT-005·048, SCHEMA-001, 35C-04.
- 붉은 시험 먼저(`blueprint/__tests__/`): 옮긴 `resolveArrayLimits` 시험(레거시 시험을 새 입력 형으로 옮김, 조각이 준 `minItems`·`maxItems` 사례 추가), 아이템 자리 항목 시험.
- `resolveArrayLimits`: 레거시 함수를 `blueprint/utils/resolveArrayLimits/`로 복사해 유효 스키마의 `schema`를 받게 하고 `blueprint/index.ts`가 이름으로 내보낸다. 레거시 사본과 그 소비자는 그대로 둔다.
- 아이템 자리 항목: 배열 템플릿의 자리 i에 대해 `BlueprintChildEntry`와 같은 모양(이름 `"i"`, 노드 = `prefixItems[i] ?? item`, 선언 = 그 템플릿의 선언을 `populateNodeChildren`이 속성 항목에 하는 방식으로 다시 묶은 것, `hostPath`)을 돌려주는 보조. 선언 경로는 템플릿 경로(`/arr/*`, `/arr/i`)를 그대로 둔다(I10). 템플릿과 색인별로 지연 메모해 같은 자리는 같은 참조다. 청사진 없는 자리는 `undefined`.
- 확인 항목: 옛 철자 `items: [..]` + `additionalItems`가 지금 청사진에서 어떻게 되는지(`populateNodeChildren.ts:102-139`는 `additionalItems`를 컴파일하지 않음). 컴파일되지 않으면 그 자리는 청사진 없는 자리로 보고(값은 `extras`), 이 차이를 `log.md` §4에 적고 원장 관리자에게 알린다(청사진 확장이 필요하면 06이 하되 BLUEPRINT 항목을 확인한 뒤).
- 완료: 청사진 시험 초록, `blueprint/DETAIL.md` 갱신 확인(G4).

### U4 배열 행 — `arrayBehavior/`와 공유 거부 칸

- 원장: LANDING-056·065·085·094, NODE-002·005·006·014·021·047·052, VALUE-002·034·037, CONTROLS-010, SCHEMA-039, ERROR-197, 35C-01·12.
- 붉은 시험 먼저(`behaviors/arrayBehavior/__tests__/`, `behaviors/__tests__/rows.test.ts`·`slotOrder.test.ts`).
- `Behavior`(`record/type.ts:82-97`)에 `arrange` 칸을 `declareChildren` 뒤에 더한다. 모든 행이 같은 키 순서를 갖도록 공유 기본 칸 위에 덮는다. 비배열 행의 `arrange`는 공유 거부 칸 하나(같은 함수 참조).
- `array.branch`: `interpret`(배열·`null`·그 밖의 그대로), `assemble`(아이템 방출 + 구멍 채움 + `extras` 잇기, 같은 결과면 이전 참조 재사용), `project`(I9의 비트 분기; 옛 `resolveArrayValueFilter`의 뜻을 투영 칸으로), `finishInput`(쓰기 없음), `declareChildren`(아이템 수만큼 자리 항목, 청사진 없는 자리 제외), `arrange`(I6의 계획).
- `array.terminal`: `interpret`, `assemble`(원본 그대로), `project`(같은 비트 분기), `declareChildren`(없음), `arrange`(원본 사본 위의 새 원본).
- `BEHAVIORS`에 `array: { branch, terminal }`을 더한다. `schemaNodeFactory`가 배열에서 더 던지지 않는다.
- 완료: 행 시험 초록, 행 표 시험 "열 행", ERROR-197 시험(비배열 다섯 동사 각각), G5.

### U5 정착 ① — 통째 쓰기, 위치 잇기, 소멸, 잠복, 원본 B

- 원장: NODE-051·052·053, WRITE-007·013·036·048·082·085·090·095·097, VALUE-034, SETTLE-005·011·027·029·047, LANDING-164·202, 26C-13·14, 35C-05·08·09·10.
- 붉은 시험 먼저(`settle/__tests__/`의 배열 파일들, 시험 이름에 ID 태그).
- 그릇 판정의 일반화: 객체 호스트는 평범한 객체, 배열 호스트는 배열을 분배 입력으로 본다. `markWrite`(분배와 하위 표시), `enterSchemaNode`(들어오는 아이템의 입력), `selectChildren`(입력 소유 판정), `transitionSettlement`의 잘못된 종류 조상 판정(배열 호스트가 비배열 원본을 들면 그 아래는 비로드 쓰기에서 채우지 않음), `distributeLatentValue`(배열 값은 호스트 잠복 원본 하나, I12)를 고친다. 배열 호스트에 배열이 오면 아이템 수를 그 길이로 정하고 청사진 없는 꼬리는 `extras`에 둔다.
- 위치 잇기(I2): 이름이 위치이므로 기존 이름 기준 선택이 그대로 위치를 잇는다. 생김 판정은 쓰기 종류대로(로드는 모두, 비로드 통째 쓰기는 새 꼬리만).
- 소멸(I3): 아이템 수가 줄어 선언되지 않은 자리의 옛 아이템은 대기 나감이 아니라 소멸 집합으로 보내고, 커밋에서 NODE-044대로 떼되 나감 정책·비움·잠복 보관을 하지 않으며 그 경로의 경로 열쇠 항목을 버린다. 게이트로 꺼진 아이템은 기존 나감 경로를 탄다.
- 스냅숏(I8): 비구조 쓰기가 아이템을 만들거나 없애면 호스트 경로의 스냅숏 배열 길이를 맞춘다(새 자리 `undefined`). 로드는 스냅숏을 통째로 바꾸므로 따로 맞추지 않는다.
- 원본 B(I13): 자동 쓰기의 배열 구조 기록과 `restoreSourceB`·`withdrawDetachedFills`에서의 되돌림.
- 확인 시험: WRITE-095의 실패 장면(`defaultValue={items:['a','b']}`, `setValue({items:['x']})` 뒤 `setValue({items:['x','z']})` → 새 아이템의 `defaultValue`는 `undefined`, `resetSubtree()`는 채움을 줌), LANDING-202(I20), 빈 배열 호스트·루트 방출(VALUE-034), `reset` 로드의 identity(WRITE-048), 비활성 배열 호스트의 잠복과 재진입(I12), 원본 B 구조 되돌림(예산 초과를 일으키는 채움이 배열 아이템을 만드는 사례).
- 완료: §5의 U5 행 태그, 03·04 정착 시험 초록(G6·G7).

### U6 정착 ② — 구조 연산과 겉면 멤버

- 원장: SURFACE-005·056, NODE-005·010·014·044·051·052, WRITE-007·022·085·088·095·099, GOAL-058·073, EVENT-068(사실만), TEST-070, 35C-01·02·03·05·06.
- 붉은 시험 먼저(`settle/__tests__/`, `SchemaNode/__tests__/`).
- settle 구조 진입 함수 하나(가칭 `arrangeSchemaNodeItems(node, operation)`, settle 진입점이 이름으로 내보냄): `node.behavior.arrange`의 계획을 받아 (1) 새 아이템 목록을 만든다(옛 노드 재사용, 새 자리는 노드 생성·새 키, 빠진 노드는 소멸), (2) 자리가 바뀐 아이템과 그 자손의 이름·경로를 바꾸고 경로 열쇠 저장소를 옮긴다, (3) 스냅숏 자리를 맞춘다(구조 연산의 새 자리는 `v`), (4) 생김(채움 대상)과 소멸을 정착 작업 칸에 적고, (5) 표시 → 계산 → 파생 → 전이 → 커밋을 한 번 돈다. `update`는 그 아이템에 `writeSchemaNode(item, v, 'callerReplace')`와 같은 경로를 탄다.
- 경로 열쇠 저장소 옮기기(`settle/utils/structure/`): 게이트 경로 색인(`getGateRegistry`의 경로 맵), 잠복 원본과 메타데이터, `committedDeclarationIds`, 파생·나감 정책 규칙 기준값과 두 색인, `typeMismatchPaths`. 경로 접두로 찾는 메모(`typeMismatchesMemo`·`inactiveValuesMemo`·`inactiveValueEntries`)는 호스트 조상 경로부터 무효화한다. `record/utils/updateSchemaNodeNameAndPath.ts`를 자손까지 부르는 걷기로 감싼다(M7). 옮길 저장소 목록은 시험 하나(저장소마다 "옮긴 뒤 옛 경로에 항목 없음, 새 경로에 같은 항목")로 고정한다.
- 경로 바뀜 사실(35C-02): 바뀐 노드의 (이전, 지금) 경로를 정착 작업 칸에 모은다(배달은 PR-4). 시험은 바뀐 경로(상태 신호)만 단언한다.
- 겉면: `SchemaNode.ts`에 다섯 메서드(한 문장 위임), `SchemaNode/type.ts`의 `ArrayNode` 두 구성원에 메서드 형, DETAIL 멤버 표, `surface.test.ts`(39), `type-contract.test.ts`, `tsc --strict` 형 시험(TEST-070). 05와 같은 파일이므로 이어진 덩어리로 둔다(log §0 합의).
- 터미널 배열: 계획의 새 원본으로 호스트를 통째로 쓴다(`callerReplace`와 같은 비로드 통째 쓰기). 아이템 스냅숏 자리 없음.
- 확인 시험: 동사마다 identity(노드 참조·키)와 스냅숏 자리(`push('x')` 뒤 새 아이템 `defaultValue`가 `'x'`이고 `resetSubtree()`가 `'x'`로 되돌림, WRITE-099), `remove(0)` 뒤 당겨진 아이템의 `dirty`·`touched`·잠복·`typeMismatch`·게이트 색인이 데이터를 따라감, 닫힌 튜플의 `remove(0)`에서 값이 `extras`에서 노드로 옮김(NODE-052 예), 범위 밖 무동작(35C-06), `null` 터미널 배열의 무동작, 소멸한 아이템 참조의 쓰기(살아 있는 같은 경로면 무동작, `pop` 뒤면 잠복 원본), 키 계수의 단조성(원본 B 되돌림 뒤에도), ERROR-197.
- 완료: §5의 U6 행 태그, 겉면 시험·형 시험 초록(G8·G10).

### U7 아이템 안의 선언 — 템플릿 경로 묶기

- 원장: CONTROLS-080, SETTLE-017·045, 18C-13, BLUEPRINT-030, CONTROLS-073(아이템 안 객체의 `children`은 그대로), 35C-08.
- 붉은 시험 먼저(`settle/__tests__/`, `settle/derive/__tests__/`): 아이템 안 형제 필드를 읽는 `controls.visible`·`readOnly`, 아이템 안 `derived`·`unsetValue`, 아이템 안 `if/then` 게이트, 아이템 자체의 `controls.active`(꺼진 아이템은 나감, 자리 유지·구멍 채움), 다른 아이템을 가리키는 절대 경로(`/arr/0/x`)와 `../1`, 배열 전체를 값으로 읽는 식(`(../items).length`), `remove(0)` 뒤에도 각 아이템의 식이 자기 데이터로 평가됨.
- `settle/utils/paths/`에 템플릿 경로를 실제 경로로 묶는 보조. 역의존 색인(`getDependencyIndex.ts`)의 `affected`가 `*` 마디를 아무 색인과 맞추고 소유자 경로를 묶어 돌려준다. 게이트 등록·자리 L 계산(`getGateRegistry`·`resolveGateOccurrence`), 파생 규칙 소스·대상 해석(`getDeriveSourceNodes`·`getRuleTargets`·`getInjectTarget`), 상태 키 층(`getControlLayers`), 나감 정책 열쇠가 노드의 실제 경로를 기준으로 한다. 절대 경로로 다른 아이템을 읽는 독자는 배열 호스트 하위 트리 전체에 기댄다(18C-13).
- 확인 항목(작업 중 발견, 범위 안): 위 목록 밖에서 템플릿 경로를 실제 주소로 쓰는 자리가 나오면 같은 보조로 고치고 로그에 적는다.
- 완료: §5의 U7 행 태그, 04 파생·상태 키 시험 초록(G9).

### U8 시나리오와 SCN 부류

- 원장: TEST-011·018·023, NODE-051·052·053, WRITE-095·099, VALUE-034, LANDING-202·203, 26C-02.
- SCN에 `array` 부류(`SCN/src/array/`의 `*.scenario.ts`, 이름 `array.<slug>`, 모든 단계에 `expect`)와 필요한 단계 어휘(`pop`·`clear`). `SCN/src/__tests__/families.test.ts`의 부류 표에 더한다.
- 코어 시나리오 시험 `CORE/__tests__/scenarios/array.spec.ts`와 실행기 `executeCoreScenarioStep`의 다섯 동사.
- 장면: 구조 연산마다 identity와 스냅숏 자리, 통째 교체 뒤 아이템 노드 참조, `items`·`prefixItems`, 터미널 배열 행의 다섯 동사, `omitTrailing`, 원본 B의 배열 아이템 구조 기록, 위치 재조정(키 유지와 위치를 따라가는 상태), 청사진 없는 자리의 `extras` 보존, 구조 연산에서 값이 노드와 `extras` 사이를 옮김, 채움 시점 이주 행의 배열 장면(I20), 빈 배열 호스트·루트 방출.
- 완료: SCN 시험·형·lint 초록, 코어 시나리오 초록, 부류 장면 수 기록(G13).

### U9 회귀 이식

- 원장: TEST-069 (라), 26C-01·03, 25C-11, VALUE-034, GOAL-074.
- 이식: 03 `log.md` §4의 넘어온 사례(§6.1 표), VALUE-034 게이트의 오늘 단언(`ObjectNode.test.ts:57`의 배열 대응, `ArrayNode.defaultValue.test.ts:187-188`, `ArrayNode.clear.test.ts:41`, `virtual.render.test.tsx:66,199`의 배열 부분, `items.default` 없는 `push()`), GOAL-074의 분기 복원 회귀(비활성화가 원본을 건드리지 않음). 새 엔진에서 기대가 다른 행은 LANDING의 이주 행과 대조해 적는다.
- 완료: 이식 수와 넘긴 사례를 `log.md`에 기록(G14·G15).

### U10 벤치

- 원장: NODE-053·055, TEST-027·032·072, 18C-59 ㅁ.
- `PKG/bench/array.bench.ts`(03·04 벤치와 같은 독립 스크립트, 같은 입력을 새 엔진과 레거시에 넣음): "긴 배열(아이템 10,000개) 안의 키 입력", "array 1000 루트 통째 쓰기", "노드당 메모리". Node와 Bun 각각.
- 기록: `ARCH/verification/06-array/performance.md`(환경과 재현 명령, 행마다 수치·표본 수·판정). 느린 행은 `ARCH/verification/performance-issues.md`의 열림 표에 더하고 원장 관리자에게 소유자 수용을 요청한다. 03·04 벤치를 다시 재어 06이 앞 행을 느리게 했는지 함께 적는다.
- 판정(I18)을 `log.md`에 적는다.
- 완료: G17·G18.

### U11 최종 검증과 PR

- §8 명령 전부, 옛 시험 전체 초록, `seiri:verify`(새 컨텍스트 verifier에 최초 기준선·원장·계획·diff·근거), PR 본문(완료 기준·리뷰 체크리스트·원장 어긋남·넘긴 사례·레거시 이동 목록·33C-01의 진입 파일 문장), `PLAN.md` §3 06 → 리뷰. PR 뒤 `filid:enrich-docs`·`filid:scan`·약식 리뷰(antigravity)·수정·재검증(`plan/prompts.md` §8).
- 완료: G19–G25.

## 5. 게이트 추적표 — 원장이 PR-5에 배정한 단언

시험 이름에 원장 ID를 태그로 싣는다. "시험 자리"는 붉은 시험을 먼저 둘 디렉토리다.

| 원장 | 단언 | 시험 자리 | 단위 |
| --- | --- | --- | --- |
| TEST-018, NODE-051 | 통째 교체 뒤 아이템 노드 참조가 위치로 이어지고 새 꼬리만 새 키 | `settle/__tests__/` | U5 |
| NODE-051, LANDING-164 | 통째 쓰기 뒤 `dirty`·`touched`(상태 칸)·노드 참조가 위치를 따름. 바깥 오류는 오류 칸이 들어오는 05, 가상화 기록은 렌더 계층의 07에서 같은 규칙으로 단언(§6.2) | `settle/__tests__/` | U5 |
| WRITE-090, LANDING-202 | 비로드 통째 쓰기는 남은 아이템을 다시 채우지 않고 새 꼬리만 채움 | `settle/__tests__/`, 시나리오 | U5, U8 |
| WRITE-048 | `reset` 로드의 아이템 identity에 예외 없음 | `settle/__tests__/` | U5 |
| WRITE-095(18C-97) | 비구조 쓰기의 새 자리 `undefined`, 실패 장면, 입력 쓰기·`Merge`로 수 바꿈 | `settle/__tests__/` | U5 |
| WRITE-099(18C-105), 35C-03 | `push('x')` 뒤 `defaultValue`가 `'x'`, `resetSubtree()`가 `'x'`로 | `settle/__tests__/` | U6 |
| WRITE-007, WRITE-088 | `push(v)`는 구조 연산이고 없음인 자손에만 채움 | `settle/__tests__/` | U6 |
| NODE-052 | 청사진 없는 자리의 `extras` 보존·방출, `remove(0)`에서 `extras` → 노드 | `settle/__tests__/` | U5, U6 |
| NODE-005, 35C-12 | 터미널 배열 행의 다섯 동사가 원본 사본 위에서 | `behaviors/arrayBehavior/__tests__/`, `settle/__tests__/` | U4, U6 |
| SURFACE-005, GOAL-058 | 다섯 동사가 동기, Promise 없음 | `SchemaNode/__tests__/` | U6 |
| 35C-06 | 범위 밖·음수·빈 배열·`null` 무동작 | `settle/__tests__/` | U6 |
| NODE-014, ERROR-197, 35C-01 | 비배열의 다섯 동사가 즉시 던짐, `path`·`details.method` | `behaviors/__tests__/`, `SchemaNode/__tests__/` | U4, U6 |
| TEST-070, 26C-01 | 배열 멤버의 `tsc --strict`(`as`·`any` 없음), `children`이 저장 배열과 같은 참조 | `SchemaNode/__tests__/` | U6 |
| 25C-11, NODE-057 | 배열 아이템의 `schemaType`이 청사진 칸과 같은 참조 | `SchemaNode/__tests__/` 또는 `settle/__tests__/` | U5 |
| VALUE-034(18C-88), VALUE-037 | 빈 배열 호스트·루트 방출, 구멍 채움(`{}`·`[]`·`null`), union 잎 `null`, `omitTrailing` | `behaviors/arrayBehavior/__tests__/`, `settle/__tests__/` | U4, U5 |
| LANDING-062 충돌 줄, TEST-069, 35C-05 | 원본 B의 배열 구조 기록과 되돌림, 키 계수 단조 | `settle/__tests__/` | U5 |
| WRITE-036, 35C-09 | 소멸은 나감이 아님(정책·비움·잠복 없음), 떼어진 참조 규칙 | `settle/__tests__/` | U5, U6 |
| 35C-10 | 비활성 배열 호스트의 잠복 원본 하나와 재진입 | `settle/__tests__/` | U5 |
| CONTROLS-080, 35C-08 | 아이템 안의 식·게이트·파생·상태 키, 꺼진 아이템의 자리 | `settle/__tests__/`, `settle/derive/__tests__/` | U7 |
| 35C-02 | 구조 연산 뒤 아이템·자손 경로 | `settle/__tests__/` | U6 |
| LANDING-085·094, 35C-04 | `resolveArrayLimits` 이동, 유효 스키마 입력 | `blueprint/__tests__/` | U3 |
| GOAL-074 | 분기 복원에서 꼬리 빈 아이템을 잃지 않음 | `settle/__tests__/` | U9 |
| NODE-053, TEST-032 | 벤치 세 행과 판정 | `bench/array.bench.ts` | U10 |

## 6. 회귀 이식과 넘기는 사례

### 6.1 06 몫

| 원천 | 사례 | 기대 | 단위 |
| --- | --- | --- | --- |
| 03 `log.md` §4(26C-03), `spikes/round9/regress/selfcheck-v5.mjs:516-519` | 객체 루트의 `tail` 배열, `omitTrailing`, 로드 `['a', null, null]` | 방출 `{ tail: ['a'] }`, 원본 `['a', null, null]` 그대로 | U9 |
| 03 `log.md` §4 11행(WRITE-099) | `push('x')` 스냅숏 | §5 WRITE-099 행 | U6 |
| 03 `log.md` §4 11행(TEST-070, 26C-01) | 배열 멤버 형 검사 | §5 TEST-070 행 | U6 |
| 03 `log.md` §4 11행(25C-11) | 배열 아이템 `schemaType` 참조 동일성 | §5 25C-11 행 | U5 |
| 03 `log.md` §4 12·18행, `spikes/round18/proto/__tests__/rootOutput.test.mjs:13` | 배열 루트, 잎 아이템, 로드 `[]` | `value`·`outputValue` `[]` | U9 |
| 같은 파일 `:24` | 로드 `[undefined, 'x']` | `[null, 'x']` | U9 |
| 같은 파일 `:30` | 객체 아이템 `[{}, {a:1}, {}]`; 잎 아이템 `omitTrailing`, `[undefined,'x',undefined]` | `[{}, {a:1}, {}]`; `[null, 'x']` | U9 |
| VALUE-034 게이트의 오늘 단언 | §4 U9 목록 | 블록대로, 오늘과 다르면 LANDING-171·이주 행 | U9 |

### 6.2 06에서 넘기는 사례

| 사례 | 받는 단계 | 까닭 |
| --- | --- | --- |
| 배열 동사의 `batch` 합침, 진입마다 한 번의 `onChange`, 동사 진입 파일 | 나중에 머지하는 단계(05 또는 06) | 33C-01 |
| `UpdatePath` 배달, ERROR-197의 `onError` 보고 | 같음 | 35C-01·02 |
| `rootOutput.test.mjs:40`(`onChange`가 `{}`를 받음) | 05 | 통지(03 log §4) |
| 위치 재조정에서 바깥 오류가 위치를 따름 | 05(오류 칸) 또는 나중에 머지하는 단계 | 바깥 오류 칸은 PR-4(TEST-069 (라)) |
| 위치 재조정에서 가상화 기록이 위치를 따름 | 07 | 가상화는 렌더 계층(TEST-069 (라)) |
| 채움 시점 이주 행의 나머지 두 장면, 렌더 key·가상화 | 07 | LANDING-203, 26C-02 |

## 7. 위험과 대응

| 위험 | 대응 |
| --- | --- |
| 경로 열쇠 저장소를 하나라도 옮기지 않으면 `remove` 뒤 다른 아이템에 상태가 붙음 | 저장소 목록을 시험 하나로 고정(U6). 코드 추적 결과(`log.md` 링크)의 위험 목록 1–14를 U5·U6 완료 때 하나씩 닫았는지 verifier가 대조 |
| 정착 안의 대기 나감 열쇠 `(path, kind)` 충돌 | 정착 안에서는 이름을 바꾸지 않는다(I2). 구조 연산은 정착 전에 옮긴다 |
| 템플릿 경로 묶기가 03·04의 객체 동작을 바꿈 | 03·04 시험 전체를 U7마다 돌림. `*`가 없는 경로는 바뀌지 않는 지름길 |
| 아이템 1만 개의 자리 항목·키 칸이 메모리를 늘림 | 벤치 "노드당 메모리"로 잼(U10). 최적화하지 않고 기록 |
| `Behavior`에 칸이 늘어 03·04 행 시험이 깨짐 | 공유 기본 칸 위에 덮는 기존 방식, 행 표 시험을 U4에서 함께 고침 |
| 05와 같은 파일 충돌 | log §0 합의, 덩어리를 이어서 둠 |

## 8. 검증 명령(저장소 루트)

03·04 §8의 명령을 쓴다.

- 단위 범위: `(cd packages/canard/schema-form && npx vitest run --project unit <경로>)`
- 패키지 unit·render: `(cd packages/canard/schema-form && npx vitest run --project unit --project render)`
- lint·typecheck: `(cd packages/canard/schema-form && npx eslint "src/**/*.{ts,tsx}" && npx tsc --noEmit --composite false --rootDir . -p tsconfig.json)`
- SCN: `(cd packages/aileron/schema-form-scenarios && npx vitest run --config vite.config.ts && npx tsc --noEmit --strict --composite false -p tsconfig.json && npx eslint index.ts "src/**/*.{ts,tsx}")`
- 원장 인용: `(cd packages/canard/schema-form/architecture && node ledger/checks/plan-links.mjs plan/README.md plan/*/*.md -- ledger/*.md | tail -1)`
- 06 벤치: `(cd packages/canard/schema-form && node --import tsx bench/array.bench.ts)` 및 `(cd packages/canard/schema-form && /opt/homebrew/bin/bun bench/array.bench.ts)`
- 03·04 벤치 재측정: `bench/node-and-settle.bench.ts`, `bench/derive-and-controls.bench.ts`를 같은 두 런타임으로
- 공개 `<Form>` 가드: `yarn workspace @aileron/benchmark-form guard:check`(단독 호출)
- 빌드(번들 누출 확인이 필요할 때만): `yarn workspace @canard/schema-form build` 뒤 `yarn workspace @canard/schema-form build:types`(04 log의 형 선언 복구)

## 9. 리뷰 기록

| 차례 | 리뷰어 | 판정 | 반영 |
| --- | --- | --- | --- |
