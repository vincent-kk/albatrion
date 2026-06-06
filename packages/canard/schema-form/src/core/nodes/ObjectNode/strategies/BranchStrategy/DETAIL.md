## Requirements

### 기능 요구사항

- `ObjectNode`의 기본 프로퍼티 자식 노드와 `oneOf`/`anyOf` 조건부 분기 자식 노드를 통합 관리한다.
- `oneOf` 인덱스 또는 `anyOf` 인덱스가 변경될 때 비활성 분기 노드를 `__reset__`하고 활성 분기 노드를 복원한다.
- `__children__`은 현재 활성 분기만 포함하고, `__subnodes__`는 모든 분기를 포함한다.
- `__isolated__` 모드에서 `setValue` 직접 호출 시 조건부 필드 필터링(`processValueWithCondition`)을 적용한다.
- `__draft__` + `__value__` 이중 버퍼로 점진적 값 갱신을 지원한다.

### 초기화 순서 불변식

`initialize()` 내부 실행 순서는 다음을 반드시 따른다:

1. 모든 `__subnodes__`에 대해 `__initialize__()` 호출 (자식 노드 활성화).
2. `computed` 관리자가 활성화된 경우 `__prepareProcessComputedProperties__()` 등록.
3. `__primeInitialBranch__()` 호출 — `UpdateComputedProperties` 캐스케이드 이전에 초기 `oneOf`/`anyOf` 활성 분기를 스냅샷. React의 첫 번째 `useState(node.children)` 호출이 완전한 자식 목록을 읽도록 보장.
4. `__processChildren__()` 호출 — 스냅샷된 분기 맵을 기반으로 `__children__` 배열 확정 및 `UpdateChildren` 이벤트 발행.

이 순서를 변경하면 oneOf 초기 렌더링 경쟁 조건(initial-render race condition)이 재발한다.

### 값 처리 요구사항

- `applyValue()` 호출 시 `__draft__` 갱신 → `__expired__ = true` → `__emitChange__()` 순으로 처리한다.
- `__locked__ = true` 구간에서는 자식→부모 재귀 업데이트를 차단한다.
- `processValueWithValidate`로 비활성 oneOf/anyOf 분기 키를 객체 값에서 제거한다.

## API Contracts

### 공개 인터페이스 (`ObjectNodeStrategy` 구현)

| 멤버                        | 종류   | 설명                                                                  |
| --------------------------- | ------ | --------------------------------------------------------------------- |
| `children`                  | getter | 현재 활성 자식 노드 배열                                              |
| `subnodes`                  | getter | 모든 분기 포함 전체 자식 노드 배열                                    |
| `value`                     | getter | 현재 커밋된 객체 값                                                   |
| `applyValue(input, option)` | method | 외부에서 값 적용 (draft 갱신 → emit)                                  |
| `initialize()`              | method | 자식 노드 활성화 및 초기 분기 확정 (`ObjectNode.__initialize__` 전용) |

### 수용 기준

- oneOf 스키마를 가진 `ObjectNode`를 초기 마운트할 때 `children`은 활성 분기의 자식을 포함해야 한다 (빈 배열이어서는 안 됨).
- `initialize()` 완료 후 `__children__`은 `__processChildren__()` 결과와 동일해야 한다.
- `UpdateComputedProperties` 이벤트 구독 시점에 `__oneOfChildNodeMap__`과 `__anyOfChildNodeMaps__`는 이미 초기값으로 채워져 있어야 한다.
- `oneOfIndex`가 변경될 때마다 이전 분기 노드는 `__reset__`되고 새 분기 노드는 복원된다.
- `__subnodes__`와 `__children__`은 항상 `BranchStrategy` 내부에서만 동기화된다.
- 순수 computed 속성(`visible`/`readOnly`/`computeManager.active`)은 `__primeInitialBranch__` 동기 시점에 이미 확정된다. 단, oneOf 분기 자식의 scope-gated `active`(`__scoped__`)는 마이크로태스크 `__processOneOfChildren__`의 `__reset__({ updateScoped })`에서 확정되며, 목록이 동기 확정된 덕에 안전하게 복구된다.
- `__children__`이 `[]`로 시작하여 constructor 단계 `__processComputedProperties__`가 no-op이어도, 초기화 정착 후 비활성 자식 값은 최종 `value`에서 제외되어야 한다.

## Last Updated

2026-06-06 — 초기화 순서 불변식(`__primeInitialBranch__()`)에 더해, 초기 computed 정합성(순수 computed 동기 / scope-gated `active` 마이크로태스크)과 비활성 값 필터링 무해성을 수용 기준으로 명문화. 회귀 가드: `BranchStrategy.oneOf.initialComputed`.
