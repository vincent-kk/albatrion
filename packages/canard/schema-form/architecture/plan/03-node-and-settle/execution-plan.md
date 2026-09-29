# 03 노드 트리와 정착 — 실행 계획

Planning method: 저장소 지침 — `PLAN.md` §2(한 PR의 순서)와 `plan/prompts.md`의 단계 실행 절차, 소유자의 오케스트레이터 실행 요청(2026-09-29). 단위마다 채우는 단계·명령·기대 결과는 seiri `write-plan`의 불변식에서 가져온다. 구조 결정은 [execution-adr.md](execution-adr.md), 게이트 원장은 `.seiri/tasks/schema-form-03-node-and-settle/gates.md`, 진행과 어긋남은 [log.md](log.md)에 적는다.

정본의 순서: 원장 `ledger/<area>.md` > 계획서 `request.md`·`adr-and-axes.md`·`verification.md` > 이 계획. 이 계획이 원장과 다르게 읽히면 원장대로 간다. 어긋남은 `log.md` §4와 PR 본문에 ID와 함께 적는다. 원장과 계획서는 고치지 않는다. 최초 기준선(원문 경로와 해시)은 `log.md` §1에 있다.

경로 약어: `PKG` = `packages/canard/schema-form`, `ARCH` = `PKG/architecture`, `SCN` = `packages/aileron/schema-form-scenarios`.

## 1. 목표와 완료 기준

목표: 상속 없는 단일 클래스 `SchemaNode`와 동작 행을 세운다. 상태는 `raw`·`extras` 둘뿐이다. 그 위에 정착 루프(표시·계산·전이·커밋), 예산과 원본 B, `diagnostics`를 둔다(LANDING-062·082·092). 새 엔진은 07까지 `<Form>`에 닿지 않는다. 옛 시험 전체가 회귀 신호다(LANDING-159).

| 완료 기준(`request.md`) | 단위 | 관찰할 증거 |
| --- | --- | --- |
| 새 fractal 다섯과 문서(INTENT·DETAIL), 겉면 기계 검사 셋 | U2, U7 | 문서 선행 커밋 검사(G4), 멤버 목록 시험·행 칸 순서 시험·클래스 파일 린트(G17) |
| 규칙 A·U7·정착 루프·예산·원본 B·diagnostics 구현과 시험 | U4, U5, U6, U8 | 단위 시험과 게이트 추적표(§5)의 모든 행이 초록 |
| `typeMismatch`·`typeMismatches`·`TYPE_MISMATCH` 기록 | U5, U8 | `union.mismatch-light` 시험, 경고 기록 모양 시험 |
| 레거시 이동과 벤치 기준선 대조 보고 | U1, U9 | 옛 주소 파일 0, 이동 전후 시험 수 같음, 벤치 보고 |
| `tsc --strict` 공개 형 시험, 벤치 게이트 통과(또는 소유자 수용) | U7, U9 | 형 시험과 단언 금지 검사, 벤치 표와 수용 기록 |
| `verification.md`의 게이트 전부 통과 | U10 | 게이트 원장 전부 met, 리뷰 체크리스트 |

비목표(TEST-069, LANDING-062 충돌 줄):

단계 번호와 원장 PR 번호의 대응은 04 = PR-3 + PR-6, 05 = PR-4, 06 = PR-5, 07 = PR-7이다. 이 계획의 "→ 0n"은 단계 번호다.

- 게이트 평가 — `if`는 05(PR-4 `compileGuard`), `controls.active` 식은 04(PR-3 제어). 판별 게이트만 03이 평가한다(25C-06).
- 파생 라운드 예산(04), 되먹임 파동·`onChange` 중첩 예산과 통지 배달(05), 배열 행과 원본 B의 배열 구조 기록(06), 렌더와 공개 전환(07), 명령 메서드(05, EVENT-073).

## 2. 해석과 자율 결정

원장으로 답이 정해지는 것은 여기서 닫는다. 원장 관리 세션 `albatrion-f8`에 확인을 보낸 것(질의 Q1–Q6, 2026-09-29)은 답을 받는 대로 이 표를 고치고 재리뷰한다.

