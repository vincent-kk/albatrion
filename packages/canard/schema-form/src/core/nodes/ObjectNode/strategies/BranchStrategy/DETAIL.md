## Requirements

### 기능 요구사항

- `ObjectNode`의 기본 프로퍼티 자식 노드와 `oneOf`/`anyOf` 조건부 분기 자식 노드를 통합 관리한다.
- `oneOf` 인덱스 또는 `anyOf` 인덱스가 변경될 때 비활성 분기 노드를 `__reset__`하고 활성 분기 노드를 복원한다.
- 분기 활성화 복원 입력은 자식 자신의 실질 배열 상태(`__hasArrayState__` — same-batch 하이드레이션·비활성 분기 주입) > 합성값 순으로 선택한다. pristine 빈 배열(`[]`)은 상태로 치지 않으며(배열 한정 판정 — 기본값 객체는 pristine 구분 불가), 평범한 왕복 재활성화는 기본값 복원 계약을 유지한다.
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
- 값을 읽어도 값·이벤트·주입·출처가 바뀌지 않는다. `value` getter는 커밋하지 않고, `__value__`에 보류 중인 `__draft__`를 얹은 합성값을 돌려준다. 커밋은 원래 경로(동기 emit 또는 `RequestEmitChange` 배치)에서 원래 옵션으로 한 번 일어난다 — 그래서 모든 동작은 아무도 값을 읽지 않았을 때의 동작과 같다.
- 합성값은 캐시한다. base·draft·`__isolated__`가 바뀌지 않는 동안 반복 읽기는 같은 참조를 돌려준다: `normalizedValue`가 `value`와 같은 getter라서, 참조가 흔들리면 `__propagate__`의 에코 가드가 객체 자식의 전파를 건너뛴다. 그 뒤 draft가 바뀌지 않은 채 getter와 같은 합성 조건(Replace·Normalize 없음)으로 커밋되면 커밋은 합성을 다시 하지 않고 그 객체를 `__value__`로 채택한다.
- 보류 중인 자식 쓰기가 있을 때 통째 대입(`applyValue`)은 그 쓰기를 대체하고, 함수형 대입은 그 쓰기를 얹은 합성값 위에 쌓인다.
- `processValueWithValidate`로 비활성 oneOf/anyOf 분기 키를 객체 값에서 제거한다.

### null 상태 요구사항

`ObjectNode`의 null 계약(상위 DETAIL)을 이 전략이 구현한다.

- null 판정은 `__value__ === null`이고 `__draft__`에 대기 중인 자식 쓰기가 없는 상태다.
- null인 동안 자식 emit은 기록(`__blank__`)되거나 객체를 만든다. 기록만 하는 경우: `automatic` 표식이 있는 emit, 전략이 스스로 자식을 구동하는 `__locked__` 구간(생성·전파·분기 복원·blank reset)의 emit, 값 없는 emit(`undefined`). 그 외의 emit은 기록 전체를 draft로 옮긴 뒤 그 쓰기를 얹어 커밋한다.
- 기록은 null이 전파될 때마다 새로 만든다 — blank reset이 아무것도 바꾸지 않는 자식은 emit하지 않으므로 이전 구간의 항목이 남는다. 분기 재합성 시에는 활성 분기 키로 가지치기한다.
- null이 커밋되어 전파될 때 자식은 `null`을 받는 대신 `__resetToBlank__`로 재구성된다. nullable이 아닌 객체(`{}`로 커밋됨)는 자식에 `null`을 전파하는 기존 동작을 유지한다.
- `resetToBlank(input?)`는 생성자를 그대로 따른다: `input` 또는 스키마 기본값을 `__value__`로 두고, 잠금 안에서 자식을 재구성한 뒤 Replace 없이 커밋한다. 그래서 자식이 되풀이할 뿐인 base는 생성 시와 같이 부모에 보고되지 않는다.
- `__processCompositionValue__`는 검증 enhancer를 먼저 갱신한 뒤, null이면 값을 재합성하지 않고 반환한다. 순서가 바뀌면 null인 채 확정된 분기 안에서 객체가 될 때 oneOf 검증이 실패한다.
- `__parseValue__`는 Replace가 아닌 커밋에서 null base에 빈 draft를 병합하는 것을 "변화 없음"으로 보고, 키가 있는 draft는 `__blank__` 위에 얹는다 — 자손 쓰기와 노드 자신에 대한 `Merge`가 같은 결과를 낸다.
- null인 동안 자식의 기본값 출처는 노드 자신의 객체 `default`(`__blankBase__`)다. 생성 시(`defaultValue`가 `null`일 때)와 blank reset 모두 자식에게 그 조각을 넘긴다.
- 커밋의 출처: 자식 emit이 `automatic`이 아니고 잠금 밖이면 `__intended__`를 세우고, 커밋은 옵션에 `Automatic`이 있고 `__intended__`가 없을 때만 automatic으로 부모에 전달된다. `__intended__`는 변화 없는 커밋을 포함한 모든 커밋 시도에서 소비된다. draft에 이미 있는 값과 같은 값을 다시 쓰는 중복 emit도 같은 규칙을 따른다: `automatic`이 아니고 잠금 밖이면 `__intended__`를 세우고, 대기 중인 커밋이 없으면 커밋을 예약한다 — 같은 틱의 자동 쓰기가 먼저 같은 값을 넣었어도 값을 담은 밖에서의 쓰기는 null 조상에 도달한다.
- 밖에서의 쓰기로 인한 커밋은 host에 `__markIntendedWrite__`로 알린다 — 자식이 일으킨 커밋은 `setValue`를 지나지 않으므로, host의 `injectTo`가 출처를 물려받으려면 이 통지가 필요하다.
- 변화 없는 커밋이 밖에서의 쓰기를 흡수했고 조상 중 null이 있으면(`__hasNullAncestor__`) 현재 값을 부모에 다시 전달한다 — 값을 담은 쓰기는 깊이와 무관하게 null 조상에 도달해야 한다.
- 밖에서의 쓰기에는 자식이 올려 보낸 쓰기와 노드 자신에 대한 자동이 아닌 쓰기가 모두 포함된다: 이미 들고 있는 값과 같은 값을 `Merge`로 써도 null 조상에 도달한다. 키가 없는 객체(`{}`)를 `Merge`로 쓰는 것은 값을 담지 않으므로 도달하지 않는다.

