# stringBehavior 계약

## Requirements

- 의존 방향은 `blueprint·record·behaviors/utils < stringBehavior < behaviors 뿌리 < SchemaNode`입니다. 이 종류 fractal은 뿌리·정착·겉면을 타입으로도 가져오지 않습니다(NODE-009·016).
- 외부에서 직접 소비하는 organ은 없고 경계 예외도 없습니다.

## API Contracts

- 진입점은 `stringBehavior: Behavior`를 이름으로 내보냅니다. 행은 `interpret`, `assemble`, `project`, `finishInput`, `declareChildren`, `type: 'string'`, `strategy: 'terminal'` 순서이며 자식 선언은 공유 빈 결과입니다(NODE-002·006·047).
- `interpret`는 이미 문자열이면 참조를 유지하고, 유한수와 boolean만 공통 `interpret` 규칙으로 문자열로 바꿉니다. `null`, 객체, 배열, 비유한 수 및 모호한 값은 그대로 둡니다. `assemble`은 터미널 원본을 `local`로 돌려줍니다(WRITE-075·084·093).
- `project`는 공유 빈값 투영을 써서 `omitEmpty`가 켜진 빈 `local`의 방출을 생략하고 원본을 바꾸지 않습니다. `finishInput`은 메모된 `options.trim` 선택에 따라 문자열만 자른 결과를 반환하며 실제 쓰기는 바인딩 진입의 일입니다(NODE-006·007, VALUE-034).

## Acceptance Criteria

### string-row — 문자열 행

- 문자열·유한수·boolean·변환 불가 입력의 결과와 빈 문자열 생략, `trim`의 쓰기 분리가 행 계약을 따릅니다(WRITE-075·093, NODE-007).

## Last Updated

2026-09-29
