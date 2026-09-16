# SchemaNodeProxyProps

## Requirements

프록시, 입력 팩토리, 지연 렌더링 게이트는 다른 렌더링 계층의 구현을 import하지 않고 하나의 props 계약을 공유합니다.

## API Contracts

- 노드 조회, 이벤트 ref, 재정의, 입력, 렌더러, 래퍼 props는 기존 이름과 선택 여부를 유지합니다.
- 기존 SchemaNodeProxy 모듈은 동일한 이름의 타입을 계속 제공합니다.

## Acceptance Criteria

### render-props-compatibility — 공유 렌더링 props

- 기존 재귀·지연 렌더링 소비자는 타입 단언이나 런타임 props 변경 없이 타입 검사를 통과합니다.
- SchemaNodeInput, SchemaNodeProxy, DeferrableNodeProxy 구현에 대한 의존을 추가하지 않습니다.

## Last Updated

2026-09-16