| # | 물음 | 채택한 해석 | 근거 | 상태 |
| --- | --- | --- | --- | --- |
| I1 | 뒤 PR 기제의 겉면 멤버를 PR-2에 두는가 | 둔다. 멤버 목록 시험은 명령 메서드를 뺀 약 53개를 단언한다. 뒤 PR 기제의 멤버는 문장 하나짜리 위임이고, 위임 대상은 `record/`가 최소 인터페이스로 선언한 런타임 칸(NODE-045) 또는 행의 공유 칸(NODE-014)이다. PR-2의 트리 생성 자리가 그 칸에 무해한 구현을 넣는다 | `verification.md` 겉면 행, SURFACE-058 충돌 줄, LANDING-062 "게이트는 술어 인터페이스 뒤의 스텁", NODE-010, NODE-045 | Q1 대기 |
| I2 | dispatch 없는 PR-2의 동사 진입 | `SchemaNode` 동사가 `settle`의 진입 함수(표시 → 정착 → 커밋)로 바로 위임한다. 05가 그 사이에 `dispatch`를 넣는다 | LANDING-082의 새 fractal 다섯, NODE-010, NODE-016 | Q2 대기 |
| I3 | PR-2에 배정된 "렌더 시나리오" 게이트 | 시나리오를 SCN의 순수 데이터로 넣고 코어 러너로 새 트리에서 돌린다. 렌더 실행기는 07이다. `FormHandle.reset()`은 코어 어댑터의 폼 수준 로드다. ERROR-204의 제출 거부 단언은 07로 넘긴다 | TEST-023, LANDING-159 규칙 3, TEST-069 | Q3 대기 |
| I4 | PR-2 게이트 문장이 뒤 PR 기제를 쓰는 경우(SETTLE-048·049, EVENT-071, WRITE-096) | PR-2는 기제를 구현하고 PR-2가 관찰할 수 있는 신호로 단언한다: 로드가 비우는 기준(생김·채움), 표시가 기록한 쓰기 종류(커밋 기록), 커밋의 Refresh 대상 집합. derived·injectTo 발화는 04로, 리스너·`UpdateValue` 배달은 05로 넘긴다 | TEST-069 (라) "한 사례는 그것이 건드리는 기제가 모두 있는 가장 이른 PR로 간다" | Q4 대기 |
| I5 | 게이트 평가 | 판별 게이트는 03이 평가하고 분기의 `controls.active`와 AND 하나로 묶는다. `if`와 `controls.active`는 `record/`가 선언한 술어 인터페이스 뒤에 둔다. PR-2 기본 구현은 판별만 평가하고, 나머지는 주입된 술어가 없으면 꺼짐으로 본다. 시험은 대역 하나(§6.2)를 쓴다 | 25C-06, LANDING-062, TEST-069 | Q5 대기 |
| I6 | SETTLE-045의 평가 자리 L | 02 청사진에 L 계산이 없다(`src/core/blueprint`에 해당 코드 없음, 2026-09-29 확인). 청사진 문장이므로 청사진에 더하되, `blueprint/DETAIL.md`를 먼저 고친다(filid 규칙 5). 원장 관리 세션이 달리 답하면 settle 쪽 계산으로 옮긴다 | SETTLE-045 "청사진이 그 게이트의 평가 자리를 L로 옮긴다" | Q5 대기 |
| I7 | 형 충돌의 정착 신호 | `EffectiveSchema { schema, typeConflict }`를 그대로 신호로 쓴다. `typeConflict`가 참인 칸의 게이트들이 켜진 동안 정착 오류 `SHARED_NODE_CONFLICT`를 내고 `diagnostics.cause = 'sharedConflict'`로 적는다. 유효 스키마의 `type`·`nullable`은 정적 값 그대로다 | 25C-04, BLUEPRINT-041·044, ERROR-130 | Q6 대기 |
| I8 | 새 노드 공개 형의 자리 | 판별 합집합 `SchemaNode`와 `UnionNode`, 종류별 형, 가드 열, 새 `InferSchemaNode` 사상은 `src/core/SchemaNode/type.ts`와 그 진입점에 둔다. `src/types`와 `src/index.ts`의 공개 형은 07까지 옛 엔진 그대로다. 형 시험은 새 자리에서 한다 | NODE-058 "PR-2(노드 형)·PR-7(공개 수출)", LANDING-159 규칙 3 | 자율 결정 |
| I9 | 원장의 회귀 묶음 이름·수와 실제 파일의 어긋남 | 파일 기준으로 나눈다(§6.1). "`r8-port`(q8 108)"의 108은 `spikes/round9/r9.mjs`이고, "`r7-port`(52)"의 52는 `r9b.mjs`다. `r7-port.mjs`와 `r8-port.mjs`는 단언 없는 관찰 도구다. 각 파일의 사례를 TEST-069 (라)로 가른다. 기대값은 v7의 기대 치환(`spikes/round18/proto/REPORT-v7.md`)을 따른다 | TEST-069, scout 대조(2026-09-29) | log §4에 기록 |
| I10 | `import type`까지 센 순환 검사의 도구(NODE-045 "도구는 PR-2가 고른다") | 새 도구를 설치하지 않는다. `src/core/__tests__/dependencyDirection.test.ts`가 새 fractal의 `import`·`import type`·`export … from`을 읽어 NODE-016의 전순서를 단언한다 | NODE-045, NODE-016 | 자율 결정 |
| I11 | `SHARED_NODE_CONFLICT`와 `SHARED_NODE_KIND_CONFLICT` | 둘은 다르다. 앞은 정착 오류(런타임 형 충돌), 뒤는 청사진 오류(게이트 없는 선언끼리 종류가 다름)다 | BLUEPRINT-012, 25C-04 | 기록 |

## 3. 구조

### 3.1 새 fractal과 자리

| fractal | 자리 | 책임(원장) |
| --- | --- | --- |
| record | `PKG/src/core/record/` | `SchemaNodeRecord<Self>`, 행 계약 `Behavior`, `SchemaNodeFactory`, `SchemaNodeRuntime`(최소 인터페이스, 술어·검증기·대기열 칸 포함), 이름·경로 갱신, 상호작용 상태 패치, `shallowPatch`(NODE-004·008·045·046) |
| behaviors | `PKG/src/core/behaviors/` | `BEHAVIORS[type][strategy]`와 종류 fractal `stringBehavior/`·`numberBehavior/`·`booleanBehavior/`·`nullBehavior/`·`unionBehavior/`·`virtualBehavior/`·`objectBehavior/`(`branch/`·`terminal/`·`utils/`), 공유 `behaviors/utils/`(`parse/` 포함)(NODE-002·006·009·056, BLUEPRINT-043). 터미널 배열은 06 |
| navigation | `PKG/src/core/navigation/` | `find`·`findNodes`·트리 걷기, 형상에 있는 노드만(NODE-043·054·020) |
| settle | `PKG/src/core/settle/` | 표시·계산·전이·커밋, 예산, 원본 B, `diagnostics`, 로드와 로드 스냅숏, 쓰기 종류(SETTLE·WRITE·VALUE 영역). `settle/derive/`는 04 |
| SchemaNode | `PKG/src/core/SchemaNode/` | 클래스 `SchemaNode`(필드·게터·문장 하나짜리 위임), 공개 판별 합집합 형과 가드, `schemaNodeFactory`, 바인딩 전용 내부 통로의 이름 붙은 수출(NODE-010·015·046·049·050·058) |

