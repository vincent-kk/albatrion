# ObjectNode/strategies

## Purpose
`ObjectNode`의 동작을 두 전략으로 분리하는 모듈. `BranchStrategy`는 자식 노드 트리와 조건부 스키마를, `TerminalStrategy`는 단순 객체 값을 관리한다.

## Structure
- `BranchStrategy/` — 자식 노드 생성·oneOf/anyOf 조건 처리 전략
- `TerminalStrategy/` — 자식 노드 없이 객체 값을 직접 처리하는 전략
- `index.ts` — `BranchStrategy`, `TerminalStrategy`, `ObjectNodeStrategy` export
- `type.ts` — `ObjectNodeStrategy` 인터페이스 정의

## Conventions
- `ObjectNodeStrategy` 인터페이스: `value`, `children`, `subnodes`, `applyValue`, `initialize?`
- 전략 선택은 `ObjectNode` 생성자에서만 결정

## Boundaries

### Always do
- 새 전략 추가 시 `ObjectNodeStrategy` 인터페이스를 완전히 구현
- `index.ts`에 export 추가
- 두 전략 모두 `additionalProperties: false` 처리 지원

### Ask first
- `ObjectNodeStrategy` 인터페이스에 새 메서드 추가 (두 구현체 모두 영향)

### Never do
- 전략 인스턴스를 `ObjectNode` 외부에서 직접 생성
- 두 전략 간 내부 상태 공유

## Dependencies
- `ObjectNode` — 호스트 노드
- `SchemaNodeFactory` — BranchStrategy에서 자식 노드 생성 시 사용
