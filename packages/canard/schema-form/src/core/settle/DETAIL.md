# settle 계약

## Requirements

- 의존 방향은 `blueprint < record < navigation < settle < SchemaNode`입니다. 종류별 계산은 `node.behavior`의 칸을 호출하며 behaviors 뿌리나 `SchemaNode` 클래스는 import하지 않습니다(NODE-016, NODE-006).
- 정착의 내부 organ을 외부 소비자가 직접 가져오지 않으므로 경계 예외는 없습니다(NODE-016).
- 한 진입은 동기적으로 표시 → 계산(호스트 바퀴) → 전이 → 커밋합니다. 파생 단계와 `settle/derive/` fractal은 stage 04에서 이 사이에 들어옵니다(SETTLE-002–006, LANDING-063).

## API Contracts

- 진입점은 `writeSchemaNode<Self>(node: SchemaNodeRecord<Self>, input: unknown, kind: SchemaNodeWriteKind, option: SetValueOption): void`, `loadSchemaNodeAtMount<Self>(root: SchemaNodeRecord<Self>, value: unknown, option: SetValueOption): void`, `resetSchemaNodeForm<Self>(root: SchemaNodeRecord<Self>, value: unknown, option: SetValueOption): void`, `resetSchemaNodeSubtree<Self>(node: SchemaNodeRecord<Self>, option: SetValueOption): void`를 이름으로 내보냅니다. `SchemaNode.setValue`는 PR-2에서 `writeSchemaNode` 한 호출로 위임합니다(NODE-010, TEST-069, 26C-01).
- `SchemaNodeWriteKind`는 `'input' | 'callerPartial' | 'callerReplace' | 'load' | 'automatic'`입니다. 마지막 종류는 채움·입력 마침 등 예약 층 쓰기이며, `setValue(V)`는 로드가 아닌 `callerReplace`입니다(VALUE-032, WRITE-096). 표시 단계가 종류·옵션·원래 쓰인 값을 기록하고, 정적 `schemaType`·`nullable`로 먼저 한 번 해석하며 쓴 노드와 역의존 조상을 재계산 목록에 넣습니다(WRITE-056·098, SETTLE-002·017).
- 공개 옵션 `SetValueOption`은 `Overwrite`, `Merge`, `DisableAutomaticWrites`, `EnableAutomaticWrites`의 비트마스크입니다. 기본은 `Overwrite`; 억제는 호출 옵션이 폼 속성보다 우선하고 두 억제 비트가 함께 있으면 `DisableAutomaticWrites`가 이깁니다. 한 배치에 서로 다르면 억제가 이깁니다. 억제는 그 진입에서 생기는 채움·자동 쓰기·나감 비움에만 적용되고 받은 값 자체와 방출 정책은 막지 않습니다(WRITE-015·097). 기존 `SetValueOption`의 `Overwrite`·`Merge` 비트 값은 레거시 소비자를 위해 유지하고 같은 enum에 억제용 새 비트 둘을 더합니다. 새 정착은 기존 비트 중 자기 계약에 든 네 선택만 해석합니다.
- 계산은 루트에서 한 번 내려가며 재계산 자식을 먼저 마칩니다. 각 호스트 바퀴는 `게이트 없는 조각 ∪ 상속 overlay`에서 시작하고 노드 게이트는 꺼진 채 시작합니다. 직전 커밋의 활성 집합은 평가 순서의 힌트에도 쓰지 않으며 청사진 전순서대로 모든 게이트를 매번 평가하고 가우스-자이델로 즉시 반영합니다. 상한은 `게이트 가진 조각 수 + 노드 게이트 수 + 1`입니다. `controls.active`가 있는 `children` 항목은 대상 수와 무관하게 항목당 노드 게이트 하나, 조각의 active는 조각 게이트 하나, 판별+분기 active의 AND는 하나로 셉니다(SETTLE-003·018·041·044·050).
- 게이트 입력은 투영 값과 `extras`이며 비객체 `raw`의 자식 입력은 `{}`입니다. 판별 게이트는 `./<propertyName>` 값이 `values`에 드는지 판정하고 분기 `controls.active`와 AND합니다. 노드·조각의 active는 `BlueprintExpression.evaluate`로 실제 평가합니다. `if`만 런타임의 한 입력→boolean 동기 술어로 평가합니다. 식·술어의 실패는 `cause: 'expression'`입니다(TEST-069, 26C-04, ERROR-133).
- `BlueprintGate.evaluationHostPath`는 청사진이 정한 L입니다. 게이트를 L의 전순서에서 선언한 조각의 바로 뒤(그 조각의 노드 게이트 뒤)에 평가하고 옮긴 게이트끼리는 문서 순서를 지킵니다. 값이 바뀌면 L부터 선언 호스트까지 바퀴 안에서 재계산하며 그 비용은 호스트 바퀴 예산에 포함합니다. 두 번째 하강은 없습니다(SETTLE-045, 26C-04).
- 활성 선언을 `mergeEffectiveSchema`로 합쳐 `EffectiveSchema { schema, typeConflict }`를 소비합니다. `typeConflict`가 참인 경우와, 정적 선언 없는 이름에서 fold가 다른 게이트 선언이 동시에 켜진 경우 모두 `SHARED_NODE_CONFLICT`이며 `cause: 'sharedConflict'`입니다. 충돌 중에도 형·nullable은 정적 선언의 값이고, 첫 전순서 종류만 형상에 둡니다(BLUEPRINT-041·044, 26C-05).
- 전이는 직전 커밋에 없던 최종 형상 노드의 없음인 값에 `controls.default > default`를 채웁니다. 이미 있던 노드는 새 조각만으로 채우지 않습니다. 나간 노드의 비움은 확정된 정책에 따라 자신·하위 트리·잠복 자손에 적용하며 가까운 자손의 `false`가 이깁니다. `extras`는 그대로 둡니다. 전이 쓰기 또는 좁혀진 유효 목록으로 원래 입력을 재해석한 쓰기가 게이트를 바꾸면 다음 라운드를 돕니다. 한 노드는 라운드당 한 번 재해석합니다. 전이 상한도 `게이트 가진 조각 수 + 노드 게이트 수 + 1`이며 실제 쓰기를 낸 라운드만 셉니다(SETTLE-005·017, WRITE-098·099).
- 상한 초과 시 자동 쓰기를 되돌리는 Source-B 로그의 PR-2 항목은 `{ node, previousRaw, previousExtras }`입니다. 중간 채움 철회 전에 적용하고, 원본 B에는 쓰기 경계의 정적 해석만 남깁니다. 그 원본으로 형상을 한 번 더 계산하며 또 초과하면 마지막 활성 집합을 고정합니다. 객체 자식의 생김·빠짐은 형상 재계산으로 판정하고, 배열 구조의 생성·폐기 로그는 PR-5에서 더합니다(SETTLE-011, WRITE-099, TEST-069).
- `diagnostics`는 `{ status: 'stable' | 'degraded', cause?: 'budget' | 'expression' | 'injectTarget' | 'sharedConflict', exceededBudget?: 'hostWheel' | 'derive' | 'transition' | 'recursion', iterations?: number, commit?: number }`입니다. PR-2에서 실제로 쓰는 반복 예산은 `hostWheel`·`transition`이고 재귀 펼침 중지는 별도의 `recursion` 신호입니다. `derive`는 stage 04의 몫입니다. `iterations`는 초과한 예산이 쓴 반복 횟수인 상한값입니다. 모든 칸은 `commit`의 커밋을 설명하며 최초 손상 커밋을 유지합니다. 폼 수준 로드(마운트·폼 reset)에서만 `stable`로 초기화하고 `setValue`·`resetSubtree`는 비우지 않습니다(ERROR-130–133·190·204, SETTLE-013, 26C-02).
- 정착 오류는 기존 `src/errors/`의 `SchemaFormError`를 재사용해 도메인 오류 형식을 지키고, 정착 전용 코드(`BUDGET_EXCEEDED`, `RECURSIVE_SHAPE_DIVERGED`, `EXPRESSION_THREW`, `GUARD_FAILED`, `SHARED_NODE_CONFLICT`)는 settle 소유의 코드 상수로 모읍니다. 버린 트리의 노드 쓰기에만 남는 `DISPOSED_NODE_WRITE`도 같은 오류 클래스와 코드 소유를 쓰며, 단순히 형상을 떠난 참조의 쓰기는 오류가 아닙니다(NODE-044). 청사진 오류 상수와 섞지 않는 이유는 작성 시점과 커밋 뒤 실패 시점이 다르기 때문입니다. 기존 경고 이름공간 `SCHEMA_FORM_WARNING`의 `TYPE_MISMATCH`·`NON_JSON_WHOLE_VALUE`는 `helpers/warning/warningCode.ts`에 이름 붙인 문자열 상수로 둡니다. 기존 경고와 같은 접두를 재사용하고 개발 모드의 통째 값 검사만 후자 코드를 냅니다(VALUE-037, ERROR-070·133).
- 커밋은 `revision`과 커밋 번호를 올리고 Refresh 대상·잠복 원본 열거 메모·정합 경고등을 확정합니다. 루트의 잠복 원본은 `(절대 path, kind)`로, `typeMismatchPaths`는 현재 형상의 경로로 보관합니다. `inactiveValues`는 얼린 `{ path, value }` 배열을 커밋에서만 다시 만들고 빈 배열을 공유합니다. `typeMismatch`는 현재 유효 목록과 원본의 함수이고, `typeMismatches`는 커밋 번호로 메모한 하위 경로 목록입니다(VALUE-029·030·037, WRITE-087, SURFACE-061).
- `TYPE_MISMATCH` 기록은 `{ level: 'warning', code, path, expected: { schemaType, nullable, effective }, received, reason, candidates?, source }`이며 꺼짐→켜짐·재생김·로드·게이트 좁힘에서 한 번 보냅니다. 켜진 채 다른 어긋난 값이 와도 반복하지 않습니다. Refresh 대상은 로드가 아닌 쓰기에서 원본이 실제 바뀐 노드 중 입력 자신을 뺀 집합이고 `setValue(getValue())`의 대상은 비어 있습니다(VALUE-037, EVENT-071, 26C-03).
- 로드는 마운트·폼 reset·`resetSubtree`뿐입니다. 루트 `loadSnapshot`은 로드한 경로 P를 `setIn(snapshot, P, V)`로 갱신하고 `defaultValue`는 `getIn(snapshot, node.path)`입니다. 폼 수준 로드는 에지·생김 기준과 진단을 비우며, `resetSubtree`는 하위 트리만 새 수명으로 보아 채움·비움 범위를 제한합니다. 일반 쓰기는 `setValue(V)`도 직전 커밋을 기준으로 삼습니다(WRITE-085·090, SETTLE-048·049, ERROR-204).
- 잎 입력은 재계산 목록·자동 쓰기 로그만 순회합니다. 로드와 전체 교체 쓰기만 쓰기가 닿은 하위 트리를 한 번 순회할 수 있습니다. 나감·채움에 꼭 필요한 하위 선언 순회는 해당 범위로 제한합니다(SETTLE-017·047).
- 정착 오류와 공유 충돌은 모든 환경에서 원본 B 또는 가능한 계산 결과를 커밋하고 진단을 기록한 뒤, PR-2에서는 `settle` 호출의 끝에서 던집니다. 통지 기제가 들어오면 커밋·통지 뒤 사슬 끝이라는 ERROR-070의 순서를 지킵니다(TEST-069, ERROR-070).

## Acceptance Criteria

### settle-gates — 평가와 위치

- 판별·노드/조각 active는 실제로 평가하고 `if` 대역만 사용합니다. L로 옮긴 게이트의 사촌·루트 읽기와 순환은 고정 출발점에서 같은 형상을 냅니다(SETTLE-045, 26C-04).

### settle-budget — 원본 B와 진단

- 호스트·전이 초과 및 재귀 무한 확장은 원본 B·`degraded`·해당 `exceededBudget`을 커밋한 뒤 오류를 던지고, 폼 수준 로드 전에는 진단이 유지됩니다(SETTLE-011, ERROR-190·204, TEST-069).

### settle-write — 쓰기 범위

- 두 단계 해석·로드 스냅숏·`resetSubtree`·옵션 억제·Refresh 대상을 쓰기 종류와 범위에 맞게 확정하고 잎 입력은 트리 전체를 걷지 않습니다(WRITE-015·085·098·099, EVENT-071, SETTLE-047).

## Last Updated

2026-09-29
