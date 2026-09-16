# ObjectNode

## Purpose

JSON Schema `object` 타입을 처리하는 브랜치 노드. 객체 프로퍼티를 자식 노드로 관리하며, `oneOf`/`anyOf`/`if-then-else` 등 복합 스키마를 처리한다.

## Conventions

- `group === 'terminal'`이면 `TerminalStrategy`, 아니면 `BranchStrategy`
- 빈 객체는 기본적으로 `undefined`로 변환 (`omitEmpty !== false`인 경우)
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

### Never do

- `__strategy__` 내부 필드에 외부에서 직접 접근
- `children`과 `subnodes`를 혼용
