# AbstractNode contract

## Requirements

- `AbstractNode`는 모든 스키마 노드의 기반 계약이다. 서브클래스는 `type`, `value` getter/setter, `applyValue`를 구현해야 하며, 나머지 정체성·경로·computed·상태·검증·이벤트 표면은 이 클래스가 제공한다.
- **값은 두 채널로 노출된다.** `value`는 노드가 보유한 raw 값이고, `normalizedValue`는 스키마 출력 필터가 적용된 정제 뷰다. 기본 구현은 `this.value`를 그대로 돌려주므로, 정제가 필요 없는 노드는 아무것도 하지 않아도 계약을 만족한다.
- `normalizedValue` override는 **값 정제 목적으로만** 허용된다. 자식 트리를 바꾸거나, 부수효과를 일으키거나, `value`가 반환하지 않은 항목을 새로 만들어 내는 override는 이 계약 밖이다. 현재 유일한 override는 `ArrayNode`이며 `options.omitTrailing` 트림을 적용한다.
- 이 getter는 노드가 **밖으로 내보내는** 값의 단일 출처다. raw 상태를 봐야 하는 경로(예: `UpdateValue` 이벤트 payload)는 `value`를 계속 읽으며, 두 경로를 섞지 않는다.
- 값 변경 통보는 `onChange(value)`로 부모에게 전달하고, 전파는 `__computeManager__.active && __scoped__`일 때만 일어난다. 이벤트 발행은 `publish(EventType.X)`를 경유한다.
- `__initialize__`는 부모 노드가 actor로서 호출한다. 루트는 자기 자신이 호출한다.
- **쓰기는 출처를 지닌다.** `SetValueOption.Automatic`은 폼이 스스로 만든 값(reset 계열 프리셋 전부, derived 쓰기)을 표시하고, `onChange(value, batch, automatic)`이 부모에 전달한다. null인 부모는 automatic 쓰기를 기록만 한다. 공개 옵션(`Merge`·`Overwrite`)에는 이 비트가 없으므로 밖에서의 `setValue`는 항상 의도된 쓰기다.
- `__resetToBlank__(input?)`는 부모가 null이 될 때 자식을 "`defaultValue` 없는 폼이 만드는 상태"로 되돌린다: `input` 또는 스키마 기본값을 적용하고 derived 값을 반영한다. `ObjectNode`와 `ArrayNode`는 생성자를 따르도록 override한다.
- **주입은 원인이 된 쓰기의 출처를 물려받는다.** 노드는 마지막 주입 이후 밖에서의 쓰기가 도착했는지 기억한다(`Automatic` 없는 `setValue`, 또는 branch 전략의 `__markIntendedWrite__`). 자동 쓰기만으로 구동된 `injectTo`는 대상에 `Automatic`으로 쓰여 대상의 null 조상을 풀지 않는다. `UpdateValue` 이벤트 payload는 이 구분을 싣지 않는다 — 공개 이벤트 형태는 그대로다.
- `__hasNullAncestor__`는 조상 중 값이 `null`인 노드가 있는지 답한다. 밖에서의 쓰기를 "변화 없음"으로 흡수한 노드가 읽는다: 그 쓰기는 값을 바꾸지 않았어도 값을 담고 있으므로, null 조상이 있으면 `__forwardUnchangedWrite__`로 현재 값을 부모에 다시 전달한다. 조상에 null이 없으면 아무것도 알리지 않는다. 이 조회는 조상의 `value`를 읽지만 읽기는 아무것도 바꾸지 않는다(`ObjectNode` `BranchStrategy` DETAIL의 `pending-read`): 조상에 보류 중인 커밋이 있어도 그 커밋의 시점·출처·`UpdateValue`는 그대로이고, 조상의 `injectTo`는 그 커밋 자신의 출처를 따른다.

## API Contracts

### `normalizedValue`

```ts
public get normalizedValue(): Value | Nullish
```

- **기본값**: `this.value` (`AbstractNode.ts:378`).
- **override 허용 범위**: 값 정제만. 시그니처와 `Value | Nullish` 반환 타입을 유지해야 하며, `value`가 `null`/`undefined`일 때 그 nullish 상태를 다른 값으로 바꾸지 않는다.
- **검증 대상 값** — `__enhancedValue__`는 정제값 위에 검증 전용 항목(oneOf 분기 마커)을 얹는다. 항목은 값이 그 자리에 객체를 들고 있을 때만 얹히므로, 값에서 빠진 객체나 제거된 배열 아이템이 검증 값에만 다시 생기지 않는다 — 부모의 `required`와 배열의 `maxItems`는 실제 값을 본다.
- **소비 지점** — 이 네 곳이 정제값을 읽는다. 새 소비 지점을 추가할 때는 raw가 아니라 이 getter를 읽는지 확인한다.

