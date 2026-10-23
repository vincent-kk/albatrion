# unionBehavior 계약

## Requirements

- 의존 방향은 `blueprint·record·behaviors/utils < unionBehavior < behaviors 뿌리 < FieldNode`이다. 정착, 겉면, 레거시를 값이나 타입으로 가져오지 않으며 경계 예외가 없다(NODE-009·016, LANDING-159).

## API Contracts

- 진입점은 `unionBehavior: Behavior`를 이름으로 내보낸다. 공통 여덟 칸 순서(`arrange`는 공유 거부 칸, 36C-01), `type: 'union'`, `strategy: 'terminal'`, 빈 자식 선언을 지킨다(NODE-002·006, BLUEPRINT-043).
- `interpret(input, spec)`는 공유 parse의 규칙 A를 그대로 호출한다. `spec.kinds`는 청사진 `schemaType`과 공유하는 동결된 기본 목록이거나, 유효 스키마 메모와 함께 만든 좁은 목록이다. `undefined`, `null`, 이미 멤버인 값은 그대로 두고, 각 종류의 변환 결과가 `===` 기준으로 정확히 하나일 때만 그 값을 돌려준다. 선언 순서와 이전 게이트 상태는 결과에 영향을 주지 않는다(WRITE-093·098).
- 같은 원본에서 후보가 여러 개 나오는 경우는 12건이다. 문자열과 불리언은 허용하고 수와 정수는 허용하지 않는 목록에 0, -0, 1이 들어오는 경우다. 후보를 배열로 만들지 않으며, 모호하면 원본 참조를 보존한다. `Merge`도 union 노드에서는 값 전체를 쓴다(WRITE-093).
- `assemble`은 터미널 원본을 `local`로 돌려주고, `project`는 공유 빈값 투영을 쓴다. 빈값이 아니면 받은 객체·배열 참조를 그대로 방출한다. `omitEmpty`가 방출을 생략하면 원본은 유지하며, 배열 아이템의 빈자리는 값 종류와 관계없이 `null`이다. 문자열 값의 `trim`만 `finishInput`에서 처리하고, 쓰기는 바인딩 진입이 한다(VALUE-034·037, WRITE-093).
- 경고등은 이 행의 상태가 아니다. 정착이 원본과 현재 유효 목록, nullable로 `misfit`을 계산하며, 게이트만 바뀌어도 값은 그대로 두고 경고등을 바꿀 수 있다. 통째 객체·배열의 내부는 정규화하지 않으며, 개발 모드의 JSON 부정합 경고는 정착이 맡는다(VALUE-030·037, SURFACE-061).

## Acceptance Criteria

### union-rule-a — 순서 없는 해석

- 모든 목록 순열과 동점 12건에서 결과가 같고, 멱등, 무할당, 변환 불가 시 항등이 유지된다(WRITE-084·093, TEST-077).

### union-raw — 경고등과 방출의 분리

- 게이트가 유효 목록만 좁히면 원본 참조와 방출은 그대로이고 `misfit`만 달라질 수 있다(VALUE-037, WRITE-098).

## Last Updated

2026-09-29