## API Contracts

### 공개 인터페이스 (`ObjectNodeStrategy` 구현)

| 멤버                        | 종류   | 설명                                                                                |
| --------------------------- | ------ | ----------------------------------------------------------------------------------- |
| `children`                  | getter | 현재 활성 자식 노드 배열                                                            |
| `subnodes`                  | getter | 모든 분기 포함 전체 자식 노드 배열                                                  |
| `value`                     | getter | 현재 값 — 보류 중인 자식 쓰기를 얹은 합성값. 읽기는 커밋하지 않는다                 |
| `applyValue(input, option)` | method | 외부에서 값 적용 (draft 갱신 → emit)                                                |
| `initialize()`              | method | 자식 노드 활성화 및 초기 분기 확정 (`ObjectNode.__initialize__` 전용)               |
| `resetToBlank(input?)`      | method | 기본값 없는 폼이 만드는 상태로 서브트리 재구성 (`ObjectNode.__resetToBlank__` 전용) |

## Acceptance Criteria

### initial-mount — 초기 분기 확정과 computed 정합

- oneOf 스키마를 가진 `ObjectNode`를 초기 마운트할 때 `children`은 활성 분기의 자식을 포함해야 한다 (빈 배열이어서는 안 됨).
- `initialize()` 완료 후 `__children__`은 `__processChildren__()` 결과와 동일해야 한다.
- `UpdateComputedProperties` 이벤트 구독 시점에 `__oneOfChildNodeMap__`과 `__anyOfChildNodeMaps__`는 이미 초기값으로 채워져 있어야 한다.
- 순수 computed 속성(`visible`/`readOnly`/`computeManager.active`)은 `__primeInitialBranch__` 동기 시점에 이미 확정된다. 단, oneOf 분기 자식의 scope-gated `active`(`__scoped__`)는 마이크로태스크 `__processOneOfChildren__`의 `__reset__({ updateScoped })`에서 확정되며, 목록이 동기 확정된 덕에 안전하게 복구된다.
- `__children__`이 `[]`로 시작하여 constructor 단계 `__processComputedProperties__`가 no-op이어도, 초기화 정착 후 비활성 자식 값은 최종 `value`에서 제외되어야 한다.

### branch-restore — 분기 전환 복원

- `oneOfIndex`가 변경될 때마다 이전 분기 노드는 `__reset__`되고 새 분기 노드는 복원된다. 자식이 실질 배열 상태를 이미 갖고 있으면(`__hasArrayState__` — same-batch 하이드레이션·비활성 주입) 그 raw 상태가 복원 입력이 되어 출력 필터(omitTrailing 등)가 자식 구조(빈 항목 포함)를 바꾸지 않고, 그 외 재활성화는 기본값을 복원한다.
- `__propagate__`는 필터링 중(raw ≠ normalized)인 자식이 이미 방출 중인 값과 동일한 조각을 되적용하지 않는다.

### null-preservation — null은 의도된 쓰기로만 풀린다

