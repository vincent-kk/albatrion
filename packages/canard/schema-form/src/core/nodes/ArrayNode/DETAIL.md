# ArrayNode contract

## Requirements

- JSON Schema `array` 타입을 처리하며 `group === 'terminal'`이면 `TerminalStrategy`, 아니면 `BranchStrategy`로 위임한다.
- `options.omitTrailing === true`(opt-in)이면 배열의 **후행(trailing) 연속 `undefined`**를 출력 경로에서만 제거한다 — ① 부모 전파(`onChange` 래퍼) ② 루트 validation 값 ③ form 외부 방출(getValue/submit/루트 onChange). 선행·중간 `undefined`는 보존한다(index가 밀리면 error dataPath·validation 매핑이 어긋난다).
- `options.omitEmpty !== false`(opt-out)이면 빈 배열을 `undefined`로 변환하되, 이 필터는 **부모 전파 경로에만** 적용한다. 필터 순서는 omitTrailing → omitEmpty.
- 자식 노드 구조와 `value` getter의 raw 배열은 출력 필터의 영향을 받지 않는다 — 빈 input UI가 유지되어야 한다.
- Reset 옵션이 켜진 `applyValue(undefined)`는 `minItems`만큼 빈 항목을 재충전한다(생성 시 채움과 동일 의미 — 분기 복원·폼 reset에서 빈 input 유지). 일반 `setValue(undefined)`는 전부 비운다.

- nullable 배열은 `ObjectNode`의 null 계약을 그대로 따른다(의미·전환 조건은 `ObjectNode/DETAIL.md`). 배열에서 달라지는 점:
  - null 배열에는 아이템이 없다 — `minItems` 채움이 없고, 어느 경로로 null이 되어도 같다.
  - 배열이 되는 쓰기는 `push`, 아이템에 도착한 값을 담은 쓰기, 자신에 대한 배열 대입(`[]` 포함)이다. 배열에는 병합이 없으므로 `Merge` 옵션의 `[]`도 대입이다. `pop()`·`remove()`·`update()`·`clear()`는 대상 아이템이 없는 값 없는 쓰기이므로 null을 유지한다.
  - 배열이 된 값은 빈 배열에 같은 조작을 한 값과 같다. 배열 자신의 스키마 `default`와 `minItems` 채움은 되살아나지 않는다.
- 부모 객체가 null이 되면 배열 자식은 `__resetToBlank__`로 생성자와 같은 상태가 된다: 받은 값이나 스키마 `default`가 있으면 그것, 없으면 비운 뒤 `minItems`까지 아이템 기본값으로 채운다. derived 값이 적용되는 배열은 채우지 않는다 — 생성자에서도 derived가 채움을 덮어쓰는 최종 값이다.
  - 이 채움은 `Replace`·`Propagate`를 뺀 `Reset` 프리셋으로 쓰인다. `Automatic`은 부모의 `null`을 풀지 않게 하고(branch 배열은 부모의 잠금이 풀린 뒤에 emit한다), `PreventInjection`은 채움이 배열 자신의 `injectTo`를 발동시켜 다른 노드에 쓰는 것을 막는다.
  - 비활성(`computed.active`가 false) 배열은 받은 값을 들 수 없으므로 그 값을 복원값으로 직접 기록하고, branch 전략의 재충전이 남긴 채움은 비운다 — 재활성화에서 남은 채움이 복원값을 이기지 않게 하기 위해서다.

## API Contracts

| 멤버                                         | 종류          | 계약                                                                   |
| -------------------------------------------- | ------------- | ---------------------------------------------------------------------- |
| `type`                                       | getter        | `'array'` 고정                                                         |
| `value`                                      | getter/setter | raw 배열 상태 (중첩 포함 미정제); setter는 `setValue` 위임             |
| `normalizedValue`                            | getter        | 자식들의 `normalizedValue` 합성에 `omitTrailing` 트림을 적용한 출력 값 |
| `length`·`minItems`·`maxItems`·`children`    | getter        | 전략 위임                                                              |
| `push(data?, unlimited?)`                    | method        | `Promise<length>`; `maxItems` 준수(`unlimited`로 우회)                 |
| `pop()`·`update(i, v)`·`remove(i)`·`clear()` | method        | 전략 위임; `clear`는 `minItems`와 무관하게 전부 제거                   |
| `options.omitTrailing`                       | schema        | opt-in 출력 트림                                                       |
| `options.omitEmpty`                          | schema        | opt-out 빈 배열 → `undefined` (부모 전파 전용)                         |