의존 방향은 NODE-016이다: `blueprint` < `record` < {종류 모듈, `navigation`} < `settle` < `SchemaNode`. `record/`는 `settle`·`SchemaNode`·`app/plugin`을 `import type`으로도 가져오지 않는다(NODE-045). 새 fractal은 `__legacy__`를 가져오지 않는다(LANDING-159 규칙 1). 레거시가 새 코드를 가져오는 허용 목록은 02의 둘 그대로다: `schemaIntersection`, 그리고 `ComputedPropertiesManager`의 식 컴파일러다. `src/core/index.ts`·`src/index.ts`는 07까지 옛 엔진을 가리킨다. `src/core/DETAIL.md`는 새 fractal의 자리와 DAG를 더하도록 고친다. 공개 경계는 바뀌지 않으므로 `src/core/INTENT.md`는 고치지 않는다.

### 3.2 청사진에서 소비하는 계약(02, 바꾸지 않음 — I6 제외)

`blueprint(schema, options): Blueprint`(`src/core/blueprint/blueprint.ts:14`)의 결과를 쓴다.
- `BlueprintNode`: `kind`·`schemaType`·`nullable`·`strategy`·`declarations`·`childEntries`·`item?`·`prefixItems?`·`fields?`.
- `SchemaFragment`: `gates`·`declares`·`overlays`·`inheritedOverlays`·`children`·`order`.
- `BlueprintGate`: `kind: 'if'|'active'|'discriminator'`, `condition`, `negated?`, `appliesWhen?`.
- `Blueprint.dependencies`, `Blueprint.expressions`, `mergeEffectiveSchema`, `EffectiveSchema { schema, typeConflict }`.

`schemaType` 배열은 청사진 칸마다 얼린 참조 하나다(NODE-057). 청사진 오류 코드는 `blueprint/utils/diagnostics/constant.ts`에 있다. 정착 오류·경고 코드(`SHARED_NODE_CONFLICT`, `SCHEMA_FORM_WARNING.TYPE_MISMATCH`, `NON_JSON_WHOLE_VALUE`, `DISPOSED_NODE_WRITE`)는 U2가 자리를 정한다. 기존 `src/helpers/warning/warningCode.ts`와 `src/errors/`를 먼저 재사용한다.

## 4. 작업 단위

단위마다 한 작성자가 쓰고, 다른 에이전트가 검증한다. 구현 단위는 `seiri:implement`로 하고, 새 동작은 고치기 전에 붉은 시험을 먼저 기록한다. 공유 기록(`log.md`), 통합, 커밋, push, PR은 조율 세션이 맡는다. 명령은 모두 저장소 루트에서 돈다.

### U0 착수 — 이 계획, ADR, 게이트 원장

- 산출: `execution-plan.md`, `execution-adr.md`, `gates.md`, `log.md` 갱신.
- 완료: 독립 리뷰(`seiri:review-plan`) `cleared`. 원장 관리 세션 답(Q1–Q6)을 반영하고 재리뷰한다.

### U1 레거시 이동과 기준선 확인

- 원장: LANDING-159·205, LANDING-082 보충(18C-49).
- 옮기는 것(`git mv`, 상대 경로 그대로):
  - `PKG/src/core/nodes` → `PKG/src/__legacy__/core/nodes/`
  - `PKG/src/core/parsers` → `PKG/src/__legacy__/core/parsers/`
  - `PKG/src/core/__tests__`의 옛 시험과 그 보조(`utils/createValidatorFactory.ts`, `*.fixtures.ts`) → `PKG/src/__legacy__/core/__tests__/`
- 남기는 것: 02의 새 하네스 `PKG/src/core/__tests__/scenarios/`. `src/core/types/*`, `nodeFromJSONSchema.ts`, `index.ts`는 자리를 두고 import만 레거시로 돌린다.
- 이름으로 새 import를 쓰는 곳은 다음과 같다(2026-09-29 확인). 옛 주소 shim은 두지 않는다(02 선례, `verification/02-foundation-and-blueprint/legacy-migration.md`).
  - `src/core/nodeFromJSONSchema.ts`, `src/core/index.ts`, `src/core/types/node.ts`, `src/core/types/constructor.ts`
  - `src/providers/FormTypeRendererContext/FormTypeRendererContext.ts`, `src/components/Form/type.ts`
  - `src/components/SchemaNode/__tests__/SchemaNodePropsFlow.test.tsx`, `src/components/__tests__/SchemaNodeProxy.refresh.test.tsx`