| 소비 지점                        | 위치                                                                             | 읽는 이유                               |
| -------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------- |
| 루트 validation 값               | `AbstractNode.ts:710` (`__enhancedValue__`)                                      | 검증 대상은 실제로 제출될 값이어야 한다 |
| 루트 방출                        | `AbstractNode.ts:1148` (`__handleChange__` → `onChange(getSafeEmptyValue(...))`) | 폼 밖으로 나가는 값                     |
| `FormHandle.getValue` · `submit` | `components/Form/Form.tsx`                                                       | 명령형 API가 돌려주는 값                |
| 부모측 하이드레이션 스냅샷       | `ArrayNode/strategies/BranchStrategy` (`__sourceMap__`의 `output` 슬롯)          | 부모가 자식으로부터 받아 두는 기여값    |

### 서브클래스 의무

| 멤버                        | 필수   | 계약                                                           |
| --------------------------- | ------ | -------------------------------------------------------------- |
| `type`                      | 예     | 노드의 스키마 타입. `integer`는 `number`로 정규화되어 노출된다 |
| `value` getter/setter       | 예     | raw 값                                                         |
| `applyValue(input, option)` | 예     | 옵션 비트에 따른 값 적용과 이벤트 발행                         |
| `normalizedValue`           | 아니오 | 정제가 필요할 때만 override                                    |
| `__equals__(left, right)`   | 아니오 | 기본은 참조 동등(`===`). 깊은 비교가 필요할 때만 override      |

## Acceptance Criteria

### normalized-default — 정제하지 않는 노드는 value를 그대로 내보낸다

- `ArrayNode`가 아닌 노드에서 `node.normalizedValue`가 `node.value`와 동일한 값을 반환한다.
- `value`가 `undefined` 또는 `null`인 노드에서 `normalizedValue`도 같은 nullish 값을 반환한다.

### write-provenance — 자동 쓰기는 null 조상을 풀지 않는다

- string·number·boolean 자식의 derived 값, reset으로 복원된 default는 null 부모를 객체로 만들지 않는다.
- 공개 `setValue`(옵션 생략·`Merge`·`Overwrite`)로 쓴 값은 null 부모를 객체로 만든다.
- 그 값이 이미 보이는 값과 같아도, 어느 노드 종류(string·number·boolean·null·object·array, 두 전략)에 어느 옵션으로 쓰든 같다. 자동 쓰기와 키 없는 객체의 `Merge`는 만들지 않는다.
- source의 `default`·derived 값으로 구동된 `injectTo`는 null 객체 안의 대상을 채우되 객체를 만들지 않고, 사용자가 source를 바꾼 뒤의 `injectTo`는 만든다.

### normalized-consumers — 네 소비 지점이 정제값을 읽는다

- `options.omitTrailing`이 켜진 배열을 가진 폼에서 `FormHandle.getValue()`와 `onSubmit` 인자에 후행 빈 항목이 포함되지 않는다.
- 같은 폼에서 노드 트리의 자식 수는 줄지 않는다 — 정제는 방출 값에만 적용되고 상태를 지우지 않는다.
- 같은 폼에서 루트 검증이 정제된 값을 대상으로 수행된다.

### raw-channel — raw 경로는 정제되지 않는다

- 같은 상태에서 `UpdateValue` 이벤트 payload와 `node.value`에는 후행 빈 항목이 그대로 남아 있다.

## History

- 2026-09-20 — 쓰기 출처(`Automatic`)와 `__resetToBlank__`·`__hasNullAncestor__` 추가. 이유: nullable branch 노드의 null 계약(`ObjectNode/DETAIL.md`)이 자동 쓰기와 의도된 쓰기의 구분을 요구했다. `__reset__`의 값 우선순위는 바뀌지 않았다.

## Last Updated

2026-09-20 — 쓰기 출처·blank reset 요구사항과 `write-provenance` 추가, `__hasNullAncestor__`의 조상 읽기가 관찰 결과를 바꾸지 않는다는 절 추가.
