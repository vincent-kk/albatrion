# ArrayNode/BranchStrategy contract

## Requirements

- 배열 요소마다 자식 `SchemaNode`를 생성·관리하고, 요소별로 **상태/출력 2채널**을 유지한다: `__sourceMap__`의 `data`는 자식의 raw 값(상태 — 후행 빈 항목 생존), `output`은 자식이 방출한 필터본(배열이 위로 기여하는 값).
- `value`는 `data` 합성(완전 raw), `normalizedValue`는 `output` 합성이며 후자는 `__normalizedExpired__` 플래그로 lazy 캐시된다 (dirty 지점: `__expire__()`, factory의 output 갱신).
- 상향 방출(`__handleChange__`)은 `normalizedValue`를 전달하고, `UpdateValue` 이벤트는 raw `value`를 전달한다.
- Reset 옵션의 `applyValue(undefined)`는 `minItems`만큼 `push(void 0)`로 재충전한다; `null` 적용은 nullable 규약을 따르고 재충전하지 않는다.
- 하이드레이션(push 시점)은 `data: childNode.value`, `output: childNode.normalizedValue`로 스냅샷해 이후 상호작용 방출과 채널 정합을 유지한다.

## API Contracts

`ArrayNodeStrategy` 인터페이스 구현: `value`, `normalizedValue`, `children`, `length`, `minItems`, `maxItems`, `applyValue`, `push`, `pop`, `update`, `remove`, `clear`, `initialize`. 조작 메서드는 microtask 후 resolve되는 Promise를 반환한다.

## Acceptance Criteria

### two-channel — 상태/출력 분리

- 중첩 배열 하이드레이션(`defaultValue`/`setValue`)에서 inner의 후행 `undefined` 항목 노드가 유지되고, 밖으로는 정제된 값만 나간다.
- 자식의 필터된 방출이 `data`(raw)를 오염시키지 않고, raw가 `output`으로 새지 않는다.

### reset-refill — minItems 재충전

- Reset 플래그 + `undefined` 적용 + `minItems > 0`이면 `children.length === minItems`로 재충전된다.
- 일반 `setValue(undefined)`는 전부 비운다.

## Last Updated

2026-08-12 — 2채널(`data`/`output`) 슬롯·`normalizedValue` lazy 캐시·Reset 재충전 명문화 (신규 문서).
