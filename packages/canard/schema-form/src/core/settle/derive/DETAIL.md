# derive 계약

## Requirements

- `derive`는 `settle`의 자식 fractal이며 완성된 형상의 규칙을 판정합니다. 쓰기 적용·재계산·파생 라운드 셈·원본 B 복원·커밋은 settle이 맡습니다(LANDING-063·083, SETTLE-004·011·017, NODE-016).
- 의존 방향은 `blueprint`·`record`의 진입점과 settle 안의 순수 `sameValue`·경로 해석·선언 층 해석으로만 향합니다. `settle/type.ts`, `settle/index.ts`, 쓰기·전이·커밋·파생 라운드 실행 organ은 `import type`까지 금지합니다(NODE-016·045, SETTLE-043, CONTROLS-080).
- 청사진은 식·선언·역의존 표를 제공하고 규칙 발생 템플릿 표는 derive가 청사진마다 한 번 만들어 약한 맵에 둡니다. 규칙이 없는 청사진은 빈 표를 공유하고 파생 단계를 건너뜁니다(SETTLE-017·043, LANDING-083, CONTROLS-032·079).

## API Contracts

- 조각의 대상 자식 검색은 그 조각에 `derived`·`unsetValue`·`resetInteraction`·`injectTo` 중 하나가 있을 때만 수행합니다. `active`만 있는 분기 B개에서는 파생 표 생성이 전체 자식 검색 B회 대신 O(선언 수) 시간이며 불필요한 대상 배열을 할당하지 않습니다. `children`의 별도 규칙은 계속 처리하고 규칙 순서·층·에지 의미를 바꾸지 않습니다(SETTLE-017·043, 82C-01).

- `index.ts`는 `getDeriveRuleTable(blueprint: Blueprint): DeriveRuleTable`, `evaluateDeriveRound<Self>(root: SchemaNodeRecord<Self>, state: DeriveState<Self>): DeriveRoundDecision<Self>`, `evaluateResetInteraction<Self>(root: SchemaNodeRecord<Self>, state: DeriveState<Self>): DeriveResetInteractionDecision<Self>`, `DERIVE_ROUND_CAP = 25`와 `DeriveRuleTable`·`DeriveState`·`DeriveRoundDecision`·`DeriveResetInteractionDecision`·`DeriveTraceEntry` 형을 이름으로 내보냅니다. `settle/utils/derivation/`은 라운드 판정을, `settle/utils/commit/`은 상호작용 초기화 판정을 이 진입점에서 소비합니다(SETTLE-004·006·017, NODE-016, CONTROLS-029).
- `DeriveState<Self>`는 완성된 트리, 호출의 로드 범위와 억제 여부, 직전 커밋의 규칙 값, 이번 정착에서 소비한 값, 대상별 이미 적용한 종류 순위를 판정에 건넵니다. `DeriveRoundDecision<Self>`는 대상마다 승자 하나인 쓰기 후보, 승패와 무관하게 소비할 에지, 개발 모드 기록 항목을 돌려주며 원본을 바꾸지 않습니다(SETTLE-004·028·048·049, WRITE-015, ERROR-159).
- 규칙 표의 한 발생은 선언 ID·종류·원천 발생 경로·선언 층·조각 전순서·식 기록 또는 `injectTo` 함수·`watch` 경로를 구별합니다. `derived` 의존 집합은 그 식의 경로와 같은 노드 모든 선언의 `controls.watch` 경로의 합집합이며, 같은 노드의 다른 식 경로는 제외합니다(SETTLE-043, CONTROLS-032·079·080).
- 문자열 식은 청사진의 `BlueprintExpression.evaluate(dependencies)`를 선언 호스트 기준 경로의 방출 값으로 호출합니다. `controls.injectTo`는 컴파일하지 않은 함수 `(value, ctx)`를 원천 방출 값과 이번 라운드 트리의 `dataPath`·`schemaPath`·`jsonSchema`·`parentValue`·`parentJSONSchema`·`rootValue`·`rootJSONSchema`·`context`로 호출합니다(LANDING-083, CONTROLS-079·080, SETTLE-043).

| 종류 순위 | 값 | 판정 |
| --- | ---: | --- |
| `unsetValue` | 4 | 참으로 바뀌면 없음 쓰기 후보입니다(SETTLE-004·028). |
| `derived` | 3 | 의존 값 튜플이 바뀌고 평가 결과가 `undefined`가 아니면 후보입니다(SETTLE-004·043). |
| `injectTo` | 2 | 원천 방출 값이 바뀌면 함수 결과의 대상별 후보입니다(SETTLE-004·028, CONTROLS-079). |
| 채움 | 1 | 전이 단계의 후보이며 생긴 노드의 참인 `unsetValue`보다 낮습니다(SETTLE-004·005). |

| 선언 층 순위 | 값 | 판정 |
| --- | ---: | --- |
| 조각 `controls` | 1 | 그 조각이 직접 선언한 노드에 걸립니다(CONTROLS-073·077). |
| 부모 `controls.children` 항목 | 2 | 항목이 가리키는 자식에 걸립니다(CONTROLS-073·077). |
| 노드 자신 | 3 | 그 노드의 선언이 가장 세부 층입니다(CONTROLS-073·077). |

