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

## Last Updated

2026-05-28 — `__primeInitialBranch__()` 추가로 인한 초기화 순서 불변식 문서화 (fix/schema-form-oneOf).
