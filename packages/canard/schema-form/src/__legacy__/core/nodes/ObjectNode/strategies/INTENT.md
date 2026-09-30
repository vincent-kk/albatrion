# ObjectNode/strategies

## Purpose

`ObjectNode`의 동작을 두 전략으로 분리하는 모듈. `BranchStrategy`는 자식 노드 트리와 oneOf/anyOf 조건부 스키마를, `TerminalStrategy`는 자식 없이 객체 값을 직접 관리한다.

## Conventions

- `ObjectNodeStrategy` 인터페이스의 모든 필드(`value`, `children`, `subnodes`, `applyValue`)를 반드시 완전 구현
- 전략 선택(BranchStrategy vs TerminalStrategy)은 `ObjectNode` 생성자에서만 결정
- 두 전략 모두 `additionalProperties: false` 처리를 지원해야 함
- `initialize?()`: 선택적 메서드 — 자식 노드 pub-sub 링크 초기화 시에만 구현

## Boundaries

### Always do

- 새 전략 추가 시 `ObjectNodeStrategy` 인터페이스를 완전히 구현하고 `index.ts`에 export 추가
- `types/strategy.ts`의 `Nullish`는 `@aileron/declare`에서, `ObjectValue`·`ChildNode`·`UnionSetValueOption`은 내부 타입에서 임포트

### Ask first

- `ObjectNodeStrategy` 인터페이스에 새 메서드 추가 (두 구현체 모두 영향)
- 전략 선택 로직을 `ObjectNode` 생성자 외부로 이동

### Never do

- 전략 인스턴스를 `ObjectNode` 외부에서 직접 생성
- 두 전략 간 내부 상태 공유
- `types/`에 인터페이스 외 구현체 코드 추가
