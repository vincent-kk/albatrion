# stringBehavior 계약

## Requirements

- 의존 방향은 `blueprint·record·behaviors/utils < stringBehavior < behaviors 뿌리 < FieldNode`이다. 이 종류 fractal은 뿌리, 정착, 겉면을 타입으로도 가져오지 않는다(NODE-009·016).
- 외부에서 직접 소비하는 organ은 없고 경계 예외도 없다.

## API Contracts

- 진입점은 `stringBehavior: Behavior`를 이름으로 내보낸다. 행은 공통 여덟 칸 순서(`arrange`는 공유 거부 칸, 36C-01)를 따르고, `type: 'string'`, `strategy: 'terminal'`로 정의된다. 자식 선언은 공유 빈 결과를 쓴다(NODE-002·006·047).
- `interpret`는 이미 문자열이면 참조를 유지하고, 유한수와 boolean만 공통 `interpret` 규칙에 따라 문자열로 바꾼다. `null`, 객체, 배열, 비유한 수, 모호한 값은 그대로 둔다. `assemble`은 터미널 원본을 `local`로 돌려준다(WRITE-075·084·093).
- `project`는 공유 빈값 투영을 사용해, `omitEmpty`가 켜져 있고 `local`이 비었을 때 방출을 생략하며 원본은 바꾸지 않는다. `finishInput`은 메모된 `options.trim` 선택에 따라 문자열만 잘라 그 결과를 반환한다. 실제로 쓰는 일은 바인딩 진입이 맡는다(NODE-006·007, VALUE-034).

## Acceptance Criteria

### string-row — 문자열 행

- 문자열, 유한수, boolean, 변환 불가 입력의 결과와 빈 문자열 생략, `trim`의 쓰기 분리가 행 계약을 따른다(WRITE-075·093, NODE-007).

## Last Updated

2026-09-29
