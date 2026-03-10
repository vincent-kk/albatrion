# ArrayNode/strategies

## Purpose
`ArrayNode`의 동작을 두 가지 전략으로 분리하는 모듈. `BranchStrategy`는 중첩 자식 노드를, `TerminalStrategy`는 단순 원시값 배열을 관리한다.

## Structure
- `BranchStrategy/` — 자식 노드를 생성·관리하는 복잡한 전략
- `TerminalStrategy/` — 자식 노드 없이 배열 값을 직접 관리하는 단순 전략
- `index.ts` — `BranchStrategy`, `TerminalStrategy`, `ArrayNodeStrategy` 타입 export
- `type.ts` — `ArrayNodeStrategy` 인터페이스 정의

## Conventions
- `ArrayNodeStrategy` 인터페이스를 두 전략 모두 구현
- 인터페이스: `value`, `children`, `length`, `minItems`, `maxItems`, `applyValue`, `push`, `pop`, `update`, `remove`, `clear`, `initialize?`
- 전략 선택은 `ArrayNode` 생성자에서 결정 (외부 변경 불가)

## Boundaries

### Always do
- 새 전략 추가 시 `ArrayNodeStrategy` 인터페이스를 완전히 구현
- `index.ts`에 새 전략 export 추가
- 두 전략 모두 `minItems`/`maxItems` 제약 준수

### Ask first
- `ArrayNodeStrategy` 인터페이스에 새 메서드 시그니처 추가 (두 구현체 모두 영향)
- 전략 간 공유 로직을 별도 모듈로 추출하는 리팩터링

### Never do
- 전략 인스턴스를 `ArrayNode` 외부에서 직접 생성
- `BranchStrategy`와 `TerminalStrategy` 간 상태 공유

## Dependencies
- `ArrayNode` — 호스트 노드
- `resolveArrayLimits` — `minItems`/`maxItems` 계산
- `SchemaNodeFactory` — `BranchStrategy`에서 자식 노드 생성 시 사용