- `vite.config.ts`의 render 글롭이 옮긴 DOM 시험(`*.test.tsx`)을 그대로 잡는지 확인한다.
- 이동 전: 02 기준선 파일(`ARCH/verification/02-foundation-and-blueprint/baseline/REPORT.md`, `core.json`, `scale.json`)이 있고 원천 커밋이 `55ed75504`임을 확인해 log에 적는다. 그다음 unit·render의 파일 수와 시험 수를 잰다.
- 이동 목록은 `ARCH/verification/03-node-and-settle/legacy-migration-files.json`(옛·새 쌍)과 `legacy-migration.md`에 둔다.
- 완료: 옛 주소에 파일 0. 이동 전후 unit·render 시험 수가 같다. lint·typecheck 통과(G1–G3).
- 담당: worker(기계적 이동). 이동 대상 판단이 목록 밖으로 번지면 멈추고 보고한다.

### U2 문서 선행 — 새 fractal의 INTENT·DETAIL

- 원장: NODE-002·004·006·008·009·010·013·014·015·016·045·046·049·050·056·058, LANDING-150, VALUE-002·027·029·030, SETTLE-002–008, ERROR-130·204, SURFACE-058·061, EVENT-073.
- 쓰는 것:
  - 다섯 fractal의 `INTENT.md`·`DETAIL.md`.
  - 종류 fractal 일곱(`stringBehavior`·`numberBehavior`·`booleanBehavior`·`nullBehavior`·`unionBehavior`·`virtualBehavior`·`objectBehavior`)의 `INTENT.md`·`DETAIL.md`(NODE-009).
  - `src/core/DETAIL.md`의 새 fractal과 DAG 절.
  - I6을 택하면 `src/core/blueprint/DETAIL.md`의 L 계산 계약.
- `DETAIL.md`가 계약으로 드는 것:
  - 진입점이 이름으로 내보내는 기호와 서명.
  - `record/`의 형 전부: `SchemaNodeRecord<Self>`의 필드 목록과 순서, `Behavior`의 칸 목록과 순서, `SchemaNodeRuntime`의 칸과 PR 배정.
  - `SchemaNode/DETAIL.md`의 겉면 멤버 목록. 멤버마다 이름, 종류(게터·메서드), 위임 대상, 기제를 채우는 PR을 적는다. 목록의 원천은 `ARCH/reviews/raw-round17-node-structure.md:136`의 확정분에 SURFACE-058 충돌 줄의 더한 것을 합한 것이다.
  - `settle/DETAIL.md`의 단계 순서, 예산 다섯 가운데 PR-2가 여는 둘, 원본 B 기록 항목, 쓰기 종류 목록(VALUE-032·WRITE-096), 로드의 범위(마운트·폼 수준 reset·`resetSubtree`).
  - DAG와 organ 예외.
  - `behaviors/utils/parse/`의 문서(LANDING-150).
  - 정착 오류·경고 코드의 자리.
- 이름 함정 경고를 `SchemaNode/INTENT.md` 첫 줄에 둔다(NODE-010).
- 완료:
  - 문서만 든 커밋. 새 fractal 각각의 첫 코드 커밋이 이 커밋보다 뒤다(G4).
  - verifier가 원장 대조 PASS(G5, 수동).
- 담당: 설계 에이전트(general-purpose, opus)가 쓴다. verifier가 원장과 대조하고, 조율 세션이 검토한다. 여기서 정한 서명이 U3–U8의 인터페이스다. 이후 서명을 바꾸면 DETAIL을 먼저 고친다.

### U3 record와 navigation

- 원장: NODE-004·011·020·043·044·045·046·054, LANDING-082(`shallowPatch`→`record/`, `findNode`·`traversal`→`navigation/` "옮기며 고친다").
- 옛 코드는 레거시에 두고 새 자리에 새로 쓴다. 새 fractal은 레거시를 가져오지 못하므로 옮겨 쓴다.
- 떼어진 노드의 읽기 규칙(NODE-044)과 형상 밖 경로 `null`(NODE-043·054)은 `navigation/`의 시험으로 단언한다.
- 완료: `record`·`navigation` 단위 시험 초록, lint 0(G6).

### U4 parse와 동작 행

- 원장: WRITE-052·056·075·084·093, BLUEPRINT-042·043, NODE-002·005·006·007·009·014·047, VALUE-034·037, TEST-077.
- `behaviors/utils/parse/`:
  - `isMember`·`convert`·`interpret`.
  - 시험 `interpret.table.test.ts`(변환 표 전부와 TEST-077이 든 값들).
  - 시험 `interpret.properties.test.ts`(`ARCH/reviews/raw-round18-union-swarm/d-rule-a.mjs`의 전수 실행을 옮김): 순서 무관, 멱등, 12건, 원소 하나인 목록 = 단일 행, 쓰기당 할당 0.
- 행: 잎 넷, `union`, `virtual`, `object`의 `branch`·`terminal`. `BEHAVIORS` 표.
  - 칸은 `interpret`·`assemble`·`project`·`finishInput`·`declareChildren`·`type`·`strategy`에 U2가 정한 배열 연산 공유 칸을 더한 것이다.
  - 뜻이 같은 칸은 함수 객체 하나를 여러 행이 공유한다.
  - 옵션의 정적 선택은 유효 스키마 메모와 함께 한 번 계산한다(NODE-006).
- `omitEmptyObject`의 새 자리는 `objectBehavior/utils/`다.
- 행 칸 순서 시험: 모든 행의 칸 이름 목록이 같은 순서다(겉면 기계 검사 셋 가운데 하나).
- 완료: parse·행 시험 초록(G7, G8).

### U5 정착 ①: 표시·계산·커밋