- null 객체는 생성 중 자식 emit, oneOf/anyOf 초기 분기 확정과 재합성, computed 재평가, derived 의존값 변경, computed `active` 전환, 중첩 객체·배열의 지연 커밋을 거쳐도 `null`이다.
- 같은 배치에 자동 쓰기와 밖에서의 쓰기가 섞이면 객체가 된다.
- 객체가 된 값은 null이 아니었던 폼의 같은 쓰기와 같고, 활성 분기의 키만 포함한다.
- null이 된 뒤 자식 상태는 `defaultValue: null`로 생성한 폼과 같다 — derived 배열, `minItems` 배열(두 전략), 자체 `default`를 가진 객체, `default: null` 객체, 중첩 oneOf 포함. 어느 oneOf/anyOf 분기의 자식이든 null이 되면 생성 시점에 받은 기본값까지 빈 양식의 값으로 바뀐다: 분기 복원은 자식을 그 기본값으로 되돌리므로, null이 되기 전의 값은 null인 동안의 입력에도, 이후 어느 분기를 골라 풀린 값에도 나타나지 않는다.
- null → 쓰기 → null → 쓰기를 반복해도 앞 구간의 기록이 뒤 구간의 값에 섞이지 않는다.
- null 조상이 없는 폼에서 같은 값을 다시 쓰는 것은 루트 `onChange`를 발생시키지 않는다.

### pending-read — 값을 읽어도 아무것도 바뀌지 않는다

- 자식의 배치 쓰기와 부모 커밋 사이에 누가 객체 값을 읽든(React 렌더, 구독자, 마이크로태스크, 조상 조회) 최종 값, 객체의 `UpdateValue` 횟수, computed 의존성이 보는 값, `injectTo` 도착 시점과 출처는 읽지 않았을 때와 같다.
- derived 값만으로 구동된 중첩 객체의 커밋은 렌더 중 읽기가 있어도 null 조상을 풀지 않는다.
- 보류 중 반복 읽기는 같은 참조를 돌려주고, draft가 그대로 커밋되면 커밋 후의 `value`도 그 참조다.
- 읽기 없는 구성의 값·`UpdateValue` 횟수·루트 `onChange` 순서는 `[baseline]` 테스트의 리터럴과 같다.
- 한 틱 안에서 자동 쓰기 뒤에 같은 값의 의도한 쓰기가 오면 null 조상이 풀린다.

### children-sync — 자식 목록 동기화

- `__subnodes__`와 `__children__`은 항상 `BranchStrategy` 내부에서만 동기화된다.

## History

- 2026-09-20 — `value` getter가 커밋하던 동작(commit-on-read)을 제거하고 합성값 캐시로 대체, 중복 emit의 출처 래치를 추가. 이유: getter가 보류 중인 커밋을 고정 옵션(`BatchedEmitChange`)으로 앞당겨, 읽는 시점에 따라 (1) derived 값이 의도한 쓰기로 분류되어 null 조상을 풀었고(기본 `<Form>` 렌더가 렌더 중 `node.value`를 읽어 사용자 코드 없이 재현), (2) 앞당긴 커밋이 `UpdateValue`를 내지 않아 객체 경로의 computed 의존성이 낡았고, (3) `UpdateValue`에서 출발하는 `injectTo`가 사라지고 소비되지 않은 출처가 다음 자동 갱신을 오염시켰다. 중복 검사는 래치보다 먼저 반환해 자동→의도 순의 같은 값 쓰기가 null 조상에 닿지 못했다. 기각한 안: getter 옵션에 `Automatic`만 추가(1만 고침), `PublishUpdateEvent` 추가(렌더 중 구독자 동기 실행), 렌더 중 읽기 제거(방아쇠 하나만 옮김). 캐시 없는 비커밋 getter는 참조가 흔들려 에코 가드가 전파를 건너뛰었다. 회귀 가드: `ObjectNode.branch.pendingRead`, `nullable.object-pending-read*.render`.
- 2026-09-20 — null 상태 요구사항과 `null-preservation` 추가. 자식 값 기록(`__blank__`), 쓰기 출처 표식(`Automatic`/`__intended__`), 생성자를 따르는 `resetToBlank`를 도입. 이유: 자동 쓰기와 의도된 쓰기가 같은 `setValue` 경로로 도착해 구분할 수 없었고, derived·중첩 노드의 지연 커밋은 부모의 잠금 밖에서 도착했다. 검토 중 기각한 안: "보이는 값과 같은 쓰기는 무시" — default를 수락해 객체를 만들 방법이 없어진다. 회귀 가드: `ObjectNode.branch.nullable.*`, `nullable.object-*.render`.
- 2026-08-12 — 분기 복원이 자식의 실질 raw 배열 상태를 우선 소비하도록 전환(`__hasArrayState__`), `__propagate__`에 필터링 자식 출력-에코 가드 추가. 이유: 복원·분배가 출력-정제된 합성값을 상태로 소비해 `options.omitTrailing` 배열의 후행 빈 항목 노드가 same-batch 하이드레이션에서 소실됐다. 왕복 재활성화의 기본값 복원 계약(`initialDefault` 스위트)은 유지. 회귀 가드: `array.omit-trailing.composite/conditional` 시나리오.
- 2026-06-06 — 초기화 순서 불변식과 초기 computed 정합성을 명문화. 이유: 분기 노드가 computed 속성 계산 전에 복원되면 조건부 필드가 잘못된 활성 상태로 초기화됐다. 회귀 가드: `BranchStrategy.oneOf.initialComputed`.

## Last Updated

2026-09-20 — `pending-read` 수용 기준과 읽기·캐시·중복 emit 래치 요구사항 추가.
