# surface 겉면 계약

## Requirements

겉면은 엔진의 결정을 전달하며 독립적인 상태 소유자가 되지 않습니다. 클래스와 공개 판별 합집합을 분리하는 이유는 한 런타임 구현으로 종류별 형 안전성을 제공하면서 정착 규칙이 두 곳에 생기는 것을 막기 위해서입니다.

## API Contracts

공개 읽기·명령의 선언은 [공개 노드 형](type.ts)이 정본입니다. [쓰기 계약](../engine/write/DETAIL.md), [값·슬롯 계약](../engine/settle/DETAIL.md), [검증 계약](../engine/validation/DETAIL.md)을 재정의하지 않습니다. `source` 같은 런타임 레코드 접근자가 존재한다는 사실은 패키지 공개 형에 대한 약속이 아닙니다.

### NODE-010 — 공개 노드와 바인딩의 분리

- 메서드는 프로토타입에서 공유하고 생성자에 노드별 함수·보조 컨테이너 할당을 추가하지 않습니다. 노드 수에 비례하는 고정 비용을 늘리지 않기 위한 제약입니다. 클래스에는 저장·읽기·위임만 두고, 종류와 전략은 생성 때 선택한 동작 행에 맡깁니다. 공개 배열 동사는 ArrayNode에서만 좁혀지며 런타임 비배열 거부는 엔진이 맡습니다. 두 번째 종류별 분기를 겉면에 만들지 않기 위한 경계입니다.
- 생성과 마운트를 분리하여 루트 교체가 기존 사슬을 인계한 뒤 새 트리를 로드할 수 있게 합니다. `fieldNodeFactory`는 core의 트리 생성 소비자가 필요로 하는 내부 통로이며 패키지 소비자의 생성 API가 아닙니다.
- 입력 출처·입력 마침·맥락·실행 설정·검증 epoch와 표시 이력은 바인딩 전용입니다. 공개 노드 메서드나 패키지 export를 늘려 내부 수명 제어를 소비자에게 떠넘기지 않습니다. `batchFieldNodeLoad`는 load origin을 전달하되 중첩 사슬의 바깥 origin을 보존합니다.
- 청사진 캐시는 호출자가 주입합니다. 겉면이 app 상태를 import하면 core-only 생성과 React 생성의 독립성이 깨집니다.

### SURFACE-050 — 읽기의 의미와 주소

- `value`는 노드의 합성 값, `outputValue`는 그 노드가 내보내는 값입니다. 부모의 투영이 더 적용될 수 있으므로 local 값과 루트 출력의 경로 값이 같은 참조라는 약속을 만들지 않습니다. 폼 밖의 값 읽기는 루트 출력이며 제출이라는 동작 이름을 값 이름으로 사용하지 않습니다.
- 상태 저하도 커밋된 값 읽기를 막지 않습니다. 진단은 트리 전체의 상태이며 떼어진 참조의 `diagnostics`·`globalState`·`globalErrors`·`context`도 공유 runtime을 읽습니다. 이것을 마지막 커밋에 고정되는 노드별 읽기와 혼동하지 않습니다.
- 공유 노드는 여러 선언에서 생길 수 있으므로 공개 `schemaPath` 하나로 신원을 표현하지 않습니다. React 바인딩은 인스턴스 신원을 사용하며, 스키마 오류 주소는 검증의 책임입니다. 공개 분기 선택 명령도 두지 않아 작성한 게이트 규칙과 별도 선택 상태가 충돌하지 않게 합니다.

## Acceptance Criteria

### surface-members — 겉면의 단일 책임

NODE-010·SURFACE-005·SURFACE-034·SURFACE-058. 멤버 계약 시험과 공개 형이 실제 겉면을 함께 검증합니다. 멤버 개수나 구현 표를 문서에 복제하지 않으며, 내부 입력 쓰기를 별도 공개 `write` API로 만들지 않습니다.

### surface-types — 판별과 참조

NODE-015·NODE-041·NODE-046·NODE-049·NODE-050·NODE-057·NODE-058·NODE-059. `type`은 노드 종류이고 `schemaType`은 정적 선언으로 계산한 JSON 허용 종류를 보존합니다. integer 노드는 number 종류이며 virtual에는 JSON 종류가 없어 `schemaType`이 undefined입니다. 정적 목록과 게이트가 좁힌 유효 `jsonSchema.type`을 같은 것으로 취급하지 않습니다. type·strategy·nullable·schemaType은 인스턴스 수명 동안 고정되며 같은 청사진 칸의 schemaType 목록은 동결 참조를 공유합니다. null은 nullable로 분리하고 number와 함께 있는 integer는 허용 집합 계산에서 흡수될 수 있으므로 저자의 type 배열을 그대로 복사한 필드로 해석하지 않습니다.

`UnionNode<Types, Nullable>`는 `isMisfit`로 읽기를 좁히며 false는 유효 목록과 nullable에 맞는 종류라는 뜻이지 검증 통과가 아닙니다. 알려지지 않은 값을 읽을 수 있어도 쓰기 허용 형을 unknown으로 넓히지 않습니다. 일반 React 입력 props와 노드 전용 `FieldNodeInputProps`는 서로 다른 형이며 [입력 형 계약](../../types/DETAIL.md)을 따릅니다. 정적 추론은 참조·게이트·복합 연언의 실행 결과를 추측하지 않습니다.