- 원장:
  - SETTLE-001·002·003·006·009·010·017·018–025·041·042·043·045·047·050.
  - VALUE-006·009·010·012·013·021·027·029·030·034·037.
  - WRITE-087, EVENT-006·066·071, NODE-026, FRAGMENT-016·048·049, 25C-04·06.
- 표시:
  - 쓰기 종류 기록(입력·호출자 부분·호출자 전체 교체·로드·자동, VALUE-032·WRITE-096).
  - 재계산 목록 등록. 역의존 표는 `Blueprint.dependencies`에서 조상·자손 경로까지 본다(SETTLE-017).
- 계산:
  - 루트에서 한 번 내려가는 하강.
  - 호스트 바퀴: 출발점 고정, 매 바퀴 모든 게이트, 가우스-자이델, 상한 = 게이트 가진 조각 수 + 노드 게이트 수 + 1(SETTLE-041의 셈).
  - 게이트 입력은 투영과 `extras`이고, 비객체 `raw`이면 `{}`다.
  - 판별 게이트 평가와 AND. 술어 인터페이스 호출.
  - 상속 overlay 재계산. SETTLE-045의 옮긴 게이트.
  - 유효 스키마 메모(`mergeEffectiveSchema`)와 유효 목록.
  - `typeConflict` → `SHARED_NODE_CONFLICT`.
  - 합성·투영과 키 순서(SETTLE-042), 빈 호스트·루트 투영(VALUE-034).
- 커밋:
  - `sameValue`와 참조 유지(SETTLE-043, VALUE-012).
  - 배달 집합에 대한 `revision` 일괄 증가와 커밋 번호.
  - 경고등과 루트 경로 집합, `typeMismatches` 메모.
  - `TYPE_MISMATCH` 기록 `{ level, code, path, expected, received, reason, candidates?, source }`와 1회·재발송 규칙.
  - 개발 모드의 `NON_JSON_WHOLE_VALUE`(VALUE-037).
  - 잠복 원본 열거 메모(WRITE-087).
  - Refresh 대상 집합(EVENT-071).
- 순회 범위: 입력 쓰기는 재계산 목록과 자동 쓰기 기록만, 전체 교체 쓰기는 닿은 하위 트리만(SETTLE-047). 방문 수 시험으로 단언한다.
- 완료: 정착 ① 시험 초록. 게이트 추적표 §5의 U5 행 전부(G9, G10).

### U6 정착 ②: 전이·예산·원본 B·로드·쓰기 옵션

- 원장:
  - SETTLE-004(순위의 채움 부분)·005·011·013·016·026·038·044·046·048·049.
  - WRITE-007·010·013·015·018·019·031–040·079·082·085·088–099.
  - VALUE-031·032·033·035·036, ERROR-130·190·204, EVENT-072, NODE-044·051(로드 부분), TEST-067 (c′), GOAL-071(T-20).
- 전이:
  - 생김·나감의 판정은 직전 커밋 기준이다. 로드는 기준을 비운다(SETTLE-048).
  - 채움은 `controls.default` > `default`. 부모부터 채우고, 호스트 D를 분배하며, `interpret`를 지난다(WRITE-082).
  - 나감 비움: 네 층, 가까운 순서, 나가는 조상의 정책 전달, 선언의 나감, 잠복 자손, `raw`·`extras` 모두(WRITE-031–035·040).
  - U7 재해석: 원래 쓰인 값을 최종 유효 목록으로, 한 라운드에 한 번, 다음 라운드를 부를 수 있음(WRITE-098·099).
  - 라운드 상한은 SETTLE-005.
- 예산과 원본 B:
  - PR-2가 여는 예산은 호스트 바퀴와 전이 라운드다.
  - 되돌림 기록은 노드, 이전 `raw`, 이전 `extras`이고, 중간 라운드 채움의 철회보다 먼저 적용한다. 배열 구조 항목은 06이다.
  - 원본 B에는 쓰기 경계의 해석만 남는다. 원본 B로 형상을 한 번 더 계산한다.
  - `diagnostics { status, cause, exceededBudget, iterations, commit }`. 초기화는 폼 수준 로드에서만 한다(ERROR-204). 던지는 자리는 사슬 끝이고 모든 환경이다.
  - (c′) 재귀 펼침 멈춤은 `exceededBudget: 'recursion'`이다.
- 로드:
  - 마운트, 폼 수준 reset, `resetSubtree()`. `resetSubtree()`의 범위는 SETTLE-049·EVENT-072·VALUE-030을 따른다.
  - 로드 스냅숏 `setIn`·`getIn`과 `defaultValue` 게터(WRITE-085, 배열 자리 맞춤은 06).
- 쓰기:
  - `SetValueOption` 비트: 우선순위, 배치에서는 억제가 이김, 범위(WRITE-015·097·100의 PR-2 부분).
  - 전체 교체의 잠복 원본 비움과 멱등(WRITE-094).
  - null 계약(WRITE-096), 비객체 V의 `Merge`(WRITE-079).
  - 떼어진 노드 쓰기(NODE-044).
- 완료: 정착 ② 시험 초록. 게이트 추적표 §5의 U6 행 전부(G11, G12).

### U7 SchemaNode 겉면과 형

- 원장: NODE-010·013·015·041·046·049·050·057·058, SURFACE-056·058·061, TEST-070, NODE-045(순환 검사), I8.
- 클래스 `SchemaNode`:
  - 필드 집합 고정. 생성자는 대입만 한다.
  - 게터와 문장 하나짜리 위임만 둔다. `{@inheritDoc}` 관례(NODE-049)를 따른다.
  - `schemaNodeFactory`가 트리마다 하나다. 런타임 칸에 PR-2 구현과 스텁을 넣는다(I1).