- 같은 대상에서는 높은 종류 순위가 이기고, 같은 종류에서는 원천 선언 노드의 트리 전위 문서 순서상 나중이 이깁니다. 같은 노드의 선언은 높은 층이 이기며, 같은 층은 조각 전순서상 나중, 같은 `children` 배열은 뒤 항목, 한 `injectTo` 반환은 뒤 대상(객체 키 삽입 순서·배열 차례)이 이깁니다. 순위는 정착 전체에 걸쳐 유지하므로 앞 라운드의 높은 순위 적용을 뒤 라운드의 낮은 순위가 덮지 못하고, 진 규칙의 에지도 소비하며 충돌 경고는 내지 않습니다(SETTLE-004·005, FRAGMENT-049, CONTROLS-073·079).
- `sameValue`는 원시 값의 SameValueZero, 배열의 길이와 차례, 평범한 객체의 자기 열거 키 목록 순서와 값, 나머지 객체의 참조로 비교하고 같은 참조 아래로는 내려가지 않습니다. 비교 대상은 `injectTo` 원천 방출 값, `derived` 의존 값 튜플, `unsetValue`·`resetInteraction` 식 값입니다(SETTLE-043).
- 정착 시작 기준점은 직전 커밋이며 정착 안에서는 규칙이 마지막으로 소비한 값입니다. 로드는 범위 안 기준을 비워 발화하고 `resetSubtree()`는 원천이 하위 트리 안인 규칙만 비우며, 로드 아닌 쓰기에는 `setValue(V)`도 직전 커밋을 사용합니다. 형상 밖 발생은 평가하지 않고 재탄생하면 거짓→참으로 보며, 조각이 켜져 새로 들인 노드만 거짓→참이고 공유 노드는 기준만 잡습니다. 선언 선택이 바뀐 호스트는 게이트에 식이 없어도 그 정착에서 방문해 기준점을 잡습니다(SETTLE-004·028·046·048·049, FRAGMENT-050, CONTROLS-080).
- `unsetValue`는 거짓→참일 때 지우고 참→거짓에는 쓰지 않으며, 참인 새 노드는 채우지 않습니다. 식이나 `injectTo` 함수가 던지거나 동적으로만 아는 `injectTo` 대상이 없으면 그 규칙을 그 라운드의 후보에서 빼고 에지를 소비하며, 정착은 `degraded`·`cause: 'expression'`(대상 없음은 `cause: 'injectTarget'`)입니다(SETTLE-004·005·028, CONTROLS-079, ERROR-122·132).
- `DeriveResetInteractionDecision<Self>`는 최종 트리에서 로드된 값 또는 거짓→참 에지로 참인 노드, 소비할 에지, 개발 모드 기록 항목을 돌려줍니다. 커밋은 결과 노드의 `dirty`·`touched`를 비우고 `revision`을 올리며, 억제된 로드에서도 이 판정은 실행하고 원본은 쓰지 않습니다(SETTLE-006, CONTROLS-029, EVENT-012·066, 28C-04).
- `@`는 런타임 맥락 칸의 객체를 읽으며 맥락 변경은 직전 커밋을 기준으로 `@`를 읽는 `derived`·`unsetValue`·`resetInteraction`에 에지를 냅니다. 원천 방출 값이 그대로인 `injectTo`는 맥락 변경만으로 발화하지 않습니다(CONTROLS-080, SURFACE-055, SETTLE-048, 28C-03·08).
- 개발 모드 판정은 `process.env.NODE_ENV !== 'production'`이며 `DeriveTraceEntry`에는 단계·규칙 종류·원천 경로·대상 경로·이전 값·이후 값·결과를 담습니다. 결과는 적용·승자에게 짐·`undefined`로 후보 아님·억제·최종 형상 밖이라 철회 중 하나이고, 라운드 실행기는 공개 API와 옵션 비트의 진입 기록·라운드별 항목·예산 초과 마지막 라운드 규칙 목록을 모아 커밋이 런타임의 마지막 정착 기록 하나로 바꿉니다. 프로덕션은 항목과 칸을 만들지 않고 콘솔·`onError`·공개 멤버로 내보내지 않습니다(ERROR-030·159, LANDING-063, NODE-004·045, TEST-016, 28C-01).

- 파생 및 상호작용 초기화 판정은 첫 실패 하나 대신 모든 규칙 실패를 발생 순서의 `failures` 목록으로 반환합니다. 같은 규칙과 호스트의 재계산은 정착 수집기가 중복을 없애며, 서로 다른 규칙 실패는 모두 남깁니다. 진단 원인은 정착의 첫 실패가 정하므로 뒤 파생 실패는 선행 실패의 원인을 바꾸지 않습니다(ERROR-004·005·034, 58C-01).

## Acceptance Criteria

### derive-failures — 오류 목록과 발생 식별자

- 파생 오류의 원천 경로는 공유 규칙의 발생을 구별하는 식별자에 포함됩니다. 파생·상호작용 초기화·상태 키 판정은 오류가 없으면 호출 간 재사용하는 동결된 읽기 전용 빈 실패 배열을 반환하고, 실패 배열은 첫 오류에서만 할당합니다(ERROR-004, 58C-01).

### derive-edge — 기준점과 에지 소비

- 로드는 범위 안 규칙을 발화시키고 같은 값의 일반 쓰기는 발화시키지 않으며, 진 규칙은 다음 라운드에 재발화하지 않습니다(SETTLE-004·028·046·048·049).

### derive-rank — 대상별 승자

- 한 대상의 승자는 종류·문서 순서·선언 층·조각 순서의 표로 결정되고, 정착 안의 낮은 순위 후속 후보는 적용되지 않습니다(SETTLE-004·005, CONTROLS-073·079).

### derive-boundary — 판정과 기록

- derive는 쓰기 organ 없이 판정 결과만 돌려주며 개발 모드 항목은 마지막 정착의 런타임 기록에만 남습니다(NODE-016·045, ERROR-159, 28C-01).

## Last Updated

2026-10-03
