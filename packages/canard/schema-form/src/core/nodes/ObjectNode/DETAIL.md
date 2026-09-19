# ObjectNode

## Requirements

객체 노드는 선택한 전략에 값과 자식 관리를 위임합니다.

### nullable 객체의 null 계약

- `null`은 "객체가 없음", `{}`는 "빈 객체가 있음"입니다. 둘은 서로 변환되지 않으며 `omitEmpty`는 `{}`만 다룹니다.
- null 여부는 의도된 행위로만 바뀝니다.
  - null이 되는 경우: `defaultValue`·스키마 `default`가 `null`, 노드 자신이나 조상에 대한 `setValue(null)`, null 기본값으로의 reset.
  - 객체가 되는 경우: 노드 자신에 대한 객체 대입(`{}` 포함), 또는 자손에 도착한 **값을 담은 밖에서의 쓰기** — 사용자 입력, 자손 `setValue`, 배열 조작, `injectTo`. 이미 보이는 값과 같은 값을 쓰는 것도 쓰기입니다.
  - 객체가 되지 않는 경우: 폼이 스스로 만든 값(자식 `default`, `computed.derived`, oneOf/anyOf 분기 복원, reset, computed `active`/`visible` 재평가로 인한 복원)과 값 없는 쓰기(`undefined`). 값 없는 쓰기는 기억되어 이후 객체가 될 때 반영됩니다.
- null인 동안 출력은 스키마 형태와 진입 경로에 무관하게 `null`이고, 자식은 `defaultValue` 없이 생성한 폼과 같은 상태(각자의 스키마 `default`, derived 적용, 중첩 객체는 재귀, 배열은 생성자와 같은 채움)를 가집니다. `null`로 버린 데이터는 되살아나지 않습니다.
- 객체가 될 때의 값은 한 번도 null이 아니었던 같은 스키마 노드에 같은 쓰기를 한 값과 같습니다.
- `undefined` 대입은 null과 다른 동작입니다: 서브트리를 비우며 자식 `default`를 복원하지 않습니다.
- nullable이 아닌 객체에 `null`을 대입하면 `{}`가 됩니다.

## API Contracts

- terminal 여부로 전략을 생성 시 선택합니다. children은 활성 자식, subnodes는 비활성 분기를 포함한 전체 자식입니다.
- 빈 객체 생략은 omitEmpty 설정에 따라 onChange 경계에서 적용합니다. `null`은 생략 대상이 아닙니다.
- `__resetToBlank__(input?)`는 부모가 null이 될 때 호출되는 내부 진입점입니다. 자식을 가진 전략은 서브트리를 재구성하고, 없는 전략은 노드 수준 reset으로 처리합니다.

## Acceptance Criteria

### object-node-contract — 관찰 가능한 동작

- 비활성 조건 분기도 subnodes를 통한 전체 트리 처리에는 남아 있습니다.
- terminal 객체는 branch 방식의 자식 트리 관리에 섞이지 않습니다.

### null-state — nullable 객체의 null 계약

- `defaultValue: null`, 스키마 `default: null`, 노드 `setValue(null)`, 조상 경유 `setValue`, reset 중 어느 경로로 null이 되어도 출력은 `null`이고 자식 값은 서로 같습니다.
- 자식이 배열(`minItems` 포함)·`default`·`computed.derived`·oneOf/anyOf 분기·computed `active`·virtual이어도 `null`이 유지되며, 의존값이 바뀌어도 유지됩니다.
- `setValue(null)` 한 번에 루트 `onChange`는 한 번, payload는 `null`입니다.
- 자손에 값을 쓰면 객체가 되고, 그 값은 null이 아니었던 같은 스키마 폼에 같은 쓰기를 한 값과 같습니다 — 직계 자식, 중첩 객체의 유일한 필드, 배열 아이템, 이미 보이는 default와 같은 값 모두.
- 필드를 비우는 쓰기는 null을 풀지 않고, 이후 객체가 될 때 비워진 상태로 반영됩니다.
- `setValue({})`는 `{}`를 만들고, `setValue({}, Merge)`는 아무것도 바꾸지 않습니다.
- 이 문서의 null은 노드 **값**입니다. `strategies` 문서의 "`children`이 `null`"(자식 노드가 없는 전략)과 무관합니다.

## History

- 2026-09-20 — nullable 객체의 null 계약을 신설. 이유: null이 자식 `default`·derived·분기 재합성·computed 재평가로 객체가 되거나 `{}`로 바뀌어 키가 사라졌고, null이 된 경로에 따라 자식 상태와 풀린 값이 달랐다. `null`(매핑 안 함)과 `{}`(매핑함)의 의미가 다른 소비자 스키마에서 발견.

## Last Updated

2026-09-20 — nullable 객체의 null 계약과 `null-state` 수용 기준 추가.
