# numberBehavior 계약

## Requirements

- 의존 방향은 `blueprint·record·behaviors/utils < numberBehavior < behaviors 뿌리 < SchemaNode`입니다. 이 종류 fractal은 정착·겉면·레거시를 가져오지 않으며 경계 예외가 없습니다(NODE-009·016, LANDING-159).

## API Contracts

- 진입점은 `numberBehavior: Behavior`를 이름으로 내보냅니다. 행의 일곱 칸은 공통 순서이고 `type: 'number'`, `strategy: 'terminal'`이며 자식 선언은 비어 있습니다(NODE-002·006·047).
- `schemaType: 'number'`의 멤버십은 유한수, `'integer'`의 멤버십은 `Number.isInteger`입니다. 문자열 변환은 공백을 뺀 전체가 JSON 수 표기이고 결과가 유한할 때만 하며, 정수 문자열은 안전 정수 범위를, integer 대상은 최종 결과의 안전 정수 여부를 확인합니다. 이미 수인 값은 자르지 않습니다(WRITE-075·093, NODE-057).
- `interpret`는 공통 parse의 결과를 돌려주고 변환 불가·모호한 값은 원본 그대로 둡니다. `assemble`은 원본을 `local`로, `project`는 메모된 `omitEmpty` 정책의 결과를 방출로 내며 입력·방출 사이에 원본을 고치지 않습니다(NODE-006, WRITE-084, VALUE-034).

## Acceptance Criteria

### number-row — 수와 정수

- 안전한 수 문자열만 변환하고 `NaN`·무한대·잘못된 정수는 경고등 판정용 원본으로 보존합니다(WRITE-075·093, VALUE-030).

## Last Updated

2026-09-29