부재를 받는 종류·전략 가드는 null과 undefined에서 false이고 추가 할당을 하지 않습니다. parent·terminal children·단일 탐색의 부재인 null은 JSON 값 null·NullNode·nullable과 별개입니다. 복수 탐색은 빈 목록이며 실제 노드 작업에는 노드를 필수로 둡니다.

### surface-detached — 떼어진 참조의 고정 읽기

NODE-044·NODE-066. 떼어진 참조는 마지막 노드별 값·상태·오류·자식 읽기를 보존하고 구독을 다시 발화하지 않습니다. `isActive`·`isPresent`·`isDivergent`는 false입니다. 값 쓰기·배열 동사·하위 reset은 새 인스턴스나 비활성 원본에 닿지 않는 무동작이며 개발 경고만 냅니다. 비활성 값 변경은 살아 있는 루트·호스트의 경로 JSON 쓰기로 합니다.

비활성과 미선언을 탐색 반환값으로 구분하지 않는 이유는 [navigation](../engine/navigation/DETAIL.md)의 부재 계약에 따릅니다. 이 무동작 규칙을 폐기된 노드의 모든 상태·오류·요청 진입에 일반화하지 않습니다. 각 진입의 검사 순서는 쓰기 계약이 정합니다.

### surface-slot-new-instance — 슬롯 복제의 새 수명

NODE-060·NODE-065. 재진입은 새 노드와 자손을 만듭니다. 슬롯이 원본을 보존한다는 사실은 옛 인스턴스나 핸들러 수명을 보존한다는 뜻이 아닙니다.

### surface-slot-old-subscriptions — 옛 구독의 무통지

NODE-044. 같은 경로가 살아나도 옛 구독은 새 노드로 이전하지 않습니다. 장기 소비자는 현재 트리에서 다시 찾고 구독하여 서로 다른 수명의 사건을 섞지 않습니다.

### surface-slot-interaction-reset — 상호작용과 오류의 새 수명

새 인스턴스에는 옛 상호작용·오류·배달 이력을 복제하지 않습니다. `onInactive` 등록도 인스턴스 수명이므로 재등록하며, 해제 함수의 반복 호출이 나중 등록을 지우지 않아야 합니다. 보존값 결정은 [슬롯 계약](../engine/settle/DETAIL.md)이 소유합니다.

### surface-slot-array-keys — 복제된 배열의 신원

배열 자손의 재진입 키는 새 수명을 나타냅니다. 원본 값 복원과 입력 인스턴스 재사용을 혼동해 옛 입력의 내부 상태를 되살리지 않습니다.

### surface-slot-frozen-reads — 고정된 슬롯 읽기

옛 참조의 노드별 읽기는 후속 overlay·reset·재진입으로 바뀌지 않습니다. 같은 상태의 inactiveValues 읽기는 동결 목록의 참조를 재사용하여 불필요한 소비자 갱신을 막습니다. 리터럴 별표 속성도 일반 슬롯 수명을 따르며 주소의 `/%2A`를 wildcard와 혼동하지 않습니다.

### surface-slot-memory-bound — 보유 수명

반복 재진입이 옛 노드들을 누적 보유하지 않아야 합니다. 보유 상한과 지연 할당은 슬롯 소유자의 계약이며 겉면 생성자에 별도 슬롯 자료나 전체 트리 순회를 추가하지 않습니다.

### NODE-067 — 상호작용과 출력 차이

`isEdited`·`isTouched`는 상호작용 기록이고 `isDivergent`는 현재 출력의 기준 차이입니다. 값을 원래대로 돌려도 상호작용 기록은 지워지지 않으므로 둘을 같은 dirty 개념으로 합치지 않습니다. 노드 boolean의 `is` 이름과 React props·Hint의 `required`·`misfit` 이름은 각 경계의 어휘를 유지합니다. 비교 기준·배열 위치·비용은 [VALUE-044](../engine/settle/DETAIL.md)가 소유하며 React 재구독 조건은 [hooks](../../hooks/DETAIL.md)가 소유합니다.

### surface-visit — 하위 트리 방문

SURFACE-062. 방문은 자기 포함 전위이며 false는 그 하위만 생략합니다. 현재 형상만 걷되 떼어진 시작점은 고정된 마지막 구조를 걷습니다. 읽기만 하는 방문은 사슬을 열지 않고 첫 쓰기에서 지연 배치가 열립니다. 순회 중 읽기는 직전 커밋이며 visitor가 던져도 표시한 쓰기를 커밋한 뒤 다시 던집니다. 바깥 배치·리스너·오류 관찰자의 기존 진입 규칙을 우회하는 통로가 되어서는 안 됩니다.

## Boundary Exemptions

### `runtime/requireRuntimeFieldNode.ts` — 검증 전용 runtime bridge

- **Consumers**: `src/__tests__/helpers/readFieldNodeRuntime.ts`, `src/__tests__/helpers/releaseFieldNodeRevealHistory.ts`
- **Direct import**: `allowed`
- **Reason**: 공개 노드로 수행하는 mount 시험이 같은 runtime의 release 이력·committed policy·pending을 함께 관찰해야 합니다. 시험을 위해 패키지 표면이나 전용 pending 바인딩을 늘리지 않고 기존 accessor를 두 검증 bridge에만 허용합니다.

## Last Updated

공개 읽기·형·노드 수명 또는 바인딩 경계가 바뀔 때 갱신합니다.
