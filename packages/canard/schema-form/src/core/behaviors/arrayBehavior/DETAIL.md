# arrayBehavior 계약

## Requirements

- 이 종류는 `blueprint`의 자리 청사진과 `record`의 행 계약을 소비하고, 구조 연산의 효과는 `settle`에 맡깁니다. `branch/`와 `terminal/`은 전략별 내부 조직이고 `utils/`는 두 전략의 투영·구멍 채움·계획 보조를 소유합니다(NODE-006·009·016, LANDING-056·085).
- 배열의 branch·terminal 선택은 청사진의 `strategy`가 정합니다. 렌더 입력을 행에서 검사하거나 터미널 여부를 다시 판정하지 않습니다(NODE-002·028, 35C-12).

## API Contracts

- 진입점은 `arrayBehavior: { branch: Behavior; terminal: Behavior }`를 이름으로 내보냅니다. 두 행 모두 `interpret`, `assemble`, `project`, `finishInput`, `declareChildren`, `arrange`, `type`, `strategy` 순서의 여덟 칸을 가지며 `type`은 `'array'`, `strategy`만 각각 `'branch'`·`'terminal'`입니다. `finishInput`은 별도의 배열 입력 마침 쓰기를 하지 않습니다(NODE-002·006, LANDING-056, 36C-01, 실행 ADR D1).
- branch의 `interpret`는 배열을 자식 분배 입력으로 두고 호스트 `raw`에는 저장하지 않으며, `null`·수·평범한 객체 같은 잘못된 종류는 호스트 `raw`로 보존합니다. `declareChildren`은 청사진의 자리 항목 보조로 `0`부터 `itemCount - 1`까지 청사진이 있는 자리의 항목만 돌려주며 노드를 생성하지 않습니다(NODE-006·021·052, VALUE-002, 실행 ADR D2).
- branch의 `assemble`은 아이템 방출을 자리 순서로 놓고 방출 없는 객체 아이템은 `{}`, 배열 아이템은 `[]`, 잎 아이템은 `null`로 채운 뒤 청사진 없는 꼬리 자리의 `extras`를 순서대로 잇습니다. `omitEmpty`가 켜진 union 잎 아이템의 `{}`도 방출 없는 자리여서 `null`입니다. 아이템이 없으면 `local`은 `[]`이고 각 원소가 이전 값과 같으면 이전 배열 참조를 재사용합니다(NODE-052, VALUE-034·037, LANDING-165).
- branch의 `project`는 유효 스키마 메모와 함께 한 번 계산한 정적 `options`의 `omitTrailing`·`omitEmpty` 비트로 분기합니다. `omitTrailing`은 채운 꼬리 자리를 자르고, 기본으로 켜진 `omitEmpty`는 아이템 없는 `[]`의 방출을 생략합니다. 비배열 `raw`(`null`·수·평범한 객체)를 든 호스트는 아이템이 없고 그 `raw`를 받은 그대로 방출하며 정합 경고등이 켜집니다(38C-01, 39C-01). 투영은 `raw`와 상태를 바꾸지 않고 배열 루트의 방출이 없으면 루트 `outputValue`는 `[]`입니다(NODE-006, VALUE-034·037, LANDING-085).
- 두 행의 `arrange(node, operation)`는 순수 계획만 돌려줍니다. 연산은 `push(value?)`, `pop()`, `update(index, value)`, `remove(index)`, `clear()`이고, branch 계획은 새 자리마다 이전 자리 색인 또는 생성 값, 무동작 여부, 반환 값의 출처를 담습니다. 범위 밖·음수 색인의 `update`·`remove`, 빈 배열의 `pop`, 값이 `null`인 배열의 모든 동사는 오류 없는 무동작이며 삽입 동사는 없습니다. core는 `minItems`까지 채우거나 `maxItems`를 넘는 쓰기를 막지 않습니다(SURFACE-005, WRITE-022, 35C-03·06, 36C-01, 실행 ADR D1).
- terminal은 자식 선언이 없고 `raw`에 배열 전체 참조를 들며 `assemble`은 그 참조를 유지합니다. `project`는 같은 정적 투영 비트를 배열 원본에 적용하고 비배열 원본은 받은 그대로 방출하며 아이템 빈자리 채움은 적용하지 않습니다(39C-01). `arrange`는 유효한 동사에 기존 원본의 사본 위에서 적용한 새 원본 계획을 돌려주고, 무동작에는 무동작 계획을 돌려줍니다. 아이템 노드·재색인·배열 구조 로그는 없습니다(NODE-005·027, VALUE-034·037, 35C-06·12).
- `utils/`는 `omitTrailingArray`·`omitEmptyArray`, 빈자리 채움, 자리별 값과 `extras` 합성, 순수 구조 계획 보조를 소유합니다. 두 투영 보조는 입력을 바꾸지 않고 다른 종류에 재수출하지 않습니다(NODE-009, LANDING-085).
- 비배열 행의 `arrange`는 behaviors 공유 organ의 동일한 거부 칸이며 모든 환경에서 `path`와 `details.method`를 담은 `SchemaFormError`를 가칭 코드 `ARRAY_METHOD_ON_NON_ARRAY`로 즉시 던집니다. ERROR-197의 throw 직전 `onError` 보고는 dispatch 배선 PR이 더합니다(NODE-014, ERROR-197, 35C-01).

## Acceptance Criteria

### array-branch — 자리별 합성과 투영

- 배열 입력은 위치별 청사진으로 분배되고 잘못된 종류의 원본은 보존됩니다. 방출 없는 아이템은 종류별 빈자리로 채우며 청사진 없는 꼬리 값은 `extras`에서 방출되고, `omitTrailing`·`omitEmpty`는 원본을 바꾸지 않습니다(NODE-052, VALUE-034·037, LANDING-085).

### array-terminal — 통째 원본

- terminal은 자식과 구조 로그 없이 배열 참조를 원본으로 들고, 다섯 동사를 사본의 새 원본 계획으로 나타내며 같은 투영 선택을 따릅니다(NODE-005, 35C-12).

### array-arrange — 순수 계획과 거부

- branch 계획은 자리 출처·무동작·반환 출처를 나타내고, 터미널 계획은 새 원본을 나타냅니다. 범위 밖·빈 배열·`null` 무동작과 비배열 공유 칸의 즉시 오류가 행에서 확정됩니다(NODE-014, ERROR-197, 35C-01·03·06).

## Last Updated

2026-10-01