- 공개 형: 판별 합집합, `UnionNode`의 `typeMismatch` 판별 두 멤버, 종류별 `schemaType` 좁힘, 가드 열, `InferSchemaNode` 사상(overload).
- 겉면 기계 검사 셋:
  - 클래스 파일 한정 ESLint(`PKG/eslint.config.js`에 NODE-010 규칙 블록, 저장소의 `#` 비공개 금지 선택자를 함께 다시 적는다).
  - 멤버 목록 시험(`DETAIL.md` 목록과 프로토타입 멤버 이름).
  - 행 칸 순서 시험(U4).
- `no-restricted-imports`(LANDING-159)의 `files`에 새 fractal 다섯을 더한다.
- 형 시험(`tsc --strict`, TEST-070):
  - 새 fractal의 비시험 파일에 `as`(`as const` 제외)·`any`가 0이다.
  - `children`은 저장 배열과 같은 참조다.
  - `union.type-test.ts`의 노드 형 부분.
- 순환 검사 `src/core/__tests__/dependencyDirection.test.ts`(I10).
- 실패 처리: 단언 없이 통과하지 못하면 TEST-070의 두 선택지를 그대로 소유자에게 올린다.
- 완료: 형 시험·겉면 검사·순환 검사 초록(G13, G14).

### U8 시나리오와 회귀 이식

- 원장: TEST-003·008·009·011·023·069·067·077, 25C-08·11, LANDING-071.
- SCN: `ScenarioExpectation.diagnostics`를 더한다(25C-08). 부류 데이터를 넣는다: 값·정착·채움·나감·union. 원장이 이름을 든 시나리오는 그 이름을 쓴다(`union.entry-two-step`, `union.gated-effective-list`, `union.rule-a`, `union.ambiguous`, `union.integer`, `union.object-array`, `union.omit-empty`, `union.default-fill`의 코어 관찰 부분). SCN은 schema-form을 가져오지 않는다.
- 코어 어댑터와 부류 러너:
  - 어댑터는 `PKG/src/core/__tests__/scenarios/utils/`에 두고, 새 트리 위의 `ScenarioAdapter`이며 폼 수준 로드를 포함한다.
  - 부류 러너는 `PKG/src/core/__tests__/scenarios/<부류>.spec.ts`다.
- 회귀 이식은 `PKG/src/core/__tests__/regression/<묶음>.test.ts`에 둔다. 사례 목록은 §6.1이다. 각 사례는 원본 파일과 줄을 주석 대신 시험 이름에 싣는다.
- union 노드 시험(TEST-077, 25C-11):
  - `unionBehavior/__tests__/union.write-paths.test.ts`: PR-2의 쓰기 경로. derived·injectTo 경로는 04로 표시한다.
  - `unionBehavior/__tests__/union.mismatch-light.test.ts`.
  - 노드와 배열 아이템의 `schemaType` 참조 동일성. 배열 아이템은 06의 행이 없으므로 청사진 칸 공유로 단언하고, 노드 쪽은 06에 넘긴다고 표시한다.
  - virtual 코퍼스의 `node.type` 여덟 값, 유효 목록 좁힘.
- 완료: 시나리오·회귀·union 시험 초록. SCN typecheck·lint·test 통과(G15, G16).

### U9 벤치

- 원장: NODE-018·055, TEST-027·032·072·073, SETTLE-044·045, WRITE-087, 18C-15·31·67·81.
- 행:
  - B1–B6: V8은 `node`, JavaScriptCore는 `bun` 1.4.2(`/opt/homebrew/bin/bun`)에서 잰다.
  - "켜진 조각 N개 호스트의 무관한 키 입력".
  - 잠복 원본 열거의 조상 메모 갱신.
  - 루트로 옮긴 게이트 N개일 때의 키 입력.
- 두는 곳: `PKG/bench/`에 새 엔진 행을 더한다. 합격선이 `guard:check` 선인 행은 `@aileron/benchmark-form`의 기존 도구로 잰다.
- 02 기준선(`ARCH/verification/02-foundation-and-blueprint/baseline/`)과 견주어 `ARCH/verification/03-node-and-settle/bench-report.md`에 표로 적는다. 느린 행은 까닭을 적고 소유자 수용을 받는다(TEST-027).
- 완료: 보고서와 수용 기록(G18, 수동).

### U10 최종 검증과 PR

- 검사:
  - 패키지 unit·render 전체.
  - storybook은 sandbox 밖에서 소유자가 돌린다(01·02 선례).
  - lint, typecheck, SCN 검사.
  - 원장 검사(`HANDOFF.md` §4의 `plan-links`).
- 독립 `seiri:verify`: 최초 기준선 대 diff. 이어 PR을 연다(`1.0.0-beta` base).
- PR 뒤: `filid:enrich-docs`, filid 스캔 1회, `seiri:request-review`, `seiri:receive-review`.

## 5. 게이트 추적표 — 원장이 PR-2에 배정한 단언

