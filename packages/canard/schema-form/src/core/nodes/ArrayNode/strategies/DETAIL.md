# ArrayNode/strategies contract

## Requirements

- `ArrayNodeStrategy`는 `ArrayNode`가 배열 동작을 위임하는 단일 인터페이스다. `BranchStrategy`(자식 노드 생성)와 `TerminalStrategy`(자식 없음) 두 구현체가 이 인터페이스를 완전히 구현하며, 전략 선택은 `ArrayNode` 생성자에서만 이루어진다.
- 인터페이스는 **상태 채널과 출력 채널을 분리해 노출한다**: `value`는 raw 상태, `normalizedValue`는 배열이 위로 기여하는 값이다. 두 구현체의 의무가 다르다 —
  - `BranchStrategy`는 자식별 `output` 슬롯을 합성하고 `__normalizedExpired__`로 lazy 캐시한다.
  - `TerminalStrategy`는 자식이 없으므로 `value`를 그대로 위임한다.
- `options.omitTrailing` 트림은 이 인터페이스가 아니라 그 소비자인 `ArrayNode.normalizedValue`에서 적용된다. 전략이 반환하는 값은 트림 이전 상태다.
- `children`은 자식을 가진 전략에서만 `ChildNode[]`이고, 그렇지 않으면 `null`이다. 호출자는 `null`을 "자식 없음"으로 읽어야 하며 빈 배열과 구분한다.
- `minItems`/`maxItems`는 두 구현체 모두 `resolveArrayLimits(jsonSchema)`에서 얻은 동일한 값을 노출한다.
- 조작 메서드(`push`·`update`·`remove`·`pop`·`clear`)는 Promise를 반환한다. 반환 시점 규약은 구현체마다 다르다 — `BranchStrategy`는 microtask 이후, `TerminalStrategy`는 즉시 resolve.
- `initialize?()`는 선택적이다. 자식 pub-sub 연결이 필요한 구현체만 정의하며, `ArrayNode.__initialize__` 외부에서 호출하지 않는다.

## API Contracts

`type.ts`가 정의하는 `ArrayNodeStrategy` 멤버:

| 멤버 | 시그니처 | 계약 |
| ---- | -------- | ---- |
| `value` | `get value(): ArrayValue \| Nullish` | raw 상태. 후행 빈 항목이 살아 있다 |
| `normalizedValue` | `get normalizedValue(): ArrayValue \| Nullish` | 자식의 `normalizedValue` 합성. 자식이 없는 전략은 `value` 자신 |
| `length` | `get length(): number` | 현재 항목 수 |
| `minItems` · `maxItems` | `get (): number` | JSON Schema 제약 |
| `children` | `get children(): ChildNode[] \| null` | 자식 없는 전략은 `null` |
| `applyValue` | `(value, option: UnionSetValueOption) => void` | 옵션 비트로 방출 이벤트를 결정 |
| `push` | `(data?, unlimited?) => Promise<number>` | `unlimited !== true`면 `maxItems` 가드 |
| `update` · `remove` | `(index, ...) => Promise<ArrayValue[number] \| undefined>` | 범위 밖이면 `undefined` |
| `pop` | `() => Promise<ArrayValue[number] \| undefined>` | 비어 있으면 `undefined` |
| `clear` | `() => Promise<void>` | 전부 제거 |
| `initialize?` | `() => void` | 선택적. 자식 pub-sub 연결 |

`index.ts`가 노출하는 공개 표면은 `BranchStrategy`, `TerminalStrategy`, 그리고 타입 `ArrayNodeStrategy` 셋뿐이다.

## Acceptance Criteria

### strategy-parity — 두 구현체가 같은 인터페이스를 만족한다

- `BranchStrategy`와 `TerminalStrategy` 인스턴스 모두에서 `value`·`normalizedValue`·`length`·`minItems`·`maxItems`·`children`이 정의되어 있고, 조작 메서드 6종이 Promise를 반환한다.
- `children`은 `BranchStrategy`에서 배열, `TerminalStrategy`에서 `null`이다.

### normalized-source — normalizedValue는 트림 이전 값이다

- 후행 `undefined`가 있는 배열에서 전략의 `normalizedValue`에는 트림이 적용되어 있지 않다.
- 같은 상태에서 `ArrayNode.normalizedValue`는 `options.omitTrailing`에 따라 트림된 값을 반환한다 — 트림 지점이 전략이 아니라 호스트임이 두 값의 차이로 관찰된다.

### bounded-push — maxItems 가드는 두 구현체에서 동일하다

- `maxItems`에 도달한 상태에서 `push()`는 길이를 늘리지 않고, `push(value, true)`는 늘린다.

## Boundary Exemptions

### `packages/canard/schema-form/src/core/nodes/ArrayNode/strategies/type.ts` — 구현체의 인터페이스 직접 참조

- **Consumers**: `packages/canard/schema-form/src/core/nodes/ArrayNode/strategies/BranchStrategy/BranchStrategy.ts`, `packages/canard/schema-form/src/core/nodes/ArrayNode/strategies/TerminalStrategy/TerminalStrategy.ts`
- **Direct import**: `allowed`
- **Reason**: 두 소비자는 이 fractal의 자식 fractal이자 `ArrayNodeStrategy`의 구현체다. 진입점 `strategies/index.ts`는 바로 그 두 구현체를 re-export하므로, 구현체가 진입점을 경유하면 `BranchStrategy → strategies → BranchStrategy` 형태의 순환이 생기고 런타임 circular import 위험이 따른다. 인터페이스를 소비자들의 lowest common fractal로 옮기는 선택지도 성립하지 않는다 — 그 조상은 이 fractal 자신이며, 인터페이스는 `ArrayNode`가 전략을 선택하는 계약이라 `strategies` 밖으로 나가면 소유자가 사라진다. 따라서 `'../type'` 직접 참조를 허용한다.

## Last Updated

2026-08-12 — `ArrayNodeStrategy`에 `normalizedValue`가 추가되면서 두 구현체의 서로 다른 계약 의무와 트림 적용 지점을 명문화하고, 구현체의 `type.ts` 직접 참조에 경계 예외를 선언 (신규 문서).
