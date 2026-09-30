# nullBehavior 계약

## Requirements

- 의존 방향은 `blueprint·record·behaviors/utils < nullBehavior < behaviors 뿌리 < SchemaNode`입니다. 이 종류 fractal은 정착·겉면·레거시를 가져오지 않으며 경계 예외가 없습니다(NODE-009·016, LANDING-159).

## API Contracts

- 진입점은 `nullBehavior: Behavior`를 이름으로 내보냅니다. 공통 일곱 칸 순서, `type: 'null'`, `strategy: 'terminal'`, 빈 자식 선언을 지킵니다(NODE-002·006·047).
- `interpret`는 모든 값을 항등으로 돌려줍니다. `null`만 이 종류의 멤버이고 `undefined`는 없음으로 남으며, 다른 값은 경고등을 켤 수 있어도 행이 바꾸지 않습니다. `assemble`과 `project`는 방출 정책 외에는 원본 참조를 보존합니다(WRITE-075·084·093, VALUE-030·037).

## Acceptance Criteria

### null-row — 항등 해석

- null·없음·잘못된 종류의 입력은 모두 같은 값과 참조로 돌아오고, 멤버십만 구별합니다(WRITE-084·093).

## Last Updated

2026-09-29