| 원장 | 단언(요지) | 시험 자리 | 단위 |
| --- | --- | --- | --- |
| TEST-069 | PR-2 몫 회귀 이식(§6.1) | `src/core/__tests__/regression/*.test.ts` | U8 |
| TEST-067 (c′) | `if/then`으로만 끊긴 재귀에 `{hasChild:true}` → 정착 오류 | `settle/__tests__/` | U6 |
| TEST-077·WRITE-093 | 변환 표·전수 12건·순서 무관·멱등·할당 0 | `behaviors/utils/parse/__tests__/` | U4 |
| TEST-077·WRITE-093 | 쓰기 경로마다 한 사례, `Merge` 통째, `trim`은 문자열만 | `unionBehavior/__tests__/union.write-paths.test.ts` | U8 |
| TEST-077·VALUE-037 | 경고 0·1·재발송, `expected`, `candidates` | `unionBehavior/__tests__/union.mismatch-light.test.ts` | U8 |
| WRITE-098 | `setValue({kind:'flag', a:0})`는 직전 `kind`와 무관하게 `a === false`. 마운트·`resetSubtree()`도 같다 | 시나리오 `union.entry-two-step` | U6, U8 |
| WRITE-099 | 되먹임 폼 `a === "0"`, 반례 폼은 원본 B `a === 0`·경고등·`degraded` | 시나리오 `union.entry-two-step` | U6, U8 |
| WRITE-099(스냅숏·유효 목록) | E26 유효 목록 = `schemaType`과 같은 `'number'`. push 스냅숏은 06 | `settle/__tests__/` | U5 |
| TEST-070 | 단언 없는 `tsc --strict`, `children` 같은 참조 | `SchemaNode/__tests__/` | U7 |
| SURFACE-058 | 멤버 목록(명령 메서드 제외) | `SchemaNode/__tests__/` | U7 |
| NODE-045 | `import type` 포함 순환 0 | `src/core/__tests__/dependencyDirection.test.ts` | U7 |
| WRITE-094 | `setValue(getValue())` 두 번: 첫 번은 잠복·투영 원본 비움, 둘째는 변화 없음 | `settle/__tests__/` | U6 |
| WRITE-096 | `setValue({user:null})` 뒤 `name` 없음, 로드 뒤 채움·방출 없음, 쓰기 종류 = 호출자 전체 교체 | `settle/__tests__/` | U6 |
| WRITE-097 | 루트 `setValue(undefined)`: 있던 노드는 비우고, 게이트로 새로 생긴 노드는 채움 | `settle/__tests__/` | U6 |
| WRITE-079 | 비객체 V의 `Merge`는 통째, 채움은 새로 생긴 노드만, 경고등 | `settle/__tests__/` | U6 |
| EVENT-071 | 잎 하나를 바꾼 `setValue(V)`의 Refresh 대상 = 바뀐 잎만. 리스너 장면은 05 | `settle/__tests__/` | U5 |
| EVENT-072 | `resetSubtree()`의 로드 규칙은 그 하위 트리에만 | `settle/__tests__/` | U6 |
| ERROR-204 | `resetSubtree()`·`setValue(V)` 뒤 `degraded`·중복 키 유지, 폼 수준 reset 뒤 `stable`. 제출 거부는 07 | `settle/__tests__/` | U6 |
| VALUE-034 | 빈 객체 호스트·루트의 투영, `omitEmpty` | `settle/__tests__/`, 시나리오 | U5 |
| VALUE-037 | 방출은 원본 참조 그대로 | `settle/__tests__/` | U5 |
| SETTLE-042 | 키 순서(`propertyKeys` → 첫 선언 → `extras`). 오늘의 합집합 순서와 어긋나는 스키마를 조사한다 | `settle/__tests__/` | U5 |
| SETTLE-045 | (a) 사촌 하위 트리를 읽는 노드 게이트, (b) `#` 게이트, (c) 양의 순환의 이력 무관 | `settle/__tests__/` | U5 |
| SETTLE-047 | 방문 노드 수: 입력 쓰기, 하위 트리 `setValue(V)`, 루트 `setValue(V)` | `settle/__tests__/` | U5 |
| SETTLE-048 | `setValue(getValue())`는 기준 유지, 로드는 기준 비움. 생김·채움으로 관찰하고, 발화 단언은 04 | `settle/__tests__/` | U6 |
| SETTLE-049 | `resetSubtree()`의 생김·채움은 그 하위 트리만. `injectTo` 발화 단언은 04 | `settle/__tests__/` | U6 |
| SETTLE-050 | 고정점 둘인 스키마에서 이력이 둘이어도 같은 형상 | `settle/__tests__/` | U5 |
| 25C-04 | `typeConflict`인 게이트들이 켜진 동안 `SHARED_NODE_CONFLICT` | `settle/__tests__/` | U5 |
| 25C-06 | 판별 게이트 평가와 `controls.active`의 AND | `settle/__tests__/` | U5 |
| 25C-08 | `ScenarioExpectation.diagnostics` | SCN, 부류 러너 | U8 |
| 25C-11 | virtual 코퍼스의 `node.type` 여덟 값, 노드 `schemaType` 참조, 유효 목록 좁힘, `onChange` 형 | `SchemaNode/__tests__/` | U7, U8 |
| NODE-055 등 | B1–B6과 18C-15·67·81 행 | `bench/` | U9 |

## 6. 회귀 이식과 시험 대역

### 6.1 PR-2 몫(TEST-069 (라), 파일 기준 — I9)

모든 경로는 `ARCH/spikes/` 아래다.

