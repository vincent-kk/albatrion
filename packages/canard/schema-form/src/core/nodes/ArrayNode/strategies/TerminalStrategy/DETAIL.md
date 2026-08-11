# ArrayNode/TerminalStrategy contract

## Requirements

- 자식 `SchemaNode`를 만들지 않고 배열 값을 `__value__` 한 채널로만 관리한다. `children`은 항상 `null`이고, `length`는 `__value__?.length ?? 0`이다.
- `normalizedValue`는 `value`를 **그대로 위임**한다. 정규화할 자식이 없으므로 전략 단계에서 필터를 적용하지 않으며, `options.omitTrailing` 트림은 이 값을 읽는 `ArrayNode` 쪽에서 수행된다. 즉 이 전략이 내보내는 값은 트림 이전 상태다.
- 모든 변경은 새 배열을 만들어 교체한다. `push`·`update`·`remove`는 스프레드 또는 `filter`로 복사본을 만들고, `__value__`를 in-place로 변경하지 않는다.
- `__emitChange__`는 `Replace` 비트가 없을 때 `host.__equals__(previous, current)`로 동등하면 조기 반환한다. `__locked__`인 동안에는 값만 갱신하고 어떤 이벤트도 발행하지 않는다.
- 입력 파싱은 `undefined` → `undefined`, `null` → `nullable`일 때만 `null`, 그 외에는 `parseArray(input)`이다.
- 생성자는 `resolveArrayLimits(jsonSchema)`로 `minItems`/`maxItems`를 확정한 뒤, `hasDefault`이면 `host.defaultValue`의 각 항목을 `push(value, true)`로 채우고, 아니면 `minItems`에 도달할 때까지 `push(void 0, true)`로 채운다. 두 경로 모두 `unlimited: true`이므로 `maxItems` 가드를 우회한다.

## API Contracts

`ArrayNodeStrategy` 구현: `value`, `normalizedValue`, `children`, `length`, `minItems`, `maxItems`, `applyValue`, `push`, `pop`, `update`, `remove`, `clear`.

- `normalizedValue: ArrayValue | Nullish` — `__value__` 그대로.
- `children: null` — 고정.
- `push(input?, unlimited?): Promise<number>` — `unlimited !== true`이고 `maxItems <= length`면 값 변경 없이 현재 `length`를 반환한다. 생략된 `input`은 위치 기반 기본값(`prefixItems[index]`가 있으면 그것, 없으면 `items` 기본값)으로 채운다.
- `update(index, data): Promise<item | undefined>` · `remove(index): Promise<item | undefined>` — `__value__`가 `null`/`undefined`이거나 인덱스가 범위 밖이면 `undefined`를 반환하고 아무 이벤트도 내지 않는다.
- `pop(): Promise<item | undefined>` — 비어 있으면 `undefined`, 아니면 `remove(length - 1)`.
- `clear(): Promise<void>` — 빈 배열로 교체.
- 반환 Promise는 `Promise.resolve`로 즉시 resolve된다. `BranchStrategy`와 달리 microtask 지연이 없다.

`applyValue(input, option)`이 발행하는 이벤트는 `option` 비트로 결정된다 — `EmitChange` → `handleChange(current, Batch 여부)`, `Refresh` → `RequestRefresh`, `PublishUpdateEvent` → `UpdateValue`(payload `{previous, current, inject}`, `inject`는 `PreventInjection` 비트의 역). 생성자의 최초 방출은 `Replace | Default`로 고정된다.

## Acceptance Criteria

### terminal-normalized — normalizedValue는 value의 위임이다

- 자식이 없는 배열에서 `strategy.normalizedValue`가 `strategy.value`와 동일한 참조를 반환한다.
- 후행 `undefined` 항목이 있는 상태에서도 전략이 반환하는 값에는 트림이 적용되지 않는다 — 트림 여부는 `ArrayNode.normalizedValue` 수준에서만 관찰된다.

### immutable-write — 쓰기 연산은 원본을 보존한다

- `push`·`update`·`remove` 호출 전에 잡아 둔 배열 참조의 내용이 호출 후에도 변하지 않는다.
- 범위 밖 인덱스로 `update`/`remove`를 호출하면 값도 이벤트도 바뀌지 않는다.

### bounded-push — maxItems 가드

- `maxItems`에 도달한 배열에 `push()`를 호출하면 길이가 늘지 않는다.
- `push(value, true)`는 같은 상태에서 길이를 늘린다 — 생성자의 초기 충전이 이 경로를 쓴다.

### constructor-fill — 초기 충전

- `hasDefault`가 거짓이고 `minItems > 0`이면 생성 직후 `length === minItems`다.
- `hasDefault`가 참이면 `host.defaultValue`의 항목 수만큼 채워지고 `minItems` 충전은 수행되지 않는다.

## Last Updated

2026-08-12 — `normalizedValue` 위임 계약, 쓰기 불변성, `maxItems` 가드 우회 경로, 생성자 충전 규칙 명문화 (신규 문서).
