# ObjectNode

## Purpose

JSON Schema `object` 타입을 처리하는 브랜치 노드. 객체 프로퍼티를 자식 노드로 관리하며, `oneOf`/`anyOf`/`if-then-else` 등 복합 스키마를 처리한다.

## Conventions

- `group === 'terminal'`이면 `TerminalStrategy`, 아니면 `BranchStrategy`
- 빈 객체는 기본적으로 `undefined`로 변환 (`omitEmpty !== false`인 경우). `null`은 변환하지 않는다
- nullable 객체의 `null`은 "객체 없음": 의도된 대입이나 값을 담은 자손 쓰기로만 바뀌고, 폼이 스스로 만든 값으로는 바뀌지 않는다 (계약은 DETAIL)
- `subnodes`는 모든 자식(비활성 조건부 포함), `children`은 현재 활성 자식만
- 클래스 멤버 Domain-First 순서 준수

## Boundaries

### Always do

- 전략 선택은 생성자 내 `group === 'terminal'` 조건으로만 분기
- 값 읽기/쓰기는 전략 객체에 위임
- `omitEmptyObject`는 `onChange` 핸들러에서만 적용

### Ask first

- `children`과 `subnodes`의 정의/구분 방식 변경
- 새 스키마 합성 키워드(`allOf` 직접 처리 등) 추가
- null이 객체가 되는 조건, null 동안의 자식 상태 변경

### Never do

- `__strategy__` 내부 필드에 외부에서 직접 접근
- `children`과 `subnodes`를 혼용
- `null`과 `{}`를 서로 변환
