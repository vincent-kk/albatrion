# ArrayNode contract

## Requirements

- JSON Schema `array` 타입을 처리하며 `group === 'terminal'`이면 `TerminalStrategy`, 아니면 `BranchStrategy`로 위임한다.
- `options.omitTrailing === true`(opt-in)이면 배열의 **후행(trailing) 연속 `undefined`**를 출력 경로에서만 제거한다 — ① 부모 전파(`onChange` 래퍼) ② 루트 validation 값 ③ form 외부 방출(getValue/submit/루트 onChange). 선행·중간 `undefined`는 보존한다(index가 밀리면 error dataPath·validation 매핑이 어긋난다).
- `options.omitEmpty !== false`(opt-out)이면 빈 배열을 `undefined`로 변환하되, 이 필터는 **부모 전파 경로에만** 적용한다. 필터 순서는 omitTrailing → omitEmpty.
- 자식 노드 구조와 `value` getter의 raw 배열은 출력 필터의 영향을 받지 않는다 — 빈 input UI가 유지되어야 한다.
- Reset 옵션이 켜진 `applyValue(undefined)`는 `minItems`만큼 빈 항목을 재충전한다(생성 시 채움과 동일 의미 — 분기 복원·폼 reset에서 빈 input 유지). 일반 `setValue(undefined)`는 전부 비운다.

## API Contracts

| 멤버                                         | 종류          | 계약                                                                   |
| -------------------------------------------- | ------------- | ---------------------------------------------------------------------- |
| `type`                                       | getter        | `'array'` 고정                                                         |
| `value`                                      | getter/setter | raw 배열 상태 (중첩 포함 미정제); setter는 `setValue` 위임             |
| `normalizedValue`                            | getter        | 자식들의 `normalizedValue` 합성에 `omitTrailing` 트림을 적용한 출력 값 |
| `length`·`minItems`·`maxItems`·`children`    | getter        | 전략 위임                                                              |
| `push(data?, unlimited?)`                    | method        | `Promise<length>`; `maxItems` 준수(`unlimited`로 우회)                 |
| `pop()`·`update(i, v)`·`remove(i)`·`clear()` | method        | 전략 위임; `clear`는 `minItems` 존중                                   |
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

### reset-refill — minItems 재충전

- Reset 플래그의 `applyValue(undefined)` 후 `children.length === minItems`.
- 분기 fresh 활성화와 폼 reset에서 minItems 빈 input 스켈레톤이 재구성된다.

## Last Updated

2026-08-12 — `options.omitTrailing` 계약·`normalizedValue` 출력 채널·Reset minItems 재충전 명문화 (신규 문서).