| 원천 | PR-2로 옮기는 것 | 넘기는 것 |
| --- | --- | --- |
| `round9/regress/selfcheck-v5.mjs`(63) | a 가운데 주입을 쓰지 않는 36, b 2, c 4, d 1, e 3 = 46 | 주입을 쓰는 a의 A4a·A4b·A4c·A4-cap·A6-automatic 5 → 04, f 4 → 04, g 8 → 05 |
| `round9/r9.mjs`(108) | P1 채움 10, P3 `if` 18 = 28 | P2·P5·P6·P7 64 → 04. P4 상태 키 16 → 04(상태 키는 PR-6) |
| `round9/regress/r8-port.mjs`(관찰) | P3 기본값 승자, P5 `extras` 순서, P4의 N1·N1_noDefault·N9·N9_noDefault·X16_noAuto를 단언으로 옮김 | P4 X16·X16_noDefault, P1, P2 → 04 |
| `round9/r9b.mjs`(52)와 `round9/regress/r7-port.mjs`(관찰) | E1·E2·E7·E9·E10·E12·E13·X9h·X10/X12, r9b 가운데 PR-2 기제만 쓰는 검사 | E3·X3c·X3L·X15·X16·XA4 → 04. D-17·X2/X3 묶음·E4·E6 → 05 |
| `round9/regress/edge-cases.mjs`(26) | 조각 생김 2, `allOf` else 2, 객체 채움 1, 덧씌움 기본값 2, `controls.default` 우선 2 = 9 | `clearValue`·`injectTo`·단계 순서·파생 예산 12 → 04, 잠금 결합 5 → 04(PR-6) |
| `round18/proto/__tests__/` | `settleRules.test.mjs`의 `extras`(:7)·나감 비움 노드 자신 층(:51)·재계산 목록 순회(:66), `entryInterpretation.test.mjs`의 전이 상한(:46)과 PR-2 기제만 쓰는 나머지, `interpret.test.mjs`, `rootOutput.test.mjs` | 같은 순위 동점(:15, :36)·정착 단위 순위(:25)·나감 에지(:59) → 04 |

기대값은 v7의 기대 치환(`round18/proto/REPORT-v7.md`)을 따른다. 사례마다 원천 파일과 줄을 시험 이름에 싣는다. 이식하면서 판정을 바꾼 사례(원장이 옛 기대를 바꾼 곳)는 원장 ID를 시험 이름에 싣는다. 원천 스크립트는 고치지 않는다. 몫이 모호한 사례는 (라)의 "건드리는 기제가 모두 있는 가장 이른 PR"로 정한다. 그래도 남으면 log §4에 적는다.

### 6.2 게이트 술어 대역(TEST-069 "게이트 술어 대역 하나")

시험용 술어 하나를 `PKG/src/core/settle/__tests__/utils/`에 둔다.
- `if` 조건은 `const`·`enum`·`required`·`properties`·`type`만 해석하는 작은 판정기로 평가한다.
- `controls.active`는 `BlueprintExpression.evaluate`로 평가한다.

시험 밖 코드는 이 대역을 가져오지 않는다. 대역이 판정하지 못하는 조건은 시험에서 던진다. 조용히 거짓으로 두지 않는다.

## 7. 위험과 대응

| 위험 | 대응 |
| --- | --- |
| 정착 규칙의 양이 커서 한 구현자가 놓침 | U5·U6으로 가르고, 단위마다 §5의 행을 붉은 시험으로 먼저 쓴다. v7 모델(`round18/proto/`)을 규칙 참조로 쓰되 구조는 따르지 않는다(프로토타입 INTENT의 금지: 제품 코드가 가져오지 않음) |
| 레거시 이동이 옛 시험을 깸 | U1을 기계적 이동으로 한정하고 전후 시험 수를 대조한다 |
| 겉면 스텁이 뒤 PR의 계약을 미리 굳힘 | 스텁은 런타임 칸 구현에만 두고 겉면 서명은 원장의 공개 계약을 따른다. DETAIL에 PR 배정을 적는다 |
| 형 단언 없이 `tsc --strict`가 안 됨 | TEST-070의 두 선택지로 소유자에게 올린다(차단은 U7만) |
| 벤치가 옛 판보다 느림 | TEST-027 절차로 까닭을 적고 소유자 수용. 수용 전 PR은 리뷰 상태로 둔다 |
| storybook 프로젝트가 sandbox 안에서 안 뜸 | 01·02 선례대로 unit·render는 여기서, storybook은 소유자가 sandbox 밖에서 돌린다 |

## 8. 검증 명령(저장소 루트)

- 단위 범위: `(cd packages/canard/schema-form && npx vitest run --project unit <경로>)`
- 패키지 unit·render: `(cd packages/canard/schema-form && npx vitest run --project unit --project render)`
- lint·typecheck: `(cd packages/canard/schema-form && npx eslint "src/**/*.{ts,tsx}" && npx tsc --noEmit --composite false --rootDir . -p tsconfig.json)`
- SCN: `(cd packages/aileron/schema-form-scenarios && npx vitest run --config vite.config.ts && npx tsc --noEmit --strict --composite false -p tsconfig.json && npx eslint index.ts "src/**/*.{ts,tsx}")`
- 원장 인용: `(cd packages/canard/schema-form/architecture && node ledger/checks/plan-links.mjs plan/README.md plan/*/*.md -- ledger/*.md | tail -1)`
- 벤치: `yarn workspace @canard/schema-form bench`, `yarn workspace @aileron/benchmark-form guard:check`(excluded 명령, 단독 호출)

## 9. 리뷰 기록

| 날짜 | 리뷰 | 판정 | 반영 |
| --- | --- | --- | --- |
| — | — | — | — |