## Acceptance Criteria

### omit-trailing-output — 후행 undefined 출력 정제

- `[1,2,3,undefined,undefined]`는 부모 전파·루트 방출·getValue에서 `[1,2,3]`이 된다.
- `[undefined,1,2]`·`[1,undefined,2]`는 변형되지 않는다 (선행·중간 보존, 에러 index 정합).
- 전부 `undefined`인 배열은 trim→`[]`→omitEmpty 체인으로 부모에서 키가 생략되고, 루트 onChange는 `getSafeEmptyValue`로 `[]`를 방출한다.
- `omitTrailing` 미설정 배열의 동작은 변하지 않는다 (opt-in).

### omit-trailing-structure — 자식 구조 보존

- 트림된 위치의 자식 노드·빈 input은 유지된다 (`children.length`·`value` 원본 유지).
- oneOf/anyOf 분기 활성화·복원, setValue 하이드레이션, injectTo 주입에서도 빈 항목 노드가 소실되지 않는다.

### null-state — nullable 배열의 null 계약

- 두 전략 모두 `defaultValue: null`과 `setValue(null)` 뒤 값은 `null`, `length`는 0이며 부모 출력에 `null`이 남는다.
- null 배열은 의존값 변경과 `pop()`·`remove()`·`update()`·`clear()`를 거쳐도 `null`이다.
- null 배열에 `push()`하면 빈 배열에 같은 `push()`를 한 값이 되고, `setValue([])`는 옵션과 무관하게 `[]`를 만든다.
- null이 된 객체의 `minItems` 배열 자식은 `defaultValue: null`로 생성한 폼과 같은 아이템을 가지며, 그 채움은 부모의 `null`을 풀지 않는다.
- 그 채움은 배열 자신의 `injectTo`를 실행하지 않으며, 주입 대상에 사용자가 써 둔 값은 그대로다.
- derived 결과가 `minItems`보다 짧은 배열 자식은 부모가 null이 된 뒤에도 새로 만든 폼과 같이 derived 값만 가진다(두 전략).
- `computed.active`가 false인 동안 부모가 null이 된 배열 자식은 재활성화되면 늘 활성이던 새 폼과 같은 값을 가진다 — 스키마 `default`만, `minItems`만, 둘 다(두 전략).

### mutation-literal — 조작 메서드는 시킨 대로 한다

- `minItems`가 있어도 `clear()` 후 `length === 0`이고(두 전략), reset이 채움을 복원한다. `minItems`는 검증 제약이자 생성·reset 시의 채움이며, 조작에 대한 가드가 아니다.

### reset-refill — minItems 재충전

- Reset 플래그의 `applyValue(undefined)` 후 `children.length === minItems`.
- 일반 `setValue(undefined)` 후에는 두 전략 모두 `length === 0`이다 — Reset 여부는 프리셋 전체 비트의 일치로 판정한다.
- 분기 fresh 활성화와 폼 reset에서 minItems 빈 input 스켈레톤이 재구성된다.

## History

- 2026-09-21 — blank reset의 채움에 `PreventInjection`을 더하고, derived 배열은 채우지 않으며, 비활성 배열의 복원값을 직접 기록하게 함. 이유: 채움이 배열의 `injectTo`를 발동시켜 사용자가 쓴 값을 덮어썼고, derived 결과가 `minItems`보다 짧으면 `setValue(null)` 뒤에만 채움이 덧붙어 새 폼과 달라졌으며, 비활성 배열은 재활성화에서 스키마 `default` 대신 남은 채움을 되살렸다.
- 2026-09-20 — Reset 판정을 `(option & Reset) > 0`에서 프리셋 전체 일치로 변경. 이유: 공개 기본 옵션 `Overwrite`가 `Reset`과 비트를 공유해 일반 `setValue(undefined)`가 branch 배열의 `minItems`를 재충전했고, 이 문서의 요구사항과 terminal 전략에 어긋났다.
- 2026-09-20 — nullable 배열의 null 계약과 blank reset 추가. 이유: terminal 배열은 `defaultValue: null`을 `[]`로 시작해 키가 사라졌고, `clear()`가 null 배열을 `[]`로 만들었으며, 부모가 null이 될 때 `minItems` 배열 자식의 상태가 경로에 따라 달랐다.

## Last Updated

2026-09-21 — blank reset의 채움 옵션·derived 우선·비활성 복원값 요구사항과 수용 기준 추가.
